// Display-only localization of structured SRD catalog metadata.
// Never rewrite the English value stored in the rules engine or SQLite.
import { CS_ITEM_CATEGORIES, CS_MAGIC_SCHOOLS, CS_RARITIES } from "../common/cs";
import { translationSourceId, type SourceRecord } from "../registry";

type MetadataKind = "spells" | "items";
// Preserve every arbitrary string field the catalog may carry.
export type SrdStructuredMetadata = Readonly<Record<string, string>>;

function lookup(table: Readonly<Record<string, string>>, value: string): string {
  // Open5e stores rarity and school as lowercase codes in some releases.
  const known = Object.keys(table).find((key) => key.toLowerCase() === value.trim().toLowerCase());
  return known ? table[known] : value;
}

export function srdStructuredMetadataCs(
  record: SourceRecord & { kind: MetadataKind },
  original: SrdStructuredMetadata,
  locale: "en" | "cs" | "fr",
): SrdStructuredMetadata {
  if (locale !== "cs" || translationSourceId(record) !== "srd-5.1") return original;
  // Only visual labels are localized: no mutation of the original or its
  // canonical English mechanics (including level, bonuses or rarity keys).
  if (record.kind === "spells") {
    return {
      ...original,
      ...(original.school ? { school: lookup(CS_MAGIC_SCHOOLS, original.school) } : {}),
    };
  }
  return {
    ...original,
    ...(original.rarity ? { rarity: lookup(CS_RARITIES, original.rarity) } : {}),
    ...(original.category ? { category: lookup(CS_ITEM_CATEGORIES, original.category) } : {}),
  };
}
