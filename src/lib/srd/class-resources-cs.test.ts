import { describe, expect, it } from "vitest";
import { installCsTables } from "../i18n/cs-tables";
import { CS_NAMES_BY_TABLE } from "../content/names-cs";
import { RESOURCE_CS_GUIDANCE } from "./class-resources-cs-data";
import { resourceDisplayName, resourceGuidance } from "./class-resources-fr";
import { RESOURCE_DEFS } from "./class-resources";
import genreResources from "../classes/resources.json";
import authoredResources from "./authored-resources.json";

installCsTables({ names: CS_NAMES_BY_TABLE, guidance: RESOURCE_CS_GUIDANCE });

describe("Czech class resource display alongside French", () => {
  it("covers every statically registered resource including manually authored genre counters", () => {
    for (const def of RESOURCE_DEFS) {
      expect(resourceDisplayName(def.id, "cs"), def.id).toBeTruthy();
      expect(resourceGuidance(def.id, "cs"), def.id).toBeTruthy();
      expect(resourceGuidance(def.id, "cs"), def.id).not.toBe(def.guidance);
      expect(resourceDisplayName(def.id, "en"), def.id).toBeNull();
      expect(resourceGuidance(def.id, "en"), def.id).toBeNull();
    }
  });

  it("covers the core resource guidance and every generated genre counter", () => {
    const coreIds = [
      "rage",
      "ki",
      "sorcery_points",
      "luck_points",
      "ki_inner_resilience",
      "superiority_dice_martial_adept",
      "sorcery_points_metamagic_adept",
      "inspiring_leader",
      "chef_treats",
      "second_wind",
      "action_surge",
      "channel_divinity",
      "bardic_inspiration",
      "wild_shape",
      "lay_on_hands",
      "divine_sense",
      "relentless_endurance",
      "arcane_recovery",
      "natural_recovery",
      "breath_weapon",
      "indomitable",
      "cleansing_touch",
      "stroke_of_luck",
      "one_with_shadows",
      "elemental_affinity",
      "dragon_wings",
      "draconic_presence",
      "inspiration",
      "relentless_rage",
      "wholeness_of_body",
      "eldritch_master",
      "signature_spell_1",
      "signature_spell_2",
      "overchannel",
      "dark_ones_own_luck",
      "hurl_through_hell",
      "holy_nimbus",
      "divine_intervention",
      "mystic_arcanum_6",
      "mystic_arcanum_7",
      "mystic_arcanum_8",
      "mystic_arcanum_9"
    ];
    expect(coreIds).toHaveLength(42);
    const ids = [...coreIds, ...genreResources.resources.map((row) => row.id)];
    for (const id of ids) {
      const english = RESOURCE_DEFS.find((def) => def.id === id)?.guidance;
      expect(english, id).toBeTruthy();
      const czech = resourceGuidance(id, "cs");
      expect(czech, id).toBeTruthy();
      expect(czech, id).not.toBe(english);
      expect(resourceGuidance(id, "en")).toBeNull();
    }
  });

  it("covers every authored subclass, species, feat and extra genre resource", () => {
    expect(authoredResources.resources.length).toBeGreaterThanOrEqual(182);
    for (const row of authoredResources.resources) {
      expect(resourceGuidance(row.id, "cs"), row.id).toBeTruthy();
      expect(resourceGuidance(row.id, "cs"), row.id).not.toBe(row.guidance);
      expect(RESOURCE_DEFS.find((def) => def.id === row.id)?.guidance, row.id).toBe(row.guidance);
      expect(resourceGuidance(row.id, "en")).toBeNull();
    }
  });

  it("localizes newly reviewed subclass counters without changing English guidance", () => {
    for (const id of ["sub_performance_of_creation", "sub_call_the_hunt", "sub_hexblades_curse", "sub_necrotic_husk"]) {
      const english = RESOURCE_DEFS.find((def) => def.id === id)?.guidance;
      expect(english, id).toBeTruthy();
      expect(resourceGuidance(id, "cs"), id).toBeTruthy();
      expect(resourceGuidance(id, "cs"), id).not.toBe(english);
    }
  });

  it("shows a Czech resource name without touching the English identity", () => {
    const id = "rage";
    expect(resourceDisplayName(id, "cs")).toBe("Zuřivost");
    expect(resourceDisplayName(id, "en")).toBeNull();
  });

  it("uses Czech player-facing guidance and preserves missing-entry fallback", () => {
    expect(resourceGuidance("lay_on_hands", "cs")).toContain("Dotykem obnoví paladin");
    expect(resourceGuidance("does_not_exist", "cs")).toBeNull();
    expect(resourceGuidance("lay_on_hands", "en")).toBeNull();
  });
});
