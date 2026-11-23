import { describe, expect, it } from "vitest";
import { rulebookPages } from "../../../rulebook/book";
import type { RulebookPage } from "../../../rulebook/types";
import { auditSrdLocalizedMetadata } from "./metadata-audit";

describe("SRD localized metadata mechanical audit (#107)", () => {
  it("detects changed level, magic bonus, dice or fractional CR without confusing word order", () => {
    const english: RulebookPage[] = [
      { id: "s", kind: "spell", chapter: "spells", title: "Magic", meta: "3rd-level evocation", md: "" },
      { id: "i", kind: "item", chapter: "magic-items", title: "Shield +2", meta: "Armor, very rare (+2)", md: "" },
      { id: "m", kind: "monster", chapter: "monsters", title: "Test", meta: "Challenge 1/4", md: "" },
    ];
    const correct = [
      { ...english[0], meta: "Evokace 3. úrovně" },
      { ...english[1], title: "Štít +2", meta: "Zbroj, velmi vzácná (+2)" },
      { ...english[2], meta: "Nebezpečnost 1/4" },
    ];
    expect(auditSrdLocalizedMetadata(english, correct)).toEqual([]);
    const corrupted = [
      { ...correct[0], meta: "Evokace 4. úrovně" },
      { ...correct[1], title: "Štít +3" },
      { ...correct[2], meta: "Nebezpečnost 1/2" },
    ];
    expect(auditSrdLocalizedMetadata(english, corrupted).map((x) => [x.id, x.field])).toEqual([
      ["s", "meta"], ["i", "title"], ["m", "meta"],
    ]);
  });

  it("checks every actual SRD page's localized title bonuses and metadata numbers", () => {
    const english = rulebookPages("en");
    const czech = rulebookPages("cs");
    const findings = auditSrdLocalizedMetadata(english, czech);
    expect(findings, JSON.stringify(findings.slice(0, 30), null, 2)).toEqual([]);
  });
});
