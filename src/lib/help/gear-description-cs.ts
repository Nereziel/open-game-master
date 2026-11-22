import { displayDiceNotation } from "@/lib/language/dice-notation";
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
  "hide": "kožešinová zbroj", "hide armor": "kožešinová zbroj",
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
  "alms box": "Schránka na dary a almužny, používaná při náboženských obřadech.",
  "block of incense": "Kostka kadidla určená ke spalování v kadidelnici při modlitbách a obřadech.",
  "blocks of incense": "Kostky kadidla určené ke spalování v kadidelnici při modlitbách a obřadech.",
  "incense (block)": "Kostka kadidla určená ke spalování v kadidelnici při modlitbách a obřadech.",
  "kadidlové kostky": "Kostky kadidla určené ke spalování v kadidelnici při modlitbách a obřadech.",
  "kadidlová kostka": "Kostka kadidla určená ke spalování v kadidelnici při modlitbách a obřadech.",
  "vestments": "Obřadní roucho, které se nosí při náboženských slavnostech a bohoslužbách.",
  "obřadní roucho": "Obřadní roucho, které se nosí při náboženských slavnostech a bohoslužbách.",
  "prayer book": "Modlitební kniha obsahující modlitby a náboženské texty pro osobní i společné obřady.",
  "common clothes": "Jednoduché každodenní oblečení bez zvláštních vlastností.",
  "fine clothes": "Kvalitní společenský oděv pro slavnostní příležitosti.",
  "disguise kit": "Sada líčidel, paruk a drobných pomůcek sloužících ke změně vzhledu.",
  "con tools": "Pomůcky podvodníka, například značené karty a falešné hrací kostky.",
  "dark common clothes with hood": "Tmavé běžné oblečení s kapucí, vhodné k nenápadnému pohybu.",
  "musical instrument": "Hudební nástroj, na který může postava hrát; konkrétní druh určuje její výběr.",
  "costume": "Kostým používaný pro vystoupení, převleky a hraní rolí.",
  "favor of an admirer": "Drobná památka od obdivovatele, připomínající předchozí vystoupení nebo setkání.",
  "artisan's tools": "Sada nástrojů pro vybrané řemeslo. Konkrétní druh se určuje podle povolání nebo zázemí.",
  "iron pot": "Železný hrnec vhodný k přípravě jídla nad ohněm.",
  "letter of introduction from your guild": "Doporučující dopis od cechu, který dokládá tvé členství a obchodní kontakty.",
  "traveler's clothes": "Odolný cestovní oděv vhodný na dlouhé výpravy.",
  "scroll case of notes": "Pouzdro na svitky obsahující poznámky a záznamy postavy.",
  "winter blanket": "Teplá přikrývka chránící před chladem během odpočinku.",
  "herbalism kit": "Bylinkářská souprava pro sběr a zpracování bylin a přípravu bylinných směsí.",
  "scroll of pedigree": "Rodový svitek zaznamenávající původ, předky a příbuzenské vztahy.",
  "trophy from an animal you killed": "Lovecká trofej ze zvířete, které postava sama ulovila.",
  "bottle of black ink": "Lahvička černého inkoustu určeného k psaní a kreslení.",
  "quill": "Brk používaný jako psací pero s inkoustem.",
  "small knife": "Malý užitkový nůž vhodný k drobným pracím.",
  "letter from a dead colleague": "Dopis po zesnulém kolegovi nebo známém, který postava uchovává jako památku či vodítko.",
  "belaying pin (club)": "Lodní kolík používaný k upevňování lan; v nouzi může posloužit jako kyj.",
  "50 ft silk rope": "Hedvábné lano o délce 50 stop používané při lezení, vázání a jištění.",
  "lucky charm": "Drobnost nebo talisman, který postava považuje za své znamení štěstí.",
  "insignia of rank": "Odznak vojenské hodnosti, jenž ukazuje postavení postavy ve vojsku.",
  "trophy from a fallen enemy": "Trofej od poraženého nepřítele, připomínající někdejší střet.",
  "gaming set": "Sada pro vybranou hru, například kostky nebo karty.",
  "map of your home city": "Mapa rodného města se zakreslenými ulicemi a známými místy.",
  "pet mouse": "Malá ochočená myš, kterou postava chová jako zvířecího společníka.",
  "token of your parents": "Drobná osobní památka na rodiče postavy.",
  "trident or net": "Trojzubec nebo síť podle výběru postavy; při výběru jedné možnosti jde o odpovídající zbraň.",
  "mule": "Mezek, soumar vhodný k nošení nákladu a cestování.",
  "cart": "Dvoukolový vozík určený k přepravě vybavení a zásob.",
  "holy symbol": "Svatý symbol představující božstvo nebo náboženskou tradici; může sloužit jako sesílací ohnisko.",
  "staff": "Dlouhá hůl používaná při chůzi, jako opora nebo v boji.",
  "musical instrument (generic)": "Hudební nástroj pro hraní hudby.",
  "abacus": "Počítadlo s posuvnými korálky pro základní početní úkony.",
  "backpack": "Torna pro přenášení osobního vybavení na cestách.",
  "barrel": "Sud pro skladování kapalin nebo jiných zásob.",
  "basket": "Košík pro přenášení drobných předmětů.",
  "bedroll": "Svinovací podložka a přikrývka pro spaní na cestách.",
  "bell": "Malý zvonek sloužící k vydávání zvukového znamení.",
  "censer": "Kadidelnice je nádoba určená k bezpečnému spalování kadidla při obřadech. Sama o sobě nemá zvláštní pravidlový účinek.",
  "kadidelnice": "Kadidelnice je nádoba určená k bezpečnému spalování kadidla při obřadech. Sama o sobě nemá zvláštní pravidlový účinek.",
  "5 sticks of incense": "Pět vonných tyčinek používaných při modlitbách a náboženských obřadech. Jde o součást počáteční výbavy akolyty.",
  "vonné tyčinky": "Vonné tyčinky používané při modlitbách a náboženských obřadech.",
  "5 vonných tyčinek": "Pět vonných tyčinek používaných při modlitbách a náboženských obřadech. Jde o součást počáteční výbavy akolyty.",
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

