import { describe, expect, it } from "vitest";
import { localizeEntryCs } from "./entry-descriptions-cs";
import { bundledItemRows, bundledSpellRows } from "@/lib/rulebook/catalog-rows";
import { czechFullTranslation } from "@/lib/rulebook/czech-companion";
import { describeContentEntry } from "@/lib/help";

describe("Czech SRD display descriptions", () => {
  it("serves every bundled spell and magic item without changing original fields", () => {
    const spells = bundledSpellRows();
    const items = bundledItemRows();
    expect(spells).toHaveLength(319);
    expect(items).toHaveLength(239);
    for (const [table, rows] of [["spells", spells], ["items", items]] as const) {
      for (const row of rows) {
        const translated = localizeEntryCs(table, row);
        const { localized_desc, ...original } = translated.data;
        expect(typeof localized_desc, row.name).toBe("string");
        expect(String(localized_desc)).not.toContain("Úplné původní znění SRD");
        expect(original).toEqual(row.data);
        expect(translated.slug).toBe(row.slug);
        expect(translated.name).toBe(row.name);
        expect(describeContentEntry(translated.data)).not.toBe(describeContentEntry(row.data));
      }
    }
  });

  it("uses the existing Czech source text rather than a second translation", () => {
    const row = bundledSpellRows().find((entry) => entry.rulebook === "fireball")!;
    expect(localizeEntryCs("spells", row).data.localized_desc).toBe(czechFullTranslation("fireball"));
  });

  it("does not replace homebrew, other editions, expansion entries or lite rows", () => {
    const row = bundledSpellRows()[0];
    for (const entry of [
      { ...row, source: "homebrew", documentSlug: "homebrew" },
      { ...row, source: "open5e", documentSlug: "srd-2024" },
      { ...row, source: "open5e", documentSlug: "tome-of-heroes" },
      { ...row, data: {} },
    ]) {
      expect(localizeEntryCs("spells", entry)).toBe(entry);
    }
  });
});
