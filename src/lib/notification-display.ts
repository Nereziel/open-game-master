// Reader-only localization of known stored notification bodies. The inbox
// keeps its existing kind/body contract and no stored text is rewritten.
// A delimiter inside an authored name makes a legacy body ambiguous: keep
// the entire original instead. Dates are the producer's explicit UTC text.
import type { MessageVars } from "@/lib/messages-logic";
type T = (key: string, vars?: MessageVars) => string;

const templates: Readonly<Record<string, string>> = {
  "session_scheduled": "{campaign}: {session} is planned for {when}.",
  "session_updated": "{campaign}: {session} moved to {when}.",
  "session_cancelled": "{campaign}: {session} on {when} was called off.",
  "session_reminder": "{campaign}: {session} starts soon, at {when}. See you at the table.",
  "session_starting": "{campaign}: {session} is starting now. To the table!",
  "campaign_idle": "The table misses you: {campaign} has been quiet for a few days.",
  "rsvp": "{user} can't make {session} in {campaign}.",
  "friend_invite": "{user} invited you to \"{campaign}\". Join with room code {code}.",
  "friend_accept": "{user} accepted your friend request.",
  "friend_request": "{user} wants to be friends."
};

function extract(body: string, template: string): Record<string, string> | null {
  const slots = [...template.matchAll(/\{(\w+)\}/g)];
  let at = 0;
  let rest = body;
  const vars: Record<string, string> = {};
  for (const [i, slot] of slots.entries()) {
    const start = slot.index ?? 0;
    const literal = template.slice(at, start);
    if (!rest.startsWith(literal)) return null;
    rest = rest.slice(literal.length);
    at = start + slot[0].length;
    const next = slots[i + 1];
    const delimiter = template.slice(at, next?.index ?? template.length);
    if (!delimiter) return null;
    let end: number;
    if (next) {
      end = rest.indexOf(delimiter);
      if (end < 0 || rest.lastIndexOf(delimiter) !== end) return null;
    } else {
      if (!rest.endsWith(delimiter)) return null;
      end = rest.length - delimiter.length;
    }
    const value = rest.slice(0, end);
    if (!value.trim()) return null;
    vars[slot[1]] = value;
    rest = rest.slice(end);
  }
  if (rest !== template.slice(at)) return null;
  if (vars.when && !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC$/.test(vars.when)) return null;
  return vars;
}

export function notificationDisplay(item: { kind: string; body: string }, t: T): string {
  if (!Object.hasOwn(templates, item.kind)) return item.body;
  const template = templates[item.kind];
  const vars = extract(item.body, template);
  return vars ? t(template, vars) : item.body;
}
