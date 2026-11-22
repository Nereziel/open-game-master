// Independent Czech orientation notes for a few documented supplement
// weapons. These deliberately do NOT replace the source's full rules: the
// unique 'special' mechanics remain in the original English description.
import { textKey } from "@/lib/language/text-logic";
import type { Locale } from "@/lib/i18n/translate";

const TOME_OF_HEROES_WEAPON_NOTES: Readonly<Record<string, string>> = {
  "Axespear": "Vojenská zbraň na blízko se dvěma údernými konci. Její druhý konec má vlastní kostku zranění.",
  "Barge Pole": "Jednoduchá obouruční zbraň s prodlouženým dosahem a zvláštními pravidly použití.",
  "Bladed Scarf": "Ohebná sečná zbraň s prodlouženým dosahem a vlastností vytříbená.",
  "Blunderbuss": "Obouruční palná zbraň na střelný prach. Před dalším výstřelem vyžaduje nabití.",
  "Bolas": "Vrhací zbraň se zvláštními pravidly. Uvedený dosah je 5/15 stop.",
  "Chain Hook": "Řetězový hák s prodlouženým dosahem, který lze také vrhat.",
  "Chakram": "Vrhací sečná zbraň s dostřelem 20/60 stop.",
  "Climbing Adze": "Lehká sečná zbraň použitelná při boji na blízko.",
  "Clockwork Crossbow": "Mechanická obouruční kuše se zásobníkem na šest střel.",
  "Dwarven Revolving Musket": "Obouruční mušketa na střelný prach s otočným zásobníkem na osm střel.",
  "Elven Dueling Blade": "Obouruční elfská sečná zbraň s vlastností vytříbená.",
  "Joining Dirks": "Dvojice lehkých vytříbených dýk se zvláštním způsobem společného použití.",
  "Wormsilk Net": "Vrhací síť se zvláštními pravidly a dostřelem 10/20 stop.",
  "Wormsilk Whip": "Sečná zbraň s prodlouženým dosahem a vlastností vytříbená.",
  "Wrist Knife": "Lehká vytříbená čepel pro boj na blízko.",
};
const BY_NAME = Object.fromEntries(
  Object.entries(TOME_OF_HEROES_WEAPON_NOTES).map(([english, czech]) => [textKey(english), czech]),
);

export function thirdPartyItemSummaryCs(
  reference: { source?: string; documentSlug?: string; name?: string },
  locale: Locale,
): string | null {
  if (locale !== "cs" || reference.source !== "open5e" || reference.documentSlug !== "toh") return null;
  return BY_NAME[textKey(reference.name ?? "")] ?? null;
}
