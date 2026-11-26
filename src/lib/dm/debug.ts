// Server-only structured diagnostics. Never pass settings, headers, URLs,
// API keys or prompt bodies as fields. Raw story replies and game payloads require separate opt-in; textual prompts have an additional opt-in.
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


// Full textual prompt logging has its own opt-in: prompts can contain the
// narrator's private notes, player whispers and unrevealed story state.
export function dmDebugPromptEnabled(): boolean {
  return dmDebugEnabled() && process.env.DM_DEBUG_CONTENT === "1" && process.env.DM_DEBUG_PROMPT === "1";
}

type DebugMessage = {
  role: string;
  content: string | readonly ({ type: "text"; text: string } | { type: "image_url" })[];
  tool_calls?: unknown;
  tool_call_id?: string;
};

export function dmDebugModelInput(fields: Record<string, DebugValue>, messages: readonly DebugMessage[], tools: readonly unknown[] | undefined): void {
  if (!dmDebugPromptEnabled()) return;
  try {
    // Explicit allowlist: no route, credentials, headers, opaque provider
    // continuation items or image URLs/base64. Text and tool results remain
    // whole, in order, after request fitting.
    const input = messages.map((message) => ({
      role: message.role,
      content: typeof message.content === "string" ? message.content : message.content.map((part) => part.type === "text" ? { type: "text", text: part.text } : { type: "image_url", omitted: true }),
      tool_calls: message.tool_calls,
      tool_call_id: message.tool_call_id,
    }));
    dmDebugTrace("model.input", fields, { messages: input, tools: tools ?? [] });
  } catch {
    // Debugging must never stop a request.
  }
}

type ContinuityMessage = { id: string; seq: number; authorType: "player" | "dm" | "system"; characterId?: string | null; content: string };

// A deliberately lexical diagnostic (not a semantic judge). Ignore roll
// markers, case and Czech/French accents. No stemming or extra model call.
function words(text: string): Set<string> {
  return new Set(text.replace(/\[roll:[^\]]+\]/g, " ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().match(/[a-z0-9]{4,}/g) ?? []);
}

function coverage(source: Set<string>, target: Set<string>): number | null {
  if (!source.size) return null;
  let shared = 0;
  for (const word of source) if (target.has(word)) shared += 1;
  return Math.round(100 * shared / source.size);
}

// Only messages before the narration's reserved seq can be its context:
// players may post a new action while the current narration is streaming.
export function narrationContinuity(history: readonly ContinuityMessage[], seq: number, text: string) {
  const prior = history.filter((message) => message.seq < seq).sort((a, b) => a.seq - b.seq);
  const previous = prior.filter((message) => message.authorType === "dm").at(-1);
  const actions = prior.filter((message) => message.authorType === "player" && (!previous || message.seq > previous.seq));
  const current = words(text);
  const actionWords = words(actions.map((action) => action.content).join("\n"));
  const previousWords = words(previous?.content ?? "");
  return {
    fields: {
      actionCount: actions.length,
      lastActionId: actions.at(-1)?.id,
      previousNarrationId: previous?.id,
      actionWordCoveragePct: coverage(actionWords, current),
      previousWordCoveragePct: coverage(previousWords, current),
      finalWordCount: current.size,
      method: "lexical_only",
    },
    payload: {
      actions: actions.map(({ id, seq, characterId, content }) => ({ id, seq, characterId, content })),
      previous: previous ? { id: previous.id, seq: previous.seq, content: previous.content } : null,
      text,
    },
  };
}
