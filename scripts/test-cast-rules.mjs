// The rules every cast is asked (src/lib/dm/cast-rules.ts) and what a spell
// taught in play must be (src/lib/dm/learn-rules.ts). Pure, so each branch is
// walked here without a database; the tools that call them are held to the
// same rules end to end by scripts/test-enforce-casting*.mjs.
import assert from "node:assert/strict";
import { register } from "node:module";
import { readFileSync } from "node:fs";

register("./lib/register-alias.mjs", import.meta.url);

const {
  canCastRituals,
  casterStateProblem,
  componentProblem,
  focusProblem,
  materialComponents,
  handsBusy,
  grappleHandsProblem,
  materialPlan,
  openCastOf,
  QUICKENED,
  reactionSpellOnOwnTurn,
  ritualProblem,
  slotPlan,
  spellHeldProblem,
  turnCharge,
  withOpenCast,
} = await import("../src/lib/dm/cast-rules.ts");
const { copyCost, learnProblem } = await import("../src/lib/dm/learn-rules.ts");
const { textKey } = await import("../src/lib/language/text-logic.ts");
const { bundledSpellFacts, materialOf } = await import("../src/lib/srd/spell-facts.ts");
const { CASTING_HELD, freshBudget, releaseHeldAction, spendAction, spendAttack } = await import("../src/lib/dm/action-budget.ts");
const { castingRoundsOf, castingOf, castingInstance, completedCastingOf, completeMark } = await import("../src/lib/dm/long-casting-logic.ts");
const { spellSupportFor, spellSupportLine } = await import("../src/lib/srd/spell-support.ts");
const { spellMechanicsFor } = await import("../src/lib/content/index.ts");

let passed = 0;
function test(name, fn) {
  try {
    fn();
  } catch (error) {
    error.message = `${name}: ${error.message}`;
    throw error;
  }
  passed += 1;
}

const facts = (name) => {
  const found = bundledSpellFacts(name);
  assert.ok(found, `the bundled data knows ${name}`);
  return found;
};

const PROFS = { saves: [], skills: [], expertise: [], languages: [], tools: [], armor: [], weapons: [] };

function caster(overrides = {}) {
  return {
    name: "Iris",
    class: "wizard",
    level: 5,
    subclass: "",
    classes: [],
    abilities: { str: 10, dex: 14, con: 12, int: 16, wis: 10, cha: 10 },
    conditions: [],
    features: [],
    feats: [],
    equipment: [],
    proficiencies: PROFS,
    wildShape: null,
    gold: 0,
    copper: 0,
    ...overrides,
    spellcasting:
      overrides.spellcasting === null
        ? null
        : {
            ability: "int",
            slots: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 2, used: 0 } },
            known: [],
            prepared: ["Magic Missile", "Hold Person", "Fireball", "Healing Word"],
            cantrips: ["Fire Bolt"],
            spellbook: ["Magic Missile", "Hold Person", "Fireball", "Detect Magic"],
            pending: ["Fly"],
            ...(overrides.spellcasting ?? {}),
          },
  };
}

// ---- names ----

test("a name is compared whole, whatever its case or spacing", () => {
  assert.equal(textKey("  Hold  PERSON "), "hold person");
  assert.equal(textKey("Hunter’s Mark"), textKey("hunter's mark"));
});

// ---- who holds the spell ----

test("a caster holds what they know, have prepared, or keep as a cantrip, by whole name", () => {
  const iris = caster();
  assert.equal(spellHeldProblem(iris, "Hold Person", facts("Hold Person")), null);
  assert.equal(spellHeldProblem(iris, "fire bolt", facts("Fire Bolt")), null);
  assert.ok(spellHeldProblem(iris, "Bolt", null), "part of a name is not the name");
  assert.ok(spellHeldProblem(iris, "Counterspell", facts("Counterspell")));
});

test("a spell waiting for the long rest, or only in the book, is not ready", () => {
  const iris = caster();
  assert.ok(spellHeldProblem(iris, "Fly", facts("Fly")));
  assert.ok(spellHeldProblem(iris, "Detect Magic", facts("Detect Magic")));
});

test("a wizard reads a ritual from the book without preparing it", () => {
  assert.equal(spellHeldProblem(caster(), "Detect Magic", facts("Detect Magic"), { ritual: true }), null);
});

test("a character with no Spellcasting holds nothing", () => {
  assert.ok(spellHeldProblem(caster({ spellcasting: null }), "Fire Bolt", facts("Fire Bolt")));
});

// ---- the caster's own state ----

test("raging, wild shaped, polymorphed and untrained armor each stop a cast", () => {
  assert.equal(casterStateProblem(caster()), null);
  assert.match(casterStateProblem(caster({ conditions: ["raging"] }))?.error, /raging/);
  const wolf = { form: "Wolf", beastHp: 11, beastMaxHp: 11, beastAc: 13, kind: "wildshape" };
  assert.match(casterStateProblem(caster({ wildShape: wolf }))?.error, /wild shaped/);
  assert.equal(
    casterStateProblem(caster({ wildShape: wolf, features: [{ name: "Beast Spells", level: 18 }] })),
    null,
    "Beast Spells lets a druid of 18th level cast in beast form",
  );
  assert.match(casterStateProblem(caster({ wildShape: { ...wolf, kind: "polymorph" } }))?.error, /polymorphed/);
  assert.match(
    casterStateProblem(caster({ equipment: [{ name: "Plate", qty: 1, equipped: true }] }))?.error,
    /not trained/,
  );
  assert.equal(
    casterStateProblem(
      caster({ equipment: [{ name: "Plate", qty: 1, equipped: true }], proficiencies: { ...PROFS, armor: ["heavy"] } }),
    ),
    null,
  );
});

