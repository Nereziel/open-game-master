import { describe, expect, it } from "vitest";
import cs from "@/lib/i18n/cs.json";
import fr from "@/lib/i18n/fr.json";
import { installCatalog, translate, type Locale } from "@/lib/i18n/translate";
import { describeKnownEntry } from "./event-log-logic";
import { installCsTables } from "@/lib/i18n/cs-tables";
import { CS_NAMES_BY_TABLE } from "@/lib/content/names-cs";
import { contentName } from "@/lib/content/names";

installCatalog("cs", cs);
installCatalog("fr", fr);
installCsTables({ names: CS_NAMES_BY_TABLE });

function say(locale: Locale, kind: string, delta: Record<string, unknown> = {}, name = "Mara") {
  return describeKnownEntry(
    Object.assign((key: string, vars?: Record<string, string | number>) => translate(locale, key, vars), { locale }),
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
  it("uses canonical Czech item and spell names without rewriting stored events", () => {
    const item = { name: "Scale Mail", qty: 2 };
    const spell = { spell: "Cure Wounds" };
    expect(say("cs", "grant_item", item)).toContain("Šupinová zbroj");
    expect(say("cs", "remove_item", { name: "Scale Mail", removed: 1 })).toContain("Šupinová zbroj");
    expect(say("cs", "purchase", { name: "Scale Mail", price: 5 })).toContain("Šupinová zbroj");
    expect(say("cs", "gear", { name: "Scale Mail", equipped: true })).toContain("Šupinová zbroj");
    expect(say("cs", "reveal_item", { from: "Scale Mail", to: "Longsword" })).toContain("Dlouhý meč");
    expect(say("cs", "learn_spell", spell)).toContain("Léčení zranění");
    expect(say("cs", "concentration_clock", spell)).toContain("Léčení zranění");
    expect(say("cs", "pact_weapon", { created: "Longsword" })).toContain("Dlouhý meč");
    expect(say("en", "grant_item", item)).toContain("Scale Mail");
    expect(say("en", "learn_spell", spell)).toContain("Cure Wounds");
    expect(item).toEqual({ name: "Scale Mail", qty: 2 });
    expect(spell).toEqual({ spell: "Cure Wounds" });
  });

  it("leaves unknown custom names and reactions intact in every language", () => {
    expect(say("cs", "grant_item", { name: "My Dragon Lantern" })).toContain("My Dragon Lantern");
    expect(say("cs", "learn_spell", { spell: "Homebrew Storm" })).toContain("Homebrew Storm");
    expect(say("fr", "pact_weapon", { bonded: "Custom Blade" })).toContain("Custom Blade");
    expect(say("cs", "reaction", { reaction: "My custom reaction" })).toBe("Mara: My custom reaction");
  });


  it("uses the same creature names as the bestiary for wild-shape audit rows", () => {
    const delta = { form: "Wolf", amount: 3, beastHp: 7 };
    const translated = contentName("monsters", "Wolf", "cs");
    expect(say("cs", "apply_damage", delta)).toContain(translated);
    expect(say("cs", "heal", delta)).toContain(translated);
    expect(say("en", "apply_damage", delta)).toContain("Wolf");
    expect(say("cs", "apply_damage", { form: "Custom Beast", amount: 3 })).toContain("Custom Beast");
    expect(delta).toEqual({ form: "Wolf", amount: 3, beastHp: 7 });
  });

  it("localizes recognized conditions but leaves unknown condition names untouched", () => {
    const known = contentName("conditions", "blinded", "cs");
    expect(say("cs", "set_condition", { condition: "blinded" })).toContain(known);
    const cleared = say("cs", "clear_condition", { ended: ["blinded", "My Homebrew Curse"] });
    expect(cleared).toContain(known);
    expect(cleared).toContain("My Homebrew Curse");
    expect(say("cs", "condition_clock", { ended: ["blinded"] })).toContain(known);
    expect(say("en", "set_condition", { condition: "blinded" })).toContain("blinded");
    expect(say("cs", "set_condition", { condition: "My Homebrew Curse" })).toContain("My Homebrew Curse");
  });

  it("translates standard damage types through the shared UI catalog, not custom ones", () => {
    const withFire = { kind: "apply_damage", delta: { amount: 3, type: "fire" } };
    const withCustom = { kind: "apply_damage", delta: { amount: 3, type: "dreamfire" } };
    const customT = Object.assign(
      (key: string, vars?: Record<string, string | number>) =>
        key === "fire" ? "ohněm" : translate("en", key, vars),
      { locale: "cs" as const },
    );
    expect(describeKnownEntry(customT, withFire, "Mara")).toContain("(ohněm)");
    expect(describeKnownEntry(customT, withCustom, "Mara")).toContain("(dreamfire)");
    expect(say("en", "apply_damage", withFire.delta)).toContain("(fire)");
    expect(withFire.delta).toEqual({ amount: 3, type: "fire" });
  });
});
