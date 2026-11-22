#!/usr/bin/env node
// Report literal UI translation keys missing from the Czech catalog.
// Dynamic keys and player/GM-authored text need a separate review.
//
// Usage:
//   npm run i18n:cs:ui-report
//   npm run i18n:cs:ui-check           # strict, opt-in until baseline is fixed
//   node scripts/audit-cs-ui-keys.mjs --scope=src/app/characters
//   node scripts/audit-cs-ui-keys.mjs --json
//   node scripts/audit-cs-ui-keys.mjs --self-test
import { readFileSync, readdirSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep, win32 } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import ts from "typescript";

export function literalKeys(source, filename = "component.tsx") {
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, filename.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
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


const CZECH_DIACRITICS = /[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/;
const DISPLAY_ATTRIBUTES = new Set(["title", "placeholder", "aria-label", "alt", "label", "description"]);

// Advisory only: many legitimate rulebook paragraphs and fixtures contain Czech
// prose. These findings are never used as an automatic CI failure or rewrite.
export function hardcodedCzechJsx(source, filename = "component.tsx") {
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const findings = [];
  function add(value, node, kind) {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized.length < 2 || normalized.length > 120 || !CZECH_DIACRITICS.test(normalized)) return;
    findings.push({
      kind, value: normalized,
      line: file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1,
    });
  }
  function visit(node) {
    if (ts.isJsxText(node)) {
      add(node.text, node, "text");
    } else if (ts.isJsxAttribute(node) && DISPLAY_ATTRIBUTES.has(node.name.text) &&
        node.initializer && ts.isStringLiteral(node.initializer)) {
      add(node.initializer.text, node, "attribute");
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return findings;
}

// JSON.parse silently overwrites duplicate keys; inspect the JSON syntax tree
// first, so two entries for one English source key cannot hide each other.
export function duplicateCatalogKeys(source) {
  const file = ts.parseJsonText("cs.json", source);
  const findings = [];
  function inspect(node, path = []) {
    if (ts.isObjectLiteralExpression(node)) {
      const seen = new Set();
      for (const property of node.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const key = property.name.text;
        if (seen.has(key)) {
          findings.push({
            key: [...path, key].join(" / "),
            line: file.getLineAndCharacterOfPosition(property.getStart(file)).line + 1,
          });
        }
        seen.add(key);
        inspect(property.initializer, [...path, key]);
      }
    } else if (ts.isArrayLiteralExpression(node)) {
      node.elements.forEach((element, index) => inspect(element, [...path, String(index)]));
    }
  }
  const statement = file.statements[0];
  if (statement && ts.isExpressionStatement(statement)) inspect(statement.expression);
  return findings;
}

// path.relative, unlike string checks for '/', works on Windows as well.
// Pass a path implementation in the self-test to verify win32 behavior on Unix.
export function isWithinDirectory(parent, candidate, pathApi = { relative, isAbsolute, sep }) {
  const rest = pathApi.relative(parent, candidate);
  return rest === "" || (rest !== ".." && !rest.startsWith(".." + pathApi.sep) && !pathApi.isAbsolute(rest));
}

export function auditableSourceFile(filename) {
  return /\.tsx?$/.test(filename) && !/\.(?:test|spec|stories)\.tsx?$/.test(filename);
}

function filesBelow(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((item) => {
    const path = join(directory, item.name);
    if (item.isDirectory()) {
      // Test fixtures and mocks often contain intentionally untranslated keys.
      return /^(?:__tests__|__fixtures__|__mocks__|fixtures)$/.test(item.name) ? [] : filesBelow(path);
    }
    return item.isFile() && auditableSourceFile(item.name) ? [path] : [];
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

  const jsx = hardcodedCzechJsx(
    '<main><button title="Přidat">Vytvořit</button><p>{t("Ready")}</p></main>',
  );
  assert.deepEqual(jsx.map((row) => row.value), ["Přidat", "Vytvořit"]);
  const duplicates = duplicateCatalogKeys('{"messages":{"Ready":"Ano","Ready":"Hotovo"}}');
  assert.equal(duplicates.length, 1);
  assert.equal(duplicates[0].key, "messages / Ready");
  assert.equal(auditableSourceFile("CharacterBuilder.tsx"), true);
  assert.equal(auditableSourceFile("character-logic.ts"), true);
  assert.equal(auditableSourceFile("character-logic.test.ts"), false);
  assert.equal(auditableSourceFile("Sheet.stories.tsx"), false);
  assert.equal(isWithinDirectory("/srv/app/src", "/srv/app/src/components"), true);
  assert.equal(isWithinDirectory("/srv/app/src", "/srv/app/src-other"), false);
  assert.equal(isWithinDirectory("C:\\game\\src", "C:\\game\\src\\components", win32), true);
  assert.equal(isWithinDirectory("C:\\game\\src", "C:\\game\\src-backup", win32), false);
  assert.equal(isWithinDirectory("C:\\game\\src", "D:\\outside", win32), false);
  console.log("Czech UI key scanner self-test passed.");
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  if (process.argv.includes("--self-test")) {
    selfTest();
  } else {
    const root = resolve(import.meta.dirname, "..");
    const catalogText = readFileSync(join(root, "src/lib/i18n/cs.json"), "utf8");
    const duplicateKeys = duplicateCatalogKeys(catalogText);
    const catalog = JSON.parse(catalogText);
    const defaultScopes = ["src/app/campaigns", "src/app/characters", "src/components"];
    const scopes = process.argv.filter((arg) => arg.startsWith("--scope="))
      .map((arg) => arg.slice("--scope=".length));
    const selected = scopes.length ? scopes : defaultScopes;
    const paths = selected.flatMap((scope) => {
      const absolute = resolve(root, scope);
      if (!isWithinDirectory(join(root, "src"), absolute)) {
        throw new Error("Scope must be inside the repository's src directory.");
      }
      return filesBelow(absolute);
    });
    let checked = 0;
    const missing = [];
    const jsxCandidates = [];
    for (const filename of [...new Set(paths)].sort()) {
      const entries = literalKeys(readFileSync(filename, "utf8"), filename);
      checked += entries.length;
      for (const entry of missingKeys(catalog, entries)) {
        missing.push({ ...entry, file: relative(root, filename) });
      }
      if (filename.endsWith(".tsx")) {
        for (const entry of hardcodedCzechJsx(readFileSync(filename, "utf8"), filename)) {
          jsxCandidates.push({ ...entry, file: relative(root, filename) });
        }
      }
    }
    missing.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
    const unique = new Set(missing.map((entry) => entry.kind + ":" + entry.value));
    if (process.argv.includes("--json")) {
      console.log(JSON.stringify({
        summary: { files: new Set(paths).size, checked, missingOccurrences: missing.length, uniqueMissingKeys: unique.size, duplicateKeys: duplicateKeys.length, jsxCandidates: jsxCandidates.length },
        missing, duplicateKeys, jsxCandidates,
      }, null, 2));
    } else {
      console.log(
        "Czech UI catalog audit: " + new Set(paths).size + " TS/TSX files; " +
        checked + " literal translation calls; " + missing.length +
        " missing occurrences (" + unique.size + " unique keys); " +
        duplicateKeys.length + " duplicate catalog keys; " +
        jsxCandidates.length + " possible hardcoded Czech JSX strings (advisory).",
      );
      for (const entry of missing.slice(0, 100)) {
        const label = entry.value.replaceAll("\0", " | ");
        console.log(entry.file + ":" + entry.line + " [" + entry.kind + "] " + label);
      }
      if (missing.length > 100) console.log("... and " + (missing.length - 100) + " further missing occurrences");
      for (const entry of duplicateKeys.slice(0, 30)) {
        console.log("cs.json:" + entry.line + " [duplicate] " + entry.key);
      }
      for (const entry of jsxCandidates.slice(0, 30)) {
        console.log(entry.file + ":" + entry.line + " [possible JSX " + entry.kind + "] " + entry.value);
      }
      if (jsxCandidates.length > 30) console.log("... and " + (jsxCandidates.length - 30) + " further JSX candidates; use --json");
    }
    if ((missing.length || duplicateKeys.length) && process.argv.includes("--check")) process.exitCode = 1;
  }
}
