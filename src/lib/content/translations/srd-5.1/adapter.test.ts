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
    expect(coverage).toEqual({ total: 1, translated: { spells: 1 }, missingIds: [] });
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
    expect(coverage.translated.rules).toBe(35);
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
