import { contentName, type NamedRow } from "@/lib/content/names";
import type { Locale } from "@/lib/i18n/translate";

// Display metadata only. Never used by the casting engine to resolve a spell.
export type MonsterSpellReference = {
  name: string;
  slug: string;
  source: "open5e" | "srd" | "bundled" | "homebrew";
  documentSlug: string;
};

export function monsterSpellReference(row: unknown, name: string): MonsterSpellReference | undefined {
  if (!row || typeof row !== "object") return undefined;
  const ref = row as Partial<MonsterSpellReference>;
  if (ref.name !== name || typeof ref.slug !== "string" || !ref.slug.trim() || ref.slug.length > 200 ||
      typeof ref.documentSlug !== "string" || !ref.documentSlug.trim() || ref.documentSlug.length > 120 ||
      (ref.source !== "open5e" && ref.source !== "srd" && ref.source !== "bundled" && ref.source !== "homebrew")) return undefined;
  return { name, slug: ref.slug, source: ref.source, documentSlug: ref.documentSlug };
}

export function monsterSpellLabel(spell: { name: string; reference?: MonsterSpellReference }, locale: Locale): string {
  const ref = monsterSpellReference(spell.reference, spell.name);
  return ref ? contentName("spells", ref satisfies NamedRow, locale) : spell.name;
}
