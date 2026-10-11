/**
 * JJVV SAN LUIS III · Generador de variantes del logotipo
 * ----------------------------------------------------
 * Lee el SVG principal y produce las variantes de color que la marca
 * necesita, sin redibujar a mano. Si mañana cambia el color del logo,
 * se regeneran todas y quedan coherentes.
 *
 * Uso:  node marca/tools/variantes.mjs
 *
 * Por qué existe una versión "reversa" (y por qué es obligatoria):
 *   el encabezado oscuro del sitio y el pie de página son color tinta.
 *   Un logo con tinta y blanco sobre fondo oscuro es INVISIBLE.
 *   La variante reversa invierte la tinta a blanco y conserva el
 *   salmón, que es el acento de marca y sí funciona sobre oscuro.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const LOGO = resolve(HERE, "..", "logo");

const TINTA = "#1e3036";
const SALMON = "#fc6c5a";
const BLANCO = "#ffffff";

const base = readFileSync(resolve(LOGO, "sanluis3-logo-completo.svg"), "utf8");

/** Reescribe el encabezado del comentario para que la variante se documente sola. */
function cabecera(titulo, uso, relleno) {
  return `<!--
  JJVV SAN LUIS III · ${titulo}
  Generado por marca/tools/variantes.mjs — NO editar a mano.
  Regenerar:  node marca/tools/variantes.mjs

  USO: ${uso}
  RELLENO: ${relleno}
-->${base.slice(base.indexOf("-->") + 3)}`;
}

/* ---------- 1 · REVERSA · para fondos oscuros ----------
   Solo cambian a blanco la figura izquierda y el nombre "JJVV", que son
   las dos cosas que quedan sobre el fondo oscuro.

   El aro, las pelotas y sus pentágonos NO se tocan: van dibujados sobre
   el medallón blanco, y si también fueran blancos desaparecerían. */
const reversa = base
  .replace(/(<g fill=")#1e3036(">\s*<circle cx="74")/, '$1#ffffff$2')
  .replace(/(<text x="150" y="223"[^>]*?fill=")#1e3036(">JJVV)/, '$1#ffffff$2');

if (reversa === base) {
  throw new Error(
    "La variante reversa no cambió nada: los anclajes del SVG base no coinciden. " +
      "Revisa el grupo de la figura izquierda y el texto JJVV."
  );
}

writeFileSync(
  resolve(LOGO, "sanluis3-logo-reversa.svg"),
  `<!--
  JJVV SAN LUIS III · LOGOTIPO REVERSA (fondo oscuro)
  Generado por marca/tools/variantes.mjs. No editar a mano.

  USO: sitios con fondo tinta o salmón: pie de página, portadas oscuras,
       historias de Instagram con fondo oscuro. Nunca sobre fondo claro.
  QUÉ CAMBIA: solo la figura izquierda y el nombre "JJVV" pasan a blanco.
  El medallón con las pelotas se mantiene tal cual, porque va sobre fondo claro.
-->
${reversa}`,
  "utf8"
);

/* ---------- 2 · MONOCROMO TINTA · para impresión ----------
   El orden importa: la píldora se corrige ANTES del reemplazo general,
   porque después de ese reemplazo ya no queda fill="salmon" que buscar. */
const mono = base
  // La píldora no puede quedar rellena: taparía el texto que lleva dentro.
  .replace(
    `<rect x="24" y="240" width="252" height="46" rx="23" fill="${SALMON}"/>`,
    `<rect x="24" y="240" width="252" height="46" rx="23" fill="none" stroke="currentColor" stroke-width="5"/>`
  )
  .replace(new RegExp(`(fill=")${TINTA}(")`, "g"), '$1currentColor$2')
  .replace(new RegExp(`(stroke=")${TINTA}(")`, "g"), '$1currentColor$2')
  .replace(new RegExp(`(fill=")${SALMON}(")`, "g"), '$1currentColor$2')
  .replace(/(<text x="150" y="270"[^>]*?fill=")#ffffff(">SAN LUIS)/, '$1currentColor$2')
  .replace(`<svg xmlns="http://www.w3.org/2000/svg"`, `<svg xmlns="http://www.w3.org/2000/svg" color="${TINTA}"`);

writeFileSync(
  resolve(LOGO, "sanluis3-logo-mono.svg"),
  `<!--
  JJVV SAN LUIS III · LOGOTIPO MONOCROMO (un solo color)
  Generado por marca/tools/variantes.mjs. No editar a mano.

  USO: impresión en una tinta, bordado, serigrafía, sellos, fotocopias.
  Se tiñe con la propiedad CSS "color", así que el mismo archivo sirve
  para imprimir en tinta o en blanco: <svg color="#ffffff">.
  QUÉ CAMBIA: todo el color pasa a currentColor y la píldora queda solo
  con su contorno, para que el texto de adentro siga siendo legible.
-->
${mono}`,
  "utf8"
);

/* ---------- 3 · SÍMBOLO (sin texto, para avatar y favicon) ---------- */

/**
 * Extrae un grupo <g> completo contando la anidación.
 * Cortar con indexOf() no sirve: los grupos se anidan y un corte
 * a la mitad deja el XML sin cerrar.
 */
function extraerGrupo(svg, etiqueta) {
  const inicio = svg.indexOf(etiqueta);
  if (inicio === -1) throw new Error(`No se encontró ${etiqueta} en el SVG base`);
  const rx = /<\/?g[\s>]/g;
  rx.lastIndex = svg.indexOf(">", inicio) + 1;
  let depth = 1;
  let m;
  while (depth > 0 && (m = rx.exec(svg))) {
    depth += m[0][1] === "/" ? -1 : 1; // m[0] es "<g " o "</g>"
  }
  if (depth !== 0) throw new Error(`Grupo ${etiqueta} sin cerrar`);
  return svg.slice(inicio, m.index + 4);
}

const svgOpen = base.slice(base.indexOf("<svg"), base.indexOf(">", base.indexOf("<svg")) + 1);
// Recorta el viewBox al símbolo solo (sin el nombre ni la píldora).
const marca = extraerGrupo(base, '<g id="marca"');
const simbolo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 4 220 186" width="220" height="186"
     role="img" aria-label="Junta de Vecinos San Luis III">
  <title>JJVV San Luis III — símbolo</title>
  ${marca}
</svg>
`;

writeFileSync(
  resolve(LOGO, "sanluis3-simbolo.svg"),
  `<!--
  JJVV SAN LUIS III · SÍMBOLO (sin texto)
  Generado por marca/tools/variantes.mjs. No editar a mano.

  USO: foto de perfil de redes, favicon grande, sello, marca de agua,
       ícono de app. En lugares donde no cabe el nombre completo.
  TAMAÑO MÍNIMO: 24 px en pantalla / 8 mm impreso.
-->
${simbolo}`,
  "utf8"
);

console.log("Variantes generadas en marca/logo/:");
for (const f of ["sanluis3-logo-reversa.svg", "sanluis3-logo-mono.svg", "sanluis3-simbolo.svg"]) {
  console.log("  · " + f);
}