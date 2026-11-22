// Durable identity for a catalog selection, independent of translated labels.
// Existing sheets need no reference and retain their old English name fields.
import { z } from "zod";
import { translationSourceId, type SourceRecord, type ContentType } from "./registry";

export const storedContentReferenceSchema = z.object({
  sourceId: z.string().trim().min(1).max(100),
  contentType: z.enum([
    "rules", "classes", "species", "spells", "monsters", "items", "feats",
    "backgrounds", "subclasses", "features", "conditions",
  ]),
  // The catalog slug is an immutable *catalog* identifier, not a localized
  // title or necessarily the same as the rulebook page ID.
  contentId: z.string().trim().min(1).max(200),
  documentSlug: z.string().trim().max(100).optional(),
});
export type StoredContentReference = z.infer<typeof storedContentReferenceSchema>;

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
