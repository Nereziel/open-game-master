import type { NpcDraft } from "@/lib/npcs/forge";
import type { RollTableEntry } from "@/lib/dm/roll-table-logic";

// The settlement generator (docs/vtt-parity-implementation-plan.md 12.1):
// pure and seeded. From a size, a terrain and a genre it writes a place the
// DM can walk the party into: a layout, a handful of people, a market, two
// rumours and a hook. Everything it makes is data the rest of the app
// already stores, so nothing here knows a database.

export const SETTLEMENT_SIZES = ["thorp", "hamlet", "village", "town", "city"] as const;
export type SettlementSize = (typeof SETTLEMENT_SIZES)[number];

export const SETTLEMENT_TERRAINS = ["plains", "forest", "hills", "mountains", "coast", "river", "swamp", "desert"] as const;
export type SettlementTerrain = (typeof SETTLEMENT_TERRAINS)[number];

export type SettlementShop = { name: string; kind: "general" | "smith" | "apothecary" | "outfitter" | "curiosities"; size: "hamlet" | "village" | "town" | "city"; keeper: string };

export type Settlement = {
  name: string;
  size: SettlementSize;
  terrain: SettlementTerrain;
  layoutDescription: string;
  npcs: NpcDraft[];
  shops: SettlementShop[];
  rumours: RollTableEntry[];
  hook: { title: string; body: string };
};

export function normalizeSettlementSize(raw: unknown): SettlementSize {
  return (SETTLEMENT_SIZES as readonly string[]).includes(String(raw)) ? (raw as SettlementSize) : "village";
}

export function normalizeSettlementTerrain(raw: unknown): SettlementTerrain {
  return (SETTLEMENT_TERRAINS as readonly string[]).includes(String(raw)) ? (raw as SettlementTerrain) : "plains";
}

