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
   El recorte usa el borde inferior real del emblema que midió el
   trazador (data-emblem-bottom). Con un porcentaje del lienzo se
   cortaban 31 px del medallón y entraba parte de la fila "JJVV".

   Además del viewBox se pone un clipPath explícito: se comprobó que
   algunos renderizadores dibujan la fila "JJVV" aunque quede fuera
   del viewBox, y en el manual se veía cortada. Con el recorte
   explícito no depende de cómo lo interprete el navegador. */
function recortarSimbolo(svg) {
  const bbox = svg.match(/data-bbox="(\d+) (\d+) (\d+) (\d+)"/);
  const borde = svg.match(/data-emblem-bottom="(\d+)"/);
  if (!bbox || !borde) {
    throw new Error(
      "El SVG base no trae data-bbox ni data-emblem-bottom.\n" +
        "Regenerá el logo con:  python marca/tools/vectorizar.py"
    );
  }
  const [, bx, by, bw] = bbox.map(Number);
  const fondo = Number(borde[1]);
  const alto = fondo - by;

  // Se parte el SVG en apertura / contenido / cierre
  const i = svg.indexOf("<svg");
  const j = svg.indexOf(">", i) + 1;
  const k = svg.lastIndexOf("</svg>");
  const apertura = svg.slice(i, j);
  const contenido = svg.slice(j, k);
  const meta = svg.slice(0, i);

  const aperturaNueva = apertura
    .replace(/viewBox="0 0 1254 1254"/, `viewBox="${bx} ${by} ${bw} ${alto}"`)
    // width/height tienen que acompañar al viewBox; si no, el navegador
    // reserva un lienzo cuadrado y el símbolo queda con aire de más
    .replace(/\s*width="1254" height="1254"/, ` width="${bw}" height="${alto}"`)
    .replace(/\s*data-(bbox|emblem-bottom)="[^"]*"/g, "");

  return (
    meta +
    aperturaNueva +
    `\n  <clipPath id="recorte"><rect x="${bx}" y="${by}" width="${bw}" height="${alto}"/></clipPath>` +
    `\n  <g clip-path="url(#recorte)">` +
    contenido +
    `</g>\n</svg>\n`
  );
}

const simbolo = recortarSimbolo(cuerpoSvg);
writeFileSync(
  resolve(LOGO, "sanluis3-simbolo.svg"),
  encabezado(
    "SÍMBOLO (sin texto)",
    "Foto de perfil de redes, favicon grande, sello, marca de agua. Donde no cabe el nombre completo. Para fondo claro.",
    "Mismos colores que el logo completo.",
    simbolo
  ),
  "utf8"
);

/* ---------- 4 · SÍMBOLO REVERSO · para fondo oscuro ----------
   Solo la tinta pasa a blanco. Sobre fondo tinta el personaje azul
   se confunde con el fondo y desaparece. */
const simboloReversa = pintarCapa(recortarSimbolo(cuerpoSvg), TINTA, BLANCO, "tinta");
writeFileSync(
  resolve(LOGO, "sanluis3-simbolo-reversa.svg"),
  encabezado(
    "SÍMBOLO REVERSO (fondo oscuro)",
    "Encabezados y piezas sobre fondo tinta: portada del manual, historias de Instagram, portada de TikTok, portada de Facebook, panel oscuro del banner web.",
    "Blanco y salmón.",
    simboloReversa
  ),
  "utf8"
);

/* ---------- 5 · SÍMBOLO TINTA · para fondo salmón ----------
   El problema inverso: sobre una superficie salmón, las figuras y el
   balón de básquetbol del logo se funden con el fondo. Aquí el salmón
   pasa a tinta, y queda un logo de dos tonos que contrasta bien. */
const simboloTinta = pintarCapa(recortarSimbolo(cuerpoSvg), SALMON, TINTA, "salmon");
writeFileSync(
  resolve(LOGO, "sanluis3-simbolo-tinta.svg"),
  encabezado(
    "SÍMBOLO TINTA (fondo salmón)",
    "Piezas sobre superficie salmón: carrusel, panel del post de Facebook, aviso de WhatsApp, sticker del board.",
    "Tinta y blanco.",
    simboloTinta
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
  "sanluis3-simbolo-tinta.svg",
]) {
  console.log("  · " + f);
}

console.log("\nQue version va en cada fondo (esto se aplico a las plantillas):");
console.log("  crema o blanco -> sanluis3-simbolo.svg         a color");
console.log("  tinta          -> sanluis3-simbolo-reversa.svg  persona en blanco");
console.log("  salmon         -> sanluis3-simbolo-tinta.svg   salmon pasa a tinta");