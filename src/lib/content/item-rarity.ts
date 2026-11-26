import { translate, type Locale, type TranslateVars } from "@/lib/i18n/translate";

// The importer stores rarity lower-case, but the book may capitalize it.
// Only known rarity labels and reviewed compound labels are normalized;
// unknown workshop text is not parsed or partially translated.
const RARITIES = new Set(["mundane", "common", "uncommon", "rare", "very rare", "legendary", "artifact"]);
const COMPOUND_RARITIES = new Set([
  "uncommon (+1), rare (+2), or very rare (+3)",
  "rare (+1), very rare (+2), or legendary (+3)",
  "very rare or legendary",
  "rare (silver or brass), very rare (bronze), or legendary (iron)",
]);
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
type T = (key: string, vars?: TranslateVars) => string;

export function itemRarityLabel(raw: string, locale: Locale, title = false, t: T = (key, vars) => translate(locale, key, vars)): string {
  const lower = raw.trim().toLowerCase();
  if (locale === "cs") {
    if (RARITIES.has(lower)) {
      const label = t(lower, { context: "content.rarity" });
      return title ? capitalize(label) : label;
    }
    if (COMPOUND_RARITIES.has(lower)) {
      const label = t(capitalize(lower));
      return title ? label : label.charAt(0).toLowerCase() + label.slice(1);
    }
  }
  // Preserve the previous English/French card and picker conventions.
  return title ? t(capitalize(lower)) : t(raw, { context: "content.rarity" });
}
