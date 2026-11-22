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
import { CS_ABILITY_ABBR } from "@/components/sheet/SheetParts";
import { ABILITIES } from "@/lib/schemas/sheet";

installCsTables({ names: CS_NAMES_BY_TABLE });

describe("Campaign character adjustments in Czech", () => {
  it("uses common Czech names for portrait class hints and feat spellbook headings", () => {
    expect(contentName("classes", "fighter", "cs")).toBe("Bojovník");
    const parts = readFileSync(path.join(process.cwd(), "src/components/sheet/SheetParts.tsx"), "utf8");
    const spells = readFileSync(path.join(process.cwd(), "src/components/sheet/SheetSpells.tsx"), "utf8");
    expect(parts).toContain('title={contentName("classes", classId, locale)}');
    expect(spells).toContain('view.classId === "feats" ? t("Feats")');
    expect(spells).not.toContain('>{contentName("classes", titleCase(view.classId), locale)}</p>');
  });

  it("uses the locale catalog for hit-die roll instructions and actions", () => {
    const state = readFileSync(path.join(process.cwd(), "src/components/sheet/SheetState.tsx"), "utf8");
    expect(state).toContain('aria-label={t("Your hit die roll")}');
    expect(state).toContain('t("Heal with this roll")');
    expect(state).toContain('t("Roll digitally instead")');
    expect(state).toContain('t("Roll {summary}. Your assigned dice fill in on their own."');
    expect(state).toContain('t("Enter the bare die numbers; the {mod} is added for you."');
    expect(state).not.toContain('aria-label="Your hit die roll"');
    expect(state).not.toContain('>Heal with this roll<');
  });

  it("keeps the shared ability labels in character tiles and the PDF", () => {
    for (const ability of ABILITIES) {
      expect(CS_ABILITY_ABBR[ability]).toBe(abilityShortLabel(ability, "cs"));
    }
    const parts = readFileSync(path.join(process.cwd(), "src/components/sheet/SheetParts.tsx"), "utf8");
    expect(parts).toContain("{abilityShortLabel(ability, locale)}");
    expect(parts).not.toContain('locale === "cs" ? CS_ABILITY_ABBR[ability]');
  });

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
    const sheetDialog = readFileSync(path.join(process.cwd(), "src/app/campaigns/[campaignId]/CharacterSheetDialog.tsx"), "utf8");
    expect(editor).toContain('<GameTerm id="armor_class">');
    expect(editor).toContain("localizeAcParts(derived.parts, t, locale)");
    expect(sheetDialog).toContain('localizeAcParts(armor.parts, t, locale).join(" + ")');
    expect(sheetDialog).not.toContain('armor.parts.join(" + ")');
    expect(sheetDialog).toContain("abilityShortLabel(ability, locale)");
    expect(sheetDialog).toContain('localizeDefenseTypes(magic.resistances.join(", "), locale)');
    expect(editor).toContain("skillLabel(skill.id, locale)");
    expect(editor).toContain("LocalizedItemNameInput");
    expect(editor).toContain('t("Prepared spells")');
    expect(editor).toContain('t("Reason for change (shown in the log)")');
    expect(parts).toContain('contentName(kind, value, locale)');
    expect(parts).toContain('t("Spell slots used / max")');
  });
});
