import { describe, expect, it } from "vitest";
import gearFr from "./item-descriptions-fr.json";
import gearCs from "./item-descriptions-cs.json";
import { buildItemSheet } from "../help/item-sheet";
import { czechGearDescription, localizeEntryCs } from "./entry-descriptions-cs";
import { bundledItemRows, bundledSpellRows } from "@/lib/rulebook/catalog-rows";
import { czechFullTranslation } from "@/lib/rulebook/czech-companion";
import { describeContentEntry } from "@/lib/help";
import spellFixture from "../../../scripts/fixtures/reader-golden/spell.json";
import featFixture from "../../../scripts/fixtures/reader-golden/feat.json";
import backgroundFixture from "../../../scripts/fixtures/reader-golden/background.json";
import expansionTranslations from "./expansion-descriptions-cs.json";
import { contentName } from "./names";
import { expansionNameCs } from "./expansion-descriptions-cs";


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
  it("uses the same source identity for API and translation-table kind aliases", () => {
    for (const [apiKind, table] of [["races", "species"], ["archetypes", "subclasses"]] as const) {
      for (const [slug, hit] of Object.entries(expansionTranslations.toh[table])) {
        const row = { slug, name: hit.englishName, documentSlug: "toh", source: "open5e" };
        expect(expansionNameCs(apiKind, row), slug).toBe(hit.name);
        expect(expansionNameCs(table, row), slug).toBe(hit.name);
        expect(expansionNameCs(apiKind, { ...row, source: "homebrew" })).toBeUndefined();
      }
    }
  });

  it("keeps all verified source names scoped to their source and slug", () => {
    let count = 0;
    for (const [documentSlug, tables] of Object.entries(expansionTranslations as Record<string, Record<string, Record<string, { englishName: string; name: string }>>>)) {
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
    expect(count).toBe(638);
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
  it("includes all 91 Tome of Heroes and 19 Deep Magic spell descriptions", () => {
    for (const [documentSlug, spells, expected] of [
      ["toh", expansionTranslations.toh.spells, 91],
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


describe("Tome of Heroes mundane equipment", () => {
  it("localizes 36 source stat records without inventing absent rules", () => {
    const records = Object.entries(expansionTranslations.toh.items).filter(([, hit]) => "metadataDescription" in hit);
    expect(records).toHaveLength(36);
    for (const [slug, hit] of records) {
      if (!("metadataDescription" in hit) || !("original" in hit)) throw new Error(slug);
      const row = { slug, name: hit.englishName, documentSlug: "toh", source: "open5e", data: hit.original as Record<string, unknown> };
      expect(localizeEntryCs("items", row).data.localized_desc).toBe(hit.metadataDescription);
    }
  });
});


describe("Tome of Heroes race descriptions", () => {
  it("serves all 40 race and subrace texts without changing canonical traits", () => {
    const rows = Object.entries(expansionTranslations.toh.species).filter(([, hit]) => "description" in hit);
    expect(rows).toHaveLength(76);
    for (const [slug, hit] of rows) {
      if (!("description" in hit) || !("original" in hit)) throw new Error(slug);
      const row = { slug, name: hit.englishName, documentSlug: "toh", source: "open5e", data: hit.original as Record<string, unknown> };
      const localized = localizeEntryCs("races", row);
      expect(localized.data.localized_desc).toBe(hit.description);
      const { localized_desc, ...original } = localized.data;
      expect(original).toEqual(row.data);
    }
  });
});


describe("Tome of Heroes spell metadata", () => {
  it("keeps all 91 v1 descriptions tied to their checked casting metadata", () => {
    const spells = Object.entries(expansionTranslations.toh.spells);
    expect(spells).toHaveLength(91);
    for (const [slug, hit] of spells) {
      const data = hit.original as Record<string, unknown>;
      expect(data.spell_level, slug).toBeTypeOf("number");
      expect(data.school, slug).toBeTypeOf("string");
      expect(data.casting_time, slug).toBeTypeOf("string");
      expect(data.range, slug).toBeTypeOf("string");
      expect(data.requires_concentration, slug).toBeTypeOf("boolean");
      const row = { slug, name: hit.englishName, documentSlug: "toh", source: "open5e", data };
      expect(localizeEntryCs("spells", row).data.localized_desc).toBe(hit.description);
      const changed = { ...row, data: { ...data, spell_level: -1 } };
      expect(localizeEntryCs("spells", changed)).toBe(changed);
    }
  });
});


describe("Tome of Heroes backgrounds", () => {
  it("serves all 18 available backgrounds with all 26 personality table entries", () => {
    const rows = Object.entries(expansionTranslations.toh.backgrounds);
    expect(rows).toHaveLength(18);
    for (const [slug, hit] of rows) {
      const data = hit.original as Record<string, unknown>;
      const row = { slug, name: hit.englishName, documentSlug: "toh", source: "open5e", data };
      expect(localizeEntryCs("backgrounds", row).data.localized_desc).toBe(hit.description);
      for (const [heading, size] of [["Osobnostní rys", 8], ["Ideál", 6], ["Pouto", 6], ["Slabina", 6]] as const) {
        const section = hit.description.split("| k" + size + " | " + heading + " |")[1]?.split("\n\n")[0];
        expect(section?.match(/^\| \d+ \|/gm)?.length, slug + ": " + heading).toBe(size);
      }
      const changed = { ...row, data: { ...data, feature_desc: "Changed original" } };
      expect(localizeEntryCs("backgrounds", changed)).toBe(changed);
    }
  });
});


describe("Tome of Heroes archetypes", () => {
  it("preserves the source prose of reviewed archetypes", () => {
    const rows = Object.entries(expansionTranslations.toh.subclasses).filter(([, hit]) => "description" in hit);
    expect(rows).toHaveLength(40);
    for (const [slug, hit] of rows) {
      if (!("description" in hit) || !("original" in hit)) throw new Error(slug);
      const row = { slug, name: hit.englishName, documentSlug: "toh", source: "open5e", data: hit.original as Record<string, unknown> };
      expect(localizeEntryCs("archetypes", row).data.localized_desc).toBe(hit.description);
      const { localized_desc, ...original } = localizeEntryCs("archetypes", row).data;
      expect(original).toEqual(row.data);
      const changed = { ...row, data: { ...row.data, desc: "Changed upstream text" } };
      expect(localizeEntryCs("archetypes", changed)).toBe(changed);
    }
  });
});

describe("Czech everyday equipment display", () => {
  it("covers exactly the same 120 equipment keys as French", () => {
    expect(Object.keys(gearCs).sort()).toEqual(Object.keys(gearFr).sort());
    expect(Object.keys(gearCs)).toHaveLength(120);
    for (const [key, value] of Object.entries(gearCs)) {
      expect(czechGearDescription(key)).toBe(value);
      expect(value).not.toBe((gearFr as Record<string, string>)[key]);
    }
    expect(czechGearDescription("Healer's Kit")).toContain("10 použití");
    expect(czechGearDescription("Thieves’ Tools")).toContain("zdatnostní bonus");
  });

  it("preserves source fields and gives the item dialog the Czech description", () => {
    const row = { slug: "torch", name: "Torch", source: "open5e", documentSlug: "wotc-srd", data: { desc: "A torch burns for one hour.", cost: "1 cp", weight: "1 lb." } as Record<string, unknown> };
    const translated = localizeEntryCs("items", row);
    const { localized_desc, ...original } = translated.data;
    expect(localized_desc).toBe(gearCs.torch);
    expect(original).toEqual(row.data);
    expect(buildItemSheet("Torch", [row.data, translated.data], { locale: "cs" })?.description).toBe(gearCs.torch);
    for (const foreign of [
      { ...row, source: "homebrew" },
      { ...row, documentSlug: "srd-2024" },
      { ...row, documentSlug: "other" },
    ]) expect(localizeEntryCs("items", foreign)).toBe(foreign);
  });

  it("prefers reviewed localized prose for a matching background feature", () => {
    const data = { feature: "Secret Lore", feature_desc: "English description.", localized_desc: "Tajná znalost a její pravidla." };
    expect(describeContentEntry(data, "Secret Lore")).toBe(data.localized_desc);
  });
});
