import data from "./expansion-descriptions-cs.json";
import authoredFeats from "./authored-feat-descriptions-cs.json";
import { expansionTranslation, type ExpansionRow, type ExpansionIndex } from "./expansion-identity";

// Display-only, source-separated translations. Original rule fields are
// retained for exact matching; a changed upstream text falls back to English.
type Translation = {
  englishName: string;
  name?: string;
  original?: Record<string, unknown>;
  description?: string;
  metadataDescription?: string;
};
const reviewedBooks: ExpansionIndex<Translation> = data;
// The importer can prefix an authored feat slug when a pack already holds
// the unprefixed one. Both aliases still require the same document, English
// name and exact source rules below.
const authoredFeatAliases = Object.fromEntries(
  Object.entries(authoredFeats).flatMap(([slug, entry]) => [[slug, entry], [`odm-${slug}`, entry]]),
);
const books: ExpansionIndex<Translation> = {
  ...reviewedBooks,
  "odm-expanded": {
    ...reviewedBooks["odm-expanded"],
    feats: { ...reviewedBooks["odm-expanded"]?.feats, ...authoredFeatAliases },
  },
};

export function expansionDescriptionCs(table: string, row: ExpansionRow & { data?: Record<string, unknown> }): string | undefined {
  const hit = expansionTranslation(books, table, row);
  if (!hit || !(hit.description || hit.metadataDescription) || !hit.original || !row.data) return undefined;
  const source = row.data;
  // Exact text and metadata from the checked-in golden row, not an inferred
  // slug or a guessed rule. Other fields remain unmodified.
  if (!Object.entries(hit.original).every(([key, value]) =>
    JSON.stringify(source[key]) === JSON.stringify(value)
  )) return undefined;
  return hit.description ?? hit.metadataDescription;
}