// ---- components ----

test("no verbal spell without a voice; a spell with none is still cast", () => {
  const hushed = caster({ conditions: ["silenced"] });
  assert.match(componentProblem(hushed, facts("Magic Missile"))?.error, /verbal/);
  const somatic = { ...facts("Magic Missile"), verbal: false };
  assert.equal(componentProblem(hushed, somatic), null);
});

test("two busy hands refuse a somatic spell; War Caster or a holy symbol on a shield does not", () => {
  const armed = {
    equipment: [
      { name: "Longsword", qty: 1, equipped: true },
      { name: "Shield", qty: 1, equipped: true },
    ],
    proficiencies: { ...PROFS, armor: ["light", "medium", "heavy", "shield"], weapons: ["simple", "martial"] },
  };
  assert.equal(handsBusy(caster(armed)), 2);
  assert.match(componentProblem(caster(armed), facts("Magic Missile"))?.error, /free hand/);
  assert.equal(componentProblem(caster({ ...armed, feats: ["War Caster"] }), facts("Magic Missile")), null);
  const priest = caster({ ...armed, class: "cleric" });
  assert.equal(componentProblem(priest, facts("Hold Person")), null, "V, S, M: the emblem hand");
  assert.match(componentProblem(priest, facts("Magic Missile"))?.error, /free hand/, "V, S: no material, no emblem");
  assert.equal(handsBusy(caster({ equipment: [{ name: "Longsword", qty: 1 }] })), 0, "carried is not held");
});

test("a held row of two daggers is one hand, so a warlock the engine armed still casts", () => {
  // The default warlock kit packs "two daggers" as one row, and the engine's
  // guess holds it as the caster's one weapon (held-default.ts).
  const warlock = caster({ class: "warlock", equipment: [{ name: "Dagger", qty: 2, equipped: true, heldGuess: true }] });
  assert.equal(handsBusy(warlock), 1);
  assert.equal(componentProblem(warlock, facts("Magic Missile")), null);
  assert.equal(grappleHandsProblem({ ...warlock, name: "Iris" }), null);
  const twoRows = caster({ equipment: [{ name: "Dagger", qty: 1, equipped: true }, { name: "Shortsword", qty: 1, equipped: true }] });
  assert.equal(handsBusy(twoRows), 2, "two weapons held are two hands");
});

// ---- materials ----

test("a costly material is carried, bought, or the spell is refused", () => {
  const revivify = facts("Revivify");
  assert.equal(revivify.materialCostGp, 300);
  assert.equal(revivify.materialConsumed, true);
  assert.ok("error" in materialPlan(caster(), revivify));
  const carried = materialPlan(caster({ equipment: [{ name: "Diamond", qty: 1, worth: 300 }] }), revivify);
  assert.equal(carried.kind, "components");
  assert.deepEqual(carried.uses.map((use) => [use.itemName, use.take, use.consume]), [["Diamond", 1, true]]);
  // Pieces make the worth: three 100 gp diamonds.
  const pieces = materialPlan(caster({ equipment: [{ name: "Diamond", qty: 5, worth: 100 }] }), revivify);
  assert.deepEqual(pieces.uses.map((use) => use.take), [3]);
  // A name alone proves no worth.
  assert.ok("error" in materialPlan(caster({ equipment: [{ name: "Diamond", qty: 1 }] }), revivify, { inFight: true }));
  // Bought from the purse out of a fight; never in one.
  const bought = materialPlan(caster({ gold: 400 }), revivify);
  assert.deepEqual(bought.bought.map((buy) => [buy.copper, buy.consume]), [[30000, true]]);
  assert.match(materialPlan(caster({ gold: 400 }), revivify, { inFight: true }).error, /middle of a fight/);
  assert.deepEqual(materialPlan(caster(), facts("Hold Person")), { kind: "none" });
});

// ---- slots ----

test("no level named is the spell's own level; below it or a slot not held is refused", () => {
  const iris = caster();
  const own = slotPlan(iris, "Hold Person", facts("Hold Person"), undefined);
  assert.deepEqual([own.kind, own.level, own.state.used], ["slot", 2, 1]);
  assert.ok("error" in slotPlan(iris, "Hold Person", facts("Hold Person"), 1));
  assert.ok("error" in slotPlan(iris, "Fireball", facts("Fireball"), 5));
  assert.equal(slotPlan(iris, "Fire Bolt", facts("Fire Bolt"), 3).kind, "none", "a cantrip spends nothing");
  const up = slotPlan(iris, "Magic Missile", facts("Magic Missile"), 3);
  assert.deepEqual([up.level, up.state.used], [3, 1]);
  const spent = caster({ spellcasting: { slots: { 2: { max: 3, used: 3 } } } });
  assert.ok("error" in slotPlan(spent, "Hold Person", facts("Hold Person"), 2));
});

// ---- rituals and long castings ----

// In a fight a ritual is no refusal: its ten extra minutes are a casting
// held across the caster's turns (long-casting-logic.ts, below).
test("a ritual is a named, ritual-tagged spell, cast by a class with Ritual Casting", () => {
  const iris = caster();
  assert.equal(canCastRituals(iris), true);
  assert.equal(canCastRituals(caster({ class: "sorcerer" })), false);
  assert.equal(canCastRituals(caster({ class: "sorcerer", feats: ["Ritual Caster"] })), true);
  assert.ok(ritualProblem(iris, "", null));
  assert.match(ritualProblem(iris, "Fireball", facts("Fireball"))?.error, /no ritual tag/);
  assert.match(ritualProblem(caster({ class: "sorcerer" }), "Detect Magic", facts("Detect Magic"))?.error, /does not cast rituals/);
  assert.equal(ritualProblem(iris, "Detect Magic", facts("Detect Magic")), null);
});

