import { describe, expect, it } from "vitest";
import { TranslationRegistry } from "../registry";
import { srdTranslationPack } from "./adapter";
import type { RulebookPage } from "../../../rulebook/types";
import { rulebookPages } from "../../../rulebook/book";

const source: RulebookPage = {
  id: "light", chapter: "spells", kind: "spell", title: "Light",
  meta: "Evocation cantrip", md: "Original English rules",
};

describe("SRD 5.1 Czech companion adapter (#107 phase 2)", () => {
  it("keeps the canonical page ID and strips the duplicated English footer", () => {
    const localized: RulebookPage = {
      ...source, title: "Světlo", meta: "Evokační trik",
      md: "Český kompletní text\n\n---\n\n**Úplné původní znění SRD 5.1 v angličtině:**\n\nOriginal English rules",
    };
    const { pack, coverage } = srdTranslationPack([source], [localized]);
    const registry = new TranslationRegistry();
    registry.register(pack);
    expect(registry.resolve(
      { sourceId: "srd-5.1", contentType: "spells", contentId: "light", locale: "cs" },
      { name: source.title, description: source.md, metadata: { meta: source.meta! } },
    ).entry).toEqual({
      name: "Světlo", description: "Český kompletní text",
      metadata: { meta: "Evokační trik" },
    });
    expect(coverage).toEqual({ total: 1, fullRulePages: 0, fullText: {}, incompleteIds: ["light"], translated: { spells: 1 }, missingIds: [] });
    expect(source.md).toBe("Original English rules");
  });

  it("records missing translations and keeps source-specific English fallback", () => {
    const { pack, coverage } = srdTranslationPack([source], []);
    expect(coverage.missingIds).toEqual(["light"]);
    const registry = new TranslationRegistry();
    registry.register(pack);
    expect(registry.resolve(
      { sourceId: "srd-5.1", contentType: "spells", contentId: "light", locale: "cs" },
      { name: "Light", description: source.md },
    ).entry).toEqual({ name: "Light", description: source.md });
  });

  it("rejects unexpected IDs, duplicate IDs, kind changes and damaged original text", () => {
    expect(() => srdTranslationPack([source, source], [])).toThrow(/Duplicate English/);
    expect(() => srdTranslationPack([source], [source, source])).toThrow(/Duplicate Czech/);
    expect(() => srdTranslationPack([source], [{ ...source, id: "foreign" }])).toThrow(/Unexpected Czech/);
    expect(() => srdTranslationPack([source], [{ ...source, kind: "item" }])).toThrow(/changed kind/);
    expect(() => srdTranslationPack([source], [{ ...source, md: "Jen česky" }])).toThrow(/preserve original/);
  });

  it("adapts the actual bundled 2014 SRD without moving any translation batches", () => {
    const english = rulebookPages("en");
    const czech = rulebookPages("cs");
    const { pack, coverage } = srdTranslationPack(english, czech);
    const registry = new TranslationRegistry();
    registry.register(pack);
    expect(coverage.total).toBe(english.length);
    expect(coverage.translated.rules).toBe(english.filter((page) => page.kind === "rules").length);
    expect(coverage.fullRulePages).toBe(35);
    // SRD feats are subsections of the rules page, NOT separate page-kind
    // records. Custom "odm-expanded" feats must not be counted as SRD.
    const englishFeatsPage = english.find((page) => page.id === "feats");
    const czechFeatsPage = czech.find((page) => page.id === "feats");
    expect(englishFeatsPage?.kind).toBe("rules");
    expect(czechFeatsPage?.md).toContain("## Úplné znění pravidel v češtině");
    expect(pack.entries.rules?.feats?.description).toContain("Úplné znění pravidel v češtině");
    // A complete translation must contain the full-text marker, not merely
    // a localized title, metadata or short Czech overview.
    for (const kind of ["classes", "monsters", "items"] as const) {
      expect(coverage.fullText[kind]).toBe(english.filter((p) => ({
        class: "classes", monster: "monsters", item: "items",
      } as Record<string, string>)[p.kind] === kind).length);
    }
    for (const [pageKind, registryKind] of [["spell", "spells"], ["race", "species"]] as const) {
      const originalCount = english.filter((page) => page.kind === pageKind).length;
      // A formerly present short overview is not sufficient for "complete".
      expect(coverage.fullText[registryKind]).toBe(originalCount);
    }
    const allFullyTranslated = Object.values(coverage.fullText).reduce((sum, count) => sum + count, 0);
    expect(allFullyTranslated + coverage.incompleteIds.length + 1).toBe(english.length);
    expect(coverage.incompleteIds).not.toContain("legal-information");
    expect(coverage.translated.classes).toBe(12);
    expect(coverage.translated.monsters).toBe(318);
    expect(coverage.translated.items).toBe(239);
    // Page counts come from this exact bundled corpus, never from guesswork.
    for (const kind of ["spells", "species"] as const) {
      expect(coverage.translated[kind]).toBe(
        english.filter((page) => ({ spell: "spells", race: "species" } as Record<string, string>)[page.kind] === kind).length,
      );
    }
    expect(coverage.missingIds).toEqual([]);
    const spell = english.find((p) => p.kind === "spell")!;
    const localized = registry.resolve(
      { sourceId: "srd-5.1", contentType: "spells", contentId: spell.id, locale: "cs" },
      { name: spell.title, description: spell.md },
    );
    expect(localized.status).toBe("translated");
    expect(localized.entry.description).not.toContain(spell.md);
    expect(spell.md).toBe(english.find((p) => p.id === spell.id)!.md);
  });
});
