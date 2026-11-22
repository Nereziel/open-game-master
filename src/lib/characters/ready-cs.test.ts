import { describe, expect, it } from "vitest";
import { translate } from "@/lib/i18n/translate";
import { CS_NAMES_BY_TABLE } from "@/lib/content/names-cs";
import { contentName } from "@/lib/content/names";
import { installCsTables } from "@/lib/i18n/cs-tables";
import { skillLabel } from "@/lib/srd";

describe("Czech new-hero and builder notices", () => {
  it("translates /ready heading, actions and buttons", () => {
    expect(translate("cs", "{name} is ready", { name: "Sylvana" })).toBe("Postava Sylvana je připravena");
    expect(translate("cs", "Level {level}", { level: 1 })).toBe("1. úroveň");
    expect(translate("cs", "Three things to try on your turn")).toContain("Tři věci");
    expect(translate("cs", "Bring to a table")).toBe("Přidat ke hernímu stolu");
    expect(translate("cs", "Don't show this again")).toBe("Příště už nezobrazovat");
  });

  it("uses Czech spell and weapon names on the first turn", () => {
    installCsTables({ names: CS_NAMES_BY_TABLE });
    expect(contentName("spells", "Light", "cs")).toBe("Světlo");
    expect(contentName("items", "Longsword", "cs")).toBe("Dlouhý meč");
    expect(contentName("items", "Longsword", "en")).toBe("Longsword");
  });

  it("translates a dropped Religion skill without changing its id", () => {
    expect(skillLabel("religion", "cs")).toBe("Náboženství");
    expect(skillLabel("religion", "en")).toBe("Religion");
    expect(translate("cs", "Changing the {because} set aside {named}: it no longer fits.", {
      because: "minulosti",
      named: "dovednost povolání Náboženství",
    })).toContain("Změna minulosti");
  });
});
