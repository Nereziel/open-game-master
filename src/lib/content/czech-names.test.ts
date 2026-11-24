import { describe, expect, it } from "vitest";
import { CS_NAMES_BY_TABLE } from "./names-cs";
import { contentName, classFeatureName, subclassName, speciesTraitName, backgroundFeatureLabel } from "./names";
import racesJson from "../srd/races.json";
import backgroundsJson from "../srd/backgrounds.json";
import classesJson from "../srd/classes.json";
import cyberpunk from "../classes/cyberpunk.json";
import darkFantasy from "../classes/dark-fantasy.json";
import horror from "../classes/horror.json";
import mystery from "../classes/mystery.json";
import postApocalyptic from "../classes/post-apocalyptic.json";
import steampunk from "../classes/steampunk.json";
import csCatalog from "../i18n/cs.json";
import frCatalog from "../i18n/fr.json";
import { installCsTables } from "../i18n/cs-tables";
import { installCatalog } from "../i18n/translate";
import { registerFeatureText } from "../classes/feature-text";
import { describeFeature } from "../help";
import darkFantasyFeatures from "../classes/dark-fantasy-features.json";

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

  it("covers bundled class IDs and exact description keys", () => {
    const messages: Record<string, string> = csCatalog.messages;
    const rows = [classesJson, cyberpunk, darkFantasy, horror, mystery, postApocalyptic, steampunk]
      .flatMap((data) => data.classes.map(({ id, name, blurb }) => ({ id, name, blurb })));
    for (const row of rows) {
      const key = row.id.replace(/_/g, "-");
      expect(CS_NAMES_BY_TABLE.classes[key], row.id).toBeTruthy();
      expect(contentName("classes", { slug: row.id, name: row.name }, "cs")).toBe(CS_NAMES_BY_TABLE.classes[key]);
      expect(messages[row.blurb], row.id).toBeTruthy();
      expect(messages[row.blurb], row.id).not.toBe(row.blurb);
    }
  });

  it("covers the actual bundled species traits and background features", () => {
    for (const race of racesJson.races) {
      for (const trait of race.traits) {
        expect(speciesTraitName(race.id, trait, "cs"), `${race.id}: ${trait}`).not.toBe(trait);
      }
    }
    for (const row of backgroundsJson.backgrounds) {
      expect(backgroundFeatureLabel(row.name, row.feature, "cs"), row.id).not.toBe(row.feature);
    }
  });

  it("localizes all Grave Knight rules through the actual sheet help resolver", () => {
    installCatalog("cs", csCatalog);
    registerFeatureText(darkFantasyFeatures);
    const id = "grave_knight";
    const table = darkFantasyFeatures.classes.grave_knight;
    const subclass = table.subclass.name;
    expect(subclassName(id, subclass, "cs")).toBe("Dvůr zvadlé růže");
    const messages: Record<string, string> = csCatalog.messages;
    for (const row of [...Object.values(table.levels), ...Object.values(table.subclass.levels)].flat()) {
      expect(classFeatureName(id, row.n, "cs"), row.n).not.toBe(row.n);
      expect(messages[row.d], row.n).toBeTruthy();
      expect(describeFeature(id, subclass, row.n, "cs"), row.n).toBe(messages[row.d]);
      expect(describeFeature(id, subclass, row.n, "en"), row.n).toBe(row.d);
    }
  });

  it("covers every message key carried by the French catalog", () => {
    const messages: Record<string, string> = csCatalog.messages;
    expect(Object.keys(frCatalog.messages).filter((key) => !Object.hasOwn(messages, key))).toEqual([]);
  });
});
