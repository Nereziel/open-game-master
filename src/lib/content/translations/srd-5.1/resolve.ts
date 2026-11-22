// Opt-in bridge for future UI consumers. It never changes saved content rows.
// An absent, ambiguous or mismatched SRD mapping leaves the English row alone.
import type { RulebookPage } from "../../../rulebook/types";
import { TranslationRegistry, type TranslationEntry } from "../registry";
import { srdPageIdForCatalogRecord, type SrdCatalogRecord } from "./crosswalk";

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
  return { pageId, translated: result.status === "translated", display: result.entry };
}
