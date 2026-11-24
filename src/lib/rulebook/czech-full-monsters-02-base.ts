// Úplné překlady nestvůr SRD 5.1, CC BY 4.0 (Wizards of the Coast LLC).
// Číselný statblok se načítá beze změn z kanonického originálu;
// překlady vlastností, schopností a akcí se dodávají úplné v samostatných souborech.
import source from "./srd-5.1.json";

type SourcePage = { id: string; kind: string; md: string };
const monsterPages = new Map<string, string>(
  (source.pages as SourcePage[])
    .filter((page) => page.kind === "monster")
    .map((page): [string, string] => [page.id, page.md]),
);

const labels: Record<string, string> = {
  "Armor Class": "Obranné číslo", "Hit Points": "Životy", "Speed": "Rychlost",
  "Saving Throws": "Záchranné hody", Skills: "Dovednosti",
  "Damage Resistances": "Odolnosti vůči zranění", "Damage Immunities": "Imunity vůči zranění",
  "Damage Vulnerabilities": "Zranitelnosti vůči zranění", "Condition Immunities": "Imunity vůči stavům",
  Senses: "Smysly", Languages: "Jazyky", Challenge: "Nebezpečnost",
};

const localizedValues: ReadonlyArray<readonly [string, string]> = [
  ["Giant Eagle, understands Common and Auran but can't speak them", "řeč obřích orlů; rozumí obecné řeči a auranštině, ale nemluví jimi"],
  ["Giant Elk, understands Common, Elvish, and Sylvan but can't speak them", "řeč obřích losů; rozumí obecné řeči, elfštině a sylvánštině, ale nemluví jimi"],
  ["Giant Owl, understands Common, Elvish, and Sylvan but can't speak them", "řeč obřích sov; rozumí obecné řeči, elfštině a sylvánštině, ale nemluví jimi"],
  ["understands the languages of its creator but can't speak", "rozumí jazykům svého stvořitele, ale neumí mluvit"],
  ["any languages it knew in life", "všechny jazyky, které znal za života"],
  ["any one language (usually Common)", "jeden libovolný jazyk (obvykle obecná řeč)"],
  ["understands Common but can't speak", "rozumí obecné řeči, ale neumí mluvit"],
  ["from nonmagical attacks that aren't adamantine", "z nemagických útoků, které nejsou vedeny adamantinovými zbraněmi"],
  ["from nonmagical attacks that aren't silvered", "z nemagických útoků, které nejsou vedeny postříbřenými zbraněmi"],
  ["from nonmagical attacks", "z nemagických útoků"],
  ["bludgeoning, piercing, and slashing", "drtivé, bodné a sečné"],
  ["(blind beyond this radius)", "(mimo tento dosah slepý)"],
  ["while deafened", "při ohluchnutí"],
  [" or ", " nebo "], ["(hover)", "(vznášení)"],
  ["chain shirt", "drátěná košile"], ["patchwork armor", "zbroj ze sešitých kusů"],
  ["studded leather", "okovaná kožená zbroj"], ["hide armor", "usňová zbroj"],
  ["leather armor", "kožená zbroj"],
  ["Darkvision", "vidění ve tmě"], ["Fire", "ohnivé"], ["Poisoned", "otrávený"], ["Poison", "jedové"],
  ["Terran", "terranština"], ["Ignan", "ignanština"], ["Orc", "orčtina"],
  ["Gnoll", "gnolština"], ["Goblin", "goblinština"], ["Sphinx", "sfingština"],
  ["Gnomish", "gnómština"],
  ["unconscious", "v bezvědomí"], ["grappled", "uchvácený"],
  ["natural armor", "přirozená zbroj"], ["scale mail", "šupinová zbroj"],
  ["chain mail", "drátěná zbroj"], ["plate", "plátová zbroj"], ["shield", "štít"],
  ["with *barkskin*", "s *kůrokůží*"], ["darkvision", "vidění ve tmě"],
  ["blindsight", "mimozrakové vnímání"], ["truesight", "pravdivé vidění"],
  ["tremorsense", "citlivost na otřesy"], ["passive Perception", "pasivní Vnímání"],
  ["fly ", "létání "], ["climb ", "šplhání "], ["swim ", "plavání "],
  ["burrow ", "hrabání "], ["ft.", "stop"], [" ft", " stop"],
  ["Animal Handling", "Ovládání zvířat"], ["Perception", "Vnímání"],
  ["Stealth", "Nenápadnost"], ["Deception", "Klamání"], ["Insight", "Vhled"],
  ["Medicine", "Lékařství"], ["Nature", "Příroda"], ["Athletics", "Atletika"],
  ["Intimidation", "Zastrašování"], ["Arcana", "Mystika"], ["Survival", "Přežití"],
  ["History", "Historie"], ["Persuasion", "Přesvědčování"],
  ["Acrobatics", "Akrobacie"], ["Investigation", "Pátrání"],
  ["Sleight of Hand", "Čachry"], ["Religion", "Náboženství"],
  ["Dex ", "Obr "], ["Con ", "Odl "], ["Wis ", "Mou "], ["Cha ", "Cha "],
  ["Str ", "Sil "], ["Int ", "Int "],
  ["bludgeoning", "drtivé"], ["piercing", "bodné"], ["slashing", "sečné"],
  ["cold", "chladné"], ["lightning", "bleskové"], ["thunder", "hromové"],
  ["fire", "ohnivé"], ["poisoned", "otrávený"], ["poison", "jedové"],
  ["acid", "kyselinové"], ["necrotic", "nekrotické"], ["radiant", "zářivé"],
  ["psychic", "psychické"], ["force", "silové"],
  ["charmed", "zmámený"], ["frightened", "vystrašený"],
  ["paralyzed", "paralyzovaný"], ["petrified", "zkamenělý"],
  ["prone", "ležící"], ["restrained", "zadržený"],
  ["exhaustion", "únava"], ["blinded", "slepý"],
  ["deafened", "hluchý"], ["Abyssal", "jazyk Propasti"],
  ["Auran", "auranština"], ["Aquan", "aquanština"], ["Draconic", "dračtina"],
  ["Elvish", "elfština"], ["Undercommon", "podtemná řeč"],
  ["Dwarvish", "trpasličtina"], ["Sylvan", "sylvánština"],
  ["Common", "obecná řeč"], ["Giant", "obří řeč"], ["Infernal", "pekelština"],
  ["Celestial", "nebeština"], ["Primordial", "prvotní řeč"],
  ["Deep Speech", "hlubinná řeč"], ["Gnomish", "gnómština"],
  ["Druidic plus any two languages", "druidština a dva libovolné další jazyky"],
  ["telepathy", "telepatie"],
  ["works only with creatures that understand jazyk Propasti", "funguje jen s tvory, kteří rozumějí jazyku Propasti"],
  ["STR", "SÍL"], ["DEX", "OBR"], ["CON", "ODL"], ["INT", "INT"],
  ["WIS", "MOU"], ["CHA", "CHA"], ["XP", "ZK"],
];

function localizeHeaderBlock(block: string): string {
  let result = block;
  for (const [english, czech] of Object.entries(labels)) {
    result = result.replace(`**${english}**`, `**${czech}**`);
  }
  for (const [english, czech] of localizedValues) {
    result = result.replaceAll(english, czech);
  }
  return result;
}

/**
 * Spojí úplný přeložený text schopností s původními numerickými údaji,
 * které se nesmějí při překladu žádným způsobem změnit.
 * První část originálu končí polem Challenge; zbytek je plný český překlad.
 */
export function assembleCzechMonster02(id: string, translatedMeta: string, translatedBody: string): string {
  const original = monsterPages.get(id);
  if (!original) throw new Error(`Chybějící nestvůra SRD: ${id}`);
  const blocks = original.split("\n\n");
  const challenge = blocks.findIndex((block) => block.startsWith("**Challenge**"));
  if (challenge < 0) throw new Error(`Chybějící nebezpečnost SRD: ${id}`);
  const header = blocks.slice(0, challenge + 1).map(localizeHeaderBlock);
  header[0] = `*${translatedMeta}*`;
  return [...header, translatedBody.trim()].join("\n\n");
}
