/**
 * JJVV SAN LUIS III · Generador de plantillas sociales
 * ----------------------------------------------------
 * Produce las 8 piezas del sistema, cada una en el tamaño EXACTO
 * que pide cada red. Se generan desde un solo lugar para que:
 *
 *   · el logo que aparece en las piezas sea SIEMPRE el SVG real
 *     (nunca una copia desactualizada pegada a mano)
 *   · cambiar un token de color actualice las 8 plantillas
 *   · el contenido de ejemplo se cambie en una sola variable
 *
 * Uso:  node marca/tools/plantillas.mjs
 * Luego: node marca/tools/render.mjs solo=plantillas
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(HERE, "..", "..");
const SALIDA = resolve(RAIZ, "marca", "plantillas");

/* ------------------------------------------------------------------
   1 · CONTENIDO
   Estos son los textos que se cambian para cada publicación real.
   Están juntos arriba a propósito: quien edita solo toca este bloque.
   ------------------------------------------------------------------ */
const C = {
  evento: "Fútbol comunitario",
  bajada: "Un encuentro para jugar juntos. Los equipos se forman el mismo día, así que basta con llegar.",
  fecha: "Jueves 15 de octubre",
  hora: "17:00 h",
  lugar: "Multicancha San Luis III",
  cta: "Trae ropa cómoda",
  firma: "@sanluis3",
  sitio: "jjvv-sanluis-3.github.io/sanluisiii",
};

/* ------------------------------------------------------------------
   2 · LOGO INLINEADO
   Se lee el SVG real del disco. Nunca se copia el trazado a mano:
   así el logo de las publicaciones nunca queda viejo.
   ------------------------------------------------------------------ */
const simboloRaw = readFileSync(resolve(RAIZ, "marca", "logo", "sanluis3-simbolo.svg"), "utf8");
const VIEWBOX = simboloRaw.match(/viewBox="([^"]+)"/)[1];
// El trazado automático emite varios <path> (uno por capa de color),
// así que se toma todo el contenido del svg, sin el etiqueta de cierre.
const CONTENIDO = simboloRaw.slice(
  simboloRaw.indexOf(">", simboloRaw.indexOf("<svg")) + 1,
  simboloRaw.lastIndexOf("</svg>")
);

/** Se pide la ALTURA y el ancho sale del viewBox. Fijar el ancho a mano
    fue justo lo que se rompió cuando el símbolo cambió de proporción. */
const [, , VW, VH] = VIEWBOX.split(/\s+/).map(Number);
const ASPECTO = VW / VH;

function logo(alto, opciones = {}) {
  const { clase = "" } = opciones;
  return `<svg class="${clase}" viewBox="${VIEWBOX}" width="${Math.round(alto * ASPECTO)}"
       height="${alto}" role="img"
       aria-label="Junta de Vecinos San Luis III">${CONTENIDO}</svg>`;
}

/** Lockup horizontal: símbolo + nombre, para Encabezados. */
function lockup(alto, opciones = {}) {
  const { clase = "" } = opciones;
  return `<div class="brandmark ${clase}">
        ${logo(alto)}
        <span class="brand-text">Junta de Vecinos<small>SAN LUIS III · MAIPÚ</small></span>
      </div>`;
}

/* ------------------------------------------------------------------
   3 · ESTRUCTURA DE ARCHIVO
   ------------------------------------------------------------------ */
function pagina({ titulo, ancho, alto, cuerpo, cssExtra = "" }) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${titulo}</title>
<!-- Generado por marca/tools/plantillas.mjs — no editar a mano -->
<link rel="stylesheet" href="../_base.css">
<style>
  html, body { width: ${ancho}px; height: ${alto}px; }
  .canvas { width: ${ancho}px; height: ${alto}px; }
${cssExtra}
</style>
</head>
<body>
${cuerpo}
</body>
</html>
`;
}

/* ------------------------------------------------------------------
   4 · LAS 8 PIEZAS
   Dial calibrado: V4 · M2 · D4 (cálido, cercano, público).
   Nada de gradientes morados, nada de glassmorphism, nada de
   simetría aburrida: cada pieza tiene una composición propia.
   ------------------------------------------------------------------ */
const PIEZAS = {
  /* ---------- 1 · Instagram post 1080×1080 ---------- */
  "ig-post": {
    titulo: "IG post · evento",
    ancho: 1080,
    alto: 1080,
    cuerpo: `<div class="canvas bg-cream">
  <div class="ring" style="width:760px;height:760px;right:-300px;bottom:-330px"></div>
  <div class="ring" style="width:420px;height:420px;right:-130px;bottom:-150px"></div>

  <div style="position:absolute;inset:72px;display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      ${lockup(62, { id: "p1" })}
      <span class="detail">01 / Evento</span>
    </div>

    <div style="margin-top:96px">
      <span class="eyebrow">Agenda del barrio</span>
      <h1 class="title" style="font-size:104px;margin-top:34px;max-width:820px">${C.evento}</h1>
      <p class="subtitle" style="margin-top:28px;max-width:660px">${C.bajada}</p>
    </div>

    <div style="flex:1"></div>

    <div class="chips">
      <span class="chip">${C.fecha} · ${C.hora}</span>
      <span class="chip ghost">${C.lugar}</span>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:44px">
      <span class="cta">${C.cta}</span>
      <span class="sign">${C.firma}</span>
    </div>
  </div>
