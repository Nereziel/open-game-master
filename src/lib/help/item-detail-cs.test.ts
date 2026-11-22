import { describe, expect, it } from "vitest";
import { itemDescriptionCs, itemDetailCs, itemRangeCs, itemWeightCs } from "./item-detail-cs";

describe("Czech item details", () => {
  it("fully localizes the longbow's category, properties and damage text", () => {
    expect(itemDetailCs("Martial ranged weapon", "cs")).toBe("Vojenská zbraň na dálku");
    expect(itemDetailCs("Ammunition (range 150/600)", "cs")).toBe("Střelná (dostřel 150/600)");
    expect(itemDetailCs("Heavy", "cs")).toBe("Těžká");
    expect(itemDetailCs("Reach", "cs")).toBe("Dlouhá");
    expect(itemDetailCs("Versatile", "cs")).toBe("Jeden a půlruční");
    expect(itemDetailCs("Loading", "cs")).toBe("Nabíjecí");
    expect(itemDetailCs("Two-handed", "cs")).toBe("Obouruční");
    expect(itemDetailCs("Piercing", "cs")).toBe("Bodné");
    expect(itemDetailCs("Needs both hands to attack with, so no shield or second weapon.", "cs"))
      .toMatch(/obě ruce/);
    expect(itemRangeCs("150/600 ft.", "cs")).toBe("150/600 stop");
    expect(itemWeightCs("2 lb.", "cs")).toBe("2 libry");
  });

  it("localizes common-clothes metadata and description", () => {
    expect(itemDetailCs("Adventuring gear", "cs")).toBe("Dobrodružná výbava");
    expect(itemDetailCs("Weight", "cs")).toBe("Hmotnost");
    expect(itemDetailCs("Value", "cs")).toBe("Cena");
    expect(itemDetailCs("Description", "cs")).toBe("Popis");
    expect(itemDetailCs("Common clothes.", "cs")).toBe("Obyčejné oblečení.");
    expect(itemDetailCs("Slashing", "cs")).toBe("Sečné");
    expect(itemDetailCs("Bludgeoning", "cs")).toBe("Drtivé");
  });

  it("gives common SRD items Czech descriptions without altering English or custom Czech text", () => {
    expect(itemDescriptionCs("Book", "A book can contain poems or histories.", "cs"))
      .toContain("Kniha může obsahovat");
    expect(itemDescriptionCs("Longsword", "This melee weapon is versatile.", "cs"))
      .toContain("1d8");
    expect(itemDescriptionCs("Shield", "A shield is carried in one hand.", "cs"))
      .toContain("OČ");
    expect(itemDescriptionCs("Book", "A book can contain poems or histories.", "en"))
      .toBe("A book can contain poems or histories.");
    expect(itemDescriptionCs("Book", null, "cs")).toContain("Kniha může obsahovat");
    expect(itemDescriptionCs("Book", null, "en")).toBeNull();
    expect(itemDescriptionCs("Book", "Vlastní tajemný rukopis.", "cs"))
      .toBe("Vlastní tajemný rukopis.");
  });

  it("retains all English display strings and does not change numeric rules", () => {
    expect(itemDetailCs("Ammunition (range 150/600)", "en")).toBe("Ammunition (range 150/600)");
    expect(itemDetailCs("Piercing", "en")).toBe("Piercing");
    expect(itemDetailCs("1d8", "cs")).toBe("1d8");
    expect(itemRangeCs("150/600 ft.", "en")).toBe("150/600 ft.");
    expect(itemWeightCs("2 lb.", "en")).toBe("2 lb.");
  });
});
