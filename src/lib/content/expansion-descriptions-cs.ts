import data from "./expansion-descriptions-cs.json";

// Display-only, source-separated translations. Original rule fields are
// retained for exact matching; a changed upstream text falls back to English.
type Row = { slug?: string; name?: string; source?: string; documentSlug?: string };
type Translation = {
  englishName: string;
  name: string;
  original: Record<string, unknown>;
  description: string;
};
const books: Record<string, Record<string, Record<string, Translation>>> = data;

function translation(table: string, row: Row): Translation | undefined {
  if (row.source !== "open5e" || !row.documentSlug || !row.slug) return undefined;
  const book = Object.hasOwn(books, row.documentSlug) ? books[row.documentSlug] : undefined;
  const entries = book && Object.hasOwn(book, table) ? book[table] : undefined;
  const hit = entries && Object.hasOwn(entries, row.slug) ? entries[row.slug] : undefined;
  return hit?.englishName === row.name ? hit : undefined;
}

export function expansionNameCs(table: string, row: Row): string | undefined {
  return translation(table, row)?.name;
}

export function expansionDescriptionCs(table: string, row: Row & { data?: Record<string, unknown> }): string | undefined {
  const hit = translation(table, row);
  if (!hit || !row.data) return undefined;
  const source = row.data;
  // Exact text and metadata from the checked-in golden row, not an inferred
  // slug or a guessed rule. Other fields remain unmodified.
  if (!Object.entries(hit.original).every(([key, value]) =>
    JSON.stringify(source[key]) === JSON.stringify(value)
  )) return undefined;
  return hit.description;
}
