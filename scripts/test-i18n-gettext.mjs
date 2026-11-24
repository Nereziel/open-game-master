import assert from "node:assert/strict";
import fs from "node:fs";
import { register } from "node:module";

register("./lib/register-routes.mjs", import.meta.url);

const { translate, translatePlural, catalogInstalled, installCatalog } = await import("../src/lib/i18n/translate.ts");

// 0. Catalogs are installed, never eagerly imported by shared UI modules.
// The browser loads only the reader's selected catalog and name tables.
const translatedLocales = ["fr", "cs"];
for (const locale of translatedLocales) {
  assert.equal(catalogInstalled(locale), false);
  assert.equal(translate(locale, "Loading…"), "Loading…", "no catalog yet: English source");
}
for (const file of ["../src/lib/i18n/translate.ts", "../src/lib/messages-logic.ts", "../src/lib/locale.tsx"]) {
  const source = fs.readFileSync(new URL(file, import.meta.url), "utf8");
  assert.doesNotMatch(source, /^import[^;]*(?:fr\.json|cs\.json|cs-catalog-data\.ts)/m, `${file} imports a catalog into every page`);
}
const browserLoader = fs.readFileSync(new URL("../src/lib/i18n/catalog-loader.ts", import.meta.url), "utf8");
for (const entry of ["fr.json", "cs-catalog-data.ts"]) {
  assert.ok(browserLoader.includes(`import("./${entry}")`), `${entry} loads on demand`);
}
for (const file of ["../src/lib/request-locale.ts", "../src/app/layout.tsx", "../src/instrumentation.ts"]) {
  assert.match(fs.readFileSync(new URL(file, import.meta.url), "utf8"), /i18n\/server-catalogs/, `${file} installs the catalogs on the server`);
}
const serverCatalogs = fs.readFileSync(new URL("../src/lib/i18n/server-catalogs.ts", import.meta.url), "utf8");
for (const locale of translatedLocales) {
  assert.ok(serverCatalogs.includes(`import "./${locale}-catalog.ts"`), `server loads ${locale} catalog`);
}
const { catalogReady } = await import("../src/lib/i18n/catalog-loader.ts");
assert.equal(catalogReady("en"), true);
for (const locale of translatedLocales) {
  assert.equal(catalogReady(locale), false);
  assert.equal(translatePlural(locale, "{count} unknown widget", "{count} unknown widgets", { count: 0 }), "0 unknown widgets", "unloaded catalog uses English grammar");
  installCatalog(locale, JSON.parse(fs.readFileSync(new URL(`../src/lib/i18n/${locale}.json`, import.meta.url), "utf8")));
  assert.equal(catalogInstalled(locale), true);
  assert.equal(catalogReady(locale), false, "messages alone are not the complete display catalog");
}
await import("../src/lib/i18n/server-catalogs.ts");
for (const locale of translatedLocales) assert.equal(catalogReady(locale), true);

// Check the shared UI does not need to import the extra authored text catalog.
assert.equal(translate("cs", "Language"), "Jazyk");

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

// Czech authored subclass prose is an additional exact-key catalog.
const authoredText = JSON.parse(fs.readFileSync(new URL("../src/lib/i18n/authored-subclass-text-cs.json", import.meta.url), "utf8"));
for (const [key, value] of Object.entries(authoredText)) {
  assert.ok(typeof value === "string" && value.trim(), `Empty authored translation: ${key}`);
  assert.deepEqual(varsOf(value), varsOf(key), `Authored placeholder mismatch: ${key}`);
}

