import { describe, expect, it } from "vitest";
import { CS_NAMES_BY_TABLE } from "./names-cs";
import authoredFeats from "../srd/authored-feats.json";
import classFeatures from "../srd/class-features.json";
import { RESOURCE_CS_FEATURE_NAME_LOOKUP } from "../srd/resource-feature-names-cs";
import { CZECH_SPELLS, CZECH_MONSTERS, CZECH_ITEMS } from "../rulebook/czech-terms";
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
import { registerFeatureText, type FeaturesFile } from "../classes/feature-text";
import { describeFeature } from "../help";
import darkFantasyFeatures from "../classes/dark-fantasy-features.json";
import cyberpunkFeatures from "../classes/cyberpunk-features.json";
import horrorFeatures from "../classes/horror-features.json";
import mysteryFeatures from "../classes/mystery-features.json";
import postApocalypticFeatures from "../classes/post-apocalyptic-features.json";
import steampunkFeatures from "../classes/steampunk-features.json";

installCsTables({ names: CS_NAMES_BY_TABLE, guidance: {} });

describe("Czech content names through upstream helpers", () => {
  it("translates canonical rulebook names without changing the original data", () => {
    expect(contentName("classes", "Fighter", "cs")).toBe("Bojovník");
    expect(contentName("classes", "Fighter", "en")).toBe("Fighter");
  });

  it("keeps the 2014 Czech spell and monster labels consistent with the rulebook", () => {
    for (const [slug, title, expected] of [
      ["eldritch-blast", "Eldritch Blast", "Tajemný výšleh"],
      ["hellish-rebuke", "Hellish Rebuke", "Pekelné pokárání"],
      ["entangle", "Entangle", "Zapletení"],
      ["true-seeing", "True Seeing", "Pravdivé vidění"],
      ["arcanists-magic-aura", "Arcanist's Magic Aura", "Nystulova magická aura"],
    ]) {
      expect(CS_NAMES_BY_TABLE.spells[slug]).toBe(expected);
      expect(CZECH_SPELLS[title]).toBe(expected);
    }
    expect(CS_NAMES_BY_TABLE.monsters["frost-giant"]).toBe("Mrazivý obr");
    expect(CZECH_MONSTERS["Frost Giant"]).toBe("Mrazivý obr");
    for (const [slug, title, expected] of [
      ["drider", "Drider", "Dravouk"],
      ["glabrezu", "Glabrezu", "Glabrez"],
      ["grimlock", "Grimlock", "Divous"],
      ["guardian-naga", "Guardian Naga", "Strážný nága"],
      ["spirit-naga", "Spirit Naga", "Přízračný nága"],
      ["lizard", "Lizard", "Ještěr"],
    ]) {
      expect(CS_NAMES_BY_TABLE.monsters[slug]).toBe(expected);
      expect(CZECH_MONSTERS[title]).toBe(expected);
    }
    for (const [slug, title, expected] of [
      ["sphere-of-annihilation", "Sphere of Annihilation", "Koule anihilace"],
      ["talisman-of-the-sphere", "Talisman of the Sphere", "Talisman koule"],
    ]) {
      expect(CS_NAMES_BY_TABLE.magicitems[slug]).toBe(expected);
      expect(CZECH_ITEMS[title]).toBe(expected);
    }
    expect(CS_NAMES_BY_TABLE.conditions.grappled).toBe("Uchvácený");
    expect(CS_NAMES_BY_TABLE.conditions.restrained).toBe("Zadržený");
    expect(CS_NAMES_BY_TABLE.conditions.stunned).toBe("Ochromený");
    expect(CS_NAMES_BY_TABLE.conditions.incapacitated).toBe("Neschopný");
  });

  it("covers all authored feats without changing the English names", () => {
    for (const feat of authoredFeats.feats) {
      expect(contentName("feats", feat.name, "cs"), feat.name).toBeTruthy();
      expect(contentName("feats", feat.name, "cs"), feat.name).not.toBe(feat.name);
      expect(contentName("feats", feat.name, "en")).toBe(feat.name);
    }
  });

  it("covers every bundled core class feature name", () => {
    for (const [id, row] of Object.entries(classFeatures.classes)) {
      const names = [...Object.values(row.levels).flat(), ...row.subclasses.flatMap(s => Object.values(s.levels).flat())];
      for (const name of names) {
        expect(classFeatureName(id, name, "cs"), id + ": " + name).toBeTruthy();
        expect(classFeatureName(id, name, "cs"), id + ": " + name).not.toBe(name);
        expect(classFeatureName(id, name, "en")).toBe(name);
      }
    }
    expect(classFeatureName("rogue", "Fast Hands", "cs")).toBe("Rychlé ruce");
  });

  it("keeps shared resource and class feature labels consistent", () => {
    expect(RESOURCE_CS_FEATURE_NAME_LOOKUP["grave-grip"]).toBe(classFeatureName("grave_knight", "Grave Grip", "cs"));
    expect(RESOURCE_CS_FEATURE_NAME_LOOKUP["adrenal-override"]).toBe(classFeatureName("street_samurai", "Adrenal Override", "cs"));
    expect(RESOURCE_CS_FEATURE_NAME_LOOKUP["root-access"]).toBe(classFeatureName("netrunner", "Root Access", "cs"));
    expect(RESOURCE_CS_FEATURE_NAME_LOOKUP["difference-engine-mind"]).toBe(classFeatureName("machinist", "Difference Engine Mind", "cs"));
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

  it("localizes every bundled genre class rule and subclass through the sheet help resolver", () => {
    installCatalog("cs", csCatalog);
    const catalogs: FeaturesFile[] = [darkFantasyFeatures, cyberpunkFeatures, horrorFeatures, mysteryFeatures, postApocalypticFeatures, steampunkFeatures];
    const messages: Record<string, string> = csCatalog.messages;
    expect(subclassName("grave_knight", "Court of the Wilted Rose", "cs")).toBe("Dvůr zvadlé růže");
    let classes = 0;
    let features = 0;
    for (const catalog of catalogs) {
      registerFeatureText(catalog);
      for (const [id, table] of Object.entries(catalog.classes)) {
        classes += 1;
        const subclass = table.subclass.name;
        expect(subclassName(id, subclass, "cs"), id).not.toBe(subclass);
        for (const row of [...Object.values(table.levels), ...Object.values(table.subclass.levels)].flat()) {
          features += 1;
          expect(classFeatureName(id, row.n, "cs"), row.n).not.toBe(row.n);
          expect(messages[row.d], row.n).toBeTruthy();
          expect(describeFeature(id, subclass, row.n, "cs"), row.n).toBe(messages[row.d]);
          expect(describeFeature(id, subclass, row.n, "en"), row.n).toBe(row.d);
        }
      }
    }
    expect(classes).toBe(36);
    expect(features).toBe(733);
  });

  it("covers every message key carried by the French catalog", () => {
    const messages: Record<string, string> = csCatalog.messages;
    expect(Object.keys(frCatalog.messages).filter((key) => !Object.hasOwn(messages, key))).toEqual([]);
  });
});
