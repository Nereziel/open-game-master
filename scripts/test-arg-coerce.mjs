// Model-supplied tool arguments: an ability's rules name reaches its id; a
// fixed choice's other values are refused with the listed values, never
// guessed from English words ("adv", "save", "trivial", "vantaggio" alike).
import assert from "node:assert/strict";
import { register } from "node:module";

register("./lib/register-alias.mjs", import.meta.url);

const { normalizeAbility } = await import("../src/lib/dm/arg-coerce.ts");
const { rollArgsSchema } = await import("../src/lib/dm/roll-args.ts");
const { invalidArguments } = await import("../src/lib/dm/tool-errors.ts");
const { canonicalMcpToolArgs } = await import("../src/lib/agents/czech-tool-args.ts");

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
}

test("normalizeAbility: full names, punctuation, phrases", () => {
  assert.equal(normalizeAbility("Wisdom"), "wis");
  assert.equal(normalizeAbility("DEX"), "dex");
  assert.equal(normalizeAbility("strength save"), "str");
  assert.equal(normalizeAbility("wis."), "wis");
  assert.equal(normalizeAbility("constitution"), "con");
  assert.equal(normalizeAbility("charm"), "charm");
  assert.equal(normalizeAbility(3), 3);
});

test("a fixed choice takes its listed values only, in any table language", () => {
  const refusal = (args) => {
    const parsed = rollArgsSchema.safeParse(args);
    assert.ok(!parsed.success, JSON.stringify(args));
    return invalidArguments("Invalid request_roll arguments.", parsed.error).error;
  };
  for (const kind of ["save", "saving throw", "tiro salvezza", "jet de sauvegarde", "Rettungswurf"]) {
    assert.match(refusal({ kind }), /^Invalid request_roll arguments\. \(kind: Invalid option: expected one of "skill_check"\|"saving_throw"/);
  }
  for (const advantage of ["adv", "with advantage", "vantaggio", "avantage", "ventaja", "Vorteil"]) {
    assert.match(refusal({ kind: "attack", advantage }), /advantage: Invalid option: expected one of "none"\|"advantage"\|"disadvantage"/);
  }
  for (const difficulty of ["trivial", "medium", "impossible", "difficile", "schwer"]) {
    assert.match(refusal({ kind: "skill_check", skill: "athletics", difficulty }), /difficulty: Invalid option: expected one of "very_easy"/);
  }
  assert.equal(rollArgsSchema.parse({ kind: "saving_throw", ability: "dex", advantage: "advantage" }).advantage, "advantage");
  // A tier spaced or hyphenated is still that tier.
  assert.equal(rollArgsSchema.parse({ kind: "skill_check", skill: "athletics", difficulty: "very hard" }).dc, 25);
  assert.equal(rollArgsSchema.parse({ kind: "skill_check", skill: "athletics", difficulty: "nearly-impossible" }).dc, 30);
});

test("every refused field is named, each with zod's reason", () => {
  const parsed = rollArgsSchema.safeParse({ kind: "attack roll", advantage: "adv" });
  assert.ok(!parsed.success);
  const { error, retry } = invalidArguments("Invalid request_roll arguments.", parsed.error);
  assert.equal(retry, true);
  assert.match(error, /kind: Invalid option[^;]*; advantage: Invalid option/);
});

test("MCP: Czech names resolve to canonical rule arguments, not Czech tool identifiers", () => {
  const args = canonicalMcpToolArgs("request_roll", { kind: "skill_check", skill: "Plížení", ability: "Moudrost", reason: "Ověření pod oknem" });
  assert.deepEqual(args, { kind: "skill_check", skill: "stealth", ability: "wis", reason: "Ověření pod oknem" });
  assert.equal(rollArgsSchema.parse(args).skill, "stealth");
  assert.equal(rollArgsSchema.parse(args).ability, "wis");
  assert.equal(canonicalMcpToolArgs("request_roll", { skill: "Mystika" }).skill, "arcana");
  assert.equal(canonicalMcpToolArgs("request_roll", { skill: "Magie" }).skill, "arcana");
  assert.equal(canonicalMcpToolArgs("request_roll", { skill: "Zacházení se zvířaty" }).skill, "animal_handling");
  assert.equal(canonicalMcpToolArgs("request_roll", { ability: "Síla" }).ability, "str");
});

test("MCP: spell, creature and condition aliases keep exact target and character IDs", () => {
  const spell = canonicalMcpToolArgs("cast_at_enemy", { spell: "Ohnivá koule", targetEnemyId: "ghúl", casterCharacterId: "123-abc" });
  assert.deepEqual(spell, { spell: "Fireball", targetEnemyId: "ghúl", casterCharacterId: "123-abc" });
  const attack = canonicalMcpToolArgs("pc_attack", {
    characterId: "PC0",
    attacks: [{ spell: "Ohnivá střela", targetEnemyId: "Goblin-1" }, { weapon: "Dagger", targetEnemyId: "Goblin-2" }],
  });
  assert.deepEqual(attack.attacks, [{ spell: "Fire Bolt", targetEnemyId: "Goblin-1" }, { weapon: "Dagger", targetEnemyId: "Goblin-2" }]);
  assert.equal(canonicalMcpToolArgs("set_condition", { condition: "Otrávený" }).condition, "poisoned");
  assert.equal(canonicalMcpToolArgs("check_notice", { againstMonster: "Ghúl" }).againstMonster, "Ghoul");
});

test("MCP: connected GM invocation is normalized but every non-GM method is untouched", () => {
  const incoming = {
    campaignId: "abc", name: "cast_buff", args: { spell: "Požehnání", targetCharacterIds: ["Hráč"] },
  };
  assert.deepEqual(canonicalMcpToolArgs("odm_dm_invoke", incoming), {
    campaignId: "abc", name: "cast_buff", args: { spell: "Bless", targetCharacterIds: ["Hráč"] },
  });
  const text = { campaignId: "abc", content: "Sesílám Ohnivou kouli na ghúla.", name: "Ohnivá koule" };
  assert.strictEqual(canonicalMcpToolArgs("odm_dm_narrate", text), text);
  const unknown = { item: "Osobní meč", targetEnemyId: "Ghúl", name: "Bojovník" };
  assert.deepEqual(canonicalMcpToolArgs("grant_item", unknown), unknown);
});

console.log(`test-arg-coerce: ${passed} tests passed`);
