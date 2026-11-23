import type { Locale } from "@/lib/i18n/translate";
import { itemDetailCs } from "@/lib/help/item-detail-cs";

// The catalog uses machine-readable kinds and lower-case rarity IDs; these
// labels are display only. The selected item keeps its original source data.
const ITEM_KIND_NAMES: Readonly<Record<string, string>> = {
  gear: "Adventuring gear",
  weapon: "Weapon",
  armor: "Armor",
  magic_item: "Magic item",
};
const ITEM_RARITY_NAMES: Readonly<Record<string, string>> = {
  common: "Common", uncommon: "Uncommon", rare: "Rare",
  "very rare": "Very rare", legendary: "Legendary", artifact: "Artifact",
};

export function itemPickerKindLabel(kind: string | undefined, locale: Locale): string {
  if (!kind) return "";
  if (locale !== "cs") return kind;
  const canonical = kind.trim().toLowerCase().replace(/[_-]/g, " ");
  return itemDetailCs(ITEM_KIND_NAMES[kind] ?? ITEM_KIND_NAMES[canonical] ?? kind, locale);
}

export function itemPickerRarityLabel(rarity: string | undefined, locale: Locale): string {
  if (!rarity) return "";
  if (locale !== "cs") return rarity;
  const canonical = rarity.trim().toLowerCase().replace(/[_-]/g, " ");
  return itemDetailCs(ITEM_RARITY_NAMES[canonical] ?? rarity, locale);
}

export function itemPickerMeta(entry: { kind?: string; rarity?: string; cost?: string }, locale: Locale, price: (cost: string) => string): string {
  return [itemPickerKindLabel(entry.kind, locale), itemPickerRarityLabel(entry.rarity, locale) || price(entry.cost ?? "")]
    .filter(Boolean)
    .join(" · ");
}
