import type { Locale } from "@/lib/i18n/translate";

// Shared displayed ability abbreviations for character sheets and AC math.
// Internal ability IDs always remain str/dex/con/int/wis/cha.
const EN: Readonly<Record<string, string>> = {
  str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA",
};
const FR: Readonly<Record<string, string>> = { ...EN, str: "FOR", wis: "SAG" };
const CS: Readonly<Record<string, string>> = {
  str: "SÍL", dex: "OBR", con: "ODL", int: "INT", wis: "MDR", cha: "CHA",
};

export function abilityShortLabel(ability: string, locale: Locale): string {
  const key = ability.toLowerCase();
  const names = locale === "cs" ? CS : locale === "fr" ? FR : EN;
  return names[key] ?? ability.toUpperCase();
}
