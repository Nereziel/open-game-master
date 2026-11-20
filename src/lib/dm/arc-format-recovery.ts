// Structured recovery for the opening-act planner, kept pure for regression tests.
// The model's secret campaign output must never enter ordinary server logs.
export function openingActFormatRecovery(context: string): string {
  return `${context}\n\nFORMAT CORRECTION: Your previous answer was not usable opening-act JSON. This is a private PLANNING task, not a game turn. Do not narrate a scene, address the players, call tools, or explain. Return ONLY one valid JSON object containing the keys "beats" and "events". "beats" must contain 3 to 5 objects, each with a nonempty "text" string and 2 to 4 "waypoints" objects with "kind" and "text" keys. "events" must be an array (it may be empty). Keep every beat inside act 1 and follow the schema and rules in the system message. Begin with { and end with }. No Markdown fences or prose outside JSON.`;
}

// Escaped, one-line preview for explicit DM_DEBUG logs only. Do not call
// this for normal logs: the model can echo private campaign/story content.
export function arcReplyPreview(raw: string, maxChars = 500): string {
  const clipped = raw.slice(0, maxChars);
  const omitted = raw.length - clipped.length;
  return `${JSON.stringify(clipped)}${omitted ? ` [truncated; ${omitted} more chars]` : ""}`;
}

// A valid JSON object with the wrong keys is not an unreadable JSON reply.
// Logs include only the key names, never the secret story text, so it is
// possible to diagnose a planner returning "acts" or "act.milestones"
// without exposing the plan in ordinary logs.
export function arcReplyRootKeys(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw.trim());
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? Object.keys(parsed).slice(0, 25)
      : [];
  } catch {
    return [];
  }
}
