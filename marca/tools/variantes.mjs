/**
 * JJVV SAN LUIS III · Generador de variantes del logotipo
 * ----------------------------------------------------
 * Toma el SVG principal (trazado automático del PNG original) y produce
 * las variantes de color que la marca necesita.
 *
 * Por qué ahora es tan simple: el SVG base está organizado en CAPAS por
 * color, una de cada una. Antes había que reemplazar colores sueltos con
 * expresiones regulares, y un cambio de orden dejaba la figura izquierda
 * invisible. Ahora basta con tocar el `fill` de la capa correcta, y el
 * guardia de abajo avisa si alguna no existe.
 *
 * Uso:  node marca/tools/variantes.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const LOGO = resolve(HERE, "..", "logo");

const TINTA = "#1e3036";
const SALMON = "#fc6c5a";
const BLANCO = "#ffffff";

const rutaBase = resolve(LOGO, "sanluis3-logo-completo.svg");
const base = readFileSync(rutaBase, "utf8");

/** Partes de color que el trazador emite, en el orden en que se pintan. */
const CAPAS = [
  { hex: TINTA, nombre: "tinta" },
  { hex: SALMON, nombre: "salmon" },
  { hex: BLANCO, nombre: "blanco" },
];

/**
 * Cambia el color de una capa. Falla ruidosamente si esa capa no está,
 * en vez de generar en silencio un logo con un agujero.
 */
function pintarCapa(svg, hexOriginal, hexNuevo, nombre) {
  const patron = `fill="${hexOriginal}"`;
  if (!svg.includes(patron)) {
    throw new Error(
      `El SVG base no tiene la capa "${nombre}" (${hexOriginal}).\n` +
        `Regenerá el logo con:  python marca/tools/vectorizar.py`
    );
  }
  return svg.replace(patron, `fill="${hexNuevo}"`);
}

function encabezado(titulo, uso, relleno, cuerpo) {
  return `<!--
  JJVV SAN LUIS III · ${titulo}
  Generado por marca/tools/variantes.mjs. No editar a mano.

  USO: ${uso}
  RELLENO: ${relleno}
-->
${cuerpo}`;
}

/** El "<svg ...>...</svg>" del archivo, sin el comentario de cabecera. */
const cuerpoSvg = base.slice(base.indexOf("<svg"));

/* ---------- 1 · REVERSA · para fondos oscuros ----------
   Solo la capa tinta pasa a blanco. El salmón se queda igual porque sí
   se lee sobre oscuro, y el blanco ya es blanco.
   Así la figura izquierda se destaca sin romper el medallón. */
const reversa = pintarCapa(cuerpoSvg, TINTA, BLANCO, "tinta");
writeFileSync(
  resolve(LOGO, "sanluis3-logo-reversa.svg"),
  encabezado(
    "LOGOTIPO REVERSA (fondo oscuro)",
    "Sitios con fondo tinta o salmón: pie de página, portadas oscuras, historias de Instagram. Nunca sobre fondo claro.",
    "Blanco y salmón.",
    reversa
  ),
  "utf8"
);

/* ---------- 2 · MONOCROMO · para impresión en una tinta ---------- */
const mono = pintarCapa(pintarCapa(pintarCapa(cuerpoSvg, TINTA, "currentColor", "tinta"),
                                  SALMON, "currentColor", "salmon"),
                        BLANCO, "currentColor", "blanco")
              .replace(`<svg xmlns="http://www.w3.org/2000/svg"`,
                       `<svg xmlns="http://www.w3.org/2000/svg" color="${TINTA}"`);
writeFileSync(
  resolve(LOGO, "sanluis3-logo-mono.svg"),
  encabezado(
    "LOGOTIPO MONOCROMO (un solo color)",
    "Impresión en una tinta, bordado, serigrafía, sellos, fotocopias. Se tiñe con la propiedad CSS color, así que el mismo archivo sirve para tinta o para blanco.",
    "currentColor (un solo color).",
    mono
  ),
  "utf8"
);

/* ---------- 3 · SÍMBOLO · sin el texto, para avatar y favicon ----------
   Se recorta el viewBox usando la caja real que midió el trazador
   (data-bbox), y se corta por debajo del texto "JJVV".
   Hardcodear un recorte a ojo dejaba el logo con aire de más y
   achatado dentro del cuadro. */
const bbox = base.match(/data-bbox="(\d+) (\d+) (\d+) (\d+)"/);
if (!bbox) {
  throw new Error(
    "El SVG base no trae data-bbox.\n" +
      "Regenerá el logo con:  python marca/tools/vectorizar.py"
  );
}
const [, bx, by, bw, bhh] = bbox.map(Number);
// "JJVV" arranca bajo la mitad del lienzo: 0.63 corta justo antes.
const ALTO_SIMBOLO = Math.round(1254 * 0.63);
const simbolo = cuerpoSvg
  .replace(/viewBox="0 0 1254 1254"/, `viewBox="${bx} ${by} ${bw} ${ALTO_SIMBOLO - by}"`)
  .replace(/\s*data-bbox="\d+ \d+ \d+ \d+"/, "");

writeFileSync(
  resolve(LOGO, "sanluis3-simbolo.svg"),
  encabezado(
    "SÍMBOLO (sin texto)",
    "Foto de perfil de redes, favicon grande, sello, marca de agua. Donde no cabe el nombre completo.",
    "Mismos colores que el logo completo.",
    simbolo
  ),
  "utf8"
);

/* ---------- 4 · SÍMBOLO REVERSO · el mismo recorte, para fondo oscuro ----------
   Es el símbolo con la figura izquierda en blanco. Sobre fondo oscuro
   la versión de color se pierde: el personaje azul tinta se confunde
   con el fondo. Es la que usa la portada del manual y las piezas
   que van sobre tinta o salmón. */
const simboloReversa = pintarCapa(simbolo, TINTA, BLANCO, "tinta");
writeFileSync(
  resolve(LOGO, "sanluis3-simbolo-reversa.svg"),
  encabezado(
    "SÍMBOLO REVERSO (fondo oscuro)",
    "Encabezados y piezas sobre fondo tinta o salmón: portada del manual, historias, portadas de TikTok y Facebook, panel oscuro del banner web.",
    "Blanco y salmón.",
    simboloReversa
  ),
  "utf8"
);

/* ---------- informe ---------- */
for (const { hex, nombre } of CAPAS) {
  if (!base.includes(`fill="${hex}"`)) console.log(`  aviso: la capa ${nombre} no está en el base`);
}
console.log("Variantes generadas en marca/logo/:");
for (const f of [
  "sanluis3-logo-reversa.svg",
  "sanluis3-logo-mono.svg",
  "sanluis3-simbolo.svg",
  "sanluis3-simbolo-reversa.svg",
]) {
  console.log("  · " + f);
}