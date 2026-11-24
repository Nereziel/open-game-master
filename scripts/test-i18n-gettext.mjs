import assert from "node:assert/strict";
import fs from "node:fs";
import { register } from "node:module";

register("./lib/register-routes.mjs", import.meta.url);

const { translate, translatePlural, catalogInstalled, installCatalog } = await import("../src/lib/i18n/translate.ts");

// 0. The catalog is installed, never imported by the translator: imported, its
// 1 MB rode in every page's first load (scripts/bundle-budget.json). Until it
// is in, French reads English; the server's modules install it, a browser
// fetches it as its own chunk.
assert.equal(catalogInstalled("fr"), false);
assert.equal(translate("fr", "Loading…"), "Loading…", "no catalog yet: the English source");
for (const file of ["../src/lib/i18n/translate.ts", "../src/lib/messages-logic.ts", "../src/lib/locale.tsx"]) {
  const source = fs.readFileSync(new URL(file, import.meta.url), "utf8");
  assert.doesNotMatch(source, /^import[^;]*fr\.json/m, `${file} imports the catalog into every page`);
}
assert.match(fs.readFileSync(new URL("../src/lib/i18n/catalog-loader.ts", import.meta.url), "utf8"), /import\("\.\/fr\.json"\)/, "the browser fetches the catalog on demand");
for (const file of ["../src/lib/request-locale.ts", "../src/app/layout.tsx", "../src/instrumentation.ts"]) {
  assert.match(fs.readFileSync(new URL(file, import.meta.url), "utf8"), /i18n\/server-catalogs/, `${file} installs the catalogs on the server`);
}
const serverCatalogs = fs.readFileSync(new URL("../src/lib/i18n/server-catalogs.ts", import.meta.url), "utf8");
for (const locale of ["fr", "cs"]) {
  assert.ok(serverCatalogs.includes(`import "./${locale}-catalog.ts"`), `server loads ${locale} catalog`);
}
const { catalogReady } = await import("../src/lib/i18n/catalog-loader.ts");
assert.equal(catalogReady("en"), true);
assert.equal(catalogReady("fr"), false);
assert.equal(translatePlural("fr", "{count} unknown widget", "{count} unknown widgets", { count: 0 }), "0 unknown widgets", "unloaded catalog uses English grammar");
installCatalog("fr", JSON.parse(fs.readFileSync(new URL("../src/lib/i18n/fr.json", import.meta.url), "utf8")));
assert.equal(catalogInstalled("fr"), true);
assert.equal(catalogReady("fr"), false, "messages alone are not the complete display catalog");
await import("../src/lib/i18n/fr-catalog.ts");
assert.equal(catalogReady("fr"), true);

// The generated official-name inventory must describe its actual tables.
const { FR_NAMES_BY_TABLE, FR_NAME_COUNTS } = await import("../src/lib/content/names-fr.ts");
assert.deepEqual(FR_NAME_COUNTS, Object.fromEntries(Object.entries(FR_NAMES_BY_TABLE).map(([table, entries]) => [table, Object.keys(entries).length])));
const { localeFromAcceptLanguage, localeOfServerLanguage, resolveLocale, resolveRequestLocale, resolveApiLocale } = await import("../src/lib/i18n/locale.ts");
const frCatalog = JSON.parse(fs.readFileSync(new URL("../src/lib/i18n/fr.json", import.meta.url), "utf8"));

// JSON.parse keeps the last of two equal keys without a word, so a key that
// two branches each add merges cleanly and one translation silently wins.
// Walk the text itself: within each object every key is said once.
function assertUniqueCatalogKeys(locale) {
  const text = fs.readFileSync(new URL(`../src/lib/i18n/${locale}.json`, import.meta.url), "utf8");
  const seen = [new Set()];
  const repeated = [];
  const token = /"(?:[^"\\]|\\.)*"(\s*:)?|[{}]/g;
  for (let m; (m = token.exec(text)); ) {
    if (m[0] === "{") seen.push(new Set());
    else if (m[0] === "}") seen.pop();
    else if (m[1]) {
      const key = JSON.parse(m[0].replace(/\s*:$/, ""));
      const keys = seen[seen.length - 1];
      if (keys.has(key)) repeated.push(key);
      keys.add(key);
    }
  }
  assert.deepEqual(repeated, [], `${locale}.json says each key once within its object`);
}

// 1. English returns the source string verbatim with interpolation
assert.equal(translate("en", "Loading…"), "Loading…");
assert.equal(translate("en", "Level {level}", { level: 5 }), "Level 5");

