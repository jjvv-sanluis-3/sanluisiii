/**
 * JJVV SAN LUIS III · Limpieza y validación de SVG
 * ----------------------------------------------------
 * Un SVG es XML. Eso trae dos reglas que se rompen muy fácil al
 * editar a mano, y en ambas el navegador perdona pero Illustrator,
 * Inkscape o un editor de textos tiran el archivo:
 *
 *   1. Dentro de un comentario NO puede aparecer "--".
 *      Escribir "<!-- ---------- sección ---------- -->" invalida el archivo.
 *
 *   2. El archivo no debe empezar con BOM (marcas de orden de bytes).
 *      Es un carácter invisible que rompe los parsers XML estrictos.
 *
 * Uso:  node marca/tools/limpiar-svg.mjs           -> limpia todos
 *       node marca/tools/limpiar-svg.mjs --check   -> solo verifica
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = resolve(HERE, "..", "logo");
const soloCheck = process.argv.includes("--check");

/** Quita "--" del interior de los comentarios y cualquier BOM. */
function limpiar(texto) {
  let t = texto.replace(/^﻿/, ""); // BOM al inicio
  t = t.replace(/<!--([\s\S]*?)-->/g, (_, interior) => {
    const limpio = interior.replace(/--+/g, "·").replace(/·(\s*)-->/, "$1-->");
    return `<!--${limpio}-->`;
  });
  return t;
}

/** Valida que no queden "--" dentro de comentarios y que no haya BOM. */
function problemas(texto) {
  const errs = [];
  if (texto.startsWith("﻿")) errs.push("empieza con BOM");
  const rx = /<!--([\s\S]*?)-->/g;
  let m;
  while ((m = rx.exec(texto))) {
    if (m[1].includes("--")) errs.push(`comentario con "--" en la pos ${m.index}`);
  }
  // Balance de grupos
  const abren = (texto.match(/<g[\s>]/g) || []).length;
  const cierran = (texto.match(/<\/g>/g) || []).length;
  if (abren !== cierran) errs.push(`<g> sin cerrar: ${abren} abren, ${cierran} cierran`);
  return errs;
}

const archivos = readdirSync(DIR).filter((f) => f.endsWith(".svg"));
let conProblemas = 0;

for (const f of archivos) {
  const ruta = join(DIR, f);
  const original = readFileSync(ruta, "utf8");
  const limpio = limpiar(original);
  const errs = problemas(limpio);

  if (errs.length) {
    conProblemas++;
    console.log(`✗ ${f}`);
    errs.forEach((e) => console.log(`    · ${e}`));
  } else {
    console.log(`✓ ${f}`);
  }

  if (!soloCheck && limpio !== original) {
    writeFileSync(ruta, limpio, "utf8");
    console.log("    (corregido y guardado)");
  }
}

console.log(
  conProblemas === 0
    ? `\n${archivos.length} SVG correctos.`
    : `\n${conProblemas} de ${archivos.length} con problemas.`
);
process.exit(conProblemas === 0 ? 0 : 1);