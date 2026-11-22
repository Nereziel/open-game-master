import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { localizeAcParts } from "@/app/characters/builder/derivedReasons";
import { contentName } from "@/lib/content/names";
import { CS_NAMES_BY_TABLE } from "@/lib/content/names-cs";
import { installCsTables } from "@/lib/i18n/cs-tables";
import { translate } from "@/lib/i18n/translate";
import { skillLabel } from "@/lib/srd";

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
    expect(skillLabel("acrobatics", "cs")).toBe("Akrobacie");
    expect(skillLabel("acrobatics", "en")).toBe("Acrobatics");
    expect(contentName("items", "Scale Mail", "cs")).toBe("Šupinová zbroj");
    expect(contentName("spells", "Cure Wounds", "cs")).toBe("Léčení zranění");
    expect(contentName("spells", "Cure Wounds", "en")).toBe("Cure Wounds");
  });

  it("keeps the campaign editor wired to the shared translations and help", () => {
    const editor = readFileSync(path.join(process.cwd(), "src/app/campaigns/[campaignId]/LeadEditDialog.tsx"), "utf8");
    const parts = readFileSync(path.join(process.cwd(), "src/app/campaigns/[campaignId]/LeadEditParts.tsx"), "utf8");
    expect(editor).toContain('<GameTerm id="armor_class">');
    expect(editor).toContain("localizeAcParts(derived.parts, t, locale)");
    expect(editor).toContain("skillLabel(skill.id, locale)");
    expect(editor).toContain("LocalizedItemNameInput");
    expect(editor).toContain("Připravená kouzla");
    expect(editor).toContain("Důvod změny");
    expect(parts).toContain('contentName(kind, value, locale)');
    expect(parts).toContain("spotřebováno / celkem");
  });
});
