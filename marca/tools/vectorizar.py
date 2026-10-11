#!/usr/bin/env python
"""
JJVV SAN LUIS III · Vectorizador del logotipo
==============================================
Convierte el logotipo raster original (PNG) en un SVG fiel, trazando
la imagen REAL en vez de redibujarla a ojo.

Por qué existe: la primera versión del logo vector se dibujó a mano
"mirando" el PNG y quedó fiel solo en la idea. La figura izquierda,
las pelotas y el medallón no coincidían con el original. Un trazador
automático no se inventa nada: sigue el contorno real píxel a píxel.

Cómo funciona:
  1. Separa la imagen en capas por color (salmón / tinta / blanco).
  2. Con OpenCV extrae el contorno exacto de cada capa.
  3. Simplifica con Douglas-Peucker y suaviza las curvas.
  4. Emite un SVG con relleno "evenodd" para que los agujeros
     (por ejemplo el centro del anillo) salgan bien.

Uso:
  python marca/tools/vectorizar.py
"""

import sys
import xml.etree.ElementTree as ET
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

# Colores del logotipo, muestreados del PNG original
SALMON = (0xFC, 0x6C, 0x5A)
TINTA = (0x1E, 0x30, 0x36)
BLANCO = (255, 255, 255)

RAIZ = Path(__file__).resolve().parents[2]
ORIGEN = RAIZ / "logo-san-luis-iii.png"
DESTINO = RAIZ / "marca" / "logo" / "sanluis3-logo-completo.svg"

# Orden de pintado: de atrás hacia adelante.
# La tinta (figura izquierda + balón de fútbol) va primero porque
# queda tapada por el resto.
CAPAS = [
    ("tinta", TINTA, 62),
    ("salmon", SALMON, 62),
    ("blanco", BLANCO, 70),
]

# Suavizado Douglas-Peucker. 1.2 px sobre una imagen de 1254 px conserva
# el detalle sin generar miles de vértices.
EPSILON = 1.2
# Chaikin: 1 ronda basta. Con 2, las esquinas agudas de las letras
# (la V de JJVV, el gancho de la J) se redondeaban y el texto se veía
# tembloroso al compararlo con el original.
RONDAS_SUAVIZADO = 1


def suavizar(puntos, rondas):
    """Chaikin: corta cada esquina para que el trazo se vea dibujado
    a mano y no como un serrucho de triángulos."""
    for _ in range(rondas):
        nuevos = []
        for i in range(len(puntos)):
            a = puntos[i]
            b = puntos[(i + 1) % len(puntos)]
            nuevos.append((0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]))
            nuevos.append((0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]))
        puntos = nuevos
    return puntos


def trazar_capa(mascara):
    """Devuelve la lista de contornos (cada uno, una lista de puntos)."""
    # RETR_TREE trae la jerarquía completa: así también se capturan los
    # agujeros, que son los que hacen el aro del medallón.
    contornos, _ = cv2.findContours(mascara, cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)
    salida = []
    for c in contornos:
        area = cv2.contourArea(c)
        if area < 12:  # ruido del antialiasing
            continue
        aprox = cv2.approxPolyDP(c, EPSILON, True)
        puntos = [(float(p[0][0]), float(p[0][1])) for p in aprox]
        if len(puntos) < 3:
            continue
        salida.append((area, puntos))
    salida.sort(key=lambda x: -x[0])
    return salida


def puntos_a_d(puntos):
    d = f"M{puntos[0][0]:.1f} {puntos[0][1]:.1f}"
    for x, y in puntos[1:]:
        d += f"L{x:.1f} {y:.1f}"
    return d + "Z"