// F11 (docs/dnd-rules-audit-2026-10-09-extent.md): a ritual is cast through
// the class that holds it, and only a ritual caster's hold counts.
test("a ritual is cast only through a ritual caster's own spells, or the ritual book", () => {
  const multi = (casters, extra = {}) =>
    caster({
      class: casters[0].classId,
      classes: casters.map((entry) => ({ id: entry.classId, level: 3, subclass: "" })),
      ...extra,
      spellcasting: {
        known: casters.flatMap((entry) => entry.known ?? []),
        prepared: casters.flatMap((entry) => entry.prepared ?? []),
        spellbook: casters.flatMap((entry) => entry.spellbook ?? []),
        cantrips: [],
        pending: [],
        casters: casters.map((entry) => ({ ability: "int", known: [], prepared: [], cantrips: [], ...entry })),
        ...(extra.spellcasting ?? {}),
      },
    });
  const detect = facts("Detect Magic");
  // A sorcerer-wizard whose sorcerer knows Detect Magic and whose book does not hold it.
  const sorcWiz = multi([{ classId: "sorcerer", known: ["Detect Magic"] }, { classId: "wizard", spellbook: ["Alarm"], prepared: [] }]);
  assert.match(spellHeldProblem(sorcWiz, "Detect Magic", detect, { ritual: true })?.error, /as a sorcerer spell/);
  assert.equal(spellHeldProblem(sorcWiz, "Detect Magic", detect), null, "from a slot it is cast as ever");
  // The same spell written in the wizard's book is a ritual.
  const inBook = multi([{ classId: "sorcerer", known: ["Detect Magic"] }, { classId: "wizard", spellbook: ["Detect Magic"], prepared: [] }]);
  assert.equal(spellHeldProblem(inBook, "Detect Magic", detect, { ritual: true }), null);
  // A cleric's prepared ritual is castable; a paladin's is not.
  assert.equal(spellHeldProblem(multi([{ classId: "cleric", prepared: ["Detect Magic"] }]), "Detect Magic", detect, { ritual: true }), null);
  assert.match(spellHeldProblem(multi([{ classId: "paladin", prepared: ["Detect Magic"] }]), "Detect Magic", detect, { ritual: true })?.error, /paladin/);
  // Ritual Caster's book holds rituals for any class; the known list does not.
  const book = multi([{ classId: "sorcerer", known: [] }], { feats: ["Ritual Caster"], spellcasting: { spellbook: ["Detect Magic"] } });
  assert.equal(spellHeldProblem(book, "Detect Magic", detect, { ritual: true }), null);
  const unwritten = multi([{ classId: "sorcerer", known: [] }], { feats: ["Ritual Caster"], spellcasting: { spellbook: [] } });
  assert.match(spellHeldProblem(unwritten, "Detect Magic", detect, { ritual: true })?.error, /not written in/);
  // A warlock with Book of Ancient Secrets: the book, not the warlock's list.
  const patron = { features: [{ name: "Invocation: Book of Ancient Secrets", source: "class", description: "" }] };
  assert.match(spellHeldProblem(multi([{ classId: "warlock", known: ["Detect Magic"] }], patron), "Detect Magic", detect, { ritual: true })?.error, /warlock/);
  assert.equal(spellHeldProblem(multi([{ classId: "warlock", known: [] }], { ...patron, spellcasting: { spellbook: ["Detect Magic"] } }), "Detect Magic", detect, { ritual: true }), null);
});

// SRD 5.1, Longer Casting Times: "you must spend your action each turn
// casting the spell, and you must maintain your concentration while you do
// so"; Rituals: "takes 10 minutes longer to cast than normal". Ten rounds to
// the minute (src/lib/dm/long-casting-logic.ts).
test("a spell of a minute or more, or a ritual, is held for its rounds", () => {
  assert.equal(castingRoundsOf(facts("Identify"), false), 10);
  assert.equal(castingRoundsOf(facts("Identify"), true), 110);
  assert.equal(castingRoundsOf(facts("Detect Magic"), true), 100);
  assert.equal(castingRoundsOf(facts("Fireball"), false), null);
  assert.equal(castingRoundsOf(null, false), null);
  const sheet = { id: "iris", conditions: ["casting"], conditionMeta: { casting: castingInstance("iris", "Identify", 10, 1, false) } };
  assert.deepEqual(castingOf(sheet), { label: "casting Identify", spell: "Identify", slotLevel: 1, ritual: false, rounds: 10 });
  const done = { id: "iris", conditions: ["casting complete"], conditionMeta: { "casting complete": completeMark("iris", castingOf(sheet), true) } };
  assert.deepEqual(completedCastingOf(done, "identify"), { spell: "Identify", slotLevel: 1, ritual: false });
  assert.equal(completedCastingOf(done, "Fireball"), null);
});

test("a casting holds each turn's action, and gives it back if it ends first", () => {
  const held = freshBudget({ ownerId: "iris", round: 2, actionHeld: true });
  assert.equal(held.actionUsed, true);
  assert.ok(held.oncePerTurn.includes(CASTING_HELD));
  const refused = spendAction(held, "action", "the Dodge action", "Iris");
  assert.equal(refused.ok, false);
  assert.match(refused.error, /goes on the spell they are casting/);
  assert.equal(spendAttack(held, "Iris").ok, false);
  assert.equal(spendAction(held, "bonus", "Misty Step", "Iris").ok, true, "the bonus action is free");
  const back = releaseHeldAction(held);
  assert.equal(back.actionUsed, false);
  assert.equal(spendAction(back, "action", "the Dodge action", "Iris").ok, true);
});

// ---- the turn ----

