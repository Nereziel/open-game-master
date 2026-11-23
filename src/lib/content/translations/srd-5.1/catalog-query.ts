// Resolve a *unique exact Czech SRD title* to the English catalog search
// term. This affects only querying; the returned row remains canonical.
// Ambiguous titles and partial queries are deliberately left alone.
import { rulebookPages } from "@/lib/rulebook/book";
import type { RulebookPage } from "@/lib/rulebook/types";
import { textKey } from "@/lib/language/text-logic";

const KINDS: Readonly<Record<string, RulebookPage["kind"]>> = {
  spells: "spell", items: "item", monsters: "monster",
  races: "race", classes: "class",
};

export function canonicalSrdSearchQuery(
  kind: string,
  query: string,
  locale: "en" | "cs" | "fr",
): string {
  const pageKind = KINDS[kind];
  const wanted = textKey(query.trim());
  if (locale !== "cs" || !pageKind || !wanted) return query;
  const english = rulebookPages("en");
  const czech = new Map(rulebookPages("cs").map((p) => [p.id, p]));
  const matching = english.filter(
    (p) => p.kind === pageKind
      && textKey(czech.get(p.id)?.title ?? p.title) === wanted,
  );
  return matching.length === 1 ? matching[0].title : query;
}