// A small deterministic generator so the same seed writes the same place.
export function seededRandom(seed: number): () => number {
  let state = (Math.floor(seed) >>> 0) || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function seedFromText(text: string): number {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}

const pick = <T>(random: () => number, list: readonly T[]): T => list[Math.floor(random() * list.length)];

// Name parts by genre feel. A world pack's own hints are prose the model
// reads; these are what a generator without a model can do.
const PLACE_PARTS: Record<string, { first: string[]; last: string[] }> = {
  fantasy: {
    first: ["Thorn", "Ash", "Bright", "Mill", "Oak", "Stone", "Fen", "Harrow", "Wyn", "Elder", "Crow", "Gold"],
    last: ["hollow", "ford", "bury", "wick", "mere", "dale", "gate", "haven", "reach", "moor", "bridge", "well"],
  },
  dark: {
    first: ["Mourn", "Gallow", "Black", "Cinder", "Rook", "Sorrow", "Grim", "Bleak", "Hollow", "Wither"],
    last: ["gate", "fen", "mire", "hold", "cross", "barrow", "ditch", "march", "spire", "wake"],
  },
  modern: {
    first: ["Harlowe", "Wick", "Ashby", "Marlow", "Fenwick", "Calder", "Whitby", "Pemberton"],
    last: [" Cross", "field", " Green", " Hollow", " Bridge", " Heath", "ton", " Row"],
  },
};

const PERSON_FIRST: Record<string, string[]> = {
  fantasy: ["Marla", "Tobin", "Edda", "Corwin", "Hesta", "Bram", "Ilsa", "Fenn", "Osric", "Wren", "Piet", "Sabine"],
  dark: ["Grisel", "Malachy", "Ysolde", "Corvin", "Hedda", "Ambrose", "Nell", "Silas"],
  modern: ["Margaret", "Thomas", "Eleanor", "Arthur", "Ruth", "Walter", "June", "Harold"],
};
const PERSON_LAST: Record<string, string[]> = {
  fantasy: ["Ashcombe", "Tallow", "Redwater", "Hollis", "Greaves", "Marrow", "Sedge", "Quill"],
  dark: ["Vane", "Blackwood", "Crane", "Morrow", "Thorne", "Grimsby"],
  modern: ["Whitlock", "Harlowe", "Pembury", "Fairweather", "Cole", "Ashby"],
};


type SettlementLanguage = "english" | "czech";
// Original fantasy names remain the default for English-language tables.
// Czech tables use a separate authored lexicon, never an external translator:
// the same campaign seed still produces the same people and shops.
const CS_PERSON_FIRST: Record<"fantasy" | "dark" | "modern", string[]> = {
  fantasy: ["Radovan", "Jarmila", "Bohdan", "Milena", "Václav", "Drahomír", "Zdislava", "Jaromír", "Běla", "Ondřej", "Vlasta", "Hanuš"],
  dark: ["Miloslav", "Růžena", "Vít", "Blažena", "Ctibor", "Dobromila", "Marek", "Zora", "Jindřich", "Věra"],
  modern: ["Jan", "Anna", "Petr", "Kateřina", "Tomáš", "Alena", "Josef", "Barbora", "David", "Marie"],
};
const CS_PERSON_LAST: Record<"fantasy" | "dark" | "modern", string[]> = {
  fantasy: ["Záleský", "Hvozd", "Kovář", "Brodský", "Zvoník", "Havran", "Horský", "Potocký", "Šedivý", "Rybář"],
  dark: ["Havran", "Černý", "Popelec", "Hrobník", "Noc", "Trnový", "Vlk", "Havlíček"],
  modern: ["Novák", "Svoboda", "Dvořák", "Černý", "Procházka", "Veselý", "Marek", "Pokorný"],
};
const CS_PLACE_NAMES: Record<"fantasy" | "dark" | "modern", string[]> = {
  fantasy: ["Kamenný Brod", "Větrná Lhota", "Havraní Údolí", "Březový Háj", "Starý Mlýn", "Zlatý Důl", "Dubová Ves"],
  dark: ["Černý Brod", "Havraní Hřbitov", "Mlžná Lhota", "Trnové Údolí", "Popelavá Ves", "Stínový Hvozd"],
  modern: ["Nová Ves", "Dolní Lhota", "Horský Brod", "Bílé Pole", "Vrchovina", "Rybníky"],
};
const CS_ROLES: Record<string, string> = {
  innkeeper: "hostinský", smith: "kovář", priest: "kněz", merchant: "obchodník",
  elder: "rychtář", guard: "strážný", noble: "šlechtic", scholar: "učenec",
  farmer: "sedlák", thief: "zloděj",
};
const CS_TRAITS: Record<string, string[]> = {
  innkeeper: ["pamatuje si každého hosta", "zná drby z celého okolí", "ředí pivo, ale dobře vaří"],
  smith: ["mluví raději s kovadlinou", "dluží peníze cechu", "na každého protivníka má jizvu"],
  priest: ["chrání stará tajemství kaple", "vede seznam zpovědí", "pomáhá i těm, kdo ztratili víru"],
  merchant: ["počítá každou minci dvakrát", "prodává podezřelé zboží", "raději obchoduje se sliby"],
  elder: ["pamatuje staré hranice polí", "nerad rozhoduje bez svědků", "bojí se dávné přísahy"],
  guard: ["střeží bránu sám", "zná všechny pašerácké stezky", "touží po lepší službě"],
  noble: ["má pozemky, ale žádné peníze", "pořádá okázalé hostiny", "tajně hledá ztraceného dědice"],
  scholar: ["pátrá po pohřbených ruinách", "zapisuje každou maličkost", "klade nebezpečné otázky"],
  farmer: ["ztratil tři ovce", "mluví za okolní statky", "nevěří nikomu v naleštěných botách"],
  thief: ["provozuje nenápadný stánek", "překupuje kradené věci", "zná tajné průchody"],
};
const CS_LANDMARKS = ["svatyně", "staré věže", "tržiště", "kaple", "památného dubu", "spálené síně", "menhiru", "panského dvora"];
const CS_ROOFS: Record<SettlementSize, string> = {
  thorp: "tucet stavení", hamlet: "třicet stavení", village: "sto střech",
  town: "několik set domů", city: "nekonečné ulice domů",
};
const CS_LAYOUTS: Record<SettlementTerrain, string[]> = {
  plains: ["{name} leží na křižovatce dvou cest. Kolem návsi a studny stojí {roofs}."],
  forest: ["{name} leží na mýtině mezi stromy. {roofs} chrání polorozpadlá palisáda."],
  hills: ["{name} se rozkládá na úbočí kopce. {roofs} se tiskne k sobě pod {landmark}."],
  mountains: ["{name} se krčí v horském průsmyku. {roofs} má strmé střechy proti sněhu."],
  coast: ["{name} stojí u oblázkového přístavu. {roofs} shlíží k rybářským lodím."],
  river: ["{name} leží na obou březích řeky. {roofs} obklopuje brod a vodní mlýn."],
  swamp: ["{name} stojí na kůlech nad mokřinami. {roofs} propojují vratké lávky."],
  desert: ["{name} obklopuje studnu a několik palem. {roofs} poskytuje stín před žárem."],
};
const CS_RUMOURS = [
  "Z pastvin mizí ovce a nalezené stopy nepatří vlkům.",
  "U {landmark} se po setmění rozsvěcí světla, ačkoli tam už léta nikdo nežije.",
  "V noci přijel jezdec a hledal člověka, jehož jméno se místní bojí vyslovit.",
  "Podle {role2} skrývá {role} důležité tajemství.",
  "U {landmark2} se našly staré mince.",
  "Kupecká karavana má týden zpoždění a východní cesta je prázdná.",
  "Loni měla studna železitou pachuť, ale nikdo o tom nechce mluvit.",
  "Někdo vykoupil všechny svíčky z okolí.",
];
const CS_HOOKS = [
  { title: "Zmizel člověk z {name}", body: "Místní {role} se už tři dny neukázal. Naposledy ho viděli poblíž {landmark}. Za vypátrání prý čeká odměna." },
  { title: "Světla u {name}", body: "Po nocích se u {landmark} objevují podivná světla. {role} shání dobrovolníky, kteří místo prozkoumají." },
  { title: "Dluhy v {name}", body: "Místní {role} dluží peníze nebezpečným lidem. S další karavanou dorazí vymahač a dlužník potřebuje pomoc." },
];
// Each title is grammatical Czech, rather than combining an adjective
// with a mismatched gendered noun ("Křivá smíšené zboží").
const CS_SHOP_NAMES: Record<SettlementShop["kind"], string[]> = {
  general: ["Staré zásoby", "Poctivý kupec", "Krám u brodu", "Smíšené zboží", "Zlatý obchod"],
  smith: ["Křivá kovárna", "Stará kovárna", "Rudá výheň", "U tří kladiv", "Černá kovadlina"],
  apothecary: ["Lékárna u lípy", "Zelené bylinky", "Léčivé lektvary", "Mastičkářství"],
  outfitter: ["Výstroj pocestných", "Cestovní potřeby", "Batohy a lana", "Kupecká výprava"],
  curiosities: ["Staré kuriozity", "Podivuhodnosti", "Vzácné nálezy", "Starožitnosti"],
};

function feel(genre: string): "fantasy" | "dark" | "modern" {
  if (/dark|horror/.test(genre)) return "dark";
  if (/mystery|modern|cyber|noir/.test(genre)) return "modern";
  return "fantasy";
}

export function placeName(random: () => number, genre: string, language: SettlementLanguage = "english"): string {
  if (language === "czech") return pick(random, CS_PLACE_NAMES[feel(genre)]);
  const parts = PLACE_PARTS[feel(genre)];
  return `${pick(random, parts.first)}${pick(random, parts.last)}`;
}

export function personName(random: () => number, genre: string, language: SettlementLanguage = "english"): string {
  if (language === "czech") { const key = feel(genre); return `${pick(random, CS_PERSON_FIRST[key])} ${pick(random, CS_PERSON_LAST[key])}`; }
  const key = feel(genre);
  return `${pick(random, PERSON_FIRST[key])} ${pick(random, PERSON_LAST[key])}`;
}

// The people a place of each size has, in the order they are drawn: the
// keeper of the inn is always first, because the party always finds it.
const ROLES_BY_SIZE: Record<SettlementSize, string[]> = {
  thorp: ["innkeeper", "farmer", "elder"],
  hamlet: ["innkeeper", "smith", "elder", "farmer"],
  village: ["innkeeper", "smith", "priest", "merchant", "elder", "guard"],
  town: ["innkeeper", "smith", "priest", "merchant", "guard", "noble", "scholar"],
  city: ["innkeeper", "smith", "priest", "merchant", "guard", "noble", "scholar", "thief"],
};

// The SRD 5.1 stat block each townsfolk fights with (Appendix B, Nonplayer
// Characters), so a brawl with the guard is a fight with a Guard.
const STAT_BLOCKS: Record<string, string> = {
  innkeeper: "commoner",
  farmer: "commoner",
  elder: "commoner",
  smith: "thug",
  priest: "priest",
  merchant: "commoner",
  guard: "guard",
  noble: "noble",
  scholar: "commoner",
  thief: "spy",
};

const TRAITS: Record<string, string[]> = {
  innkeeper: ["keeps every rumour and sells the best ones", "waters the ale and knows you know", "remembers every face that ever slept upstairs"],
  smith: ["talks only to the anvil", "owes someone in the capital", "has a scar for every bad customer"],
  priest: ["believes more than the temple would like", "hears confessions and keeps a ledger", "is kinder than the sermons"],
  merchant: ["counts twice and smiles once", "has goods nobody asked where from", "will trade in favours"],
  elder: ["remembers when the road went the other way", "decides things by not deciding", "keeps the old names for the fields"],
  guard: ["is the whole watch", "drinks with the people they should be watching", "wants a real posting"],
  noble: ["is land-rich and coin-poor", "throws feasts to be seen", "has a younger sibling problem"],
  scholar: ["is here for something under the ground", "writes everything down", "asks the wrong questions loudly"],
  farmer: ["has lost three sheep and a temper", "speaks for the outlying farms", "distrusts anyone in boots"],
  thief: ["runs the honest-looking stall", "fences for the whole district", "knows the sewers by name"],
};

const ATTITUDES = ["indifferent", "indifferent", "friendly", "hostile"] as const;

const LAYOUTS: Record<SettlementTerrain, string[]> = {
  plains: ["{name} sits where two cart roads cross, a {size} of {roofs} around a well and a green."],
  forest: ["{name} is a {size} cut out of the trees, {roofs} under the eaves and a palisade nobody has mended."],
  hills: ["{name} climbs a hillside in terraces, {roofs} stacked over each other with the {landmark} at the top."],
  mountains: ["{name} huddles in a pass, {roofs} with steep slate roofs and a wall against the wind."],
  coast: ["{name} is a {size} of {roofs} along a shingle harbour, boats drawn up and nets on every fence."],
  river: ["{name} straddles a slow river at a ford, {roofs} on both banks and a mill wheel turning."],
  swamp: ["{name} stands on stilts above the reeds, {roofs} joined by walkways that creak underfoot."],
  desert: ["{name} rings a well under palms, {roofs} of mud brick with awnings against the sun."],
};

const LANDMARKS = ["shrine", "old tower", "market cross", "chapel", "great oak", "burnt hall", "standing stone", "lord's house"];

const ROOF_COUNT: Record<SettlementSize, string> = {
  thorp: "a dozen roofs",
  hamlet: "thirty roofs",
  village: "a hundred roofs",
  town: "some hundreds of roofs",
  city: "streets on streets of roofs",
};

const RUMOURS = [
  "Something has been taking lambs from the far pasture, and the tracks are not a wolf's.",
  "The {landmark} was sealed a generation ago and someone has been in it this month.",
  "A rider came through at night asking after a name nobody would say aloud.",
  "The {role} is not who they say they are, or so the {role2} swears.",
  "There is old coin turning up in the {landmark2}'s foundations.",
  "A caravan is a week overdue and the road east has gone quiet.",
  "The well tasted of iron last spring and nobody talks about why.",
  "Someone has been buying every candle for sale.",
];

const HOOKS = [
  { title: "The missing {role}", body: "{name}'s {role} has not been seen in three days. The last to see them says they went toward the {landmark} and did not come back. A reward is spoken of, quietly." },
  { title: "The lights under {name}", body: "Twice this month lights have shown from the {landmark} after dark. The {role} wants it looked into before the whole {size} decides it is a haunting." },
  { title: "A debt in {name}", body: "The {role} owes someone dangerous, and the collector arrives with the next caravan. They would rather pay strangers to make the problem go away." },
];

function fill(text: string, values: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? key);
}