const turn = (spell, budget, extra = {}) =>
  turnCharge({ who: "Iris", facts: facts(spell), spell, slotLevel: null, inFight: true, budget, reactionSpent: false, ...extra });

test("an action spell spends the action, and a second one is refused", () => {
  const first = turn("Hold Person", freshBudget({ ownerId: "pc", round: 1 }));
  assert.equal(first.kind, "budget");
  assert.equal(first.budget.actionUsed, true);
  assert.ok("error" in turn("Fireball", first.budget));
});

test("after a bonus action spell only a cantrip with the action, and the other way round", () => {
  const quick = turn("Healing Word", freshBudget({ ownerId: "pc", round: 1 }));
  assert.equal(quick.cost, "bonus action");
  assert.ok("error" in turn("Hold Person", quick.budget), "a levelled spell after a bonus action spell");
  assert.equal(turn("Fire Bolt", quick.budget).kind, "budget", "a cantrip with the action");
  const levelled = turn("Hold Person", freshBudget({ ownerId: "pc", round: 1 }));
  assert.ok("error" in turn("Healing Word", levelled.budget), "a bonus action spell after a levelled one");
});

test("out of a fight the turn is not charged; a spent reaction refuses a reaction spell", () => {
  assert.equal(turn("Hold Person", null, { inFight: false }).kind, "free");
  assert.ok("error" in turn("Shield", null, { reactionSpent: true }));
});

// F12: the bonus action spell rule is on the turn, whatever the spell is
// cast with, and Quickened Spell moves a one-action spell to the bonus action.
test("a reaction spell on one's own turn is the turn's other spell", () => {
  const quick = turn("Healing Word", freshBudget({ ownerId: "pc", round: 1 }));
  assert.match(turn("Shield", quick.budget).error ?? "", /bonus action/, "Shield after a bonus action spell, on one's own turn");
  const shield = turn("Shield", freshBudget({ ownerId: "pc", round: 1 }));
  assert.equal(shield.kind, "reaction");
  assert.ok(shield.budget, "the own turn is marked");
  assert.ok("error" in turn("Healing Word", shield.budget), "no bonus action spell after a reaction spell on the same turn");
  assert.equal(turn("Fire Bolt", shield.budget).kind, "budget", "an action spell is still free to cast");
  assert.deepEqual(reactionSpellOnOwnTurn(null, "Iris", "Shield"), { budget: null }, "on another's turn the rule does not reach");
});

test("Quickened Spell charges a one-action spell to the bonus action, once", () => {
  const paid = { ...freshBudget({ ownerId: "pc", round: 1 }), oncePerTurn: [QUICKENED] };
  const fireball = turn("Fireball", paid);
  assert.equal(fireball.cost, "bonus action");
  assert.equal(fireball.budget.actionUsed, false, "the action is still there");
  assert.ok(!fireball.budget.oncePerTurn.includes(QUICKENED), "the quickening is spent");
  assert.match(fireball.note, /Quickened Spell/);
  assert.equal(turn("Fire Bolt", fireball.budget).kind, "budget", "a cantrip with the action beside it");
  assert.ok("error" in turn("Hold Person", fireball.budget), "no levelled spell beside it");
  // A quickened cantrip leaves the action for another cantrip only.
  const bolt = turn("Fire Bolt", paid);
  assert.equal(bolt.cost, "bonus action");
  assert.ok("error" in turn("Magic Missile", bolt.budget));
});

// F27/F29: what the server leaves to the DM is named.
test("a spell settled only in part names the parts that are the DM's", () => {
  assert.equal(spellSupportFor("Teleport").kind, "partial");
  assert.equal(spellSupportFor("Time Stop").kind, "narrated");
  assert.equal(spellSupportFor("Fireball"), null);
  assert.match(spellSupportLine("Geas"), /5d10 psychic/);
});

test("an open casting counts its shares down and closes at none", () => {
  const budget = withOpenCast(freshBudget({ ownerId: "pc", round: 1 }), { spell: "Eldritch Blast", slotLevel: null, left: 1 });
  assert.deepEqual(openCastOf(budget, "eldritch blast"), { spell: "eldritch blast", slotLevel: null, left: 1 });
  const closed = withOpenCast(budget, { spell: "Eldritch Blast", slotLevel: null, left: 0 });
  assert.equal(openCastOf(closed, "Eldritch Blast"), null);
});

// ---- learning ----

test("a spell taught in play is the class's, of a castable level, with room for a cantrip", () => {
  const novice = caster({
    level: 1,
    spellcasting: { slots: { 1: { max: 2, used: 0 } }, cantrips: ["Fire Bolt", "Light", "Mage Hand"] },
  });
  assert.match(learnProblem(novice, "Wish", facts("Wish"))?.error, /level 9/);
  assert.match(learnProblem(novice, "Cure Wounds", facts("Cure Wounds"))?.error, /not on the wizard spell list/);
  assert.match(learnProblem(novice, "Ray of Frost", facts("Ray of Frost"))?.error, /cantrips/);
  assert.equal(learnProblem(novice, "Shield", facts("Shield")), null);
  assert.ok(learnProblem(novice, "Nothing Real", null));
});

test("copying a spell costs 50 gp and two hours a level", () => {
  assert.deepEqual(copyCost(facts("Fly")), { gold: 150, hours: 6 });
});

// Symbol fires later, the one glyph chosen at the inscribing, each with its
// own save (SRD 5.1). Read from the prose, the Death glyph's CON save and
// necrotic dice took the Fear glyph's frightened, so a death glyph laid it.
test("Symbol is a glyph the GM fires with the chosen glyph's own save, never a mix of two", () => {
  const { mech } = spellMechanicsFor({ spell: "Symbol" });
  assert.equal(mech.resolution, "utility");
  assert.equal(mech.condition, undefined);
  assert.equal(mech.noDamage, true);
  for (const glyph of ["Death CON 10d10 necrotic, half", "Discord CON", "Fear WIS frightened", "Hopelessness CHA", "Insanity INT", "Pain CON incapacitated", "Sleep WIS unconscious 10 min", "Stunning WIS stunned"]) {
    assert.ok(mech.note.includes(glyph), glyph);
  }
});

