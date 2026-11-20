import { describe, expect, it } from "vitest";
import catalog from "./cs.json";
import { installCatalog, translate, translatePlural } from "./translate";
import { localeFromAcceptLanguage, localeOfServerLanguage, parseLocale, resolveLocale } from "./locale";
import { localeTag, pluralCategory } from "../messages-logic";
import { CS_NAMES_BY_TABLE } from "../content/names-cs";
import { FR_NAMES_BY_TABLE } from "../content/names-fr";
import { installCsTables } from "./cs-tables";
import { contentName, classFeatureName, subclassName } from "../content/names";
import { damageTypeWord, damageWords } from "../dm/damage-logic";
import { deviceSpeechLanguage, whisperLanguageCode } from "../stt-logic";


installCatalog("cs", catalog);
installCsTables({ names: CS_NAMES_BY_TABLE });

describe("Czech localization", () => {
  it("selects Czech in settings and HTTP requests", () => {
    expect(parseLocale("cs")).toBe("cs");
    expect(localeOfServerLanguage("czech")).toBe("cs");
    expect(localeFromAcceptLanguage("cs-CZ,fr;q=0.9,en;q=0.5")).toBe("cs");
    expect(resolveLocale({ cookieHeader: "odm_locale=cs" })).toBe("cs");
    expect(localeTag("cs")).toBe("cs-CZ");
  });

  it("translates text with variables and preserves English fallback", () => {
    expect(translate("cs", "Log in")).toBe("Přihlásit se");
    expect(translate("cs", "Signed in as {name}", { name: "Jana" })).toBe("Přihlášen(a) jako Jana");
    expect(translate("cs", "Unknown source phrase")).toBe("Unknown source phrase");
    expect(translate("fr", "Unknown source phrase")).toBe("Unknown source phrase");
  });

  it("translates server-language administration and accessible loading labels", () => {
    expect(translate("cs", "The language your tables play in")).toContain("Jazyk");
    expect(translate("cs", "Loading the table")).toBe("Načítání herního stolu");
    expect(translate("cs", "Turn on these settings to continue.")).toBe("Zapni tato nastavení a pokračuj.");
    expect(
      translate("cs", "Memory search reads with {model}, which reads every table language.", { model: "e5" }),
    ).toBe("Vyhledávání v paměti používá model e5, který rozumí všem jazykům herních stolů.");
  });

  it("uses three Czech plural forms", () => {
    const singular = "{count} player";
    const plural = "{count} players";
    expect(translatePlural("cs", singular, plural, { count: 1 })).toBe("1 hráč");
    expect(translatePlural("cs", singular, plural, { count: 3 })).toBe("3 hráči");
    expect(translatePlural("cs", singular, plural, { count: 5 })).toBe("5 hráčů");
    expect(translatePlural("cs", singular, plural, { count: 0 })).toBe("0 hráčů");
    expect(pluralCategory("cs", 4)).toBe("few");
  });
  it("supports Czech speech recognition language hints", () => {
    expect(whisperLanguageCode("czech")).toBe("cs");
    expect(deviceSpeechLanguage("czech")).toBe("cs");
    expect(whisperLanguageCode("english")).toBe("en");
  });

  it("translates display-only damage words without changing English or French", () => {
    expect(damageTypeWord("fire", "cs")).toBe("Ohnivé");
    expect(damageTypeWord("slashing", "cs")).toBe("Sečné");
    expect(damageWords("1d6 fire + 2d8 slashing", "cs")).toBe("1d6 ohnivé + 2d8 sečné");
    expect(damageWords("1d6 fire", "en")).toBe("1d6 fire");
    expect(damageTypeWord("fire", "fr")).toBe("Feu");
  });

  it("covers every reference SRD name without changing stored source IDs", () => {
    for (const [category, names] of Object.entries(FR_NAMES_BY_TABLE)) {
      const czech = CS_NAMES_BY_TABLE[category] ?? {};
      const missing = Object.keys(names).filter((key) => !czech[key]?.trim());
      expect(missing, "Missing Czech names in " + category).toEqual([]);
    }
    expect(contentName("spells", { slug: "fireball", name: "Fireball" }, "cs")).toBe("Ohnivá koule");
    expect(contentName("monsters", { slug: "goblin", name: "Goblin" }, "cs")).toBe("Goblin");
    expect(classFeatureName("fighter", "Second Wind", "cs")).toBe("Druhý dech");
    expect(subclassName("cleric", "Life Domain", "cs")).toBe("Doména života");
    expect(contentName("spells", "Unknown Spell", "cs")).toBe("Unknown Spell");
  });
});