const SHOP_NAMES = ["{keeper}'s", "The Crooked", "The Honest", "The Old", "The Bright", "The Last"];
const SHOP_NOUNS: Record<SettlementShop["kind"], string[]> = {
  general: ["Sundries", "Stores", "Goods", "Provisions"],
  smith: ["Forge", "Anvil", "Smithy", "Ironworks"],
  apothecary: ["Apothecary", "Remedies", "Herbal", "Physic"],
  outfitter: ["Outfitters", "Packs and Ropes", "Wayfarer's", "Trading Post"],
  curiosities: ["Curiosities", "Wonders", "Oddments", "Antiquary"],
};

const SHOP_KINDS_BY_SIZE: Record<SettlementSize, SettlementShop["kind"][]> = {
  thorp: ["general"],
  hamlet: ["general"],
  village: ["general", "smith"],
  town: ["general", "smith", "apothecary", "outfitter"],
  city: ["general", "smith", "apothecary", "outfitter", "curiosities"],
};

export function generateSettlement(input: { name?: string; size?: unknown; terrain?: unknown; genre?: string; seed?: number; language?: SettlementLanguage }): Settlement {
  const size = normalizeSettlementSize(input.size);
  const terrain = normalizeSettlementTerrain(input.terrain);
  const genre = input.genre ?? "high_fantasy";
  const czech = input.language === "czech";
  const random = seededRandom(input.seed ?? seedFromText(`${input.name ?? ""}|${size}|${terrain}`));
  const name = (input.name ?? "").trim() || placeName(random, genre, input.language);
  const landmarks = czech ? CS_LANDMARKS : LANDMARKS;
  const landmark = pick(random, landmarks);
  const landmark2 = pick(random, landmarks.filter((entry) => entry !== landmark));
  const roles = ROLES_BY_SIZE[size];
  const npcs: NpcDraft[] = roles.map((role) => ({
    name: personName(random, genre, input.language),
    voice: null,
    factionId: "",
    aliases: [],
    attitude: pick(random, ATTITUDES),
    trait: pick(random, (czech ? CS_TRAITS : TRAITS)[role] ?? (czech ? CS_TRAITS : TRAITS).farmer),
    location: name,
    role,
    gender: "",
    personality: null,
    goals: {},
    relations: [],
    statBlock: STAT_BLOCKS[role] ?? "commoner",
  }));
  // Two people who share a name is a slip the seed can make; nobody at the
  // table should have to tell them apart.
  const seen = new Set<string>();
  for (const npc of npcs) {
    while (seen.has(npc.name)) {
      npc.name = personName(random, genre, input.language);
    }
    seen.add(npc.name);
  }
  const shopSize: SettlementShop["size"] = size === "thorp" ? "hamlet" : size;
  const shops: SettlementShop[] = SHOP_KINDS_BY_SIZE[size].map((kind) => {
    const keeper = kind === "smith" ? npcs.find((npc) => npc.role === "smith") : kind === "general" ? npcs.find((npc) => npc.role === "merchant") ?? npcs.find((npc) => npc.role === "innkeeper") : null;
    const keeperName = keeper?.name ?? personName(random, genre, input.language);
    const shopName = czech
      ? pick(random, CS_SHOP_NAMES[kind])
      : `${fill(pick(random, SHOP_NAMES), { keeper: keeperName.split(" ")[0] })} ${pick(random, SHOP_NOUNS[kind])}`;
    return { name: shopName, kind, size: shopSize, keeper: keeperName };
  });
  const values = {
    name,
    size,
    roofs: (czech ? CS_ROOFS : ROOF_COUNT)[size],
    landmark,
    landmark2,
    role: czech ? CS_ROLES[roles[1] ?? "innkeeper"] : roles[1] ?? "innkeeper",
    role2: czech ? CS_ROLES[roles[2] ?? "elder"] : roles[2] ?? "elder",
  };
  const rumourTexts = new Set<string>();
  while (rumourTexts.size < 2) {
    rumourTexts.add(fill(pick(random, czech ? CS_RUMOURS : RUMOURS), values));
  }
  const rumours: RollTableEntry[] = [...rumourTexts].map((text, index) => ({ min: index + 1, max: index + 1, text }));
  const hook = pick(random, czech ? CS_HOOKS : HOOKS);
  return {
    name,
    size,
    terrain,
    layoutDescription: fill(pick(random, czech ? CS_LAYOUTS[terrain] : LAYOUTS[terrain]), values),
    npcs,
    shops,
    rumours,
    hook: { title: fill(hook.title, values), body: fill(hook.body, values) },
  };
}