test("the nine materials a single price cannot hold are kept as printed", () => {
  const sum = (name, units = 1) => materialComponents({ ...facts(name), material: true }).reduce((total, part) => total + part.gp * part.count * (part.per ? units : 1), 0);
  assert.equal(sum("Clone"), 3000);
  assert.deepEqual(materialComponents({ ...facts("Clone"), material: true }).map((part) => part.consumed), [true, false], "the diamond is consumed, the vessel kept");
  assert.equal(sum("Astral Projection", 3), 3300, "1,100 gp for each of three creatures");
  assert.equal(sum("Create Undead", 4), 600, "150 gp a corpse");
  assert.equal(sum("Imprisonment", 10), 5000, "500 gp a Hit Die");
  assert.equal(sum("Legend Lore"), 450, "250 gp of incense and four 50 gp ivory strips");
  // The pack's own row misprints the incense ("worth 250 inches that fate
  // consumes"); read as printed it cost 200 gp, the ivory alone.
  assert.deepEqual(
    materialOf({ material: "Incense worth 250 inches that fate consumes and four sticks of ivory worth 50 gp each." }),
    { text: "Incense worth 250 gp, which the spell consumes and four sticks of ivory worth 50 gp each.", costGp: 450, consumed: true },
  );
  assert.equal(sum("Magnificent Mansion"), 15, "three items of 5 gp");
  assert.equal(sum("Warding Bond"), 100, "two rings of 50 gp");
  assert.equal(sum("Secret Chest"), 5050);
  assert.equal(sum("Simulacrum"), 1500);
  // Two rings, each worth 50: one 100 gp ring is not a pair.
  const bond = { ...facts("Warding Bond"), material: true };
  assert.ok("error" in materialPlan(caster({ equipment: [{ name: "Platinum ring", qty: 1, worth: 100 }] }), bond, { inFight: true }));
  const pair = materialPlan(caster({ equipment: [{ name: "Platinum ring", qty: 2, worth: 50 }] }), bond, { inFight: true });
  assert.deepEqual(pair.uses.map((use) => use.take), [2]);
  // Imprisonment counts the target's Hit Dice.
  const prison = { ...facts("Imprisonment"), material: true };
  assert.match(materialPlan(caster({ gold: 100000 }), prison).error, /per Hit Die of its target: send units with the target.s Hit Dice/, "the refusal names the field that carries them");
  assert.equal(materialPlan(caster({ gold: 100000 }), prison, { units: 10 }).bought[0].copper, 500000);
});

test("a material with no price needs a component pouch or the class's focus", () => {
  const fireball = facts("Fireball");
  assert.match(focusProblem(caster(), fireball)?.error, /component pouch or an arcane focus/);
  assert.equal(focusProblem(caster({ equipment: [{ name: "Component pouch", qty: 1 }] }), fireball), null);
  assert.equal(focusProblem(caster({ equipment: [{ name: "Crystal", qty: 1 }] }), fireball), null);
  // A holy symbol is a cleric's focus, not a wizard's.
  assert.ok(focusProblem(caster({ equipment: [{ name: "Holy symbol", qty: 1 }] }), fireball));
  assert.equal(focusProblem(caster(), facts("Magic Missile")), null, "no material, nothing to hold");
});

test("War Caster frees the gestures with both hands full, never the material", () => {
  const full = { equipment: [{ name: "Longsword", qty: 1, equipped: true }, { name: "Shield", qty: 1, equipped: true }], feats: ["War Caster"] };
  assert.equal(componentProblem(caster(full), facts("Shocking Grasp") ?? facts("Magic Missile")), null);
  assert.match(componentProblem(caster(full), facts("Fireball"))?.error, /War Caster frees the gestures, not the material/);
});

const { castRefusalDisplay } = await import("../src/lib/dm/cast-refusal-display.ts");
const { installCatalog, translate } = await import("../src/lib/i18n/translate.ts");
for (const locale of ["cs", "fr"]) {
  installCatalog(locale, JSON.parse(readFileSync(new URL(`../src/lib/i18n/${locale}.json`, import.meta.url), "utf8")));
}
test("casting refusals use the reader's locale and preserve the rules and identities", () => {
  const iris = caster({ name: "Iris (A+B)", conditions: ["raging"] });
  const before = structuredClone(iris);
  const cases = [
    casterStateProblem(iris),
    componentProblem(caster({ name: iris.name, conditions: ["silenced"] }), facts("Magic Missile")),
    focusProblem(caster({ name: iris.name }), facts("Fireball")),
    spellHeldProblem(iris, "Fly", facts("Fly")),
    spellHeldProblem(iris, "Detect Magic", facts("Detect Magic")),
    spellHeldProblem(iris, "Counterspell", facts("Counterspell")),
    slotPlan(iris, "Fireball", facts("Fireball"), 1),
    slotPlan(caster({ name: iris.name, spellcasting: { slots: { 3: { max: 1, used: 1 } } } }), "Fireball", facts("Fireball"), 3),
    ritualProblem(iris, "Fireball", facts("Fireball")),
  ];
  for (const refusal of cases) {
    assert.equal(typeof refusal?.error, "string");
    const canonical = structuredClone(refusal);
    for (const locale of ["en", "cs", "fr"]) {
      const t = (key, vars) => translate(locale, key, vars);
      const display = castRefusalDisplay(refusal.error, t, iris.name);
      assert.equal(display === refusal.error, locale === "en", refusal.error);
      assert.doesNotMatch(display, /\{\w+\}/);
      if (refusal.error.includes(iris.name)) assert.ok(display.includes(iris.name));
      assert.equal(castRefusalDisplay("Unrecognized refusal.", t, iris.name), "Unrecognized refusal.");
      assert.deepEqual(refusal, canonical);
    }
  }
  assert.deepEqual(iris, before);
  const t = (key, vars) => translate("cs", key, vars);
  const raw = casterStateProblem(iris).error;
  assert.equal(castRefusalDisplay(raw, t, "Another actor"), raw);
  const custom = 'Iris (A+B) cannot cast "Custom [A+B]": it is not among the spells they know or have prepared (none).';
  assert.match(castRefusalDisplay(custom, t, iris.name), /Custom \[A\+B\]/);
  assert.equal(castRefusalDisplay(custom + " Unrecognized tail.", t, iris.name), custom + " Unrecognized tail.");
});