const { TABLE_LANGUAGE_HELP } = await import("../src/lib/schemas/game-settings-options.ts");
assert.equal(translate("en", TABLE_LANGUAGE_HELP), TABLE_LANGUAGE_HELP);
for (const [locale, catalog] of [["fr", frCatalog], ["cs", csCatalog]]) {
  assert.ok(catalog.messages[TABLE_LANGUAGE_HELP], `${locale}: missing table language help`);
  assert.equal(translate(locale, TABLE_LANGUAGE_HELP), catalog.messages[TABLE_LANGUAGE_HELP]);
}
assert.equal(translatePlural("cs", "another skill", "{count} other skills", { count: 2 }), "2 další dovednosti");
assert.equal(translatePlural("cs", "another skill", "{count} other skills", { count: 5 }), "5 dalších dovedností");

// Admin language labels and model explanations are UI translations, not
// model identifiers. Interpolation must preserve the operator's model name.
const adminModel = "Xenova/multilingual-e5-small";
for (const [locale, expectedLabel] of [["en", "Server language"], ["fr", "Langue du serveur"], ["cs", "Jazyk serveru"]]) {
  assert.equal(translate(locale, "Server language"), expectedLabel);
  for (const key of [
    "Memory search reads with {model}, set by EMBEDDING_MODEL in .env.server. Remove that line to let the language choose.",
    "Memory search reads with {model}, which reads English.",
    "Memory search reads with {model}, which reads every table language.",
  ]) {
    const message = translate(locale, key, { model: adminModel });
    assert.ok(message.includes(adminModel), locale);
    assert.ok(!message.includes("{model}"), locale);
    if (locale !== "en") assert.notEqual(message, translate("en", key, { model: adminModel }));
  }
}