// SRD lists ammunition, arcane/druidic foci, and holy symbols as subrows.
const VARIANTS: Readonly<Record<string, string>> = {
  "arrows (20)": "Sada dvaceti šípů pro luky. Každý výstřel spotřebuje jeden šíp.",
  "blowgun needles (50)": "Sada padesáti jehel pro foukačku.",
  "crossbow bolts (20)": "Sada dvaceti šipek do kuše.",
  "sling bullets (20)": "Sada dvaceti střel do praku.",
  "crystal": "Krystal, který lze používat jako mystické sesílací ohnisko.",
  "orb": "Koule, kterou lze používat jako mystické sesílací ohnisko.",
  "rod": "Žezlo, které lze používat jako mystické sesílací ohnisko.",
  "staff": "Hůl, kterou lze používat jako mystické sesílací ohnisko.",
  "wand": "Hůlka, kterou lze používat jako mystické sesílací ohnisko.",
  "sprig of mistletoe": "Snítka jmelí, kterou může druid používat jako sesílací ohnisko.",
  "totem": "Posvátný totem, který může druid používat jako sesílací ohnisko.",
  "wooden staff": "Dřevěná hůl, kterou může druid používat jako sesílací ohnisko.",
  "yew wand": "Tisová hůlka, kterou může druid používat jako sesílací ohnisko.",
  "amulet": "Amulet se znamením božstva. Klerik či paladin jej může používat jako sesílací ohnisko.",
  "emblem": "Znak božstva, který lze nosit na štítu jako svatý symbol.",
  "reliquary": "Schránka na posvátnou relikvii, kterou lze používat jako svatý symbol.",
  "spikes, iron (10)": "Deset železných hřebů pro upevňování a zajišťování.",
  "potion of healing 5": "Léčivý lektvar obnoví po vypití 2k4 + 2 životů. Vypití nebo podání lektvaru vyžaduje akci.",
  "bottle": "Láhev pro uchovávání a přenášení tekutin.",
};

