import { describe, expect, it } from "vitest";
import { fightingStyleDisplayName, optionDisplayName, optionReqDisplay, optionOfferName } from "./option-labels";
import { classFeatureName, contentName } from "./names";
import { CS_NAMES_BY_TABLE } from "./names-cs";
import { FR_NAMES_BY_TABLE } from "./names-fr";
import cs from "../i18n/cs.json";
import fr from "../i18n/fr.json";
import { installLocalizedTables } from "../i18n/localized-tables";
import { installCatalog, translate } from "../i18n/translate";
import { FIGHTING_STYLES, fightingStyleFeatureName } from "../srd/feature-effects";
import { optionFeatureName, optionKindRule, optionReqProblem, optionSourceClassId, optionsOfKind } from "../srd/options";

describe("published option presentation", () => {
  it("reuses source class names, translates the exact prefixed key and preserves canonical picks", () => {
    installLocalizedTables("cs", { names: CS_NAMES_BY_TABLE });
    installLocalizedTables("fr", { names: FR_NAMES_BY_TABLE });
    installCatalog("cs", cs);
    installCatalog("fr", fr);
    for (const kind of ["pact_boon", "metamagic", "maneuver", "invocation", "infusion", "rune", "arcane_shot", "discipline", "hunters_prey", "defensive_tactics", "hunter_multiattack", "superior_hunters_defense", "dragon_ancestor", "favored_enemy", "favored_terrain", "land_circle", "totem_spirit", "totem_aspect", "totem_attunement", "storm_environment", "giant_cantrip", "arcane_archer_cantrip", "divine_affinity", "genie_kind", "animal_lord", "gadget"] as const) {
      for (const option of optionsOfKind(kind)) {
        const original = JSON.stringify(option);
        expect(optionDisplayName(option, "en")).toBe(option.n);
        for (const locale of ["cs", "fr"] as const) {
          const feature = optionFeatureName(option.k, option.n);
          const source = classFeatureName(optionSourceClassId(option.k), feature, locale);
          const catalog = locale === "cs" ? cs : fr;
          const messages: Record<string, string> = catalog.messages;
          expect(source !== feature || Object.hasOwn(messages, feature), option.n).toBe(true);
          expect(optionDisplayName(option, locale), option.n).toBe(source !== feature ? source : messages[feature]);
          if (option.req) expect(messages[option.req], option.req).toBeTruthy();
          expect(translate(locale, option.d), option.n).not.toBe(option.d);
        }
        expect(JSON.stringify(option)).toBe(original);
      }
    }
    const invocation = optionsOfKind("invocation").find((option) => option.n === "Agonizing Blast")!;
    expect(optionDisplayName(invocation, "cs")).toBe(classFeatureName("warlock", optionFeatureName(invocation.k, invocation.n), "cs"));
    expect(optionSourceClassId("maneuver")).toBe("fighter");
    expect(optionDisplayName({ k: "gadget", n: "Untranslated fixture" }, "cs")).toBe("Untranslated fixture");
  });
  it("uses bundled spell names and the same translated rule for every dynamic spell pick", () => {
    for (const kind of ["spell_mastery_1", "spell_mastery_2", "signature_spell", "legerdemain_cantrip", "legerdemain_spell", "legerdemain_spell_2"] as const) {
      const rule = optionKindRule(kind)!;
      const options = optionsOfKind(kind);
      expect(options.length).toBeGreaterThan(0);
      for (const locale of ["en", "cs", "fr"] as const) {
        const catalog = locale === "cs" ? cs : fr;
        const messages: Record<string, string> = catalog.messages;
        if (locale !== "en") expect(messages[rule]).toBeTruthy();
        for (const option of options) {
          const original = JSON.stringify(option);
          expect(option.d).toBe(rule);
          expect(optionDisplayName(option, locale)).toBe(contentName("spells", option.n, locale));
          expect(translate(locale, option.d)).toBe(locale === "en" ? rule : messages[rule]);
          expect(JSON.stringify(option)).toBe(original);
        }
      }
    }
  });
  it("localizes prerequisite refusals without changing their decisions or English contract", () => {
    const cases = [
      { option: { k: "discipline", n: "Breath of Winter", req: "level 17" } as const, english: "Breath of Winter needs monk level 17." },
      { option: { k: "invocation", n: "Improved Pact Weapon", req: "Pact of the Blade" } as const, english: "Improved Pact Weapon needs the Pact of the Blade." },
      { option: { k: "invocation", n: "Agonizing Blast", req: "Eldritch Blast cantrip" } as const, english: "Agonizing Blast needs the Eldritch Blast cantrip." },
    ];
    const missing = { classLevel: () => 1, features: [], cantrips: [] };
    const met = { classLevel: () => 20, features: [{ name: "Pact Boon: Pact of the Blade" }], cantrips: ["Eldritch Blast"] };
    for (const { option, english } of cases) {
      expect(optionReqProblem(option, missing)).toBe(english);
      expect(optionReqProblem(option, met)).toBeNull();
      for (const locale of ["cs", "fr"] as const) {
        const describe = (issue: Parameters<typeof optionReqDisplay>[1]) => optionReqDisplay(option, issue, locale);
        const refusal = optionReqProblem(option, missing, { describe });
        expect(refusal).toBeTruthy();
        expect(refusal).not.toBe(english);
        expect(refusal).toContain(optionDisplayName(option, locale));
        expect(refusal).not.toMatch(/\{\w+\}/);
        expect(optionReqProblem(option, met, { describe })).toBeNull();
      }
    }
    expect(optionReqProblem(cases[2].option, missing, { cantripsLater: true })).toBeNull();
  });
  it("localizes only a source-identified option offer, preserving custom names and keys", () => {
    const name = "Storm Aura (Sea)";
    const offer = { shown: { [name]: "Sea" }, optionKind: "storm_environment" as const };
    const original = JSON.stringify(offer);
    for (const locale of ["en", "cs", "fr"] as const) {
      expect(optionOfferName(offer, name, locale)).toBe(optionDisplayName({ k: "storm_environment", n: "Sea" }, locale));
      expect(optionOfferName({ shown: offer.shown }, name, locale)).toBe("Sea");
      expect(optionOfferName(offer, "Custom option", locale)).toBe("Custom option");
    }
    expect(JSON.stringify(offer)).toBe(original);
  });
  it("reuses canonical fighting style names and translates all six card descriptions", () => {
    expect(FIGHTING_STYLES).toHaveLength(6);
    for (const style of FIGHTING_STYLES) {
      const original = JSON.stringify(style);
      expect(fightingStyleDisplayName(style, "en")).toBe(style.name);
      for (const locale of ["cs", "fr"] as const) {
        const feature = fightingStyleFeatureName(style.id);
        const label = fightingStyleDisplayName(style, locale);
        expect(label).toBe(classFeatureName("fighter", feature, locale));
        expect(label).toBe(classFeatureName("paladin", feature, locale));
        expect(label).toBe(classFeatureName("ranger", feature, locale));
        expect(translate(locale, style.description)).not.toBe(style.description);
      }
      expect(JSON.stringify(style)).toBe(original);
    }
  });
});
