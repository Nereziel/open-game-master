import { describe, expect, it } from "vitest";
import { czechBundledSpeciesTrait } from "./species-traits-cs";
import { translate } from "@/lib/i18n/translate";

describe("Czech racial trait labels on character sheets", () => {
  it("translates Darkvision and its range without exposing the English shorthand", () => {
    const trait = czechBundledSpeciesTrait("Darkvision 60 ft");
    expect(trait?.name).toBe("Vidění ve tmě");
    expect(trait?.description).toContain("60 stop");
    expect(trait?.description).not.toContain(" ft");
  });

  it("also translates superior darkvision at 120 feet", () => {
    expect(czechBundledSpeciesTrait("Superior Darkvision 120 ft")?.name).toBe("Lepší vidění ve tmě");
    expect(czechBundledSpeciesTrait("Superior Darkvision 120 ft")?.description).toContain("120 stop");
  });

  it("shows a generic instruction suited to both traits and equipment", () => {
    const label = "Select the mark beside it for the full entry.";
    expect(translate("cs", label)).toBe("Podrobný popis otevřeš kliknutím na značku vedle názvu.");
    expect(translate("en", label)).toBe(label);
  });
});
