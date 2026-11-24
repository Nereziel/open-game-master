import { describe, expect, it } from "vitest";
import gearFr from "./item-descriptions-fr.json";
import gearCs from "./item-descriptions-cs.json";
import { buildItemSheet, itemCardRows } from "../help/item-sheet";
import { czechGearDescription } from "./entry-descriptions-cs";
import { localizeEntry } from "./entry-descriptions";
import { bundledItemRows, bundledSpellRows } from "@/lib/rulebook/catalog-rows";
import { czechFullTranslation } from "@/lib/rulebook/czech-companion";
import { rulebookPages } from "@/lib/rulebook/book";
import { SRD_BACKGROUNDS } from "@/lib/srd";
import { describeContentEntry } from "@/lib/help";
import spellFixture from "../../../scripts/fixtures/reader-golden/spell.json";
import featFixture from "../../../scripts/fixtures/reader-golden/feat.json";
import backgroundFixture from "../../../scripts/fixtures/reader-golden/background.json";
import expansionTranslations from "./expansion-descriptions-cs.json";
import { packFeatText } from "@/lib/srd/feat-text";
import { contentName, contentNameMatches, localizedExpansionName, archetypeDisplayName } from "./names";
import "../i18n/cs-catalog";
import "../i18n/fr-catalog";
import expansionNames from "./expansion-names-cs.json";


const localizeEntryCs = <T,>(table: string, row: T): T => localizeEntry(table, row, "cs");

describe("Source-safe display names and search", () => {
  it("localizes bundled core rows and matches their translated labels", () => {
    const row = bundledSpellRows().find((entry) => entry.rulebook === "fireball")!;
    expect(contentName("spells", row, "cs")).toBe("Ohnivá koule");
    expect(contentName("spells", row, "fr")).toBe("Boule de feu");
    expect(contentNameMatches("spells", row, "ohniva kou", "cs")).toBe(true);
    expect(contentNameMatches("spells", row, "boule de", "fr")).toBe(true);
    expect(contentNameMatches("spells", row, "Fireball", "cs")).toBe(true);
    expect(contentNameMatches("spells", row, "ohniva kou", "en")).toBe(false);
    for (const foreign of [
      { ...row, source: "homebrew" },
      { ...row, source: "open5e", documentSlug: "unrelated-book" },
      { ...row, source: "open5e", documentSlug: "srd-2024" },
    ]) {
      expect(contentName("spells", foreign, "cs")).toBe("Fireball");
      expect(contentNameMatches("spells", foreign, "ohniva kou", "cs")).toBe(false);
      expect(contentNameMatches("spells", foreign, "Fireball", "cs")).toBe(true);
    }
  });

  it("matches the exact expansion label, not a translation from another book", () => {
    const [slug, hit] = Object.entries(expansionTranslations.toh.spells).find(([, hit]) => hit.name !== hit.englishName)!;
    const row = { slug, name: hit.englishName, source: "open5e", documentSlug: "toh" };
    expect(contentNameMatches("spells", row, hit.name, "cs")).toBe(true);
    expect(contentName("spells", { ...row, documentSlug: "unrelated-book" }, "cs")).toBe(row.name);
  });
});

describe("Archetype and feat display is separate from mechanics", () => {
  it("resolves every reviewed Tome of Heroes archetype by its actual source", () => {
    for (const [slug, hit] of Object.entries(expansionTranslations.toh.subclasses)) {
      const row = { slug, name: hit.englishName, source: "open5e", documentSlug: "toh" };
      expect(archetypeDisplayName("fighter", row.name, "cs", row)).toBe(hit.name);
      expect(archetypeDisplayName("fighter", row.name, "cs", { ...row, documentSlug: "other" })).toBe(row.name);
      expect(archetypeDisplayName("fighter", row.name, "cs", { ...row, source: "homebrew" })).toBe(row.name);
    }
  });
  it("keeps every reviewed Tome of Heroes feat's mechanical rules unchanged", () => {
    for (const [slug, hit] of Object.entries(expansionTranslations.toh.feats)) {
      const row = { slug, name: hit.englishName, source: "open5e", documentSlug: "toh", data: hit.original as Record<string, unknown> };
      const canonical = packFeatText(row.data);
      for (const locale of ["en", "fr", "cs"] as const) {
        expect(packFeatText(localizeEntry("feats", row, locale).data)).toEqual(canonical);
      }
      expect(localizeEntry("feats", row, "cs").data.localized_desc).toBe(hit.description);
    }
  });
});

