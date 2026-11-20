// Agent programs report English diagnostics through the server API. Keep that
// protocol stable for tools and logs, but translate known UI-facing messages
// when the admin/setup screen displays them. Unknown technical detail stays
// verbatim so an administrator can still investigate the failure.
type Translate = (english: string, vars?: Record<string, string | number>) => string;

const AGENT_ERROR_PREFIXES = [
  "The server's agent program could not be locked down, so the turn was refused.",
  "The server's agent program is signed out. The admin can sign it in again on this machine.",
  "The server's agent program has reached its plan's usage limit. The turn can be retried once the limit resets.",
  "The server's agent program is not installed or could not be found.",
] as const;

export function localizeAgentDiagnostic(message: string, t: Translate): string {
  for (const prefix of AGENT_ERROR_PREFIXES) {
    if (message === prefix) return t(prefix);
    // The harness appends its specific diagnostic in parentheses.
    if (message.startsWith(prefix + " (") && message.endsWith(")")) {
      const detail = message.slice(prefix.length + 2, -1);
      return `${t(prefix)} (${localizeAgentDiagnostic(detail, t)})`;
    }
  }

  const nativeTools = /^Antigravity started with its own tools still on \(([^)]*)\), so the turn was stopped\.$/u.exec(message);
  if (nativeTools) {
    return t("Antigravity started with its own tools still on ({tools}), so the turn was stopped.", {
      tools: nativeTools[1],
    });
  }
  const blockedTool = /^Antigravity attempted a tool outside this turn's game permissions \(([^)]*)\), so the turn was stopped\.$/u.exec(message);
  if (blockedTool) {
    return t("Antigravity attempted a tool outside this turn's game permissions ({tool}), so the turn was stopped.", {
      tool: blockedTool[1],
    });
  }

  return t(message);
}
