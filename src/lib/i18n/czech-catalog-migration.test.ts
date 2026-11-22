import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import catalog from "./cs.json";
import { installCatalog, translate, translatePlural } from "./translate";

// Previously 217 Czech UI labels were stored separately in translate.ts.
// 63 missing keys have been moved to cs.json; existing catalog values win.
const promoted: Record<string, string> = {
  "Armor sets the AC: {ac}": "Zbroj určuje TZ: {ac}",
  "Prepared spells": "Připravená kouzla",
  "Reason for change (shown in the log)": "Důvod změny (zobrazí se v záznamu)",
  "Pact spell slots": "Paktové pozice",
  "Spell slots used / max": "spotřebováno / celkem",
  "{name} slots used": "{name}: spotřebováno",
  "{name} slots max": "{name}: celkem",
  "Acquired item: {name}.": "Získaný předmět: {name}.",
  'Add "{name}" as custom': "Přidat „{name}“ jako vlastní položku",
  "Add {count}": "Přidat ({count})",
  "Looking it up...": "Načítání údajů…",
  "Melee weapon": "Zbraň na blízko",
  "Ranged weapon": "Zbraň na dálku",
  "Armor or shield": "Zbroj nebo štít",
  "Select the mark beside it for the full entry.": "Podrobný popis otevřeš kliknutím na značku vedle názvu.",
};

describe("Czech UI translations have one canonical catalog", () => {
  it("stores promoted labels in cs.json rather than a separate fallback map", () => {
    for (const [english, czech] of Object.entries(promoted)) {
      expect(catalog.messages[english as keyof typeof catalog.messages], english).toBe(czech);
    }
    const moduleText = readFileSync(join(process.cwd(), "src/lib/i18n/translate.ts"), "utf8");
    expect(moduleText).not.toContain("CZECH_LABEL_FALLBACKS");
  });

  it("renders the shared catalog in Czech and keeps the English original", () => {
    installCatalog("cs", catalog);
    expect(translate("cs", "Armor sets the AC: {ac}", { ac: 15 })).toBe("Zbroj určuje TZ: 15");
    expect(translate("cs", "Acquired item: {name}.", { name: "Lucerna" })).toBe("Získaný předmět: Lucerna.");
    expect(translate("cs", "Add {count}", { count: 2 })).toBe("Přidat (2)");
    expect(translate("en", "Acquired item: {name}.", { name: "Lantern" })).toBe("Acquired item: Lantern.");
    expect(translate("en", "Prepared spells")).toBe("Prepared spells");
  });

  it("covers the UI audit backlog and keeps Czech grammar for different level counts", () => {
    installCatalog("cs", catalog);
    expect(translate("cs", "The attack hits. Someone may still add to its damage."))
      .toBe("Útok zasáhl. Někdo může ještě zvýšit jeho zranění.");
    expect(translate("cs", "{name} attacks {target}.", { name: "Alya", target: "skřeta" }))
      .toBe("Alya útočí na skřeta.");
    expect(translate("cs", "1 still to choose. ")).toBe("Zbývá vybrat 1 možnost. ");
    expect(translate("cs", "Hour")).toBe("Hodina");
    expect(translatePlural("cs", "level", "levels", { count: 1 })).toBe("úroveň");
    expect(translatePlural("cs", "level", "levels", { count: 3 })).toBe("úrovně");
    expect(translatePlural("cs", "level", "levels", { count: 5 })).toBe("úrovní");
    expect(translate("en", "{name} attacks {target}.", { name: "Alya", target: "an orc" }))
      .toBe("Alya attacks an orc.");
  });

  it("preserves existing catalog translations rather than overwriting them with old fallback wording", () => {
    installCatalog("cs", catalog);
    expect(translate("cs", "The Saltmarch")).toBe(catalog.messages["The Saltmarch"]);
    expect(translate("cs", "Gear")).toBe(catalog.messages.Gear);
  });
});
