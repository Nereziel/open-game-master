import { describe, expect, it } from "vitest";
import csCatalog from "./cs.json";
import frCatalog from "./fr.json";
import { catalogInstalled, installCatalog, translate, translatePlural, type TranslateVars } from "./translate";
import { localeFromAcceptLanguage, localeOfServerLanguage, parseLocale, resolveLocale, serverLanguageOfLocale } from "./locale";
import { localeTag } from "../messages-logic";
import { GENRE_PRESETS, genrePresetFor } from "../genres";
import { portalCards, presetTheme, settingList, typeInPlan } from "../../app/create-campaign/portals";

installCatalog("cs", csCatalog);
installCatalog("fr", frCatalog);

describe("Czech locale following the upstream French catalog", () => {
  it("recognizes Czech in explicit settings, browser headers and cookies", () => {
    expect(parseLocale("cs")).toBe("cs");
    expect(localeFromAcceptLanguage("cs-CZ,cs;q=0.9,en;q=0.5")).toBe("cs");
    expect(resolveLocale({ cookieHeader: "odm_locale=cs", acceptLanguage: "fr-FR" })).toBe("cs");
    expect(localeTag("cs")).toBe("cs-CZ");
  });

  it("keeps UI tags and server-language names in the same registry", () => {
    for (const [locale, server, tag] of [["en", "english", "en-US"], ["fr", "french", "fr-FR"], ["cs", "czech", "cs-CZ"]] as const) {
      expect(localeTag(locale)).toBe(tag);
      expect(serverLanguageOfLocale(locale)).toBe(server);
      expect(localeOfServerLanguage(server)).toBe(locale === "en" ? null : locale);
    }
    expect(localeOfServerLanguage("italian")).toBeNull();
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

  it("uses the same catalog text for all eight genre cards and their help, without overwriting pack text", () => {
    const packDraft = { genre: "high_fantasy" as const, theme: "A world pack's own text", themeTouched: false, worldPack: "custom-pack" };
    for (const locale of ["en", "fr", "cs"] as const) {
      const t = (key: string, vars?: TranslateVars) => translate(locale, key, vars);
      const cards = portalCards("custom", t);
      expect(cards).toHaveLength(8);
      expect(settingList("custom", t)).toBe(cards.map((card) => `**${card.name}**: ${card.blurb}`).join("\n\n"));
      for (const [index, card] of cards.entries()) {
        const preset = GENRE_PRESETS[index];
        expect(card.name).toBe(t(preset.name, preset.id === "custom" ? { context: "creator.genre.custom" } : undefined));
        expect(card.blurb).toBe(t(preset.blurb));
      }
      expect(presetTheme(packDraft, locale)).toBe(packDraft);
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
