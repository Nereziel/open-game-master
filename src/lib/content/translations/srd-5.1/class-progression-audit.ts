// Compare the 20 progression rows and all numeric/slot/bonus columns for
// the twelve SRD classes. Class feature *names* remain prose and are not
// treated as mechanically equivalent by this test.
import type { RulebookPage } from "@/lib/rulebook/types";
import { fullCzechRulesOnly } from "./phase2-audit";

export type ClassProgressionFinding = Readonly<{
  id: string;
  level: number;
  column: number;
  english: string;
  czech: string;
}>;

function progressionRows(md: string): readonly string[][] {
  const out: string[][] = [];
  for (const line of md.split("\n")) {
    const cells = line.startsWith("|") ? line.split("|").slice(1, -1).map(cell=>cell.trim()) : [];
    if (cells.length<3) continue;
    if (!/^\d+(?:(?:st|nd|rd|th)|\.)$/.test(cells[0])) continue;
    out.push(cells);
  }
  return out;
}

function mechanicalCell(value: string): string | null {
  const trim=value.trim().replace(/\s+/g,"");
  if (/^[-–—]$/.test(trim)) return "-";
  if (/^[+-]?\d+(?:\/\d+)?(?:[dk]\d+)?$/.test(trim)) return trim.replace(/k(\d+)$/,"d$1");
  if (/^\d+(?:st|nd|rd|th|\.)$/.test(trim)) return trim.replace(/(?:st|nd|rd|th|\.)$/,"");
  return null;
}

export function auditSrdClassProgressions(
  sourcePages: readonly RulebookPage[],
  czechPages: readonly RulebookPage[],
): readonly ClassProgressionFinding[] {
  const byId=new Map(czechPages.map(p=>[p.id,p]));
  const findings:ClassProgressionFinding[]=[];
  for(const source of sourcePages){
    if(source.kind!=="class")continue;
    const czech=byId.get(source.id);
    const full=czech&&fullCzechRulesOnly(source,czech);
    const englishRows=progressionRows(source.md),czechRows=full?progressionRows(full):[];
    // Some classes contain extra numeric advancement tables (e.g. druid).
    // Require at least twenty rows and compare *all* mirrored rows rather
    // than assuming each source document has exactly one level table.
    if(englishRows.length<20||czechRows.length!==englishRows.length){
      findings.push({id:source.id,level:0,column:-1,english:String(englishRows.length),czech:String(czechRows.length)});
      continue;
    }
    for(let i=0;i<englishRows.length;i++){
      const english=englishRows[i],translated=czechRows[i];
      if(english.length!==translated.length){
        findings.push({id:source.id,level:i+1,column:-1,english:String(english.length),czech:String(translated.length)});
        continue;
      }
      for(let j=0;j<english.length;j++){
        const before=mechanicalCell(english[j]),after=mechanicalCell(translated[j]);
        if(before!==null&&(after===null||before!==after)){
          findings.push({id:source.id,level:i+1,column:j,english:english[j],czech:translated[j]});
        }
      }
    }
  }
  return findings;
}
