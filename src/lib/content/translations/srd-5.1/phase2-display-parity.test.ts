import { describe, expect, it } from "vitest";
import { rulebookPages } from "@/lib/rulebook/book";
import { PAGE_CATALOG_NAMES, bundledItemRows, bundledSpellRows } from "@/lib/rulebook/catalog-rows";
import { withCatalogDisplay } from "../catalog-display";
import { srdPageIdForCatalogRecord } from "./crosswalk";
import { srdStructuredMetadataCs } from "./structured-metadata";

const KIND = {
  spell: "spells", item: "items", monster: "monsters", class: "classes", race: "races",
} as const;

describe("one SRD identity and Czech metadata between rulebook and game catalog (#107 phase 2)", () => {
  it("displays the same Czech title for every class, race, spell, monster and magic item as its reader page", () => {
    const english = rulebookPages("en");
    const czech = new Map(rulebookPages("cs").map((page) => [page.id, page]));
    for (const page of english) {
      if (page.kind === "rules") continue;
      const kind = KIND[page.kind];
      const row = {
        name: page.title,
        slug: `srd:${page.id}`,
        source: "srd" as const,
        documentSlug: "wotc-srd",
        rulebook: page.id,
      };
      const displayRow = withCatalogDisplay(kind, row, "cs");
      expect(displayRow.display?.name ?? row.name, `${kind}:${page.id}`).toBe(czech.get(page.id)?.title);
      expect(srdPageIdForCatalogRecord({ ...row, kind }, english)).toBe(page.id);
    }
  });

  it("retains distinct English machine identifiers for every imported bundled spell and magic item", () => {
    const english = rulebookPages("en");
    const czech = new Map(rulebookPages("cs").map((page) => [page.id, page]));
    const rows = [
      ...bundledSpellRows().map((row) => ({ ...row, kind: "spells" as const })),
      ...bundledItemRows().map((row) => ({ ...row, kind: "items" as const })),
    ];
    expect(rows.length).toBeGreaterThan(500);
    for (const row of rows) {
      const original = { ...row };
      const pageId = srdPageIdForCatalogRecord(row, english);
      expect(pageId, row.name).toBe(row.rulebook);
      const display = withCatalogDisplay(row.kind, row, "cs");
      expect(display.display?.name ?? row.name, row.slug).toBe(czech.get(row.rulebook)?.title);
      expect(display.slug).toBe(row.slug);
      expect(display.data).toEqual(original.data);
      expect(display.name).toBe(original.name);
    }
  });

  it("keeps school/rarity/type in display-only Czech, not the underlying SRD rule values", () => {
    const spell = { source: "open5e" as const, documentSlug: "wotc-srd", kind: "spells" as const };
    const item = { source: "open5e" as const, documentSlug: "wotc-srd", kind: "items" as const };
    for (const school of ["Abjuration", "Conjuration", "Divination", "Enchantment", "Evocation", "Illusion", "Necromancy", "Transmutation"]) {
      const data = { school: school.toLowerCase(), level: "3", description: "English", attack: "+5" };
      const localized = srdStructuredMetadataCs(spell, data, "cs");
      expect(localized.school, school).not.toBe(data.school);
      expect(localized.level).toBe("3");
      expect(localized.attack).toBe("+5");
      expect(data.school).toBe(school.toLowerCase());
    }
    for (const rarity of ["common", "uncommon", "rare", "very rare", "legendary", "artifact"]) {
      const data = { rarity, category: "Wondrous item", costCp: "500" };
      const localized = srdStructuredMetadataCs(item, data, "cs");
      expect(localized.rarity, rarity).not.toBe(rarity);
      expect(localized.category).toBe("Divotvorný předmět");
      expect(localized.costCp).toBe("500");
      expect(data.rarity).toBe(rarity);
    }
  });

  it("documents key shape mismatches and never resolves another book by the same name", () => {
    const pages = rulebookPages("en");
    const drow = pages.find((page) => page.id === "elf-drow");
    // The 2014 SRD monster appendix has a Drow stat block. A playable
    // subrace of the same name is NOT this monster's canonical page.
    expect(drow?.kind).toBe("monster");
    expect(PAGE_CATALOG_NAMES["elf-drow"]).toBe("Drow");
    expect(srdPageIdForCatalogRecord({
      kind: "monsters", source: "open5e", slug: "drow", name: "Drow", documentSlug: "wotc-srd",
    }, pages)).toBe("elf-drow");
    expect(srdPageIdForCatalogRecord({
      kind: "races", source: "open5e", slug: "drow", name: "Drow", documentSlug: "wotc-srd",
    }, pages)).toBeNull();
    expect(srdPageIdForCatalogRecord({
      kind: "monsters", source: "open5e", slug: "drow", name: "Drow", documentSlug: "toh",
    }, pages)).toBeNull();
  });
});
