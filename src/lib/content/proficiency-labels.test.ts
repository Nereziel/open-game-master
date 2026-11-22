import { describe, expect, it } from "vitest";
import { trainingProficiencyLabel } from "./proficiency-labels";

describe("shared character proficiency terminology", () => {
  it("uses military weapon terminology in both short UI and expanded PDF labels", () => {
    expect(trainingProficiencyLabel("martial", "weapons", "cs")).toBe("Vojenské");
    expect(trainingProficiencyLabel("martial", "weapons", "cs", true)).toBe("Vojenské zbraně");
    expect(trainingProficiencyLabel("martial weapons", "weapons", "cs", true)).toBe("Vojenské zbraně");
    expect(trainingProficiencyLabel("simple", "weapons", "cs", true)).toBe("Jednoduché zbraně");
  });

  it("distinguishes armor from illumination and preserves source values in English", () => {
    expect(trainingProficiencyLabel("light", "armor", "cs")).toBe("Lehká");
    expect(trainingProficiencyLabel("light", "armor", "cs", true)).toBe("Lehká zbroj");
    expect(trainingProficiencyLabel("heavy armor", "armor", "cs", true)).toBe("Těžká zbroj");
    expect(trainingProficiencyLabel("martial", "weapons", "en")).toBeNull();
    expect(trainingProficiencyLabel("custom category", "armor", "cs")).toBeNull();
  });
});
