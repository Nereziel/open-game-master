// Every feature a player can end up with must be explainable to them.
//
// test-feature-coverage.mjs guarantees a feature has MECHANICS (an effect, a
// counter, or an acknowledged reason it needs none). This one guarantees it
// has WORDS: describeFeature() returns something a new player can read. The
// two together mean a feature can neither do nothing nor explain nothing.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";

register("./lib/register-alias.mjs", import.meta.url);

const {
  describeFeature,
  describeContentEntry,
  describeRace,
  describeRaceTrait,
  describeSkill,
  glossaryTerm,
  glossaryTerms,
  spellSummary,
  starterSpellsFor,
} = await import("../src/lib/help/index.ts");
const { SRD_CLASSES } = await import("../src/lib/srd/index.ts");
const { bundledSpellSchool } = await import("../src/lib/srd/spell-facts.ts");
const { translate } = await import("../src/lib/messages-logic.ts");
// The help module builds its sentences for the screen; the test reads them in English.
const t = (key, vars) => translate("en", key, vars);
const { THIRD_CASTER_PROFILES, thirdCasterSchoolProblem } = await import("../src/lib/srd/third-caster.ts");

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

const srcDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "lib");
const readJson = (...parts) => JSON.parse(readFileSync(join(srcDir, ...parts), "utf8"));

const classFeatures = readJson("srd", "class-features.json").classes;
const authored = readJson("srd", "subclasses.json").classes;
const races = readJson("srd", "races.json").races;
const skills = readJson("srd", "skills.json").skills;
const glossary = readJson("..", "lib", "help", "glossary.json").terms;

test("every SRD class feature has player-facing text", () => {
  const missing = [];
  for (const [classId, table] of Object.entries(classFeatures)) {
    for (const names of Object.values(table.levels)) {
      for (const name of names) {
        if (!describeFeature(classId, "", name)?.trim()) {
          missing.push(`${classId}: ${name}`);
        }
      }
    }
    for (const subclass of table.subclasses) {
      for (const names of Object.values(subclass.levels)) {
        for (const name of names) {
          if (!describeFeature(classId, subclass.name, name)?.trim()) {
            missing.push(`${classId}/${subclass.name}: ${name}`);
          }
        }
      }
    }
  }
  assert.deepEqual([...new Set(missing)].sort(), []);
});

test("every authored subclass feature has player-facing text", () => {
  const missing = [];
  for (const [classId, entries] of Object.entries(authored)) {
    for (const entry of entries) {
      for (const features of Object.values(entry.levels)) {
        for (const feature of features) {
          if (!describeFeature(classId, entry.name, feature.n)?.trim()) {
            missing.push(`${classId}/${entry.name}: ${feature.n}`);
          }
        }
      }
    }
  }
  assert.deepEqual([...new Set(missing)].sort(), []);
});

test("a feature name shared by two subclasses resolves to each one's own text", () => {
  const nature = describeFeature("cleric", "Nature Domain", "Divine Strike");
  const death = describeFeature("cleric", "Death Domain", "Divine Strike");
  const generic = describeFeature("cleric", "", "Divine Strike");
  assert.ok(nature.includes("cold"));
  assert.ok(death.includes("necrotic"));
  assert.ok(generic && generic !== nature && generic !== death);
});

test("every lineage and skill can be described", () => {
  assert.deepEqual(races.filter((race) => !describeRace(race.id)?.trim()), []);
  assert.deepEqual(
    skills.filter((skill) => !describeSkill(t, skill.id)?.trim()).map((skill) => skill.id),
    [],
  );
  // Content-pack race slugs use hyphens where the bundled ids use underscores.
  assert.ok(describeRace("half-elf"));
});

