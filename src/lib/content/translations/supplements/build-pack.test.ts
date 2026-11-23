import { describe, expect, it } from "vitest";
import { TranslationRegistry } from "../registry";
import { tomeOfHeroesCsPack } from "../tome-of-heroes";
import { deepMagicCsPack } from "../deep-magic";
import { vaultOfMagicCsPack } from "../vault-of-magic";
import { TOME_OF_HEROES_CS } from "../tome-of-heroes/cs-data";
import { DEEP_MAGIC_CS } from "../deep-magic/cs-data";
import { VAULT_OF_MAGIC_CS } from "../vault-of-magic/cs-data";
import { buildSupplementCzechPack, type SupplementCatalogRow } from "./build-pack";

const row = (
  kind: SupplementCatalogRow["kind"],
  name: string,
  slug: string,
  documentSlug: string,
  source: SupplementCatalogRow["source"] = "open5e",
): SupplementCatalogRow => ({ kind, name, slug, documentSlug, source });

describe("book-specific Czech translation packs (#107, phase 3)", () => {
  it("keeps all extracted PR #106 name drafts in their own source files", () => {
    expect(Object.keys(TOME_OF_HEROES_CS.items.names)).toHaveLength(65);
    expect(Object.keys(TOME_OF_HEROES_CS.spells.names)).toHaveLength(91);
    expect(Object.keys(TOME_OF_HEROES_CS.feats.names)).toHaveLength(13);
    expect(Object.keys(DEEP_MAGIC_CS.spells.names)).toHaveLength(56);
    expect(Object.keys(VAULT_OF_MAGIC_CS.items.names)).toHaveLength(249);
    expect(Object.keys(TOME_OF_HEROES_CS.spells.fullRules)).toHaveLength(14);
    expect(Object.keys(TOME_OF_HEROES_CS.feats.fullRules)).toHaveLength(13);
    expect(Object.keys(DEEP_MAGIC_CS.spells.fullRules)).toHaveLength(12);
    expect(Object.keys(VAULT_OF_MAGIC_CS.items.fullRules)).toHaveLength(48);
  });

  it("quarantines migrated full-rule drafts and retains canonical book ID", () => {
    const rows = [
      row("spells", "Lance", "lance-toh", "toh"),
      row("feats", "Boundless Reserves", "boundless-reserves", "toh"),
      row("items", "Axespear", "axespear", "toh"),
      row("spells", "Lance", "lance-deep", "dmag"),
      row("spells", "Lance", "lance-homebrew", "toh", "homebrew"),
    ];
    const { pack, report } = tomeOfHeroesCsPack(rows);
    expect(pack.sourceId).toBe("tome-of-heroes");
    expect(pack.entries.spells?.["lance-toh"]?.description).toBeUndefined();
    expect(pack.entries.spells?.["lance-deep"]).toBeUndefined();
    expect(pack.entries.spells?.["lance-homebrew"]).toBeUndefined();
    expect(pack.entries.feats?.["boundless-reserves"]?.description).toBeUndefined();
    expect(pack.entries.items?.axespear?.name).toBe("Sekerokopí");
    expect(pack.entries.items?.axespear?.description).toBeUndefined();
    expect(report.completeRules).toBe(0);
    expect(report.unverifiedFullRules).toBe(2);
  });

  it("keeps summary separate from the English original; never mislabels it as full rules", () => {
    const { pack, report } = tomeOfHeroesCsPack([row("spells", "Fuse Armor", "fuse-armor", "toh")]);
    const registry = new TranslationRegistry();
    registry.register(pack);
    const original = { name: "Fuse Armor", description: "Full original English rules, including caveats." };
    const result = registry.resolve(
      { sourceId: "tome-of-heroes", contentType: "spells", contentId: "fuse-armor", locale: "cs" },
      original,
    );
    expect(result.entry.name).toBe("Znehybnění kovu");
    expect(result.entry.description).toBe(original.description);
    expect(result.entry.metadata?.summaryCs).toContain("kov");
    expect(report.summaryOnly).toBe(1);
    expect(original.name).toBe("Fuse Armor");
  });

  it("deduplicates Deep Magic document aliases with a single canonical ID", () => {
    const { pack, report } = deepMagicCsPack([
      row("spells", "Abhorrent Apparition", "abhorrent-apparition", "dmag"),
      row("spells", "Abhorrent Apparition", "abhorrent-apparition", "deepm"),
    ]);
    expect(report.catalogRows).toBe(1);
    expect(pack.entries.spells?.["abhorrent-apparition"]?.name).toBe("Odpudivý přízrak");
    expect(report.translated).toBe(1);
  });

  it("quarantines only the conflicting Deep Magic slug while keeping unrelated translations", () => {
    const rows = [
      row("spells", "Abhorrent Apparition", "shared-slug", "dmag"),
      row("spells", "Other English Title", "shared-slug", "deepm"),
      row("spells", "Fuse Armor", "fuse-armor", "toh"),
      row("spells", "Abhorrent Apparition", "valid-slug", "deepm"),
    ];
    const { pack, report } = deepMagicCsPack(rows);
    expect(pack.entries.spells?.["shared-slug"]).toBeUndefined();
    expect(pack.entries.spells?.["valid-slug"]?.name).toBe("Odpudivý přízrak");
    expect(report.ambiguous).toContain("spells:conflicting catalog slug (shared-slug)");
    const tome = tomeOfHeroesCsPack(rows);
    expect(tome.pack.entries.spells?.["fuse-armor"]?.name).toBe("Znehybnění kovu");
  });

  it("registers separate books and refuses cross-source fallback on identical titles", () => {
    const entries = [
      row("spells", "Shield", "shield", "toh"),
      row("spells", "Shield", "shield", "dmag"),
      row("spells", "Shield", "shield", "wotc-srd"),
    ];
    const tome = buildSupplementCzechPack("tome-of-heroes", entries, {
      spells: { names: { Shield: "Štít hrdiny" } },
    });
    const deep = buildSupplementCzechPack("deep-magic", entries, {
      spells: { names: { Shield: "Štít hluboké magie" } },
    });
    const registry = new TranslationRegistry();
    registry.register(tome.pack);
    registry.register(deep.pack);
    const original = { name: "Shield", description: "Source's own English text" };
    expect(registry.resolve({ sourceId: "tome-of-heroes", contentType: "spells", contentId: "shield", locale: "cs" }, original).entry.name).toBe("Štít hrdiny");
    expect(registry.resolve({ sourceId: "deep-magic", contentType: "spells", contentId: "shield", locale: "cs" }, original).entry.name).toBe("Štít hluboké magie");
    expect(registry.resolve({ sourceId: "srd-5.1", contentType: "spells", contentId: "shield", locale: "cs" }, original).entry).toBe(original);
  });

  it("retains Vault raw drafts without publishing them as complete rules", () => {
    const { pack, report } = vaultOfMagicCsPack([
      row("items", "Ashwood Wand", "ashwood-wand", "vom"),
      row("items", "Ashwood Wand", "ashwood-wand", "wotc-srd"),
    ]);
    expect(pack.entries.items?.["ashwood-wand"]?.description).toBeUndefined();
    expect(report.completeRules).toBe(0);
    expect(report.unverifiedFullRules).toBe(1);
  });

  it("publishes only explicitly approved complete rule text, never raw drafts", () => {
    const original = row("spells", "Sample Spell", "sample-spell", "toh");
    const { pack, report } = buildSupplementCzechPack("tome-of-heroes", [original], {
      spells: {
        names: { "Sample Spell": "Ukázkové kouzlo" },
        fullRules: { "Sample Spell": "NEOVĚŘENÝ návrh; nesmí přepsat úplná pravidla." },
        approvedFullRules: { "Sample Spell": "Zkontrolované úplné znění pravidel." },
      },
    });
    expect(pack.entries.spells?.["sample-spell"]?.description).toBe("Zkontrolované úplné znění pravidel.");
    expect(report.completeRules).toBe(1);
    expect(report.unverifiedFullRules).toBe(0);
  });

  it("refuses English-name ambiguity until the catalog supplies unique identity", () => {
    const { pack, report } = buildSupplementCzechPack("tome-of-heroes", [
      row("feats", "Duplicate Feat", "duplicate-feat-1", "toh"),
      row("feats", "Duplicate Feat", "duplicate-feat-2", "toh"),
    ], { feats: { names: { "Duplicate Feat": "Duplicitní odbornost" } } });
    expect(pack.entries.feats).toBeUndefined();
    expect(report.ambiguous).toHaveLength(2);
    expect(report.orphanedDrafts).toContain("feats:duplicate feat");
    expect(report.translated).toBe(0);
  });
});
