// Source-scoped Czech title lookup for Open5e supplemental books.
// Names may suggest candidates, but only the actual catalog's documentSlug +
// canonical slug can select a result. The engine keeps English identifiers.
import { searchKey } from "@/lib/language/text-logic";
import type { TranslationRegistry } from "../registry";
import type { SupplementCatalogRow, SupplementKind } from "./build-pack";
import { supplementCzechDisplay } from "./display";

export type SupplementSearchCandidate = Readonly<{
  kind: SupplementKind;
  name: string;
  slug: string;
  documentSlug: string;
}>;

export function czechSupplementCandidates(
  registry: TranslationRegistry,
  rows: readonly SupplementCatalogRow[],
  kind: string,
  query: string,
  maxResults = 12,
): SupplementSearchCandidate[] {
  if (kind !== "items" && kind !== "spells" && kind !== "feats") return [];
  const wanted = searchKey(query);
  if (wanted.length < 2 || !Number.isFinite(maxResults) || maxResults <= 0) return [];
  const found: Array<{ candidate: SupplementSearchCandidate; score: number }> = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (row.kind !== kind || row.source !== "open5e") continue;
    const localized = supplementCzechDisplay(registry, kind, row);
    if (!localized) continue;
    const title = searchKey(localized.name);
    const index = title.indexOf(wanted);
    if (index < 0) continue;
    const key = JSON.stringify([row.kind, row.documentSlug, row.slug]);
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({
      candidate: { kind: row.kind, name: row.name, slug: row.slug, documentSlug: row.documentSlug },
      score: title === wanted ? 0 : index === 0 ? 1 : 2,
    });
  }
  found.sort((a, b) => a.score - b.score
    || a.candidate.name.localeCompare(b.candidate.name)
    || a.candidate.documentSlug.localeCompare(b.candidate.documentSlug));
  return found.slice(0, Math.min(Math.floor(maxResults), 30)).map(({ candidate }) => candidate);
}

export type IdentifiedContentRow = {
  source?: string;
  slug: string;
  documentSlug?: string;
};

export function matchesSupplementCandidate(
  row: IdentifiedContentRow,
  candidate: SupplementSearchCandidate,
): boolean {
  return row.source === "open5e"
    && row.slug === candidate.slug
    && row.documentSlug === candidate.documentSlug;
}

// Stable dedupe and bounded output; don't collapse two different books using
// the same English name or slug. English searches and homebrew remain first.
export function combineSupplementSearchResults<T extends IdentifiedContentRow>(
  original: readonly T[],
  supplemental: readonly T[],
  limit: number,
): T[] {
  const out: T[] = [];
  const seen = new Set<string>();
  for (const entry of [...original, ...supplemental]) {
    const key = JSON.stringify([entry.source ?? "", entry.documentSlug ?? "", entry.slug]);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(entry);
    if (out.length >= Math.max(1, Math.min(200, Math.floor(limit)))) break;
  }
  return out;
}
