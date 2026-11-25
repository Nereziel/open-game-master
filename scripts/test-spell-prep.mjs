// Preparing spells on 5e timing (src/lib/srd/spell-prep.ts): who prepares
// and who knows, the allowance, unpreparing at once, preparing at the next
// long rest, a wizard's spellbook, and multiclass mirrors.
import assert from "node:assert/strict";
import { register } from "node:module";

register("./lib/register-alias.mjs", import.meta.url);

const {
  casterViewsOf,
  changePreparation,
  maxSpellLevelOf,
  preparedCount,
  settlePreparation,
  spellStyleFor,
  spellbookAllowance,
  spellbookOf,
  withCasterViews,
} = await import("../src/lib/srd/spell-prep.ts");
const { allSpellNames, checklistClassSpell, spellLevelOf } = await import(
  "../src/lib/srd/spell-lists.ts"
);
const { longRestPatch } = await import("../src/lib/dm/rest-logic.ts");

let passed = 0;
function test(name, fn) {
  try {
    fn();
  } catch (error) {
    console.error(`FAIL: ${name}`);
    throw error;
  }
  passed += 1;
}

const ABILITIES = { str: 10, dex: 12, con: 14, int: 16, wis: 16, cha: 10 };

function cleric(overrides = {}) {
  return {
    class: "cleric",
    level: 1,
    subclass: "",
    classes: [],
    abilities: ABILITIES,
    spellcasting: {
      ability: "wis",
      slots: { 1: { max: 2, used: 0 } },
      known: [],
      prepared: ["Bless", "Cure Wounds", "Guiding Bolt", "Healing Word"],
      cantrips: ["Sacred Flame", "Guidance", "Light"],
      ...overrides,
    },
  };
}

function wizard(overrides = {}) {
  return {
    class: "wizard",
    level: 1,
    subclass: "",
    classes: [],
    abilities: ABILITIES,
    spellcasting: {
      ability: "int",
      slots: { 1: { max: 2, used: 0 } },
      known: [],
      prepared: ["Magic Missile", "Shield"],
      cantrips: ["Fire Bolt"],
      spellbook: ["Magic Missile", "Shield", "Sleep", "Mage Armor", "Detect Magic", "Find Familiar"],
      ...overrides,
    },
  };
}

const ok = (result) => {
  assert.ok(!("error" in result), result.error);
  return result.view;
};

test("each SRD class holds its spells the way the rules say", () => {
  assert.equal(spellStyleFor("wizard"), "spellbook");
  for (const id of ["cleric", "druid", "paladin", "artificer"]) {
    assert.equal(spellStyleFor(id), "prepared", id);
  }
  for (const id of ["bard", "sorcerer", "warlock", "ranger"]) {
    assert.equal(spellStyleFor(id), "known", id);
  }
});

test("a wizard's book starts at six and gains two a level", () => {
  assert.equal(spellbookAllowance(1), 6);
  assert.equal(spellbookAllowance(5), 14);
  assert.equal(spellbookAllowance(20), 44);
});

test("unpreparing takes effect at once", () => {
  const [view] = casterViewsOf(cleric());
  const next = ok(changePreparation(view, "unprepare", "Bless", { abilities: ABILITIES, inClassList: true }));
  assert.deepEqual(next.prepared, ["Cure Wounds", "Guiding Bolt", "Healing Word"]);
  assert.deepEqual(next.pending, []);
});

test("preparing waits for the long rest and is not castable before it", () => {
  const sheet = cleric({ prepared: ["Bless", "Cure Wounds", "Guiding Bolt"] });
  const views = casterViewsOf(sheet);
  const next = ok(changePreparation(views[0], "prepare", "Shield of Faith", { abilities: ABILITIES, inClassList: true }));
  assert.deepEqual(next.pending, ["Shield of Faith"]);
  const casting = withCasterViews(sheet.spellcasting, [next]);
  assert.deepEqual(casting.pending, ["Shield of Faith"]);
  assert.ok(!allSpellNames(casting).includes("Shield of Faith"));
  const rested = settlePreparation(casting);
  assert.ok(rested.prepared.includes("Shield of Faith"));
  assert.equal(rested.pending, undefined);
});

