// Original Czech display names for identified entries in Open5e supplements.
// These are not replacement rules text or official translations. Always check
// both source AND document: other books and user homebrew may reuse a name.
// The keys are the English API names, which stay unchanged in saved data.
import { searchKey, textKey } from "@/lib/language/text-logic";

const TOME_OF_HEROES_ITEMS: Readonly<Record<string, string>> = {
  "Axespear": "Sekerokopí",
  "Barge Pole": "Lodní bidlo",
  "Bladed Scarf": "Čepelová šála",
  "Blunderbuss": "Trombónová puška",
  "Bolas": "Bola",
  "Chain Hook": "Řetězový hák",
  "Chakram": "Čakram",
  "Climbing Adze": "Horolezecká teslice",
  "Clockwork Crossbow": "Mechanická kuše",
  "Club Shield": "Kyjový štít",
  "Double Axe": "Dvojitá sekera",
  "Dwarven Axe": "Trpasličí sekera",
  "Dwarven Revolving Musket": "Trpasličí otočná mušketa",
  "Elven Dueling Blade": "Elfská soubojová čepel",
  "Granite Fist": "Žulová pěst",
  "Joining Dirks": "Spojitelné dýky",
  "Khopesh": "Chopéš",
  "Pistol": "Pistole",
  "Pneumatic War Pick": "Pneumatický válečný krumpáč",
  "Shotel": "Šotel",
  "Whipsaw": "Bičová pila",
  "Wormsilk Net": "Síť z červího hedvábí",
  "Wormsilk Whip": "Bič z červího hedvábí",
  "Wrist Knife": "Zápěstní nůž",
  "Argent Mantle": "Stříbrný plášť",
  "Axe of Many Strikes": "Sekera mnoha úderů",
  "Beads of Contemplation": "Korálky rozjímání",
  "Beekeepers Tools": "Včelařské náčiní",
  "Bloodspeed Elixir": "Elixír krvavé rychlosti",
  "Camel Saddle": "Velbloudí sedlo",
  "Campaign Field Tent": "Polní táborový stan",
  "Cestus": "Cestus",
  "Chain Cilice": "Řetězová žíněná košile",
  "Chandlers Tools": "Svíčkařské náčiní",
  "Cloak of Tentacles": "Plášť chapadel",
  "Deepstone Cestus": "Cestus z hlubinného kamene",
  "Elemental Bottles": "Živelné lahvičky",
  "Elephant Saddle": "Sloní sedlo",
  "Elven Adaptive Leaves": "Elfské přizpůsobivé listy",
  "Elven Spellbook": "Elfská kniha kouzel",
  "Fletchers Retort Gloves": "Rukavice lučištníkovy odplaty",
  "Giantstrike Cestus": "Cestus obřího úderu",
  "Glidecloak": "Klouzavý plášť",
  "Grappling Rod": "Záchytná hůl",
  "Heartglow Lantern": "Lucerna srdeční záře",
  "Insectbane Candle": "Svíce proti hmyzu",
  "Javelin of Teleportation": "Oštěp teleportace",
  "Knight Sergeants Surcoat": "Varkoč rytířského seržanta",
  "Magazine, Clockwork Crossbow": "Zásobník mechanické kuše",
  "Mantlet": "Pohyblivý kryt",
  "Medics Sash": "Medikova šerpa",
  "Memory Sphere": "Sféra paměti",
  "Momentblade": "Čepel okamžiku",
  "Ninefold Swarmdagger": "Devaterá rojová dýka",
  "Paired Gauntlets Of Striking": "Párové úderné rukavice",
  "Phase Arrow": "Fázový šíp",
  "Potion Belt": "Opasek na lektvary",
  "Potion of Infinite Possibilities": "Lektvar nekonečných možností",
  "Pouch of Runestones": "Váček runových kamenů",
  "Sapper Tar": "Ženijní dehet",
  "Serpentine Sandals": "Hadí sandály",
  "Shattershot Arrow": "Tříštivý šíp",
};

