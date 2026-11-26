import { archetypeDisplayName, contentName, type LocalizedNamesTable, type NamedRow } from "@/lib/content/names";
import { translate, type Locale } from "@/lib/i18n/translate";
import { itemRarityLabel } from "@/lib/content/item-rarity";

// Display only: callers pass the original entry to the selection handler.
export function pickerName(kind: string, entry: NamedRow, locale: Locale, classId = ""): string {
  if (kind === "archetypes") return archetypeDisplayName(classId, entry.name, locale, entry);
  if (kind === "hazards") return entry.name;
  return contentName((kind === "races" ? "species" : kind) as LocalizedNamesTable | "items", entry, locale);
}

export function pickerMeta(entry: { level?: number; rarity?: string; kind?: string }, locale: Locale, levelKey = "Level {level}"): string {
  if (entry.level !== undefined) return translate(locale, levelKey, { level: entry.level });
  if (entry.rarity) return itemRarityLabel(entry.rarity, locale);
  return entry.kind ? translate(locale, entry.kind, { context: "content.itemKind" }) : "";
}