// Weapons already display their exact damage, reach and properties in the
// structured item card. These notes identify their purpose in Czech without
// duplicating dice or silently changing game mechanics.
const WEAPON_NOTES: Readonly<Record<string, string>> = {
  "club": "Kyj je jednoduchá lehká zbraň na blízko.",
  "dagger": "Dýka je lehká obratná zbraň na blízko, kterou lze také vrhat.",
  "greatclub": "Velký kyj je jednoduchá obouruční zbraň na blízko.",
  "handaxe": "Ruční sekera je lehká zbraň na blízko, kterou lze také vrhat.",
  "javelin": "Oštěp je jednoduchá vrhací zbraň na blízko.",
  "light hammer": "Lehké kladivo je lehká vrhací zbraň na blízko.",
  "mace": "Palcát je jednoduchá zbraň na blízko.",
  "quarterstaff": "Hůl je jednoduchá zbraň na blízko, kterou můžeš držet jednou nebo oběma rukama.",
  "sickle": "Srp je jednoduchá lehká zbraň na blízko.",
  "spear": "Kopí je jednoduchá vrhací zbraň, kterou můžeš držet jednou nebo oběma rukama.",
  "crossbow, light": "Lehká kuše je jednoduchá obouruční střelná zbraň vyžadující šipky.",
  "dart": "Šipka je jednoduchá obratná vrhací zbraň na dálku.",
  "shortbow": "Krátký luk je jednoduchá obouruční střelná zbraň vyžadující šípy.",
  "sling": "Prak je jednoduchá střelná zbraň vyžadující střely.",
  "battleaxe": "Válečná sekera je vojenská zbraň na blízko pro jednu nebo dvě ruce.",
  "flail": "Řemdih je vojenská zbraň na blízko.",
  "glaive": "Kůsa je těžká obouruční vojenská zbraň s prodlouženým dosahem.",
  "greataxe": "Obouruční sekera je těžká vojenská zbraň vyžadující obě ruce.",
  "greatsword": "Obouruční meč je těžká vojenská zbraň vyžadující obě ruce.",
  "halberd": "Halapartna je těžká obouruční vojenská zbraň s prodlouženým dosahem.",
  "longsword": "Dlouhý meč je vojenská zbraň na blízko. Způsobuje 1k8 sečného zranění, při držení oběma rukama 1k10.",
  "maul": "Válečné kladivo s těžkou hlavicí je obouruční vojenská zbraň.",
  "morningstar": "Jitřní hvězda je vojenská bodná zbraň na blízko.",
  "pike": "Píka je těžká obouruční vojenská zbraň s prodlouženým dosahem.",
  "rapier": "Rapír je obratná vojenská bodná zbraň na blízko.",
  "scimitar": "Šavle je obratná lehká vojenská zbraň na blízko.",
  "shortsword": "Krátký meč je obratná lehká vojenská zbraň na blízko.",
  "trident": "Trojzubec je vojenská vrhací zbraň použitelná jednou i oběma rukama.",
  "war pick": "Válečný krumpáč je vojenská bodná zbraň na blízko.",
  "warhammer": "Válečné kladivo je vojenská zbraň na blízko použitelná jednou i oběma rukama.",
  "whip": "Bič je obratná vojenská zbraň s prodlouženým dosahem.",
  "blowgun": "Foukačka je vojenská střelná zbraň používající jehly.",
  "crossbow, hand": "Ruční kuše je lehká vojenská střelná zbraň používající šipky.",
  "crossbow, heavy": "Těžká kuše je těžká obouruční vojenská střelná zbraň.",
  "longbow": "Dlouhý luk je těžká obouruční vojenská střelná zbraň používající šípy.",
};

function key(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ").replace(/\s*\+\d+$/, "");
}

export function canonicalGearDescriptionCs(name: string): string | null {
  const normalized = key(name);
  const gearTitle = GEAR_NAMES[normalized];
  if (gearTitle) return GEAR.get(gearTitle) ?? PLAIN_GEAR[normalized] ?? null;
  const armorTitle = ARMOR_NAMES[normalized];
  if (armorTitle) return ARMOR.get(armorTitle) ?? null;
  if (normalized === "shield") return "Štít se drží v jedné ruce a poskytuje bonus +2 k obrannému číslu (OČ). Současně lze využít pouze jeden štít.";
  if (normalized === "lance") return WEAPONS.get("jezdecké kopí (lance)") ?? null;
  if (normalized === "net") return WEAPONS.get("síť (net)") ?? null;
  const description = PLAIN_GEAR[normalized] ?? VARIANTS[normalized] ?? WEAPON_NOTES[normalized] ?? null;
  return description ? displayDiceNotation(description) : null;
}

export const CANONICAL_GEAR_NAMES_CS = Object.freeze([
  ...Object.keys(GEAR_NAMES), ...Object.keys(ARMOR_NAMES), ...Object.keys(PLAIN_GEAR),
  ...Object.keys(VARIANTS), ...Object.keys(WEAPON_NOTES),
  "shield", "lance", "net",
]);
