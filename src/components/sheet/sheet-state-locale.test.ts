import { describe, expect, it } from "vitest";
import { acView } from "./sheet-state";
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

  it("does not rewrite a custom wild-shape name", () => {
    const sheet = {
      name: "Mara",
      ac: 14,
      wildShape: { form: "Clockwork Hydra", beastAc: 12 },
    } as CharacterSheet;
    expect(acView(sheet, reader("cs")).note).toContain("Clockwork Hydra");
  });
});
