/**
 * JJVV SAN LUIS III · Board de identidad (sistema 3×3 de la skill brandkit)
 * ---------------------------------------------------------------------
 * Brandkit propone una grilla 3×3 donde cada panel responde una pregunta
 * distinta de la identidad. No es decoración: es el argumento visual de
 * por qué la marca existe.
 *
 *   1 Portada de logo      2 Construcción      3 Aplicación digital
 *   4 Esencia              5 Color             6 Tipografía
 *   7 Aplicación física    8 Dirección visual  9 Detalle del sistema
 *
 * La skill dice que sus referencias fijan "la vara de calidad, no el
 * estilo". Por eso aquí se conserva su lógica de grilla y su disciplina
 * de color, pero el lienzo es tinta y crema de la marca, no el carbón
 * con acentos genéricos de un studio de software.
 *
 * Uso:  node marca/tools/board.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(HERE, "..", "..");
const SALIDA = resolve(RAIZ, "marca", "board");
mkdirSync(SALIDA, { recursive: true });

/* ---------- logo inlineado desde el SVG real ---------- */
const simboloRaw = readFileSync(resolve(RAIZ, "marca", "logo", "sanluis3-simbolo.svg"), "utf8");
const VIEWBOX = simboloRaw.match(/viewBox="([^"]+)"/)[1];
// El trazado automático emite varios <path>, uno por capa de color.
const CONTENIDO = simboloRaw.slice(
  simboloRaw.indexOf(">", simboloRaw.indexOf("<svg")) + 1,
  simboloRaw.lastIndexOf("</svg>")
);

/** Se pide la ALTURA; el ancho sale del viewBox, para que un cambio de
    proporción del símbolo no obligue a tocar cada tamaño a mano. */
const [, , VW, VH] = VIEWBOX.split(/\s+/).map(Number);
const ASPECTO = VW / VH;

function logo(alto) {
  return `<svg viewBox="${VIEWBOX}" width="${Math.round(alto * ASPECTO)}" height="${alto}">${CONTENIDO}</svg>`;
}

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>JJVV San Luis III · board de identidad</title>
<link rel="stylesheet" href="../tipo/fuentes.css">
<link rel="stylesheet" href="../tokens/tokens.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1200px}
body{font-family:var(--font-body);background:var(--ink-900);color:#fff;
     -webkit-font-smoothing:antialiased}

.lienzo{width:1920px;height:1200px;padding:34px;display:grid;
        grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:22px}

.panel{border-radius:var(--radius-xl);padding:38px;position:relative;overflow:hidden;
       display:flex;flex-direction:column;background:var(--cream-100);color:var(--ink-900)}
