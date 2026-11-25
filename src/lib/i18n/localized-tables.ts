// Display-only tables shared by every reader language. The store contains
// no data imports: the server installs catalogs at startup and the browser
// installs only the selected language's chunk.
import type { Locale } from "./translate.ts";
import type { ExpansionIndex } from "../content/expansion-identity.ts";

// Small, locale-specific formatting rules for the English trait shorthand.
export type TraitTextRules = {
  poisonAdvantage: string;
  feet: string;
  lightMediumArmor: string;
  hpPerLevel?: string;
  weaponNames?: Readonly<Record<string, string>>;
  localizeNotedHead?: boolean;
};

export type LocalizedTables = {
  traitText?: TraitTextRules;
  workshopGuides?: Record<string, Partial<{ title: string; purpose: string; steps: string[]; atTable: string; tips: string[] }>>;
  names: Record<string, Record<string, string>>;
  translated?: Record<string, Record<string, string>>;
  resources?: Record<string, { name: string; guidance: string }>;
  guidance?: Record<string, string>;
  expansionNames?: ExpansionIndex<{ englishName: string; name: string }>;
};

const STORE = "__odmLocalizedTables";
type Registry = Partial<Record<Locale, LocalizedTables>>;
function registry(): Registry {
  const holder = globalThis as typeof globalThis & { [STORE]?: Registry };
  return holder[STORE] ??= {};
}

export function installLocalizedTables(locale: Exclude<Locale, "en">, tables: LocalizedTables): void {
  registry()[locale] = tables;
}

export function localizedTables(locale: Locale): LocalizedTables | null {
  return locale === "en" ? null : registry()[locale] ?? null;
}
