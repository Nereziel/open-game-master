import gearDescriptions from "./item-descriptions-cs.json";
import { textKey } from "@/lib/language/text-logic";

const GEAR_DESCRIPTIONS: Readonly<Record<string, string>> = gearDescriptions;

export function czechGearDescription(name: string): string | undefined {
  const key = textKey(name);
  // Some editions spell Thieves\' Tools without the possessive apostrophe.
  return Object.hasOwn(GEAR_DESCRIPTIONS, key) ? GEAR_DESCRIPTIONS[key] : undefined;
}
