import { featTwinOf } from "@/lib/srd/feat-effects";
import { textKey } from "@/lib/language/text-logic";

// An imported book may offer a feat under a different published name while
// the engine applies exactly the same rules (e.g. Attentive / Alert). Only
// the explicit FEAT_TWINS equivalences are folded; similarly worded feats
// with distinct rules and homebrew entries retain their own identity.
export function featPickerKey(name: string, source?: string): string {
  const key = textKey(name);
  return source === "homebrew" ? `homebrew:${key}` : textKey(featTwinOf(name));
}

export function uniquePlayableFeatRows<T extends { name: string; source?: string }>(rows: T[]): T[] {
  const index = new Map<string, number>();
  const result: T[] = [];
  for (const row of rows) {
    const key = featPickerKey(row.name, row.source);
    const prior = index.get(key);
    if (prior === undefined) {
      index.set(key, result.length);
      result.push(row);
    } else if (row.source !== "homebrew" && textKey(row.name) === key && textKey(result[prior].name) !== key) {
      // Prefer the canonical feat over its renamed twin, preserving the
      // canonical name in the actual pick sent to the rules engine.
      result[prior] = row;
    }
  }
  return result;
}
