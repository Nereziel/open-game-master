// A title to start from, for someone who would rather name the campaign once
// they know what it is: the dice beside the title field roll one in the
// genre's own words. Always editable, never required to be kept. Pure, for
// scripts/test-campaign-creator-flow.mjs.
//
// Each language keeps its own banks, and the composer only ever
// concatenates, never agrees: a French thing carries its article ("le
// Serment"), a French mark is a phrase that never changes with the noun
// ("sans Voix", "de Fer"), and a French place carries its contraction
// ("du royaume de cendre", "de la Marche d'argent"), so « La Couronne sans
// Voix du royaume de cendre » assembles mechanically and always reads
// right. Evocative translations, not word-for-word ones.

import type { Locale } from "@/lib/i18n/translate";
type Bank = { things: string[]; places: string[]; marks: string[] };

const FANTASY: Bank = {
  things: ["Crown", "Oath", "Throne", "Ember", "Blade", "Hollow", "Tide", "Song", "Wyrm", "Lantern"],
  places: ["the Ash Kingdom", "Greywater", "the Sunken Keep", "Thornhold", "the Silver March", "Vael", "the Old Road", "Emberfall"],
  marks: ["Last", "Broken", "Hidden", "Forgotten", "Burning", "Silent", "Shattered"],
};

const BANKS: Record<string, Bank> = {
  high_fantasy: FANTASY,
  dark_fantasy: {
    things: ["Rot", "Hunger", "Pyre", "Bell", "Crown", "Wound", "Veil", "Grave"],
    places: ["the Blighted Vale", "Ravensmoor", "the Ashen Abbey", "Morrow's End", "the Drowned Choir"],
    marks: ["Black", "Weeping", "Hollow", "Bleeding", "Last", "Pale"],
  },
  mystery: {
    things: ["Letter", "Key", "Locket", "Ledger", "Portrait", "Clock", "Masquerade", "Will"],
    places: ["Blackwood Manor", "Harrow Street", "the Gilded Theatre", "Fenwick Hall", "the Night Train"],
    marks: ["Missing", "Thirteenth", "Silent", "Crimson", "Final", "Stolen"],
  },
  horror: {
    things: ["Hunger", "Whisper", "Bell", "Dark", "Door", "Lullaby", "Visitor", "Harvest"],
    places: ["Hollow Creek", "the Asylum", "Saltmarsh", "the Lighthouse", "Widow's Rest"],
    marks: ["Endless", "Drowned", "Crawling", "Quiet", "Last", "Pale"],
  },
  cyberpunk: {
    things: ["Signal", "Ghost", "Protocol", "Static", "Contract", "Circuit", "Glitch", "Neon"],
    places: ["Sector Nine", "the Undercity", "Kowloon Stack", "the Glass Spire", "Night Market"],
    marks: ["Dead", "Chrome", "Broken", "Black", "Zero", "Hollow"],
  },
  steampunk: {
    things: ["Engine", "Gear", "Airship", "Clockwork", "Furnace", "Compass", "Expedition", "Patent"],
    places: ["Brasshaven", "the Iron Quarter", "the Cloud Docks", "Gearmouth", "the Copper Line"],
    marks: ["Brass", "Final", "Lost", "Silent", "Clockwork", "Gilded"],
  },
  post_apocalyptic: {
    things: ["Wasteland", "Signal", "Convoy", "Water", "Fallout", "Radio", "Bunker", "Dust"],
    places: ["the Dry Sea", "Route 66", "the Glass Desert", "Rust Town", "the Dead Zone"],
    marks: ["Last", "Burning", "Lost", "Rusted", "Silent", "Final"],
  },
};

const FANTASY_FR: Bank = {
  things: ["la Couronne", "le Serment", "le Trône", "la Braise", "la Lame", "le Creux", "la Marée", "le Chant", "le Wyrm", "la Lanterne"],
  places: [
    "du royaume de cendre",
    "des Eaux grises",
    "du Donjon englouti",
    "de Fort-Épines",
    "de la Marche d'argent",
    "de Vael",
    "de la Vieille route",
    "des Chutes de braise",
  ],
  marks: ["sans Héritier", "en éclats", "des Brumes", "de l'Oubli", "en flammes", "sans Voix", "sans Fin"],
};

