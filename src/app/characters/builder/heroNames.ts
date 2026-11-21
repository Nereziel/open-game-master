// The name dice beside the builder's name field: one tap rolls a name that
// fits the chosen lineage, or any lineage before one is chosen. A world pack's
// own people's names come first when it has them. The lists are ODM's own,
// written for this; given names lean neutral so the roll never decides who
// the character is.
import { lineageFamily } from "./lineage";

type Names = { given: string[]; family: string[] };

const HUMAN: Names = {
  given: ["Rowan", "Ash", "Morgan", "Sable", "Quinn", "Ellis", "Tamsin", "Corin", "Hollis", "Wren", "Bram", "Isa", "Merrit", "Joss"],
  family: ["Ashvale", "Marrow", "Thornfield", "Greaves", "Hollowell", "Brightwater", "Dunmore", "Keel", "Fairwind", "Coldbrook"],
};
const ELF: Names = {
  given: ["Aerin", "Ilyra", "Faen", "Sylvar", "Liran", "Eryndel", "Thaelis", "Naeva", "Caelith", "Seren"],
  family: ["Moonbrook", "Silverleaf", "Duskwhisper", "Starwind", "Amberfall", "Dawnmere"],
};

const NAMES: Record<string, Names> = {
  human: HUMAN,
  elf: ELF,
  "half-elf": { given: [...HUMAN.given.slice(0, 7), ...ELF.given.slice(0, 5)], family: [...HUMAN.family.slice(0, 5), ...ELF.family.slice(0, 3)] },
  dwarf: {
    given: ["Brann", "Sigra", "Torvik", "Runa", "Ottmar", "Ketta", "Haldor", "Hild", "Grima", "Durn"],
    family: ["Stoutheart", "Ironfoot", "Gravelbeard", "Deepdelve", "Hammerfall", "Coppervein", "Stonemantle"],
  },
  halfling: {
    given: ["Pip", "Rosie", "Tobin", "Cade", "Milo", "Poppy", "Fen", "Bramble", "Nell", "Tuck"],
    family: ["Applewhistle", "Hearthkettle", "Mossbottom", "Copperpot", "Tumblebrook", "Butterbank"],
  },
  gnome: {
    given: ["Fizz", "Nim", "Bimble", "Tink", "Quillon", "Zook", "Dabble", "Orrin", "Pell", "Wix"],
    family: ["Cogsworth", "Gearwhistle", "Sparkletop", "Tinkerton", "Brassbuckle", "Fiddlespring"],
  },
  "half-orc": {
    given: ["Draka", "Murga", "Rusk", "Varga", "Krull", "Sharn", "Ogra", "Gash", "Torka", "Brugg"],
    family: ["Bonecutter", "Ashtusk", "Ironjaw", "Redhand", "Stonebrow", "Grimhollow"],
  },
  dragonborn: {
    given: ["Vyrrath", "Kesh", "Thravik", "Sorrix", "Balaxa", "Rhazul", "Ixen", "Zaveth", "Quarrin", "Sulra"],
    family: ["Ashscale", "Embercrest", "Vorrathi", "Stormclaw", "Kaldrex", "Brightfang"],
  },
  tiefling: {
    given: ["Ember", "Vesper", "Nyx", "Caius", "Mordai", "Riven", "Solace", "Hex", "Lament", "Sorrow"],
    family: ["Ashvale", "Marrow", "Greaves", "Coldbrook", "Duskwhisper"],
  },
};

