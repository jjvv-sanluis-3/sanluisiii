#!/usr/bin/env python3
"""Revisa el PDF del manual buscando partes que se rompieron al imprimir.

El PDF sale de imprimir el HTML con el navegador, y el navegador parte
el contenido donde le parece. Esto mide si quedó parejo:

  hueco INTERIOR  contenido arriba y abajo, y en el medio una franja
                   vacía grande. Pasa cuando un bloque no cabía y fue
                   empujado a la página siguiente.
  cola huérfana   una página casi vacía, con una o dos líneas sueltas.
                   Pasa cuando una sección se pasa de alto por nada.

Una página corta cuyo hueco está AL FINAL no es un fallo: significa que
la sección es breve y terminó.

Uso:
    pip install pymupdf
    python marca/tools/revisar-pdf.py

Sale con código 1 si encuentra algo, para poder usarse como control.
"""
import sys
from pathlib import Path

try:
    import pymupdf
except ImportError:
    sys.exit("Falta pymupdf.  Instalalo con:  pip install pymupdf")

PDF = Path(__file__).resolve().parent.parent / "manual-de-marca.pdf"
INTERIOR = 0.18   # franja vacía en el medio, en fracción del alto
COLA = 0.12       # una página menos llena que esto es una cola huérfana

if not PDF.exists():
    sys.exit(f"No existe {PDF}.  Generalo con:  node marca/tools/render.mjs solo=manual")

doc = pymupdf.open(PDF)
print(f"{PDF.name}: {doc.page_count} páginas\n")

fallos = []
for i, page in enumerate(doc, 1):
    pix = page.get_pixmap(dpi=60, colorspace=pymupdf.csGRAY)
    w, h = pix.width, pix.height
    # min() bajo 252 también toma los fondos claros (los bloques rosa pálido)
    filas = [1 if min(pix.samples[y * w:(y + 1) * w]) < 252 else 0 for y in range(h)]

    primero = next((y for y, v in enumerate(filas) if v), None)
    if primero is None:
        continue
    ultimo = next(y for y in range(h - 1, -1, -1) if filas[y])
    ocup = (ultimo - primero) / h

    # huecos con contenido por encima y por debajo
    interior, inicio = 0, None
    for y in range(primero, ultimo):
        if filas[y]:
            if inicio is not None:
                interior = max(interior, (y - inicio) / h)
            inicio = None
        elif inicio is None:
            inicio = y

    n_lineas = len([t for t in page.get_text().splitlines() if t.strip()])

    marcas = []
    if interior > INTERIOR:
        marcas.append(f"hueco interior {interior*100:.0f}%")
    if ocup < COLA and n_lineas <= 4:
        marcas.append(f"cola huérfana ({n_lineas} líneas)")
    if marcas:
        fallos.append(i)
        print(f"  pág {i:2d}  {'  <- '.join(marcas)}")

print()
if fallos:
    sys.exit(f"{len(fallos)} página(s) con problemas: {fallos}")
print("Ninguna página con hueco interior ni cola huérfana.")