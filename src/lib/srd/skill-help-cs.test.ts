import { describe, expect, it } from "vitest";
import { skillHelpText } from "./skill-help-cs";

describe("skill descriptions in Czech", () => {
  it("explains Acrobatics in Czech with its governing ability", () => {
    const help = skillHelpText("acrobatics", "dex", "cs");
    expect(help).toContain("rovnováhy");
    expect(help).toContain("Bonus z Obratnosti");
    expect(help).toContain("zdatnostní bonus");
  });

  it("describes all eighteen SRD skills", () => {
    const ids: Array<[string, string]> = [
      ["acrobatics", "dex"], ["animal_handling", "wis"], ["arcana", "int"],
      ["athletics", "str"], ["deception", "cha"], ["history", "int"],
      ["insight", "wis"], ["intimidation", "cha"], ["investigation", "int"],
      ["medicine", "wis"], ["nature", "int"], ["perception", "wis"],
      ["performance", "cha"], ["persuasion", "cha"], ["religion", "int"],
      ["sleight_of_hand", "dex"], ["stealth", "dex"], ["survival", "wis"],
    ];
    for (const [id, ability] of ids) {
      expect(skillHelpText(id, ability, "cs")).toMatch(/Bonus z/);
      expect(skillHelpText(id, ability, "cs")).not.toContain("Oprava");
    }
    expect(skillHelpText("acrobatics", "dex", "en")).toContain("Acrobatics");
  });

  it("uses shared ability codes in English and French skill tooltips", () => {
    expect(skillHelpText("acrobatics", "dex", "en")).toContain("DEX");
    expect(skillHelpText("athletics", "str", "fr")).toContain("FOR");
    expect(skillHelpText("perception", "wis", "fr")).toContain("SAG");
  });
});
