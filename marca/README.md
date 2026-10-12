# Manual de marca · Junta de Vecinos San Luis III

Todo lo necesario para que el logo, los colores y el diseño se vean iguales
en el sitio web, en Instagram, en TikTok, en Facebook y en los avisos de
WhatsApp.

**Para leer las reglas:** abre [`manual-de-marca.html`](manual-de-marca.html)
en el navegador. Tiene índice y se puede imprimir o guardar como PDF.

---

## Qué hay en cada carpeta

| Carpeta | Qué contiene |
|---|---|
| `logo/` | El logo en **SVG** (vectorial, se imprime nítido en cualquier tamaño) y sus versiones: color, reversa para fondos oscuros, monocroma, el símbolo suelto y el bloque de nombre. |
| `tokens/` | `tokens.css` y `tokens.json`: todos los colores, medidas y sombras del sistema. Es lo único que hay que tocar para cambiar algo en toda la marca. |
| `tipo/` | Las dos tipografías (Outfit y Plus Jakarta Sans), ya alojadas en la web. No se descarga nada de internet. |
| `plantillas/` | Las 8 piezas listas para publicar, cada una con su archivo editable (`.html`) y su imagen (`.png`) en el tamaño exacto de su plataforma. |
| `board/` | La retícula 3 × 3 de la identidad: cómo se ven el logo, el color, las letras y las aplicaciones. |
| `docs/` | `estrategia.md`: cómo habla la fundación, con ejemplos de textos buenos y malos. |
| `tools/` | Los scripts que regeneran todo (abajo). |

## Para publicar un evento

1. Abre `plantillas/ig-post/ig-post.html` con el Bloc de notas o cualquier editor.
2. Cambia el **título**, la **bajada**, la **fecha**, la **hora** y el **lugar**.
   Están juntos al principio de `tools/plantillas.mjs`, pero si solo quieres
   cambiar una cosa para un solo post, edita el HTML directo.
3. Exporta el PNG:

```
node marca/tools/render.mjs solo=plantillas
```

4. Listo: tienes `plantillas/ig-post/ig-post.png` en 1080 × 1080.

> Para cambiar el texto de las 8 piezas de una sola vez, edita el bloque `C`
> que está al principio de `marca/tools/plantillas.mjs` y ejecuta el comando
> de nuevo.

## Para cambiar la marca

| Quiero cambiar… | Edito… | Después corro… |
|---|---|---|
| Un color | `tokens/tokens.css` | `node marca/tools/plantillas.mjs` y `render.mjs solo=plantillas` |
| El texto de las piezas | `tools/plantillas.mjs` (bloque `C`) | `node marca/tools/plantillas.mjs` y `render.mjs` |
| El logo | `logo-san-luis-iii.png` (el PNG original, en la raíz del repo) | `python marca/tools/vectorizar.py` y `node marca/tools/variantes.mjs` |
| La retícula de identidad | `tools/board.mjs` | `node marca/tools/board.mjs` y `render.mjs solo=board` |

> **El logo no se dibuja a mano.** Para cambiarlo hay que reemplazar el PNG
> original y volver a vectorizarlo. Una versión anterior se dibujó a mano
> "mirando" el PNG y quedó fiel solo en la idea: la figura izquierda, el
> tamaño de las pelotas y el relleno del medallón no coincidían.
> El trazador automático sí sigue el contorno real.

Comandos sueltos:

```bash
python marca/tools/vectorizar.py            # Vectoriza el logo desde el PNG
node marca/tools/variantes.mjs              # Regenera las versiones del logo
node marca/tools/limpiar-svg.mjs            # Revisa que los SVG estén sanos
node marca/tools/limpiar-svg.mjs --check    # Solo revisa, sin escribir
node marca/tools/plantillas.mjs             # Regenera las 8 plantillas
node marca/tools/board.mjs                  # Regenera la retícula 3x3
node marca/tools/render.mjs                 # Exporta TODO a PNG y PDF
node marca/tools/render.mjs solo=plantillas # Solo un grupo
```

## Requisitos

**Node.js** (gratis, [nodejs.org](https://nodejs.org)) y un navegador Chromium
— Windows ya trae Edge, así que normalmente no hay que instalar nada.

Para **cambiar el logo** además hace falta **Python** con estas librerías:

```
pip install opencv-python numpy pillow
```

Todo se genera en el computador, sin cuentas, sin IA de pago y sin internet
después de la primera vez.

## Dos tamaños de símbolo (no es una contradicción)

El logo tiene más detalle del que entra en un favicon, así que hay dos
versiones y cada una va en su lugar:

- **`sanluis3-simbolo.svg`** es el emblema real, con las figuras, las pelotas y
  todo el detalle. Se usa desde unos **120 px** de ancho hacia arriba, y en
  impresión.
- **`favicon.svg`** es una **reducción**, no un recorte: conserva el medallón
  claro y las tres pelotas, y saca las costuras, los brazos y el texto, que es
  justamente lo que a 16 px se convierte en manchas. Va en la pestaña del
  navegador y en tamaños de 16 a 64 px.

Se probaron recortes reales del emblema para el favicon y ninguno funcionaba:
a 16 px todo se ve como una mancha gris. Por eso el favicon es una reducción
dibujada a medida, no un recorte.

## El bloque de nombre

`sanluis3-nombre.svg` y `sanluis3-nombre-reversa.svg` son solo las letras
`JJVV` y la píldora `SAN LUIS III`, recortadas del logo maestro con sus trazos
reales. Van en el pie de página, firmas de correo y membretes, donde el emblema
ya está cerca y solo hace falta el nombre.

Existe porque antes el manual ponía «JJVV» escrito con la tipografía del
documento como si fuera el logo. No lo era: la `J` del logo cae con curva hacia
la izquierda y las `V` terminan en punta, y esa diferencia es justo lo que hace
reconocible la marca. **El nombre no se escribe nunca con una fuente**, se usa
el archivo.

## Decisiones que ya están tomadas

Estas se discutieron y se dejaron escritas para que nadie las vuelva a abrir:

- **Los colores salen del logo, no al revés.** El salmón canónico es `#FC6C5A`
  y la tinta `#1E3036`, muestreados del archivo original. Antes el sitio usaba
  `#fa8072` y `#24313b`, que eran un poco más apagados y no cuadraban con el logo.
- **Nada de Inter.** Se descartó a propósito: es la tipografía que usa por
  defecto todo lo generado automáticamente, y una marca que quiere que la
  reconozcan necesita una voz propia.
- **Una sola fuente de verdad para los colores:** `tokens/tokens.css`. El sitio,
  las plantillas, la retícula y este manual leen de ahí.
- **El logo real nunca se había vectorizado.** Solo existía el favicon, que es
  otra versión simplificada. `logo/sanluis3-logo-completo.svg` es la
  reconstrucción vectorial del logotipo original, y de ella salen todas las
  demás versiones.