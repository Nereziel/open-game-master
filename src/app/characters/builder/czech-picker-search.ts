import { searchKey } from "@/lib/language/text-logic";

// The server searches canonical English IDs. Only known official Czech
// display names are mapped back to those IDs; no stored name is rewritten.
// Unknown pack/homebrew rows continue to use the server's ordinary search.
const TABLES: Record<string, readonly string[]> = {
  items: ["gear", "weapons", "armor", "magicitems"],
  spells: ["spells"],
  feats: ["feats"],
};
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
  for (const table of TABLES[kind] ?? []) {
    for (const [id, translated] of Object.entries(names[table] ?? {})) {
      if (!searchKey(translated).includes(needle)) continue;
      const query = id.replace(/[-_]/g, " ");
      const key = searchKey(query);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      queries.push(query);
      if (queries.length >= limit) return queries;
    }
  }
  return queries;
}