test("the allowance counts spells waiting for the rest", () => {
  // Level 1 cleric, WIS 16: 3 + 1 = 4 prepared. Already four.
  const [view] = casterViewsOf(cleric());
  assert.equal(preparedCount(view), 4);
  const refused = changePreparation(view, "prepare", "Command", { abilities: ABILITIES, inClassList: true });
  assert.ok("error" in refused);
  const freed = ok(changePreparation(view, "unprepare", "Bless", { abilities: ABILITIES, inClassList: true }));
  const queued = ok(changePreparation(freed, "prepare", "Command", { abilities: ABILITIES, inClassList: true }));
  assert.equal(preparedCount(queued), 4);
  assert.ok("error" in changePreparation(queued, "prepare", "Sanctuary", { abilities: ABILITIES, inClassList: true }));
});

test("cancel and unprepare both drop a spell still waiting", () => {
  const [view] = casterViewsOf(cleric({ prepared: ["Bless"], pending: ["Command"] }));
  assert.deepEqual(ok(changePreparation(view, "cancel", "Command", { abilities: ABILITIES, inClassList: true })).pending, []);
  assert.deepEqual(ok(changePreparation(view, "unprepare", "Command", { abilities: ABILITIES, inClassList: true })).pending, []);
});

test("a prepared caster may only prepare from the class list", () => {
  const [view] = casterViewsOf(cleric({ prepared: [] }));
  assert.ok("error" in changePreparation(view, "prepare", "Magic Missile", { abilities: ABILITIES, inClassList: false }));
});

test("cantrips, known casters and subclass spells are refused", () => {
  const [clericView] = casterViewsOf(cleric({ prepared: [] }));
  assert.ok("error" in changePreparation(clericView, "prepare", "Sacred Flame", { abilities: ABILITIES, inClassList: true }));
  const bard = { ...cleric(), class: "bard", spellcasting: { ...cleric().spellcasting, known: ["Sleep"], prepared: [] } };
  const [bardView] = casterViewsOf(bard);
  assert.ok("error" in changePreparation(bardView, "unprepare", "Sleep", { abilities: ABILITIES, inClassList: true }));
  const war = { ...cleric({ prepared: ["Shield of Faith"] }), subclass: "war" };
  const [warView] = casterViewsOf(war);
  const domain = changePreparation(warView, "unprepare", "Shield of Faith", { abilities: ABILITIES, inClassList: true });
  // War domain grants Shield of Faith at 1st level: always prepared, never removed.
  assert.ok("error" in domain, "domain spell stays prepared");
});

test("a custom third-caster sheet reads and keeps the known-spell progression", () => {
  const sheet = {
    class: "fighter",
    level: 3,
    subclass: "Custom Test Subclass",
    abilities: ABILITIES,
    spellcasting: { ability: "int", progression: "third-caster", slots: { 1: { max: 2, used: 0 } }, known: ["Shield"], prepared: [], cantrips: ["Fire Bolt"] },
  };
  const [view] = casterViewsOf(sheet);
  assert.equal(view.progression, "third-caster");
  assert.equal(view.style, "known");
  assert.equal(maxSpellLevelOf(view), 1);
  assert.equal(withCasterViews(sheet.spellcasting, [view]).progression, "third-caster");
});

test("the life domain grants its spells, always prepared and free", () => {
  const [view] = casterViewsOf({ ...cleric({ prepared: ["Guiding Bolt"] }), subclass: "life" });
  assert.ok("error" in changePreparation(view, "unprepare", "Bless", { abilities: ABILITIES, inClassList: true }));
  assert.equal(preparedCount(view), 1, "granted domain spells never count against the allowance");
  const [byName] = casterViewsOf({ ...cleric({ prepared: [] }), subclass: "Life Domain", level: 3 });
  assert.ok("error" in changePreparation(byName, "prepare", "Spiritual Weapon", { abilities: ABILITIES, inClassList: true }), "a granted spell is already prepared");
});

