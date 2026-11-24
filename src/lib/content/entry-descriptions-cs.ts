import gearDescriptions from "./item-descriptions-cs.json";
import { textKey } from "@/lib/language/text-logic";
import { expansionDescriptionCs } from "./expansion-descriptions-cs";
import { czechFullTranslation } from "@/lib/rulebook/czech-companion";
import { rulebookPageIdFor } from "@/lib/rulebook/catalog-rows";
import type { RulebookKind } from "@/lib/rulebook/types";

const GEAR_DESCRIPTIONS: Readonly<Record<string, string>> = gearDescriptions;

export function czechGearDescription(name: string): string | undefined {
  const key = textKey(name);
  // Some editions spell Thieves\' Tools without the possessive apostrophe.
  return Object.hasOwn(GEAR_DESCRIPTIONS, key) ? GEAR_DESCRIPTIONS[key] : undefined;
}

const KINDS: Record<string, RulebookKind> = {
  spells: "spell",
  items: "item",
  classes: "class",
  monsters: "monster",
};

// Like the French item adapter, resolve the published entry against the
// bundled SRD. Keep display prose separate: parsers and workshop copies
// still need the original English desc, higher_level and mechanical fields.
export function localizeEntryCs<T>(table: string, entry: T): T {
  const row = entry as T & {
    slug?: string;
    name?: string;
    source?: string;
    documentSlug?: string;
    data?: Record<string, unknown>;
  };
  const expansion = expansionDescriptionCs(table, row);
  if (expansion) return { ...row, data: { ...row.data, localized_desc: expansion } };
  const kind = KINDS[table];
  if (!kind || !row?.name || !row.data || !Object.keys(row.data).length ||
      (row.source !== "srd" && row.source !== "open5e") ||
      (row.documentSlug !== "wotc-srd" && row.documentSlug !== "srd-2014")) {
    return entry;
  }
  const id = rulebookPageIdFor(kind, row.name);
  const full = id ? czechFullTranslation(id) : undefined;
  const desc = full
    ? (kind === "item" ? full.split(/\n\n+/).slice(1).join("\n\n").trim() : full)
    : kind === "item" ? czechGearDescription(row.name) : undefined;
  if (!desc) return entry;
  return { ...row, data: { ...row.data, localized_desc: desc } };
}
