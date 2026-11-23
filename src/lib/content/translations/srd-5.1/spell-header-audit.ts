// Audit the four *written* spell stat fields, not metadata alone.
// Warnings are review leads, not automatic assertions of translation accuracy.
import type { RulebookPage } from "@/lib/rulebook/types";
import { fullCzechRulesOnly } from "./phase2-audit";

export type SrdSpellHeaderFinding = Readonly<{
  id: string;
  field: "castingTime" | "range" | "components" | "duration";
  english: string;
  czech: string;
  reason: string;
}>;

const FIELDS = [
  { field: "castingTime", en: "Casting Time", cs: "Doba sesílání" },
  { field: "range", en: "Range", cs: "Dosah" },
  { field: "components", en: "Components", cs: "Složky" },
  { field: "duration", en: "Duration", cs: "Trvání" },
] as const;

function readHeader(markdown: string, title: string): string {
  return new RegExp("^\\*\\*" + title + ":\\*\\*\\s*(.+)$", "im")
    .exec(markdown)?.[1]?.trim() ?? "";
}
function firstNumber(text: string): number | null {
  const m = /\d+/.exec(text);
  return m ? Number(m[0]) : null;
}
function feet(text: string, czech: boolean): number | null {
  const pattern = czech
    ? /\b(\d+)\s*(?:stop|stopy|stopa)\b/i
    : /\b(\d+)(?:\s*|-)(?:feet|foot|ft\.?)\b/i;
  const m = pattern.exec(text);
  return m ? Number(m[1]) : null;
}
function components(text: string): string {
  return (text.split("(")[0].match(/\b[VSM]\b/gi) ?? []).map(s => s.toUpperCase()).sort().join(",");
}

/** Compare a canonical English spell with its full Czech rules, when present. */
export function auditSrdSpellHeaders(
  originals: readonly RulebookPage[],
  translations: readonly RulebookPage[],
): readonly SrdSpellHeaderFinding[] {
  const byId = new Map(translations.map(page => [page.id, page]));
  const findings: SrdSpellHeaderFinding[] = [];
  for (const english of originals) {
    if (english.kind !== "spell") continue;
    const czechPage = byId.get(english.id);
    if (!czechPage) continue;
    const czechText = fullCzechRulesOnly(english, czechPage);
    if (czechText === null) continue;
    for (const { field, en, cs } of FIELDS) {
      const original = readHeader(english.md, en);
      if (!original) continue;
      const localized = readHeader(czechText, cs);
      let reason = "";
      if (!localized) reason = "missing translated header";
      else if (field === "components" && components(original) !== components(localized))
        reason = "V/S/M components differ";
      else if ((field === "castingTime" || field === "duration") && firstNumber(original) !== firstNumber(localized))
        reason = "numeric casting time/duration differs";
      else if (field === "duration" && /\bconcentration\b/i.test(original) !== /soustředění/i.test(localized))
        reason = "concentration flag differs";
      else if (field === "range" && feet(original, false) !== null && feet(original, false) !== feet(localized, true))
        reason = "range in feet differs";
      if (reason) findings.push({
        id: english.id, field, english: original, czech: localized, reason,
      });
    }
  }
  return findings;
}