test("a wizard prepares only from the spellbook, and unpreparing keeps it written", () => {
  const sheet = wizard();
  const [view] = casterViewsOf(sheet);
  assert.equal(view.style, "spellbook");
  assert.ok("error" in changePreparation(view, "prepare", "Fireball", { abilities: ABILITIES, inClassList: true }));
  const dropped = ok(changePreparation(view, "unprepare", "Shield", { abilities: ABILITIES, inClassList: false }));
  assert.ok(spellbookOf(dropped).includes("Shield"));
  assert.ok(!dropped.prepared.includes("Shield"));
  const queued = ok(changePreparation(dropped, "prepare", "Sleep", { abilities: ABILITIES, inClassList: false }));
  assert.deepEqual(queued.pending, ["Sleep"]);
});

test("an older wizard sheet without a spellbook reads its prepared spells as the book", () => {
  const [view] = casterViewsOf(wizard({ spellbook: undefined }));
  assert.deepEqual(spellbookOf(view), ["Magic Missile", "Shield"]);
});

test("the long rest settles pending spells and leaves other sheets untouched", () => {
  const sheet = {
    ...cleric({ prepared: ["Bless"], pending: ["Command"] }),
    maxHp: 10,
    currentHp: 4,
    tempHp: 0,
    hitDice: { die: "d8", total: 1, spent: 1 },
    conditions: [],
    conditionMeta: {},
    resources: {},
    pets: [],
  };
  const patch = longRestPatch(sheet);
  assert.deepEqual(patch.spellcasting.prepared, ["Bless", "Command"]);
  assert.equal(patch.spellcasting.pending, undefined);
  const plain = longRestPatch({ ...sheet, spellcasting: cleric().spellcasting });
  assert.equal("pending" in plain.spellcasting, false);
});

test("multiclass views write back to casters and keep the union mirror", () => {
  const sheet = {
    class: "cleric",
    level: 3,
    subclass: "",
    classes: [
      { id: "cleric", subclass: "", level: 2 },
      { id: "wizard", subclass: "", level: 1 },
    ],
    abilities: ABILITIES,
    spellcasting: {
      ability: "wis",
      slots: { 1: { max: 4, used: 0 }, 2: { max: 2, used: 0 } },
      known: [],
      prepared: ["Bless", "Magic Missile"],
      cantrips: [],
      casters: [
        { classId: "cleric", ability: "wis", known: [], prepared: ["Bless"], cantrips: [] },
        { classId: "wizard", ability: "int", known: [], prepared: ["Magic Missile"], cantrips: [], spellbook: ["Magic Missile", "Sleep"] },
      ],
    },
  };
  const views = casterViewsOf(sheet);
  assert.equal(views[1].level, 1);
  const wiz = ok(changePreparation(views[1], "prepare", "Sleep", { abilities: ABILITIES, inClassList: false }));
  const casting = withCasterViews(sheet.spellcasting, [views[0], wiz]);
  assert.deepEqual(casting.casters[1].pending, ["Sleep"]);
  assert.equal("pending" in casting.casters[0], false);
  assert.deepEqual(casting.pending, ["Sleep"]);
  assert.deepEqual(casting.prepared, ["Bless", "Magic Missile"]);
  const rested = settlePreparation(casting);
  assert.deepEqual(rested.casters[1].prepared, ["Magic Missile", "Sleep"]);
});

