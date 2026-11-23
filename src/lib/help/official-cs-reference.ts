// Only official SRD spell rows may be replaced with the translated SRD book.
// Third-party supplements and homebrew keep their own authored descriptions.
export type PickerContentRef = {
  kind: string; slug: string; name?: string;
  source?: string; documentSlug?: string; rulebook?: string;
};

export function officialCzechSpellPageId(reference: PickerContentRef): string | null {
  if (reference.kind !== "spells") return null;
  const official = reference.source === "srd" || reference.source === "bundled"
    || reference.documentSlug === "wotc-srd";
  if (!official) return null;
  // A bundled item uses srd:<page-id>; an Open5e row uses a plain slug.
  const candidate = reference.rulebook
    ?? reference.slug.replace(/^srd:/, "")
    ?? "";
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate) ? candidate : null;
}
