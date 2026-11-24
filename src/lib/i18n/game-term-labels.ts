// Shared presentation labels for monster and item editors. Keep this module
// small and independent of the rulebook's large translation tables.
// The Czech sizes/types are the existing reviewed stat-block terminology.
// Senses: https://dnd5esrd.d20.cz/bestiar/uvod.html
// Dragon colors: https://dnd5esrd.d20.cz/pruvodce-pana-jeskyne/7-kapitola.html
import type { Locale } from "./translate.ts";

const SIZE_WORDS_FR: Record<string, string> = {
  Tiny: "Très petite",
  Small: "Petite",
  Medium: "Moyenne",
  Large: "Grande",
  Huge: "Très grande",
  Gargantuan: "Gigantesque",
};

const CREATURE_TYPE_WORDS_FR: Record<string, string> = {
  aberration: "Aberration",
  beast: "Bête",
  celestial: "Céleste",
  construct: "Artificiel",
  dragon: "Dragon",
  elemental: "Élémentaire",
  fey: "Fée",
  fiend: "Fiélon",
  giant: "Géant",
  humanoid: "Humanoïde",
  monstrosity: "Monstrosité",
  ooze: "Vase",
  plant: "Plante",
  undead: "Mort-vivant",
};

const MOVEMENT_WORDS_FR: Record<string, string> = {
  walk: "marche",
  burrow: "fouissement",
  climb: "escalade",
  fly: "vol",
  swim: "nage",
};

const DRAGON_COLOR_WORDS_FR: Record<string, string> = {
  black: "noir",
  blue: "bleu",
  brass: "airain",
  bronze: "bronze",
  copper: "cuivre",
  gold: "or",
  green: "vert",
  red: "rouge",
  silver: "argent",
  white: "blanc",
};

const SENSE_WORDS_FR: Record<string, string> = {
  darkvision: "vision dans le noir",
  blindsight: "vision aveugle",
  tremorsense: "perception des vibrations",
  truesight: "vision lucide",
};

export const CZECH_MONSTER_SIZES: Readonly<Record<string, string>> = {
  Tiny: "Drobný",
  Small: "Malý",
  Medium: "Střední",
  Large: "Velký",
  Huge: "Obrovský",
  Gargantuan: "Gigantický",
};

export const CZECH_CREATURE_TYPES: Readonly<Record<string, string>> = {
  aberration: "zrůda",
  beast: "zvíře",
  celestial: "nebešťan",
  construct: "výtvor",
  dragon: "drak",
  elemental: "elementál",
  fey: "víla",
  fiend: "běs",
  giant: "obr",
  humanoid: "humanoid",
  monstrosity: "obluda",
  ooze: "sliz",
  plant: "rostlina",
  undead: "nemrtvý",
};

const MOVEMENT_WORDS_CS = { walk: "chůze", burrow: "hrabání", climb: "šplhání", fly: "létání", swim: "plavání" };
const SENSE_WORDS_CS = { darkvision: "vidění ve tmě", blindsight: "mimozrakové vnímání", tremorsense: "citlivost na otřesy", truesight: "pravdivé vidění" };
const DRAGON_COLOR_WORDS_CS = { black: "černý", blue: "modrý", brass: "mosazný", bronze: "bronzový", copper: "měděný", gold: "zlatý", green: "zelený", red: "rudý", silver: "stříbrný", white: "bílý" };

type Words = Readonly<Record<string, string>>;
type TermKind = "size" | "creatureType" | "movement" | "sense" | "dragonColor";
const TERMS: Record<TermKind, Partial<Record<Locale, Words>>> = {
  size: { fr: SIZE_WORDS_FR, cs: CZECH_MONSTER_SIZES },
  creatureType: { fr: CREATURE_TYPE_WORDS_FR, cs: CZECH_CREATURE_TYPES },
  movement: { fr: MOVEMENT_WORDS_FR, cs: MOVEMENT_WORDS_CS },
  sense: { fr: SENSE_WORDS_FR, cs: SENSE_WORDS_CS },
  dragonColor: { fr: DRAGON_COLOR_WORDS_FR, cs: DRAGON_COLOR_WORDS_CS },
};

const capital = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

export function gameTermWord(kind: TermKind, value: string, locale: Locale): string {
  const label = TERMS[kind][locale]?.[value] ?? value;
  return kind === "creatureType" || (kind === "dragonColor" && locale !== "en") ? capital(label) : label;
}