test("the checklist knows spell levels and class lists", () => {
  assert.equal(spellLevelOf("fireball"), 3);
  assert.equal(spellLevelOf("Sacred Flame"), 0);
  assert.equal(spellLevelOf("Homebrew Bolt"), null);
  assert.equal(checklistClassSpell("cure wounds", "cleric", 1), "Cure Wounds");
  assert.equal(checklistClassSpell("Cure Wounds", "wizard", 9), null);
  assert.equal(checklistClassSpell("Spiritual Weapon", "cleric", 1), null);
});

const { levelUpSpells } = await import("../src/lib/srd/level-up-spells.ts");
const { checklistSpell } = await import("../src/lib/srd/spell-lists.ts");
await import("../src/lib/i18n/server-catalogs.ts");
test("level-up spell refusals localize without altering canonical choices or decisions", () => {
  const before = casterViewsOf(wizard())[0];
  const input = { before, level: 2, subclass: "", list: "wizard", firstLevel: false, abilities: ABILITIES, freeCantrips: 0, spellOf: checklistSpell };
  const bad = [
    { picks: { kind: "picks", spells: ["Imaginary Spell"] }, english: "Imaginary Spell is not a spell this server knows; pick one from the wizard spell list." },
    { picks: { kind: "picks", spells: ["Fireball"] }, english: "Fireball is a level 3 spell; a wizard of level 2 casts up to level 1." },
    { picks: { kind: "picks", spells: [], forget: "Shield" }, english: "Shield is not a spell this character knows, so it cannot be given up for another." },
  ];
  const snapshot = structuredClone(before);
  const valid = { ...input, picks: null };
  const expected = levelUpSpells(valid);
  assert.ok("view" in expected);
  for (const { picks, english } of bad) {
    assert.deepEqual(levelUpSpells({ ...input, picks }), { error: english });
    const messages = ["en", "cs", "fr"].map(locale => levelUpSpells({ ...input, picks, locale }).error);
    assert.equal(new Set(messages).size, 3);
    assert.ok(messages.every(message => typeof message === "string" && !/\{\w+\}/.test(message)));
  }
  for (const locale of ["en", "cs", "fr"]) assert.deepEqual(levelUpSpells({ ...valid, locale }), expected);
  assert.deepEqual(before, snapshot);
});

const { revisedOnlySpellProblem } = await import("../src/lib/content/edition.ts");
const { thirdCasterSchoolProblem, thirdCasterCantripProblem } = await import("../src/lib/srd/third-caster.ts");
const { arcanumExtraProblem } = await import("../src/lib/srd/mystic-arcanum.ts");
const { classSpellGrants, offListProblems } = await import("../src/lib/srd/class-spell-grants.ts");
test("delegated spell refusals preserve the English contract and localize presentation", () => {
  const schools = { classId: "fighter", subclass: "Eldritch Knight", level: 3, spells: [{ name: "Sleep", school: "enchantment" }, { name: "Charm Person", school: "enchantment" }] };
  const cantrips = { classId: "rogue", subclass: "Arcane Trickster", level: 3, cantrips: ["Fire Bolt", "Light", "Ray of Frost"], cap: 3 };
  const split = { arcanum: ["Circle of Death"], extra: ["Eyebite"] };
  const levelOf = () => 6;
  const off = { grants: classSpellGrants({ classId: "bard", level: 10 }), allowedBefore: 2, kept: 2, strays: [{ name: "Fireball", cantrip: false }], list: "bard", label: "bard of level 10" };
  const snapshot = structuredClone({ schools, cantrips, split, off });
  const refusals = [
    [locale => revisedOnlySpellProblem("Sorcerous Burst", "cantrip", locale), "Sorcerous Burst is from the 2024 rules, which this server does not play; pick a 2014 cantrip in its place."],
    [locale => revisedOnlySpellProblem("Summon Dragon", "spell", locale), "Summon Dragon is from the 2024 rules, which this server does not play; pick a 2014 spell in its place."],
    [locale => thirdCasterSchoolProblem({ ...schools, locale }), "An Eldritch Knight of level 3 learns abjuration and evocation spells, and 1 from any other school; this would make 2. Pick an abjuration or evocation spell instead."],
    [locale => thirdCasterCantripProblem({ ...cantrips, locale }), "An Arcane Trickster knows Mage Hand as one of its cantrips; take Mage Hand in place of one of the others."],
    [locale => arcanumExtraProblem(split, levelOf, "warlock", locale), "Mystic Arcanum teaches one spell of level 6: Circle of Death is already that arcanum, so Eyebite cannot be learned too."],
    [locale => offListProblems({ ...off, locale })[0], "Fireball is not on the bard spell list, so a bard of level 10 cannot learn or prepare it: through Magical Secrets a bard of level 10 holds 2 spells from other classes' lists, and this would make 3."],
  ];
  for (const [run, english] of refusals) {
    assert.equal(run(undefined), english);
    const results = ["en", "cs", "fr"].map(run);
    assert.equal(new Set(results).size, 3);
    assert.ok(results.every(value => typeof value === "string" && !/\{\w+\}/.test(value)));
  }
  for (const locale of ["en", "cs", "fr"]) {
    assert.equal(revisedOnlySpellProblem("Fireball", "spell", locale), null);
    assert.equal(thirdCasterSchoolProblem({ ...schools, spells: schools.spells.slice(0, 1), locale }), null);
    assert.equal(thirdCasterCantripProblem({ ...cantrips, cantrips: ["Mage Hand", "Light", "Fire Bolt"], locale }), null);
    assert.equal(arcanumExtraProblem({ ...split, extra: [] }, levelOf, "warlock", locale), null);
    assert.deepEqual(offListProblems({ ...off, kept: 1, locale }), []);
  }
  assert.deepEqual({ schools, cantrips, split, off }, snapshot);
});

