import { describe, expect, it } from "vitest";
import { rulebookPages } from "@/lib/rulebook/book";
import type { RulebookPage } from "@/lib/rulebook/types";
import { auditSrdMonsterStats } from "./monster-statblock-audit";

const original: RulebookPage = {
  id: "test-monster", kind: "monster", chapter: "monsters", title: "Test Monster",
  md: "*Medium beast, unaligned*\n\n**Armor Class** 15 (natural armor)\n\n**Hit Points** 22 (4d8+4)\n\n**Speed** 30 ft., swim 40 ft.\n\n| STR | DEX | CON | INT | WIS | CHA |\n|---|---|---|---|---|---|\n| 14 (+2) | 12 (+1) | 12 (+1) | 3 (-4) | 10 (+0) | 6 (-2) |\n\n**Challenge** 1/2 (100 XP)\n\n***Bite***. Attack.",
};
const translated: RulebookPage = {
  ...original,
  md: "## Úplné znění pravidel v češtině\n\n*Střední zvíře, bez přesvědčení*\n\n**OČ** 15 (přirozená zbroj)\n\n**Životy** 22 (4k8+4)\n\n**Rychlost** 30 stop, plavání 40 stop\n\n| SIL | OBR | ODL | INT | MOU | CHA |\n|---|---|---|---|---|---|\n| 14 (+2) | 12 (+1) | 12 (+1) | 3 (-4) | 10 (+0) | 6 (-2) |\n\n**Nebezpečnost** 1/2 (100 ZK)\n\n***Kousnutí***. Útok.\n\n---\n\n**Úplné původní znění SRD 5.1 v angličtině:**\n\n" + original.md,
};
describe("Czech SRD monster statblock mechanical fidelity (#107 phase 2)", () => {
  it("accepts identical AC, HP, hit dice, attributes, speed, challenge and XP", () => {
    expect(auditSrdMonsterStats([original], [translated])).toEqual([]);
  });
  it("flags mismatched AC, health, score and challenge on canonical ID", () => {
    const broken = { ...translated, md: translated.md.replace("**OČ** 15","**OČ** 14")
      .replace("**Životy** 22","**Životy** 23")
      .replace("14 (+2) | 12 (+1)", "18 (+4) | 12 (+1)")
      .replace("**Nebezpečnost** 1/2","**Nebezpečnost** 2") };
    expect(auditSrdMonsterStats([original],[broken]).map(issue=>issue.field))
      .toEqual(["armorClass","hitPoints","abilityScores","challenge"]);
    expect(auditSrdMonsterStats([original],[]).map(issue=>issue.field)).toEqual(["abilityScores"]);
  });
  it("compares the complete bundled 318 monster pages and emits a review queue", () => {
    const english=rulebookPages("en");
    const result=auditSrdMonsterStats(english,rulebookPages("cs"));
    expect(english.filter(page=>page.kind==="monster")).toHaveLength(318);
    console.info("[SRD #107 monster statblock audit]", JSON.stringify({
      count:result.length,byField:Object.fromEntries([...new Set(result.map(r=>r.field))].map(field=>[
        field,result.filter(item=>item.field===field).length,
      ])),sample:result.slice(0,35),
    }));
    expect(result.every(item=>Boolean(item.id&&item.field))).toBe(true);
  });
});
