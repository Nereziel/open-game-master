import { czechGearDescription } from "./entry-descriptions-cs";
import { frenchItemDescription } from "./item-descriptions-fr";
import { expansionDescriptionCs } from "./expansion-descriptions-cs";
import { czechFullTranslation } from "@/lib/rulebook/czech-companion";
import { rulebookPage } from "@/lib/rulebook/book";
import { rulebookPageIdFor } from "@/lib/rulebook/catalog-rows";
import type { RulebookKind } from "@/lib/rulebook/types";
import type { Locale } from "@/lib/i18n/translate";

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
  if (!desc && kind && CORE_DOCUMENTS.has(row.documentSlug ?? "") && CORE_SOURCES.has(row.source ?? "")) {
    desc = provider.srd(kind, row.name, rulebookPageIdFor(kind, row.name)) ?? undefined;
  }
  return desc ? { ...row, data: { ...row.data, localized_desc: desc } } : entry;
}