// 2. French resolves from fr.json catalog and falls back to English for unknown strings
assert.equal(translate("fr", "Loading…"), "Chargement…");
assert.equal(translate("fr", "Some brand new untranslated UI string"), "Some brand new untranslated UI string");

// 3. Context disambiguation resolves collisions cleanly
assert.equal(translate("fr", "On"), "Activé");
assert.equal(translate("fr", "On", { context: "workshop.homebrew.spellMore.on" }), "Sur");

// 4. Pluralization follows EN (count === 1) vs FR (count <= 1)
assert.equal(translatePlural("en", "{count} round", "{count} rounds", { count: 0 }), "0 rounds");
assert.equal(translatePlural("en", "{count} round", "{count} rounds", { count: 1 }), "1 round");
assert.equal(translatePlural("fr", "{count} day", "{count} days", { count: 0 }), "0 jour");
assert.equal(translatePlural("fr", "{count} day", "{count} days", { count: 2 }), "2 jours");
for (const locale of ["en", "fr", "cs"]) {
  for (const count of [0, 1, 2, 4, 5]) {
    assert.equal(translatePlural(locale, "{count} unknown widget", "{count} unknown widgets", { count }), count === 1 ? "1 unknown widget" : `${count} unknown widgets`);
  }
}

// 5. Server-side locale resolution priority: saved > cookie > Accept-Language > en
assert.equal(resolveLocale({ savedLocale: "fr", cookieHeader: "odm_locale=en", acceptLanguage: "en-US" }), "fr");
assert.equal(resolveLocale({ cookieHeader: "foo=1; odm_locale=fr", acceptLanguage: "en-US" }), "fr");
assert.equal(resolveLocale({ acceptLanguage: "fr-CA,fr;q=0.9,en;q=0.8" }), "fr");
assert.equal(localeFromAcceptLanguage("de-DE,es;q=0.8"), "en");
// A French server opens in French for a reader who chose nothing; their own
// choice still wins, and an English server (every server's default) leaves
// it to the browser.
assert.equal(localeOfServerLanguage("french"), "fr");
assert.equal(localeOfServerLanguage("english"), null);
assert.equal(localeOfServerLanguage("italian"), null);
assert.equal(resolveLocale({ serverLocale: "fr", acceptLanguage: "en-US" }), "fr");
assert.equal(resolveLocale({ cookieHeader: "odm_locale=en", serverLocale: "fr", acceptLanguage: "fr-FR" }), "en");
assert.equal(resolveLocale({ serverLocale: localeOfServerLanguage("english"), acceptLanguage: "fr-FR" }), "fr");
assert.equal(localeFromAcceptLanguage("en-US;q=0.5,fr;q=0.9"), "fr");
assert.equal(localeFromAcceptLanguage("fr;q=0,en;q=0.8"), "en");
assert.equal(
  resolveRequestLocale(
    new Request("http://localhost/", {
      headers: { cookie: "odm_locale=invalid", "accept-language": "fr-FR,fr;q=0.9" },
    }),
  ),
  "fr",
);
assert.equal(translate("fr", "On", { context: "unknown.context" }), "Activé");

// The table translator shares the server language registry, independently of UI preferences.
const { tableTranslator } = await import("../src/lib/messages-logic.ts");
await import("../src/lib/i18n/cs-catalog.ts");
const csCatalog = JSON.parse(fs.readFileSync(new URL("../src/lib/i18n/cs.json", import.meta.url), "utf8"));
for (const [language, locale, catalog] of [["french", "fr", frCatalog], ["czech", "cs", csCatalog]]) {
  const t = tableTranslator(language);
  assert.equal(localeOfServerLanguage(language), locale);
  for (const [key, vars] of [["Session {n} begins.", { n: 7 }], ["Session {n} ends.", { n: 7 }], ["Raw XP", undefined], ["until {who}'s turn", { who: "Kael" }]]) {
    assert.ok(catalog.messages[key], `${locale} has the table message: ${key}`);
    assert.equal(t(key, vars), translate(locale, key, vars));
    assert.notEqual(t(key, vars), translate("en", key, vars));
  }
  assert.equal(t("Unknown table message {n}", { n: 7 }), "Unknown table message 7");
}
for (const language of ["english", "italian", "german", undefined, null]) {
  assert.equal(tableTranslator(language)("Session {n} begins.", { n: 7 }), "Session 7 begins.");
}