const TOME_OF_HEROES_SPELLS: Readonly<Record<string, string>> = {
  "Abrupt Hug": "Náhlé objetí",
  "Adjust Position": "Úprava polohy",
  "Ambush": "Přepadení",
  "Ambush Chute": "Přepadová šachta",
  "Armored Formation": "Obrněná formace",
  "Babble": "Blábolení",
  "Bardo": "Bardo",
  "Battle Mind": "Bojová mysl",
  "Beast Within": "Vnitřní bestie",
  "Betraying Bauble": "Zrádná cetka",
  "Bloodhound": "Stopař",
  "Bloodlust": "Krvežíznivost",
  "Blunted Edge": "Otupené ostří",
  "Bolster Fortifications": "Posílení opevnění",
  "Bombardment of Stings": "Záplava žihadel",
  "Bound Haze": "Spoutaný opar",
  "Burst Stone": "Tříštivý kámen",
  "Butterfly Effect": "Motýlí efekt",
  "Calm Beasts": "Uklidni zvířata",
  "Clear The Board": "Vyčisti bojiště",
  "Conjure Construct": "Vyvolej konstrukt",
  "Conjure Spectral Allies": "Vyvolej přízračné spojence",
  "Convey Inner Peace": "Předej vnitřní klid",
  "Crown Of Thorns": "Trnová koruna",
  "Damaging Intel": "Škodlivé informace",
  "Dead Walking": "Chůze mrtvých",
  "Deadly Salvo": "Smrtící salva",
  "Devouring Darkness": "Pohlcující temnota",
  "Dimensional Shove": "Dimenzionální strčení",
  "Divine Retribution": "Božská odplata",
  "Dreamwine": "Snové víno",
  "Emerald Eyes": "Smaragdové oči",
  "Enchanted Bloom": "Očarovaný květ",
  "Eruption": "Erupce",
  "Ethereal Stairs": "Éterické schody",
  "Feint": "Finta",
  "Fey Food": "Vílí pokrm",
  "Fey-Touched Blade": "Čepel dotčená vílami",
  "Forced Reposition": "Nucený přesun",
  "Frenzied Bolt": "Zběsilá střela",
  "Furious Wail": "Zuřivý nářek",
  "Fuse Armor": "Spojení zbroje",
  "Gale": "Vichřice",
  "Gird the Spirit": "Posil ducha",
  "Glare": "Výhružný pohled",
  "Glyph of Shifting": "Glyf přesunu",
  "Going in Circles": "V bludném kruhu",
  "Harrying Hounds": "Dotírající psi",
  "Heart to Heart": "Od srdce k srdci",
  "High Ground": "Výšková převaha",
  "Hunting Stand": "Lovecký posed",
  "Hypnagogia": "Hypnagogie",
  "Hypnic Jerk": "Hypnický záškub",
  "Ill-Fated Word": "Nešťastné slovo",
  "Illuminate Spoor": "Osvětli stopu",
  "Immolating Gibbet": "Hořící šibenice",
  "Inexorable Summons": "Neodvratné povolání",
  "Inspiring Speech": "Inspirující proslov",
  "Instant Armored Vehicle": "Okamžité obrněné vozidlo",
  "Instant Snare": "Okamžitá past",
  "Iron Gut": "Železný žaludek",
  "Jagged Forcelance": "Zubaté silové kopí",
  "Jarring Growl": "Otřesné zavrčení",
  "Killing Fields": "Pole smrti",
  "Lay to Rest": "Ulož k odpočinku",
  "Life Burst": "Výbuch života",
  "Life from Death": "Život ze smrti",
  "Lightless Torch": "Bezesvětelná pochodeň",
  "Litany of Sure Hands": "Litanie jistých rukou",
  "Long Game": "Dlouhá hra",
  "Magma Spray": "Sprška magmatu",
  "Maim": "Zmrzačení",
  "Mantle of the Brave": "Plášť statečných",
  "Mark Prey": "Označ kořist",
  "Mass Faerie Fire": "Hromadný vílí oheň",
  "Mind Maze": "Bludiště mysli",
  "Misdirection": "Odvedení pozornosti",
  "Mud": "Bláto",
  "Muted Foe": "Umlčený nepřítel",
  "Never Surrender": "Nikdy se nevzdávej",
  "Oathbound Implement": "Přísahou vázaný nástroj",
  "Outmaneuver": "Přemanévrování",
  "Oversized Paws": "Obří tlapy",
  "Pierce the Veil": "Pronikni závojem",
  "Pincer": "Kleště",
  "Portal Jaunt": "Skok portálem",
  "Portal Trap": "Portálová past",
  "Power Word Fling": "Mocné slovo: Odhození",
  "Power Word Rend": "Mocné slovo: Rozervání",
  "Protection from the Void": "Ochrana před prázdnotou",
  "Rebounding Bolt": "Odrazová střela",
  "Reciprocating Portal": "Obousměrný portál",
  "Reposition": "Přesun",
  "Repulsing Wall": "Odpuzující zeď",
  "Reset": "Obnovení",
  "Retribution": "Odplata",
  "Rive": "Rozervání",
  "Rockfall Ward": "Ochrana před sesuvem kamení",
  "Sacrifice Pawn": "Obětuj pěšce",
  "Sacrificial Healing": "Obětní léčení",
  "Safe Transposition": "Bezpečná záměna",
  "Secret Blind": "Tajné zastření",
  "Shadow Tree": "Stínový strom",
  "Shared Frenzy": "Sdílené běsnění",
  "Shocking Volley": "Blesková salva",
  "Sightburst": "Záblesk zraku",
};

