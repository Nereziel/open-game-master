export type Locale = "en" | "fr" | "cs";

export type TranslateVars = Record<string, string | number> & {
  context?: string;
};

type Catalog = {
  messages: Record<string, string>;
  contexts: Record<string, Record<string, string>>;
  plurals: Record<string, [string, string, string?]>;
};

// Small patches for missing Czech UI keys while the large generated catalog
// remains unchanged. Only apply when the catalog would display English.
const CZECH_LABEL_FALLBACKS: Record<string, string> = {
  "Melee weapon": "Zbraň na blízko",
  "Ranged weapon": "Zbraň na dálku",
  "Armor or shield": "Zbroj nebo štít",
  "Used up when used": "Spotřební předmět",
  "Magic item": "Magický předmět",
  "Gear": "Vybavení",
  "Select the mark beside it for the full entry.": "Úplný popis otevřeš kliknutím na značku vedle předmětu.",
  "partly by hand": "část vyhodnocuje PJ",
  "narrated": "vyhodnocuje PJ",
  "Partly by hand": "Část vyhodnocuje PJ",
  "Narrated": "Vyhodnocuje PJ",
  "The Saltmarch": "Solné močály",
  "Click the map to set each corner.": "Kliknutím na mapu umísti jednotlivé rohy.",
  "Close the shape ({count} corners)": "Uzavřít tvar ({count} rohů)",
  "{count} more corners needed.": "Ještě je třeba přidat {count} rohů.",
  "Found {count}: tick what to keep": "Nalezeno {count}: označ, co chceš ponechat",
  "Hidden truth: {truth}": "Skrytá pravda: {truth}",
  "Across": "Vodorovně",
  "Down": "Svisle",
  "across": "vodorovně",
  "down": "svisle",
  "{label}: {direction} (percent)": "{label}: {direction} (v procentech)",
  "Corners ({count}), as numbers": "Rohy ({count}), číselně",
  "Corner {number}": "Roh {number}",
  "Take away corner {number}": "Odebrat roh {number}",
  "Add a corner": "Přidat roh",
  "The Sunken Coast": "Potopené pobřeží",
  "A drowned dwarven kingdom and the tide-cults that kept living in it.": "Zatopené trpasličí království a přílivové kulty, které v něm přežily.",
  "An original world, or the setting this is a homage to": "Vlastní svět nebo předloha, kterou tento svět připomíná",
  "Leave empty if this is your own world": "U vlastního světa nech prázdné",
  "Defaults to the name": "Výchozí hodnotou je název",
  "Empty for a single-era world": "Pro svět s jedinou érou nech prázdné",
  "Salvage, faith and the things under the water": "Záchrana trosek, víra a to, co se skrývá pod hladinou",
  "Where a new campaign in this world starts, in a paragraph.": "Odstavcem popiš, kde nová kampaň v tomto světě začíná.",
  "Tone, what magic feels like, what the stakes are, what the narrator must never do.": "Nálada světa, podoba magie, sázky příběhu a co vypravěč nikdy nesmí udělat.",
  "Painted, weathered, brine-stained leathers": "Malovaná, ošlehaná a solí potřísněná kožená zbroj",
  "Inked nautical charts, kelp-green wash": "Námořní mapy kreslené tuší se zeleným akvarelem",
  "Salt-washed illustration, grey overcast light": "Ilustrace poznamenaná mořskou solí a šedým světlem pod mraky",
  "Dwarven names with tide-words; surnames are the ship they were born on": "Trpasličí jména s odkazy na příliv; příjmení podle lodí, na nichž se narodili",
  "Most people are dwarves or sea-elves; humans are traders from upriver": "Většina obyvatel jsou trpaslíci nebo mořští elfové, lidé přicházejí obchodovat proti proudu řeky",
  "A tide-priest offers to pay for a relic nobody else will touch.": "Přílivový kněz nabízí odměnu za relikvii, které se nikdo jiný neodváží dotknout.",
  "Reed Walker": "Rákosový poutník",
  "Marsh terrain costs no extra movement.": "Pohyb v bažinách nestojí žádný pohyb navíc.",
  "Salt Lore": "Znalosti o soli",
  "a pressure plate under the third flagstone": "nášlapná deska pod třetí dlaždicí",
  "thieves' tools": "zlodějské náčiní",
  "marsh fever": "bažinná horečka",
  "Up to three targets.": "Až tři cíle.",
  "Strength 13 or higher": "Síla 13 nebo vyšší",
  "Draconic ancestry, Bloodline": "Dračí původ, pokrevní linie",
  "Has a hidden truth": "Obsahuje skrytou pravdu",
  "Slay every dragon it meets": "Zabít každého draka, kterého potká",
  "Arcane Strike": "Magický úder",
  "Once a turn, a weapon hit deals an extra 1d8 force damage.": "Jednou za tah způsobí zásah zbraní navíc 1k8 silového zranění.",
  "diamonds worth 300 gp, which the spell consumes": "diamanty v hodnotě 300 zl, které kouzlo spotřebuje",
  "The damage increases by 1d6 for each slot level above 1st.": "Za každou úroveň pozice nad 1. se zranění zvýší o 1k6.",
  "Darkvision 60 ft": "Vidění ve tmě na 60 stop",
  "A flooded crypt with two ways in": "Zatopená krypta se dvěma vstupy",
  "The rolled map": "Náhodně vytvořená mapa",
  "A region": "Oblast",
  "Inside {name}": "Uvnitř: {name}",
  "this pin": "tohoto bodu",
  "Map name": "Název mapy",
  "Make the map": "Vytvořit mapu",
  "Maps": "Mapy",
  "Over the Region": "Nad oblastí",
  "New map": "Nová mapa",
  "Where in the atlas": "Poloha v atlasu",
  "What a click does": "Funkce kliknutí",
  "No picture yet: pins still work.": "Zatím není vložen obrázek. Body na mapě fungují i bez něj.",
  "Pin": "Bod",
  "This picture is for finding your way. Walls, doors and light are drawn on a battle map, never read from a picture.": "Obrázek slouží k orientaci. Zdi, dveře a osvětlení se vytvářejí na bojové mapě, nikoliv z obrázku.",
  "What the forge found": "Výsledky rozboru",
  "Links": "Vazby",
  "Throw it away": "Zahodit návrh",
  "Reckoning of Tides": "Letopočet přílivů",
  "Calendar name": "Název kalendáře",
  "Abbreviation": "Zkratka",
  "Where its year 0 falls": "Umístění roku nula",
  "The last box places this calendar’s year 0 on the shared line: give the first calendar 0, and a later reckoning that began 1240 years after it 1240.": "Poslední pole určuje, kam na společné časové ose spadá rok nula tohoto kalendáře. U prvního zadej 0; pokud další letopočet začal o 1240 let později, zadej 1240.",
  "The Wall Breaks": "Pád hradeb",
  "What happened": "Co se stalo",
  "Year": "Rok",
  "Calendar": "Kalendář",
  "No calendar: the year stands alone.": "Bez kalendáře se rok uvádí samostatně.",
  "Era (Second Tide)": "Éra (Druhý příliv)",
  "Era": "Éra",
  "What happened, in a few lines": "Stručně popiš událost",
  "What happened, in full": "Podrobný popis události",
  "Who and where": "Kdo a kde",
  "who or where": "osoba nebo místo",
  "Save event": "Uložit událost",
  "Sources": "Zdroje",
  "The answer cites no passage. Check it against the world before you use it.": "Odpověď neuvádí žádný zdrojový úryvek. Před použitím ji ověř podle záznamů světa.",
  "Shown to the party": "Zobrazeno družině",
  "Hide from the party": "Skrýt před družinou",
  "Show to the party": "Ukázat družině",
  "Show {name} to the party?": "Ukázat mapu {name} družině?",
  "Review": "Kontrola",
  "a pin with no name": "nepojmenovaný bod",
  "To hide one first, cancel, open the pin or region, and tick Hidden from the party.": "Pokud chceš některý prvek nejprve skrýt, zruš tuto akci, otevři bod nebo oblast a zapni volbu Skryté před družinou.",
  "Show it": "Zobrazit",
  "The party’s Atlas": "Atlas družiny",
  "Back to {name}": "Zpět na {name}",
  "{name}: open its map": "{name}: otevřít mapu",
  "A pin": "Bod na mapě",
  "{name} is on the party’s Atlas now, in everyone’s Map tab.": "Mapa {name} je nyní v atlasu družiny na záložce Mapa všech hráčů.",
  "{name} is off the party’s Atlas.": "Mapa {name} byla skryta z atlasu družiny.",
  "Players will see {pins} pins and {regions} regions:": "Hráči uvidí {pins} bodů a {regions} oblastí:",
  "Staying hidden: {pins} pins and {regions} regions.": "Skryté zůstanou {pins} body a {regions} oblasti.",
  "Your changes": "Tvoje změny",
  "Not saved. {what} are still here.": "Neuloženo. {what} zůstávají zachované.",
  "Try again": "Zkusit znovu",
  "Saved {name}.": "Mapa {name} byla uložena.",
  "Settings for {name}": "Nastavení mapy {name}",
  "Map settings": "Nastavení mapy",
  "Close the settings": "Zavřít nastavení",
  "The Region keeps showing the old picture until you use this map as the Region backdrop again.": "V oblasti zůstane původní obrázek, dokud tuto mapu znovu nenastavíš jako její pozadí.",
  "Save name and picture": "Uložit název a obrázek",
  "How the picture sits": "Umístění obrázku",
  "How the picture fills the box": "Přizpůsobení obrázku",
  "Fill the box (crops the picture)": "Vyplnit prostor (oříznout obrázek)",
  "Show the whole picture": "Zobrazit celý obrázek",
  "The box’s shape": "Tvar obrazové plochy",
  "Wide, 16:10": "Široký formát, 16:10",
  "The picture’s own shape": "Původní poměr stran obrázku",
  "Width to height": "Poměr šířky a výšky",
  "Box width": "Šířka plochy",
  "Box height": "Výška plochy",
  "What the pins do": "Chování bodů na mapě",
  "Pins and regions stay on the same spots of the picture": "Body a oblasti zůstanou na stejných místech obrázku",
  "They stay where they are in the box": "Zůstanou na stejných místech obrazové plochy",
  "Change it": "Provést změnu",
  "Review the change": "Zkontrolovat změnu",
  "Deleted {name}.": "Smazáno: {name}.",
  "the map": "mapu",
  "the pin": "bod",
  "the region": "oblast",
  "Its {count} pins go with it.": "Spolu s mapou bude odstraněno {count} bodů.",
  "It has no pins.": "Mapa neobsahuje žádné body.",
  "{count} pins on other maps open it and will open nothing: {names}.": "{count} bodů na dalších mapách ji otevírá a ztratí propojení: {names}.",
  "Nested maps move to the top level: {names}.": "Vnořené mapy se přesunou do nejvyšší úrovně: {names}.",
  "{count} pins linked to the Region will disappear. The places will stay where they are.": "Zmizí {count} bodů propojených s oblastí. Samotná místa zůstanou na svých pozicích.",
  "Nothing else is touched.": "Nic dalšího se nezmění.",
  "Delete {what} {name}?": "Opravdu odstranit {what} {name}?",
  "You can undo it straight after.": "Ihned poté lze akci vrátit zpět.",
  "{count} pins or corners move to stay on the picture.": "Aby zůstaly na obrázku, přesune se {count} bodů nebo vrcholů.",
  "No pin or corner moves in the box.": "Žádný bod ani vrchol se v ploše nepřesune.",
  " {count} of them fall outside the new box and wait at its nearest edge.": " {count} z nich leží mimo novou plochu a budou umístěny k nejbližšímu okraji.",
  "{name} now sits in its new box.": "Mapa {name} má nyní nové rozměry.",
  " {count} places moved with their pins on the Region.": " Spolu s body na oblasti se přesunulo {count} míst.",
  "{name} is ready": "Postava {name} je připravena",
  "Level {level}": "{level}. úroveň",
  "Three things to try on your turn": "Tři věci, které můžeš vyzkoušet ve svém tahu",
  "Your sheet lists everything you can do once you sit down at a table.": "Na deníku postavy najdeš všechny své možnosti pro hru.",
  "Don't show this again": "Příště už nezobrazovat",
  "Bring to a table": "Přidat ke hernímu stolu",
  "Done": "Hotovo",
  "Portrait of {name}": "Portrét postavy {name}",
  "{name}, placeholder portrait": "Náhradní portrét postavy {name}",
  "The portrait is still painting. It will appear here when it is done.": "Portrét se stále vytváří. Po dokončení se zde zobrazí.",
  "The portrait could not be painted. You can paint or upload one from the sheet.": "Portrét se nepodařilo vytvořit. Můžeš jej vytvořit nebo nahrát v deníku postavy.",
  "Could not save that. Try again.": "Nastavení se nepodařilo uložit. Zkus to znovu.",
  "Changing the {because} set aside {named}: it no longer fits.": "Změna {because} vyřadila {named}, protože už nevyhovuje.",
  "Changing the {because} set aside {named}: they no longer fit.": "Změna {because} vyřadila {named}, protože už nevyhovují.",
  "{bonus} to hit": "Zásah {bonus}",
  "Swing your {name}": "Zaútoč zbraní {name}",
  "Shoot your {name}": "Vystřel ze zbraně {name}",
  "Use {name}": "Použij {name}",
  "Cast {name}": "Seslat {name}",
  "Reaction roll": "Hod na reakci",
  "Cancel": "Zrušit",
  "overworld.size.small": "Malá",
  "overworld.size.medium": "Střední",
  "overworld.size.large": "Velká",
  "overworld.size.vast": "Rozlehlá",
  "{label} ({width} by {height})": "{label} ({width} × {height})",
  "{width} by {height}": "{width} × {height}",
  "Read it into the dials": "Převést popis na nastavení terénu",
  "Sea level": "Hladina moře",
  "Mountains": "Hory",
  "Forests": "Lesy",
  "Aridity": "Suchost",
  "Coastline": "Pobřeží",
  "Dials set.": "Nastavení terénu je připraveno.",
  "Reroll below until the coastline falls where you want it.": "Znovu vygenerujte terén, dokud nebude pobřeží podle vašich představ.",
  "Roll a world": "Vygenerovat svět",
  "Size of the next roll": "Velikost nové mapy",
  "Reroll the terrain under these dials, at this size. Places, pins, lines and notes stay.": "Znovu vygenerovat terén v nastavené velikosti. Místa, značky, cesty a poznámky zůstanou.",
  "Add {count} place": "Přidat {count} místo",
  "Add {count} places": "Přidat {count} místa",
  "Add a place": "Přidat místo",
  "Put it on the map": "Umístit na mapu",
  "Notes on the region": "Poznámky o oblasti",
  "Yours alone; players never see this.": "Pouze pro vás, hráči tyto poznámky neuvidí.",
  "What a traveller would say": "Co by řekl pocestný",
  "What a traveller would say about it (optional)": "Co by o místě řekl pocestný (nepovinné)",
  "What lies past the edge. Which roads are watched.": "Co leží za hranicí oblasti? Které cesty jsou hlídané?",
  "A chain of islands off a storm coast, pine forest inland.": "Řetězec ostrovů u bouřlivého pobřeží, ve vnitrozemí borové lesy.",
  "The Salt Wharf": "Solné přístaviště",
  "That did not work.": "Akci se nepodařilo provést.",
  "The model had nothing for that.": "Model nedokázal zpracovat popis oblasti.",
  "Rolls how an NPC takes the party on the DMG reaction table.": "Určí počáteční postoj cizí postavy k družině hodem podle tabulky reakcí.",
};

