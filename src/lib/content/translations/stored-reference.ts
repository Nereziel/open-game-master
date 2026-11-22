// Durable identity for a catalog selection, independent of translated labels.
// Existing sheets need no reference and retain their old English name fields.
import { translationSourceId, type SourceRecord, type ContentType } from "./registry";

// Keep this file framework-free: catalog pickers can derive a reference
// without bundling the server's Zod sheet validation into the browser.
export type StoredContentReference = Readonly<{
  sourceId: string;
  contentType: ContentType;
  // Original catalog slug, not translated name or necessarily rulebook ID.
  contentId: string;
  documentSlug?: string;
}>;

export function storedReferenceForCatalogRow(
  kind: ContentType,
  row: SourceRecord & { slug: string },
): StoredContentReference | null {
  const sourceId = row.source === "homebrew" ? "homebrew" : translationSourceId(row);
  const contentId = row.slug.trim();
  if (!sourceId || !contentId) return null;
  return {
    sourceId,
    contentType: kind,
    contentId,
    ...(row.documentSlug ? { documentSlug: row.documentSlug } : {}),
  };
}

export function sameStoredContentReference(
  a: StoredContentReference | undefined,
  b: StoredContentReference | undefined,
): boolean {
  return Boolean(a && b && a.sourceId === b.sourceId
    && a.contentType === b.contentType && a.contentId === b.contentId
    && (a.documentSlug ?? "") === (b.documentSlug ?? ""));
}
