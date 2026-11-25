import { translate, type Locale } from "@/lib/i18n/translate";
import { localizeCoins } from "@/lib/srd/currency";

// Historical events have no structured arguments or producer ID. Only the
// exact, kind-specific templates written by the engine are recognized.
// Leave names, causes, reasons, and unrecognized story prose alone.
export function characterEventDisplay(event: { kind: string; summary: string }, locale: Locale): string {
  const { kind, summary } = event;
  if (locale === "en") return summary;
  const t = (key: string, vars: Record<string, string> = {}) => translate(locale, key, vars);
  let match: RegExpExecArray | null;
  if (kind === "item") {
    if ((match = /^Acquired (.+)\.$/.exec(summary))) return t("Acquired {item}.", { item: match[1] });
    if ((match = /^Identified (.+)\.$/.exec(summary))) return t("Identified {item}.", { item: match[1] });
    if ((match = /^(.+) turned out to be (.+)\.$/.exec(summary))) return t("{from} turned out to be {to}.", { from: match[1], to: match[2] });
    if ((match = /^(Bought|Sold) (.+) for (\d+ (?:gp|sp|cp)(?: \d+ (?:sp|cp))*) at (.+)\.$/.exec(summary))) {
      return t(match[1] === "Bought" ? "Bought {item} for {price} at {shop}." : "Sold {item} for {price} at {shop}.", { item: match[2], price: localizeCoins(match[3], locale), shop: match[4] });
    }
  }
  if (kind === "achievement") {
    if ((match = /^Learned the cantrip (.+)\.$/.exec(summary))) return t("Learned the cantrip {spell}.", { spell: match[1] });
    if ((match = /^Learned the spell (.+)\.$/.exec(summary))) return t("Learned the spell {spell}.", { spell: match[1] });
    if ((match = /^Copied (.+) into the spellbook\.$/.exec(summary))) return t("Copied {spell} into the spellbook.", { spell: match[1] });
  }
  if (kind === "level_up") {
    if ((match = /^Reached enough experience for level (\d+)\.$/.exec(summary))) return t("Reached enough experience for level {level}.", { level: match[1] });
    if ((match = /^(.+) reached level (\d+)\.$/.exec(summary))) return t("{name} reached level {level}.", { name: match[1], level: match[2] });
  }
  if (kind === "death" && (match = /^Died: (.+)\.$/.exec(summary))) return t("Died: {cause}.", { cause: match[1] });
  if (kind === "story") {
    if ((match = /^(.+) joined the party as an AI companion \((guest|party)\)\.$/.exec(summary))) return t("{name} joined the party as an AI companion ({kind}).", { name: match[1], kind: translate(locale, match[2], { context: "history.companionKind" }) });
    if ((match = /^(.+) left the party\.$/.exec(summary))) return t("{name} left the party.", { name: match[1] });
    if ((match = /^(.+) left the party: (.+)$/.exec(summary))) return t("{name} left the party: {reason}", { name: match[1], reason: match[2] });
    if ((match = /^(.+) travels with the party as an ally the GM plays\.$/.exec(summary))) return t("{name} travels with the party as an ally the GM plays.", { name: match[1] });
  }
  return summary;
}