test("delegated cast refusals translate complete producer templates without changing their payload", () => {
  const vars = {"name":"Iris (A+B)","spell":"Custom [A+B]","condition":"stunned","source":"Custom Grant","limit":"on yourself","feature":"Custom Drone","owner":"Other (A+B)","time":"1 minute","ring":"Ring [A+B]","level":"6","free":"1","total":"5","range":"30","x":"4","y":"8","distance":"40"};
  const templates = [
    "{spell} is from the 2024 rules, which this server does not play; pick a 2014 spell in its place. Nothing was spent.",
    "{name} is dead and cannot spend a spell slot.",
    "{name} is at 0 HP and cannot spend a spell slot.",
    "{name} is {condition} and cannot spend a spell slot until the condition ends.",
    "{spell} brings its creatures in with their stat blocks: cast it with cast_buff, the creature in variant (and count for fewer). Nothing was spent.",
    "{name} casts {spell} through {source} only {limit}; this casting is not, and no spell slot of theirs casts it. Nothing was spent.",
    "{spell} has a material component: {name}'s focus is their drone ({feature}), and no drone of theirs stands (Drone Companion builds them out of a fight; a component pouch serves too). Nothing was spent.",
    "{name} stands inside Antimagic Field, where no spell can be cast. Step out of it first. Nothing was spent.",
    "{name} stands inside {owner}'s Antimagic Field, where no spell can be cast. Step out of it first. Nothing was spent.",
    "{spell} came to {name} through Marginalia, which casts it as a ritual only: cast it with ritual true (ten minutes longer, no slot). Nothing was spent.",
    "{spell} takes {time} to cast. In a fight it is begun with use_spell_slot: the server holds the casting across {name}'s turns (their action on each, their concentration throughout) and spends the slot when it is complete, and then this tool resolves its effect. Nothing was spent.",
    "{name} used Arcane Deflection and casts only cantrips until the end of their next turn, so {spell} is not cast. Nothing was spent.",
    "No Ring of Spell Storing named \"{ring}\" is there to hold {spell}. Nothing was spent.",
    "{ring} stores spells of 1st through 5th level, not level {level}. Nothing was spent.",
    "{ring} has {free} of {total} levels free, and {spell} at level {level} does not fit. Nothing was spent.",
    "{spell} is laid within {range} feet of {name}, and ({x},{y}) is {distance} feet away. Name a square within range. Nothing was spent.",
    "A wall stands between {name} and ({x},{y}): {spell} needs a clear path to where it is laid. Name a square {name} can see. Nothing was spent.",
    "Slow holds {spell} back (the d20 came up 11 or higher): the slot and this turn's action are spent and the spell does not take effect yet. On {name}'s next turn, cast it again with its tool to complete it: that spends their action and no slot. If they do not, the spell is wasted. Do not resolve it now.",
    "{spell} is cast as a reaction: use_reaction with feature \"{spell}\" when its trigger happens; the server checks the trigger and applies it. Nothing was spent."
  ];
  for (const key of templates) {
    const raw = translate("en", key, vars);
    for (const locale of ["en", "cs", "fr"]) {
      const t = (message, values) => translate(locale, message, values);
      const result = castRefusalDisplay(raw, t, vars.name);
      assert.equal(result, t(key, { ...vars, condition: t(vars.condition) }), key);
      assert.equal(result === raw, locale === "en", key);
      assert.doesNotMatch(result, /\\{\\w+\\}/);
      assert.equal(castRefusalDisplay(raw + " Unknown suffix.", t, vars.name), raw + " Unknown suffix.");
    }
  }
  const raw = translate("en", templates[3], vars);
  assert.equal(castRefusalDisplay(raw, (key, values) => translate("cs", key, values), "Different actor"), raw);
});


