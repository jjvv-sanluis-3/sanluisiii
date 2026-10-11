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
| `logo/` | El logo en **SVG** (vectorial, se imprime nítido en cualquier tamaño) y sus versiones: color, reversa para fondos oscuros, monocroma y el símbolo suelto. |
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
| El logo | `logo/sanluis3-logo-completo.svg` | `node marca/tools/variantes.mjs` |
| La retícula de identidad | `tools/board.mjs` | `node marca/tools/board.mjs` y `render.mjs solo=board` |

Comandos sueltos:

```bash
node marca/tools/limpiar-svg.mjs            # Revisa que los SVG estén sanos
node marca/tools/limpiar-svg.mjs --check    # Solo revisa, sin escribir
node marca/tools/variantes.mjs              # Regenera las versiones del logo
node marca/tools/plantillas.mjs             # Regenera las 8 plantillas
node marca/tools/board.mjs                  # Regenera la retícula 3x3
node marca/tools/render.mjs                 # Exporta TODO a PNG y PDF
node marca/tools/render.mjs solo=plantillas # Solo un grupo
```

## Requisitos

Solo **Node.js** (gratis, [nodejs.org](https://nodejs.org)) y un navegador
Chromium — Windows ya trae Edge, así que normalmente no hay que instalar nada.
Todo se genera en el computador, sin cuentas, sin IA de pago y sin internet
después de la primera vez.

## Dos tamaños de símbolo (no es una contradicción)

En la carpeta `logo/` conviven dos formas del símbolo, y cada una sirve para
una cosa distinta:

- **`sanluis3-logo-completo.svg`** es el logotipo real, con las pelotas y el
  nombre. Se usa desde unos **120 px** de ancho hacia arriba, y en impresión.
- **`favicon.svg`** es una versión **reducida**: solo las tres figuras y el
  arco, sin pelotas ni texto. A 16 o 32 píxeles las pelotas y las letras se
  convierten en manchas, así que el favicon tiene que ser este, no el logo
  entero. Es el que usa el sitio en la pestaña del navegador.

Lo mismo pasa con `sanluis3-marca.svg`, `sanluis3-avatar.svg` y
`sanluis3-horizontal.svg`: son las versiones simplificadas para avatar y
firmas, y se dejan a propósito para no perder el material ya hecho.

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