const { spellNameProblems } = await import("../src/lib/srd/legality/spells.ts");
const { spellListProblems } = await import("../src/lib/srd/spell-prep.ts");
const { thirdCasterPickRefusal } = await import("../src/app/campaigns/[campaignId]/level-up-preview.ts");
test("creation and preview pass locale through the delegated spell validators", () => {
  const view = casterViewsOf(wizard({ cantrips: ["Sorcerous Burst"] }))[0];
  const rules = { spellOf: checklistSpell, held: new Set(), racialCantrips: [] };
  const rogue = { ...wizard({ spellbook: undefined, known: [], prepared: [], cantrips: ["Fire Bolt", "Light", "Ray of Frost"] }), class: "rogue", subclass: "Arcane Trickster", level: 3 };
  const pick = { classId: "fighter", subclass: "Eldritch Knight", level: 3, known: [], picks: ["Sleep"], adding: "Charm Person", schoolOf: () => "enchantment" };
  const snapshot = structuredClone({ view, rogue });
  for (const locale of ["en", "cs", "fr"]) {
    assert.deepEqual(spellNameProblems(view, "wizard", { ...rules, locale }), [revisedOnlySpellProblem("Sorcerous Burst", "cantrip", locale)]);
    assert.deepEqual(spellListProblems(rogue, { locale }), [thirdCasterCantripProblem({ classId: "rogue", subclass: "Arcane Trickster", level: 3, cantrips: rogue.spellcasting.cantrips, cap: 3, locale })]);
    assert.equal(thirdCasterPickRefusal({ ...pick, locale }), thirdCasterSchoolProblem({ classId: "fighter", subclass: "Eldritch Knight", level: 3, spells: [{ name: "Sleep", school: "enchantment" }, { name: "Charm Person", school: "enchantment" }], locale }));
    assert.deepEqual(spellListProblems({ ...rogue, spellcasting: { ...rogue.spellcasting, cantrips: ["Mage Hand", "Light", "Fire Bolt"] } }, { locale }), []);
  }
  assert.deepEqual({ view, rogue }, snapshot);
});
console.log(`test-spell-prep: ${passed} tests passed.`);
