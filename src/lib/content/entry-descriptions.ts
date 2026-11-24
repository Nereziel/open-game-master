import { czechGearDescription } from "./entry-descriptions-cs";
import { frenchItemDescription } from "./item-descriptions-fr";
import { expansionDescriptionCs } from "./expansion-descriptions-cs";
import { czechFullTranslation } from "@/lib/rulebook/czech-companion";
import { rulebookPage, rulebookPages } from "@/lib/rulebook/book";
import { rulebookPageIdFor } from "@/lib/rulebook/catalog-rows";
import type { RulebookKind } from "@/lib/rulebook/types";
import { translate, type Locale } from "@/lib/i18n/translate";
import { localizeBackgroundFeatureText } from "@/lib/backgrounds";
import { backgroundFeatureLabel, speciesTraitName, subclassName } from "./names";
import { SRD_RACES } from "@/lib/srd";
import { subclassNamed } from "@/lib/srd/subclass-name";
import { textKey } from "@/lib/language/text-logic";
import { describeContentEntry } from "@/lib/help";

type Row = {
  slug?: string;
  name?: string;
  source?: string;
  documentSlug?: string;
  data?: Record<string, unknown>;
};

type SrdDescription = (kind: RulebookKind, name: string, id: string | null) => string | null | undefined;
type DescriptionProvider = {
  srd: SrdDescription;
  expansion?: (table: string, row: Row) => string | undefined;
};

const KINDS: Record<string, RulebookKind> = {
  spells: "spell",
  items: "item",
  classes: "class",
  monsters: "monster",
  races: "race",
};

// The official French and reviewed Czech books have different data shapes.
// Both are display-only: the canonical row remains the engine's input.
const PROVIDERS: Partial<Record<Locale, DescriptionProvider>> = {
  fr: {
    srd: (kind, name, id) => {
      if (kind === "item") return frenchItemDescription(name);
      const md = id ? rulebookPage(id, "fr")?.page.md : undefined;
      return md && id && md !== rulebookPage(id, "en")?.page.md ? md : undefined;
    },
  },
  cs: {
    expansion: expansionDescriptionCs,
    srd: (kind, name, id) => {
      const full = id ? czechFullTranslation(id) : undefined;
      if (full) return kind === "item" ? full.split(/\n\n+/).slice(1).join("\n\n").trim() : full;
      return kind === "item" ? czechGearDescription(name) : undefined;
    },
  },
};

const CORE_DOCUMENTS = new Set(["wotc-srd", "srd-2014"]);
const CORE_SOURCES = new Set(["srd", "open5e", "bundled"]);

// Only the peoples and subraces actually printed in SRD 5.1. The general
// racePageFor fallback is useful for looking up shared traits, but cannot
// serve as the complete description of a different subrace.
const SRD_RACE_NAMES = new Set([
  "dwarf", "hill dwarf", "dwarf (hill)", "dwarf, hill",
  "elf", "high elf", "elf (high)", "elf, high",
  "halfling", "lightfoot halfling", "halfling (lightfoot)", "halfling, lightfoot", "lightfoot",
  "human", "dragonborn",
  "gnome", "rock gnome", "gnome (rock)", "gnome, rock",
  "half-elf", "half elf", "half-orc", "half orc", "tiefling",
]);

function corePageId(kind: RulebookKind, name: string): string | null {
  if (kind !== "race") return rulebookPageIdFor(kind, name);
  const wanted = name.trim().toLowerCase();
  const exact = rulebookPages("en").find((page) => page.kind === "race" && page.title.toLowerCase() === wanted);
  if (exact) return exact.id;
  if (!SRD_RACE_NAMES.has(wanted)) return null;
  const aliases: Record<string, string> = {
    "dwarf, hill": "Dwarf (Hill)", "elf, high": "Elf (High)",
    "halfling, lightfoot": "Halfling (Lightfoot)", "lightfoot": "Halfling (Lightfoot)",
    "gnome, rock": "Gnome (Rock)", "half elf": "Half-Elf", "half orc": "Half-Orc",
  };
  return rulebookPageIdFor(kind, aliases[wanted] ?? name);
}

// The twelve SRD 5.1 subclasses, identified by their class and whole
// canonical name. Czech headings follow the existing reviewed book, not
// necessarily the shorter picker labels. Other subclasses keep their text.
const SRD_ARCHETYPES: Record<string, { name: string; headings: Partial<Record<Locale, string>> }> = {
  barbarian: { name: "Path of the Berserker", headings: { cs: "Cesta berserkra" } },
  bard: { name: "College of Lore", headings: { cs: "Kolej znalostí" } },
  cleric: { name: "Life Domain", headings: { cs: "Doména Život" } },
  druid: { name: "Circle of the Land", headings: { cs: "Kruh země" } },
  fighter: { name: "Champion", headings: { cs: "Šampion" } },
  monk: { name: "Way of the Open Hand", headings: { cs: "Cesta otevřené ruky" } },
  paladin: { name: "Oath of Devotion", headings: { cs: "Přísaha oddanosti" } },
  ranger: { name: "Hunter", headings: { cs: "Lovec" } },
  rogue: { name: "Thief", headings: { cs: "Zloděj" } },
  sorcerer: { name: "Draconic Bloodline", headings: { cs: "Dračí rodokmen" } },
  warlock: { name: "The Fiend", headings: { cs: "Běs" } },
  wizard: { name: "School of Evocation", headings: { cs: "Škola zaklínání" } },
};

