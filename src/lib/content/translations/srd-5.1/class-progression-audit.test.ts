import { describe,expect,it } from "vitest";
import {rulebookPages} from "@/lib/rulebook/book";
import type {RulebookPage} from "@/lib/rulebook/types";
import {auditSrdClassProgressions} from "./class-progression-audit";

const source:RulebookPage={
  id:"fighter",kind:"class",chapter:"classes",title:"Fighter",
  md:"| Level | Proficiency Bonus | Features | Attacks |\n|---|---|---|---|\n"+Array.from({length:20},(_,i)=>"| "+(i+1)+"st | +"+(2+Math.floor(i/4))+" | Extra Attack | "+(i+1)+" |").join("\n"),
};
const localized:RulebookPage={
  ...source,title:"Bojovník",
  md:"## Úplné znění pravidel v češtině\n\n| Úroveň | Zdatnostní bonus | Schopnosti | Útoky |\n|---|---|---|---|\n"+Array.from({length:20},(_,i)=>"| "+(i+1)+". | +"+(2+Math.floor(i/4))+" | Útok navíc | "+(i+1)+" |").join("\n")+
  "\n\n---\n\n**Úplné původní znění SRD 5.1 v angličtině:**\n\n"+source.md,
};
describe("SRD class progression mechanical value parity (#107 phase 2)",()=>{
  it("allows translated labels and feature descriptions but preserves numeric columns",()=>{
    expect(auditSrdClassProgressions([source],[localized])).toEqual([]);
  });
  it("detects tampered proficiency bonus and missing table rows",()=>{
    const invalid={...localized,md:localized.md.replace("| 5. | +3 |","| 5. | +9 |")};
    expect(auditSrdClassProgressions([source],[invalid]).map(x=>[x.level,x.column])).toEqual([[5,1]]);
    expect(auditSrdClassProgressions([source],[])).toEqual([{
      id:"fighter",level:0,column:-1,english:"20",czech:"0",
    }]);
  });
  it("covers all twelve classes and prints the exact mechanical mismatch queue",()=>{
    const originals=rulebookPages("en");
    const checks=auditSrdClassProgressions(originals,rulebookPages("cs"));
    expect(originals.filter(p=>p.kind==="class")).toHaveLength(12);
    console.info("[SRD #107 class progression audit]",JSON.stringify({count:checks.length,samples:checks.slice(0,40)}));
    expect(checks).toEqual([]);
  });
});
