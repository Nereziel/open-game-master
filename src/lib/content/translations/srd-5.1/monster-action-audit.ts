// Action-level SRD rule values independent of translated prose or monster
// names. This catches altered save DCs, attack bonuses and recharge ranges
// that are not part of the numeric statblock header.
import type { RulebookPage } from "@/lib/rulebook/types";
import { fullCzechRulesOnly } from "./phase2-audit";

export type SrdMonsterActionFinding = Readonly<{
  id: string;
  field: "saveDC" | "attackBonus" | "recharge";
  english: readonly string[];
  czech: readonly string[];
}>;

function allValues(text: string, pattern: RegExp, pair = false): string[] {
  return [...text.matchAll(pattern)].map(match => pair
    ? String(Number(match[1])) + "-" + String(Number(match[2]))
    : String(Number(match[1]))).sort();
}

export function auditSrdMonsterActions(
  englishPages: readonly RulebookPage[],
  czechPages: readonly RulebookPage[],
): readonly SrdMonsterActionFinding[] {
  const czech = new Map(czechPages.map(page => [page.id,page]));
  const findings: SrdMonsterActionFinding[] = [];
  for (const page of englishPages) {
    if (page.kind !== "monster") continue;
    const translated = czech.get(page.id);
    const full = translated && fullCzechRulesOnly(page, translated);
    if (!full) continue;
    const fields = [
      ["saveDC", allValues(page.md,/\bDC\s*(\d+)\b/gi), allValues(full,/\bSO(?:\s+[\p{L}]+){0,6}\s+(\d+)\b/giu)],
      ["attackBonus", allValues(page.md,/\+(\d+)\s+to hit\b/gi), allValues(full,/\+(\d+)\s+(?:k|na)\s+zásahu\b/gi)],
      ["recharge", allValues(page.md,/\bRecharge\s*(\d+)\s*[-–]\s*(\d+)\b/gi,true),
        allValues(full,/\b(?:obnovení|dobití|obnoví(?:\s+se)?)(?:\s+(?:při|na|hodu|po)){0,3}\s+(\d+)\s*[-–]\s*(\d+)\b/gi,true)],
    ] as const;
    for (const [field, english, localized] of fields) {
      if (JSON.stringify(english) !== JSON.stringify(localized)) {
        findings.push({ id:page.id,field,english,czech:localized });
      }
    }
  }
  return findings;
}