// API requests follow explicit header > cookie > server default > browser.
const apiRequest = (headers) => new Request("http://localhost/", { headers });
assert.equal(resolveApiLocale(apiRequest({ "accept-language": "en" }), "cs"), "cs");
assert.equal(resolveApiLocale(apiRequest({ cookie: "odm_locale=fr", "accept-language": "en" }), "cs"), "fr");
assert.equal(resolveApiLocale(apiRequest({ "x-odm-locale": "en", cookie: "odm_locale=fr" }), "cs"), "en");
assert.equal(resolveApiLocale(apiRequest({ "x-odm-locale": "unknown", cookie: "odm_locale=%zz" }), "cs"), "cs");

const { glossaryFor, glossaryText, CONDITION_BLURBS, SPELL_SCHOOL_BLURBS, WEAPON_PROPERTY_BLURBS, DAMAGE_TYPE_BLURBS } = await import("../src/lib/help/terms.ts");
for (const table of [CONDITION_BLURBS, SPELL_SCHOOL_BLURBS, WEAPON_PROPERTY_BLURBS, DAMAGE_TYPE_BLURBS]) {
  const entries = glossaryFor(Object.keys(table), table);
  const original = structuredClone(entries);
  for (const [locale, catalog] of [["fr", frCatalog], ["cs", csCatalog]]) {
    for (const entry of entries) {
      const label = catalog.contexts[entry.optionKey]?.["glossary.option"];
      assert.ok(label && catalog.messages[entry.blurb], `${locale}: ${entry.name}`);
      assert.equal(glossaryText([entry], locale), `${label}: ${catalog.messages[entry.blurb]}`);
    }
  }
  assert.deepEqual(entries, original);
}
assert.equal(glossaryText([{ name: "light", blurb: "Custom text" }], "cs"), "light: Custom text");
assert.equal(glossaryText(glossaryFor(["Light"], WEAPON_PROPERTY_BLURBS), "cs").split(":")[0], "Lehká");
assert.equal(glossaryText(glossaryFor(["loading"], WEAPON_PROPERTY_BLURBS), "cs").split(":")[0], "Nabíjecí");

// 6. Every registered translated catalog uses the same integrity checks.
// The upstream English-only {article} slot may be omitted by a translation.
const varsOf = (s) =>
  [...s.matchAll(/\{([a-zA-Z0-9_]+)\}/g)]
    .map((m) => m[1])
    .filter((v) => v !== "article")
    .sort();
const { LOCALE_METADATA } = await import("../src/lib/i18n/locale.ts");
const pluralArity = { fr: 2, cs: 3 };
for (const locale of Object.keys(LOCALE_METADATA).filter((id) => id !== "en")) {
  assertUniqueCatalogKeys(locale);
  const catalog = JSON.parse(fs.readFileSync(new URL(`../src/lib/i18n/${locale}.json`, import.meta.url), "utf8"));
  const check = (key, value, location) => {
    assert.equal(typeof value, "string", `${locale}: expected string at ${location}: ${key}`);
    if (key) assert.ok(value.trim(), `${locale}: empty translation at ${location}: ${key}`);
    assert.deepEqual(varsOf(value), varsOf(key), `${locale}: placeholder mismatch at ${location}: ${key}`);
  };
  for (const [key, value] of Object.entries(catalog.messages)) check(key, value, "messages");
  for (const [key, contexts] of Object.entries(catalog.contexts)) {
    for (const [context, value] of Object.entries(contexts)) check(key, value, `contexts[${context}]`);
  }
  for (const [key, forms] of Object.entries(catalog.plurals)) {
    assert.ok(Array.isArray(forms) && forms.length === pluralArity[locale], `${locale}: invalid plural tuple: ${key}`);
    const parts = key.split("\0");
    assert.equal(parts.length, 2, `${locale}: invalid plural key`);
    forms.forEach((value, index) => check(parts[index === 0 ? 0 : 1], value, `plural[${index}]`));
  }
}

const { TABLE_LANGUAGE_HELP } = await import("../src/lib/schemas/game-settings-options.ts");
assert.equal(translate("en", TABLE_LANGUAGE_HELP), TABLE_LANGUAGE_HELP);
for (const [locale, catalog] of [["fr", frCatalog], ["cs", csCatalog]]) {
  assert.ok(catalog.messages[TABLE_LANGUAGE_HELP], `${locale}: missing table language help`);
  assert.equal(translate(locale, TABLE_LANGUAGE_HELP), catalog.messages[TABLE_LANGUAGE_HELP]);
}
assert.equal(translatePlural("cs", "another skill", "{count} other skills", { count: 2 }), "2 další dovednosti");
assert.equal(translatePlural("cs", "another skill", "{count} other skills", { count: 5 }), "5 dalších dovedností");

console.log("test-i18n-gettext: all assertions and catalog placeholder checks passed");
