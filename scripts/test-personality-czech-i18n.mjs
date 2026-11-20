// Regression: all personality inputs and gender choices shown to Czech players
// must use localized labels while preserving the values saved on sheets.
import assert from "node:assert/strict";
import fs from "node:fs";
import { genderLabel, storedGender } from "../src/lib/gender.ts";
import { installCatalog, translate } from "../src/lib/i18n/translate.ts";

const cs = JSON.parse(fs.readFileSync(new URL("../src/lib/i18n/cs.json", import.meta.url), "utf8"));
const fr = JSON.parse(fs.readFileSync(new URL("../src/lib/i18n/fr.json", import.meta.url), "utf8"));
installCatalog("cs", cs);
installCatalog("fr", fr);

const terms = [
  "Personality (optional)",
  "A trait, an ideal, a bond and a flaw: four short lines the GM plays your hero by. Pick from {source} or write your own. Leave any of them blank. The party can read these, and you can change them later from your character sheet.",
  "the suggestions for {background}",
  "the suggestions",
  "Personality trait",
  "A habit or manner people notice about them.",
  "Pick one, or write your own",
  "Ideal",
  "What they believe in and strive for.",
  "Bond",
  "A person, place or promise they hold dear.",
  "Flaw",
  "A weakness others could use against them.",
  "Suggestions",
  "Suggested for {background}",
  "Write my own",
  "Leave it blank",
  "{field}, in your own words",
];
for (const key of terms) {
  assert.ok(cs.messages[key]?.trim(), "Missing Czech personality translation: " + key);
  assert.ok(fr.messages[key]?.trim(), "Missing French personality translation: " + key);
  assert.notEqual(translate("cs", key), key, "Untranslated Czech personality field: " + key);
}
assert.equal(translate("en", "Personality (optional)"), "Personality (optional)");
assert.equal(translate("cs", "Personality (optional)"), "Osobnost (volitelné)");
assert.equal(translate("cs", "Suggested for {background}", { background: "Hazardní hráč" }), "Návrhy pro původ Hazardní hráč");
assert.equal(translate("cs", "{field}, in your own words", { field: "Ideál" }), "Ideál – vlastními slovy");
assert.equal(genderLabel("Female", "cs"), "Žena");
assert.equal(genderLabel("Male", "cs"), "Muž");
assert.equal(genderLabel("Nonbinary", "cs"), "Nebinární");
assert.equal(genderLabel("Female", "fr"), "Féminin");
assert.equal(genderLabel("Female", "en"), "Female");
assert.equal(storedGender("Female"), "Female");
assert.equal(storedGender("Male"), "Male");
assert.equal(storedGender("Nonbinary"), "Nonbinary");
console.log("ok: localized personality builder and gender labels (cs/fr/en)");