test("held-spell refusal with ring advice localizes both known sentences only", () => {
  const iris = caster({ name: "Iris (A+B)" });
  const ring = "Custom Ring [A+B]";
  const suffix = "{ring} holds it: use_item with spell casts it from there, then cast it with this tool.";
  const templates = [
    "{name} has no Spellcasting feature and cannot cast spells.",
    "{name} cannot cast \"{spell}\": it is not among the spells they know or have prepared ({ready}).",
    "No spell called \"{spell}\" is known. {name} knows or has prepared {ready}: send the one meant, by the name on the sheet.",
    "{spell} is chosen but not prepared yet: it becomes ready after the next long rest.",
    "{spell} is in the spellbook but not prepared, so it cannot be cast. Prepare it from the sheet; it is ready after the next long rest.",
    "{name} casts {spell} through {source} as a ritual only: ten minutes longer, no slot. Send ritual true.",
    "{name} casts {spell} through {source} for {cost} {resource}, and has {left} left. It comes back after a {rest} rest.",
    "{name} casts {spell} through {source} {times}, and again after a {rest} rest; {uses} spent.",
    "{name} holds {spell} as a {classId} spell, and a {classId}'s Spellcasting does not cast rituals (bards, clerics, druids, wizards and artificers do, through their own spells). It can be cast from a slot instead.",
    "{spell} is not written in {name}'s ritual book, so it cannot be cast as a ritual. It goes in the book first (a ritual of a level they can cast, found and copied), or it is cast from a slot."
  ];
  const vars = { name: iris.name, spell: "Custom [A+B]", source: "Custom Grant", ready: "none", cost: 2, resource: "Custom Pool", left: 0, rest: "long", times: "once", uses: "that use is", classId: "fighter" };
  const actual = spellHeldProblem(iris, "Counterspell", facts("Counterspell"));
  assert.equal(typeof actual?.error, "string");
  const messages = [actual.error, ...templates.map((key) => translate("en", key, vars))];
  for (const base of messages) {
    const advice = translate("en", suffix, { ring });
    const raw = base + " " + advice;
    for (const locale of ["en", "cs", "fr"]) {
      const t = (key, values) => translate(locale, key, values);
      const result = castRefusalDisplay(raw, t, iris.name);
      assert.equal(result, castRefusalDisplay(base, t, iris.name) + " " + t(suffix, { ring }));
      assert.equal(result === raw, locale === "en");
      assert.ok(result.includes(ring));
      assert.equal(castRefusalDisplay(raw + " Unknown tail.", t, iris.name), raw + " Unknown tail.");
      const unknown = "Unknown refusal. " + advice;
      assert.equal(castRefusalDisplay(unknown, t, iris.name), unknown);
    }
  }
  const raw = actual.error + " " + translate("en", suffix, { ring });
  assert.equal(castRefusalDisplay(raw, (key, values) => translate("cs", key, values), "Different actor"), raw);
});


test("sorcery point refusals preserve counts, identities and unknown wording", () => {
  const templates = [
    [
      "{name} has 1 sorcery point left, and {spell} through {feature} costs {cost}. Nothing was spent.",
      "{name} má ještě 1 čarodějný bod a seslání kouzla {spell} díky {feature} stojí {cost} bodů. Nic nebylo utraceno.",
      "Il reste 1 point de sorcellerie à {name}, et lancer {spell} grâce à {feature} coûte {cost} points. Rien n’a été dépensé."
    ],
    [
      "{name} has {left} sorcery points left, and {spell} through {feature} costs {cost}. Nothing was spent.",
      "{name}: zbývající čarodějné body: {left}. Seslání kouzla {spell} díky {feature} stojí {cost} bodů. Nic nebylo utraceno.",
      "Il reste {left} points de sorcellerie à {name}, et lancer {spell} grâce à {feature} coûte {cost} points. Rien n’a été dépensé."
    ]
  ];
  const vars = {"name":"Iris (A+B)","spell":"Custom [A+B]","feature":"Custom Feature [A+B]","cost":"3","level":"9","left":"2"};
  for (const left of ["0", "1", "2"]) {
    const [en, cs, fr] = templates[left === "1" ? 0 : 1];
    const values = { ...vars, left };
    const raw = translate("en", en, values);
    for (const [locale, expected] of [["en", en], ["cs", cs], ["fr", fr]]) {
      const t = (key, input) => translate(locale, key, input);
      const filled = translate("en", expected, values);
      assert.equal(castRefusalDisplay(raw, t, vars.name), filled);
      assert.equal(castRefusalDisplay(raw, t, "Different actor"), raw);
      assert.equal(castRefusalDisplay(raw + " Unknown tail.", t, vars.name), raw + " Unknown tail.");
    }
  }
  const t = (key, input) => translate("cs", key, input);
  for (const [left, cost] of [["1", "3"], ["02", "3"], ["-1", "3"], ["3", "3"], ["2", "1"], ["2", "3.5"]]) {
    const raw = translate("en", templates[1][0], { ...vars, left, cost });
    assert.equal(castRefusalDisplay(raw, t, vars.name), raw);
  }
});

test("known enemy Counterspell refusals preserve actor and check identity", () => {
  const fixtures = [
    [
      "{enemy} casts Counterspell (its reaction, a level-{slot} slot): {name}'s {spell} fails. The slot and the action {name} cast it with are spent; do not resolve the spell or cast it again.",
      "Tvor {enemy} sesílá Counterspell (svou reakcí, z pozice {slot}. úrovně): kouzlo {spell} postavy {name} selhalo. Pozice kouzla i akce, kterou je postava {name} seslala, byly utraceny; nevyhodnocuj kouzlo ani je znovu nesesílej."
    ],
    [
      "{enemy} casts Counterspell (its reaction, a level-{slot} slot) ({ability} check {rolled} against DC {dc}): {name}'s {spell} fails. The slot and the action {name} cast it with are spent; do not resolve the spell or cast it again.",
      "Tvor {enemy} sesílá Counterspell (svou reakcí, z pozice {slot}. úrovně) (ověření {ability}: {rolled} proti SO {dc}): kouzlo {spell} postavy {name} selhalo. Pozice kouzla i akce, kterou je postava {name} seslala, byly utraceny; nevyhodnocuj kouzlo ani je znovu nesesílej."
    ]
  ];
  const vars = {"enemy":"Enemy [C+D]","name":"Iris (A+B)","spell":"Custom [A+B]","slot":"3","ability":"INT","rolled":"17","dc":"15"};
  for (const [en, cs] of fixtures) {
    const raw = translate("en", en, vars);
    for (const [locale, expected] of [["en", en], ["cs", cs], ["fr", en]]) {
      const t = (key, values) => translate(locale, key, values);
      assert.equal(castRefusalDisplay(raw, t, vars.name), translate("en", expected, vars));
      assert.equal(castRefusalDisplay(raw, t, "Different actor"), raw);
      assert.equal(castRefusalDisplay(raw + " Unknown tail.", t, vars.name), raw + " Unknown tail.");
    }
  }
  const t = (key, values) => translate("cs", key, values);
  for (const invalid of [{"slot":"2"},{"slot":"04"},{"slot":"9"},{"dc":"13"},{"dc":"20"},{"rolled":"14"},{"rolled":"17.5"},{"ability":"XYZ"}]) {
    const raw = translate("en", fixtures[1][0], { ...vars, ...invalid });
    assert.equal(castRefusalDisplay(raw, t, vars.name), raw);
  }
  const different = translate("en", fixtures[0][0], vars).replace("action Iris (A+B)", "action Another actor");
  assert.equal(castRefusalDisplay(different, t, vars.name), different);
});

