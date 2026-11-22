import { describe, expect, it } from "vitest";
import { TranslationRegistry, translationSourceId } from "./registry";
import { CS_SKILLS } from "./common/cs";

describe("source-scoped translation registry (#107)", () => {
  it("maps actual Open5e document identifiers without changing engine IDs", () => {
    expect(translationSourceId({ source: "open5e", documentSlug: "wotc-srd" })).toBe("srd-5.1");
    expect(translationSourceId({ source: "bundled", documentSlug: "wotc-srd" })).toBe("srd-5.1");
    expect(translationSourceId({ source: "bundled" })).toBeNull();
    expect(translationSourceId({ source: "bundled", documentSlug: "custom-genre" })).toBeNull();
    expect(translationSourceId({ source: "open5e", documentSlug: "toh" })).toBe("tome-of-heroes");
    expect(translationSourceId({ source: "open5e", documentSlug: "deepm" })).toBe("deep-magic");
    expect(translationSourceId({ source: "open5e", documentSlug: "dmag" })).toBe("deep-magic");
    expect(translationSourceId({ source: "open5e", documentSlug: "vom" })).toBe("vault-of-magic");
    expect(translationSourceId({ source: "homebrew", documentSlug: "toh" })).toBeNull();
  });

  it("does not merge identical English names from different source books", () => {
    const registry = new TranslationRegistry();
    registry.register({ sourceId: "srd-5.1", locale: "cs", entries: {
      spells: { shield: { name: "Štít", description: "Pravidlový text SRD" } },
    } });
    registry.register({ sourceId: "tome-of-heroes", locale: "cs", entries: {
      spells: { shield: { name: "Jiný štít", description: "Pravidlový text jiné knihy" } },
    } });
    const original = { name: "Shield", description: "English rules", metadata: { level: "1" } };
    const srd = registry.resolve({ sourceId: "srd-5.1", contentType: "spells", contentId: "shield", locale: "cs" }, original);
    const tome = registry.resolve({ sourceId: "tome-of-heroes", contentType: "spells", contentId: "shield", locale: "cs" }, original);
    expect(srd.entry.description).toBe("Pravidlový text SRD");
    expect(tome.entry.description).toBe("Pravidlový text jiné knihy");
    expect(srd.entry.metadata).toEqual({ level: "1" });
    expect(original.name).toBe("Shield"); // Stored data remains canonical.
  });

  it("never borrows a different book's translation for a missing entry", () => {
    const registry = new TranslationRegistry();
    registry.register({ sourceId: "srd-5.1", locale: "cs", entries: {
      items: { torch: { name: "Pochodeň" } },
    } });
    const key = { sourceId: "vault-of-magic", contentType: "items" as const, contentId: "torch", locale: "cs" as const };
    expect(registry.resolve(key, { name: "Torch", description: "Other book text" })).toEqual({
      key, status: "original", entry: { name: "Torch", description: "Other book text" },
    });
    expect(registry.missingTranslations()).toEqual([key]);
    registry.clearDiagnostics();
    expect(registry.missingTranslations()).toEqual([]);
  });

  it("falls back field by field to the same English record and preserves mechanics metadata", () => {
    const registry = new TranslationRegistry();
    registry.register({ sourceId: "srd-5.1", locale: "cs", entries: {
      items: { sword: { name: "Meč", metadata: { rarity: "Vzácný" } } },
    } });
    expect(registry.resolve(
      { sourceId: "srd-5.1", contentType: "items", contentId: "sword", locale: "cs" },
      { name: "Sword", description: "English description", metadata: { rarity: "Rare", damage: "1d8" } },
    ).entry).toEqual({ name: "Meč", description: "English description", metadata: { rarity: "Vzácný", damage: "1d8" } });
  });

  it("rejects duplicate packs and invalid/empty entries", () => {
    const registry = new TranslationRegistry();
    const pack = { sourceId: "srd-5.1", locale: "cs" as const, entries: { spells: { light: { name: "Světlo" } } } };
    registry.register(pack);
    expect(() => registry.register(pack)).toThrow(/Duplicate translation pack/);
    expect(() => registry.register({ sourceId: "tome-of-heroes", locale: "cs", entries: {
      spells: { light: {} },
    } })).toThrow(/Empty translation entry/);
  });

  it("rejects duplicate canonical IDs within one pack and reports unknown IDs once", () => {
    const registry = new TranslationRegistry();
    expect(() => registry.register({
      sourceId: "tome-of-heroes", locale: "cs", entries: {
        spells: { shield: { name: "Štít" }, " shield ": { name: "Duplicitní štít" } },
      },
    })).toThrow(/Duplicate translation entry/);
    registry.register({
      sourceId: "tome-of-heroes", locale: "cs", entries: {
        spells: { shield: { name: "Štít" } },
      },
    });
    const key = { sourceId: "tome-of-heroes", contentType: "spells" as const, contentId: "unknown", locale: "cs" as const };
    expect(registry.resolve(key, { name: "Unknown" }).entry.name).toBe("Unknown");
    registry.resolve(key, { name: "Unknown" });
    expect(registry.missingTranslations()).toEqual([key]);
  });

  it("uses 2014 d20.cz terminology consistently in common vocabulary", () => {
    expect(CS_SKILLS["Animal Handling"]).toBe("Ovládání zvířat");
    expect(CS_SKILLS.Arcana).toBe("Mystika");
    expect(CS_SKILLS.Performance).toBe("Umění");
    expect(CS_SKILLS["Sleight of Hand"]).toBe("Čachry");
    expect(CS_SKILLS.Stealth).toBe("Nenápadnost");
  });
});
