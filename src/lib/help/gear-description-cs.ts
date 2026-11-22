// Reuse the already-reviewed Czech SRD 5.1 chapters as the authoritative
// descriptions for basic gear. These strings are display-only; rule mechanics,
// canonical English IDs, content-pack data, and English output remain intact.
import { CZECH_FULL_RULES_18 } from "@/lib/rulebook/czech-full-rules-18";
import { CZECH_FULL_RULES_6 } from "@/lib/rulebook/czech-full-rules-6";
import { CZECH_FULL_RULES_11 } from "@/lib/rulebook/czech-full-rules-11";

// The section source uses "***Český název.*** Text", sometimes across
// paragraphs. Only read its described entries; skip tables and other sections.
function entriesFromChapter(markdown: string): Map<string, string> {
  const result = new Map<string, string>();
  const pattern = /\*\*\*([^*\n]+?)\*\*\*\s*([\s\S]*?)(?=\n\n\*\*\*|\n\n## |$)/g;
  for (const match of markdown.matchAll(pattern)) {
    const title = match[1].trim().replace(/\.$/, "").toLowerCase();
    const text = match[2].trim();
    if (title && text) result.set(title, text);
  }
  return result;
}

const GEAR = entriesFromChapter(CZECH_FULL_RULES_18["adventuring-gear"] ?? "");
const ARMOR = entriesFromChapter(CZECH_FULL_RULES_6["armor"] ?? "");
const WEAPONS = entriesFromChapter(CZECH_FULL_RULES_11["weapons"] ?? "");

// The English keys are canonical SRD table names, not translated inventory IDs.
// Include common Open5e table names and variants used by the character builder.
const GEAR_NAMES: Readonly<Record<string, string>> = {
  "acid": "kyselina", "acid (vial)": "kyselina",
  "alchemist's fire": "alchymistický oheň", "alchemist's fire (flask)": "alchymistický oheň",
  "antitoxin": "protijed", "antitoxin (vial)": "protijed",
  "arcane focus": "mystický ohniskový předmět",
  "ball bearings": "kuličky", "ball bearings (bag of 1,000)": "kuličky",
  "block and tackle": "kladkostroj",
  "book": "kniha",
  "caltrops": "ježci", "caltrops (bag of 20)": "ježci",
  "candle": "svíčka",
  "case, crossbow bolt": "toulec na šipky do kuše", "crossbow bolt case": "toulec na šipky do kuše",
  "case, map or scroll": "pouzdro na mapy nebo svitky", "map or scroll case": "pouzdro na mapy nebo svitky",
  "chain": "řetěz", "chain (10 feet)": "řetěz",
  "climber's kit": "horolezecká souprava",
  "component pouch": "brašnička na suroviny",
  "crowbar": "páčidlo",
  "druidic focus": "druidský ohniskový předmět",
  "fishing tackle": "rybářské potřeby",
  "healer's kit": "léčitelská souprava",
  "holy symbol": "svatý symbol",
  "holy water": "svěcená voda", "holy water (flask)": "svěcená voda",
  "hunting trap": "lovecká past",
  "lamp": "lampa",
  "lantern, bullseye": "lucerna, směrová", "bullseye lantern": "lucerna, směrová",
  "lantern, hooded": "lucerna s okenicemi", "hooded lantern": "lucerna s okenicemi",
  "lock": "zámek",
  "magnifying glass": "lupa",
  "manacles": "okovy",
  "mess kit": "nádobíčko",
  "oil": "olej", "oil (flask)": "olej",
  "poison, basic": "základní jed", "poison, basic (vial)": "základní jed", "basic poison": "základní jed",
  "potion of healing": "léčivý lektvar",
  "pouch": "brašnička",
  "quiver": "toulec na šípy",
  "ram, portable": "přenosné beranidlo", "portable ram": "přenosné beranidlo",
  "rations": "zásoby", "rations (1 day)": "zásoby",
  "rope": "provaz", "rope, hempen (50 feet)": "provaz", "rope, silk (50 feet)": "provaz",
  "scale, merchant's": "kupecké váhy", "merchant's scale": "kupecké váhy",
  "spellbook": "kniha kouzel",
  "spyglass": "dalekohled",
  "tent": "stan", "tent, two-person": "stan",
  "tinderbox": "křesadlo",
  "torch": "pochodeň",
  "burglar's pack": "lupičský balíček (16 zl)",
  "diplomat's pack": "diplomatický balíček (39 zl)",
  "dungeoneer's pack": "jeskyňářský balíček (12 zl)",
  "entertainer's pack": "zábavní balíček (40 zl)",
  "explorer's pack": "průzkumnický balíček (10 zl)",
  "priest's pack": "kněžský balíček (19 zl)",
  "scholar's pack": "badatelský balíček (40 zl)",
};

const ARMOR_NAMES: Readonly<Record<string, string>> = {
  "padded": "vycpávaná zbroj", "padded armor": "vycpávaná zbroj",
  "leather": "kožená zbroj", "leather armor": "kožená zbroj",
  "studded leather": "pobíjená kožená zbroj", "studded leather armor": "pobíjená kožená zbroj",
  "hide": "kožešinová", "hide armor": "kožešinová",
  "chain shirt": "kroužková košile",
  "scale mail": "šupinová zbroj",
  "breastplate": "kyrys",
  "half plate": "poloviční plátová zbroj",
  "ring mail": "kroužková zbroj",
  "chain mail": "kroužková brň",
  "splint": "pásová zbroj",
  "plate": "plátová zbroj", "plate armor": "plátová zbroj",
};

// The remaining mundane SRD table entries have no dedicated prose in the
// English source either. Keep their Czech identification short, factual,
// and free of invented mechanical effects.
const PLAIN_GEAR: Readonly<Record<string, string>> = {
  "abacus": "Počítadlo s posuvnými korálky pro základní početní úkony.",
  "backpack": "Torna pro přenášení osobního vybavení na cestách.",
  "barrel": "Sud pro skladování kapalin nebo jiných zásob.",
  "basket": "Košík pro přenášení drobných předmětů.",
  "bedroll": "Svinovací podložka a přikrývka pro spaní na cestách.",
  "bell": "Malý zvonek sloužící k vydávání zvukového znamení.",
  "blanket": "Přikrývka pro odpočinek a ochranu před chladem.",
  "bottle, glass": "Skleněná láhev pro uchovávání tekutin.",
  "bucket": "Vědro pro přenášení vody a dalších materiálů.",
  "chalk (1 piece)": "Kousek křídy na psaní a značení povrchů.",
  "chest": "Pevná truhla na uložení předmětů.",
  "clothes, common": "Obyčejné každodenní oblečení.",
  "clothes, costume": "Kostým určený k představení nebo převleku.",
  "clothes, fine": "Kvalitní společenské oblečení.",
  "clothes, traveler's": "Odolné oblečení vhodné na dlouhé cesty.",
  "flask or tankard": "Lahvička nebo korbel na nápoje.",
  "grappling hook": "Hák k zachycení za pevný předmět, zpravidla používaný s provazem.",
  "hammer": "Kladivo pro zatloukání hřebů a běžnou práci.",
  "hammer, sledge": "Velké těžké kladivo pro práci vyžadující silné údery.",
  "hourglass": "Přesýpací hodiny pro měření času.",
  "ink (1 ounce bottle)": "Lahvička inkoustu pro psaní.",
  "ink pen": "Psací pero používané s inkoustem.",
  "jug or pitcher": "Džbán pro přenášení a nalévání tekutin.",
  "ladder (10-foot)": "Žebřík dlouhý 10 stop, sloužící k dosažení vyvýšených míst.",
  "mirror, steel": "Leštěné ocelové zrcátko.",
  "paper (one sheet)": "List papíru pro psaní nebo kreslení.",
  "parchment (one sheet)": "List pergamenu pro psaní nebo kreslení.",
  "perfume (vial)": "Malá lahvička vonné látky.",
  "pick, miner's": "Hornický krumpáč pro lámání a kopání tvrdého materiálu.",
  "piton": "Kovová skoba pro upevnění lana při lezení.",
  "pole (10-foot)": "Tyč dlouhá 10 stop pro dosah na vzdálené předměty.",
  "pot, iron": "Železný kotlík pro vaření.",
  "robes": "Dlouhé volné roucho.",
  "sack": "Pytel pro přenášení a skladování výbavy.",
  "sealing wax": "Pečetní vosk k uzavírání listin.",
  "shovel": "Lopata pro kopání a přesouvání zeminy.",
  "signal whistle": "Píšťalka pro vydávání zvukových signálů.",
  "signet ring": "Pečetní prsten pro otisk osobního nebo rodového znaku.",
  "soap": "Mýdlo pro mytí a čištění.",
  "iron spikes (10)": "Sada deseti železných hřebů pro upevňování a zajišťování.",
  "vial": "Malá lahvička pro uchovávání tekutin.",
  "waterskin": "Kožený měch na přenášení vody.",
  "whetstone": "Brousek pro ostření kovových čepelí.",
};

function key(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ").replace(/\s*\+\d+$/, "");
}

export function canonicalGearDescriptionCs(name: string): string | null {
  const normalized = key(name);
  const gearTitle = GEAR_NAMES[normalized];
  if (gearTitle) return GEAR.get(gearTitle) ?? null;
  const armorTitle = ARMOR_NAMES[normalized];
  if (armorTitle) return ARMOR.get(armorTitle) ?? null;
  if (normalized === "shield") return "Štít se drží v jedné ruce a poskytuje bonus +2 k obrannému číslu (OČ). Současně lze využít pouze jeden štít.";
  if (normalized === "lance") return WEAPONS.get("jezdecké kopí") ?? null;
  if (normalized === "net") return WEAPONS.get("síť") ?? null;
  return PLAIN_GEAR[normalized] ?? null;
}

export const CANONICAL_GEAR_NAMES_CS = Object.freeze([
  ...Object.keys(GEAR_NAMES), ...Object.keys(ARMOR_NAMES), ...Object.keys(PLAIN_GEAR),
  "shield", "lance", "net",
]);
