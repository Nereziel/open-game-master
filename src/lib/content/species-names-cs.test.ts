import { describe, expect, it } from "vitest";
import racesJson from "@/lib/srd/races.json";
import { CS_NAMES_BY_TABLE } from "./names-cs";
import { contentName } from "./names";
import { installCsTables } from "@/lib/i18n/cs-tables";
import { CZECH_BUNDLED_SPECIES_TRAITS, czechBundledSpeciesTrait } from "./species-traits-cs";

// The builder uses the English race name, while other pickers also pass an
// underscore/kebab-case id. Both paths must resolve to the same Czech label.
// Preserve original stored ids and never translate workshop/homebrew names.
const raceKey = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

describe("Czech labels for all bundled playable races", () => {
  const races = racesJson.races;
  const names = CS_NAMES_BY_TABLE.species;

  it("maps every bundled race name and id without missing entries", () => {
    expect(races).toHaveLength(46);
    for (const race of races) {
      const byName = names[raceKey(race.name)];
      const byId = names[raceKey(race.id)];
      expect(byName, `Missing Czech name for ${race.name}`).toBeTruthy();
      expect(byId, `Missing Czech ID alias for ${race.id}`).toBe(byName);
    }
  });

  it("provides a Czech title and actual rule explanation for every bundled racial trait", () => {
    const englishTraits = [...new Set(races.flatMap((race) => race.traits))];
    expect(englishTraits).toHaveLength(126);
    expect(Object.keys(CZECH_BUNDLED_SPECIES_TRAITS)).toHaveLength(126);
    for (const trait of englishTraits) {
      const translated = czechBundledSpeciesTrait(trait);
      expect(translated?.name, `Missing Czech racial trait title: ${trait}`).toBeTruthy();
      expect(translated?.description?.length, `Missing Czech explanation: ${trait}`).toBeGreaterThan(12);
      expect(/[\u00c0-\u017f]/u.test(`${translated?.name} ${translated?.description}`)).toBe(true);
    }
    expect(czechBundledSpeciesTrait("Homebrew boon")).toBeNull();
    expect(czechBundledSpeciesTrait("Dwarven Resilience (adv. vs poison)")?.name).toBe("Trpasličí odolnost");
    expect(czechBundledSpeciesTrait("Fey Ancestry (adv. vs charm, immune to magical sleep)")?.name).toBe("Vílí původ");
    expect(czechBundledSpeciesTrait("Stone's Endurance (reduce damage by 1d12 + CON, 1/short rest)")?.name).toBe("Kamenná výdrž");
  });

  it("translates every bundled background including its five 2014 variants", () => {
    installCsTables({ names: CS_NAMES_BY_TABLE });
    const variants = [
      ["Knight", "Rytíř"],
      ["Spy", "Špion"],
      ["Pirate", "Pirát"],
      ["Gladiator", "Gladiátor"],
      ["Guild Merchant", "Cechovní obchodník"],
    ] as const;
    for (const [english, czech] of variants) {
      expect(contentName("backgrounds", english, "cs")).toBe(czech);
      expect(contentName("backgrounds", english, "en")).toBe(english);
    }
  });

  it("distinguishes subraces and translates names in character creation", () => {
    installCsTables({ names: CS_NAMES_BY_TABLE });
    expect(contentName("species", "Dwarf (Hill)", "cs")).toBe("Kopcový trpaslík");
    expect(contentName("species", "Dwarf (Mountain)", "cs")).toBe("Horský trpaslík");
    expect(contentName("species", "Halfling (Lightfoot)", "cs")).toBe("Hobit tichošlápek");
    expect(contentName("species", "Halfling (Stout)", "cs")).toBe("Hobit pořízek");
    expect(contentName("species", { name: "Elf (Sea)", slug: "sea-elf" }, "cs")).toBe("Mořský elf");
    expect(contentName("species", { name: "Genasi (Fire)", slug: "fire-genasi" }, "cs")).toBe("Ohnivý genasi");
    expect(contentName("species", "Dwarf (Hill)", "en")).toBe("Dwarf (Hill)");
    expect(contentName("species", { name: "Dwarf (Hill)", source: "homebrew" }, "cs")).toBe("Dwarf (Hill)");
  });
});
