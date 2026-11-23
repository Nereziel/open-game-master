// Migration boundary from PR #106's English-name-indexed Czech drafts.
// Only a verified Open5e row determines the canonical ID and owning book.
// Neither translated names nor English-name maps become saved/engine IDs.
import { textKey } from "@/lib/language/text-logic";
import { translationSourceId, type ContentType, type TranslationEntry, type TranslationPack } from "../registry";

export type SupplementKind = Extract<ContentType, "items" | "spells" | "feats">;
export type SupplementCatalogRow = Readonly<{
  source: "open5e" | "homebrew";
  documentSlug: string;
  kind: SupplementKind;
  slug: string;
  name: string;
}>;
export type SupplementTable = Readonly<{
  names: Readonly<Record<string, string>>;
  fullRules?: Readonly<Record<string, string>>;
  summaries?: Readonly<Record<string, string>>;
}>;
export type SupplementDictionary = Readonly<Partial<Record<SupplementKind, SupplementTable>>>;

export type SupplementPackReport = Readonly<{
  sourceId: string;
  catalogRows: number;
  translated: number;
  completeRules: number;
  summaryOnly: number;
  nameOnly: number;
  ambiguous: readonly string[];
  missing: readonly string[];
  orphanedDrafts: readonly string[];
}>;

function indexed(values: Readonly<Record<string, string>> | undefined): Readonly<Record<string, string>> {
  return Object.fromEntries(Object.entries(values ?? {}).map(([name, text]) => [textKey(name), text]));
}

export function buildSupplementCzechPack(
  sourceId: "tome-of-heroes" | "deep-magic" | "vault-of-magic",
  rows: readonly SupplementCatalogRow[],
  dictionary: SupplementDictionary,
): { pack: TranslationPack; report: SupplementPackReport } {
  // Source validation happens BEFORE any name lookup; never borrow a text
  // from another book or from user-authored content.
  const ownRows = rows.filter((row) => translationSourceId(row) === sourceId && row.slug.trim() && row.name.trim());
  const byIdentity = new Map<string, SupplementCatalogRow>();
  for (const row of ownRows) {
    const key = JSON.stringify([row.kind, row.slug]);
    const previous = byIdentity.get(key);
    // Deep Magic exists under both dmag and deepm. Same canonical slug/name
    // may represent the same entry; conflicting duplicates are untrusted.
    if (previous && textKey(previous.name) !== textKey(row.name)) {
      throw new Error(`Conflicting supplement catalog identity: ${key}`);
    }
    byIdentity.set(key, previous ?? row);
  }
  const unique = [...byIdentity.values()];
  const titleCount = new Map<string, number>();
  for (const row of unique) {
    const key = JSON.stringify([row.kind, textKey(row.name)]);
    titleCount.set(key, (titleCount.get(key) ?? 0) + 1);
  }

  const entries: Partial<Record<SupplementKind, Record<string, TranslationEntry>>> = {};
  const seen = new Set<string>();
  const ambiguous: string[] = [];
  const missing: string[] = [];
  let translated = 0;
  let completeRules = 0;
  let summaryOnly = 0;
  let nameOnly = 0;

  for (const row of unique) {
    const title = textKey(row.name);
    const key = JSON.stringify([row.kind, title]);
    if ((titleCount.get(key) ?? 0) > 1) {
      ambiguous.push(`${row.kind}:${row.name} (${row.slug})`);
      continue;
    }
    const table = dictionary[row.kind];
    const name = indexed(table?.names)[title];
    const full = indexed(table?.fullRules)[title];
    const summary = indexed(table?.summaries)[title];
    if (!name && !full && !summary) {
      missing.push(`${row.kind}:${row.slug}`);
      continue;
    }
    seen.add(key);
    const entry: TranslationEntry = {
      ...(name ? { name } : {}),
      // Only complete Czech rule text is allowed in description.
      // A summary remains display-only metadata: the same entry's English
      // rule text continues to be visible through the registry fallback.
      ...(full ? { description: full } : {}),
      ...(summary ? { metadata: { summaryCs: summary } } : {}),
    };
    (entries[row.kind] ??= {})[row.slug] = entry;
    translated++;
    if (full) completeRules++;
    else if (summary) summaryOnly++;
    else nameOnly++;
  }
  const orphanedDrafts: string[] = [];
  for (const [kind, table] of Object.entries(dictionary) as Array<[SupplementKind, SupplementTable]>) {
    const all = new Set([
      ...Object.keys(table.names), ...Object.keys(table.fullRules ?? {}),
      ...Object.keys(table.summaries ?? {}),
    ].map(textKey));
    for (const title of all) {
      if (!seen.has(JSON.stringify([kind, title]))) orphanedDrafts.push(`${kind}:${title}`);
    }
  }

  return {
    pack: { sourceId, locale: "cs", entries },
    report: {
      sourceId,
      catalogRows: unique.length,
      translated,
      completeRules,
      summaryOnly,
      nameOnly,
      ambiguous,
      missing,
      orphanedDrafts,
    },
  };
}
