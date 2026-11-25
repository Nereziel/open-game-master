// The monster editor's closed groups say what they hold
// (src/app/workshop/bestiary/monster-folds.ts): a set part is never hidden
// unseen, and an empty one says what would go there.
import assert from "node:assert/strict";
import { register } from "node:module";

register("./lib/register-alias.mjs", import.meta.url);
const { monsterFoldSummary } = await import("../src/app/workshop/bestiary/monster-folds.ts");
const { gameTermWord } = await import("../src/lib/i18n/game-term-labels.ts");

const bare = { name: "Goblin", extraDamagePerRound: 0, stats: { traits: [], attacks: [] } };
assert.match(monsterFoldSummary("actions", bare), /^None yet/);
assert.match(monsterFoldSummary("spellcasting", bare), /^None/);
assert.equal(monsterFoldSummary("regeneration", bare), "None");
assert.equal(monsterFoldSummary("senses", bare), "None set");

const troll = {
  ...bare,
  stats: {
    traits: ["Keen Smell", "Regeneration"],
    attacks: [],
    routines: [[{ attack: "Bite", count: 1 }]],
    regeneration: { amount: 10, stoppedBy: ["acid", "fire"] },
    senses: { darkvision: 60 },
    skills: { perception: 2 },
    languages: "Giant",
  },
};
assert.equal(monsterFoldSummary("actions", troll), "a Multiattack routine · 2 trait lines");
assert.equal(monsterFoldSummary("regeneration", troll), "Regains 10 hit points a turn, stopped by acid or fire");
assert.equal(monsterFoldSummary("senses", troll), "1 skill · darkvision 60 ft · Giant");

const mage = { ...bare, stats: { traits: [], attacks: [], spellcasting: { dc: 14, attack: 6, slots: { 1: 4 }, spells: [{ name: "Magic Missile" }, { name: "Shield" }] } } };
assert.equal(monsterFoldSummary("spellcasting", mage), "2 spells · save DC 14 · +6 to hit");
// Shared term labels: all supported values, both translated locales,
// English compatibility, and no translation of an unknown engine key.
const terms = {
  size: [
    ["Tiny", "Très petite", "Drobný"], ["Small", "Petite", "Malý"],
    ["Medium", "Moyenne", "Střední"], ["Large", "Grande", "Velký"],
    ["Huge", "Très grande", "Obrovský"], ["Gargantuan", "Gigantesque", "Gigantický"],
  ],
  creatureType: [
    ["aberration", "Aberration", "Zrůda"], ["beast", "Bête", "Zvíře"],
    ["celestial", "Céleste", "Nebešťan"], ["construct", "Artificiel", "Výtvor"],
    ["dragon", "Dragon", "Drak"], ["elemental", "Élémentaire", "Elementál"],
    ["fey", "Fée", "Víla"], ["fiend", "Fiélon", "Běs"],
    ["giant", "Géant", "Obr"], ["humanoid", "Humanoïde", "Humanoid"],
    ["monstrosity", "Monstrosité", "Obluda"], ["ooze", "Vase", "Sliz"],
    ["plant", "Plante", "Rostlina"], ["undead", "Mort-vivant", "Nemrtvý"],
  ],
  movement: [
    ["walk", "marche", "chůze"], ["burrow", "fouissement", "hrabání"],
    ["climb", "escalade", "šplhání"], ["fly", "vol", "létání"], ["swim", "nage", "plavání"],
  ],
  sense: [
    ["darkvision", "vision dans le noir", "vidění ve tmě"],
    ["blindsight", "vision aveugle", "mimozrakové vnímání"],
    ["tremorsense", "perception des vibrations", "citlivost na otřesy"],
    ["truesight", "vision lucide", "pravdivé vidění"],
  ],
  dragonColor: [
    ["black", "Noir", "Černý"], ["blue", "Bleu", "Modrý"],
    ["brass", "Airain", "Mosazný"], ["bronze", "Bronze", "Bronzový"],
    ["copper", "Cuivre", "Měděný"], ["gold", "Or", "Zlatý"],
    ["green", "Vert", "Zelený"], ["red", "Rouge", "Rudý"],
    ["silver", "Argent", "Stříbrný"], ["white", "Blanc", "Bílý"],
  ],
};
for (const [kind, rows] of Object.entries(terms)) {
  for (const [key, fr, cs] of rows) {
    const en = kind === "creatureType" ? key.charAt(0).toUpperCase() + key.slice(1) : key;
    assert.equal(gameTermWord(kind, key, "en"), en);
    assert.equal(gameTermWord(kind, key, "fr"), fr);
    assert.equal(gameTermWord(kind, key, "cs"), cs);
  }
  for (const locale of ["en", "fr", "cs"]) {
    assert.equal(gameTermWord(kind, "Custom", locale), "Custom");
  }
}
const canonical = JSON.stringify(troll);
assert.match(monsterFoldSummary("senses", troll, undefined, "cs"), /vidění ve tmě 60 ft/);
assert.match(monsterFoldSummary("senses", troll, undefined, "fr"), /vision dans le noir 60 ft/);
assert.equal(JSON.stringify(troll), canonical);
console.log("test-monster-folds: ok");
