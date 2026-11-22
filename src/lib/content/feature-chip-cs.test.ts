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

  it("uses a complete Czech Celestial Revelation explanation, including all three forms", () => {
    const longName = "Celestial Revelation (from 3rd level, a bonus action: Heavenly Wings, Inner Radiance or Necrotic Shroud for a minute, with extra damage equal to your proficiency bonus once a turn, 1/long rest)";
    const named = czechBundledSpeciesTrait(longName);
    expect(named?.name).toBe("Nebeské zjevení");
    for (const phrase of ["Nebeská křídla", "Vnitřní záře", "Nekrotický závoj", "1 minutu", "jednou za dlouhý odpočinek", "zdatnostnímu bonusu"]) {
      expect(named?.description).toContain(phrase);
    }
    expect(named?.description).not.toContain("Heavenly Wings");
    expect(czechBundledSpeciesTrait("Celestial Revelation")?.name).toBe("Nebeské zjevení");
    expect(czechBundledSpeciesTrait("Celestial Revelation (3rd level, wings or radiance)")?.description).toBe(named?.description);
  });

  it("shows a generic instruction suited to both traits and equipment", () => {
    const label = "Select the mark beside it for the full entry.";
    expect(translate("cs", label)).toBe("Podrobný popis otevřeš kliknutím na značku vedle názvu.");
    expect(translate("en", label)).toBe(label);
  });
});
