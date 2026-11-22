import { describe, expect, it } from "vitest";
import { conditionNote } from "./condition-notes";
import cs from "@/lib/i18n/cs.json";
import fr from "@/lib/i18n/fr.json";
import { installCatalog, translate, type Locale } from "@/lib/i18n/translate";

installCatalog("cs", cs);
installCatalog("fr", fr);

const localizedT = (locale: Locale) =>
  Object.assign(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    { locale },
  );

describe("condition save ends ability labels", () => {
  const condition = {
    saveEnds: { ability: "wis", or: "dex", dc: 13 },
  };

  it("displays the same Czech ability abbreviations as the character sheet", () => {
    const note = conditionNote("poisoned", condition, () => null, undefined, localizedT("cs"));
    expect(note.save).toContain("MDR");
    expect(note.save).toContain("OBR");
    expect(note.save).not.toContain("WIS");
    expect(note.save).not.toContain("DEX");
    expect(condition.saveEnds).toEqual({ ability: "wis", or: "dex", dc: 13 });
  });

  it("preserves English and French abbreviations", () => {
    const en = conditionNote("poisoned", condition, () => null, undefined, localizedT("en"));
    const fr = conditionNote("poisoned", condition, () => null, undefined, localizedT("fr"));
    expect(en.save).toContain("WIS");
    expect(en.save).toContain("DEX");
    expect(fr.save).toContain("SAG");
    expect(fr.save).toContain("DEX");
  });

  it("keeps unknown custom ability codes as supplied", () => {
    const note = conditionNote(
      "poisoned",
      { saveEnds: { ability: "luck", dc: 15 } },
      () => null, undefined, localizedT("cs"),
    );
    expect(note.save).toContain("LUCK");
  });
});
