import { czechFullTranslation } from "@/lib/rulebook/czech-companion";
import { rulebookPageIdFor } from "@/lib/rulebook/catalog-rows";
import type { RulebookKind } from "@/lib/rulebook/types";

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
    name?: string;
    source?: string;
    documentSlug?: string;
    data?: Record<string, unknown>;
  };
  const kind = KINDS[table];
  if (!kind || !row?.name || !row.data || !Object.keys(row.data).length ||
      (row.source !== "srd" && row.source !== "open5e") ||
      (row.documentSlug !== "wotc-srd" && row.documentSlug !== "srd-2014")) {
    return entry;
  }
  const id = rulebookPageIdFor(kind, row.name);
  const full = id ? czechFullTranslation(id) : undefined;
  if (!full) return entry;
  const desc = kind === "item" ? full.split(/\n\n+/).slice(1).join("\n\n").trim() : full;
  if (!desc) return entry;
  return { ...row, data: { ...row.data, localized_desc: desc } };
}
