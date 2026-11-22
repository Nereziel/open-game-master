// Content-pack rows can share a title across books, sometimes with
// different mechanics. Never resolve a document-scoped reference by title
// alone, especially when displaying localized rules.
import { textKey } from "@/lib/language/text-logic";

export type ScopedContentReference = {
  name?: string;
  slug: string;
  source?: string;
  documentSlug?: string;
};

export type ScopedContentEntry = {
  name: string;
  slug?: string;
  source?: string;
  documentSlug?: string;
};

export function sameContentDocument(
  reference: ScopedContentReference,
  entry: ScopedContentEntry | null | undefined,
): boolean {
  if (!entry) return false;
  if (reference.source === "homebrew") {
    return entry.source === "homebrew";
  }
  if (reference.source === "open5e") {
    return entry.source === "open5e"
      && (!!reference.documentSlug ? entry.documentSlug === reference.documentSlug : true);
  }
  if (reference.documentSlug) return entry.documentSlug === reference.documentSlug;
  return reference.source ? reference.source === entry.source : true;
}

export function contentRefMatches(
  reference: ScopedContentReference,
  entry: ScopedContentEntry | null | undefined,
): boolean {
  return sameContentDocument(reference, entry)
    && !!entry && (entry.slug === reference.slug
      || textKey(entry.name) === textKey(reference.name ?? reference.slug));
}
