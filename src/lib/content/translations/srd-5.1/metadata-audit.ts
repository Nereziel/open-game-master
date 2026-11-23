// Narrow mechanical regression audit. This checks numbers and dice in
// metadata, not prose quality; reviewers still need to compare the full text.
import type { RulebookPage } from "../../../rulebook/types";

export type SrdMetadataFinding = Readonly<{
  id: string;
  kind: RulebookPage["kind"];
  field: "meta" | "title";
  english: string;
  czech: string;
  englishTokens: readonly string[];
  czechTokens: readonly string[];
}>;

function mechanicalTokens(value: string): string[] {
  // Keep dice and fractional CR together, and sort tokens so translated
  // word order does not create false positives. Preserve duplicates.
  return (value.match(/\d+d\d+|\d+\/\d+|[+-]\d+|\d+/gi) ?? [])
    .map((s) => s.toLowerCase())
    .sort();
}

function comparableTitle(page: RulebookPage): boolean {
  // Item bonuses are mechanics in the name; levels in subtitles are handled
  // separately. Other titles can contain ordinal identifiers or prose.
  return page.kind === "item";
}

export function auditSrdLocalizedMetadata(
  english: readonly RulebookPage[],
  localized: readonly RulebookPage[],
): SrdMetadataFinding[] {
  const byId = new Map(localized.map((page) => [page.id, page]));
  const issues: SrdMetadataFinding[] = [];
  for (const source of english) {
    const translated = byId.get(source.id);
    if (!translated || translated.kind !== source.kind) continue;
    const fields: ("meta" | "title")[] = ["meta"];
    if (comparableTitle(source)) fields.push("title");
    for (const field of fields) {
      const originalValue = source[field] ?? "";
      const localizedValue = translated[field] ?? "";
      if (!originalValue || !localizedValue) continue;
      const englishTokens = mechanicalTokens(originalValue);
      const czechTokens = mechanicalTokens(localizedValue);
      if (JSON.stringify(englishTokens) !== JSON.stringify(czechTokens)) {
        issues.push({
          id: source.id, kind: source.kind, field,
          english: originalValue, czech: localizedValue,
          englishTokens, czechTokens,
        });
      }
    }
  }
  return issues;
}
