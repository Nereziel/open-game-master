// Presentation contract for source-scoped supplemental Open5e translations.
// Do not rewrite row.name, slug, data, mechanics, or stored character entries.
import { translationSourceId, type TranslationRegistry } from "../registry";
import type { SupplementCatalogRow, SupplementKind } from "./build-pack";

export type SupplementCzechDisplay = Readonly<{
  name: string;
  summary?: string;
  fullRules?: string;
  hasFullRules: boolean;
}>;

export type DisplayableSupplementRow = Pick<SupplementCatalogRow, "source" | "documentSlug" | "slug" | "name">;

export function supplementCzechDisplay(
  registry: TranslationRegistry,
  kind: string,
  row: DisplayableSupplementRow,
  includeFullRules = false,
): SupplementCzechDisplay | null {
  if (kind !== "items" && kind !== "spells" && kind !== "feats") return null;
  if (row.source !== "open5e" || !row.slug || !row.documentSlug) return null;
  const sourceId = translationSourceId(row);
  if (sourceId !== "tome-of-heroes" && sourceId !== "deep-magic" && sourceId !== "vault-of-magic") return null;
  const resolved = registry.resolve({
    sourceId, contentType: kind as SupplementKind, contentId: row.slug, locale: "cs",
  }, { name: row.name });
  if (resolved.status !== "translated") return null;
  const summary = resolved.entry.metadata?.summaryCs;
  const fullRules = resolved.entry.description;
  return {
    name: resolved.entry.name ?? row.name,
    ...(summary ? { summary } : {}),
    ...(includeFullRules && fullRules ? { fullRules } : {}),
    hasFullRules: Boolean(fullRules),
  };
}

// The full English rules must remain accessible when only an orientation
// summary exists. Never present a summary as a complete rule text.
export function supplementRulesForDisplay(
  localized: SupplementCzechDisplay | undefined,
  original: string | null,
  locale: string,
): string | null {
  if (locale !== "cs" || !localized) return original;
  if (localized.fullRules) return localized.fullRules;
  if (!localized.summary) return original;
  return `**Stručný český přehled (nejde o úplná pravidla):**\n\n${localized.summary}${original ? `\n\n**Úplná pravidla (anglicky):**\n\n${original}` : ""}`;
}
