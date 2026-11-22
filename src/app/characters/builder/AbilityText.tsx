"use client";

import { useLocale, useT } from "@/lib/locale";
import { abilityShortLabel } from "@/lib/srd/ability-short-label";
import { abilityName } from "./lineage";

// A card keeps canonical codes in its source text ("CON +2", "INT caster"),
// but displays locale-aware abbreviations (ODL, INT in Czech). Screen readers
// hear the full localized ability name instead of the abbreviation, and the
// same full name appears in the hover title.
const CODE = /\b(STR|DEX|CON|INT|WIS|CHA)\b/;
const ABILITY_KEYS: Record<string, string> = {
  STR: "Strength",
  DEX: "Dexterity",
  CON: "Constitution",
  INT: "Intelligence",
  WIS: "Wisdom",
  CHA: "Charisma",
};

export function AbilityText({ text }: { text: string }) {
  const t = useT();
  const locale = useLocale();
  const parts = text.split(CODE);
  if (parts.length === 1) {
    return text;
  }
  return parts.map((part, index) => {
    if (index % 2 === 0) {
      return part;
    }
    const name = ABILITY_KEYS[part] ? t(ABILITY_KEYS[part]) : abilityName(part.toLowerCase());
    const code = abilityShortLabel(part.toLowerCase(), locale);
    return (
      <abbr key={index} title={name} className="no-underline">
        <span aria-hidden="true">{code}</span>
        <span className="sr-only">{name}</span>
      </abbr>
    );
  });
}
