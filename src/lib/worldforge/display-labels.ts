// Player-facing names for WorldForge's built-in types, fields and standard
// imported folders. World documents still store their original English data.
// A renamed type/field is always shown exactly as its author wrote it.
import type { Locale } from "@/lib/messages-logic";
import type { FieldDef, WorldType } from "@/lib/worldforge/model";

const DEFAULT_TYPES: Record<string, { en: string; cs: string }> = {
  t_character: { en: "Character", cs: "Postava" },
  t_location: { en: "Location", cs: "Místo" },
  t_faction: { en: "Faction", cs: "Frakce" },
  t_artifact: { en: "Artifact", cs: "Artefakt" },
  t_deity: { en: "Deity", cs: "Božstvo" },
  t_culture: { en: "Culture", cs: "Kultura" },
  t_other: { en: "Other", cs: "Ostatní" },
};

const DEFAULT_FIELDS: Record<string, { en: string; cs: string }> = {
  f_born: { en: "Born", cs: "Narození" },
  f_died: { en: "Died", cs: "Úmrtí" },
  f_species: { en: "Species", cs: "Druh" },
  f_population: { en: "Population", cs: "Počet obyvatel" },
  f_ruler: { en: "Ruled by", cs: "Vládce" },
  f_founded: { en: "Founded", cs: "Založeno" },
  f_seat: { en: "Seat of power", cs: "Sídlo moci" },
  f_maker: { en: "Made by", cs: "Tvůrce" },
  f_domains: { en: "Domains", cs: "Domény" },
  f_alignment: { en: "Alignment", cs: "Přesvědčení" },
};

// Standard names from WorldForge imports. Only the visible labels change;
// the folder ids, paths, hierarchy, filters and persisted names stay intact.
const DEFAULT_FOLDERS: Record<string, string> = {
  Characters: "Postavy",
  Character: "Postava",
  Locations: "Místa",
  Location: "Místo",
  Factions: "Frakce",
  Faction: "Frakce",
  Artifacts: "Artefakty",
  Artifact: "Artefakt",
  Deities: "Božstva",
  Deity: "Božstvo",
  Cultures: "Kultury",
  Culture: "Kultura",
  Geography: "Zeměpis",
  History: "Historie",
  Magic: "Magie",
  Religion: "Náboženství",
  Lore: "Kronika světa",
  Other: "Ostatní",
};

export function worldTypeLabel(type: Pick<WorldType, "id" | "name">, locale: Locale): string {
  const known = DEFAULT_TYPES[type.id];
  return locale === "cs" && known?.en === type.name ? known.cs : type.name;
}

export function worldFieldLabel(field: Pick<FieldDef, "id" | "name">, locale: Locale): string {
  const known = DEFAULT_FIELDS[field.id];
  return locale === "cs" && known?.en === field.name ? known.cs : field.name;
}

export function worldFolderLabel(name: string, locale: Locale): string {
  return locale === "cs" ? DEFAULT_FOLDERS[name] ?? name : name;
}
