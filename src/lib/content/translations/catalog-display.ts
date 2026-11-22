// Server-side, display-only bridge for the catalog API.
// The content row remains canonical English and keeps its own source/slug.
import { rulebookPages } from "@/lib/rulebook/book";
import { TranslationRegistry, translationSourceId } from "./registry";
import { srdTranslationPack } from "./srd-5.1/adapter";
import { resolveSrdCatalogTranslation } from "./srd-5.1/resolve";
import type { SrdCatalogRecord } from "./srd-5.1/crosswalk";

export type CatalogDisplay = Readonly<{
  name: string;
  description?: string;
  school?: string;
  rarity?: string;
  category?: string;
  meta?: string;
}>;

type CatalogRow = Readonly<{
  name: string;
  slug: string;
  source: "srd" | "open5e" | "bundled" | "homebrew";
  documentSlug?: string;
  rulebook?: string;
  school?: string;
  rarity?: string;
  category?: string;
  kind?: string;
  data?: Record<string, unknown>;
}>;

const SUPPORTED = new Set(["spells", "items", "monsters", "races", "classes"]);
let registry: TranslationRegistry | null = null;

function srdRegistry(): TranslationRegistry {
  if (!registry) {
    const instance = new TranslationRegistry();
    instance.register(srdTranslationPack(rulebookPages("en"), rulebookPages("cs")).pack);
    registry = instance;
  }
  return registry;
}

// Use only this separate field in UI; never replace row.name/row.data or
// numeric mechanics (price, spell level, attack bonus, item effect etc).
export function withCatalogDisplay<T extends CatalogRow>(
  kind: string,
  row: T,
  locale: "cs" | "en" | "fr",
): T & { display?: CatalogDisplay } {
  if (locale !== "cs" || !SUPPORTED.has(kind) || translationSourceId(row) !== "srd-5.1") return row;
  const sourceRow: SrdCatalogRecord = {
    kind: kind as SrdCatalogRecord["kind"],
    source: row.source,
    documentSlug: row.documentSlug,
    slug: row.slug,
    name: row.name,
    rulebook: row.rulebook,
  };
  const original = {
    name: row.name,
    metadata: {
      ...(row.school ? { school: row.school } : {}),
      ...(row.rarity ? { rarity: row.rarity } : {}),
      ...(row.category ? { category: row.category } : {}),
    },
  };
  const resolved = resolveSrdCatalogTranslation(
    srdRegistry(), sourceRow, rulebookPages("en"), original, locale,
  );
  if (!resolved.pageId) return row;
  const metadata = resolved.display.metadata;
  const display: CatalogDisplay = {
    name: resolved.display.name ?? row.name,
    ...(resolved.display.description ? { description: resolved.display.description } : {}),
    ...(metadata?.school ? { school: metadata.school } : {}),
    ...(metadata?.rarity ? { rarity: metadata.rarity } : {}),
    ...(metadata?.category ? { category: metadata.category } : {}),
    ...(metadata?.meta ? { meta: metadata.meta } : {}),
  };
  return { ...row, display };
}
