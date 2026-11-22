#!/usr/bin/env node
// Report literal UI translation keys missing from the Czech catalog.
// Dynamic keys and player/GM-authored text need a separate review.
//
// Usage:
//   npm run i18n:cs:ui-report
//   npm run i18n:cs:ui-check           # strict, opt-in until baseline is fixed
//   node scripts/audit-cs-ui-keys.mjs --scope=src/app/characters
//   node scripts/audit-cs-ui-keys.mjs --self-test
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import ts from "typescript";

export function literalKeys(source, filename = "component.tsx") {
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const results = [];
  const literal = (node) =>
    node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
      ? node.text
      : null;

  function visit(node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const name = node.expression.text;
      const args = node.arguments;
      if (name === "t" && args.length) {
        const value = literal(args[0]);
        if (value !== null) {
          const options = args[1];
          const property = options && ts.isObjectLiteralExpression(options)
            ? options.properties.find((entry) =>
                ts.isPropertyAssignment(entry) &&
                (ts.isIdentifier(entry.name) || ts.isStringLiteral(entry.name)) &&
                entry.name.text === "context")
            : undefined;
          const context = property && ts.isPropertyAssignment(property)
            ? literal(property.initializer)
            : null;
          results.push({ kind: "message", value, context, line: file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1 });
        }
      }
      if (name === "tp" && args.length >= 2) {
        const one = literal(args[0]);
        const other = literal(args[1]);
        if (one !== null && other !== null) {
          results.push({ kind: "plural", value: one + "\0" + other, context: null, line: file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1 });
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return results;
}

export function missingKeys(catalog, entries) {
  const messages = catalog.messages ?? {};
  const contexts = catalog.contexts ?? {};
  const plurals = catalog.plurals ?? {};
  return entries.filter((entry) => {
    if (entry.kind === "plural") {
      return !Array.isArray(plurals[entry.value]) ||
        !plurals[entry.value].every((form) => typeof form === "string" && form.trim());
    }
    if (entry.value === "") return false;
    if (entry.context && typeof contexts[entry.value]?.[entry.context] === "string" &&
        contexts[entry.value][entry.context].trim()) return false;
    return typeof messages[entry.value] !== "string" || !messages[entry.value].trim();
  });
}

function filesBelow(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((item) => {
    const path = join(directory, item.name);
    return item.isDirectory() ? filesBelow(path) : item.isFile() && path.endsWith(".tsx") ? [path] : [];
  });
}

function selfTest() {
  const source = [
    'const ok = t("Ready");',
    'const note = t("Ready", { context: "menu.ready" });',
    'const plural = tp("One slot", "Many slots", { count });',
    'const other = t("Literal");',
    'const dynamic = t(variable);',
    '// t("Commented out")',
  ].join("\n");
  const rows = literalKeys(source);
  assert.deepEqual(rows.map((row) => row.value), ["Ready", "Ready", "One slot\0Many slots", "Literal"]);
  assert.equal(rows[1].context, "menu.ready");
  const missing = missingKeys({
    messages: { Ready: "Připraveno", Literal: "Doslovný text" },
    contexts: { Ready: { "menu.ready": "Připraveno" } },
    plurals: { "One slot\0Many slots": ["Jedna pozice", "Dvě pozice", "Pozic"] },
  }, rows);
  assert.deepEqual(missing, []);
  assert.equal(missingKeys({ messages: {} }, rows).length, 4);
  console.log("Czech UI key scanner self-test passed.");
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  if (process.argv.includes("--self-test")) {
    selfTest();
  } else {
    const root = resolve(import.meta.dirname, "..");
    const catalog = JSON.parse(readFileSync(join(root, "src/lib/i18n/cs.json"), "utf8"));
    const defaultScopes = ["src/app/campaigns", "src/app/characters", "src/components"];
    const scopes = process.argv.filter((arg) => arg.startsWith("--scope="))
      .map((arg) => arg.slice("--scope=".length));
    const selected = scopes.length ? scopes : defaultScopes;
    const paths = selected.flatMap((scope) => {
      const absolute = resolve(root, scope);
      if (!absolute.startsWith(root + "/") || !absolute.includes("/src/")) {
        throw new Error("Scope must be inside the repository's src directory.");
      }
      return filesBelow(absolute);
    });
    let checked = 0;
    const missing = [];
    for (const filename of [...new Set(paths)].sort()) {
      const entries = literalKeys(readFileSync(filename, "utf8"), filename);
      checked += entries.length;
      for (const entry of missingKeys(catalog, entries)) {
        missing.push({ ...entry, file: relative(root, filename) });
      }
    }
    missing.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
    const unique = new Set(missing.map((entry) => entry.kind + ":" + entry.value));
    console.log(
      "Czech UI catalog audit: " + paths.length + " TSX files; " +
      checked + " literal translation calls; " + missing.length +
      " missing occurrences (" + unique.size + " unique keys).",
    );
    for (const entry of missing.slice(0, 100)) {
      const label = entry.value.replaceAll("\0", " | ");
      console.log(entry.file + ":" + entry.line + " [" + entry.kind + "] " + label);
    }
    if (missing.length > 100) console.log("... and " + (missing.length - 100) + " further occurrences");
    if (missing.length && process.argv.includes("--check")) process.exitCode = 1;
  }
}
