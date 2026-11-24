import { contentName } from "@/lib/content/names";
import { textKey } from "@/lib/language/text-logic";
import { canonicalLocalizedItemName, magicItemBonus, withoutBonus } from "@/lib/srd/item-row";
import type { Locale } from "@/lib/i18n/translate";

// Names are presentation only. An explicitly renamed line or workshop row
// keeps its own label; a historical name-only line has no publication identity.
export function itemDisplayName(item: { name: string; srdName?: string; slug?: string | null; gear?: unknown }, locale: Locale, allowNameFallback = true): string {
  if (locale === "en" || item.slug?.startsWith("homebrew:") || item.gear) return item.name;
  const bare = withoutBonus(item.name);
  const canonical = canonicalLocalizedItemName(bare);
  if (item.srdName && textKey(item.srdName) !== textKey(canonical)) return item.name;
  if (!item.srdName && !item.slug?.startsWith("srd") && !allowNameFallback) return item.name;
  const shown = contentName("items", { name: item.srdName ?? canonical, ...(item.slug ? { slug: item.slug } : {}) }, locale);
  if (shown === (item.srdName ?? canonical)) return item.name;
  const bonus = magicItemBonus(item.name);
  return bonus && bare !== item.name ? `${shown} +${bonus}` : shown;
}
