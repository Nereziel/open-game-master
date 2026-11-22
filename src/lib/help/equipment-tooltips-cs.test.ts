import { describe, expect, it } from "vitest";
import { translate } from "@/lib/i18n/translate";
import { ITEM_CATEGORY_LABEL, ITEM_CATEGORIES } from "@/lib/srd/item-category-logic";
import { spellSupportFor, spellSupportWord } from "@/lib/srd/spell-support";

describe("Czech equipment and spell tooltips", () => {
  it("translates every equipment category without changing category IDs", () => {
    for (const category of ITEM_CATEGORIES) {
      const english = ITEM_CATEGORY_LABEL[category];
      expect(translate("cs", english)).not.toBe(english);
      expect(translate("en", english)).toBe(english);
    }
    expect(translate("cs", ITEM_CATEGORY_LABEL.armor)).toBe("Zbroj nebo štít");
  });

  it("translates the shared missing-description prompt", () => {
    const prompt = "Select the mark beside it for the full entry.";
    expect(translate("cs", prompt)).toContain("Podrobný popis");
    expect(translate("en", prompt)).toBe(prompt);
  });

  it("keeps Light's partial support and explains its Czech display label", () => {
    const support = spellSupportFor("Light");
    expect(support?.kind).toBe("partial");
    expect(support && translate("cs", spellSupportWord(support))).toBe("část vyhodnocuje PJ");
  });
});
