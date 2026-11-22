#!/usr/bin/env node
// Translate the installed Open5e item pack to Czech, without editing it.
// Run explicitly, with a translation API key: npm run i18n:cs:items -- --generate
// --report and --check never use the API. Resume-safe across interruptions.
import Database from "better-sqlite3-multiple-ciphers";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { externalItemKey, externalItemSource, sameRuleNumbers } from "../src/lib/content/external-item-cs-logic.ts";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dbPath = process.env.CONTENT_DB_PATH || path.join(root, "data/content/open5e.sqlite");
const output = process.env.CONTENT_ITEMS_CS_PATH || path.join(root, "data/content/items-cs.json");
const args = process.argv.slice(2);
const flag = (name) => args.includes("--" + name);
const option = (name, fallback) => args.find((arg) => arg.startsWith("--" + name + "="))?.slice(name.length + 3) ?? fallback;
const limit = Math.max(0, Number(option("limit", "0")) || 0) || Infinity;
const apiKey = process.env.DEEPL_API_KEY || "";
const endpoint = process.env.DEEPL_API_URL ||
  (apiKey.endsWith(":fx") ? "https://api-free.deepl.com/v2/translate" : "https://api.deepl.com/v2/translate");

if (!existsSync(dbPath)) throw Error("Content pack missing: " + dbPath + ". Run npm run setup first.");
const db = new Database(dbPath, { readonly: true, fileMustExist: true });
const rows = db.prepare("SELECT slug, name, document_slug, data_json FROM items ORDER BY document_slug, slug").all();
db.close();

const catalog = existsSync(output) ? JSON.parse(readFileSync(output, "utf8")) : { version: 1, entries: {} };
if (!catalog || catalog.version !== 1 || !catalog.entries || typeof catalog.entries !== "object") {
  throw Error("Invalid translation catalog version; fix or back up " + output);
}
const hashOf = (text) => createHash("sha256").update(text).digest("hex");
const pending = [];
for (const row of rows) {
  const data = JSON.parse(row.data_json);
  const source = externalItemSource(data);
  if (!source) continue;
  const hash = hashOf(source);
  const key = externalItemKey(row.document_slug, row.slug);
  if (catalog.entries[key]?.hash !== hash || !catalog.entries[key]?.cs) {
    pending.push({ key, name: row.name, document: row.document_slug, source, hash });
  }
}
console.log(JSON.stringify({ packItems: rows.length, withEnglishDescriptions: rows.length - rows.filter(row => !externalItemSource(JSON.parse(row.data_json))).length, translated: Object.keys(catalog.entries).length, remaining: pending.length }, null, 2));
if (flag("report")) process.exit(0);
if (flag("check")) process.exit(pending.length ? 1 : 0);
if (!flag("generate")) throw Error("Use --report, --check or --generate explicitly.");
if (!apiKey) throw Error("DEEPL_API_KEY required for --generate; never commit it.");

function save() {
  mkdirSync(path.dirname(output), { recursive: true });
  const tmp = output + ".tmp";
  writeFileSync(tmp, JSON.stringify(catalog, null, 2) + "\n");
  renameSync(tmp, output);
}
const placeholders = (text) => [...text.matchAll(/\{[A-Za-z_]\w*\}|https?:\/\/\S+|`[^`]+`/g)].map(m => m[0]).sort().join("|");
function valid(source, translated) {
  return typeof translated === "string" && translated.trim() &&
    translated.trim() !== source.trim() &&
    sameRuleNumbers(source, translated) &&
    placeholders(source) === placeholders(translated);
}
async function translate(source) {
  // Source may exceed DeepL's per-text limit. Split only at paragraphs,
  // preserving all paragraphs and their rules; never summarize.
  const pieces = [];
  let current = "";
  for (const para of source.split(/(\n\n+)/)) {
    if (current && current.length + para.length > 3500) {
      pieces.push(current); current = "";
    }
    current += para;
  }
  if (current) pieces.push(current);
  const translated = [];
  for (const piece of pieces) {
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { Authorization: "DeepL-Auth-Key " + apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({ text: [piece], source_lang: "EN", target_lang: "CS", preserve_formatting: true }),
          signal: AbortSignal.timeout(90_000),
        });
        if (!response.ok) throw Error("DeepL HTTP " + response.status + ": " + (await response.text()).slice(0, 200));
        const body = await response.json();
        const result = body.translations?.[0]?.text;
        if (!valid(piece, result)) throw Error("Translation changed numbers, placeholders, or is empty");
        translated.push(result);
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError) throw lastError;
  }
  const combined = translated.join("");
  if (!valid(source, combined)) throw Error("Combined translation failed rules validation");
  return combined;
}

let completed = 0;
for (const item of pending.slice(0, limit)) {
  try {
    const cs = await translate(item.source);
    catalog.entries[item.key] = { hash: item.hash, cs };
    save();
    completed++;
    console.log("Translated " + completed + ": " + item.document + " / " + item.name);
  } catch (error) {
    console.error("Skipped " + item.key + ": " + (error instanceof Error ? error.message : error));
  }
}
console.log("Finished " + completed + "/" + Math.min(limit, pending.length) + " requested items. Run --check to verify completeness.");