const BANKS_FR: Record<string, Bank> = {
  high_fantasy: FANTASY_FR,
  dark_fantasy: {
    things: ["la Pourriture", "la Faim", "le Bûcher", "la Cloche", "la Couronne", "la Plaie", "le Voile", "la Tombe"],
    places: [
      "du Vallon rongé",
      "de Corbeaumont",
      "de l'Abbaye cendrée",
      "du Bout de demain",
      "du Chœur noyé",
    ],
    marks: ["de Nuit", "en larmes", "sans Fond", "qui saigne", "sans Héritier", "de Cendre"],
  },
  mystery: {
    things: ["la Lettre", "la Clé", "le Médaillon", "le Registre", "le Portrait", "l'Horloge", "le Bal masqué", "le Testament"],
    places: [
      "du Manoir Bois-Noir",
      "de la rue Harrow",
      "du Théâtre doré",
      "de la demeure Fenwick",
      "du Train de nuit",
    ],
    marks: ["sans Adresse", "de Minuit", "sans Mot", "en Rouge", "de la Dernière Heure", "sans Trace"],
  },
  horror: {
    things: ["la Faim", "le Murmure", "la Cloche", "le Noir", "la Porte", "la Berceuse", "le Visiteur", "la Moisson"],
    places: [
      "du Ruisseau creux",
      "de l'Asile",
      "de Salcombemarée",
      "du Phare",
      "du Repos de la Veuve",
    ],
    marks: ["sans Fin", "des Noyés", "qui rampe", "sans Bruit", "du Dernier Soupir", "sans Visage"],
  },
  cyberpunk: {
    things: ["le Signal", "le Fantôme", "le Protocole", "la Statique", "le Contrat", "le Circuit", "le Bug", "le Néon"],
    places: [
      "du Secteur Neuf",
      "de la Basse-ville",
      "des Tours de Kowloon",
      "de la Flèche de verre",
      "du Marché de nuit",
    ],
    marks: ["hors Ligne", "de Chrome", "en Panne", "au Noir", "à Zéro", "sans Écho"],
  },
  steampunk: {
    things: ["la Machine", "l'Engrenage", "le Dirigeable", "l'Automate", "la Fournaise", "le Compas", "l'Expédition", "le Brevet"],
    places: [
      "de Laitonhaven",
      "du Quartier de fer",
      "des Docks des nuages",
      "d'Engreneville",
      "de la Ligne de cuivre",
    ],
    marks: ["de Laiton", "du Dernier Voyage", "sans Retour", "sans Bruit", "à ressort", "à l'Or fin"],
  },
  post_apocalyptic: {
    things: ["le Désert", "le Signal", "le Convoi", "l'Eau", "les Retombées", "la Radio", "le Bunker", "la Poussière"],
    places: [
      "de la Mer sèche",
      "de la Route 66",
      "du Désert de verre",
      "de la Ville-de-Rouille",
      "de la Zone morte",
    ],
    marks: ["du Dernier Jour", "en flammes", "sans Fréquence", "de Rouille", "sans Onde", "de l'Après"],
  },
};

