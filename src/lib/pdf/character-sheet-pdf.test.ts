import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { createSheetSchema } from "@/lib/schemas/sheet";
import { buildCharacterSheetPdf, libraryToPdfCharacter } from "./character-sheet-pdf";
import { pdfLabel } from "./labels";

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

  it("translates all key PDF captions and keeps English as the default", () => {
    expect(pdfLabel("cs", "Character Name")).toBe("Jméno postavy");
    expect(pdfLabel("cs", "Successes")).toBe("Úspěchy");
    expect(pdfLabel("cs", "Failures")).toBe("Neúspěchy");
    expect(pdfLabel("cs", "Damage / Type")).toBe("Zran. / typ");
    expect(pdfLabel("fr", "Successes")).toBe("Réussites");
    expect(pdfLabel("en", "Character Name")).toBe("Character Name");
  });
});
