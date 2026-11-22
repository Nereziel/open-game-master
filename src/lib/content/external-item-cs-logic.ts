// Shared between Node's batch translation script and the server-side reader.
// Never translate user homebrew: external Open5e rows only.
export function externalItemSource(data: Record<string, unknown>): string {
  for (const field of ["desc", "description", "traits", "benefits"]) {
    const value = data[field];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

// Accept only a complete translation with the same rule-critical numbers.
// Dice expressions and DCs contain numbers, so they are checked too.
export function sameRuleNumbers(original: string, translated: string): boolean {
  const tokens = (text: string) => (text.match(/\d+(?:[.,]\d+)?/g) ?? []).sort().join("|");
  return tokens(original) === tokens(translated);
}

export function externalItemKey(documentSlug: string, slug: string): string {
  return `${documentSlug}/${slug}`;
}
