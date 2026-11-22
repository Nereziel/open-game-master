import { describe, expect, it } from "vitest";
import source from "./fr.json";
import czech from "./cs.json";

// A larger Czech file does not prove full coverage: only matching English
// source keys count. Guard every catalog family against untranslated fallbacks.
describe("Czech UI catalog completeness", () => {
  it("translates the paperdoll drag-and-drop instruction", () => {
    const message = "Drag an item from the list above onto its place to put it on, or press a place to see what goes there.";
    expect(czech.messages[message as keyof typeof czech.messages]).toBe(
      "Přetáhni předmět ze seznamu výše na příslušné místo na figuríně, abys ho vybavil, nebo na místo klikni a zjisti, co tam patří.",
    );
  });

  it("keeps physical hit-die instructions and controls in the central Czech catalog", () => {
    expect(czech.messages["Your hit die roll"]).toBe("Hod kostkou životů");
    expect(czech.messages["Heal with this roll"]).toBe("Vyléčit podle hodu");
    expect(czech.messages["The {die} is from {from}."]).toBe("Kostka {die} pochází z {from}.");
    expect(czech.messages["Roll digitally instead"]).toBe("Místo toho hodit digitálně");
    expect(czech.messages["Roll {summary}. Your assigned dice fill in on their own."])
      .toContain("Přiřazené kostky");
    expect(czech.messages["Roll {summary} at your table and enter each die below.{note} The game waits for your result."])
      .toContain("zadej výsledky");
  });

  it("covers Czech multiclass tool selection and screen-reader labels", () => {
    expect(czech.messages["Choose tools for {class} ({count}):"])
      .toBe("Vyber nástroje pro povolání {class} (počet: {count}):");
    expect(czech.messages["Tool choices for {class}"])
      .toBe("Výběr nástrojů pro povolání {class}");
  });

  it("covers all source messages, contexts and plural entries", () => {
    // The empty source key represents an empty UI string, not untranslated text.
    const sourceMessages = Object.keys(source.messages).filter(Boolean);
    const missingMessages = sourceMessages.filter(
      (key) => !(key in czech.messages) || !czech.messages[key as keyof typeof czech.messages]?.trim(),
    );
    const missingContexts = Object.entries(source.contexts).flatMap(([key, contexts]) =>
      Object.keys(contexts).filter(
        (context) => !(context in ((czech.contexts as Record<string, Record<string, string>>)[key] ?? {})),
      ).map((context) => `${key} [${context}]`),
    );
    const missingPlurals = Object.keys(source.plurals).filter(
      (key) => !(key in czech.plurals),
    );

    // Exact numbers and examples make failed checks actionable for the next
    // manual translation batch without guessing from historical docs.
    const messageCoverage = sourceMessages.length - missingMessages.length;
    console.log(`Czech UI catalog coverage: ${messageCoverage}/${sourceMessages.length} messages; missing ${missingMessages.length} messages, ${missingContexts.length} contexts and ${missingPlurals.length} plurals.`);
    expect(missingMessages.slice(0, 25), `${missingMessages.length} untranslated source messages`).toEqual([]);
    expect(missingContexts.slice(0, 25), `${missingContexts.length} untranslated context variants`).toEqual([]);
    expect(missingPlurals.slice(0, 25), `${missingPlurals.length} untranslated plural entries`).toEqual([]);
  });
});