// The French catalog is about 1 MB of JSON (340 KiB gzip). Imported here it
// rode in the first load of every page, French reader or not (the shared
// LocaleApplier and every useT pull this module in). It is installed
// instead: on the server at start (fr-catalog.ts, from instrumentation.ts,
// the root layout and request-locale.ts), in a browser on demand when the
// reader's language is French (catalog-loader.ts, its own chunk). Until a
// catalog is installed its locale reads English, the source. The store sits
// on globalThis so the server's module layers (route, page, SSR) share one.
const STORE = "__odmI18nCatalogs";

function catalogs(): Partial<Record<Locale, Catalog>> {
  const holder = globalThis as typeof globalThis & { [STORE]?: Partial<Record<Locale, Catalog>> };
  holder[STORE] ??= {};
  return holder[STORE];
}

export function installCatalog(locale: Locale, catalog: unknown): void {
  if (locale !== "en") {
    catalogs()[locale] = catalog as Catalog;
  }
}

// English is the source and needs no catalog.
export function catalogInstalled(locale: Locale): boolean {
  return locale === "en" || Boolean(catalogs()[locale]);
}

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) => {
    if (name === "context") return match;
    return name in vars ? String(vars[name]) : match;
  });
}

// Gettext-style translation: English is the key and fallback.
// Context overrides are selected from the catalog of the requested locale.
export function translate(locale: Locale, english: string, vars?: TranslateVars): string {
  let text = english;
  const catalog = locale !== "en" ? catalogs()[locale] : undefined;
  if (catalog) {
    const ctx = vars?.context;
    const ctxMatch = ctx ? catalog.contexts[english]?.[ctx] : undefined;
    text = ctxMatch ?? catalog.messages[english] ?? english;
  }
  if (locale === "cs" && text === english) {
    text = CZECH_LABEL_FALLBACKS[english] ?? text;
  }
  return interpolate(text, vars);
}

export function translatePlural(
  locale: Locale,
  englishOne: string,
  englishOther: string,
  vars: TranslateVars & { count: number },
): string {
  const isOne = locale === "fr" ? vars.count <= 1 : vars.count === 1;
  const catalog = locale !== "en" ? catalogs()[locale] : undefined;
  if (catalog) {
    const pair = catalog.plurals[`${englishOne}\0${englishOther}`];
    if (pair) {
      // Czech: one (1), few (2–4), other (0 and 5+). The third
      // translation is optional so two-form catalogs still work.
      if (locale === "cs") {
        const form = vars.count === 1 ? 0 : vars.count >= 2 && vars.count <= 4 ? 1 : 2;
        return interpolate(pair[form] ?? pair[1], vars);
      }
      return interpolate(isOne ? pair[0] : pair[1], vars);
    }
  }
  return interpolate(isOne ? englishOne : englishOther, vars);
}