// Czech marks and places are phrases independent of the noun's gender.
const BANKS_CS: Record<string, Bank> = {
  "high_fantasy": {
    "things": [
      "Koruna",
      "Přísaha",
      "Trůn",
      "Žár",
      "Čepel",
      "Propast",
      "Příliv",
      "Píseň",
      "Drak",
      "Lucerna"
    ],
    "places": [
      "v Popelavém království",
      "u Šedých vod",
      "v Potopené tvrzi",
      "na Trnovém hradě",
      "ve Stříbrné marce",
      "ve Vaelu",
      "na Staré cestě",
      "v Žáropádu"
    ],
    "marks": [
      "bez dědice",
      "z mlh",
      "zapomnění",
      "v plamenech",
      "beze slov",
      "bez konce",
      "z dávných časů"
    ]
  },
  "dark_fantasy": {
    "things": [
      "Hniloba",
      "Hlad",
      "Hranice",
      "Zvon",
      "Koruna",
      "Rána",
      "Závoj",
      "Hrob"
    ],
    "places": [
      "v Prokletém údolí",
      "v Havranově",
      "v Popelavém opatství",
      "na Konci úsvitu",
      "u Utopeného chóru"
    ],
    "marks": [
      "z temnot",
      "bez naděje",
      "beze dna",
      "z krve",
      "bez milosti",
      "z popela"
    ]
  },
  "mystery": {
    "things": [
      "Dopis",
      "Klíč",
      "Medailon",
      "Účetní kniha",
      "Portrét",
      "Hodiny",
      "Maškarní ples",
      "Závěť"
    ],
    "places": [
      "na Černoleském panství",
      "v Harrowově ulici",
      "ve Zlatém divadle",
      "v sídle Fenwickových",
      "v nočním vlaku"
    ],
    "marks": [
      "bez adresy",
      "o půlnoci",
      "beze slov",
      "v rudé",
      "poslední hodiny",
      "beze stopy"
    ]
  },
  "horror": {
    "things": [
      "Hlad",
      "Šepot",
      "Zvon",
      "Temnota",
      "Dveře",
      "Ukolébavka",
      "Návštěvník",
      "Sklizeň"
    ],
    "places": [
      "u Dutého potoka",
      "v ústavu",
      "v Solných močálech",
      "u majáku",
      "ve Vdovině útočišti"
    ],
    "marks": [
      "bez konce",
      "utopenců",
      "z hlubin",
      "beze zvuku",
      "posledního dechu",
      "bez tváře"
    ]
  },
  "cyberpunk": {
    "things": [
      "Signál",
      "Duch",
      "Protokol",
      "Šum",
      "Kontrakt",
      "Obvod",
      "Porucha",
      "Neon"
    ],
    "places": [
      "v sektoru devět",
      "v podzemním městě",
      "ve věžích Kowloonu",
      "ve Skleněné věži",
      "na nočním trhu"
    ],
    "marks": [
      "mimo síť",
      "z chromu",
      "bez spojení",
      "v utajení",
      "na nule",
      "bez ozvěny"
    ]
  },
  "steampunk": {
    "things": [
      "Stroj",
      "Soukolí",
      "Vzducholoď",
      "Automat",
      "Výheň",
      "Kompas",
      "Výprava",
      "Patent"
    ],
    "places": [
      "v Mosazném přístavu",
      "v Železné čtvrti",
      "v Oblačných docích",
      "v Ozubeném městě",
      "na Měděné trati"
    ],
    "marks": [
      "z mosazi",
      "poslední cesty",
      "bez návratu",
      "beze zvuku",
      "na pružinu",
      "ze zlata"
    ]
  },
  "post_apocalyptic": {
    "things": [
      "Pustina",
      "Signál",
      "Konvoj",
      "Voda",
      "Spad",
      "Rádio",
      "Bunkr",
      "Prach"
    ],
    "places": [
      "u Vyschlého moře",
      "na silnici 66",
      "ve Skleněné poušti",
      "v Rezavém městě",
      "v Mrtvé zóně"
    ],
    "marks": [
      "posledního dne",
      "v plamenech",
      "bez frekvence",
      "z rzi",
      "bez vln",
      "po konci světa"
    ]
  }
};

const pickOne = <T,>(list: T[], random: () => number) => list[Math.floor(random() * list.length) % list.length];

// Titles start the sentence they are, so the thing's article is capitalised
// ("le Serment" -> "Le Serment"); marks and places keep their case.
const cap = (title: string) => title.charAt(0).toUpperCase() + title.slice(1);

type TitleComposer = (bank: Bank, shape: number, random: () => number) => string;

const composeEnglish: TitleComposer = (bank, shape, random) =>
  shape === 0
    ? `The ${pickOne(bank.marks, random)} ${pickOne(bank.things, random)}`
    : shape === 1
      ? `${pickOne(bank.things, random)} of ${pickOne(bank.places, random)}`
      : `The ${pickOne(bank.marks, random)} ${pickOne(bank.things, random)} of ${pickOne(bank.places, random)}`;

// These banks contain ready-made grammatical phrases, including prepositions.
const composePhrases: TitleComposer = (bank, shape, random) =>
  cap(
    shape === 0
      ? `${pickOne(bank.things, random)} ${pickOne(bank.marks, random)}`
      : shape === 1
        ? `${pickOne(bank.things, random)} ${pickOne(bank.places, random)}`
        : `${pickOne(bank.things, random)} ${pickOne(bank.marks, random)} ${pickOne(bank.places, random)}`,
  );

const TITLE_BANKS_BY_LOCALE: Record<Locale, { banks: Record<string, Bank>; fallback: Bank; compose: TitleComposer }> = {
  en: { banks: BANKS, fallback: FANTASY, compose: composeEnglish },
  fr: { banks: BANKS_FR, fallback: FANTASY_FR, compose: composePhrases },
  cs: { banks: BANKS_CS, fallback: BANKS_CS.high_fantasy, compose: composePhrases },
};

export function rollCampaignTitle(genre: string, current = "", random: () => number = Math.random, locale: Locale = "en"): string {
  const { banks, fallback, compose } = TITLE_BANKS_BY_LOCALE[locale] ?? TITLE_BANKS_BY_LOCALE.en;
  const bank = banks[genre] ?? fallback;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const title = compose(bank, Math.floor(random() * 3), random);
    if (title !== current) return title;
  }
  return compose(bank, 1, random);
}
