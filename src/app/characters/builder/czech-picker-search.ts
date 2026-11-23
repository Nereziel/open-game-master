import { searchKey } from "@/lib/language/text-logic";
import { contentName } from "@/lib/content/names";
import { thirdPartyCzechPickerQueries } from "@/lib/content/third-party-names-cs";

// The server searches canonical English IDs. Only known official Czech
// display names are mapped back to those IDs; no stored name is rewritten.
// Unknown pack/homebrew rows continue to use the server's ordinary search.
const TABLES: Record<string, readonly string[]> = {
  items: ["gear", "weapons", "armor", "magicitems"],
  spells: ["spells"],
  feats: ["feats"],
};
// Open5e stores crossbow slugs in noun-first order, unlike their actual
// English names. Search the API by the name, not by that slug.
const ENGLISH_SEARCH_ALIASES: Readonly<Record<string, string>> = {
  "crossbow-light": "light crossbow",
  "crossbow-hand": "hand crossbow",
  "crossbow-heavy": "heavy crossbow",
};

export function appendCzechPickerMatches<T extends { name: string; source?: string; slug?: string }>(
  kind: string,
  search: string,
  original: readonly T[],
  localized: readonly T[],
): T[] {
  if (kind !== "items" && kind !== "spells" && kind !== "feats") return [...original];
  const needle = searchKey(search.trim());
  if (!needle) return [...original];
  // The English API may return incidental matches, but those must not hide
  // Czech matches. Conversely, do not append unrelated rows (or homebrew
  // names that happen to share the English search terms).
  return [
    ...original,
    ...localized.filter((entry) =>
      entry.source !== "homebrew" && searchKey(contentName(kind, entry, "cs")).includes(needle)),
  ];
}

export function czechPickerQueries(
  kind: string,
  search: string,
  names: Record<string, Record<string, string>>,
  limit = 6,
): string[] {
  const needle = searchKey(search.trim());
  if (needle.length < 2) return [];
  const primary: string[] = [];
  const seen = new Set<string>();
  // Collect canonical SRD matches first, so a broad Czech term still finds
  // the core book instead of being crowded out by additional supplements.
  for (const table of TABLES[kind] ?? []) {
    for (const [id, translated] of Object.entries(names[table] ?? {})) {
      if (!searchKey(translated).includes(needle)) continue;
      const query = table === "weapons" && ENGLISH_SEARCH_ALIASES[id]
        ? ENGLISH_SEARCH_ALIASES[id]
        : id.replace(/[-_]/g, " ");
      const key = searchKey(query);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      primary.push(query);
      if (primary.length >= limit) break;
    }
    if (primary.length >= limit) break;
  }
  // Reserve some slots for known licensed books, while retaining SRD
  // results. The source-document check happens again on returned rows.
  const supplemental = thirdPartyCzechPickerQueries(kind, search, limit)
    .filter((english) => !seen.has(searchKey(english)));
  const coreLimit = supplemental.length ? Math.max(0, limit - Math.min(2, supplemental.length)) : limit;
  return [...primary.slice(0, coreLimit), ...supplemental].slice(0, limit);
}
