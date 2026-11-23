// Checks structured stats against the same canonical English monster,
// independently from translated prose or same-named entities in other books.
import type { RulebookPage } from "@/lib/rulebook/types";
import { fullCzechRulesOnly } from "./phase2-audit";

export type MonsterStatIssue = Readonly<{
  id: string;
  field: "armorClass" | "hitPoints" | "challengeRating" | "abilityScores" | "speed" | "missingHeader";
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
    const scores = cells.map(cell => {
      const match = /^(\d{1,2})\s*\(\s*([+-]?\d+)\s*\)$/.exec(cell);
      return match ? `${Number(match[1])}(${Number(match[2]) >= 0 ? "+" : ""}${Number(match[2])})` : null;
    });
    if (scores.every(Boolean)) return scores.join(",");
  }
  return null;
}

function speedFeet(text: string, localized: boolean): string {
  const regex = localized ? /(\d+)\s*(?:stop|stopy|stopa)\b/gi
    : /(\d+)\s*(?:ft\.?|feet|foot)\b/gi;
  return [...text.matchAll(regex)].map(match => String(Number(match[1]))).join(",");
}

function hitPointDice(text: string): string {
  const match = /\(\s*(\d+)\s*[dk](\d+)\s*([+-]\s*\d+)?\s*\)/i.exec(text);
  return match ? `${Number(match[1])}d${Number(match[2])}${(match[3] ?? "").replace(/\s/g, "")}` : "";
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
    // "Customizing NPCs" is classified as a monster-section page in the
    // imported SRD, but is prose guidance without a creature stat block.
    // Treat other similarly structured pages the same way, based strictly
    // on their English fields rather than a brittle hard-coded ID list.
    const hasOriginalStats = FIELDS.some(([, englishLabels]) => statLine(page.md, englishLabels) !== null)
      || abilities(page.md) !== null;
    if (!hasOriginalStats) continue;
    for (const [field, englishLabels, czechLabels] of FIELDS) {
      const en = statLine(page.md, englishLabels);
      const cs = statLine(czech, czechLabels);
      if (!en || !cs) {
        issues.push({ id: page.id, field: "missingHeader", original: en ?? "", localized: cs ?? "" });
      } else if (leadingStat(en) !== leadingStat(cs)) {
        issues.push({ id: page.id, field, original: en, localized: cs });
      }
    }
    const englishSpeed = statLine(page.md, ["Speed"]);
    const czechSpeed = statLine(czech, ["Rychlost"]);
    if (englishSpeed || czechSpeed) {
      if (!englishSpeed || !czechSpeed || speedFeet(englishSpeed, false) !== speedFeet(czechSpeed, true)) {
        issues.push({ id: page.id, field: "speed", original: englishSpeed ?? "", localized: czechSpeed ?? "" });
      }
    }
    const sourceHp = statLine(page.md, ["Hit Points"]);
    const localHp = statLine(czech, ["Životy"]);
    if (sourceHp && localHp && hitPointDice(sourceHp) !== hitPointDice(localHp)) {
      issues.push({ id: page.id, field: "hitPoints", original: sourceHp, localized: localHp });
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
