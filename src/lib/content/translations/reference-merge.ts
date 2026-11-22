// Preserve old casting fields omitted by older clients, but treat explicit
// source-reference maps as authoritative replacements (including {}).
export function castingOverlayBase(
  stored: Readonly<Record<string, unknown>>,
  patch: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  if (!Object.prototype.hasOwnProperty.call(patch, "contentRefs")) return { ...stored };
  const base = { ...stored };
  delete base.contentRefs;
  return base;
}