</div>`,
  },

  /* ---------- 2 · Instagram historia 1080×1920 ---------- */
  "ig-story": {
    titulo: "IG historia · recordatorio",
    ancho: 1080,
    alto: 1920,
    cuerpo: `<div class="canvas bg-ink">
  <div class="ring" style="width:900px;height:900px;left:-380px;top:-420px"></div>
  <div class="ring" style="width:560px;height:560px;right:-260px;bottom:-220px"></div>

  <div style="position:absolute;inset:80px;display:flex;flex-direction:column">
    ${lockup(64, { id: "p2" })}

    <div style="margin-top:110px">
      <span class="eyebrow">Es este jueves</span>
      <h1 class="title" style="font-size:150px;margin-top:38px;line-height:.94">${C.evento}</h1>
      <p class="subtitle" style="margin-top:44px;max-width:760px;font-size:40px">${C.bajada}</p>
    </div>

    <div style="flex:1"></div>

    <div class="chips" style="flex-direction:column;align-items:flex-start;gap:16px">
      <span class="chip ghost">${C.fecha} · ${C.hora}</span>
      <span class="chip ghost">${C.lugar}</span>
    </div>

    <div style="margin-top:56px;display:flex;justify-content:space-between;align-items:center">
      <span class="tres"><i></i><i></i><i></i></span>
      <span class="sign">${C.firma}</span>
    </div>
  </div>
</div>`,
  },

  /* ---------- 3 · Instagram carrusel 1080×1350 ---------- */
  "ig-carrusel": {
    titulo: "IG carrusel · portada",
    ancho: 1080,
    alto: 1350,
    cuerpo: `<div class="canvas bg-salmon">
  <div class="ring" style="width:820px;height:820px;left:-320px;top:-380px;border-color:rgba(30,48,54,.18)"></div>

  <div style="position:absolute;inset:76px;display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      ${lockup(60, { id: "p3" })}
      <span class="detail" style="color:rgba(30,48,54,.62)">Desliza →</span>
    </div>

    <div style="margin-top:110px">
      <span class="eyebrow" style="color:var(--ink-900)">Lo que hacemos</span>
      <h1 class="title" style="font-size:116px;margin-top:34px;max-width:860px">${C.evento}</h1>
      <p style="font-size:33px;line-height:1.5;color:#542d2a;margin-top:30px;max-width:700px">${C.bajada}</p>
    </div>

    <div style="flex:1"></div>

    <div style="display:flex;justify-content:space-between;align-items:center">
      <div class="chips">
        <span class="chip" style="background:var(--ink-900);color:#fff">${C.fecha}</span>
      </div>
      <span class="detail" style="color:rgba(30,48,54,.62)">${C.lugar}</span>
    </div>
  </div>
</div>`,
  },

  /* ---------- 4 · TikTok portada 1080×1920 ---------- */
  "tiktok-portada": {
    titulo: "TikTok · portada de video",
    ancho: 1080,
    alto: 1920,
    cuerpo: `<div class="canvas bg-ink">
  <div style="position:absolute;inset:0;
       background:radial-gradient(circle at 50% 42%, rgba(252,108,90,.20), transparent 62%)"></div>

  <div style="position:absolute;inset:90px;display:flex;flex-direction:column;align-items:center;text-align:center">
    <span class="detail" style="color:var(--ink-300)">Video del barrio</span>

    <h1 class="title" style="font-size:168px;margin-top:70px;line-height:.92;max-width:900px">${C.evento}</h1>

    <div class="tres" style="margin-top:64px"><i></i><i></i><i></i></div>

    <div style="flex:1"></div>

    <span class="chip ghost">${C.fecha}</span>

    <div style="margin-top:60px;display:flex;align-items:center;gap:22px">
      ${logo(74)}
      <span class="sign">${C.firma}</span>
    </div>
  </div>
</div>`,
  },

  /* ---------- 5 · Facebook post 1200×630 ---------- */
  "fb-post": {
    titulo: "Facebook · publicación",
    ancho: 1200,
    alto: 630,
    cssExtra: `
  .split{display:grid;grid-template-columns:1.15fr .85fr;height:100%}`,
    cuerpo: `<div class="canvas">
  <div class="split">
    <div style="background:var(--color-surface);padding:62px 60px;display:flex;flex-direction:column">
      ${lockup(46, { id: "p5" })}
      <h1 class="title" style="font-size:64px;margin-top:auto">${C.evento}</h1>
      <p style="font-size:22px;line-height:1.5;color:var(--color-text-muted);margin-top:18px;max-width:46ch">${C.bajada}</p>
      <div style="display:flex;gap:12px;margin-top:26px;flex-wrap:wrap">
        <span class="chip" style="font-size:17px;padding:11px 20px">${C.fecha} · ${C.hora}</span>
        <span class="chip ghost" style="font-size:17px;padding:11px 20px">${C.lugar}</span>
      </div>
    </div>

    <div style="background:var(--color-surface-brand);display:grid;place-items:center;position:relative">
      <div class="ring" style="width:420px;height:420px;border-color:rgba(30,48,54,.2)"></div>
      ${logo(253)}
    </div>
  </div>
