import { describe, expect, it } from "vitest";
import { canonicalMagicItemDescriptionCs, CZECH_MAGIC_ITEM_COUNT } from "./magic-item-description-cs";
import { itemDescriptionCs } from "./item-detail-cs";

describe("Czech magic item descriptions in character sheets", () => {
  it("provides the full 239-entry Czech magic-item catalog", () => {
    expect(CZECH_MAGIC_ITEM_COUNT).toBe(239);
  });

  it("resolves by stored SRD slug and English display name", () => {
    expect(canonicalMagicItemDescriptionCs("Amulet of Health")).toMatch(/Odolnost/);
    expect(canonicalMagicItemDescriptionCs("Cloak of Protection", "cloak-of-protection")).toBeTruthy();
    expect(canonicalMagicItemDescriptionCs("Ring of Protection", "ring-of-protection")).toBeTruthy();
  });

  it("uses full Czech descriptions for the inventory dialog, not only the rulebook", () => {
    expect(itemDescriptionCs("Amulet of Health", "Your Constitution score is 19.", "cs", "amulet-of-health"))
      .toMatch(/19/);
    expect(itemDescriptionCs("Amulet of Health", null, "cs", "amulet-of-health"))
      .toMatch(/Odolnost/);
    expect(itemDescriptionCs("Amulet of Health", "Your Constitution score is 19.", "en", "amulet-of-health"))
      .toBe("Your Constitution score is 19.");
  });
});
