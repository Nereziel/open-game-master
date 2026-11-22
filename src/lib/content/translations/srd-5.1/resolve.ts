// Opt-in bridge for future UI consumers. It never changes saved content rows.
// An absent, ambiguous or mismatched SRD mapping leaves the English row alone.
import type { RulebookPage } from "../../../rulebook/types";
import { TranslationRegistry, type TranslationEntry } from "../registry";
import { srdPageIdForCatalogRecord, type SrdCatalogRecord } from "./crosswalk";
import { srdStructuredMetadataCs } from "./structured-metadata";

export type SrdCatalogTranslation = Readonly<{
  pageId: string | null;
  translated: boolean;
  display: TranslationEntry;
}>;

export function resolveSrdCatalogTranslation(
  registry: TranslationRegistry,
  row: SrdCatalogRecord,
  englishPages: readonly RulebookPage[],
  original: TranslationEntry,
  locale: "en" | "cs" | "fr",
): SrdCatalogTranslation {
  if (locale !== "cs") {
    return { pageId: null, translated: false, display: original };
  }
  const pageId = srdPageIdForCatalogRecord(row, englishPages);
  if (!pageId) return { pageId: null, translated: false, display: original };
  const result = registry.resolve({
    sourceId: "srd-5.1",
    contentType: row.kind === "races" ? "species" : row.kind,
    contentId: pageId,
    locale,
  }, original);
  const display = result.entry;
  // Translate the catalog's *separate display fields* too, not just the
  // rulebook subtitle. The canonical source record is never changed.
  if ((row.kind === "spells" || row.kind === "items") && display.metadata) {
    return {
      pageId,
      translated: result.status === "translated",
      display: {
        ...display,
        metadata: srdStructuredMetadataCs(
          { source: row.source, documentSlug: row.documentSlug, kind: row.kind },
          display.metadata,
          locale,
        ),
      },
    };
  }
  return { pageId, translated: result.status === "translated", display };
}
