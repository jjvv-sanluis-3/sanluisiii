# AGENTS.md

## What this is
Static single-page site for JJ.VV. San Luis III (Junta de Vecinos, Maipú, Chile). No framework, no build step, no package manager.

## Deployment
- Target: GitHub Pages (project site: `https://jjvv-sanluis-3.github.io/sanluisiii/`)
- Repo: `jjvv-sanluis-3/sanluisiii` (owner **sin** guion entre "san" y "luis")
- Entry file must be `index.html` — the source file `JJVV-San-Luis-III.html` must be renamed before deploying
- Repo must be **Public** (required for free GitHub Pages)
- Planned CMS: Decap CMS at `/admin` for non-technical content editors (not yet configured)

## Conventions
- All UI copy in **Spanish**
- No Tailwind, no Bootstrap — all CSS is custom, minified single-file
- Responsive breakpoints: 850px (tablet/mobile), 480px (small mobile)
- `prefers-reduced-motion` is respected
- No emojis used as icons; use inline stroke SVG
- Single-file HTML: no bundler, no build step, no package manager

## Brand system (`marca/`)
The brand manual, logo and social templates live in `marca/`. Read
`marca/README.md` before changing anything visual.

- **Source of truth for color/type:** `marca/tokens/tokens.css` (3 layers:
  primitive → semantic → component). `index.html` mirrors its core values in
  `:root` so the single-file site stays standalone.
- **Core colors** come from sampling the real logo file, not from estimates:
  `--salmon:#fc6c5a` and `--ink:#1e3036`. Do not "tidy" these back to older
  values; the logo PNG is the authority.
- **Fonts:** Outfit (display) + Plus Jakarta Sans (body), self-hosted at
  `marca/tipo/`. **Inter is deliberately banned** — it is the default font of
  everything AI-generated and the brand needs its own voice.
- **Logo:** `marca/logo/sanluis3-logo-completo.svg` is **auto-traced** from
  `logo-san-luis-iii.png` by `marca/tools/vectorizar.py` (OpenCV contours,
  one `<path>` per color layer). Never hand-draw it and never hand-edit the
  traced SVG: replace the PNG and re-run the tracer, then `variantes.mjs`.
  `favicon.svg` is the *reduced* mark on purpose (unreadable at 16px).
- **Regenerating assets** (needs Node.js; the tracer also needs Python):
  - `python marca/tools/vectorizar.py` → re-traces the logo from the PNG
  - `node marca/tools/variantes.mjs` → rebuilds logo colour variants
  - `node marca/tools/plantillas.mjs` → rebuilds the 8 social templates
  - `node marca/tools/render.mjs` → exports all PNG + PDF, verifying exact pixel dimensions
  - `node marca/tools/limpiar-svg.mjs` → validates SVG (no `--` inside comments, no BOM)
- Template helpers take a **height** only and derive the width from the
  symbol's `viewBox`; do not hard-code logo widths.
- `manual-de-marca.html` is both the human manual and the printable PDF.

## Files
- `index.html` — entire site: markup, styles, hamburger menu and the Decap content loader
- `logo-san-luis-iii.png` — original raster logo (source of truth for the vectorization)
- `marca/` — brand manual, vector logo, tokens, fonts and social templates
- `admin/` — Decap CMS panel; `GUIA-CMS.md` — Spanish guide for editors
