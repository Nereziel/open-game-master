import { contentName, publishedSpeciesTraitName, type NamedRow } from "@/lib/content/names";
import type { Locale } from "@/lib/i18n/translate";
import { searchKey, textKey } from "@/lib/language/text-logic";
import { publishedTraits, traitParagraphs, type PublishedTrait } from "@/lib/workshop/species-traits";

export type PublishedSpeciesRow = NamedRow & { traits: string };
export type PublishedTraitChoice = {
  trait: PublishedTrait;
  label: string;
  fromLabels: string[];
  searchNames: string[];
};

// The canonical list still has the original deduplication and insertion
// rules. Attach display labels to it using the sources of the actual trait
// paragraphs, not a race name guessed from the trait's title.
export function publishedTraitChoices(rows: PublishedSpeciesRow[], locale: Locale): PublishedTraitChoice[] {
  const sources = new Map<string, Array<{ row: PublishedSpeciesRow; name: string; text: string }>>();
  for (const row of rows) {
    for (const [name, text] of traitParagraphs(row.traits)) {
      const key = textKey(name);
      const list = sources.get(key) ?? [];
      list.push({ row, name, text });
      sources.set(key, list);
    }
  }
  return publishedTraits(rows).map((trait) => {
    const entries = sources.get(textKey(trait.name)) ?? [];
    // The first nonempty text is what publishedTraits copies. If several
    // distinct source headings share that text, do not guess a translation.
    const matching = entries.filter((entry) => entry.text === trait.text);
    const labels = [...new Set(matching.map(({ row, name }) => publishedSpeciesTraitName(row, name, locale)))];
    const label = labels.length === 1 ? labels[0] : trait.name;
    const fromLabels = trait.from.map((name) => {
      const names = [...new Set(entries.filter((entry) => entry.row.name === name)
        .map(({ row }) => row.source && row.documentSlug ? contentName("species", row, locale) : row.name))];
      return names.length === 1 ? names[0] : name;
    });
    return { trait, label, fromLabels, searchNames: [trait.name, label, ...trait.from, ...fromLabels] };
  });
}

export function publishedTraitMatches(choice: PublishedTraitChoice, query: string): boolean {
  const wanted = searchKey(query);
  return !wanted || choice.searchNames.some((name) => searchKey(name).includes(wanted));
}
