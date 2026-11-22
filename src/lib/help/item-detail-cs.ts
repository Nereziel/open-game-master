// Display-only Czech labels for the item details modal. Keep source data,
// stored inventory names, numerical mechanics and non-Czech locales intact.
import { translate, type Locale } from "@/lib/i18n/translate";

const LABELS: Readonly<Record<string, string>> = {
  "Weight": "Hmotnost", "Value": "Cena", "Damage": "Zranění",
  "Range": "Dostřel", "Armor class": "Obranné číslo", "AC bonus": "Bonus k OČ",
  "Armor": "Zbroj", "Weapon": "Zbraň", "Description": "Popis",
  "None": "Žádné", "No damage": "Bez zranění",
  "Strength": "Síla", "Dexterity": "Obratnost", "Stealth": "Nenápadnost",
  "Shield": "Štít", "Requires attunement": "Vyžaduje sladění",
  "Adventuring gear": "Dobrodružná výbava", "Adventuring Gear": "Dobrodružná výbava",
  "Martial ranged weapon": "Vojenská zbraň na dálku",
  "Martial melee weapon": "Vojenská zbraň na blízko",
  "Simple ranged weapon": "Jednoduchá zbraň na dálku",
  "Simple melee weapon": "Jednoduchá zbraň na blízko",
  "Martial ranged": "Vojenská zbraň na dálku",
  "Martial melee": "Vojenská zbraň na blízko",
  "Simple ranged": "Jednoduchá zbraň na dálku",
  "Simple melee": "Jednoduchá zbraň na blízko",
  "Light armor": "Lehká zbroj", "Medium armor": "Střední zbroj",
  "Heavy armor": "Těžká zbroj", "Wondrous item": "Podivuhodný předmět",
  "Magic item": "Magický předmět",
  "Common": "Běžný", "Uncommon": "Neobvyklý", "Rare": "Vzácný",
  "Very rare": "Velmi vzácný", "Legendary": "Legendární",
  "Artifact": "Artefakt",
  "Ammunition": "Střelná", "Double-headed": "Oboustranná",
  "Finesse": "Vytříbená", "Gunpowder": "Střelný prach",
  "Heavy": "Těžká", "Light": "Lehká", "Loading": "Nabíjecí",
  "Magazine": "Zásobník", "Reach": "Dlouhá", "Special": "Zvláštní",
  "Thrown": "Vrhací", "Two-handed": "Obouruční", "Versatile": "Jeden a půlruční",
  "Acid": "Kyselinové", "Bludgeoning": "Drtivé", "Cold": "Chladné",
  "Fire": "Ohnivé", "Force": "Silové", "Lightning": "Bleskové",
  "Necrotic": "Nekrotické", "Piercing": "Bodné", "Poison": "Jedové",
  "Psychic": "Psychické", "Radiant": "Zářivé",
  "Slashing": "Sečné", "Thunder": "Hromové",
  "Common clothes.": "Obyčejné oblečení.",
  "Add your full Dexterity modifier.": "Přičti celou svou opravu Obratnosti.",
  "Dexterity does not add to it.": "Oprava Obratnosti se nepřičítá.",
  "Carried in one hand; only one shield counts at a time.": "Štít se drží v jedné ruce. Započítává se vždy jen jeden.",
  "No minimum.": "Bez požadavku.",
  "No penalty.": "Bez postihu.",
  "Disadvantage on Dexterity (Stealth) checks while wearing it.": "Při nošení máš nevýhodu k ověřením Obratnosti (Nenápadnost).",
  "It does not hurt on its own; its special rules say what it does.": "Samo o sobě nezpůsobuje zranění; jeho účinek určují zvláštní pravidla.",
  "Needs arrows, bolts or stones to attack at range; the ammunition is spent as it is fired.": "K útokům na dálku potřebuješ šípy, šipky nebo kameny; při výstřelu se munice spotřebuje.",
  "A weapon with a striking end at each side; the second end can make the extra light-weapon attack, doing the die in brackets.": "Zbraň má údernou část na obou koncích; druhým koncem lze provést dodatečný útok lehkou zbraní se zraněním uvedeným v závorce.",
  "Attack and damage may use Dexterity instead of Strength, whichever is better.": "Při hodu na útok i na zranění můžeš použít místo Síly Obratnost.",
  "Fires with black powder, which it consumes along with the shot; wet or missing powder means it cannot fire.": "Ke střelbě spotřebovává černý prach; bez něj nebo s mokrým prachem nelze vystřelit.",
  "Too big for Small creatures to use well: they attack with disadvantage.": "Malí tvorové mají při útoku touto těžkou zbraní nevýhodu.",
  "Small enough to fight with one in each hand (two-weapon fighting).": "Zbraň je vhodná pro boj dvěma zbraněmi, v každé ruce jednou.",
  "Slow to reload: only one shot per action, bonus action or reaction, however many attacks you have.": "Kvůli nabíjení můžeš při jedné akci, bonusové akci nebo reakci vystřelit jen jednou bez ohledu na počet útoků.",
  "Holds the number of shots in brackets; once they are spent, an action reloads it.": "Zásobník pojme počet střel uvedený v závorce; po jejich spotřebování se dobíjí akcí.",
  "Strikes 5 feet further than usual, so 10 feet away instead of 5.": "Dosah útoku na blízko se prodlužuje o 5 stop, obvykle na 10 stop.",
  "Has its own rules beyond the usual attack; the GM applies them when it is used.": "Zbraň má zvláštní pravidla, která při použití vyhodnocuje Pán jeskyně.",
  "Can be thrown to make a ranged attack, using the same ability as a melee swing with it.": "Zbraň lze vrhnout na dálku; používá se stejná vlastnost jako při útoku na blízko.",
  "Needs both hands to attack with, so no shield or second weapon.": "K útoku potřebuješ obě ruce, takže současně nemůžeš používat štít ani druhou zbraň.",
  "Usable in one hand or two; the two-handed grip does the larger damage die in brackets.": "Lze ji používat jednoručně i obouručně. Při obouručním držení způsobuje vyšší zranění uvedené v závorce.",
  "Corrosive: sprays, oozes and dissolving breath.": "Žíravé zranění: kyselina, slizy a leptající dech.",
  "Blunt force: clubs, hammers, fists, falling.": "Tupé údery: kyje, kladiva, pěsti či pády.",
  "Freezing: ice breath, rays of frost, winter magic.": "Mrazivé zranění: ledový dech, mrazivé paprsky a zimní magie.",
  "Burning: dragon fire, fireballs, torches.": "Žár a plameny: dračí oheň, ohnivé koule a pochodně.",
  "Pure magical energy; almost nothing resists it (magic missile, eldritch blast).": "Čistá magická energie, které odolává jen máloco.",
  "Electricity: bolts, blue dragons, storm magic.": "Elektřina: blesky, modří draci a bouřková magie.",
  "Withering life force: undead touches, life drain, most death magic.": "Ničivá síla smrti: dotyk nemrtvých a vysávání životní energie.",
  "Puncture: arrows, spears, fangs.": "Průrazné zranění: šípy, kopí a tesáky.",
  "Venom and toxins: stings, poisoned blades, poison breath.": "Jedy a toxiny: žihadla, otrávené čepele a jedovatý dech.",
  "Mental assault: mind flayers, some enchantments, telepathic damage.": "Útok na mysl: mentální a telepatické účinky.",
  "Holy light and searing brilliance: celestials, clerics' spells, the sun.": "Posvátné světlo a záře: nebeští tvorové, kouzla kleriků a slunce.",
  "Cutting: swords, axes, claws.": "Řezné a sečné zranění: meče, sekery a drápy.",
  "Concussive sound: thunderwave, shatter, a giant's shout.": "Otřesový zvuk: hromové vlny, tříštění a ohlušující výkřiky.",
};

