import { describe, expect, it } from "vitest";
import glossary from "@/lib/help/glossary.json";
import { readFileSync } from "node:fs";
import path from "node:path";

describe("character vitals explanations", () => {
  const ids = ["speed", "coins", "proficiency_bonus", "spell_save_dc"];
  const terms = new Map(glossary.terms.map((entry) => [entry.id, entry]));

  it("has English and Czech text for all four vitals", () => {
    for (const id of ids) {
      const term = terms.get(id);
      expect(term, `Missing glossary entry: ${id}`).toBeDefined();
      expect(term?.short).toBeTruthy();
      expect(term?.long).toBeTruthy();
      expect(term?.cs).toBeTruthy();
      expect(term?.shortCs).toBeTruthy();
      expect(term?.longCs).toBeTruthy();
    }
  });

  it("explains the full spell save DC calculation and example in Czech", () => {
    expect(terms.get("spell_save_dc")?.cs).toBe("SO kouzel");
    expect(terms.get("spell_save_dc")?.longCs).toContain("8 + zdatnostní bonus");
    expect(terms.get("spell_save_dc")?.longCs).toContain("SO je 15");
  });

  it("wires all four fields to the same glossary control as initiative", () => {
    const source = readFileSync(path.join(process.cwd(), "src/app/characters/[characterId]/SheetSections.tsx"), "utf8");
    for (const id of ["initiative", ...ids]) {
      expect(source).toContain(`<GameTerm id="${id}">`);
    }
  });
});
