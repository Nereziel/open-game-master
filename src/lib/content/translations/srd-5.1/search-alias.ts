// Add an exact Czech SRD search alias without replacing user-authored or
// other-book results. This helper never alters the original row data.
import { textKey } from "@/lib/language/text-logic";
import { translationSourceId, type SourceRecord } from "../registry";

type SearchRow = SourceRecord & Readonly<{ slug: string; name: string }>;

export function appendExactSrdAlias<T extends SearchRow>(
  original: readonly T[],
  candidates: readonly T[],
  canonicalEnglishName: string,
): T[] {
  const wanted = textKey(canonicalEnglishName);
  const seen = new Set(original.map((row) => JSON.stringify([
    row.source, row.documentSlug ?? "", row.slug,
  ])));
  const out = [...original];
  for (const row of candidates) {
    if (translationSourceId(row) !== "srd-5.1" || textKey(row.name) !== wanted) continue;
    const key = JSON.stringify([row.source, row.documentSlug ?? "", row.slug]);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}
