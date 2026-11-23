// Server-only adapter for the read-only Open5e catalog. Builds complete
// book-scoped indexes once per DB handle, not from a paginated picker result:
// otherwise duplicate English names on another page would be mislocalized.
import { getContentDb } from "@/lib/content/db";
import { TranslationRegistry } from "@/lib/content/translations/registry";
import { supplementCzechRegistry } from "./index";
import { supplementCzechDisplay } from "./display";
import type { SupplementCatalogRow } from "./build-pack";
import { czechSupplementCandidates, type SupplementSearchCandidate } from "./search";

const cache = new WeakMap<object, TranslationRegistry | null>();
const catalogRows = new WeakMap<object, readonly SupplementCatalogRow[]>();
const DOCUMENTS = ["toh", "dmag", "deepm", "vom"] as const;
const DOCUMENT_SQL = DOCUMENTS.map(() => "?").join(", ");

function registryFromCatalog(): TranslationRegistry | null {
  const db = getContentDb();
  if (!db) return null;
  if (cache.has(db)) return cache.get(db) ?? null;
  try {
    const rows: SupplementCatalogRow[] = [];
    for (const kind of ["items", "spells", "feats"] as const) {
      const matches = db.prepare(`SELECT slug, name, document_slug FROM ${kind} WHERE document_slug IN (${DOCUMENT_SQL})`)
        .all(...DOCUMENTS) as Array<{ slug: string; name: string; document_slug: string }>;
      for (const entry of matches) {
        rows.push({ source: "open5e", kind, slug: entry.slug, name: entry.name, documentSlug: entry.document_slug });
      }
    }
    const { registry } = supplementCzechRegistry(rows);
    cache.set(db, registry);
    catalogRows.set(db, rows);
    return registry;
  } catch (error) {
    // An outdated or malformed pack must not break catalog routes, and
    // certainly must not guess a translation from a differently named row.
    console.warn("[i18n] Supplemental catalog registration failed; keeping English source text", error);
    cache.set(db, null);
    return null;
  }
}

type CatalogDisplayRow = {
  source?: string;
  documentSlug?: string;
  slug?: string;
  name?: string;
};

export function withSupplementCzechDisplay<T>(kind: string, value: T, includeFullRules = false): T {
  const row = value as T & CatalogDisplayRow;
  if (!row || row.source !== "open5e" || !row.name || !row.slug || !row.documentSlug) return value;
  const registry = registryFromCatalog();
  if (!registry) return value;
  const localizedCs = supplementCzechDisplay(registry, kind, {
    source: "open5e",
    documentSlug: row.documentSlug,
    slug: row.slug,
    name: row.name,
  }, includeFullRules);
  return localizedCs ? { ...row, localizedCs } : value;
}

// The complete read-only catalog, not the current search page, is the
// authority for Czech aliases. No row is offered to the player here;
// callers must run regular source-aware game searches with their filters.
export function supplementCzechSearchCandidates(
  kind: string,
  query: string,
  limit = 12,
): readonly SupplementSearchCandidate[] {
  const db = getContentDb();
  if (!db) return [];
  const registry = registryFromCatalog();
  const rows = catalogRows.get(db);
  return registry && rows
    ? czechSupplementCandidates(registry, rows, kind, query, limit)
    : [];
}
