import { searchKey } from "@/lib/language/text-logic";

// A tile is shown under its translated catalog name, but spell preparation
// and storage still use the canonical name. Search both without changing IDs.
// The needle is normalized once by the caller (searchKey on the query).
export function spellNameMatchesSearch(storedName: string, shownName: string, needle: string): boolean {
  if (!needle) return true;
  return searchKey(storedName).includes(needle) || searchKey(shownName).includes(needle);
}
