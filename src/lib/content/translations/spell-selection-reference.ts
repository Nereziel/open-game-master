// Never infer a saved spell identity from its English name alone: a table's
// optional packs can contain identical spell names. Only an explicitly
// selected, unambiguous catalog row is eligible for a durable reference.
import { textKey } from "@/lib/language/text-logic";
import type { PoolSpell } from "@/components/sheet/useSpellPool";
import {
  storedReferenceForCatalogRow, sameStoredContentReference,
  type StoredContentReference,
} from "./stored-reference";

export function selectedSpellReference(
  name: string,
  pool: readonly PoolSpell[],
): StoredContentReference | null {
  const matches = pool.filter((row) => textKey(row.name) === textKey(name));
  const references = matches.map((row) => row.source && row.slug
    ? storedReferenceForCatalogRow("spells", {
        source: row.source, documentSlug: row.documentSlug, slug: row.slug,
      })
    : null);
  if (!matches.length || references.some((ref) => !ref)) return null;
  const first = references[0]!;
  return references.every((ref) => sameStoredContentReference(ref!, first)) ? first : null;
}

export function updateChosenSpellReference(
  current: Readonly<Record<string, StoredContentReference>>,
  name: string,
  reference: StoredContentReference | null,
): Record<string, StoredContentReference> {
  const next = { ...current };
  // Treat case/whitespace variants of the same English engine name as one
  // spell. Clear all prior spell aliases before writing a new reference.
  const aliases = Object.entries(next).filter(([key]) => textKey(key) === textKey(name));
  const conflict = reference && aliases.some(([, existing]) => !sameStoredContentReference(existing, reference));
  for (const [key] of aliases) delete next[key];
  // Never leave a reference from another book or guess on an ambiguous pick.
  if (reference && !conflict) next[name] = reference;
  return next;
}

export function keepChosenSpellReferences(
  current: Readonly<Record<string, StoredContentReference>>,
  names: readonly string[],
): Record<string, StoredContentReference> {
  const allowed = new Set(names.map(textKey));
  return Object.fromEntries(Object.entries(current).filter(([name]) => allowed.has(textKey(name))));
}
