import { describe, expect, it } from "vitest";
import cs from "@/lib/i18n/cs.json";
import fr from "@/lib/i18n/fr.json";
import { installCatalog, translate, type Locale } from "@/lib/i18n/translate";
import { describeKnownEntry } from "./event-log-logic";

installCatalog("cs", cs);
installCatalog("fr", fr);

function say(locale: Locale, kind: string, delta: Record<string, unknown> = {}, name = "Mara") {
  return describeKnownEntry(
    (key, vars) => translate(locale, key, vars),
    { kind, delta },
    name,
  );
}

describe("historical event-log system phrases follow the reader's locale", () => {
  it("translates the hit point maximum change without rewriting stored event data", () => {
    const delta = { maxHp: 16, currentHp: 9 };
    expect(say("en", "set_effect", delta)).toBe("Mara's hit point maximum is now 16 (9 HP)");
    expect(say("cs", "set_effect", delta)).toBe("Maximální počet životů postavy Mara je nyní 16 (9 životů)");
    expect(say("fr", "set_effect", delta)).toBe("Le maximum de points de vie de Mara est désormais de 16 (9 PV)");
    expect(say("cs", "set_effect")).toBe("Maximální počet životů postavy Mara se mění");
  });

  it("localizes known pact weapon event types but keeps the weapon name untouched", () => {
    expect(say("en", "pact_weapon", { created: "Custom Blade" }))
      .toBe("Mara creates a pact weapon: Custom Blade");
    expect(say("cs", "pact_weapon", { created: "Custom Blade" }))
      .toBe("Mara vytváří paktovou zbraň: Custom Blade");
    expect(say("fr", "pact_weapon", { bonded: "Custom Blade" }))
      .toBe("Mara lie Custom Blade comme arme de pacte");
    expect(say("cs", "pact_weapon", { bonded: "Custom Blade" }))
      .toBe("Mara poutá Custom Blade jako svou paktovou zbraň");
    expect(say("cs", "pact_weapon", { unbonded: "Custom Blade" }))
      .toBe("Mara ruší paktové pouto s předmětem Custom Blade");
    expect(say("cs", "pact_weapon", { dismissed: "Custom Blade" }))
      .toBe("Mara odvolává Custom Blade");
    expect(say("cs", "pact_weapon"))
      .toBe("Mara odvolává paktovou zbraň");
    expect(say("fr", "pact_weapon"))
      .toBe("Mara fait disparaître l'arme de pacte");
  });

  it("localizes Book of Shadows, Form of Dread, reactions and the spirit anchor", () => {
    expect(say("cs", "book_of_shadows"))
      .toBe("Mara vytváří Knihu stínů");
    expect(say("cs", "book_of_shadows", { replaced: true }))
      .toBe("Mara vytváří novou Knihu stínů a původní mizí");
    expect(say("fr", "book_of_shadows", { replaced: true }))
      .toBe("Mara crée un nouveau Livre des ombres et l'ancien disparaît");
    expect(say("cs", "spirit_projection"))
      .toBe("Mara v tomto tahu využívá Podobu hrůzy");
    expect(say("cs", "reaction"))
      .toBe("Mara používá reakci");
    expect(say("fr", "reaction"))
      .toBe("Mara utilise une réaction");
    expect(say("cs", "spirit_anchor"))
      .toBe("Ducha postavy Mara poutá Kotva živých");
  });

  it("does not translate a custom reaction or alter its event payload", () => {
    const delta = { reaction: "My custom reaction" };
    expect(say("cs", "reaction", delta)).toBe("Mara: My custom reaction");
    expect(delta).toEqual({ reaction: "My custom reaction" });
  });
});
