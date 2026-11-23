import { describe, expect, it } from "vitest";
import { rulebookPages } from "@/lib/rulebook/book";
import type { RulebookPage } from "@/lib/rulebook/types";
import { auditSrdMonsterActions } from "./monster-action-audit";

const english: RulebookPage = {
  id: "example",kind:"monster",chapter:"monsters",title:"Example",
  md:"***Bite***. +7 to hit. DC 14 Dexterity saving throw.\n\n***Breath (Recharge 5-6)***. The target must make a DC 16 Constitution saving throw.",
};
const czech: RulebookPage = {
  ...english,
  md: "## Úplné znění pravidel v češtině\n\n***Kousnutí***. +7 k zásahu. Záchranný hod na Obratnost se SO 14.\n\n***Dech (obnovení 5–6)***. Cíl musí provést záchranný hod na Odolnost se SO 16.\n\n---\n\n**Úplné původní znění SRD 5.1 v angličtině:**\n\n" + english.md,
};

describe("SRD Czech monster action values (#107 phase 2)",()=>{
  it("preserves save difficulties, hit bonuses and recharge thresholds",()=>{
    expect(auditSrdMonsterActions([english],[czech])).toEqual([]);
  });
  it("recognizes alternate Czech terms for spell saves, escaping grabs and recharge on a roll",()=>{
    const variation={...czech,md:czech.md.replace("se SO 14","(SO úniku 14)")
      .replace("se SO 16","(SO záchrany kouzla 16)")
      .replace("obnovení 5–6","obnovení při 5–6")};
    expect(auditSrdMonsterActions([english],[variation])).toEqual([]);
  });
  it("detects altered action-level mechanics",()=>{
    const modified={...czech,md:czech.md.replace("SO 14","SO 15").replace("+7 k zásahu","+6 k zásahu").replace("obnovení 5–6","obnovení 4–6")};
    expect(auditSrdMonsterActions([english],[modified]).map(x=>x.field))
      .toEqual(["saveDC","attackBonus","recharge"]);
  });
  it("recognizes the English zombie's 'DC of 5' saving throw",()=>{
    const en={...english,md:english.md.replace("DC 14","DC of 14")};
    const cs={...czech,md:czech.md.replace(english.md,en.md)};
    expect(auditSrdMonsterActions([en],[cs])).toEqual([]);
  });
  it("checks all bundled monsters with their full Czech rules",()=>{
    const findings=auditSrdMonsterActions(rulebookPages("en"),rulebookPages("cs"));
    console.info("[SRD #107 monster action audit]",JSON.stringify({
      count:findings.length,byField:Object.fromEntries([...new Set(findings.map(x=>x.field))].map(field=>[
        field,findings.filter(x=>x.field===field).length,
      ])),samples:findings.slice(0,45),
    }));
    expect(findings.every(f=>Boolean(f.id&&f.field))).toBe(true);
  });
});
