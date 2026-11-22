// Source-scoped display localization. Neither stored IDs nor rules mechanics are rewritten.
// Deliberately independent of UI, rulebook and engine modules so both client and server can use it.
export type TranslationLocale = "cs" | "en" | "fr";
export type ContentType =
  | "rules" | "classes" | "species" | "spells" | "monsters" | "items"
  | "feats" | "backgrounds" | "subclasses" | "features" | "conditions";
export type TranslationKey = Readonly<{
  sourceId: string;
  contentType: ContentType;
  contentId: string;
  locale: TranslationLocale;
}>;
export type TranslationEntry = Readonly<{
  name?: string;
  description?: string;
  metadata?: Readonly<Record<string, string>>;
}>;
export type TranslationPack = Readonly<{
  sourceId: string;
  locale: Exclude<TranslationLocale, "en">;
  entries: Readonly<Partial<Record<ContentType, Readonly<Record<string, TranslationEntry>>>>>;
}>;
export type SourceRecord = Readonly<{
  source: "open5e" | "homebrew" | "srd" | "bundled";
  documentSlug?: string;
}>;
export type TranslationFallback = "translated" | "original";
export type TranslationResolution = Readonly<{
  entry: TranslationEntry;
  status: TranslationFallback;
  key: TranslationKey;
}>;

// Aliases identify editions/books, not individual entries. The original
// record still carries its canonical English ID throughout the app.
export function translationSourceId(record: SourceRecord): string | null {
  if (record.source === "homebrew") return null; // User-authored content is never silently translated.
  if (record.source === "srd" || record.source === "bundled") return "srd-5.1";
  if (record.source !== "open5e") return null;
  switch (record.documentSlug) {
    case "wotc-srd": return "srd-5.1";
    case "toh": return "tome-of-heroes";
    case "dmag":
    case "deepm": return "deep-magic";
    case "vom": return "vault-of-magic";
    default: return record.documentSlug || null;
  }
}

function exactKey(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`Translation ${label} must not be empty`);
  return trimmed;
}
function token(sourceId: string, locale: string): string {
  return JSON.stringify([sourceId, locale]);
}

export class TranslationRegistry {
  private readonly packs = new Map<string, TranslationPack>();
  private readonly missing = new Map<string, TranslationKey>();

  register(pack: TranslationPack): void {
    const sourceId = exactKey(pack.sourceId, "sourceId");
    if (pack.locale === "en") throw new Error("English is the canonical content, not a translation pack");
    const key = token(sourceId, pack.locale);
    if (this.packs.has(key)) throw new Error(`Duplicate translation pack: ${key}`);
    const seen = new Set<string>();
    for (const [type, entries] of Object.entries(pack.entries)) {
      for (const [id, entry] of Object.entries(entries ?? {})) {
        const contentId = exactKey(id, "contentId");
        const itemKey = JSON.stringify([type, contentId]);
        if (seen.has(itemKey)) throw new Error(`Duplicate translation entry: ${itemKey}`);
        seen.add(itemKey);
        if (!entry.name && !entry.description && !entry.metadata) {
          throw new Error(`Empty translation entry: ${itemKey}`);
        }
      }
    }
    this.packs.set(key, pack);
  }

  resolve(key: TranslationKey, original: TranslationEntry): TranslationResolution {
    const sourceId = exactKey(key.sourceId, "sourceId");
    const contentId = exactKey(key.contentId, "contentId");
    const normalized = { ...key, sourceId, contentId };
    const localized = key.locale === "en"
      ? undefined
      : this.packs.get(token(sourceId, key.locale))?.entries[key.contentType]?.[contentId];
    if (!localized) {
      if (key.locale !== "en") this.missing.set(JSON.stringify([sourceId, key.contentType, contentId, key.locale]), normalized);
      return { key: normalized, entry: original, status: "original" };
    }
    // Field-level fallback uses only the English original of THIS entry.
    return {
      key: normalized,
      status: "translated",
      entry: {
        name: localized.name ?? original.name,
        description: localized.description ?? original.description,
        metadata: { ...original.metadata, ...localized.metadata },
      },
    };
  }

  missingTranslations(): readonly TranslationKey[] {
    return [...this.missing.values()];
  }

  clearDiagnostics(): void {
    this.missing.clear();
  }
}