test("glossary entries are complete, unique and readable", () => {
  const problems = [];
  const seen = new Set();
  for (const entry of glossary) {
    if (seen.has(entry.id)) {
      problems.push(`duplicate id ${entry.id}`);
    }
    seen.add(entry.id);
    if (!entry.term?.trim() || !entry.short?.trim()) {
      problems.push(`${entry.id}: missing term or short`);
    }
    if (entry.short && entry.short.length > 160) {
      problems.push(`${entry.id}: short text is too long for an inline read`);
    }
  }
  assert.deepEqual(problems, []);
  assert.equal(glossaryTerms().length, glossary.length);
});

test("the six abilities are all glossary terms, so ability labels can link", () => {
  for (const ability of ["str", "dex", "con", "int", "wis", "cha"]) {
    assert.ok(glossaryTerm(ability), `no glossary entry for ${ability}`);
  }
});

test("every glossary id used in the UI exists", () => {
  // A <GameTerm id="..."> with no matching entry silently renders as plain
  // text, so nothing would look broken while the help quietly went missing.
  const appDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.tsx?$/.test(entry.name)) {
        files.push(full);
      }
    }
  };
  walk(appDir);

  const missing = [];
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/<GameTerm\s+id="([^"]+)"/g)) {
      if (!glossaryTerm(match[1])) {
        missing.push(`${file.split("/src/")[1]}: ${match[1]}`);
      }
    }
  }
  assert.deepEqual(missing, []);
});

test("no help text uses an em dash", () => {
  const offenders = [];
  const scan = (label, value) => {
    if (typeof value === "string" && value.includes("—")) {
      offenders.push(label);
    }
  };
  for (const entry of glossary) {
    scan(`glossary/${entry.id}/short`, entry.short);
    scan(`glossary/${entry.id}/long`, entry.long);
  }
  const srdFeatures = readJson("..", "lib", "help", "srd-features.json");
  for (const [name, text] of Object.entries(srdFeatures.features)) {
    scan(`srd-features/${name}`, text);
  }
  for (const [classId, entries] of Object.entries(srdFeatures.byClass)) {
    for (const [name, text] of Object.entries(entries)) {
      scan(`srd-features/${classId}/${name}`, text);
    }
  }
  assert.deepEqual(offenders, []);
});

test("every caster class offers opening spell suggestions", () => {
  // A new player cannot search for a spell whose name they have never heard,
  // so a caster with no suggestions leaves them staring at an empty box.
  const missing = SRD_CLASSES.filter(
    (klass) => klass.spellAbility && !starterSpellsFor(klass.id),
  ).map((klass) => klass.id);
  assert.deepEqual(missing, []);
});

test("every suggested spell is a real spell in the manifest", () => {
  const manifest = JSON.parse(
    readFileSync(join(srcDir, "srd", "manifest", "spells.json"), "utf8"),
  ).spells;
  const known = new Set();
  for (const entry of manifest) {
    known.add(entry.n.toLowerCase());
    (entry.a ?? []).forEach((alias) => known.add(alias.toLowerCase()));
  }
  const bogus = [];
  for (const klass of SRD_CLASSES) {
    const starter = starterSpellsFor(klass.id);
    if (!starter) {
      continue;
    }
    for (const pick of [...starter.cantrips, ...starter.spells]) {
      if (!known.has(pick.n.toLowerCase())) {
        bogus.push(`${klass.id}: ${pick.n}`);
      }
      if (!pick.d?.trim()) {
        bogus.push(`${klass.id}: ${pick.n} has no reason given`);
      }
    }
  }
  assert.deepEqual(bogus, []);
});

