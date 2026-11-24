// Display-only tables shared by every reader language. The store contains
// no data imports: the server installs catalogs at startup and the browser
// installs only the selected language's chunk.
import type { Locale } from "./translate.ts";
import type { ExpansionIndex } from "../content/expansion-identity.ts";

export type LocalizedTables = {
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
