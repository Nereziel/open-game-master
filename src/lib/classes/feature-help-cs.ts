// Complete display-only Czech text for all 733 features of the 36 original
// genre classes. Source descriptions/IDs are English for game logic and the DM.
import { FEATURES_CS_CYBERPUNK } from "./feature-help-cs-cyberpunk";
import { FEATURES_CS_DARK_FANTASY } from "./feature-help-cs-dark-fantasy";
import { FEATURES_CS_HORROR } from "./feature-help-cs-horror";
import { FEATURES_CS_MYSTERY } from "./feature-help-cs-mystery";
import { FEATURES_CS_POST_APOCALYPTIC } from "./feature-help-cs-post-apocalyptic";
import { FEATURES_CS_STEAMPUNK } from "./feature-help-cs-steampunk";

type FeatureTranslation = { name: string; description: string };
export const GENRE_CLASS_FEATURES_CS: Readonly<Record<string, Record<string, FeatureTranslation>>> = {
  ...FEATURES_CS_CYBERPUNK,
  ...FEATURES_CS_DARK_FANTASY,
  ...FEATURES_CS_HORROR,
  ...FEATURES_CS_MYSTERY,
  ...FEATURES_CS_POST_APOCALYPTIC,
  ...FEATURES_CS_STEAMPUNK,
};

export function genreFeatureCs(classId: string, englishName: string): FeatureTranslation | null {
  return GENRE_CLASS_FEATURES_CS[classId.trim().toLowerCase().replace(/-/g, "_")]?.[englishName] ?? null;
}

// A class-specific lookup matters: different class features can share a
// name but have different mechanics (e.g. Extra Attack for Packmaster).
export function genreFeatureNameCs(classId: string, englishName: string): string | null {
  return genreFeatureCs(classId, englishName)?.name ?? null;
}

export function genreFeatureDescriptionCs(classId: string, englishName: string): string | null {
  return genreFeatureCs(classId, englishName)?.description ?? null;
}

export const GENRE_SUBCLASS_NAMES_CS: Readonly<Record<string, string>> = {
  netrunner: "Lamač černého ICE",
  street_samurai: "Chromový derviš",
  rigger: "Jezdec dronů",
  fixer: "Obchodník s informacemi",
  esper: "Spalovač myslí",
  trauma_doc: "Bojová evakuace",
  witch_hunter: "Řád stříbrného plamene",
  plague_doctor: "Havraní cech",
  grave_knight: "Dvůr zvadlé růže",
  penitent: "Popelavý chór",
  dirgesinger: "Kolej posledního obřadu",
  vermin_lord: "Král pod ulicemi",
  exorcist: "Řád svíce",
  occultist: "Strážce závoje",
  survivor: "Poslední stojící",
  slayer: "Lóže stříbrného kolíku",
  parapsychologist: "Společnost pro psychický výzkum",
  apostate: "Zjizvený zasvěcenec",
  detective: "Poradní detektiv",
  alienist: "Škola nevědomí",
  grifter: "Dlouhý podvod",
  enforcer: "Odborářská síla",
  muckraker: "Síť dopisovatelů",
  spirit_medium: "Kruh závoje",
  scavenger: "Sběrač rzi",
  road_warrior: "Dálniční nájezdník",
  aberrant: "Chimérický kmen",
  salvage_tech: "Kult reaktoru",
  waste_preacher: "Církev posledního úsvitu",
  packmaster: "Pouto alfy",
  machinist: "Hodinářský mistr",
  aeronaut: "Nebeský korzár",
  alchemist: "Škola vitriolu",
  gadgeteer: "Geniální kutil",
  aether_channeler: "Bouřné dynamo",
  steam_knight: "Paroplátový předvoj",
};
