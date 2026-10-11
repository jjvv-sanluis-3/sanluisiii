# AGENTS.md

## What this is
Static single-page site for JJ.VV. San Luis III (Junta de Vecinos, Maipú, Chile). No framework, no build step, no package manager.

## Deployment
- Target: GitHub Pages (user site: `jjvv-san-luis-3.github.io`)
- Entry file must be `index.html` — the source file `JJVV-San-Luis-III.html` must be renamed before deploying
- Repo must be **Public** (required for free GitHub Pages)
- Planned CMS: Decap CMS at `/admin` for non-technical content editors (not yet configured)

## Conventions
- All UI copy in **Spanish**
- Design tokens in `:root` (CSS custom properties): `--salmon:#fa8072`, `--ink:#24313b`, `--cream:#fff9f6`, `--yellow:#ffd166`
- No Tailwind, no Bootstrap — all CSS is custom, minified single-file
- Font: Inter with system-ui fallback
- Images: `logo-san-luis-iii.png` referenced relatively
- Responsive breakpoints: 850px (tablet/mobile), 480px (small mobile)
- `prefers-reduced-motion` is respected

## Files
- `JJVV-San-Luis-III.html` — entire site markup + styles + hamburger menu script
- `logo-san-luis-iii.png` — organization logo (used in header + favicon)