</div>`,
  },

  /* ---------- 6 · Facebook portada 820×312 ---------- */
  "fb-portada": {
    titulo: "Facebook · portada",
    ancho: 820,
    alto: 312,
    cssExtra: `
  .cover{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:26px;text-align:center}`,
    cuerpo: `<div class="canvas bg-ink">
  <div class="ring" style="width:520px;height:520px;left:-260px;top:-190px"></div>
  <div class="ring" style="width:360px;height:360px;right:-180px;bottom:-160px"></div>
  <div class="cover">
    ${lockup(84, { id: "p6" })}
    <p style="font-size:21px;color:var(--ink-200);max-width:34ch">El barrio cambia cuando nos movemos juntos.</p>
    <span class="detail" style="color:var(--ink-300)">Maipú · San Luis III</span>
  </div>
</div>`,
  },

  /* ---------- 7 · Banner web 1920×600 ---------- */
  "web-hero": {
    titulo: "Web · banner",
    ancho: 1920,
    alto: 600,
    cssExtra: `
  .hero{display:grid;grid-template-columns:1.25fr .75fr;height:100%}`,
    cuerpo: `<div class="canvas bg-cream">
  <div class="hero">
    <div style="padding:0 110px;display:flex;flex-direction:column;justify-content:center">
      ${lockup(52, { id: "p7" })}
      <span class="eyebrow" style="margin-top:48px">Agenda del barrio</span>
      <h1 class="title" style="font-size:86px;margin-top:26px;max-width:16ch">${C.evento}</h1>
      <div class="chips" style="margin-top:34px">
        <span class="chip" style="font-size:20px;padding:13px 24px">${C.fecha} · ${C.hora}</span>
        <span class="chip ghost" style="font-size:20px;padding:13px 24px">${C.lugar}</span>
      </div>
    </div>

    <div style="background:var(--color-surface-dark);position:relative;display:grid;place-items:center">
      <div class="ring" style="width:620px;height:620px;border-color:rgba(255,209,102,.24)"></div>
      ${logo(287)}
    </div>
  </div>
</div>`,
  },

  /* ---------- 8 · Aviso WhatsApp 1080×1080 ---------- */
  "aviso-whatsapp": {
    titulo: "WhatsApp · aviso",
    ancho: 1080,
    alto: 1080,
    cuerpo: `<div class="canvas bg-white">
  <div style="position:absolute;inset:0;background:var(--color-primary)"></div>
  <div class="ring" style="width:700px;height:700px;right:-280px;top:-300px;border-color:rgba(30,48,54,.22)"></div>

  <div style="position:absolute;inset:70px;display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span class="detail" style="color:rgba(30,48,54,.65)">Comunidad San Luis III</span>
      <span class="tres"><i style="background:var(--ink-900)"></i><i style="background:var(--ink-900)"></i><i style="background:var(--ink-900)"></i></span>
    </div>

    <div style="margin-top:86px">
      <h1 class="title" style="font-size:118px;max-width:15ch">${C.evento}</h1>
    </div>

    <div style="flex:1"></div>

    <div style="background:var(--ink-900);border-radius:var(--radius-xl);padding:40px 44px;color:#fff">
      <div style="display:flex;justify-content:space-between;font-size:27px;font-weight:800">
        <span>${C.fecha}</span><span>${C.hora}</span>
      </div>
      <div style="height:1px;background:rgba(255,255,255,.22);margin:22px 0"></div>
      <div style="font-size:27px;font-weight:700;color:var(--ink-200)">${C.lugar}</div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:36px">
      <span style="font-size:24px;font-weight:800;color:var(--ink-900)">${C.cta}</span>
      ${logo(52)}
    </div>
  </div>
</div>`,
  },
};

/* ------------------------------------------------------------------
   5 · ESCRITURA
   ------------------------------------------------------------------ */
mkdirSync(SALIDA, { recursive: true });
for (const [nombre, p] of Object.entries(PIEZAS)) {
  const html = pagina(p);
  const ruta = resolve(SALIDA, nombre, `${nombre}.html`);
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, html, "utf8");
  console.log(`  ${p.ancho}×${p.alto}  ${nombre}/${nombre}.html`);
}
console.log(`\n${Object.keys(PIEZAS).length} plantillas generadas.`);
console.log("Para exportarlas a PNG:  node marca/tools/render.mjs solo=plantillas");