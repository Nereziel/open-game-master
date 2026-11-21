import { describe, expect, it } from "vitest";
import racesJson from "@/lib/srd/races.json";
import { CS_NAMES_BY_TABLE } from "./names-cs";
import { contentName } from "./names";
import { installCsTables } from "@/lib/i18n/cs-tables";

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
