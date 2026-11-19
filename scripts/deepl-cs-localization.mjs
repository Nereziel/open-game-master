#!/usr/bin/env node
// Run manually; never called by the web app. Requires a DeepL API key in the shell.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(await readFile(path.join(root, "src/lib/i18n/fr.json"), "utf8"));
const targetPath = path.join(root, "src/lib/i18n/cs.json");
const target = JSON.parse(await readFile(targetPath, "utf8"));
const args = process.argv.slice(2);
const flag = (name) => args.includes("--" + name);
const option = (name, fallback) => args.find((x) => x.startsWith("--" + name + "="))?.slice(name.length + 3) ?? fallback;
const batchSize = Math.max(1, Math.min(25, Number(option("batch", "12")) || 12));
const limit = Number(option("limit", "0")) || Infinity;
const apiKey = process.env.DEEPL_API_KEY || "";
// Legacy API Free keys end in :fx; override DEEPL_API_URL as required by your account.
const endpoint = process.env.DEEPL_API_URL ||
  (apiKey.endsWith(":fx") ? "https://api-free.deepl.com/v2/translate" : "https://api.deepl.com/v2/translate");

const work = Object.keys(source.messages).filter((key) => !(key in target.messages))
  .map((english) => ({ english, type: "message" }));
for (const [english, contexts] of Object.entries(source.contexts)) {
  for (const context of Object.keys(contexts)) {
    if (!(context in (target.contexts?.[english] ?? {}))) {
      work.push({ english, context, type: "context" });
    }
  }
}
const untranslatedPlurals = Object.keys(source.plurals).filter((key) => !(key in (target.plurals ?? {})));
const chars = work.reduce((n, item) => n + Array.from(item.english).length, 0);
console.log("Remaining UI strings: " + work.length + ", estimated source characters: " +
  chars.toLocaleString("en-US") + ", untranslated plural definitions: " + untranslatedPlurals.length);
const variables = (s) => (s.match(/\{[A-Za-z_]\w*\}/g) ?? []).sort().join(",");
const protectedParts = (s) => (s.match(/<[/!]?[A-Za-z][^>]*>|https?:\/\/[^\s)]+|\x60[^\x60]+\x60/g) ?? []).sort().join(",");
function verify(original, translation) {
  if (typeof translation !== "string" || !translation.trim()) throw new Error("Empty translated text");
  if (variables(original) !== variables(translation)) throw new Error("Changed placeholder: " + original.slice(0, 90));
  if (protectedParts(original) !== protectedParts(translation)) throw new Error("Changed markup/URL: " + original.slice(0, 90));
}
const escapeXml = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
const unescapeXml = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
const protectRegex = /\{[A-Za-z_]\w*\}|<\/?[A-Za-z][^>]*>|https?:\/\/[^\s<>]+|\x60[^\x60]+\x60|\r?\n/g;
// Ignore tags preserve literal placeholders and URLs during translation.
function protect(original) {
  let body = "<doc>", end = 0;
  for (const match of original.matchAll(protectRegex)) {
    body += escapeXml(original.slice(end, match.index));
    body += "<ph>" + escapeXml(match[0]) + "</ph>";
    end = match.index + match[0].length;
  }
  return body + escapeXml(original.slice(end)) + "</doc>";
}
function restore(original, translatedXml) {
  const match = translatedXml?.match?.(/<doc(?:\s[^>]*)?>([\s\S]*?)<\/doc>/i);
  if (!match) throw new Error("DeepL dropped XML markup");
  const interior = match[1].replace(/<ph(?:\s[^>]*)?>([\s\S]*?)<\/ph>/gi, (_, text) => text);
  if (/<\/?ph\b/i.test(interior)) throw new Error("Broken protected XML tag");
  const translation = (original.match(/^\s*/u)?.[0] ?? "") + unescapeXml(interior).trim() +
    (original.match(/\s*$/u)?.[0] ?? "");
  verify(original, translation);
  return translation;
}

if (flag("self-test")) {
  for (const sample of ["Cast {spell}!", "Read <strong>{name}</strong>.", "a & b",
    "Visit https://example.org/help", "First\nsecond", "normal text"]) {
    if (restore(sample, protect(sample)) !== sample) throw new Error("Round-trip failure: " + sample);
  }
  console.log("XML and placeholder preservation checks passed.");
} else if (flag("report")) {
  // Reporting never contacts the DeepL API.
} else if (flag("check")) {
  let failures = 0;
  for (const [english, translation] of Object.entries(target.messages)) {
    if (!(english in source.messages)) continue;
    try { verify(english, translation); } catch (error) { console.error(error.message); failures++; }
  }
  if (flag("require-complete")) failures += work.length + untranslatedPlurals.length;
  if (failures) process.exitCode = 1;
  console.log("Validation issues: " + failures);
} else {
  if (!apiKey) throw new Error("DEEPL_API_KEY is required. Never commit your API key.");
  if (untranslatedPlurals.length) {
    console.warn("DeepL cannot reliably generate Czech one/few/many plural forms; review them separately.");
  }
  const selected = work.slice(0, limit);
  for (let start = 0; start < selected.length; start += batchSize) {
    const batch = selected.slice(start, start + batchSize);
    let translations;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Authorization": "DeepL-Auth-Key " + apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            text: batch.map(({ english }) => protect(english)),
            source_lang: "EN", target_lang: "CS", tag_handling: "xml",
            ignore_tags: ["ph"], preserve_formatting: true, split_sentences: "nonewlines",
            context: "Fantasy tabletop role-playing game interface. Dungeon Master is Pán jeskyně, campaign is kampaň, spell is kouzlo, hit points are životy, class is povolání.",
          }),
          signal: AbortSignal.timeout(120000),
        });
        if (!res.ok) throw new Error("DeepL HTTP " + res.status + ": " + (await res.text()).slice(0, 200));
        const payload = await res.json();
        if (payload.translations?.length !== batch.length) throw new Error("Wrong translation count");
        translations = payload.translations.map((entry, index) => restore(batch[index].english, entry.text));
        break;
      } catch (error) {
        if (attempt === 2) throw error;
        console.warn("Retry " + (attempt + 1) + ": " + error.message);
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
      }
    }
    for (const [index, item] of batch.entries()) {
      if (item.type === "message") target.messages[item.english] = translations[index];
      else (target.contexts[item.english] ??= {})[item.context] = translations[index];
    }
    // Save each successful batch. Re-running continues from the first missing key.
    await writeFile(targetPath, JSON.stringify(target, null, 2) + "\n", "utf8");
    console.log("Saved " + Math.min(start + batch.length, selected.length) + "/" + selected.length);
  }
  console.log("Review Czech grammar and D&D terms, then run the catalog checks.");
}
