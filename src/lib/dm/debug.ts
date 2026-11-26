// Server-only structured diagnostics. Never pass settings, headers, URLs,
// API keys or prompt bodies as fields. Raw story replies and game payloads require separate opt-in.
type DebugValue = string | number | boolean | null | undefined;

export function dmDebugEnabled(): boolean {
  return Boolean(process.env.DM_DEBUG && process.env.DM_DEBUG !== "0");
}

export function dmDebug(event: string, fields: Record<string, DebugValue> = {}): void {
  if (!dmDebugEnabled()) return;
  console.log("[dm-debug]", JSON.stringify({ at: new Date().toISOString(), event, ...fields }));
}

export function dmDebugArcReply(label: string, raw: string, fields: Record<string, DebugValue>): void {
  if (!dmDebugEnabled()) return;
  dmDebug("arc.reply", {
    ...fields, label, chars: raw.length,
    startsObject: raw.trimStart().startsWith("{"),
    endsObject: raw.trimEnd().endsWith("}"),
    ...(process.env.DM_DEBUG_CONTENT === "1" ? { reply: raw } : {}),
  });
}

// Keep game content out of metadata-only logs. Diagnostics are best effort,
// even if the payload cannot be serialized or the log sink fails.
export function dmDebugTrace(event: string, fields: Record<string, DebugValue>, payload: Record<string, unknown> = {}): void {
  if (!dmDebugEnabled()) return;
  try {
    const lengths = Object.fromEntries(Object.entries(payload).filter(([, value]) => typeof value === "string").map(([key, value]) => [key + "Chars", (value as string).length]));
    console.log("[dm-debug]", JSON.stringify({ at: new Date().toISOString(), event, ...fields, ...lengths, ...(process.env.DM_DEBUG_CONTENT === "1" ? { payload } : {}) }));
  } catch {
    // Never fail or retry a game action because of diagnostics.
  }
}
