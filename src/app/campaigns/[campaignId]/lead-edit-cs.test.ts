import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { localizeAcParts } from "@/app/characters/builder/derivedReasons";
import { contentName } from "@/lib/content/names";
import { CS_NAMES_BY_TABLE } from "@/lib/content/names-cs";
import { installCsTables } from "@/lib/i18n/cs-tables";
import { translate } from "@/lib/i18n/translate";
import { skillLabel } from "@/lib/srd";
import { abilityShortLabel } from "@/lib/srd/ability-short-label";

installCsTables({ names: CS_NAMES_BY_TABLE });

describe("Campaign character adjustments in Czech", () => {
  it("translates every displayed source in a scale-mail armor calculation", () => {
    const parts = ["Scale Mail 14", "DEX -1", "Shield +2"];
    const t = (key: string) => translate("cs", key);
    expect(localizeAcParts(parts, t, "cs")).toEqual([
      "Šupinová zbroj 14",
      "OBR -1",
      "Štít +2",
    ]);
    expect(localizeAcParts(parts, t, "en")).toEqual(parts);
  });

  it("uses the shared Czech name tables for skills, gear and spells", () => {
    expect(abilityShortLabel("dex", "cs")).toBe("OBR");
    expect(abilityShortLabel("DEX", "en")).toBe("DEX");
    expect(abilityShortLabel("str", "fr")).toBe("FOR");
    expect(skillLabel("acrobatics", "cs")).toBe("Akrobacie");
    expect(skillLabel("acrobatics", "en")).toBe("Acrobatics");
    expect(contentName("items", "Scale Mail", "cs")).toBe("Šupinová zbroj");
    expect(contentName("spells", "Cure Wounds", "cs")).toBe("Léčení zranění");
    expect(contentName("spells", "Cure Wounds", "en")).toBe("Cure Wounds");
  });



  it("keeps editor labels in the central Czech message catalog", () => {
    expect(translate("cs", "Armor sets the AC: {ac}", { ac: 15 })).toBe("Zbroj určuje TZ: 15");
    expect(translate("cs", "Prepared spells")).toBe("Připravená kouzla");
    expect(translate("cs", "Reason for change (shown in the log)")).toBe("Důvod změny (zobrazí se v záznamu)");
    expect(translate("cs", "Pact spell slots")).toBe("Paktové pozice");
    expect(translate("cs", "Spell slots used / max")).toBe("spotřebováno / celkem");
    expect(translate("cs", "{name} slots used", { name: "1. úroveň" })).toBe("1. úroveň: spotřebováno");
    expect(translate("cs", "{name} slots max", { name: "1. úroveň" })).toBe("1. úroveň: celkem");
    expect(translate("cs", 'Add "{name}" as custom', { name: "Kniha" })).toBe("Přidat „Kniha“ jako vlastní položku");
    expect(translate("cs", "Add {count}", { count: 2 })).toBe("Přidat (2)");
    expect(translate("en", "Prepared spells")).toBe("Prepared spells");
    expect(translate("en", "Armor sets the AC: {ac}", { ac: 15 })).toBe("Armor sets the AC: 15");
  });

  it("keeps the campaign editor wired to the shared translations and help", () => {
    const editor = readFileSync(path.join(process.cwd(), "src/app/campaigns/[campaignId]/LeadEditDialog.tsx"), "utf8");
    const parts = readFileSync(path.join(process.cwd(), "src/app/campaigns/[campaignId]/LeadEditParts.tsx"), "utf8");
    expect(editor).toContain('<GameTerm id="armor_class">');
    expect(editor).toContain("localizeAcParts(derived.parts, t, locale)");
    expect(editor).toContain("skillLabel(skill.id, locale)");
    expect(editor).toContain("LocalizedItemNameInput");
    expect(editor).toContain('t("Prepared spells")');
    expect(editor).toContain('t("Reason for change (shown in the log)")');
    expect(parts).toContain('contentName(kind, value, locale)');
    expect(parts).toContain('t("Spell slots used / max")');
  });
});
