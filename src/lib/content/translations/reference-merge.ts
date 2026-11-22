// Preserve old casting fields omitted by older clients, but treat explicit
// source-reference maps as authoritative replacements (including {}).
export function castingOverlayBase(
  stored: object,
  patch: object,
): Record<string, unknown> {
  if (!Object.prototype.hasOwnProperty.call(patch, "contentRefs")) return { ...stored };
  const base = { ...stored };
  delete base.contentRefs;
  return base;
}