// Timeline UI words are independent of stored calendar and canon values.
const { CANON_STATES } = await import("../src/lib/worldforge/model.ts");
const timelineSource = fs.readFileSync(new URL("../src/app/workshop/world/TimelineView.tsx", import.meta.url), "utf8");
const timelineKeys = [...new Set([...timelineSource.matchAll(/\bt\("([^"]+)"/g)].map((match) => match[1]))];
for (const [locale, catalog] of [["fr", frCatalog], ["cs", csCatalog]]) {
  for (const key of timelineKeys) assert.ok(catalog.messages[key], locale + ": missing timeline label " + key);
  for (const state of CANON_STATES) {
    assert.ok(catalog.contexts[state]?.["world.canon"], locale + ": missing canon label " + state);
    assert.equal(translate(locale, state, { context: "world.canon" }), catalog.contexts[state]["world.canon"]);
  }
  const name = "Tide of Ash";
  assert.ok(translate(locale, "Remove {name}?", { name }).includes(name));
  assert.notEqual(translate(locale, "Remove {name}?", { name }), translate("en", "Remove {name}?", { name }));
}

const { agoLabel } = await import("../src/app/home/types.ts");
const now = Date.parse("2026-01-01T12:00:00Z");
const createdAt = "2026-01-01T11:55:00Z";
assert.equal(agoLabel((key, vars) => translate("en", key, vars), createdAt, now), "5 minutes ago");
for (const [locale, catalog] of [["fr", frCatalog], ["cs", csCatalog]]) {
  const label = agoLabel((key, vars) => translate(locale, key, vars), createdAt, now);
  assert.equal(label, catalog.messages["{count} minutes ago"].replace("{count}", "5"));
  assert.notEqual(label, "5 minutes ago");
}

// Curated voice names are presentation only; unknown backend labels and IDs
// remain exactly as the backend sent them.
const { TTS_VOICES, localizedVoiceLabel, voicesFirstIn, NARRATOR_DEFAULTS, narratorVoiceFor } = await import("../src/lib/tts-voices.ts");
const { TABLE_LANGUAGE_NAMES } = await import("../src/lib/schemas/game-settings-options.ts");
const voicesBefore = structuredClone(TTS_VOICES);
for (const locale of ["en", "fr", "cs"]) {
  const t = (key, vars) => translate(locale, key, vars);
  for (const voice of TTS_VOICES) {
    const label = localizedVoiceLabel(t, voice);
    assert.equal(label, t(voice.label));
    assert.ok(label.startsWith(voice.label.split(" (")[0] + " ("));
    if (locale !== "en") assert.notEqual(label, voice.label);
    assert.equal(localizedVoiceLabel(t, { ...voice, label: "My custom voice" }), "My custom voice");
    assert.equal(localizedVoiceLabel(t, { id: "custom-id", label: voice.label }), voice.label);
  }
  const catalog = locale === "cs" ? csCatalog : frCatalog;
  for (const { english } of Object.values(TABLE_LANGUAGE_NAMES)) {
    if (locale !== "en") assert.ok(catalog.contexts[english]?.["table.language"], locale + ": " + english);
  }
  const language = t("Czech", { context: "table.language" });
  const warning = t("Kokoro has no {language} voice, so the narration is read by a voice of another language.", { language });
  assert.ok(warning.includes(language));
  assert.ok(!warning.includes("{language}"));
  assert.equal(NARRATOR_DEFAULTS.czech, undefined);
  assert.equal(narratorVoiceFor("czech", "af_heart", false), "af_heart");
  assert.equal(narratorVoiceFor("czech", "alloy", true), "alloy");
  assert.equal(voicesFirstIn("french", TTS_VOICES)[0].id, "ff_siwis");
}
assert.deepEqual(TTS_VOICES, voicesBefore);

// Published trait selection uses translated labels only. The existing
// publishedTraits and withTrait functions still decide the copied rules.
const { publishedTraits, withTrait } = await import("../src/lib/workshop/species-traits.ts");
const { publishedTraitChoices, publishedTraitMatches } = await import("../src/lib/workshop/species-trait-display.ts");
const dragonborn = JSON.parse(fs.readFileSync(new URL("./fixtures/srd-race-rows.json", import.meta.url), "utf8")).rows.find((row) => row.slug === "dragonborn");
const traitRows = [{ name: dragonborn.name, slug: dragonborn.slug, source: "open5e", documentSlug: dragonborn.documentSlug, traits: dragonborn.data.traits }];
const canonicalTraits = publishedTraits(traitRows);
const canonicalAncestry = canonicalTraits.find((trait) => trait.name === "Draconic Ancestry");
assert.ok(canonicalAncestry);
for (const [locale, label, from, query] of [
  ["en", "Draconic Ancestry", "Dragonborn", "Draconic"],
  ["fr", "Ascendance draconique", "Drakéide", "drakeide"],
  ["cs", "Dračí původ", "Drakorozený", "draci puvod"],
]) {
  const choices = publishedTraitChoices(traitRows, locale);
  assert.deepEqual(choices.map((choice) => choice.trait), canonicalTraits);
  const choice = choices.find(({ trait }) => trait.name === "Draconic Ancestry");
  assert.equal(choice.label, label);
  assert.deepEqual(choice.fromLabels, [from]);
  assert.ok(publishedTraitMatches(choice, query));
  assert.ok(publishedTraitMatches(choice, "Draconic Ancestry"));
  assert.ok(publishedTraitMatches(choice, "Dragonborn"));
  assert.ok(!publishedTraitMatches(choice, "nonexistent"));
  assert.equal(withTrait("", choice.trait), withTrait("", canonicalAncestry));
  const custom = { ...traitRows[0], source: "homebrew", documentSlug: "custom" };
  const foreign = { ...traitRows[0], documentSlug: "toh" };
  for (const row of [custom, foreign, { ...traitRows[0], source: undefined }]) {
    const unchanged = publishedTraitChoices([row], locale).find(({ trait }) => trait.name === "Draconic Ancestry");
    assert.equal(unchanged.label, "Draconic Ancestry");
  }
  const collision = publishedTraitChoices([...traitRows, custom], locale).find(({ trait }) => trait.name === "Draconic Ancestry");
  assert.equal(collision.label, "Draconic Ancestry", "ambiguous identical custom trait keeps its canonical heading");
  assert.deepEqual(collision.fromLabels, ["Dragonborn"]);
}

console.log("test-i18n-gettext: all assertions and catalog placeholder checks passed");
