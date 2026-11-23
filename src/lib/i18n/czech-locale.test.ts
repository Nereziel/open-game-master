import { describe, expect, it } from "vitest";
import csCatalog from "./cs.json";
import { catalogInstalled, installCatalog, translate, translatePlural } from "./translate";
import { localeFromAcceptLanguage, parseLocale, resolveLocale } from "./locale";
import { localeTag } from "../messages-logic";

installCatalog("cs", csCatalog);

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
