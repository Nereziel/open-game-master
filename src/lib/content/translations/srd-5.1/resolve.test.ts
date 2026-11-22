import { describe, expect, it } from "vitest";
import { TranslationRegistry } from "../registry";
import { resolveSrdCatalogTranslation } from "./resolve";
import type { RulebookPage } from "../../../rulebook/types";

const pages: RulebookPage[] = [
  { id: "light", kind: "spell", chapter: "spells", title: "Light", md: "English light" },
];
const original = { name: "Light", description: "English light", metadata: { level: "0", damage: "0" } };

describe("SRD catalog display-only bridge (#107)", () => {
  it("resolves only a proven SRD row while leaving game data untouched", () => {
    const registry = new TranslationRegistry();
    registry.register({ sourceId: "srd-5.1", locale: "cs", entries: {
      spells: { light: { name: "Světlo", description: "České světlo" } },
    } });
    const srd = { kind: "spells" as const, source: "open5e" as const, slug: "light", name: "Light", documentSlug: "wotc-srd" };
    const result = resolveSrdCatalogTranslation(registry, srd, pages, original, "cs");
    expect(result).toEqual({
      pageId: "light", translated: true,
      display: { name: "Světlo", description: "České světlo", metadata: { level: "0", damage: "0" } },
    });
    expect(srd.name).toBe("Light");
    expect(original).toEqual({ name: "Light", description: "English light", metadata: { level: "0", damage: "0" } });
  });

  it("never borrows SRD translations for Tome of Heroes, homebrew or English mode", () => {
    const registry = new TranslationRegistry();
    registry.register({ sourceId: "srd-5.1", locale: "cs", entries: { spells: { light: { name: "Světlo" } } } });
    const common = { kind: "spells" as const, slug: "light", name: "Light" };
    for (const row of [
      { ...common, source: "open5e" as const, documentSlug: "toh" },
      { ...common, source: "homebrew" as const, documentSlug: "wotc-srd" },
      { ...common, source: "bundled" as const, documentSlug: "unspecified" },
    ]) {
      expect(resolveSrdCatalogTranslation(registry, row, pages, original, "cs")).toEqual({
        pageId: null, translated: false, display: original,
      });
    }
    expect(resolveSrdCatalogTranslation(registry,
      { ...common, source: "open5e", documentSlug: "wotc-srd" }, pages, original, "en",
    )).toEqual({ pageId: null, translated: false, display: original });
  });

  it("leaves unknown pages English without recording a false cross-book match", () => {
    const registry = new TranslationRegistry();
    const result = resolveSrdCatalogTranslation(registry, {
      kind: "spells", source: "open5e", documentSlug: "wotc-srd", slug: "other", name: "Other",
    }, pages, { name: "Other" }, "cs");
    expect(result).toEqual({ pageId: null, translated: false, display: { name: "Other" } });
    expect(registry.missingTranslations()).toEqual([]);
  });
});
