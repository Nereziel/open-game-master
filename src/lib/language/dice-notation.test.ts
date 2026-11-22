import { describe, expect, it } from "vitest";
import { displayDiceNotation } from "./dice-notation";
import { normalizeRulesText, firstSentence } from "@/lib/help/rules-text";
import { canonicalGearDescriptionCs } from "@/lib/help/gear-description-cs";
import { itemDescriptionCs } from "@/lib/help/item-detail-cs";
import { translate } from "@/lib/i18n/translate";

describe("dice notation in displayed Czech rules", () => {
  it("uses d for standard dice without changing unrelated numbers or words", () => {
    expect(displayDiceNotation("1k8, 1k10, 2k6 + 3, 1k20, 4k4 a 1k100"))
      .toBe("1d8, 1d10, 2d6 + 3, 1d20, 4d4 a 1d100");
    expect(displayDiceNotation("1d8 a 2d6")).toBe("1d8 a 2d6");
    expect(displayDiceNotation("2k za 1kč, abc1k8xy")).toBe("2k za 1kč, abc1k8xy");
    expect(displayDiceNotation("1k8 + 1k10")).toBe(displayDiceNotation(displayDiceNotation("1k8 + 1k10")));
  });

  it("converts longsword damage in the shared item description", () => {
    expect(canonicalGearDescriptionCs("Longsword")).toContain("1d8");
    expect(canonicalGearDescriptionCs("Longsword")).toContain("1d10");
    expect(itemDescriptionCs("Longsword", null, "cs")).toContain("1d8");
    expect(itemDescriptionCs("Longsword", null, "en")).toBeNull();
  });

  it("converts rules dialogs and their hover previews", () => {
    expect(normalizeRulesText("Kouzlo způsobí 2k6 zranění.")).toBe("Kouzlo způsobí 2d6 zranění.");
    expect(firstSentence("Od 3. úrovně způsobíš 1k8 zranění. Pak pokračuj."))
      .toBe("Od 3. úrovně způsobíš 1d8 zranění.");
  });

  it("normalizes Czech fallback labels but not original English", () => {
    const message = "Once a turn, a weapon hit deals an extra 1d8 force damage.";
    expect(translate("cs", message)).toContain("1d8");
    expect(translate("cs", message)).not.toContain("1k8");
    expect(translate("en", message)).toBe(message);
  });
});