function archetypeDescription(row: Row & { name: string; data: Record<string, unknown> }, locale: Locale, provider: DescriptionProvider): string | undefined {
  const declaredClass = row.data.class_slug ?? row.data.classSlug ?? row.data.class;
  const classId = typeof declaredClass === "string" && declaredClass.trim()
    ? declaredClass.trim().toLowerCase()
    : Object.keys(SRD_ARCHETYPES).find((id) => row.slug?.startsWith(id + "-"));
  // Some published SRD rows use a bare slug and no class field. The exact
  // name must then identify one and only one of the twelve printed entries.
  const candidates = Object.entries(SRD_ARCHETYPES).filter(([id, entry]) =>
    (!classId || classId === id) && subclassNamed(row.name, entry.name));
  if (candidates.length !== 1) return undefined;
  const [id, entry] = candidates[0];
  const md = provider.srd("class", id, id);
  if (!md) return undefined;
  const heading = entry.headings[locale] ?? subclassName(id, entry.name, locale);
  const lines = md.split("\n");
  const start = lines.findIndex((line) => {
    const match = /^(#{2,6})\s+(.+?)\s*#*\s*$/.exec(line);
    return match && textKey(match[2]) === textKey(heading);
  });
  if (start < 0) return undefined;
  const depth = /^#+/.exec(lines[start])![0].length;
  const next = lines.findIndex((line, index) => index > start && new RegExp(`^#{1,${depth}}\\s+`).test(line));
  return lines.slice(start, next < 0 ? undefined : next).join("\n").trim() || undefined;
}

// For an exact bundled race outside the printed SRD, reuse its own
// localized trait summaries. Never substitute the parent race's full rules
// or copy these summaries onto a third-party row with the same name.
function bundledRaceDescription(row: Row, locale: Locale): string | undefined {
  const race = SRD_RACES.find((entry) => entry.id === row.slug && entry.name === row.name);
  if (!race || row.source !== "bundled" || !race.traits.length || row.data?.desc) return undefined;
  const lines = race.traits.map((trait) => speciesTraitName(race.id, trait, locale));
  if (lines.some((line, index) => line === race.traits[index])) return undefined;
  return lines.join("\n\n");
}

// Use exact English source text for background translations, not merely a
// matching feature title. Keep any untranslated prose in the display copy.
function backgroundDescription(row: Row & { name: string; data: Record<string, unknown> }, locale: Locale): string | undefined {
  const data = { ...row.data };
  let changed = false;
  for (const key of ["desc", "description", "feature_desc"] as const) {
    const original = data[key];
    if (typeof original !== "string" || !original.trim()) continue;
    const localized = key === "feature_desc" ? localizeBackgroundFeatureText(original, locale) : translate(locale, original);
    if (localized !== original) {
      data[key] = localized;
      changed = true;
    }
  }
  if (!changed) return undefined;
  if (typeof data.feature === "string") data.feature = backgroundFeatureLabel(row.name, data.feature, locale);
  return describeContentEntry(data, undefined, locale) ?? undefined;
}

// Apply only after the canonical row, mechanics and labels have been assembled.
// Unknown/foreign entries, homebrew, lite rows and missing translations keep
// their original prose. Both routes use this same adapter.
export function localizeEntry<T>(table: string, entry: T, locale: Locale): T {
  const row = entry as T & Row;
  const provider = PROVIDERS[locale];
  if (!provider || !row?.name || !row.data || typeof row.data !== "object" || Array.isArray(row.data) || !Object.keys(row.data).length) return entry;
  const expansion = provider.expansion?.(table, row);
  let desc = expansion;
  const kind = KINDS[table];
  const core = CORE_DOCUMENTS.has(row.documentSlug ?? "") && CORE_SOURCES.has(row.source ?? "");
  if (!desc && kind && core) {
    desc = provider.srd(kind, row.name, corePageId(kind, row.name)) ?? undefined;
  }
  if (!desc && table === "races" && core) {
    desc = bundledRaceDescription(row, locale);
  }
  if (!desc && table === "archetypes" && core) {
    desc = archetypeDescription({ ...row, name: row.name, data: row.data }, locale, provider);
  }
  if (!desc && table === "backgrounds" && (core || (row.source === "bundled" && row.documentSlug === "odm"))) {
    desc = backgroundDescription({ ...row, name: row.name, data: row.data }, locale);
  }
  return desc ? { ...row, data: { ...row.data, localized_desc: desc } } : entry;
}