test("a third caster's suggested spells are its own: real spells, from its two schools", () => {
  // The Eldritch Knight and Arcane Trickster were offered the wizard's
  // picks (Sleep, Minor Illusion) and the wizard's "prepare from your
  // spellbook", and "Fill with the suggested spells" chose spells their
  // school rule then refused (src/lib/srd/third-caster.ts).
  // Every profile, on a class that casts nothing of its own.
  for (const { id: key } of THIRD_CASTER_PROFILES) {
    const [classId, subclass] = ["barbarian", ""];
    const starter = starterSpellsFor(key);
    assert.ok(starter, `${key} has no suggestions`);
    assert.doesNotMatch(starter.why, /spellbook to prepare from$|prepare fresh each day/);
    for (const pick of [...starter.cantrips, ...starter.spells]) {
      assert.ok(bundledSpellSchool(pick.n), `${key}: ${pick.n} is not a spell the tables know`);
    }
    // The cantrip each Spellcasting teaches comes first, so a fill keeps it.
    const required = { "arcane-trickster": "Mage Hand", underfoot: "Shillelagh" }[key];
    if (required) {
      assert.equal(starter.cantrips[0]?.n, required, `${key}: ${required} is not suggested first`);
    }
    const problem = thirdCasterSchoolProblem({
      classId,
      subclass,
      profile: key,
      level: 3,
      spells: starter.spells.map((pick) => ({ name: pick.n, school: bundledSpellSchool(pick.n) })),
    });
    assert.equal(problem, null, `${key}: ${problem}`);
  }
});

test("classes that teach a secret language grant it", () => {
  // Picking druid has to actually let the character speak Druidic.
  const druid = SRD_CLASSES.find((klass) => klass.id === "druid");
  const rogue = SRD_CLASSES.find((klass) => klass.id === "rogue");
  assert.ok(druid.languages?.includes("Druidic"), "druid does not grant Druidic");
  assert.ok(rogue.languages?.includes("Thieves' Cant"), "rogue does not grant Thieves' Cant");
});

test("spell summaries read correctly for cantrips and levelled spells", () => {
  assert.match(spellSummary({ level: 0, school: "evocation" }), /evocation cantrip/);
  assert.match(
    spellSummary({ level_int: 3, school: "necromancy", concentration: true }),
    /level 3 necromancy · concentration/,
  );
  assert.equal(spellSummary(undefined), "");
});

test("a pack row's \"no\" is no: Light is neither concentration nor a ritual", () => {
  // The SRD rows spell their flags as words (data/content/open5e.sqlite).
  const light = spellSummary({ level: 0, school: "evocation", concentration: "no", ritual: "no" });
  assert.doesNotMatch(light, /concentration|ritual/);
  assert.match(spellSummary({ level: 1, school: "divination", concentration: "yes", ritual: "yes" }), /concentration · ritual/);
});

await import("../src/lib/i18n/server-catalogs.ts");

test("Czech covers every genre feature description and authored option text", () => {
  const missing = [];
  let genreCount = 0;
  for (const genre of ["cyberpunk", "dark-fantasy", "horror", "mystery", "post-apocalyptic", "steampunk"]) {
    const { classes } = readJson("classes", genre + "-features.json");
    for (const [classId, table] of Object.entries(classes)) {
      for (const feature of [...Object.values(table.levels), ...Object.values(table.subclass.levels)].flat()) {
        genreCount += 1;
        if (translate("cs", feature.d) === feature.d) missing.push(classId + ": " + feature.n);
      }
    }
  }
  assert.ok(genreCount >= 733);
  const { options } = readJson("srd", "options.json");
  assert.ok(options.length >= 245);
  for (const option of options) {
    for (const text of [option.d, option.req].filter(Boolean)) {
      if (translate("cs", text) === text) missing.push(option.n + ": " + text);
    }
  }
  assert.deepEqual(missing, []);
});

