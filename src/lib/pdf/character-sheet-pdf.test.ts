import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { createSheetSchema } from "@/lib/schemas/sheet";
import { buildCharacterSheetPdf, libraryToPdfCharacter } from "./character-sheet-pdf";
import { pdfLabel } from "./labels";
import { installCsTables } from "@/lib/i18n/cs-tables";
import { installCatalog } from "@/lib/i18n/translate";

const FONT_DIR = "../../../public/pdfjs/standard_fonts/";
const [regular, bold] = await Promise.all([
  readFile(new URL(`${FONT_DIR}LiberationSans-Regular.ttf`, import.meta.url)),
  readFile(new URL(`${FONT_DIR}LiberationSans-Bold.ttf`, import.meta.url)),
]);

describe("fillable character-sheet PDF localization", () => {
  it("embeds Unicode fonts and retains Czech glyphs in editable fields", async () => {
    const name = "Jiří Štěpán Černý";
    const notes = "Žluťoučký kůň úpěl ďábelské ódy: ěščřžýáíéúůňďť.";
    const sheet = createSheetSchema.parse({
      name,
      race: "human",
      class: "fighter",
      abilities: { str: 16, dex: 12, con: 14, int: 10, wis: 10, cha: 10 },
      maxHp: 12,
      ac: 16,
      hitDice: { die: "d10", total: 1, spent: 0 },
      proficiencies: {
        saves: ["str", "con"],
        skills: ["athletics", "perception"],
        languages: ["common"],
        tools: [],
        armor: ["all armor"],
        weapons: ["simple weapons"],
      },
      equipment: [{ name: "Meč válečníka", qty: 1 }],
      features: [],
      notes,
    });
    const character = libraryToPdfCharacter({
      name,
      race: sheet.race,
      class: sheet.class,
      subclass: "",
      background: "soldier",
      level: 1,
      sheet,
    });
    const bytes = await buildCharacterSheetPdf(character, {
      fontBytes: new Uint8Array(regular),
      boldFontBytes: new Uint8Array(bold),
      locale: "cs",
    });
    const pdf = await PDFDocument.load(bytes);
    const values = pdf.getForm().getFields().map((field) =>
      "getText" in field && typeof field.getText === "function" ? field.getText() : undefined,
    );
    expect(values).toContain(name);
    expect(values).toContain(notes);
    expect(values).toContain("Meč válečníka");
    expect(pdf.getPageCount()).toBe(1);
  });

  it("localizes stored character values in Czech without changing the English export", async () => {
    installCsTables({
      names: {
        classes: { fighter: "Bojovník" },
        species: { human: "Člověk" },
        backgrounds: { soldier: "Voják" },
        weapons: { longsword: "Dlouhý meč" },
        gear: { backpack: "Batoh" },
        classFeatures: { "fighter:second-wind": "Druhý dech" },
        spells: { light: "Světlo" },
      },
    });
    const sheet = createSheetSchema.parse({
      name: "Český hrdina",
      race: "human",
      class: "fighter",
      background: "soldier",
      abilities: { str: 16, dex: 12, con: 14, int: 10, wis: 10, cha: 10 },
      maxHp: 12,
      ac: 16,
      hitDice: { die: "d10", total: 1, spent: 0 },
      proficiencies: {
        saves: ["str", "con"], skills: ["athletics"],
        languages: [], tools: [], armor: [], weapons: ["martial weapons"],
      },
      equipment: [{ name: "Longsword", qty: 1 }, { name: "Backpack", qty: 2 }],
      features: [{ name: "Second Wind", source: "class", level: 1 }],
    });
    const character = libraryToPdfCharacter({
      name: sheet.name, race: sheet.race, class: sheet.class,
      subclass: "", background: "soldier", level: 1, sheet,
    });
    async function values(locale: "cs" | "en") {
      const bytes = await buildCharacterSheetPdf(character, {
        fontBytes: new Uint8Array(regular),
        boldFontBytes: new Uint8Array(bold),
        locale,
      });
      const pdf = await PDFDocument.load(bytes);
      return pdf.getForm().getFields().flatMap((f) =>
        "getText" in f && typeof f.getText === "function" ? [f.getText()] : [],
      );
    }
    const cs = await values("cs");
    expect(cs).toContain("Bojovník 1");
    expect(cs).toContain("Člověk");
    expect(cs).toContain("Voják");
    expect(cs.some((value) => value?.includes("Dlouhý meč") && value.includes("Batoh ×2"))).toBe(true);
    expect(cs.some((value) => value?.includes("Druhý dech"))).toBe(true);
    const en = await values("en");
    expect(en).toContain("Fighter 1");
    expect(en).toContain("human");
    expect(en.some((value) => value?.includes("Longsword") && value.includes("Backpack"))).toBe(true);
  });

  it("translates race-feature explanations, armor/weapon groups and personality in Czech", async () => {
    installCatalog("cs", {
      messages: {
        "Personality trait": "Osobnostní rys",
        "I offer a blessing to strangers whether they want one or not.":
          "Cizincům žehnám, ať o požehnání stojí, nebo ne.",
      },
      contexts: {}, plurals: {},
    });
    const sheet = createSheetSchema.parse({
      name: "Aasimar",
      race: "aasimar",
      class: "fighter",
      abilities: { str: 16, dex: 12, con: 14, int: 10, wis: 10, cha: 10 },
      maxHp: 12, ac: 16,
      hitDice: { die: "d10", total: 1, spent: 0 },
      proficiencies: {
        saves: ["str"], skills: [], languages: [], tools: [],
        armor: ["light", "medium", "heavy", "shields"],
        weapons: ["simple", "martial"],
      },
      features: [{ source: "race", name: "Light Bearer (the light cantrip)" }],
      persona: { trait: "I offer a blessing to strangers whether they want one or not." },
    });
    const character = libraryToPdfCharacter({
      name: sheet.name, race: sheet.race, class: sheet.class,
      subclass: "", background: "acolyte", level: 1, sheet,
    });
    const getTexts = async (locale: "cs" | "en") => {
      const pdf = await PDFDocument.load(await buildCharacterSheetPdf(character, {
        fontBytes: new Uint8Array(regular), boldFontBytes: new Uint8Array(bold), locale,
      }));
      return pdf.getForm().getFields().flatMap((field) =>
        "getText" in field && typeof field.getText === "function" ? [field.getText() ?? ""] : [],
      );
    };
    const cs = (await getTexts("cs")).join("\\n");
    expect(cs).toContain("Nositel světla");
    expect(cs).toContain("Znáš trik Světlo.");
    expect(cs).not.toContain("the light cantrip");
    expect(cs).toContain("lehká zbroj, střední zbroj, těžká zbroj, štíty");
    expect(cs).toContain("jednoduché zbraně, vojenské zbraně");
    expect(cs).toContain('Osobnostní rys: "Cizincům žehnám, ať o požehnání stojí, nebo ne."');
    const en = (await getTexts("en")).join("\\n");
    expect(en).toContain("Light Bearer (the light cantrip)");
    expect(en).toContain("light, medium, heavy, shields");
    expect(en).toContain('trait "I offer a blessing to strangers whether they want one or not."');
  });

  it("translates all key PDF captions and keeps English as the default", () => {
    expect(pdfLabel("cs", "Character Name")).toBe("Jméno postavy");
    expect(pdfLabel("cs", "Successes")).toBe("Úspěchy");
    expect(pdfLabel("cs", "Failures")).toBe("Neúspěchy");
    expect(pdfLabel("cs", "Damage / Type")).toBe("Zran. / typ");
    expect(pdfLabel("fr", "Successes")).toBe("Réussites");
    expect(pdfLabel("en", "Character Name")).toBe("Character Name");
  });
});