export function itemDetailCs(value: string | null | undefined, locale: Locale): string {
  if (!value || locale !== "cs") return value ?? "";
  const exact = LABELS[value];
  if (exact) return exact;
  const translated = translate(locale, value);
  if (translated !== value) return translated;
  const rangedAmmo = /^Ammunition \((range )?(\d+\/\d+)\)$/i.exec(value);
  if (rangedAmmo) return `Střelná (dostřel ${rangedAmmo[2]})`;
  const dexCap = /^Add your Dexterity modifier, up to \+(\d+)\.$/.exec(value);
  if (dexCap) return `Přičti opravu Obratnosti, nejvýše +${dexCap[1]}.`;
  const minStr = /^Needs (\d+); below that, your speed drops by 10 feet while wearing it\.$/.exec(value);
  if (minStr) return `Vyžaduje Sílu ${minStr[1]}; při nižší hodnotě se rychlost sníží o 10 stop.`;
  const bonusWeapon = /^\+(\d+) weapon$/.exec(value);
  if (bonusWeapon) return `Magická zbraň +${bonusWeapon[1]}`;
  const bonusText = /^Adds (\d+) to attack and damage rolls\.$/.exec(value);
  if (bonusText) return `Přidává +${bonusText[1]} k hodům na útok a zranění.`;
  const magicTag = /^\+(\d+) magic$/.exec(value);
  if (magicTag) return `Magický bonus +${magicTag[1]}`;
  return value;
}

// The bundled content pack can still supply English prose for ordinary SRD
// equipment. Use original Czech descriptions of these canonical entries in
// Czech UI only; do not change stored data or other locales. These are not
// translations of homebrew item descriptions.
const COMMON_SRD_DESCRIPTIONS_CS: Readonly<Record<string, string>> = {
  "book": "Kniha může obsahovat básně, dějiny, náboženské texty, poznámky o určitém oboru nebo jiný psaný obsah. Její skutečné informace určuje Pán jeskyně.",
  "longsword": "Dlouhý meč je vojenská zbraň na blízko. Způsobuje 1k8 sečného zranění, při držení oběma rukama 1k10. Má vlastnost jeden a půlruční.",
  "shield": "Štít se drží v jedné ruce a při používání poskytuje bonus +2 k obrannému číslu (OČ). Současně lze využít bonus pouze jednoho štítu.",
};

export function itemDescriptionCs(name: string, description: string | null, locale: Locale): string | null {
  if (!description || locale !== "cs") return description;
  const canonical = name.toLowerCase().trim().replace(/\s*\+\d+$/, "");
  // Only replace text evidently supplied in English, not an existing Czech
  // translation or a custom Czech description using the same item name.
  if (!/\b(the|with|contains|can|weapon|shield|book|this|you|your)\b/i.test(description)) {
    return description;
  }
  return COMMON_SRD_DESCRIPTIONS_CS[canonical] ?? itemDetailCs(description, locale);
}

export function itemWeightCs(value: string | null, locale: Locale): string | null {
  if (!value || locale !== "cs") return value;
  return value.replace(/\blb\./g, "libry");
}

export function itemRangeCs(value: string | null, locale: Locale): string | null {
  if (!value || locale !== "cs") return value;
  return value.replace(/\bft\./g, "stop");
}
