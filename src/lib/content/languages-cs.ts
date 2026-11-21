// Display-only D&D 5e language names. English names remain canonical in
// character sheets, rule-engine checks and content-pack integrations.
// Terminology follows the Czech D&D 5e glossary published on d20.cz.
import type { Locale } from "@/lib/i18n/translate";

const CZECH_LANGUAGES: Readonly<Record<string, string>> = {
  Common: "Obecná řeč",
  Dwarvish: "Trpasličtina",
  Elvish: "Elfština",
  Giant: "Gigantština",
  Gnomish: "Gnómština",
  Goblin: "Goblinština",
  Halfling: "Hobitština",
  Orc: "Orkština",
  Abyssal: "Démonština",
  Celestial: "Nebesština",
  Draconic: "Dračí řeč",
  "Deep Speech": "Hlubinština",
  Infernal: "Ďábelština",
  Primordial: "Prvotština",
  Sylvan: "Sylvánština",
  Undercommon: "Temnobecná řeč",
  Auran: "Auranština",
  Aquan: "Akvanština",
  Ignan: "Ignanština",
  Terran: "Terranština",
};

export function languageLabel(name: string, locale: Locale): string {
  return locale === "cs" ? CZECH_LANGUAGES[name] ?? name : name;
}
