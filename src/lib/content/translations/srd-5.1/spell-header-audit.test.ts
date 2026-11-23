import { describe, expect, it } from "vitest";
import { rulebookPages } from "@/lib/rulebook/book";
import type { RulebookPage } from "@/lib/rulebook/types";
import { auditSrdSpellHeaders } from "./spell-header-audit";

const english: RulebookPage = {
  id: "test-spell", kind: "spell", chapter: "spells", title: "Test Spell",
  meta: "1st-level evocation",
  md: "**Casting Time:** 1 action\n\n**Range:** 60 feet\n\n**Components:** V, S, M (crystal)\n\n**Duration:** Concentration, up to 1 minute\n\nEnglish rules.",
};
const czech: RulebookPage = {
  ...english, title: "Testovací kouzlo",
  md: "## Úplné znění pravidel v češtině\n\n**Doba sesílání:** 1 akce\n\n**Dosah:** 60 stop (12 sáhů)\n\n**Složky:** V, S, M (krystal)\n\n**Trvání:** Soustředění, až 1 minuta\n\nČeská pravidla.\n\n---\n\n**Úplné původní znění SRD 5.1 v angličtině:**\n\n" + english.md,
};

describe("SRD translated spell headers and mechanics (#107 phase 2)", () => {
  it("agrees on action, range, components and concentration", () => {
    expect(auditSrdSpellHeaders([english], [czech])).toEqual([]);
  });

  it("reports mismatched rules fields rather than silently replacing canonical values", () => {
    const bad = { ...czech, md: czech.md
      .replace("1 akce", "2 akce")
      .replace("60 stop", "90 stop")
      .replace("V, S, M (krystal)", "V, S")
      .replace("Soustředění, až 1 minuta", "2 minuty") };
    expect(auditSrdSpellHeaders([english], [bad]).map(finding => finding.field))
      .toEqual(["castingTime", "range", "components", "duration"]);
  });

  it("provides a bounded human-review report over actual bundled SRD spells", () => {
    const findings = auditSrdSpellHeaders(rulebookPages("en"), rulebookPages("cs"));
    console.info("[SRD #107 spell header review]", JSON.stringify({
      count: findings.length,
      samples: findings.slice(0, 25),
    }));
    expect(findings.every(f => Boolean(f.id && f.reason))).toBe(true);
  });
});
