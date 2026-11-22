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
  "Esquire's Rowels": "Při jízdě na koni dávají ostruhy +1 k iniciativě a +2 k třídě zbroje jezdeckého zvířete. Jezdec i zvíře mají výhodu k záchranám na Odolnost proti vyčerpání z cestování delšího než osm hodin denně.",
  "Soulbound Wraps": "Při zásahu neozbrojeným úderem můžeš snížit způsobené zranění až o 10. Za každých 10 neuděleného zranění získáš jeden bod ki. Po dosažení limitu obnovy rovného polovině zdatnostního bonusu se bandáže rozvinou až do příštího úsvitu.",
  "Stasis Stone": "Krystal lze akcí hodit do vzdálenosti 30 stop. Při dopadu se rozbije a všichni tvorové do 10 stop podstoupí záchranu na Odolnost SO 15; při neúspěchu zkamení do konce svého příštího tahu.",
  "Stormheart Bow": "Magický luk při zásahu způsobuje navíc 1k6 bleskového zranění. Má pět nábojů, z nichž 1k4 + 1 se obnoví za úsvitu; náboje umožňují zvláštní ledové a hromové zásahy.",
  "Victory Banner": "Prapor má tři náboje a obnovuje je za úsvitu. Za jeden náboj získáš na minutu výhodu k útokům zbraní; při hodu přirozené 20 můžeš za náboj projít až svou rychlostí bez příležitostných útoků. Musíš být do 5 stop od praporu.",
};
const VAULT_OF_MAGIC_ITEM_NOTES: Readonly<Record<string, string>> = {
  "Air Seed": "Po použití uvolňuje dýchatelný vzduch, rozptyluje okolní plyny a pomáhá tvorům zadržet dech i pod vodou.",
  "Bag of Traps": "Magický vak vytváří náhodné mechanické pasti. Počet vyvolaných pastí je omezen na určité období.",
  "Eye of Horus": "Amulet pomáhá prohlédnout iluze a dává výhodu k záchranným hodům proti vystrašení.",
  "Cloak of the Rat": "Plášť poskytuje bonus +5 k pasivnímu Vnímání.",
};

const VAULT_BY_NAME = Object.fromEntries(
  Object.entries(VAULT_OF_MAGIC_ITEM_NOTES).map(([english, czech]) => [textKey(english), czech]),
);

const BY_NAME = Object.fromEntries(
  Object.entries(TOME_OF_HEROES_WEAPON_NOTES).map(([english, czech]) => [textKey(english), czech]),
);

export function thirdPartyItemSummaryCs(
  reference: { source?: string; documentSlug?: string; name?: string },
  locale: Locale,
): string | null {
  if (locale !== "cs" || reference.source !== "open5e") return null;
  const key = textKey(reference.name ?? "");
  if (reference.documentSlug === "toh") return BY_NAME[key] ?? null;
  if (reference.documentSlug === "vom") return VAULT_BY_NAME[key] ?? null;
  return null;
}
