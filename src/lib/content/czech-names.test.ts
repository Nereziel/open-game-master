import { describe, expect, it } from "vitest";
import { CS_NAMES_BY_TABLE } from "./names-cs";
import { contentName, classFeatureName, subclassName } from "./names";
import { installCsTables } from "../i18n/cs-tables";

installCsTables({ names: CS_NAMES_BY_TABLE, guidance: {} });

describe("Czech content names through upstream helpers", () => {
  it("translates canonical rulebook names without changing the original data", () => {
    expect(contentName("classes", "Fighter", "cs")).toBe("Bojovník");
    expect(contentName("classes", "Fighter", "en")).toBe("Fighter");
  });

  it("keeps homebrew names and unknown entries intact", () => {
    expect(contentName("classes", { name: "Fighter", source: "homebrew" }, "cs")).toBe("Fighter");
    expect(contentName("classes", "A Custom Class", "cs")).toBe("A Custom Class");
  });

  it("supports Czech names for bundled subclasses", () => {
    expect(subclassName("fighter", "Champion", "cs")).toBe("Šampion");
    expect(classFeatureName("fighter", "A Custom Feature", "cs")).toBe("A Custom Feature");
  });
  it("uses the existing name tables for supplemental books without changing English or homebrew", () => {
    const examples = [
      ["weapons", "Axespear", "Sekerokopí"],
      ["armor", "Kite shield", "Kapkovitý štít"],
      ["magicitems", "Argent Mantle", "Stříbrný plášť"],
      ["magicitems", "Aberrant Agreement", "Aberantní úmluva"],
      ["spells", "Ambush Chute", "Přepadová šachta"],
      ["spells", "Abhorrent Apparition", "Odpudivý přízrak"],
      ["feats", "Diehard", "Nezdolný"],
    ] as const;
    for (const [table, name, expected] of examples) {
      expect(contentName(table, { name, source: "open5e" }, "cs")).toBe(expected);
      expect(contentName(table, name, "en")).toBe(name);
      expect(contentName(table, { name, source: "homebrew" }, "cs")).toBe(name);
    }
    expect(contentName("items", "Axespear", "cs")).toBe("Sekerokopí");
    expect(contentName("items", "Aberrant Agreement", "cs")).toBe("Aberantní úmluva");
  });
});
