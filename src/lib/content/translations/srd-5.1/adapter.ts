// Non-destructive adapter: the existing bundled SRD reader remains the
// source of complete original English and Czech companion pages.
// Do not import book.ts here: callers provide the books to avoid cycles.
import type { RulebookPage } from "../../../rulebook/types";
import type { ContentType, TranslationEntry, TranslationPack } from "../registry";

const TYPE: Record<RulebookPage["kind"], ContentType> = {
  rules: "rules",
  race: "species",
  class: "classes",
  spell: "spells",
  monster: "monsters",
  item: "items",
};

export type SrdTranslationCoverage = Readonly<{
  total: number;
  translated: Readonly<Partial<Record<ContentType, number>>>;
  missingIds: readonly string[];
}>;

export function srdTranslationPack(
  originals: readonly RulebookPage[],
  czech: readonly RulebookPage[],
): { pack: TranslationPack; coverage: SrdTranslationCoverage } {
  const englishById = new Map<string, RulebookPage>();
  for (const page of originals) {
    if (englishById.has(page.id)) throw new Error(`Duplicate English SRD page ID: ${page.id}`);
    englishById.set(page.id, page);
  }
  const localizedById = new Map<string, RulebookPage>();
  for (const page of czech) {
    if (localizedById.has(page.id)) throw new Error(`Duplicate Czech SRD page ID: ${page.id}`);
    if (!englishById.has(page.id)) throw new Error(`Unexpected Czech SRD page ID: ${page.id}`);
    localizedById.set(page.id, page);
  }

  const entries: Partial<Record<ContentType, Record<string, TranslationEntry>>> = {};
  const translated: Partial<Record<ContentType, number>> = {};
  const missingIds: string[] = [];

  for (const original of originals) {
    const localized = localizedById.get(original.id);
    if (!localized) {
      missingIds.push(original.id);
      continue;
    }
    if (localized.kind !== original.kind || localized.chapter !== original.chapter) {
      throw new Error(`Czech SRD page changed kind/chapter: ${original.id}`);
    }
    const kind = TYPE[original.kind];
    const name = localized.title !== original.title ? localized.title : undefined;
    const metadata = localized.meta !== original.meta && localized.meta
      ? { meta: localized.meta }
      : undefined;
    let description: string | undefined;
    if (localized.md !== original.md) {
      // The companion publishes its Czech part followed by the entire source
      // English markdown. Strip exactly that suffix, not the interior text.
      if (!localized.md.endsWith(original.md)) {
        throw new Error(`Czech SRD page does not preserve original English suffix: ${original.id}`);
      }
      description = localized.md.slice(0, -original.md.length)
        .replace(/\n*---\n+\*\*Úplné původní znění SRD 5\.1 v angličtině:\*\*\s*$/, "")
        .trim() || undefined;
    }
    if (!name && !description && !metadata) {
      missingIds.push(original.id);
      continue;
    }
    const category = (entries[kind] ??= {});
    category[original.id] = {
      ...(name ? { name } : {}),
      ...(description ? { description } : {}),
      ...(metadata ? { metadata } : {}),
    };
    translated[kind] = (translated[kind] ?? 0) + 1;
  }

  return {
    pack: { sourceId: "srd-5.1", locale: "cs", entries },
    coverage: { total: originals.length, translated, missingIds },
  };
}
