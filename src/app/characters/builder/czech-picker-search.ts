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
  const queries: string[] = [];
  const seen = new Set<string>();
  // Entries from additional licensed books are searched by their actual
  // English names; API results are checked against their document-bound
  // Czech display labels before they reach the UI.
  for (const english of thirdPartyCzechPickerQueries(kind, search, limit)) {
    const key = searchKey(english);
    if (!seen.has(key)) {
      seen.add(key);
      queries.push(english);
    }
    if (queries.length >= limit) return queries;
  }
  for (const table of TABLES[kind] ?? []) {
    for (const [id, translated] of Object.entries(names[table] ?? {})) {
      if (!searchKey(translated).includes(needle)) continue;
      const query = table === "weapons" && ENGLISH_SEARCH_ALIASES[id]
        ? ENGLISH_SEARCH_ALIASES[id]
        : id.replace(/[-_]/g, " ");
      const key = searchKey(query);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      queries.push(query);
      if (queries.length >= limit) return queries;
    }
  }
  return queries;
}