type ThirdPartyCsKind = "items" | "spells" | "feats";
type Entries = Readonly<Partial<Record<ThirdPartyCsKind, Readonly<Record<string, string>>>>>;

const THIRD_PARTY_CS_NAMES: Readonly<Record<string, Entries>> = {
  // Open5e v1: document__slug=toh; v2 imports preserve this key.
  toh: { items: TOME_OF_HEROES_ITEMS, spells: TOME_OF_HEROES_SPELLS },
};

const INDEX: Readonly<Record<string, Partial<Record<ThirdPartyCsKind, Readonly<Record<string, string>>>>>> =
  Object.fromEntries(Object.entries(THIRD_PARTY_CS_NAMES).map(([book, tables]) => [
    book,
    Object.fromEntries(Object.entries(tables).map(([kind, entries]) => [
      kind, Object.fromEntries(Object.entries(entries).map(([english, czech]) => [textKey(english), czech])),
    ])),
  ]));

export function thirdPartyContentNameCs(
  kind: string,
  row: { name: string; source?: string; documentSlug?: string },
): string | null {
  if (row.source !== "open5e" || !row.documentSlug) return null;
  return INDEX[row.documentSlug]?.[kind as ThirdPartyCsKind]?.[textKey(row.name)] ?? null;
}

export function thirdPartyCzechPickerQueries(kind: string, search: string, limit: number): string[] {
  if (kind !== "items" && kind !== "spells" && kind !== "feats") return [];
  const wanted = searchKey(search);
  if (wanted.length < 2 || limit <= 0) return [];
  const names: string[] = [];
  const seen = new Set<string>();
  for (const tables of Object.values(THIRD_PARTY_CS_NAMES)) {
    for (const [english, czech] of Object.entries(tables[kind] ?? {})) {
      if (!searchKey(czech).includes(wanted) || seen.has(textKey(english))) continue;
      names.push(english);
      seen.add(textKey(english));
      if (names.length >= limit) return names;
    }
  }
  return names;
}
