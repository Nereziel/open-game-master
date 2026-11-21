// Czech presentation-only names and original summaries for all 36 bundled
// genre-specific classes. Stored IDs and English rule descriptions are unchanged.
// These classes are original to Open Game Master, not SRD class translations.
export const GENRE_CLASS_CS: Readonly<Record<string, { name: string; blurb: string }>> = {
  witch_hunter: { name: "Lovec čarodějnic", blurb: "Nelítostný inkvizitor s modlitbou na rtech a stříbrnými střelami v pistoli. Pronásleduje zkaženost skrytou za zbožnými tvářemi." },
  plague_doctor: { name: "Morový lékař", blurb: "Za zobákovou maskou se skrývá mysl, která čte příznaky nemocí jako otevřenou knihu a dokáže proměnit léky ve zbraně." },
  grave_knight: { name: "Hrobový rytíř", blurb: "Rytíř přísahající moci ukryté v hlubinách země. Nosí čepel, která na jeho zavolání poslechne, a obklopuje ho aura hrobu." },
  penitent: { name: "Kajícník", blurb: "Každá jizva je modlitbou. Vlastní krev utrácí jako mince a sílí tím víc, čím blíže kráčí ke smrti." },
  dirgesinger: { name: "Pěvec žalozpěvů", blurb: "Hlas truchlících i mrtvých. Jeho písně oplakávají, proklínají a někdy probouzejí ty, kteří měli zůstat v hrobě." },
  vermin_lord: { name: "Krysař", blurb: "Vládce stok a kanálů. Krysy mu slouží jako zvědové, podzemní chodby jako cesty a ve městě se před ním jen máloco skryje." },
  exorcist: { name: "Exorcista", blurb: "Vyzbrojen obřady, solí a neústupnou vírou vyhání bytosti, které nosí lidská těla jako převlek." },
  occultist: { name: "Okultista", blurb: "Badatel, který přesto otevřel zakázané knihy. Za skutečnou moc platí vlastním spánkem a zdravým rozumem." },
  survivor: { name: "Přeživší", blurb: "Přežil všechny, kteří mu říkali šťastlivec. Má rychlé ruce, pevné nervy a vždy ví, kudy uniknout." },
  slayer: { name: "Lovec nestvůr", blurb: "Lovec nestvůr ze starých řádů. Na čepeli nosí stříbro, v hlavě dávné vědomosti a dávno přišel o iluze." },
  parapsychologist: { name: "Parapsycholog", blurb: "Vědec zkoumající nemožné pomocí přístrojů, pečlivých poznámek a pokusů, jejichž výsledky odborné časopisy odmítají otisknout." },
  apostate: { name: "Odpadlík", blurb: "Uprchl z kultu, ale rituál se přesto dokončil. Jeho moc teď přebývá pod odpadlíkovou kůží." },
  netrunner: { name: "Netrunner", blurb: "Síťový kovboj, který proniká do systémů i myslí a ze svého otlučeného kyberdecku spouští infiltrační programy." },
  street_samurai: { name: "Pouliční samuraj", blurb: "Po zuby vyztužený kybernetikou a rychlejší než myšlenka. Mistr čepele i střelných zbraní, který prodává násilí se zárukou." },
  rigger: { name: "Operátor dronů", blurb: "Mistr dronů, který sleduje svět kamerami, opravuje stroje za pochodu a sesílá podpůrné programy prostřednictvím věrného roje." },
  fixer: { name: "Zprostředkovatel", blurb: "Zná někoho na každý problém. Kontakty, protislužby a výřečnost mu otevřou dveře, které zbraně neprorazí." },
  esper: { name: "Esper", blurb: "Za jeho očima doutná psychická síla. Syrové a nestálé psionické schopnosti, které by korporační laboratoře chtěly získat za každou cenu." },
  trauma_doc: { name: "Bojový zdravotník", blurb: "Zdravotník se stimulační pistolí a zásobou nanoléčiv, který drží družinu při životě uprostřed přestřelky." },
  detective: { name: "Detektiv", blurb: "Nic mu neunikne: má cvičené oko pro detaily, paměť jako vyšetřovací spis a neomylný čich na lži." },
  alienist: { name: "Lékař duše", blurb: "Lékař mysli, jehož léčebné metody hraničí s nadpřirozenem. Odhaluje motivy, rozplétá strach a otevírá vzpomínky." },
  grifter: { name: "Podvodník", blurb: "Šarm používá jako zbraň, v každém městě má jiné jméno a jeho plán je vždy skrytý za několika vrstvami lží." },
  enforcer: { name: "Vymahač", blurb: "Stojí jako zeď mezi nebezpečím a těmi, které chrání. Má těžké pěsti, respekt budící vystupování a překvapivou trpělivost." },
  muckraker: { name: "Investigativní novinář", blurb: "Novinář sledující tok peněz, odhalující tajemství a zveřejňující to, co se mocní snaží za každou cenu pohřbít." },
  spirit_medium: { name: "Duchovní médium", blurb: "Mrtví k němu promlouvají, ať o to stojí, nebo ne. Pořádá seance, předává varování a odhaluje pravdy, o nichž živí lžou." },
  scavenger: { name: "Sběrač", blurb: "Ruiny dokážou uživit toho, kdo ví, kde hledat. Má hbité prsty, bystré oči a brašnu plnou přesně toho správného harampádí." },
  road_warrior: { name: "Silniční válečník", blurb: "Nebojácný jezdec s chromem a hroty žije naplno na mrtvých dálnicích, kde zákon určuje nejhlasitější motor." },
  aberrant: { name: "Mutant", blurb: "Pád ho přetvořil. Jeho magií jsou nestálé a dál se rozvíjející mutace; tělo se nikdy nepřestalo přizpůsobovat." },
  salvage_tech: { name: "Technik šrotu", blurb: "Dokáže probudit stroje starého světa a ovládá znovu sestavené vynálezy, kterým nový svět sotva rozumí." },
  waste_preacher: { name: "Kazatel pustiny", blurb: "Hlas naděje uprostřed pustiny. Jeho kázání zacelují rány, dodávají odvahu a někdy přivolávají soud shůry." },
  packmaster: { name: "Pán smečky", blurb: "Spojenec zvířat pustiny, který putuje s věrným společníkem a ovládá pradávnou řeč přežití." },
  machinist: { name: "Strojmistr", blurb: "Inženýr a mág, jehož plány vedou éter skrz mosazné součástky. Kouzla sestavuje, místo aby je vyslovoval." },
  aeronaut: { name: "Vzduchoplavec", blurb: "Nebeský námořník a šermíř, doma v lanoví i na střechách, vždy o jeden odvážný manévr před gravitací." },
  alchemist: { name: "Alchymista", blurb: "Magie uzavřená v lahvích. Předem připravené směsi lze vrhat, pít či rozlévat, občas s velkolepou nehodou." },
  gadgeteer: { name: "Vynálezce", blurb: "Chodící dílna plná háků, dýmu a pružinových překvapení. Pro každou nesnáz má připravený vynález." },
  aether_channeler: { name: "Éterový vodič", blurb: "Živý vodič éteru, který pohání celý věk. V žilách mu proudí blesky a bouře drží na krátkém vodítku." },
  steam_knight: { name: "Parní rytíř", blurb: "V syčícím parním brnění je napůl rytířem a napůl lokomotivou. Nejdřív drží obrannou linii a pak se jí sám stává." },
};

export function genreClassCs(id: string): { name: string; blurb: string } | undefined {
  return GENRE_CLASS_CS[id];
}
