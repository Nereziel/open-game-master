import { describe, expect, it } from "vitest";
import { rulebookPages } from "@/lib/rulebook/book";
import type { RulebookPage } from "@/lib/rulebook/types";
import { auditSrdPhase2, diceSignatures, fullCzechRulesOnly } from "./phase2-audit";
import { srdTranslationPack } from "./adapter";

describe("SRD 5.1 structured Czech/English audit (#107 phase 2)", () => {
  it("preserves identity, levels, schools, rarity, canonical metadata, group and family for the complete corpus", () => {
    const english = rulebookPages("en");
    const czech = rulebookPages("cs");
    const audit = auditSrdPhase2(english, czech);
    expect(audit.checkedPages).toBe(english.length);
    // The adapter coverage is structural; this verifies additional source
    // invariants on the actual translated text and stored English metadata.
    const { coverage } = srdTranslationPack(english, czech);
    expect(audit.fullTextPages).toBe(
      Object.values(coverage.fullText).reduce((total, count) => total + count, 0),
    );
    expect(audit.metadataIssues, JSON.stringify(audit.metadataIssues.slice(0, 30), null, 2)).toEqual([]);
  });

  it("extracts only Czech full rules and normalizes Czech dice notation", () => {
    const original: RulebookPage = {
      kind: "spell", chapter: "spells", id: "audit-sample", title: "Sample",
      meta: "Evocation cantrip", group: "Cantrips", md: "An attack deals 2d6 + 3 damage.",
    };
    const localized: RulebookPage = {
      ...original, title: "Ukázka", meta: "Zaklínání (trik)",
      originalMeta: "Evocation cantrip", group: "Triky",
      md: `Český úvod\n\n## Úplné znění pravidel v češtině\n\nÚtok způsobí 2k6 + 3 zranění.\n\n---\n\n**Úplné původní znění SRD 5.1 v angličtině:**\n\n${original.md}`,
    };
    expect(fullCzechRulesOnly(original, localized)).toContain("2k6");
    expect(diceSignatures(original.md)).toEqual(["2d6"]);
    expect(diceSignatures(fullCzechRulesOnly(original, localized)!)).toEqual(["2d6"]);
    expect(auditSrdPhase2([original], [localized]).metadataIssues).toEqual([]);
    expect(auditSrdPhase2([original], [localized]).diceReview).toEqual([]);
    const altered = { ...localized, md: localized.md.replace("2k6", "3k6") };
    expect(auditSrdPhase2([original], [altered]).diceReview).toEqual([{
      id: original.id, kind: "spell",
      missingFromCzech: ["2d6"], unexpectedInCzech: ["3d6"],
    }]);
  });

  it("surfaces corrupted spell level, provenance, reference group and missing pages instead of silently accepting them", () => {
    const source: RulebookPage = {
      id: "light", chapter: "spells", kind: "spell", title: "Light",
      meta: "1st-level evocation", group: "1st Level", md: "English",
    };
    const broken: RulebookPage = {
      ...source, meta: "Zaklínání 2. úrovně",
      originalMeta: "wrong", group: "3. úroveň",
    };
    const report = auditSrdPhase2([source], [broken]);
    expect(report.metadataIssues.map((issue) => issue.field)).toEqual(["meta", "sourceMeta", "spellLevel", "group"]);
    expect(auditSrdPhase2([source], []).metadataIssues[0].field).toBe("identity");
    expect(auditSrdPhase2([], [broken]).metadataIssues[0].field).toBe("identity");
    expect(fullCzechRulesOnly(source, broken)).toBeNull();
  });

  it("reports possible dice discrepancies for editorial review without claiming automatic proof of prose correctness", () => {
    const review = auditSrdPhase2(rulebookPages("en"), rulebookPages("cs")).diceReview;
    expect(Array.isArray(review)).toBe(true);
    expect(review.every((entry) => entry.missingFromCzech.length > 0 || entry.unexpectedInCzech.length > 0)).toBe(true);
    // These are review findings, not hard failures: unit conversions and
    // differences in examples cannot be settled using regex alone.
  });
});
