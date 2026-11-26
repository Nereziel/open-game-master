import { itemDisplayName } from "@/lib/content/item-display";
import { pickerMeta } from "@/lib/content/picker-display";
import type { NamedRow } from "@/lib/content/names";
import { translate, translatePlural, type Locale } from "@/lib/i18n/translate";
import type { EquipmentItem } from "@/lib/schemas/sheet";
import { localizeCoins, priceText } from "@/lib/srd/currency";
import { rowName } from "@/lib/srd/item-row";

// Published pack slugs need their document identity before applying a name
// table. Bundled SRD and workshop slugs already declare their origin.
export function needsLeadItemReference(item: EquipmentItem): boolean {
  return Boolean(item.slug && !/^(?:srd(?:-gear)?|homebrew):/.test(item.slug));
}

// The draft remains canonical. A matching detail response supplies only
// display metadata, never a replacement for the item's stored identity.
export function leadItemName(item: EquipmentItem, locale: Locale, reference?: NamedRow): string {
  if (reference?.slug && item.slug && reference.slug === item.slug && reference.name === rowName(item) &&
      reference.source && reference.documentSlug) {
    return itemDisplayName({ ...item, source: reference.source, documentSlug: reference.documentSlug }, locale, false);
  }
  if (needsLeadItemReference(item)) return item.name;
  return itemDisplayName(item, locale, false);
}

export function leadItemMeta(entry: { kind?: string; rarity?: string; cost?: string }, locale: Locale): string {
  return [
    pickerMeta({ kind: entry.kind }, locale),
    entry.rarity ? pickerMeta({ rarity: entry.rarity }, locale) : localizeCoins(priceText(entry.cost ?? ""), locale),
  ].filter(Boolean).join(" · ");
}

export function leadItemFlags(item: EquipmentItem, locale: Locale): string[] {
  return [
    item.equipped ? translate(locale, item.layered ? "worn beside another (GM's call)" : "worn") : null,
    item.attuned ? translate(locale, "attuned") : item.attuning ? translate(locale, "attunes at the next rest") : null,
    item.identified === false ? translate(locale, "unidentified") : null,
    item.charges !== undefined ? translatePlural(locale, "{count} charge", "{count} charges", { count: item.charges }) : null,
  ].filter((flag): flag is string => Boolean(flag));
}

export function leadSpellMeta(entry: { level?: number }, locale: Locale): string {
  return entry.level === 0 ? translate(locale, "cantrip", { context: "lead.edit.cantripMeta" }) : pickerMeta(entry, locale, "level {level}");
}
