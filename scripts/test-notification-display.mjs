import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { notificationDisplay } from "../src/lib/notification-display.ts";
import { installCatalog, translate } from "../src/lib/i18n/translate.ts";

const cases = [
  [
    "session_scheduled",
    "{campaign}: {session} is planned for {when}."
  ],
  [
    "session_updated",
    "{campaign}: {session} moved to {when}."
  ],
  [
    "session_cancelled",
    "{campaign}: {session} on {when} was called off."
  ],
  [
    "session_reminder",
    "{campaign}: {session} starts soon, at {when}. See you at the table."
  ],
  [
    "session_starting",
    "{campaign}: {session} is starting now. To the table!"
  ],
  [
    "campaign_idle",
    "The table misses you: {campaign} has been quiet for a few days."
  ],
  [
    "rsvp",
    "{user} can't make {session} in {campaign}."
  ],
  [
    "friend_invite",
    "{user} invited you to \"{campaign}\". Join with room code {code}."
  ],
  [
    "friend_accept",
    "{user} accepted your friend request."
  ],
  [
    "friend_request",
    "{user} wants to be friends."
  ]
];
const vars = { user: "Iris [A+B]", campaign: "Custom (A+B)", session: "Homebrew [A+B]", when: "2026-11-25 19:30 UTC", code: "ABCD1234" };
for (const locale of ["cs", "fr"]) {
  installCatalog(locale, JSON.parse(readFileSync(new URL(`../src/lib/i18n/${locale}.json`, import.meta.url), "utf8")));
}
for (const [kind, key] of cases) {
  const body = translate("en", key, vars);
  const item = Object.freeze({ kind, body });
  for (const locale of ["en", "cs", "fr"]) {
    const t = (message, values) => translate(locale, message, values);
    const result = notificationDisplay(item, t);
    assert.equal(result, t(key, vars), kind);
    assert.equal(result === body, locale === "en", kind);
    assert.doesNotMatch(result, /\{\w+\}/);
    assert.equal(notificationDisplay({ kind: "custom", body }, t), body);
  }
}
const t = (message, values) => translate("cs", message, values);
for (const item of [
  { kind: "session_scheduled", body: "My: campaign: homebrew is planned for 2026-11-25 19:30 UTC." },
  { kind: "session_scheduled", body: "Campaign: homebrew is planned for tomorrow." },
  { kind: "friend_request", body: "Not a known template." },
  { kind: "rsvp", body: "Iris can't make Night in the Woods in Campaign." },
]) assert.equal(notificationDisplay(item, t), item.body);
console.log("ok: localized notification presentation, authored names and ambiguous body fallback");
