import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { galleryPortraits, hasGalleryClass, hasGalleryRace } from "./portrait-gallery";

const races = [
  { id: "high_elf", name: "High Elf" },
  { id: "human", name: "Human" },
  { id: "variant_human", name: "Variant Human" },
  { id: "minotaur", name: "Minotaur" },
  { id: "custom_species", name: "Custom Species" },
];
const classes = [
  { id: "wizard", name: "Wizard" },
  { id: "fighter", name: "Fighter" },
  { id: "grave_knight", name: "Grave Knight" },
  { id: "custom_class", name: "Custom Class" },
];

describe("built-in character portrait gallery", () => {
  it("starts with both the character's race and class, in their chosen gender", () => {
    const found = galleryPortraits(races, classes, { raceId: "high_elf", classId: "wizard", gender: "Female" });
    expect(found.map((portrait) => portrait.src)).toEqual([
      "/assets/placeholders/character-race/elf-feminine.webp",
      "/assets/placeholders/character-class/wizard-feminine.webp",
    ]);
    expect(found.map((portrait) => portrait.kind)).toEqual(["race", "class"]);
  });

  it("supports a race-only filter without unrelated class portraits", () => {
    const found = galleryPortraits(races, classes, { raceId: "minotaur", classId: "", gender: "Nonbinary" });
    expect(found.map((portrait) => portrait.src)).toEqual([
      "/assets/placeholders/character-race/minotaur-neutral.webp",
    ]);
  });

  it("supports a class-only filter including the authored genre classes", () => {
    const found = galleryPortraits(races, classes, { raceId: "", classId: "grave_knight", gender: "Male" });
    expect(found.map((portrait) => portrait.src)).toEqual([
      "/assets/placeholders/character-class/grave_knight-masculine.webp",
    ]);
  });

  it("offers all gender variants and deduplicates races with the same plate", () => {
    const found = galleryPortraits(races, classes, { raceId: "", classId: "", gender: "" });
    expect(found.filter((portrait) => portrait.src.includes("/character-race/human-"))).toHaveLength(3);
    expect(found.some((portrait) => portrait.src.includes("/character-class/grave_knight-neutral.webp"))).toBe(true);
    expect(found.some((portrait) => portrait.name === "Custom Species" || portrait.name === "Custom Class")).toBe(false);
    expect(new Set(found.map((portrait) => portrait.src)).size).toBe(found.length);
  });

  it("uses only real, bundled gallery plates and refuses unsupported ids", () => {
    expect(hasGalleryRace("custom_species")).toBe(false);
    expect(hasGalleryClass("custom_class")).toBe(false);
    const found = galleryPortraits(races, classes, { raceId: "", classId: "", gender: "" });
    for (const portrait of found) {
      expect(portrait.src.startsWith("/assets/placeholders/character-")).toBe(true);
      expect(existsSync(path.join(process.cwd(), "public", portrait.src.slice(1))), portrait.src).toBe(true);
    }
  });
});
