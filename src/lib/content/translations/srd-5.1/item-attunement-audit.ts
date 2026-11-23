// A source-scoped mechanical check for item attunement: every full Czech
// magic-item entry must preserve the English item's mandatory requirement.
// Rarity and item type are validated separately by the companion metadata
// tests; this compares the translated full rule heading itself.
import type { RulebookPage } from "@/lib/rulebook/types";
import { fullCzechRulesOnly } from "./phase2-audit";

export type SrdItemAttunementFinding = Readonly<{
  id: string;
  originalRequiresAttunement: boolean;
  czechRequiresAttunement: boolean;
  englishHeader: string;
  czechHeader: string;
}>;

function heading(markdown: string): string {
  return markdown.split("\n").map(s=>s.trim()).find(s=>s.startsWith("*")&&s.endsWith("*")) ?? "";
}

export function auditSrdItemAttunement(
  englishPages: readonly RulebookPage[],
  czechPages: readonly RulebookPage[],
): readonly SrdItemAttunementFinding[] {
  const byId=new Map(czechPages.map(page=>[page.id,page]));
  const findings:SrdItemAttunementFinding[]=[];
  for(const source of englishPages){
    if(source.kind!=="item")continue;
    const page=byId.get(source.id);
    const full=page&&fullCzechRulesOnly(source,page);
    if(!full)continue;
    const englishHeader=heading(source.md);
    const czechHeader=heading(full);
    const before=/requires attunement/i.test(englishHeader);
    const after=/vyžaduj[eí]\s+sladění|vyžaduje\s+sladění/i.test(czechHeader);
    if(before!==after){
      findings.push({id:source.id,originalRequiresAttunement:before,czechRequiresAttunement:after,englishHeader,czechHeader});
    }
  }
  return findings;
}
