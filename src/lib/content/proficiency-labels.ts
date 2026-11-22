import type { Locale } from "@/lib/i18n/translate";

// Shared character-sheet terminology for canonical proficiency values.
// IDs remain English in stored character data; the UI and PDF only render labels.
export type TrainingKind = "armor" | "weapons";

const CZECH_TRAINING: Record<TrainingKind, Record<string, [string, string]>> = {
  armor: {
    light: ["Lehká", "Lehká zbroj"],
    "light armor": ["Lehká zbroj", "Lehká zbroj"],
    medium: ["Střední", "Střední zbroj"],
    "medium armor": ["Střední zbroj", "Střední zbroj"],
    heavy: ["Těžká", "Těžká zbroj"],
    "heavy armor": ["Těžká zbroj", "Těžká zbroj"],
    shield: ["Štít", "Štít"],
    shields: ["Štíty", "Štíty"],
    "all armor": ["Veškerá zbroj", "Veškerá zbroj"],
  },
  weapons: {
    simple: ["Jednoduché", "Jednoduché zbraně"],
    "simple weapons": ["Jednoduché zbraně", "Jednoduché zbraně"],
    martial: ["Vojenské", "Vojenské zbraně"],
    "martial weapons": ["Vojenské zbraně", "Vojenské zbraně"],
  },
};

export function trainingProficiencyLabel(
  value: string,
  kind: TrainingKind,
  locale: Locale,
  expanded = false,
): string | null {
  if (locale !== "cs") return null;
  const key = value.trim().toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");
  const names = CZECH_TRAINING[kind][key];
  return names ? names[expanded ? 1 : 0] : null;
}
