import { czechGearDescription } from "./entry-descriptions-cs";
import { frenchItemDescription } from "./item-descriptions-fr";
import { expansionDescriptionCs } from "./expansion-descriptions-cs";
import { czechFullTranslation } from "@/lib/rulebook/czech-companion";
import { rulebookPage } from "@/lib/rulebook/book";
import { rulebookPageIdFor } from "@/lib/rulebook/catalog-rows";
import type { RulebookKind } from "@/lib/rulebook/types";
import { translate, type Locale } from "@/lib/i18n/translate";
import { localizeBackgroundFeatureText } from "@/lib/backgrounds";
import { backgroundFeatureLabel } from "./names";
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
  if (kind === "race" && !SRD_RACE_NAMES.has(name.trim().toLowerCase())) return null;
  const canonical = kind === "race" && name.trim().toLowerCase() === "lightfoot" ? "Lightfoot Halfling" : name;
  return rulebookPageIdFor(kind, canonical);
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
  return describeContentEntry(data) ?? undefined;
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
  if (!desc && table === "backgrounds" && (core || (row.source === "bundled" && row.documentSlug === "odm"))) {
    desc = backgroundDescription({ ...row, name: row.name, data: row.data }, locale);
  }
  return desc ? { ...row, data: { ...row.data, localized_desc: desc } } : entry;
}
