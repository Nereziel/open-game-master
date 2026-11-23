import { describe, expect, it } from "vitest";
import { rulebookPages } from "@/lib/rulebook/book";
import type { RulebookPage } from "@/lib/rulebook/types";
import { auditSrdItemAttunement } from "./item-attunement-audit";

const english:RulebookPage={
  id:"amulet",kind:"item",chapter:"magic-items",title:"Amulet",
  meta:"Wondrous item, rare (requires attunement)",
  md:"*Wondrous item, rare (requires attunement)*\n\nYou gain a benefit.",
};
const czech:RulebookPage={
  ...english,
  md:"## Úplné znění pravidel v češtině\n\n*Divotvorný předmět, vzácný (vyžaduje sladění)*\n\nZískáš výhodu.\n\n---\n\n**Úplné původní znění SRD 5.1 v angličtině:**\n\n"+english.md,
};
describe("SRD magic-item attunement requirements (#107 phase 2)",()=>{
  it("preserves mandatory attunement in Czech full rules",()=>{
    expect(auditSrdItemAttunement([english],[czech])).toEqual([]);
  });
  it("finds missing and invented attunement requirements",()=>{
    const broken={...czech,md:czech.md.replace("(vyžaduje sladění)","")};
    expect(auditSrdItemAttunement([english],[broken]).map(x=>x.id)).toEqual(["amulet"]);
    const sourceWithout={...english,md:"*Wondrous item, rare*\n\nYou gain a benefit."};
    const falseRequirement={...czech,md:czech.md.replace(english.md,sourceWithout.md)};
    expect(auditSrdItemAttunement([sourceWithout],[falseRequirement])).toHaveLength(1);
  });
  it("compares every canonical SRD magic-item page",()=>{
    const pages=rulebookPages("en");
    const review=auditSrdItemAttunement(pages,rulebookPages("cs"));
    expect(pages.filter(p=>p.kind==="item")).toHaveLength(239);
    console.info("[SRD #107 item attunement audit]",JSON.stringify({count:review.length,findings:review.slice(0,35)}));
    expect(review.every(item=>Boolean(item.id))).toBe(true);
  });
});
