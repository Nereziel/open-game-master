import { describe, expect, it } from "vitest";
import { rulebookPages } from "../../../rulebook/book";
import { bundledSpellRows, bundledItemRows } from "../../../rulebook/catalog-rows";
import type { RulebookPage } from "../../../rulebook/types";
import { srdPageIdForCatalogRecord } from "./crosswalk";

const pages: RulebookPage[] = [
  { id: "shield", chapter: "spells", kind: "spell", title: "Shield", md: "Spell text" },
  { id: "shield-1-2-or-3", chapter: "magic-items", kind: "item", title: "Shield, +1, +2, or +3", md: "Item text" },
  { id: "elf-drow", chapter: "races", kind: "race", title: "Elf, Drow", md: "Race text" },
];

describe("SRD catalog-to-reader identity crosswalk (#107)", () => {
  it("does not import identical names from any other book or homebrew", () => {
    const base = { kind: "spells" as const, slug: "shield", name: "Shield" };
    expect(srdPageIdForCatalogRecord({ ...base, source: "open5e", documentSlug: "toh" }, pages)).toBeNull();
    expect(srdPageIdForCatalogRecord({ ...base, source: "homebrew", documentSlug: "wotc-srd" }, pages)).toBeNull();
    expect(srdPageIdForCatalogRecord({ ...base, source: "open5e", documentSlug: "wotc-srd" }, pages)).toBe("shield");
  });

  it("does not confuse the same title across different content kinds", () => {
    expect(srdPageIdForCatalogRecord({ kind: "items", slug: "shield", name: "Shield", source: "open5e", documentSlug: "wotc-srd" }, pages)).toBeNull();
    expect(srdPageIdForCatalogRecord({ kind: "spells", slug: "shield", name: "Shield", source: "open5e", documentSlug: "wotc-srd" }, pages)).toBe("shield");
  });

  it("preserves bundled canonical pointers and rejects unknown IDs", () => {
    const record = { kind: "spells" as const, slug: "srd:shield", name: "Shield", source: "srd" as const, documentSlug: "wotc-srd" };
    expect(srdPageIdForCatalogRecord(record, pages)).toBe("shield");
    expect(srdPageIdForCatalogRecord({ ...record, slug: "srd:missing" }, pages)).toBeNull();
  });

  it("accepts only vetted non-exact names from the bundled crosswalk", () => {
    expect(srdPageIdForCatalogRecord({
      kind: "races", slug: "drow", name: "Drow", source: "open5e", documentSlug: "wotc-srd",
    }, pages)).toBe("elf-drow");
  });

  it("rejects ambiguous name collisions and untrusted rulebook pointers", () => {
    const ambiguous = [...pages, { ...pages[0], id: "shield-copy" }];
    expect(srdPageIdForCatalogRecord({
      kind: "spells", slug: "shield", name: "Shield", source: "open5e", documentSlug: "wotc-srd",
    }, ambiguous)).toBeNull();
    expect(srdPageIdForCatalogRecord({
      kind: "spells", slug: "wrong-slug", name: "Not Shield", rulebook: "shield",
      source: "open5e", documentSlug: "wotc-srd",
    }, pages)).toBeNull();
  });

  it("maps every real bundled spell and magic item row to its own page", () => {
    const originals = rulebookPages("en");
    const rows = [
      ...bundledSpellRows().map((row) => ({ ...row, kind: "spells" as const })),
      ...bundledItemRows().map((row) => ({ ...row, kind: "items" as const })),
    ];
    expect(rows.length).toBeGreaterThan(500);
    for (const row of rows) {
      expect(srdPageIdForCatalogRecord(row, originals)).toBe(row.rulebook);
    }
  });

  it("maps real bundled spell and item IDs without mutating source data", () => {
    const originals = rulebookPages("en");
    for (const kind of ["spell", "item"] as const) {
      const page = originals.find((candidate) => candidate.kind === kind)!;
      const record = {
        kind: kind === "spell" ? "spells" as const : "items" as const,
        source: "srd" as const, documentSlug: "wotc-srd",
        slug: `srd:${page.id}`, rulebook: page.id, name: page.title,
      };
      expect(srdPageIdForCatalogRecord(record, originals)).toBe(page.id);
      expect(record.name).toBe(page.title);
    }
  });
});
