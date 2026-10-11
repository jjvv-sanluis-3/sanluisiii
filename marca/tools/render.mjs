/**
 * JJVV SAN LUIS III · Motor de exportación de imágenes
 * ----------------------------------------------------
 * Convierte archivos HTML en PNG a la dimensión EXACTA usando Edge (Chromium)
 * en modo headless. Todo local, sin claves de IA, sin costo.
 *
 * Uso:
 *   node marca/tools/render.mjs            -> exporta todo lo declarado abajo
 *   node marca/tools/render.mjs solo=logo  -> exporta solo un grupo
 *
 * Verifica al final que cada PNG tenga los píxeles declarados y avisa si falla.
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from "node:fs";
import { dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, "..", ".."); // raíz del repo

const EDGE_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];

function findBrowser() {
  const found = EDGE_CANDIDATES.find((p) => existsSync(p));
  if (!found) throw new Error("No se encontró Edge ni Chrome en este equipo.");
  return found;
}

/** Lee la dimensión real de un PNG desde su cabecera IHDR. */
function pngSize(file) {
  const b = readFileSync(file);
  if (b.length < 24) return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

/**
 * Captura un HTML local como PNG de width × height exactos.
 */
export function capture(htmlFile, outFile, width, height) {
  const browser = findBrowser();
  mkdirSync(dirname(outFile), { recursive: true });

  const url = "file:///" + resolve(htmlFile).replace(/\\/g, "/");
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--window-size=${width},${height}`,
    `--screenshot=${resolve(outFile)}`,
    url,
  ];

  const r = spawnSync(browser, args, { encoding: "utf8" });
  if (r.error) throw r.error;

  if (!existsSync(outFile)) {
    throw new Error(`Edge no generó el PNG: ${outFile}\n${r.stderr || ""}`);
  }

  const size = pngSize(outFile);
  const ok = size && size.width === width && size.height === height;
  return { ok, expected: { width, height }, actual: size };
}

/**
 * Captura un SVG como PNG de width × height exactos.
 *
 * No se puede pasar el SVG directo a Edge: el navegador lo pinta a su
 * tamaño natural dentro de la ventana y queda una miniatura en una esquina.
 * Se envuelve en un HTML del tamaño exacto y se centra.
 */
export function captureSvg(svgFile, outFile, width, height, fondo = "transparent") {
  const svg = readFileSync(svgFile, "utf8");
  const tmpHtml = resolve(dirname(outFile), `__${basename(svgFile)}.html`);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(
    tmpHtml,
    `<!doctype html><html><head><meta charset="utf-8">
<style>
 html,body{margin:0;padding:0;width:${width}px;height:${height}px;overflow:hidden;
         background:${fondo};display:grid;place-items:center}
 svg{width:${width}px;height:${height}px;display:block}
</style></head><body>${svg}</body></html>`,
    "utf8"
  );
  try {
    return capture(tmpHtml, outFile, width, height);
  } finally {
    // El HTML de apoyo no se deja en el repo
    try { unlinkSync(tmpHtml); } catch {}
  }
}

/** Captura un HTML largo como PDF (A4 vertical, sin márgenes de escala). */
export function capturePdf(htmlFile, outFile) {
  const browser = findBrowser();
  mkdirSync(dirname(outFile), { recursive: true });
  const url = "file:///" + resolve(htmlFile).replace(/\\/g, "/");
  const r = spawnSync(
    browser,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      `--print-to-pdf=${resolve(outFile)}`,
      url,
    ],
    { encoding: "utf8" }
  );
  if (r.error) throw r.error;
  if (!existsSync(outFile)) throw new Error(`No se generó el PDF: ${outFile}`);
  return readFileSync(outFile).length;
}

// ------------------------------------------------------------------
// Manifiesto de exportaciones
// ------------------------------------------------------------------
const T = (p) => resolve(ROOT, "marca", p);
const L = (p) => resolve(ROOT, "marca", "logo", p);
const P = (p) => resolve(ROOT, "marca", "plantillas", p);

const JOBS = {
  logo: [
    // El logotipo real, reconstruido como vector. Con fondo crema porque
    // el PNG transparente se ve raro en cualquier visor de fondo oscuro.
    { svg: L("sanluis3-logo-completo.svg"),  out: L("png/logo-completo-1200.png"),  w: 1200, h: 1200, fondo: "#fff9f6" },
    { svg: L("sanluis3-logo-completo.svg"),  out: L("png/logo-completo-300.png"),   w: 300,  h: 300,  fondo: "#fff9f6" },
    // La versión reversa se muestra sobre tinta: así se demuestra que existe
    { svg: L("sanluis3-logo-reversa.svg"),   out: L("png/logo-reversa-1200.png"),   w: 1200, h: 1200, fondo: "#1e3036" },
    { svg: L("sanluis3-logo-mono.svg"),      out: L("png/logo-mono-1200.png"),      w: 1200, h: 1200, fondo: "#fff9f6" },
    // El símbolo suelto, para avatar y favicon
    { svg: L("sanluis3-simbolo.svg"),        out: L("png/simbolo-512.png"),         w: 512,  h: 512,  fondo: "#fff9f6" },
    { svg: L("sanluis3-simbolo.svg"),        out: L("png/simbolo-avatar-512.png"),  w: 512,  h: 512,  fondo: "#fc6c5a" },
    // El símbolo en blanco, para fondo oscuro
    { svg: L("sanluis3-simbolo-reversa.svg"), out: L("png/simbolo-reversa-512.png"),  w: 512, h: 405, fondo: "#1e3036" },
    // Favicon
    { svg: L("favicon.svg"),                out: L("png/favicon-64.png"),          w: 64,   h: 64,   fondo: "#ffffff" },
    { svg: L("favicon.svg"),                out: L("png/favicon-180.png"),        w: 180,  h: 180,  fondo: "#ffffff" },
    { svg: L("favicon.svg"),                out: L("png/favicon-512.png"),        w: 512,  h: 512,  fondo: "#ffffff" },
  ],
  plantillas: [
    { html: P("ig-post/ig-post.html"), out: P("ig-post/ig-post.png"), w: 1080, h: 1080 },
    { html: P("ig-story/ig-story.html"), out: P("ig-story/ig-story.png"), w: 1080, h: 1920 },
    { html: P("ig-carrusel/ig-carrusel.html"), out: P("ig-carrusel/ig-carrusel.png"), w: 1080, h: 1350 },
    { html: P("tiktok-portada/tiktok-portada.html"), out: P("tiktok-portada/tiktok-portada.png"), w: 1080, h: 1920 },
    { html: P("fb-post/fb-post.html"), out: P("fb-post/fb-post.png"), w: 1200, h: 630 },
    { html: P("fb-portada/fb-portada.html"), out: P("fb-portada/fb-portada.png"), w: 820, h: 312 },
    { html: P("web-hero/web-hero.html"), out: P("web-hero/web-hero.png"), w: 1920, h: 600 },
    { html: P("aviso-whatsapp/aviso-whatsapp.html"), out: P("aviso-whatsapp/aviso-whatsapp.png"), w: 1080, h: 1080 },
  ],
  board: [
    { html: T("board/board-identidad.html"), out: T("board/board-identidad.png"), w: 1920, h: 1200 },
  ],
  manual: [
    { html: T("manual-de-marca.html"), out: T("manual-de-marca.pdf"), pdf: true },
  ],
};

const argSolo = process.argv.find((a) => a.startsWith("solo="));
const solo = argSolo ? argSolo.split("=")[1] : null;
const grupos = Object.keys(JOBS).filter((g) => (solo ? g === solo : true));

console.log(`Navegador: ${findBrowser()}\n`);
let fallas = 0;

for (const grupo of grupos) {
  console.log(`── ${grupo} ─────────────────────────────`);
  for (const job of JOBS[grupo]) {
    try {
      if (job.pdf) {
        const bytes = capturePdf(job.html, job.out);
        console.log(`  ✓ ${job.out.replace(ROOT + "\\", "")}  (PDF, ${(bytes / 1024).toFixed(0)} KB)`);
      } else {
        const r = job.svg
          ? captureSvg(job.svg, job.out, job.w, job.h, job.fondo)
          : capture(job.html, job.out, job.w, job.h);
        const marca = r.ok ? "✓" : "✗";
        console.log(
          `  ${marca} ${job.out.replace(ROOT + "\\", "")}  ${r.actual.width}×${r.actual.height}` +
            (r.ok ? "" : `  (se esperaba ${r.expected.width}×${r.expected.height})`)
        );
        if (!r.ok) fallas++;
      }
    } catch (e) {
      console.log(`  ✗ ${job.out.replace(ROOT + "\\", "")}  ERROR: ${e.message}`);
      fallas++;
    }
  }
  console.log("");
}

console.log(fallas === 0 ? "Todo exportado correctamente." : `${fallas} trabajo(s) con problemas.`);
process.exit(fallas === 0 ? 0 : 1);