// One row per name in a picker, the way a player expects: the pack files
// the same SRD entry under more than one document, so a browse shows Fire
// Bolt twice. Pure, so scripts/test-adventuring-gear.mjs can drive it.
//
// Where a name is filed twice under different kinds (Spell Scroll and
// Potion of Healing are a magic item in one document and priced gear in
// another), the mundane row is the one kept: that is the row the server
// prices a purchase by (src/lib/characters/catalog.ts, "a name the pack
// lists as mundane gear is mundane"), so a pick and its price check read
// the same row. Otherwise the first row wins, as before.
import { textKey } from "../../../lib/language/text-logic.ts";

export function uniqueByName<T extends { name: string; kind?: string }>(rows: T[]): T[] {
  const kept = new Map<string, T>();
  const order: string[] = [];
  for (const entry of rows) {
    const key = textKey(entry.name);
    const held = kept.get(key);
    if (!held) {
      kept.set(key, entry);
      order.push(key);
    } else if (held.kind === "magic_item" && entry.kind && entry.kind !== "magic_item") {
      kept.set(key, entry);
    }
  }
  return order.map((key) => kept.get(key)!);
}


// Source-specific identity for catalogs: "Shield" from two distinct books
// must remain two selectable entries. Keep legacy uniqueByName for places
// whose saved game mechanic still explicitly expects one name.
export function uniqueBySource<T extends { name: string; slug?: string; source?: string; documentSlug?: string; kind?: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  return rows.filter((entry) => {
    const key = sourceRowIdentity(entry);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** An entry's identity is scoped to its content pack, not its printed title. */
export function sourceRowIdentity(entry: { name: string; slug?: string; source?: string; documentSlug?: string; kind?: string }): string {
  return JSON.stringify([
    entry.source ?? "",
    entry.documentSlug ?? "",
    entry.kind ?? "",
    entry.slug || textKey(entry.name),
  ]);
}
