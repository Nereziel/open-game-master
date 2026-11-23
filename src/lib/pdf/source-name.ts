// PDF is a read-only presentation consumer. Never translate a positively
// identified non-SRD entry using an unrelated SRD same-name dictionary.
// Legacy records with no source reference keep the prior display behavior.
import { gameName, type GameTextKind } from "@/lib/i18n/game-text";
import type { Locale } from "@/lib/i18n/translate";
import type { StoredContentReference } from "@/lib/content/translations/stored-reference";

export function pdfReferencedName(
  kind: Extract<GameTextKind, "items" | "spells">,
  canonicalName: string,
  locale: Locale,
  reference?: StoredContentReference,
): string {
  if (reference && (reference.sourceId !== "srd-5.1" || reference.contentType !== kind)) {
    return canonicalName;
  }
  return gameName(kind, canonicalName, locale);
}
