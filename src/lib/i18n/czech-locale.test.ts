import { describe, expect, it } from "vitest";
import csCatalog from "./cs.json";
import frCatalog from "./fr.json";
import { catalogInstalled, installCatalog, translate, translatePlural } from "./translate";
import { localeFromAcceptLanguage, parseLocale, resolveLocale } from "./locale";
import { localeTag } from "../messages-logic";
import { GENRE_PRESETS, genrePresetFor } from "../genres";
import { presetTheme, typeInPlan } from "../../app/create-campaign/portals";

installCatalog("cs", csCatalog);
installCatalog("fr", frCatalog);

describe("Czech locale following the upstream French catalog", () => {
  it("recognizes Czech in explicit settings, browser headers and cookies", () => {
    expect(parseLocale("cs")).toBe("cs");
    expect(localeFromAcceptLanguage("cs-CZ,cs;q=0.9,en;q=0.5")).toBe("cs");
    expect(resolveLocale({ cookieHeader: "odm_locale=cs", acceptLanguage: "fr-FR" })).toBe("cs");
    expect(localeTag("cs")).toBe("cs-CZ");
  });

  it("installs the original Czech gettext catalog", () => {
    expect(catalogInstalled("cs")).toBe(true);
    expect(translate("cs", "Language")).toBe("Jazyk");
    expect(translate("cs", "Cancel")).toBe("Zrušit");
    expect(translate("cs", "A missing translation")).toBe("A missing translation");
  });

  it("uses the same Czech combat labels as the 2014 rulebook", () => {
    expect(translate("cs", "AC")).toBe("OČ");
    expect(translate("cs", "Armor class")).toBe("Obranné číslo");
    expect(translate("cs", "Grappled")).toBe("uchvácený");
    expect(translate("cs", "Prone")).toBe("ležící");
    expect(translate("cs", "Exhaustion")).toBe("Únava");
    expect(translate("cs", "force")).toBe("silové");
    expect(translate("en", "AC")).toBe("AC");
  });

  it("preserves the upstream French translation catalog", () => {
    expect(translate("fr", "Language")).toBe("Langue");
    expect(translate("fr", "Cancel")).toBe("Annuler");
    expect(translate("en", "Language")).toBe("Language");
  });

  it("uses all three Czech plural forms without changing English", () => {
    const one = "{count} item";
    const many = "{count} items";
    expect(translatePlural("cs", one, many, { count: 1 })).toBe("1 předmět");
    expect(translatePlural("cs", one, many, { count: 3 })).toBe("3 předměty");
    expect(translatePlural("cs", one, many, { count: 5 })).toBe("5 předmětů");
    expect(translatePlural("cs", one, many, { count: 0 })).toBe("0 předmětů");
    expect(translatePlural("en", one, many, { count: 5 })).toBe("5 items");
  });
});


describe("Czech campaign theme presets", () => {
  it("localizes every built-in genre without changing prompt fields or French and English", () => {
    for (const preset of GENRE_PRESETS) {
      expect(genrePresetFor(preset.id, "en")).toBe(preset);
      if (preset.id === "custom") {
        expect(genrePresetFor(preset.id, "cs")).toBe(preset);
        continue;
      }
      expect(preset.defaultThemeByLocale?.cs).toBeTruthy();
      expect(genrePresetFor(preset.id, "cs")).toEqual({ ...preset, defaultTheme: preset.defaultThemeByLocale?.cs });
      expect(genrePresetFor(preset.id, "fr")).toEqual({ ...preset, defaultTheme: preset.defaultThemeByLocale?.fr });
      expect(genrePresetFor(preset.id, "cs").defaultTheme).not.toBe(preset.defaultTheme);
    }
  });

  it("uses Czech on arrival and genre selection but preserves manually edited themes", () => {
    const draft = { genre: "high_fantasy" as const, theme: "", themeTouched: false, worldPack: "" };
    expect(presetTheme(draft, "cs").theme).toBe("Říše s bohatou historií, plná království, divokého pohraničí a pohřbených ruin");
    expect(typeInPlan(draft, "horror", "cs")?.text).toBe("Odloučené místo, kde se probudilo cosi prastarého a hladového");
    const typed = { ...draft, theme: "Můj svět", themeTouched: true };
    expect(presetTheme(typed, "cs")).toBe(typed);
    expect(typeInPlan(typed, "horror", "cs")).toBeNull();
  });
});
