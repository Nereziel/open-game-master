// Collision diagnostics for source-isolated SRD and supplemental catalogs.
// This never collapses records based on an English or Czech display name.
import { textKey } from "@/lib/language/text-logic";
import { translationSourceId } from "../registry";

export type CollidableCatalogRow = Readonly<{
  source: "open5e" | "homebrew" | "srd" | "bundled";
  documentSlug?: string;
  kind: "items" | "spells" | "feats";
  slug: string;
  name: string;
}>;

export type CatalogCollision = Readonly<{
  kind: CollidableCatalogRow["kind"];
  name: string;
  identities: readonly string[];
}>;

export type CatalogCollisionAudit = Readonly<{
  crossBookNames: readonly CatalogCollision[];
  duplicateFeatsInBook: readonly CatalogCollision[];
  conflictingIds: readonly CatalogCollision[];
}>;

function identity(row: CollidableCatalogRow): string {
  return JSON.stringify([
    row.source, row.documentSlug ?? "", row.kind, row.slug,
  ]);
}
function book(row: CollidableCatalogRow): string {
  return translationSourceId(row) ?? "homebrew";
}
function issue(kind: CollidableCatalogRow["kind"], name: string, entries: readonly CollidableCatalogRow[]): CatalogCollision {
  return { kind, name, identities: [...new Set(entries.map(identity))].sort() };
}

export function auditCatalogCollisions(rows: readonly CollidableCatalogRow[]): CatalogCollisionAudit {
  const byName = new Map<string, CollidableCatalogRow[]>();
  const byId = new Map<string, CollidableCatalogRow[]>();
  for (const row of rows) {
    if (!row.slug.trim() || !row.name.trim()) continue;
    const title = JSON.stringify([row.kind, textKey(row.name)]);
    byName.set(title, [...(byName.get(title) ?? []), row]);
    // One translated source can use multiple document slugs (Deep Magic).
    // A duplicated canonical ID with different English titles is unsafe.
    const id = JSON.stringify([book(row), row.kind, row.slug]);
    byId.set(id, [...(byId.get(id) ?? []), row]);
  }
  const crossBookNames: CatalogCollision[] = [];
  const duplicateFeatsInBook: CatalogCollision[] = [];
  const conflictingIds: CatalogCollision[] = [];
  for (const entries of byName.values()) {
    const unique = [...new Map(entries.map(row => [identity(row), row])).values()];
    const differentBooks = new Set(unique.map(book));
    const [first] = unique;
    if (differentBooks.size > 1) {
      crossBookNames.push(issue(first.kind, first.name, unique));
    }
    if (first.kind === "feats") {
      const byBook = new Map<string, CollidableCatalogRow[]>();
      for (const row of unique) byBook.set(book(row), [...(byBook.get(book(row)) ?? []), row]);
      for (const perBook of byBook.values()) {
        if (new Set(perBook.map(row => row.slug)).size > 1) {
          duplicateFeatsInBook.push(issue("feats", first.name, perBook));
        }
      }
    }
  }
  for (const entries of byId.values()) {
    if (new Set(entries.map(row => textKey(row.name))).size > 1) {
      conflictingIds.push(issue(entries[0].kind, entries[0].name, entries));
    }
  }
  const sort = (a: CatalogCollision, b: CatalogCollision) =>
    a.kind.localeCompare(b.kind) || textKey(a.name).localeCompare(textKey(b.name));
  return {
    crossBookNames: crossBookNames.sort(sort),
    duplicateFeatsInBook: duplicateFeatsInBook.sort(sort),
    conflictingIds: conflictingIds.sort(sort),
  };
}
