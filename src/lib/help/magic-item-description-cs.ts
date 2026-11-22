// Czech SRD magic-item descriptions are already present in the translated
// rulebook. Reuse the full text for character-sheet item dialogs too.
import { CZECH_FULL_ITEMS_01 } from "@/lib/rulebook/czech-full-items-01";
import { CZECH_FULL_ITEMS_02 } from "@/lib/rulebook/czech-full-items-02";
import { CZECH_FULL_ITEMS_03 } from "@/lib/rulebook/czech-full-items-03";

const MAGIC_ITEMS: Readonly<Record<string, string>> = {
  ...CZECH_FULL_ITEMS_01,
  ...CZECH_FULL_ITEMS_02,
  ...CZECH_FULL_ITEMS_03,
};

function canonicalId(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function canonicalMagicItemDescriptionCs(name: string, slug?: string): string | null {
  const candidates = [slug, name].filter((value): value is string => Boolean(value));
  for (const candidate of candidates) {
    const id = canonicalId(candidate);
    if (MAGIC_ITEMS[id]) return MAGIC_ITEMS[id];
  }
  return null;
}

export const CZECH_MAGIC_ITEM_COUNT = Object.keys(MAGIC_ITEMS).length;
