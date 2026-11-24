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
  it("keeps all verified source names scoped to their source and slug", () => {
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
    expect(count).toBe(551);
  });
});


describe("Recovered Tome of Heroes feats", () => {
  it("contains all 13 source-backed feats with complete rules and unchanged English mechanics", () => {
    const feats = expansionTranslations.toh.feats;
    expect(Object.keys(feats)).toHaveLength(13);
    for (const [slug, hit] of Object.entries(feats)) {
      const row = { slug, name: hit.englishName, documentSlug: "toh", source: "open5e", data: hit.original as Record<string, unknown> };
      const localized = localizeEntryCs("feats", row);
      expect(localized.data.localized_desc).toBe(hit.description);
      const { localized_desc, ...original } = localized.data;
      expect(original).toEqual(row.data);
    }
  });
});


describe("Tome of Heroes magic items", () => {
  it("serves all 29 reviewed descriptions and keeps original metadata", () => {
    const items = Object.entries(expansionTranslations.toh.items).filter(([, hit]) => "description" in hit);
    expect(items).toHaveLength(29);
    for (const [slug, hit] of items) {
      if (!("description" in hit) || !("original" in hit)) throw new Error(slug);
      const row = { slug, name: hit.englishName, documentSlug: "toh", source: "open5e", data: hit.original as Record<string, unknown> };
      const localized = localizeEntryCs("items", row);
      expect(localized.data.localized_desc).toBe(hit.description);
      const { localized_desc, ...original } = localized.data;
      expect(original).toEqual(row.data);
    }
  });
});


describe("Reviewed external spell texts from Open5e", () => {
  it("includes 14 Tome of Heroes and 19 Deep Magic spell descriptions", () => {
    for (const [documentSlug, spells, expected] of [
      ["toh", expansionTranslations.toh.spells, 14],
      ["dmag", expansionTranslations.dmag.spells, 19],
    ] as const) {
      const rows = Object.entries(spells).filter(([, hit]) => "description" in hit);
      expect(rows).toHaveLength(expected);
      for (const [slug, hit] of rows) {
        if (!("description" in hit) || !("original" in hit)) throw new Error(slug);
        const row = { slug, name: hit.englishName, documentSlug, source: "open5e", data: hit.original as Record<string, unknown> };
        expect(localizeEntryCs("spells", row).data.localized_desc).toBe(hit.description);
      }
    }
  });
});


describe("Vault of Magic reviewed backup descriptions", () => {
  it("serves 48 source-matched descriptions", () => {
    const items = Object.entries(expansionTranslations.vom.items).filter(([, hit]) => "description" in hit);
    expect(items).toHaveLength(48);
    for (const [slug, hit] of items) {
      if (!("description" in hit) || !("original" in hit)) throw new Error(slug);
      const row = { slug, name: hit.englishName, documentSlug: "vom", source: "open5e", data: hit.original as Record<string, unknown> };
      expect(localizeEntryCs("items", row).data.localized_desc).toBe(hit.description);
    }
  });
});