.panel.oscuro{background:var(--ink-900);color:#fff}
.panel.salmon{background:var(--color-primary);color:var(--ink-900)}
.panel.crema{background:var(--cream-200)}

/* etiqueta de panel: el "detalle fino" que premia mirar de cerca */
.et{position:absolute;top:26px;right:32px;font-family:var(--font-body);font-size:13px;
    font-weight:700;letter-spacing:.2em;text-transform:uppercase;opacity:.5}
.num{position:absolute;top:26px;left:32px;font-family:var(--font-body);font-size:13px;
     font-weight:700;letter-spacing:.16em;opacity:.45}
.tit{font-family:var(--font-display);font-weight:900;letter-spacing:-.035em;line-height:.98;
     margin-top:auto}
.lbl{font-family:var(--font-body);font-size:16px;font-weight:700;letter-spacing:.16em;
     text-transform:uppercase;opacity:.62;margin-bottom:16px}

/* 1 · portada */
.cover{display:grid;place-items:center;flex:1}

/* 2 · construcción */
.grilla{position:absolute;inset:0;
        background-image:linear-gradient(rgba(30,48,54,.09) 1px,transparent 1px),
                         linear-gradient(90deg,rgba(30,48,54,.09) 1px,transparent 1px);
        background-size:40px 40px}
.construccion{display:grid;place-items:center;flex:1;position:relative}
.cruz{position:absolute;width:2px;height:100%;background:rgba(252,108,90,.4)}
.cruz.h{width:100%;height:2px}

/* 3 · navegador */
.navegador{border-radius:14px;overflow:hidden;background:#fff;box-shadow:var(--shadow-lg);
           display:flex;flex-direction:column;flex:1}
.barra{display:flex;align-items:center;gap:7px;padding:13px 16px;background:#f1eeec;
      border-bottom:1px solid var(--color-border)}
.punto{width:11px;height:11px;border-radius:50%;background:#d6cfcb}
.url{flex:1;background:#fff;border-radius:8px;padding:6px 12px;font-size:12px;color:var(--ink-500)}

/* 4 · esencia */
.esencia{display:flex;flex-direction:column;justify-content:center;flex:1}

/* 5 · color */
.muestras{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;flex:1;align-content:center}
.muestra{border-radius:14px;padding:16px;display:flex;flex-direction:column;justify-content:flex-end;
         min-height:96px}
.muestra b{font-size:15px;font-weight:800}
.muestra span{font-size:12px;opacity:.72;font-weight:600}

/* 6 · tipografía */
.specimen{flex:1;display:flex;flex-direction:column;justify-content:center;gap:16px}
.alf{display:flex;gap:9px;flex-wrap:wrap;margin-top:6px}
.alf i{width:34px;height:34px;border-radius:9px;background:var(--ink-900)}

/* 7 · físico
   El sticker es crema sobre panel salmón: con ambos del mismo color
   el sello desaparecía y el logo no se leía. */
.sticker{width:250px;height:250px;border-radius:50%;background:var(--cream-50);
         display:grid;place-items:center;transform:rotate(-7deg);box-shadow:var(--shadow-lg);
         margin:auto}

/* 8 · dirección visual: patrón, no foto */
.patrono{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;
         padding:26px 26px 6px;opacity:.55;height:50%}
.patrono div{display:grid;place-items:center}

/* 9 · detalle */
.chips{display:flex;flex-wrap:wrap;gap:12px}
.pill{padding:12px 24px;border-radius:999px;background:var(--color-primary);
      font-weight:800;font-size:17px}
.pill.osc{background:var(--ink-900);color:#fff}
.pill.linea{background:transparent;border:2px solid var(--ink-200)}
.tres{display:flex;gap:10px;align-items:flex-end}
.tres i{width:26px;height:26px;border-radius:50%;background:var(--color-primary);display:block}
.tres i:nth-child(2){width:34px;height:34px}
</style>
</head>
<body>
<div class="lienzo">

  <!-- 1 · PORTADA DE LOGO -->
  <div class="panel">
    <span class="num">01</span><span class="et">Marca</span>
    <div class="cover">${logo(211)}</div>
    <div class="lbl">Junta de Vecinos</div>
  </div>

  <!-- 2 · CONSTRUCCIÓN -->
  <div class="panel crema">
    <span class="num">02</span><span class="et">Construcción</span>
    <div class="construccion">
      <div class="grilla"></div>
      <div class="cruz" style="left:50%"></div>
      <div class="cruz h" style="top:50%"></div>
      ${logo(194)}
    </div>
    <div class="lbl" style="margin-top:auto">Tres figuras · tres deportes</div>
  </div>

  <!-- 3 · APLICACIÓN DIGITAL -->
  <div class="panel">
    <span class="num">03</span><span class="et">Sitio web</span>
    <div class="navegador">
      <div class="barra"><i class="punto"></i><i class="punto"></i><i class="punto"></i>
        <span class="url">jjvv-sanluis-3.github.io/sanluisiii</span></div>
      <div style="padding:26px;display:flex;flex-direction:column;gap:18px;flex:1">
        <div style="display:flex;align-items:center;gap:14px">
          ${logo(34)}
          <div>
            <div style="font-family:var(--font-display);font-weight:900;font-size:19px">San Luis III</div>
            <div style="font-size:11px;letter-spacing:.16em;font-weight:700;opacity:.6">JUNTA DE VECINOS</div>
          </div>
        </div>
        <div style="height:8px;width:74%;background:var(--ink-900);border-radius:5px"></div>
        <div style="height:8px;width:52%;background:var(--ink-300);border-radius:5px"></div>
        <div style="display:flex;gap:12px;margin-top:auto">
          <div style="flex:1;height:74px;border-radius:12px;background:var(--color-primary)"></div>
          <div style="flex:1;height:74px;border-radius:12px;background:var(--cream-400)"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- 4 · ESENCIA -->
  <div class="panel oscuro">
    <span class="num">04</span><span class="et">Esencia</span>
    <div class="esencia">
      <h2 class="tit" style="font-size:70px">El barrio cambia<br>cuando nos<br>movemos juntos.</h2>
      <p style="margin-top:26px;color:var(--ink-300);font-size:19px">Tres vecinos. Tres deportes. Un mismo lugar.</p>
    </div>
  </div>

  <!-- 5 · COLOR -->
  <div class="panel">
    <span class="num">05</span><span class="et">Color</span>
    <div class="muestras">
      <div class="muestra" style="background:#FC6C5A;color:#fff"><b>Salmón</b><span>#FC6C5A</span></div>
      <div class="muestra" style="background:#1E3036;color:#fff"><b>Tinta</b><span>#1E3036</span></div>
      <div class="muestra" style="background:#FFD166"><b>Amarillo</b><span>#FFD166</span></div>
      <div class="muestra" style="background:#FFF9F6;border:1px solid #EADFD9"><b>Crema</b><span>#FFF9F6</span></div>
      <div class="muestra" style="background:#CF594A;color:#fff"><b>Salmón 600</b><span>#CF594A</span></div>
      <div class="muestra" style="background:#52616B;color:#fff"><b>Tinta 600</b><span>#52616B</span></div>
    </div>
    <div class="lbl" style="margin-top:22px">Un solo acento: el salmón</div>
  </div>

  <!-- 6 · TIPOGRAFÍA -->
  <div class="panel crema">
    <span class="num">06</span><span class="et">Tipografía</span>
    <div class="specimen">
      <div>
        <div class="lbl" style="margin-bottom:8px">Display · Outfit</div>
        <div style="font-family:var(--font-display);font-weight:900;font-size:52px;
                    letter-spacing:-.04em;line-height:1">AaBbCc 0123</div>
      </div>
      <div>
        <div class="lbl" style="margin-bottom:8px">Cuerpo · Plus Jakarta Sans</div>
        <div style="font-family:var(--font-body);font-weight:600;font-size:31px;line-height:1.2">
          El barrio de San Luis III</div>
      </div>
      <div class="alf">
        <i style="background:#1E3036"></i><i style="background:#FC6C5A"></i>
        <i style="background:#FFD166"></i><i style="background:#FFF9F6;border:1px solid #EADFD9"></i>
      </div>
    </div>
  </div>

  <!-- 7 · APLICACIÓN FÍSICA -->
  <div class="panel salmon">
    <span class="num">07</span><span class="et">Físico</span>
    <div class="sticker">${logo(127)}</div>
    <div class="lbl" style="margin-top:auto;color:var(--ink-900)">Sticker · sello</div>
  </div>

  <!-- 8 · DIRECCIÓN VISUAL -->
  <div class="panel oscuro">
    <span class="num">08</span><span class="et">Dirección</span>
    <div class="patrono">
      <div>${logo(63)}</div>
      <div>${logo(63)}</div>
      <div>${logo(63)}</div>
      <div>${logo(63)}</div>
    </div>
    <div style="margin-top:auto">
      <div class="lbl" style="margin-bottom:12px">Fotografía</div>
      <p style="font-size:21px;line-height:1.4;max-width:36ch">Vecinos de cerca, luz de la tarde,
         warna del barrio. Nada de fotos de banco con gente sonriendo a la cámara.</p>
    </div>
  </div>

  <!-- 9 · DETALLE DEL SISTEMA -->
  <div class="panel">
    <span class="num">09</span><span class="et">Sistema</span>
    <div class="specimen" style="gap:16px;justify-content:center;padding-top:28px">
      <div>
        <div class="lbl" style="margin-bottom:10px">Botones</div>
        <div class="chips">
          <span class="pill" style="padding:10px 20px;font-size:16px">Participar</span>
          <span class="pill osc" style="padding:10px 20px;font-size:16px">Ver agenda</span>
          <span class="pill linea" style="padding:10px 20px;font-size:16px">Más info</span>
        </div>
      </div>
      <div>
        <div class="lbl" style="margin-bottom:10px">Etiquetas</div>
        <div class="chips">
          <span class="pill" style="padding:10px 20px;font-size:16px;background:rgba(252,108,90,.16);color:#CF594A">Deporte</span>
          <span class="pill" style="padding:10px 20px;font-size:16px;background:rgba(255,209,102,.34);color:#8a6410">Jóvenes</span>
        </div>
      </div>
      <div>
        <div class="lbl" style="margin-bottom:10px">El gesto del logo</div>
        <div class="tres"><i style="width:22px;height:22px"></i><i style="width:28px;height:28px"></i><i style="width:22px;height:22px"></i></div>
      </div>
    </div>
  </div>

</div>
</body>
</html>
`;

writeFileSync(resolve(SALIDA, "board-identidad.html"), html, "utf8");
console.log("board/board-identidad.html generado (1920×1200)");
console.log("Para exportarlo:  node marca/tools/render.mjs solo=board");