describe("Shared localized content descriptions", () => {
  it("preserves canonical spell and item data for all reader languages", () => {
    const spell = bundledSpellRows().find((row) => row.rulebook === "fireball")!;
    const item = bundledItemRows().find((row) => row.rulebook === "cloak-of-protection")!;
    for (const [table, row] of [["spells", spell], ["items", item]] as const) {
      expect(localizeEntry(table, row, "en")).toBe(row);
      for (const locale of ["fr", "cs"] as const) {
        const result = localizeEntry(table, row, locale);
        const { localized_desc, ...original } = result.data;
        expect(localized_desc).toBeTypeOf("string");
        expect(localized_desc).not.toBe(row.data.desc);
        expect(original).toEqual(row.data);
        expect(result.name).toBe(row.name);
        expect(result.slug).toBe(row.slug);
        expect(result.documentSlug).toBe(row.documentSlug);
      }
    }
  });

  it("uses French or Czech equipment prose without replacing the English row or a different source", () => {
    const row = { slug: "torch", name: "Torch", source: "open5e", documentSlug: "wotc-srd", data: { desc: "A torch burns for one hour.", cost: "1 cp" } as Record<string, unknown> };
    for (const [locale, description] of [["fr", gearFr.torch], ["cs", gearCs.torch]] as const) {
      const result = localizeEntry("items", row, locale);
      expect(result.data).toEqual({ ...row.data, localized_desc: description });
      expect(buildItemSheet("Torch", [row.data, result.data], { locale })?.description).toBe(description);
      for (const other of [
        { ...row, source: "homebrew" },
        { ...row, documentSlug: "srd-2024" },
        { ...row, documentSlug: "unrelated-book" },
        { ...row, data: {} },
      ]) expect(localizeEntry("items", other, locale)).toBe(other);
    }
  });

  it("uses the same display strategy for bundled and published core classes", () => {
    for (const source of ["bundled", "open5e"]) {
      const row = { slug: "fighter", name: "Fighter", source, documentSlug: "wotc-srd", data: { desc: "English class prose." } as Record<string, unknown> };
      for (const locale of ["fr", "cs"] as const) {
        const result = localizeEntry("classes", row, locale);
        expect(result.data.localized_desc).toBeTypeOf("string");
        expect(result.data.desc).toBe(row.data.desc);
      }
    }
  });
});

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
  it("keeps the compact name index in sync with the server-only descriptions", () => {
    const expected = Object.fromEntries(Object.entries(expansionTranslations).map(([doc, tables]) => [doc, Object.fromEntries(Object.entries(tables).map(([table, rows]) => [table, Object.fromEntries(Object.entries(rows).map(([slug, row]) => [slug, { englishName: row.englishName, name: row.name }]))]))]));
    expect(expansionNames).toEqual(expected);
  });
  it("uses the same source identity for API and translation-table kind aliases", () => {
    for (const [apiKind, table] of [["races", "species"], ["archetypes", "subclasses"]] as const) {
      for (const [slug, hit] of Object.entries(expansionTranslations.toh[table])) {
        const row = { slug, name: hit.englishName, documentSlug: "toh", source: "open5e" };
        expect(localizedExpansionName(apiKind, row, "cs"), slug).toBe(hit.name);
        expect(localizedExpansionName(table, row, "cs"), slug).toBe(hit.name);
        expect(localizedExpansionName(apiKind, { ...row, source: "homebrew" }, "cs")).toBeUndefined();
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
    expect(rows).toHaveLength(40);
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
    expect(rows).toHaveLength(76);
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

describe("Item information card source identity", () => {
  it("never borrows localized prose from a different book or homebrew with the same name", () => {
    const core = { name: "Torch", slug: "torch", source: "open5e", documentSlug: "wotc-srd", data: { desc: "Core torch", localized_desc: "Pochodeň ze SRD" } };
    const foreign = { name: "Torch", slug: "torch-toh", source: "open5e", documentSlug: "toh", data: { desc: "Different torch" } };
    const brew = { name: "Torch", slug: "homebrew:torch", source: "homebrew", documentSlug: "homebrew", data: { desc: "My torch" } };
    const otherBrew = { ...brew, slug: "homebrew:other", data: { localized_desc: "Unrelated" } };
    for (const locale of ["en", "fr", "cs"] as const) {
      expect(buildItemSheet("Torch", itemCardRows("Torch", foreign, [core, brew]), { locale })?.description).toBe("Different torch");
      expect(buildItemSheet("Torch", itemCardRows("Torch", brew, [core, foreign, otherBrew]), { locale })?.description).toBe("My torch");
      expect(itemCardRows("Torch", null, [foreign, core])).toEqual([foreign.data]);
    }
  });

  it("still combines complementary SRD rows without borrowing another source", () => {
    const stats = { name: "Torch", slug: "torch", source: "open5e", documentSlug: "wotc-srd", data: { weight: "1 lb." } };
    const prose = { ...stats, slug: "torch-v2", documentSlug: "srd-2014", data: { desc: "English prose", localized_desc: "Český popis" } };
    const other = { ...prose, documentSlug: "srd-2024", data: { localized_desc: "Wrong edition" } };
    const rows = itemCardRows("Torch", stats, [other, prose]);
    expect(rows).toEqual([stats.data, prose.data]);
    expect(buildItemSheet("Torch", rows, { locale: "cs" })?.description).toBe("Český popis");
  });
});

describe("Core race and background presentation", () => {
  it("serves all nine SRD race pages without changing identity or traits", () => {
    const pages = rulebookPages("en").filter((page) => page.kind === "race");
    expect(pages).toHaveLength(9);
    for (const page of pages) {
      const row = { slug: page.id, name: page.title, source: "open5e", documentSlug: "wotc-srd", data: { desc: page.md, traits: ["canonical trait"] } as Record<string, unknown> };
      expect(localizeEntry("races", row, "en")).toBe(row);
      for (const locale of ["fr", "cs"] as const) {
        const result = localizeEntry("races", row, locale);
        const { localized_desc, ...original } = result.data;
        expect(typeof localized_desc, page.id + " " + locale).toBe("string");
        expect(original).toEqual(row.data);
        expect(result.slug).toBe(row.slug);
      }
      expect(localizeEntry("races", { ...row, source: "homebrew" }, "cs").data).toEqual(row.data);
      expect(localizeEntry("races", { ...row, documentSlug: "unrelated-book" }, "cs").data).toEqual(row.data);
    }
  });

  it("does not substitute the SRD subrace for a different bundled subrace", () => {
    for (const name of ["Dwarf (Mountain)", "Elf (Wood)", "Halfling (Stout)", "Gnome (Forest)", "Human (Variant)"]) {
      const row = { name, source: "bundled", documentSlug: "wotc-srd", data: { desc: "Own rules" } };
      for (const locale of ["fr", "cs"] as const) expect(localizeEntry("races", row, locale)).toBe(row);
    }
    const hill = { name: "Dwarf (Hill)", source: "bundled", documentSlug: "wotc-srd", data: { desc: "Hill dwarf", traits: [] } as Record<string, unknown> };
    expect(localizeEntry("races", hill, "cs").data.localized_desc).toBeTypeOf("string");
  });

  it("uses reviewed Czech feature prose for every bundled base background", () => {
    expect(SRD_BACKGROUNDS).toHaveLength(18);
    for (const background of SRD_BACKGROUNDS) {
      const row = { name: background.name, slug: background.id, source: "bundled", documentSlug: "odm", data: { desc: background.blurb, feature: background.feature, feature_desc: background.featureDesc } as Record<string, unknown> };
      const result = localizeEntry("backgrounds", row, "cs");
      const { localized_desc, ...original } = result.data;
      expect(typeof localized_desc, background.id).toBe("string");
      expect(String(localized_desc), background.id).not.toContain(background.featureDesc);
      expect(original).toEqual(row.data);
    }
  });

  it("reuses the exact reviewed Czech feature text for a bundled background", () => {
    const background = SRD_BACKGROUNDS.find((entry) => entry.id === "acolyte")!;
    const row = { name: background.name, slug: background.id, source: "bundled", documentSlug: "odm", data: { desc: background.blurb, feature: background.feature, feature_desc: background.featureDesc } as Record<string, unknown> };
    const result = localizeEntry("backgrounds", row, "cs");
    const { localized_desc, ...original } = result.data;
    expect(localized_desc).toContain("bezplatné léčení");
    expect(original).toEqual(row.data);
    expect(describeContentEntry(result.data)).toBe(localized_desc);
    expect(localizeEntry("backgrounds", row, "en")).toBe(row);
    for (const entry of [{ ...row, source: "homebrew" }, { ...row, source: "open5e", documentSlug: "other" }]) {
      expect(localizeEntry("backgrounds", entry, "cs")).toBe(entry);
    }
    const changed = { ...row, data: { feature: background.feature, feature_desc: "Different source text." } };
    expect(localizeEntry("backgrounds", changed, "cs")).toBe(changed);
  });
});

describe("Core SRD archetype display", () => {
  const examples = [
    ["barbarian", "Path of the Berserker", "Cesta berserkra"],
    ["bard", "College of Lore", "Kolej znalostí"],
    ["cleric", "Life Domain", "Doména Život"],
    ["druid", "Circle of the Land", "Kruh země"],
    ["fighter", "Champion", "Šampion"],
    ["monk", "Way of the Open Hand", "Cesta otevřené ruky"],
    ["paladin", "Oath of Devotion", "Přísaha oddanosti"],
    ["ranger", "Hunter", "Lovec"],
    ["rogue", "Thief", "Zloděj"],
    ["sorcerer", "Draconic Bloodline", "Dračí rodokmen"],
    ["warlock", "The Fiend", "Běs"],
    ["wizard", "School of Evocation", "Škola zaklínání"],
  ];
  it("reuses the existing twelve Czech book sections without changing source rules", () => {
    for (const [classId, name, heading] of examples) {
      for (const source of ["bundled", "open5e"]) {
        const row = { name, slug: classId + "-" + name.toLowerCase().replace(/ /g, "-"), documentSlug: "wotc-srd", source, data: { desc: "Canonical rules", class: classId } as Record<string, unknown> };
        const result = localizeEntry("archetypes", row, "cs");
        const { localized_desc, ...original } = result.data;
        expect(String(localized_desc), name).toMatch(new RegExp("^### " + heading));
        expect(String(localized_desc).length).toBeGreaterThan(100);
        expect(original).toEqual(row.data);
        expect(localizeEntry("archetypes", row, "en")).toBe(row);
        for (const foreign of [{ ...row, documentSlug: "other" }, { ...row, source: "homebrew" }, { ...row, data: { ...row.data, class: "unrelated-class" } }]) {
          expect(localizeEntry("archetypes", foreign, "cs")).toBe(foreign);
        }
      }
    }
  });
  it("does not substitute another subclass from the same class", () => {
    const row = { name: "Battle Master", slug: "fighter-battle-master", source: "bundled", documentSlug: "wotc-srd", data: { desc: "Different rules" } };
    expect(localizeEntry("archetypes", row, "cs")).toBe(row);
    expect(localizeEntry("archetypes", row, "fr")).toBe(row);
  });
});
