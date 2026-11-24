import { describe, expect, it } from "vitest";
import { localizeEntryCs } from "./entry-descriptions-cs";
import { bundledItemRows, bundledSpellRows } from "@/lib/rulebook/catalog-rows";
import { czechFullTranslation } from "@/lib/rulebook/czech-companion";
import { describeContentEntry } from "@/lib/help";
import spellFixture from "../../../scripts/fixtures/reader-golden/spell.json";
import featFixture from "../../../scripts/fixtures/reader-golden/feat.json";
import backgroundFixture from "../../../scripts/fixtures/reader-golden/background.json";
import expansionTranslations from "./expansion-descriptions-cs.json";
import { contentName } from "./names";


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

describe("Czech external display translations (without SQLite)", () => {
  it("localizes every reviewed fixture and preserves identity and mechanics", () => {
    let count = 0;
    for (const [table, fixture] of [["spells", spellFixture], ["feats", featFixture], ["backgrounds", backgroundFixture]] as const) {
      for (const { row } of fixture.cases) {
        const books = expansionTranslations as Record<string, Record<string, Record<string, { name: string; description?: string }>>>;
        const hit = books[row.documentSlug]?.[table]?.[row.slug];
        if (!hit?.description) continue;
        const entry = { ...row, source: "open5e" as const, data: { ...row.data } as Record<string, unknown> };
        const translated = localizeEntryCs(table, entry);
        const { localized_desc, ...original } = translated.data;
        expect(localized_desc, row.slug).toBe(hit.description);
        expect(describeContentEntry(translated.data), row.slug).toBeTruthy();
        expect(original).toEqual(entry.data);
        expect(translated.slug).toBe(entry.slug);
        expect(translated.name).toBe(entry.name);
        expect(translated.documentSlug).toBe(entry.documentSlug);
        expect(contentName(table, entry, "cs")).toBe(hit.name);
        expect(contentName(table, entry, "en")).toBe(entry.name);
        expect(localizeEntryCs(table, { ...entry, source: "homebrew" })).toEqual({ ...entry, source: "homebrew" });
        const foreign = { ...entry, documentSlug: "unrelated-book" };
        expect(localizeEntryCs(table, foreign)).toBe(foreign);
        const changed = { ...entry, data: { ...entry.data, desc: "Changed upstream text" } };
        expect(localizeEntryCs(table, changed)).toBe(changed);
        const wrongSlug = { ...entry, slug: "unrelated-id" };
        expect(localizeEntryCs(table, wrongSlug)).toBe(wrongSlug);
        count++;
      }
    }
    expect(count).toBe(19);
  });
});


describe("Source-specific Czech expansion names", () => {
  it("keeps all 81 known fixture names scoped to their source and slug", () => {
    let count = 0;
    for (const [documentSlug, tables] of Object.entries(expansionTranslations)) {
      for (const [table, entries] of Object.entries(tables)) {
        for (const [slug, hit] of Object.entries(entries)) {
          const kind = table as Parameters<typeof contentName>[0];
          const row = { slug, name: hit.englishName, source: "open5e", documentSlug };
          expect(contentName(kind, row, "cs")).toBe(hit.name);
          expect(contentName(kind, row, "en")).toBe(row.name);
          expect(contentName(kind, { ...row, source: "homebrew" }, "cs")).toBe(row.name);
          expect(contentName(kind, { ...row, name: "Unrelated source name", slug: "unrelated-id" }, "cs")).toBe("Unrelated source name");
          count++;
        }
      }
    }
    expect(count).toBe(81);
  });
});
