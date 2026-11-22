import { describe, expect, it } from "vitest";
import { CZECH_FULL_CLASSES_3 } from "../rulebook/czech-full-classes-3";
import { firstSentence, normalizeRulesText, parseRulesBlocks, parseRulesTable } from "./rules-text";

describe("rules description Markdown tables", () => {
  it("keeps Czech ordinal numbers inside hover preview sentences", () => {
    expect(firstSentence("Od 3. úrovně můžeš bonusovou akcí získat křídla. Potom létáš.")).toBe("Od 3. úrovně můžeš bonusovou akcí získat křídla.");
    expect(firstSentence("Od 5. úrovně můžeš seslat kouzlo.")).toBe("Od 5. úrovně můžeš seslat kouzlo.");
    expect(firstSentence("Získáš +2 k OČ. Účinek trvá minutu.")).toBe("Získáš +2 k OČ.");
  });
  it("renders all 20 levels of the Czech barbarian table with its five headers", () => {
    const blocks = parseRulesBlocks(CZECH_FULL_CLASSES_3.barbarian);
    const raw = blocks.find((block) => block.kind === "table" && block.rows[0]?.includes("Zuřivosti"));
    expect(raw?.kind).toBe("table");
    if (!raw || raw.kind !== "table") return;
    const table = parseRulesTable(raw.rows);
    expect(table?.head).toEqual(["Úroveň", "Zdatnostní bonus", "Schopnosti", "Zuřivosti", "Zranění zuřivosti"]);
    expect(table?.rows).toHaveLength(20);
    expect(table?.rows[0]).toEqual(["1.", "+2", "Zuřivost, Obrana beze zbroje", "2", "+2"]);
    expect(table?.rows[19]).toEqual(["20.", "+6", "Prvotní šampion", "Neomezeně", "+4"]);
    expect(table?.rows.every((row) => row.length === 5)).toBe(true);
  });

  it("keeps alignment, inline formatting and escaped pipes in their cells", () => {
    const table = parseRulesTable([
      "| Jméno | Hodnota | Popis |",
      "| :--- | ---: | :---: |",
      "| **Barbar** | 20 | A \\| B |",
    ]);
    expect(table).toEqual({
      head: ["Jméno", "Hodnota", "Popis"],
      align: ["left", "right", "center"],
      rows: [["**Barbar**", "20", "A | B"]],
    });
  });

  it("normalizes double-escaped newlines and leaves malformed tables intact", () => {
    const blocks = parseRulesBlocks("**Tabulka – Barbar**\\n\\n| Úroveň | Zuřivosti |\\n|---|---|\\n| 1. | 2 |");
    expect(blocks.map((block) => block.kind)).toEqual(["paragraph", "table"]);
    expect(normalizeRulesText("Pokus\\nDruhý řádek")).toBe("Pokus\nDruhý řádek");
    expect(parseRulesTable(["| A | B |", "| not a separator |"])).toBeNull();
    expect(parseRulesTable(["| one |"])).toBeNull();
  });

  it("pads incomplete rows rather than losing column positions or extra content", () => {
    expect(parseRulesTable([
      "| A | B | C |",
      "| --- | --- | --- |",
      "| x | y |",
      "| x | y | z | unexpected |",
    ])?.rows).toEqual([["x", "y", ""], ["x", "y", "z | unexpected"]]);
  });
});