def main():
    if not ORIGEN.exists():
        sys.exit(f"No se encontró el original: {ORIGEN}")

    img = Image.open(ORIGEN).convert("RGBA")
    ancho, alto = img.size
    rgba = np.array(img)

    rgb = rgba[:, :, :3].astype(np.int16)
    alfa = rgba[:, :, 3]

    # Los bordes suavizados del PNG mezclan los colores con el fondo
    # transparente. Se ignoran los píxeles con menos de medio de opacidad
    # para que no aparezca un halo gris alrededor de cada figura.
    opaco = alfa > 160

    # Caja que ocupa realmente el dibujo. Se mide sobre los píxeles opacos,
    # para que el símbolo no arrastre el margen vacío que dejan los bordes
    # del lienzo: sin esto, el avatar salía con el logo achaparrado.
    ys, xs = np.where(alfa > 24)
    if len(xs):
        # Se ignoran los píxeles sueltos del borde (restos del antialiasing)
        keep = (xs > 6) & (xs < ancho - 6) & (ys > 6) & (ys < alto - 6)
        xs, ys = xs[keep], ys[keep]
    x0, x1, y0, y1 = int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max())
    margen = 8
    bx, by = max(0, x0 - margen), max(0, y0 - margen)
    bw = min(ancho, x1 + margen) - bx
    bh = min(alto, y1 + margen) - by

    # Borde inferior del emblema (hasta antes de la fila de texto "JJVV").
    # Se mide buscando la primera franja horizontal vacía. Hardcodear un
    # porcentaje del lienzo cortaba 31 px de la parte de abajo del medallón.
    filas = (alfa > 128).sum(axis=1) > 0
    banda_ini = int(np.argmax(filas))
    borde = banda_ini
    hueco = 0
    for y in range(banda_ini, alto):
        if filas[y]:
            borde = y
            hueco = 0
        else:
            hueco += 1
            if hueco >= 15:  # 15 px de aire = termina el emblema
                break

    partes = [
        '<svg xmlns="http://www.w3.org/2000/svg"',
        f'     viewBox="0 0 {ancho} {alto}" width="{ancho}" height="{alto}"',
        f'     data-bbox="{bx} {by} {bw} {bh}"',
        f'     data-emblem-bottom="{borde}"',
        '     role="img" aria-label="Junta de Vecinos San Luis III, Maipú">',
        "  <title>JJVV San Luis III, logotipo</title>",
    ]

    total = 0
    resumen = []
    for nombre, color, umbral in CAPAS:
        distancia = np.abs(rgb - np.array(color, dtype=np.int16)).sum(axis=2)
        mascara = ((distancia < umbral) & opaco).astype(np.uint8)

        # Cerrar huecos de 1 px que deja el antialiasing
        mascara = cv2.morphologyEx(mascara, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))

        contornos = trazar_capa(mascara)
        if not contornos:
            resumen.append(f"  {nombre}: sin formas")
            continue

        # Todos los contornos de la capa van en un solo path con
        # evenodd: así los agujeros se representan correctamente.
        d = "".join(
            puntos_a_d(suavizar(puntos, RONDAS_SUAVIZADO)) for _, puntos in contornos
        )
        partes.append(
            f'  <path fill="#%02x%02x%02x" fill-rule="evenodd" d="{d}"/>'
            % color
        )
        puntos = sum(len(p) for _, p in contornos)
        total += puntos
        resumen.append(f"  {nombre}: {len(contornos)} formas, {puntos} puntos")

    partes.append("</svg>")

    cabecera = (
        "<!--\n"
        "  JJVV SAN LUIS III · LOGOTIPO PRINCIPAL (trazado automático)\n"
        "  ---------------------------------------------------------------\n"
        f"  Trazado del archivo original por marca/tools/vectorizar.py.\n"
        f"  NO editar a mano: los puntos se regeneran desde el PNG.\n"
        f"\n"
        f"  Para rehacerlo:  python marca/tools/vectorizar.py\n"
        f"  Después:         node marca/tools/variantes.mjs\n"
        f"\n"
        f"  Esta versión reemplazó a un redibujado a mano que no era fiel:\n"
        f"  la figura izquierda, el tamaño de las pelotas y el relleno del\n"
        f"  medallón no coincidían con el original.\n"
        f"\n"
        f"  COLORES (muestreados del PNG, no estimados)\n"
        f"    Salmón  #FC6C5A      Tinta  #1E3036      Blanco  #FFFFFF\n"
        f"\n"
        f"  ÁREA DE RESPETO: un ancho de cabeza de figura por cada lado.\n"
        f"  TAMAÑO MÍNIMO: 120 px de ancho en digital / 25 mm impreso.\n"
        f"-->"
    )

    DESTINO.write_text(cabecera + "\n" + "\n".join(partes) + "\n", encoding="utf-8")

    print(f"Origen   {ORIGEN.name}  ({ancho}x{alto})")
    for linea in resumen:
        print(linea)
    print(f"Total    {total} vertices")
    print(f"Escrito  {DESTINO.relative_to(RAIZ)}  ({DESTINO.stat().st_size/1024:.1f} KB)")
    print("\nAhora corre:  node marca/tools/variantes.mjs")


if __name__ == "__main__":
    main()