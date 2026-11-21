// The name dice on the builder's first step: a roll fits the lineage chosen
// so far, a world pack's people come first, and a roll never hands back the
// name already in the field.
import assert from "node:assert/strict";
import { register } from "node:module";

register("./lib/register-alias.mjs", import.meta.url);

const { rollHeroName } = await import("../src/app/characters/builder/heroNames.ts");

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

test("a dwarf's roll is a dwarf's name: a given name and a family name", () => {
  for (let index = 0; index < 50; index += 1) {
    const name = rollHeroName({ raceId: "hill_dwarf" });
    assert.match(name, /^\S+ \S+$/);
    assert.match(name.split(" ")[1], /Stoutheart|Ironfoot|Gravelbeard|Deepdelve|Hammerfall|Coppervein|Stonemantle/);
  }
});

test("before a lineage is chosen, the roll still gives a full name", () => {
  assert.match(rollHeroName({}), /^\S+ \S+$/);
});

test("a world pack's people are rolled instead", () => {
  const packNames = ["Maren Tidewright", "Oskel Brine"];
  for (let index = 0; index < 20; index += 1) {
    assert.ok(packNames.includes(rollHeroName({ raceId: "human", packNames })));
  }
});

test("a roll never repeats the name already in the field", () => {
  const packNames = ["Maren Tidewright", "Oskel Brine"];
  for (let index = 0; index < 20; index += 1) {
    assert.equal(rollHeroName({ packNames, current: "Maren Tidewright" }), "Oskel Brine");
  }
});

test("Czech name dice offer localized names across lineages while English remains unchanged", () => {
  for (const raceId of ["human", "hill_dwarf", "high_elf", "lightfoot_halfling", "forest_gnome", "half_orc", "dragonborn", "tiefling"]) {
    const first = rollHeroName({ raceId, locale: "cs", rng: () => 0.1 });
    assert.ok(first.includes(" "), `${raceId}: ${first}`);
    assert.ok(!/Ashvale|Stoutheart|Moonbrook|Copperpot|Cogsworth|Ironjaw|Ashscale/i.test(first), first);
    const changed = rollHeroName({ raceId, locale: "cs", current: first, rng: () => 0.1 });
    assert.notEqual(changed, first, "same hero name should never repeat");
  }
  const inEnglish = rollHeroName({ raceId: "human", locale: "en", rng: () => 0 });
  assert.equal(inEnglish, "Rowan Ashvale");
  const csWithEnglishPack = rollHeroName({ raceId: "human", locale: "cs", packNames: ["Maren Tidewright"], rng: () => 0 });
  assert.equal(csWithEnglishPack, "Radovan Záleský", "Czech dice must not prioritize untranslated world-pack seeds");
});

console.log(`\ntest-hero-names: ${passed} tests passed.`);
