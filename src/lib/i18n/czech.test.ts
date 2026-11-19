import { describe, expect, it } from "vitest";
import catalog from "./cs.json";
import { installCatalog, translate, translatePlural } from "./translate";
import { localeFromAcceptLanguage, localeOfServerLanguage, parseLocale, resolveLocale } from "./locale";
import { localeTag, pluralCategory } from "../messages-logic";

installCatalog("cs", catalog);

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

  it("uses three Czech plural forms", () => {
    const singular = "{count} player";
    const plural = "{count} players";
    expect(translatePlural("cs", singular, plural, { count: 1 })).toBe("1 hráč");
    expect(translatePlural("cs", singular, plural, { count: 3 })).toBe("3 hráči");
    expect(translatePlural("cs", singular, plural, { count: 5 })).toBe("5 hráčů");
    expect(translatePlural("cs", singular, plural, { count: 0 })).toBe("0 hráčů");
    expect(pluralCategory("cs", 4)).toBe("few");
  });
});