test("spell summary metadata follows locale and keeps conditional text intact", () => {
  const data = { level_int: 3, school: { name: "Evocation" }, casting_time: "1 bonus action", range: "60 feet", concentration: "yes", ritual: true };
  const original = JSON.stringify(data);
  const expected = {
    en: "level 3 evocation · 1 bonus action · 60 feet · concentration · ritual",
    fr: "évocation, niveau 3 · 1 action bonus · 60 pieds · concentration · rituel",
    cs: "zaklínání, úroveň 3 · 1 bonusová akce · 60 stop · soustředění · rituál",
  };
  for (const locale of ["en", "fr", "cs"]) {
    assert.equal(spellSummary(data, locale), expected[locale]);
    assert.equal(spellSummary(undefined, locale), "");
    assert.equal(JSON.stringify(data), original);
    const conditional = spellSummary({ level: 1, school: "Custom", casting_time: "1 reaction, when an ally falls", range: "Self (15-foot cone)" }, locale);
    assert.ok(conditional.includes("1 reaction, when an ally falls · Self (15-foot cone)"));
    assert.ok(conditional.includes("custom"));
  }
  assert.equal(spellSummary({ level: 0, school: "evocation", casting_time: "2 minutes", range: "Touch" }, "cs"), "trik (zaklínání) · 2 minuty · Dotek");
  assert.equal(spellSummary({ level: 1, school: "divination", casting_time: "5 hours" }, "cs"), "věštění, úroveň 1 · 5 hodin");
  assert.equal(spellSummary({ level: 0, school: "evocation", casting_time: "1 minute", range: "Self" }, "fr"), "sort mineur (évocation) · 1 minute · Sur soi");
});

const { speciesTraitName } = await import("../src/lib/content/names.ts");
const { findOptionByFeatureName } = await import("../src/lib/srd/options.ts");

test("feature and lineage help follow the common language lookup", () => {
  const race = races.find((entry) => entry.id === "hill_dwarf");
  const trait = race.traits[0];
  for (const locale of ["en", "fr", "cs"]) {
    const displayed = speciesTraitName(race.id, trait, locale);
    assert.equal(describeRaceTrait(race.id, trait, locale), displayed === trait ? null : displayed);
    assert.equal(describeRace(race.id, locale), race.traits.map((name) => speciesTraitName(race.id, name, locale)).join(". ") + ".");
    const option = findOptionByFeatureName("Invocation: Agonizing Blast");
    assert.ok(option);
    const description = translate(locale, option.d);
    const expected = option.req ? description + " (" + translate(locale, "Requires {req}", { req: translate(locale, option.req) }) + ".)" : description;
    assert.equal(describeFeature("warlock", "", "Invocation: Agonizing Blast", locale), expected);
  }
  assert.notEqual(describeRace("hill_dwarf", "fr"), describeRace("hill_dwarf", "en"));
  assert.notEqual(describeRace("hill_dwarf", "cs"), describeRace("hill_dwarf", "en"));
});

test("chosen element help translates its template and damage type without changing the feature key", () => {
  const feature = "Bloodline damage type: Fire";
  assert.match(describeFeature("sorcerer", "", feature, "en"), /Bloodline chosen: fire/);
  assert.match(describeFeature("sorcerer", "", feature, "fr"), /Feu/);
  assert.match(describeFeature("sorcerer", "", feature, "cs"), /Ohnivé/);
});

test("content help localizes labels but preserves original pack prerequisites and prose", () => {
  const data = { desc: "Custom flavor.", prerequisite: "Strength 13", effects_desc: "Gain a bonus.", feature: "Custom gift", feature_desc: "Original feature text." };
  const original = JSON.stringify(data);
  for (const [locale, requirement, feature] of [
    ["en", "Requires Strength 13", "Feature"],
    ["fr", "Nécessite Strength 13", "Capacité"],
    ["cs", "Vyžaduje Strength 13", "Schopnost"],
  ]) {
    const text = describeContentEntry(data, undefined, locale);
    assert.ok(text.includes(requirement), locale + " prerequisite heading");
    assert.ok(text.includes("**" + feature + ": Custom gift.** Original feature text."), locale + " feature heading");
    assert.ok(text.includes("Custom flavor."));
    assert.ok(text.includes("Gain a bonus."));
    assert.equal(describeContentEntry(data, "Custom gift", locale), "**" + feature + ": Custom gift.** Original feature text.");
    assert.equal(describeContentEntry({ ...data, localized_desc: "Reviewed display text." }, undefined, locale), "Reviewed display text.");
    assert.equal(JSON.stringify(data), original);
  }
});

console.log(`\ntest-help-coverage: ${passed} passed`);
