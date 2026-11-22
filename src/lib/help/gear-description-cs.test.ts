import { describe, expect, it } from "vitest";
import { CANONICAL_GEAR_NAMES_CS, canonicalGearDescriptionCs } from "./gear-description-cs";
import { itemDescriptionCs } from "./item-detail-cs";
import { contentName } from "@/lib/content/names";
import backgrounds from "@/lib/srd/backgrounds.json";

describe("Czech SRD equipment descriptions", () => {
  it("has a Czech detail fallback for every background starting item, including incense blocks and vestments", () => {
    for (const background of backgrounds.backgrounds) {
      for (const name of background.equipment) {
        if (/^\\d+ gp$/.test(name)) continue; // Currency is stored in the purse.
        const description = itemDescriptionCs(name, null, "cs");
        expect(description, `${background.id}: ${name} has no Czech item description`).toBeTruthy();
        expect(description?.trim().length).toBeGreaterThan(12);
      }
    }
    expect(itemDescriptionCs("Block of Incense", null, "cs")).toMatch(/kadidla/);
    expect(itemDescriptionCs("Kadidlové kostky", null, "cs")).toMatch(/kadidla/);
    expect(itemDescriptionCs("Block of Incense", null, "en")).toBeNull();
    expect(itemDescriptionCs("Vestments", null, "cs")).toMatch(/Obřadní roucho/);
    expect(itemDescriptionCs("Obřadní roucho", null, "cs")).toMatch(/Obřadní roucho/);
  });

  it("shows the Acolyte incense and censer with Czech names and readable item details", () => {
    expect(contentName("items", "5 sticks of incense", "cs")).toBe("5 vonných tyčinek");
    expect(contentName("items", "5 sticks of incense", "en")).toBe("5 sticks of incense");
    expect(itemDescriptionCs("5 sticks of incense", null, "cs")).toMatch(/vonných tyčinek/);
    expect(itemDescriptionCs("Censer", null, "cs")).toMatch(/Kadidelnice/);
    expect(itemDescriptionCs("Kadidelnice", null, "cs")).toMatch(/Kadidelnice/);
    expect(itemDescriptionCs("Censer", null, "en")).toBeNull();
  });

  it("has a Czech description for every mapped SRD gear, armor and weapon", () => {
    for (const name of CANONICAL_GEAR_NAMES_CS) {
      const description = canonicalGearDescriptionCs(name);
      expect(description, `Missing Czech description for ${name}`).toBeTruthy();
      expect(description?.trim().length).toBeGreaterThan(12);
    }
  });

  it("uses the full chapter rules, not a short summary, for special equipment", () => {
    expect(canonicalGearDescriptionCs("Ball bearings (bag of 1,000)")).toMatch(/SO 10/);
    expect(canonicalGearDescriptionCs("Caltrops (bag of 20)")).toMatch(/SO 15/);
    expect(canonicalGearDescriptionCs("Holy water (flask)")).toMatch(/2d6/);
    expect(canonicalGearDescriptionCs("Climber's kit")).toMatch(/25 stop/);
    expect(canonicalGearDescriptionCs("Rope, silk (50 feet)")).toMatch(/SO 17/);
    expect(canonicalGearDescriptionCs("Burglar's Pack")).toBeTruthy();
  });

  it("shows Czech weapon and armor text without replacing English data", () => {
    expect(canonicalGearDescriptionCs("Longsword")).toMatch(/1d8/);
    expect(canonicalGearDescriptionCs("Plate")).toMatch(/plát/iu);
    expect(canonicalGearDescriptionCs("Shield")).toMatch(/\+2/);
    expect(canonicalGearDescriptionCs("Net")).toMatch(/SO 10/);
    expect(itemDescriptionCs("Caltrops (bag of 20)", "Any creature entering the area makes a saving throw.", "cs"))
      .toMatch(/SO 15/);
    expect(itemDescriptionCs("Caltrops (bag of 20)", "Any creature entering the area makes a saving throw.", "en"))
      .toMatch(/Any creature/);
  });

  it("preserves user-authored Czech item descriptions", () => {
    expect(itemDescriptionCs("Book", "Tato kniha obsahuje tajné poznámky.", "cs"))
      .toBe("Tato kniha obsahuje tajné poznámky.");
  });
});
