import { describe, expect, it } from "vitest";
import { installCatalog } from "./translate";
import { gameFeature, gameName, gamePersonalityLine, gameProficiency } from "./game-text";

describe("shared game translation entry point", () => {
  it("uses the same vocabulary for the game and PDF", () => {
    expect(gameProficiency("martial", "weapons", "cs")).toBe("Vojenské");
    expect(gameProficiency("martial weapons", "weapons", "cs", true)).toBe("Vojenské zbraně");
    expect(gameProficiency("light", "armor", "cs", true)).toBe("Lehká zbroj");
    expect(gameProficiency("martial", "weapons", "en")).toBeNull();
  });

  it("reuses reviewed race explanations rather than untranslated shorthand", () => {
    expect(gameFeature("Light Bearer (the light cantrip)", "race", "cs")).toBe(
      "Nositel světla — Znáš trik Světlo.",
    );
    expect(gameFeature("Light Bearer (the light cantrip)", "race", "en")).toBe(
      "Light Bearer (the light cantrip)",
    );
  });

  it("translates only known personality choices and preserves custom ones", () => {
    installCatalog("cs", {
      messages: {
        "Personality trait": "Osobnostní rys",
        "I offer a blessing to strangers whether they want one or not.": "Žehnám cizincům, ať chtějí, nebo ne.",
      },
      contexts: {},
      plurals: {},
    });
    expect(gamePersonalityLine('trait "I offer a blessing to strangers whether they want one or not."', "cs")).toBe(
      'Osobnostní rys: "Žehnám cizincům, ať chtějí, nebo ne."',
    );
    expect(gamePersonalityLine('trait "My custom story"', "cs")).toBe('Osobnostní rys: "My custom story"');
    expect(gamePersonalityLine('trait "My custom story"', "en")).toBe('trait "My custom story"');
    expect(gameName("items", "Unknown custom gear", "cs")).toBe("Unknown custom gear");
  });
});
