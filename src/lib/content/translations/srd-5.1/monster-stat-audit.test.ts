import { describe, expect, it } from "vitest";
import { rulebookPages } from "@/lib/rulebook/book";
import type { RulebookPage } from "@/lib/rulebook/types";
import { auditMonsterStats } from "./monster-stat-audit";

const english: RulebookPage = {
  id: "test-creature", kind: "monster", chapter: "monsters", title: "Test",
  md: "*Medium monstrosity*\n\n**Armor Class** 15 (natural armor)\n\n**Hit Points** 27 (5d8+5)\n\n**Speed** 30 ft., fly 60 ft.\n\n| STR | DEX | CON | INT | WIS | CHA |\n|:--:|:--:|:--:|:--:|:--:|:--:|\n| 14 (+2) | 10 (+0) | 12 (+1) | 3 (-4) | 10 (+0) | 6 (-2) |\n\n**Challenge** 1/2 (100 XP)\n\nOriginal.",
};
const czech: RulebookPage = {
  ...english, title: "Testovací tvor",
  md: "## Úplné znění pravidel v češtině\n\n*Střední obluda*\n\n**OČ** 15 (přirozená zbroj)\n\n**Životy** 27 (5k8+5)\n\n**Rychlost** 30 stop, létání 60 stop\n\n| SIL | OBR | ODL | INT | MOU | CHA |\n|:--:|:--:|:--:|:--:|:--:|:--:|\n| 14 (+2) | 10 (+0) | 12 (+1) | 3 (-4) | 10 (+0) | 6 (-2) |\n\n**Nebezpečnost** 1/2 (100 ZK)\n\nČeský text.\n\n---\n\n**Úplné původní znění SRD 5.1 v angličtině:**\n\n" + english.md,
};

describe("SRD monster stat-block source audit (#107)", () => {
  it("keeps AC HP CR and all six ability scores across localized labels", () => {
    expect(auditMonsterStats([english], [czech])).toEqual([]);
  });

  it("catches incorrect AC, HP, challenge rating and individual ability values", () => {
    const wrong = { ...czech, md: czech.md
      .replace("**OČ** 15", "**OČ** 16")
      .replace("**Životy** 27", "**Životy** 28")
      .replace("**Rychlost** 30 stop", "**Rychlost** 35 stop")
      .replace("**Nebezpečnost** 1/2", "**Nebezpečnost** 1/4")
      .replace("14 (+2)", "15 (+2)") };
    expect(auditMonsterStats([english], [wrong]).map(issue => issue.field))
      .toEqual(["armorClass", "hitPoints", "challengeRating", "speed", "abilityScores"]);
  });

  it("detects changed HP dice formula or ability modifiers even when the headline score is unchanged", () => {
    const wrong = { ...czech, md: czech.md
      .replace("27 (5k8+5)", "27 (6k8+5)")
      .replace("14 (+2)", "14 (+3)") };
    expect(auditMonsterStats([english], [wrong]).map(issue => issue.field))
      .toEqual(["hitPoints", "abilityScores"]);
  });

  it("reports any monster stat differences in the real bundled corpus", () => {
    const issues = auditMonsterStats(rulebookPages("en"), rulebookPages("cs"));
    console.info("[SRD #107 monster stat review]", JSON.stringify({
      count: issues.length, byField: Object.fromEntries(
        [...new Set(issues.map(issue => issue.field))].map(field =>
          [field, issues.filter(issue => issue.field === field).length]),
      ), examples: issues.slice(0, 30),
    }));
    expect(issues.every(issue => Boolean(issue.id))).toBe(true);
    expect(issues, "SRD 5.1 monster numeric stat fields must agree").toEqual([]);
  });
});