test("Awakened Spellbook refuses with complete localized advice and preserves source identities", () => {
  const fixtures = [
    [
      true,
      "Awakened Spellbook changes the damage type of a wizard spell from {name}'s spellbook, and {spell} is not in it. Leave the damage type out for {spell}'s own ({ownDamage}). Nothing was spent.",
      "Awakened Spellbook mění typ zranění kouzelnického kouzla z knihy kouzel postavy {name}, ale kouzlo {spell} v ní není. Pro použití vlastního typu zranění kouzla {spell} ({ownDamage}) typ zranění nezadávej. Nic nebylo utraceno."
    ],
    [
      false,
      "Awakened Spellbook changes the damage type of a spell cast with a spell slot, and this casting of {spell} spends none. Leave the damage type out for {spell}'s own ({ownDamage}). Nothing was spent.",
      "Awakened Spellbook mění typ zranění kouzla seslaného za použití pozice kouzla, ale toto seslání kouzla {spell} žádnou pozici nespotřebuje. Pro použití vlastního typu zranění kouzla {spell} ({ownDamage}) typ zranění nezadávej. Nic nebylo utraceno."
    ],
    [
      true,
      "Awakened Spellbook takes a damage type found in another spell of the slot's level in {name}'s spellbook, and no other level {bookLevel} spell there deals {askedDamage} damage (no other damaging spell of that level is in the book). Leave the damage type out for {spell}'s own ({ownDamage}). Nothing was spent.",
      "Awakened Spellbook umožňuje použít typ zranění jiného kouzla z knihy kouzel postavy {name}, které má stejnou úroveň jako použitá pozice. Žádné jiné kouzlo {bookLevel}. úrovně v knize nepůsobí zranění typu {askedDamage} (v knize není žádné jiné zraňující kouzlo této úrovně). Pro použití vlastního typu zranění kouzla {spell} ({ownDamage}) typ zranění nezadávej. Nic nebylo utraceno."
    ],
    [
      true,
      "Awakened Spellbook takes a damage type found in another spell of the slot's level in {name}'s spellbook, and no other level {bookLevel} spell there deals {askedDamage} damage: the level {bookLevel} spells there deal {bookTypes}. Leave the damage type out for {spell}'s own ({ownDamage}). Nothing was spent.",
      "Awakened Spellbook umožňuje použít typ zranění jiného kouzla z knihy kouzel postavy {name}, které má stejnou úroveň jako použitá pozice. Žádné jiné kouzlo {bookLevel}. úrovně v knize nepůsobí zranění typu {askedDamage}. Typy zranění kouzel {bookLevel}. úrovně z této knihy: {bookTypes}. Pro použití vlastního typu zranění kouzla {spell} ({ownDamage}) typ zranění nezadávej. Nic nebylo utraceno."
    ]
  ];
  const vars = {"name":"Iris (A+B)","spell":"Custom [A+B]","ownDamage":"cold","askedDamage":"fire","bookLevel":"3","bookTypes":"acid (Custom [C+D]), lightning (Other (E+F))"};
  for (const [hasActor, en, cs] of fixtures) {
    const raw = translate("en", en, vars);
    for (const [locale, expected] of [["en", en], ["cs", cs], ["fr", en]]) {
      const t = (key, values) => translate(locale, key, values);
      assert.equal(castRefusalDisplay(raw, t, vars.name), translate("en", expected, vars));
      if (hasActor) assert.equal(castRefusalDisplay(raw, t, "Different actor"), raw);
      assert.equal(castRefusalDisplay(raw + " Unknown tail.", t, vars.name), raw + " Unknown tail.");
    }
  }
  const t = (key, values) => translate("cs", key, values);
  for (const [index, invalid] of [[0,{"ownDamage":""}],[0,{"spell":"Unknown sentence. Custom"}],[2,{"bookLevel":"0"}],[2,{"bookLevel":"10"}],[2,{"bookLevel":"03"}],[2,{"askedDamage":""}],[3,{"bookTypes":"unknown list"}],[3,{"bookTypes":"acid (Custom). Unknown sentence"}],[3,{"bookTypes":""}]]) {
    const raw = translate("en", fixtures[index][1], { ...vars, ...invalid });
    assert.equal(castRefusalDisplay(raw, t, vars.name), raw);
  }
  const wrongSpell = translate("en", fixtures[0][1], vars).replace("for Custom [A+B]'s own", "for Another spell's own");
  assert.equal(castRefusalDisplay(wrongSpell, t, vars.name), wrongSpell);
  const wrongLevel = translate("en", fixtures[3][1], vars).replace("the level 3 spells", "the level 4 spells");
  assert.equal(castRefusalDisplay(wrongLevel, t, vars.name), wrongLevel);
});

console.log(`test-cast-rules: ${passed} passed`);
