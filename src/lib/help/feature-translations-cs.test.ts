import { describe, expect, it } from "vitest";
import srdFeatures from "./srd-features.json";
import { SRD_FEATURE_DESCRIPTIONS_CS } from "./srd-feature-descriptions-cs";
import { describeFeature } from "./index";
import { firstSentence } from "./rules-text";
import { czechBundledSpeciesTrait } from "@/lib/content/species-traits-cs";
import races from "@/lib/srd/races.json";

describe("Czech feature and trait descriptions", () => {
  it("has original Czech explanatory text for every SRD feature fallback", () => {
    for (const english of Object.keys(srdFeatures.features)) {
      const czech = SRD_FEATURE_DESCRIPTIONS_CS[english];
      expect(czech, `Czech help text missing for ${english}`).toBeTruthy();
      expect(czech.length).toBeGreaterThan(20);
    }
  });

  it("has a Czech label and description for all bundled racial traits", () => {
    for (const race of races.races) {
      for (const trait of race.traits) {
        const czech = czechBundledSpeciesTrait(trait);
        expect(czech, `Czech trait missing for ${trait}`).toBeTruthy();
        expect(czech?.name).toBeTruthy();
        expect(czech?.description).toBeTruthy();
      }
    }
  });

  it("resolves the Light Bearer and Celestial Revelation character chips in Czech", () => {
    expect(czechBundledSpeciesTrait("Light Bearer (the light cantrip)"))
      .toEqual({ name: "Nositel světla", description: "Znáš trik Světlo." });
    const revelation = czechBundledSpeciesTrait("Celestial Revelation (from 3rd level, a bonus action: Heavenly Wings, Inner Radiance or Necrotic Shroud for a minute, with extra damage equal to your proficiency bonus once a turn, 1/long rest)");
    expect(revelation?.name).toBe("Nebeské zjevení");
    expect(revelation?.description).toMatch(/^Od 3\. úrovně/);
    expect(revelation?.description).toContain("Nebeská křídla");
    expect(firstSentence(revelation?.description)).toMatch(/^Od 3\. úrovně můžeš/);
    expect(firstSentence(revelation?.description)).not.toBe("Od 3.");
  });

  it("shows translated SRD feature help while preserving English mode", () => {
    expect(describeFeature("fighter", "Champion", "Indomitable (2 uses)", "cs")).toMatch(/Dvakrát za dlouhý odpočinek/);
    expect(describeFeature("fighter", "Champion", "Indomitable (2 uses)", "en")).toMatch(/twice per long rest/i);
    expect(describeFeature("druid", "", "Timeless Body", "cs")).toMatch(/desetkrát pomaleji/);
    expect(describeFeature("monk", "", "Timeless Body", "cs")).toMatch(/nepotřebuješ jídlo/);
  });
});
