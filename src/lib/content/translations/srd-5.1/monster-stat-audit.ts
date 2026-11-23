// Checks structured stats against the same canonical English monster,
// independently from translated prose or same-named entities in other books.
import type { RulebookPage } from "@/lib/rulebook/types";
import { fullCzechRulesOnly } from "./phase2-audit";

export type MonsterStatIssue = Readonly<{
  id: string;
  field: "armorClass" | "hitPoints" | "challengeRating" | "abilityScores" | "missingHeader";
  original: string;
  localized: string;
}>;

function statLine(text: string, labels: readonly string[]): string | null {
  for (const line of text.split("\n")) {
    for (const label of labels) {
      if (line.startsWith("**" + label + "**")) {
        return line.slice(label.length + 4).replace(/^\s*:?\s*/, "").trim();
      }
    }
  }
  return null;
}

function leadingStat(text: string): string | null {
  return /^(\d+(?:\/\d+)?)/.exec(text)?.[1] ?? null;
}

function abilities(markdown: string): string | null {
  for (const row of markdown.split("\n")) {
    if (!row.trim().startsWith("|")) continue;
    const cells = row.split("|").slice(1, -1).map(cell => cell.trim());
    if (cells.length !== 6) continue;
    const scores = cells.map(cell => /^(\d{1,2})\s*\(\s*[+-]?\d+\s*\)$/.exec(cell)?.[1]);
    if (scores.every(Boolean)) return scores.join(",");
  }
  return null;
}

const FIELDS = [
  ["armorClass", ["Armor Class"], ["OČ", "Obranné číslo", "Třída zbroje"]],
  ["hitPoints", ["Hit Points"], ["Životy"]],
  ["challengeRating", ["Challenge"], ["Nebezpečnost"]],
] as const;

export function auditMonsterStats(
  originals: readonly RulebookPage[],
  translations: readonly RulebookPage[],
): readonly MonsterStatIssue[] {
  const localized = new Map(translations.map(page => [page.id, page]));
  const issues: MonsterStatIssue[] = [];
  for (const page of originals) {
    if (page.kind !== "monster") continue;
    const other = localized.get(page.id);
    const czech = other && fullCzechRulesOnly(page, other);
    if (!czech) {
      issues.push({ id: page.id, field: "missingHeader", original: "monster", localized: "missing full Czech text" });
      continue;
    }
    for (const [field, englishLabels, czechLabels] of FIELDS) {
      const en = statLine(page.md, englishLabels);
      const cs = statLine(czech, czechLabels);
      if (!en || !cs) {
        issues.push({ id: page.id, field: "missingHeader", original: en ?? "", localized: cs ?? "" });
      } else if (leadingStat(en) !== leadingStat(cs)) {
        issues.push({ id: page.id, field, original: en, localized: cs });
      }
    }
    const en = abilities(page.md);
    const cs = abilities(czech);
    if (!en || !cs) {
      issues.push({ id: page.id, field: "missingHeader", original: en ?? "", localized: cs ?? "" });
    } else if (en !== cs) {
      issues.push({ id: page.id, field: "abilityScores", original: en, localized: cs });
    }
  }
  return issues;
}
