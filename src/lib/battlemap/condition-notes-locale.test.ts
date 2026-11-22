import { describe, expect, it } from "vitest";
import { conditionNote } from "./condition-notes";
import { installCsTables } from "@/lib/i18n/cs-tables";
import { CS_NAMES_BY_TABLE } from "@/lib/content/names-cs";
import cs from "@/lib/i18n/cs.json";
import fr from "@/lib/i18n/fr.json";
import { installCatalog, translate, type Locale } from "@/lib/i18n/translate";

installCatalog("cs", cs);
installCatalog("fr", fr);
installCsTables({ names: CS_NAMES_BY_TABLE });

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

  it("uses the same known spell names as the character sheet in condition sources", () => {
    const meta = { source: "caster", spell: "Cure Wounds" };
    const nameOf = (id: string) => id === "caster" ? "Mara" : null;
    const csNote = conditionNote("poisoned", meta, nameOf, undefined, localizedT("cs"));
    expect(csNote.source).toContain("Léčení zranění");
    expect(csNote.source).not.toContain("Cure Wounds");
    expect(conditionNote("poisoned", meta, nameOf, undefined, localizedT("en")).source).toContain("Cure Wounds");
    expect(meta).toEqual({ source: "caster", spell: "Cure Wounds" });
  });

  it("preserves homebrew spell names and readied triggers verbatim", () => {
    const custom = conditionNote("poisoned", { spell: "My Homebrew Spell" }, () => null, undefined, localizedT("cs"));
    expect(custom.source).toBe("My Homebrew Spell");
    const trigger = "Cure Wounds when the door opens";
    const ready = conditionNote("readied", { source: trigger }, () => null, undefined, localizedT("cs"));
    expect(ready.source).toContain(trigger);
  });
});
