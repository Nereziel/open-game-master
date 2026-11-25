import gearDescriptions from "./item-descriptions-cs.json";
import { textKey } from "@/lib/language/text-logic";

const GEAR_DESCRIPTIONS: Readonly<Record<string, string>> = {
  ...gearDescriptions,
  // Core SRD armor prose is not part of the adventuring gear catalog.
  shield: "Štít je vyrobený ze dřeva nebo kovu a drží se v jedné ruce. Používání štítu zvyšuje tvé obranné číslo o 2. Výhody můžeš získat pouze z jednoho štítu současně.",
};

export function czechGearDescription(name: string): string | undefined {
  const key = textKey(name);
  // Some editions spell Thieves\' Tools without the possessive apostrophe.
  return Object.hasOwn(GEAR_DESCRIPTIONS, key) ? GEAR_DESCRIPTIONS[key] : undefined;
}
