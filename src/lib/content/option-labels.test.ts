import { describe, expect, it } from "vitest";
import { optionDisplayName } from "./option-labels";
import { classFeatureName } from "./names";
import { CS_NAMES_BY_TABLE } from "./names-cs";
import { FR_NAMES_BY_TABLE } from "./names-fr";
import cs from "../i18n/cs.json";
import fr from "../i18n/fr.json";
import { installLocalizedTables } from "../i18n/localized-tables";
import { installCatalog, translate } from "../i18n/translate";
import { optionFeatureName, optionSourceClassId, optionsOfKind } from "../srd/options";

describe("published option presentation", () => {
  it("reuses source class names, translates the exact prefixed key and preserves canonical picks", () => {
    installLocalizedTables("cs", { names: CS_NAMES_BY_TABLE });
    installLocalizedTables("fr", { names: FR_NAMES_BY_TABLE });
    installCatalog("cs", cs);
    installCatalog("fr", fr);
    for (const kind of ["pact_boon", "metamagic", "maneuver", "invocation"] as const) {
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
});
