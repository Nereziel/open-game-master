import { describe, expect, it } from "vitest";
import { acView, speedView, stateTags } from "./sheet-state";
import { installCsTables } from "@/lib/i18n/cs-tables";
import { CS_NAMES_BY_TABLE } from "@/lib/content/names-cs";
import { translate, type Locale } from "@/lib/i18n/translate";
import type { CharacterSheet } from "@/lib/schemas/sheet";

installCsTables({ names: CS_NAMES_BY_TABLE });

function reader(locale: Locale) {
  return Object.assign(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    { locale },
  );
}

describe("localized sheet state explanations", () => {
  it("shows the bestiary name of a known wild-shape form in the AC tooltip", () => {
    const sheet = {
      name: "Mara",
      ac: 14,
      wildShape: { form: "Wolf", beastAc: 13 },
    } as CharacterSheet;
    const cs = acView(sheet, reader("cs"));
    expect(cs.ac).toBe(13);
    expect(cs.note).toContain("Vlk");
    expect(cs.note).not.toContain("Wolf");
    expect(acView(sheet, reader("en")).note).toContain("Wolf");
    expect(sheet.wildShape?.form).toBe("Wolf");
  });

  it("uses the condition catalog in movement warnings without modifying combat state", () => {
    const sheet = {
      name: "Mara",
      speed: 30,
      wildShape: { form: "Wolf", beastAc: 13, speed: 30 },
      conditions: ["grappled"],
      exhaustion: 0,
    } as CharacterSheet;
    const cs = speedView(reader("cs"), sheet);
    expect(cs.speed).toBe(0);
    expect(cs.notes.join(" ")).toContain("Uchvácený");
    expect(cs.notes.join(" ")).not.toContain("grappled");
    expect(speedView(reader("en"), sheet).notes.join(" ")).toContain("grappled");
    expect(sheet.conditions).toEqual(["grappled"]);
  });

  it("uses the spell catalog in concentration labels, preserving unknown spells", () => {
    const sheet = {
      name: "Mara",
      currentHp: 12,
      ac: 14,
      conditions: [],
      concentratingOn: "Cure Wounds",
    } as CharacterSheet;
    const cs = stateTags(reader("cs"), sheet);
    expect(cs.find((tag) => tag.id === "concentration")?.label).toContain("Léčení zranění");
    expect(cs.find((tag) => tag.id === "concentration")?.label).not.toContain("Cure Wounds");
    expect(stateTags(reader("en"), sheet).find((tag) => tag.id === "concentration")?.label).toContain("Cure Wounds");
    const homebrew = { ...sheet, concentratingOn: "My Custom Spell" };
    expect(stateTags(reader("cs"), homebrew).find((tag) => tag.id === "concentration")?.label).toContain("My Custom Spell");
    expect(sheet.concentratingOn).toBe("Cure Wounds");
  });

  it("uses known condition names for incapacitation chips", () => {
    const sheet = {
      name: "Mara",
      currentHp: 12,
      ac: 14,
      conditions: ["stunned"],
    } as CharacterSheet;
    const cs = stateTags(reader("cs"), sheet);
    const condition = cs.find((tag) => tag.id === "incapacitated");
    expect(condition?.label).toContain("Omráčený");
    expect(condition?.label).not.toContain("stunned");
    expect(stateTags(reader("en"), sheet).find((tag) => tag.id === "incapacitated")?.label).toContain("stunned");
    expect(sheet.conditions).toEqual(["stunned"]);
  });

  it("does not rewrite a custom wild-shape name", () => {
    const sheet = {
      name: "Mara",
      ac: 14,
      wildShape: { form: "Clockwork Hydra", beastAc: 12 },
    } as CharacterSheet;
    expect(acView(sheet, reader("cs")).note).toContain("Clockwork Hydra");
  });
});
