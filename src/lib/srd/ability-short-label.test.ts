import { describe, expect, it } from "vitest";
import { abilityShortLabel } from "./ability-short-label";

describe("shared ability abbreviations", () => {
  const ids = ["str", "dex", "con", "int", "wis", "cha"] as const;

  it("shows canonical Czech codes without changing internal IDs", () => {
    expect(ids.map((id) => abilityShortLabel(id, "cs"))).toEqual([
      "SÍL", "OBR", "ODL", "INT", "MDR", "CHA",
    ]);
    expect(abilityShortLabel("DEX", "cs")).toBe("OBR");
  });

  it("preserves English codes and French-specific abbreviations", () => {
    expect(ids.map((id) => abilityShortLabel(id, "en"))).toEqual([
      "STR", "DEX", "CON", "INT", "WIS", "CHA",
    ]);
    expect(abilityShortLabel("str", "fr")).toBe("FOR");
    expect(abilityShortLabel("wis", "fr")).toBe("SAG");
  });

  it("does not translate unknown homebrew ability identifiers", () => {
    expect(abilityShortLabel("luck", "cs")).toBe("LUCK");
  });
});
