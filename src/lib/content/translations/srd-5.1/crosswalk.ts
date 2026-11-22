// Resolve a content catalog row to the *canonical bundled SRD page ID*.
// Only trusted SRD provenance is eligible; never infer a source from the name.
import type { RulebookPage } from "../../../rulebook/types";
import { PAGE_CATALOG_NAMES } from "../../../rulebook/catalog-rows";
import { translationSourceId, type ContentType, type SourceRecord } from "../registry";

export type SrdCatalogRecord = SourceRecord & Readonly<{
  kind: "spells" | "items" | "monsters" | "classes" | "races";
  slug: string;
  name: string;
  rulebook?: string;
}>;

const CATALOG_KIND: Record<SrdCatalogRecord["kind"], RulebookPage["kind"]> = {
  spells: "spell", items: "item", monsters: "monster", classes: "class", races: "race",
};

// Caller supplies the EN rulebook pages (not localized page titles).
// Alias mapping is restricted to explicit, existing catalog exceptions.
export function srdPageIdForCatalogRecord(
  record: SrdCatalogRecord,
  englishPages: readonly RulebookPage[],
): string | null {
  if (translationSourceId(record) !== "srd-5.1") return null;
  const kind = CATALOG_KIND[record.kind];
  const pages = englishPages.filter((page) => page.kind === kind);
  const byId = new Map(pages.map((page) => [page.id, page]));
  // Bundled rows preserve the actual page ID, e.g. srd:acid-arrow.
  const explicitId = record.rulebook ?? (record.slug.startsWith("srd:") ? record.slug.slice(4) : "");
  if (explicitId) {
    const page = byId.get(explicitId);
    if (!page) return null;
    // A stale/wrong rulebook pointer must not silently overwrite another item.
    if (record.source === "open5e" && record.rulebook && !matchesCatalogTitle(page, record.name)) return null;
    return page.id;
  }

  // Open5e rows have their own slugs. Use exact English titles only, scoped
  // to SRD + content kind, or a vetted catalog alias from the bundled book.
  const match = pages.filter((page) => matchesCatalogTitle(page, record.name));
  return match.length === 1 ? match[0].id : null;
}

function matchesCatalogTitle(page: RulebookPage, englishName: string): boolean {
  const wanted = englishName.trim().toLocaleLowerCase("en");
  return page.title.trim().toLocaleLowerCase("en") === wanted
    || PAGE_CATALOG_NAMES[page.id]?.trim().toLocaleLowerCase("en") === wanted;
}
