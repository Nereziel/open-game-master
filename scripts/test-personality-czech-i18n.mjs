// Regression: all personality inputs and gender choices shown to Czech players
// must use localized labels while preserving the values saved on sheets.
import assert from "node:assert/strict";
import fs from "node:fs";
import { genderLabel, storedGender } from "../src/lib/gender.ts";
import { installCatalog, translate } from "../src/lib/i18n/translate.ts";
import { BUNDLED_PERSONA, GENERAL_PERSONA } from "../src/lib/backgrounds/persona-data.ts";

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
const attractionPicker = fs.readFileSync(new URL("../src/components/AttractionPicker.tsx", import.meta.url), "utf8");
assert.match(attractionPicker, /Women: "Ženy"/);
assert.match(attractionPicker, /Men: "Muži"/);
assert.match(attractionPicker, /"Nonbinary people": "Nebinární osoby"/);
assert.match(attractionPicker, /locale === "cs" \? \(CHOICE_LABELS_CS/);
// Every built-in suggestion needs a Czech display string; the stable English
// selection remains the sheet value so existing games and English UI keep working.
const lists = [...Object.values(BUNDLED_PERSONA), GENERAL_PERSONA];
const sourceLines = lists.flatMap((list) => [...list.trait, ...list.ideal, ...list.bond, ...list.flaw]);
assert.equal(sourceLines.length, 234);
for (const line of sourceLines) {
  assert.notEqual(translate("cs", line), line, "Missing Czech personality choice: " + line);
  assert.equal(translate("en", line), line, "English personality source changed: " + line);
}

const backgrounds = [
  ...JSON.parse(fs.readFileSync(new URL("../src/lib/srd/backgrounds.json", import.meta.url), "utf8")).backgrounds,
  ...JSON.parse(fs.readFileSync(new URL("../src/lib/backgrounds/catalog.json", import.meta.url), "utf8")).backgrounds,
];
assert.equal(backgrounds.length, 54);
for (const row of backgrounds) {
  for (const source of [row.feature, row.featureDesc, row.blurb]) {
    assert.notEqual(translate("cs", source), source, "Missing Czech background feature: " + row.id);
  }
}
const soldier = backgrounds.find((row) => row.id === "soldier");
assert.equal(translate("cs", soldier.feature), "Vojenská hodnost");
assert.match(translate("cs", soldier.featureDesc), /hodnost.*vojác|vojác.*hodnost/i);

// A pack can supply English-only personality tables: the chooser must then
// present Czech generic choices instead of showing untranslated English options.
const fields = fs.readFileSync(new URL("../src/app/characters/builder/PersonalityFields.tsx", import.meta.url), "utf8");
assert.match(fields, /hasUntranslatedChoice/);
assert.match(fields, /GENERAL_PERSONA\[key\]/);
assert.match(fields, /name: t\(line\)/);

console.log("ok: localized personality builder and gender labels, 234 personality choices, 54 background features (cs/fr/en)");
