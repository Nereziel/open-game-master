import { characterPlaceholder, raceFamily } from "@/lib/placeholders";
import type { Gender } from "@/lib/gender";

// These are the static portraits already shipped in public/assets/placeholders.
// No image model, generated artwork or user-supplied image URLs are involved.
export type GalleryOption = { id: string; name: string };
export type GalleryFilters = { raceId: string; classId: string; gender: Gender };
export type GalleryPortrait = {
  id: string;
  src: string;
  kind: "race" | "class";
  name: string;
  gender: Exclude<Gender, "">;
};

export const GALLERY_GENDERS = ["Female", "Male", "Nonbinary"] as const satisfies readonly Exclude<Gender, "">[];
const RACE_PREFIX = "/assets/placeholders/character-race/";
const CLASS_PREFIX = "/assets/placeholders/character-class/";

// A content pack may include species and classes without a bundled portrait.
// The placeholder resolver knows exactly which of its plates actually exist.
export function hasGalleryRace(id: string): boolean {
  return raceFamily(id) !== null;
}

export function hasGalleryClass(id: string): boolean {
  return characterPlaceholder({ class: id, gender: "Female" }).startsWith(CLASS_PREFIX);
}

export function galleryPortraits(
  races: readonly GalleryOption[],
  classes: readonly GalleryOption[],
  { raceId, classId, gender }: GalleryFilters,
): GalleryPortrait[] {
  const genders = gender ? [gender] : [...GALLERY_GENDERS];
  const results: GalleryPortrait[] = [];
  const seen = new Set<string>();

  // If both selectors are set, offer both interpretations of the character:
  // their species' face and their class's equipment. The art does not claim
  // to combine two traits that were painted separately.
  if (raceId || !classId) {
    for (const race of races) {
      if ((raceId && race.id !== raceId) || !hasGalleryRace(race.id)) continue;
      for (const choice of genders) {
        const src = characterPlaceholder({ race: race.id, gender: choice });
        if (!src.startsWith(RACE_PREFIX) || seen.has(src)) continue;
        seen.add(src);
        results.push({ id: `race:${race.id}:${choice}`, src, kind: "race", name: race.name, gender: choice });
      }
    }
  }

  if (classId || !raceId) {
    for (const klass of classes) {
      if ((classId && klass.id !== classId) || !hasGalleryClass(klass.id)) continue;
      for (const choice of genders) {
        const src = characterPlaceholder({ class: klass.id, gender: choice });
        if (seen.has(src)) continue;
        seen.add(src);
        results.push({ id: `class:${klass.id}:${choice}`, src, kind: "class", name: klass.name, gender: choice });
      }
    }
  }
  return results;
}
