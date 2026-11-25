// The JavaScript and CSS a route's first load costs, from a production
// build's own manifests, held against scripts/bundle-budget.json (audit P15).
// Fails when a route grows past its budget, so a change that pulls a heavy
// system into a page's first load is noticed when it is made rather than
// found later. Run after `npm run build`: node scripts/check-bundle-budget.mjs
// (add --write to print the current numbers as a starting budget).
import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const root = path.join(import.meta.dirname, "..");
const next = path.join(root, ".next");
const budgets = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "bundle-budget.json"), "utf8"));
const build = JSON.parse(fs.readFileSync(path.join(next, "build-manifest.json"), "utf8"));
const shared = [...(build.polyfillFiles ?? []), ...(build.rootMainFiles ?? [])];

const sizes = new Map();
// Attribute built files to the client references and entry groups that load
// them. These are manifest associations, not a complete list of the modules
// bundled inside the file (dependencies need not be client references).
const references = new Map();
function noteReference(file, kind, source) {
  if (typeof file !== "string" || !file.startsWith("static/") || !file.endsWith(".js")) return;
  if (!references.has(file)) references.set(file, { entries: new Set(), clients: new Set() });
  const name = source.replaceAll("\\", "/").replace(/^.*?\/(?:src|node_modules)\//, (prefix) => prefix.endsWith("/src/") ? "src/" : "node_modules/");
  references.get(file)[kind].add(name);
}

function describeReferences(file) {
  const reference = references.get(file);
  if (!reference) return;
  for (const kind of ["entries", "clients"]) {
    const names = [...reference[kind]].sort();
    if (!names.length) continue;
    const shown = names.slice(0, 12);
    console.log(`    ${kind} (${names.length}): ${shown.join(", ")}${names.length > shown.length ? ", …" : ""}`);
  }
}
function measure(file) {
  if (!sizes.has(file)) {
    const bytes = fs.readFileSync(path.join(next, file));
    sizes.set(file, { raw: bytes.length, gzip: gzipSync(bytes, { level: 9 }).length });
  }
  return sizes.get(file);
}

function routeFiles(page) {
  const manifest = path.join(next, "server", "app", `${page}_client-reference-manifest.js`);
  if (!fs.existsSync(manifest)) throw new Error(`No build manifest for ${page}: was the route renamed? Update scripts/bundle-budget.json.`);
  globalThis.__RSC_MANIFEST = {};
  // The manifest is a script that assigns itself to globalThis.__RSC_MANIFEST.
  new Function(fs.readFileSync(manifest, "utf8"))();
  const entry = Object.values(globalThis.__RSC_MANIFEST)[0];
  const js = new Set(shared);
  const css = new Set();
  for (const [source, files] of Object.entries(entry.entryJSFiles ?? {})) {
    for (const file of files) {
      js.add(file);
      noteReference(file, "entries", source);
    }
  }
  for (const [source, client] of Object.entries(entry.clientModules ?? {})) {
    for (const file of client.chunks ?? []) noteReference(file, "clients", source);
  }
  for (const files of Object.values(entry.entryCSSFiles ?? {})) for (const file of files) if (!file.inlined) css.add(file.path);
  return { js: [...js], css: [...css] };
}

const kib = (bytes) => Math.round(bytes / 102.4) / 10;
const write = process.argv.includes("--write");
const problems = [];
const current = {};
const jsByRoute = new Map();
for (const [page, budget] of Object.entries(budgets.routes)) {
  const { js, css } = routeFiles(page);
  jsByRoute.set(page, new Set(js));
  const sum = (files) => files.reduce((total, file) => total + measure(file).gzip, 0);
  const now = { jsGzipKiB: kib(sum(js)), cssGzipKiB: kib(sum(css)), scripts: js.length };
  current[page] = now;
  console.log(`${page}: ${now.scripts} scripts, ${now.jsGzipKiB} KiB JS gzip (budget ${budget.jsGzipKiB}), ${now.cssGzipKiB} KiB CSS gzip (budget ${budget.cssGzipKiB})`);
  if (now.jsGzipKiB > budget.jsGzipKiB) problems.push(`${page} loads ${now.jsGzipKiB} KiB of JS (gzip), over its ${budget.jsGzipKiB} KiB budget`);
  if (now.cssGzipKiB > budget.cssGzipKiB) problems.push(`${page} loads ${now.cssGzipKiB} KiB of CSS (gzip), over its ${budget.cssGzipKiB} KiB budget`);
}
if (write) console.log(JSON.stringify(current, null, 2));
if (problems.length) {
  // A shared first-load regression can affect every route. Report the actual
  // built chunks, not source-file size estimates, without changing the budget.
  const allFiles = new Map();
  for (const [page, files] of jsByRoute) {
    for (const file of files) {
      if (!allFiles.has(file)) allFiles.set(file, []);
      allFiles.get(file).push(page);
    }
  }
  const bySize = (a, b) => measure(b[0]).gzip - measure(a[0]).gzip || a[0].localeCompare(b[0]);
  const common = [...allFiles].filter(([, pages]) => pages.length === jsByRoute.size).sort(bySize);
  console.log(`Shared JS across all measured routes: ${kib(common.reduce((sum, [file]) => sum + measure(file).gzip, 0))} KiB gzip`);
  for (const [file] of common) {
    console.log(`  ${kib(measure(file).gzip)} KiB ${file}`);
    describeReferences(file);
  }
  for (const [page, files] of jsByRoute) {
    if (current[page].jsGzipKiB <= budgets.routes[page].jsGzipKiB) continue;
    const other = [...files].map((file) => [file, allFiles.get(file)]).filter(([, pages]) => pages.length !== jsByRoute.size).sort(bySize);
    console.log(`Largest non-common JS chunks for ${page}:`);
    for (const [file, pages] of other.slice(0, 5)) {
      console.log(`  ${kib(measure(file).gzip)} KiB ${file} (used by ${pages.length}/${jsByRoute.size} measured routes)`);
      describeReferences(file);
    }
  }
  for (const problem of problems) console.error(`budget: ${problem}`);
  console.error("If the growth is wanted, raise the budget in scripts/bundle-budget.json in the same change and say why.");
  process.exit(1);
}
