// Verify mechanical stat blocks in FULL Czech monster pages against the
// exact canonical English SRD page (never against a similarly named monster).
import type { RulebookPage } from "@/lib/rulebook/types";
import { fullCzechRulesOnly } from "./phase2-audit";

export type SrdMonsterStatFinding = Readonly<{
  id: string;
  field: "armorClass" | "hitPoints" | "hitDice" | "abilityScores" | "challenge" | "speed" | "xp";
  english: string;
  czech: string;
}>;

type StatField = SrdMonsterStatFinding["field"];
function statLine(text: string, label: string): string {
  // Header labels are literal ASCII or Czech strings; no regex syntax.
  return text.split("\n").find(line => line.trim().startsWith("**" + label + "**"))
    ?.trim().slice(label.length + 4).trim() ?? "";
}
function firstNumeric(text: string): string {
  return /^\d+/.exec(text)?.[0] ?? "";
}
function hitDice(text: string): string {
  const match = /(\d+)\s*[dk](\d+)\s*(?:([+-])\s*(\d+))?/i.exec(text);
  return match ? [match[1], match[2], match[3] ?? "", match[4] ?? ""].join(":") : "";
}
function scores(text: string): string {
  // Templates may describe "Challenge" before the actual example statblock.
  // Scan the entire canonical page and select the first six ability cells.
  for (const line of text.split("\n")) {
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map(cell => cell.trim());
    if (cells.length !== 6) continue;
    const values = cells.map(cell => /^(\d+)\s*\([+-]\d+\)$/.exec(cell)?.[1] ?? "");
    if (values.every(Boolean)) return values.join(",");
  }
  return "";
}
function speedValues(value: string): string {
  return [...value.matchAll(/\b(\d+)\s*(?:ft\.?|feet|foot|stop|stopy|stopa)(?=\b|[.,])/gi)]
    .map(m => Number(m[1])).sort((a,b) => a-b).join(",");
}
function challenge(value: string): string {
  return /^(\d+(?:\/\d+)?)/.exec(value)?.[1] ?? "";
}
function experience(value: string): string {
  const m = /\(([\d,\s\u00a0]+)\s*(?:XP|ZK)\)/i.exec(value);
  return m ? m[1].replace(/[,\s\u00a0]/g, "") : "";
}

/** Finds all supported mechanical stat-block discrepancies for 318 SRD monsters. */
export function auditSrdMonsterStats(
  englishPages: readonly RulebookPage[],
  czechPages: readonly RulebookPage[],
): readonly SrdMonsterStatFinding[] {
  const localized = new Map(czechPages.map(page => [page.id, page]));
  const findings: SrdMonsterStatFinding[] = [];
  for (const source of englishPages) {
    if (source.kind !== "monster") continue;
    // The SRD catalog also tags prose guidance (e.g. Customizing NPCs)
    // as monster pages. Guidance has no numerical statblock to compare.
    if (!statLine(source.md, "Armor Class") && !statLine(source.md, "Hit Points")) continue;
    const page = localized.get(source.id);
    const full = page && fullCzechRulesOnly(source, page);
    if (!full) {
      findings.push({ id: source.id, field: "abilityScores", english: "SOURCE", czech: "MISSING FULL TRANSLATION" });
      continue;
    }
    const values: readonly [StatField,string,string][] = [
      ["armorClass", firstNumeric(statLine(source.md,"Armor Class")),
        firstNumeric(statLine(full,"OČ") || statLine(full,"Obranné číslo"))],
      ["hitPoints", firstNumeric(statLine(source.md,"Hit Points")), firstNumeric(statLine(full,"Životy"))],
      ["hitDice", hitDice(statLine(source.md,"Hit Points")), hitDice(statLine(full,"Životy"))],
      ["abilityScores", scores(source.md), scores(full)],
      ["challenge", challenge(statLine(source.md,"Challenge")), challenge(statLine(full,"Nebezpečnost"))],
      ["xp", experience(statLine(source.md,"Challenge")), experience(statLine(full,"Nebezpečnost"))],
      ["speed", speedValues(statLine(source.md,"Speed")), speedValues(statLine(full,"Rychlost"))],
    ];
    for (const [field, english, czech] of values) {
      if (!english || !czech || english !== czech) findings.push({
        id: source.id, field, english: english || "MISSING", czech: czech || "MISSING",
      });
    }
  }
  return findings;
}
