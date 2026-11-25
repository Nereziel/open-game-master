import { contentName } from "@/lib/content/names";
import { textKey } from "@/lib/language/text-logic";
import { canonicalLocalizedItemName, magicItemBonus, rowName, withoutBonus } from "@/lib/srd/item-row";
import type { Locale } from "@/lib/i18n/translate";

// Names are presentation only. An explicitly renamed line or workshop row
// keeps its own label; a historical name-only line has no publication identity.
export function itemDisplayName(item: { name: string; srdName?: string; slug?: string | null; gear?: unknown; identified?: boolean; source?: string; documentSlug?: string }, locale: Locale, allowNameFallback = true): string {
  if (locale === "en" || item.slug?.startsWith("homebrew:") || item.gear || item.identified === false || item.source === "homebrew") return item.name;
  if (!item.srdName && !item.slug?.startsWith("srd:") && !item.slug?.startsWith("srd-gear:") && !item.documentSlug && !allowNameFallback) return item.name;
  const bare = withoutBonus(item.name);
  const canonical = rowName(item);
  if (item.srdName && textKey(canonical) !== textKey(canonicalLocalizedItemName(bare))) return item.name;
  const shown = contentName("items", { name: canonical, ...(item.slug ? { slug: item.slug } : {}), source: item.source, documentSlug: item.documentSlug }, locale);
  if (shown === canonical) return item.name;
  const bonus = magicItemBonus(item.name);
  return bonus && bare !== item.name ? `${shown} +${bonus}` : shown;
}
