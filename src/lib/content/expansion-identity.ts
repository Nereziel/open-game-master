// Shared source identity for localized names and descriptions. No language
// data imports: the name reader must stay small in the browser.
export type ExpansionRow = { slug?: string; name?: string; source?: string; documentSlug?: string };
export type ExpansionIndex<T> = Record<string, Record<string, Record<string, T>>>;

export function expansionTranslation<T extends { englishName: string }>(books: ExpansionIndex<T> | undefined, table: string, row: ExpansionRow): T | undefined {
  if (!books || !row || row.source !== "open5e" || !row.documentSlug || !row.slug) return undefined;
  const book = Object.hasOwn(books, row.documentSlug) ? books[row.documentSlug] : undefined;
  const kind = table === "races" ? "species" : table === "archetypes" ? "subclasses" : table;
  const entries = book && Object.hasOwn(book, kind) ? book[kind] : undefined;
  const hit = entries && Object.hasOwn(entries, row.slug) ? entries[row.slug] : undefined;
  return hit?.englishName === row.name ? hit : undefined;
}