// Localized name dice for a Czech-language interface. Source pack seeds
// stay untouched as world lore, but the dice roll from these when Czech is
// selected rather than presenting English surnames as a default.
const CZ_HUMAN: Names = {
  given: ["Radovan", "Milada", "Bohdan", "Jarmila", "Vít", "Vlasta", "Ctibor", "Živa", "Hanuš", "Růžena", "Jaromír", "Běla"],
  family: ["Záleský", "Brodský", "Kovář", "Havran", "Horský", "Šedivý", "Hvozd", "Potocký", "Zvoník", "Větrovský"],
};
const CZ_ELF: Names = {
  given: ["Líren", "Elíra", "Faelin", "Naeva", "Sylvan", "Aelína", "Eryndel", "Tírel"],
  family: ["Stříbrný list", "Měsíční háj", "Jitřní vítr", "Tichý proud", "Hvězdný pramen"],
};
const CZ_NAMES: Record<string, Names> = {
  human: CZ_HUMAN,
  elf: CZ_ELF,
  "half-elf": { given: [...CZ_HUMAN.given.slice(0, 6), ...CZ_ELF.given.slice(0, 5)], family: [...CZ_HUMAN.family.slice(0, 5), ...CZ_ELF.family.slice(0, 3)] },
  dwarf: {
    given: ["Bran", "Runa", "Torvik", "Sigra", "Otmar", "Hilda", "Durn", "Gríma"],
    family: ["Železná pěst", "Hluboký důl", "Měděný vous", "Skalní štít", "Kladivák", "Kamenný plášť"],
  },
  halfling: {
    given: ["Pípek", "Róza", "Tobiáš", "Běla", "Míla", "Fanda", "Nela", "Pavlík"],
    family: ["Jablečník", "Mechová pata", "Měděný hrnec", "Máslový břeh", "Kotlík", "Březový"],
  },
  gnome: {
    given: ["Cink", "Nim", "Bim", "Tinka", "Zuko", "Orrin", "Mínek", "Pela"],
    family: ["Jiskřička", "Ozubené kolečko", "Mosazník", "Pružinka", "Křesadlo", "Vrtikolo"],
  },
  "half-orc": {
    given: ["Draka", "Murga", "Rusk", "Varga", "Krul", "Šarna", "Ogra", "Torka"],
    family: ["Drtikost", "Železná čelist", "Rudá ruka", "Kamenné obočí", "Temný tesák"],
  },
  dragonborn: {
    given: ["Vyrat", "Keš", "Travik", "Sorix", "Balaxa", "Razul", "Ixen", "Sulra"],
    family: ["Popelavá šupina", "Bouřný dráp", "Jasný tesák", "Žhavý hřeben", "Mrazivý dech"],
  },
  tiefling: {
    given: ["Jiskra", "Vesper", "Nykta", "Mordai", "Útěcha", "Stín", "Nářek", "Žár"],
    family: ["Popelavý", "Půlnoční", "Černý brod", "Šerý list", "Havraní stín"],
  },
};

const pick = <T>(list: readonly T[], rng: () => number): T => list[Math.floor(rng() * list.length) % list.length];

// A name for the lineage chosen so far (none yet: any lineage's), never the
// one the field already holds when there is another to give.
export function rollHeroName({
  raceId = "",
  raceName = "",
  packNames = [],
  current = "",
  locale = "en",
  rng = Math.random,
}: {
  raceId?: string;
  raceName?: string;
  packNames?: string[];
  current?: string;
  locale?: "en" | "fr" | "cs";
  rng?: () => number;
}): string {
  const now = current.trim();
  if (packNames.length && locale !== "cs") {
    // Drawn from the names that are not already in the field, so a pack of
    // two always gives the other.
    const others = packNames.filter((name) => name !== now);
    return pick(others.length ? others : packNames, rng);
  }
  const family = raceId || raceName ? lineageFamily(raceId, raceName) : null;
  const pools = locale === "cs" ? CZ_NAMES : NAMES;
  const names = (family && pools[family]) || pick(Object.values(pools), rng);
  const name = `${pick(names.given, rng)} ${pick(names.family, rng)}`;
  if (name !== now) {
    return name;
  }
  // The same pair twice: keep the family, take the next given name.
  const next = names.given[(names.given.indexOf(name.split(" ")[0]) + 1) % names.given.length];
  return `${next} ${name.split(" ").slice(1).join(" ")}`;
}
