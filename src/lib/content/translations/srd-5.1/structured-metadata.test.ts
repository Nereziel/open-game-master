import { describe, expect, it } from "vitest";
import { srdStructuredMetadataCs } from "./structured-metadata";

describe("source-safe SRD structured metadata (#107)", () => {
  it("translates 2014 magic school without affecting mechanics", () => {
    const source = { source: "open5e" as const, documentSlug: "wotc-srd", kind: "spells" as const };
    const original = { school: "evocation", category: "spell", rarity: "common" };
    expect(srdStructuredMetadataCs(source, original, "cs")).toEqual({
      school: "Zaklínání", category: "spell", rarity: "common",
    });
    expect(original.school).toBe("evocation");
    expect(srdStructuredMetadataCs(source, original, "en")).toBe(original);
  });

  it("translates item rarity and type; unknown values remain unchanged", () => {
    const source = { source: "srd" as const, kind: "items" as const };
    const original = { rarity: "very rare", category: "Wondrous item" };
    expect(srdStructuredMetadataCs(source, original, "cs")).toEqual({
      rarity: "Velmi vzácný", category: "Divotvorný předmět",
    });
    expect(srdStructuredMetadataCs(source, { rarity: "rarity varies", category: "Custom" }, "cs")).toEqual({
      rarity: "rarity varies", category: "Custom",
    });
  });

  it("never applies SRD labels to Tome of Heroes, other books or homebrew", () => {
    const original = { rarity: "rare", category: "Weapon" };
    for (const source of [
      { source: "open5e" as const, documentSlug: "toh", kind: "items" as const },
      { source: "open5e" as const, documentSlug: "vom", kind: "items" as const },
      { source: "homebrew" as const, documentSlug: "wotc-srd", kind: "items" as const },
      { source: "bundled" as const, kind: "items" as const },
    ]) {
      expect(srdStructuredMetadataCs(source, original, "cs")).toBe(original);
    }
  });
});
