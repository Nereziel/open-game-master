// Shared display-only translation entry point for game data.
// Canonical IDs and user-authored text are never rewritten in storage.
// The installed locale catalogs (cs.json, names-cs.ts) supply the values.
import type { Locale } from "./translate";
import { translate } from "./translate";
import { contentName, classFeatureName, backgroundFeatureLabel, type FrNamesTable } from "@/lib/content/names";
import { czechBundledSpeciesTrait } from "@/lib/content/species-traits-cs";
import { trainingProficiencyLabel, type TrainingKind } from "@/lib/content/proficiency-labels";

export type GameTextKind = FrNamesTable | "items";

export function gameName(kind: GameTextKind, name: string, locale: Locale): string {
  return contentName(kind, name, locale);
}

export function gameProficiency(
  value: string, kind: TrainingKind, locale: Locale, expanded = false,
): string | null {
  return trainingProficiencyLabel(value, kind, locale, expanded);
}

export function gameFeature(
  name: string,
  source: "class" | "race" | "background" | "feat" | "choice" | "story",
  locale: Locale,
  context: { classId?: string; background?: string } = {},
): string {
  if (source === "race" && locale === "cs") {
    const known = czechBundledSpeciesTrait(name);
    if (known) return `${known.name} — ${known.description}`;
  }
  if (source === "class" && context.classId) return classFeatureName(context.classId, name, locale);
  if (source === "background" && context.background) return backgroundFeatureLabel(context.background, name, locale);
  return translate(locale, name);
}

export function gamePersonalityLine(value: string, locale: Locale): string {
  if (locale === "en" || !value) return value;
  const labels: Record<string, string> = {
    trait: "Personality trait", ideal: "Ideal", bond: "Bond", flaw: "Flaw",
  };
  return value.split("; ").map((part) => {
    const match = /^(trait|ideal|bond|flaw) "([\s\S]*)"$/.exec(part);
    if (!match) return translate(locale, part);
    return `${translate(locale, labels[match[1]])}: "${translate(locale, match[2])}"`;
  }).join("; ");
}
