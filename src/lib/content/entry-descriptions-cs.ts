import gearDescriptions from "./item-descriptions-cs.json";
import { textKey } from "@/lib/language/text-logic";

const GEAR_DESCRIPTIONS: Readonly<Record<string, string>> = {
  ...gearDescriptions,
  // Brief Czech display descriptions for table entries without a prose entry.
  "alms box": "Schránka na sbírání almužen a drobných darů.",
  "block of incense": "Kousek vonného kadidla určený ke spalování při obřadech nebo k provonění prostoru.",
  "censer": "Nádoba k bezpečnému spalování kadidla při obřadech.",
  "little bag of sand": "Malý sáček písku, například k vysoušení inkoustu.",
  "small knife": "Drobný užitkový nůž k řezání a běžné práci.",
  "string 10 feet": "Tenký provázek dlouhý 10 stop k vázání drobných předmětů.",
  "vestments": "Obřadní oděv používaný při náboženských příležitostech.",
  "dice set": "Sada kostek pro hazardní či jiné společenské hry. Zdatnost s ní umožňuje přičíst zdatnostní bonus k příslušným ověřením.",
  "playing card set": "Balíček hracích karet pro společenské hry. Zdatnost s ním umožňuje přičíst zdatnostní bonus k příslušným ověřením.",
  "bagpipes": "Dechový hudební nástroj s měchem a píšťalami.",
  "drum": "Bicí hudební nástroj s napnutou blánou.",
  "dulcimer": "Strunný hudební nástroj, jehož struny se rozeznívají údery nebo drnkáním.",
  "flute": "Dechový hudební nástroj, jehož tón vzniká proudem vzduchu přes hranu otvoru.",
  "lute": "Drnkací strunný hudební nástroj s krkem a zaobleným tělem.",
  "lyre": "Strunný hudební nástroj se strunami napnutými v rámu.",
  "horn": "Dechový hudební nástroj vhodný také k vydávání signálů.",
  "pan flute": "Dechový hudební nástroj tvořený soustavou píšťal různé délky.",
  "shawm": "Dechový hudební nástroj s dvojitým plátkem a pronikavým tónem.",
  "viol": "Smyčcový strunný hudební nástroj.",
  "camel": "Velbloud využívaný jako jezdecké nebo nákladní zvíře, zejména při cestách suchými oblastmi.",
  "donkey or mule": "Osel nebo mula, zvíře vhodné k přepravě nákladu.",
  "elephant": "Slon využívaný jako jezdecké nebo nákladní zvíře.",
  "horse draft": "Tažný kůň vhodný k práci a tahání vozů.",
  "horse riding": "Jezdecký kůň určený především k přepravě jezdce.",
  "mastiff": "Velký pes využívaný k hlídání nebo jako zvířecí společník.",
  "pony": "Menší kůň vhodný k jízdě nebo přepravě nákladu.",
  "warhorse": "Válečný kůň vycvičený k použití v boji.",
  "bit and bridle": "Udidlo a uzda sloužící k vedení a ovládání jezdeckého zvířete.",
  "feed per day": "Denní dávka krmiva pro zvíře.",
  "saddle exotic": "Speciální sedlo potřebné k jízdě na vodním nebo létajícím jezdeckém tvorovi.",
  "saddle military": "Vojenské sedlo pomáhá jezdci udržet se v sedle; poskytuje výhodu k ověřením, která provádí, aby z něj nespadl.",
  "saddle pack": "Nákladní sedlo určené k upevnění přepravovaného nákladu na zvíře.",
  "saddle riding": "Běžné sedlo určené k jízdě na zvířeti.",
  "saddlebags": "Brašny upevňované k sedlu pro přepravu vybavení.",
  "padded": "Prošívaná zbroj tvořená vycpávanými vrstvami látky.",
  "leather": "Kožená zbroj s hrudní a ramenní částí z tvrzené kůže a pružnějšími koženými částmi.",
  "studded leather": "Zbroj z pevné, pružné kůže vyztužené hustě osazenými nýty nebo hroty.",
  "hide": "Hrubá zbroj z tlustých kožešin a usní.",
  "chain shirt": "Kroužková košile z propojených kovových kroužků nošená mezi vrstvami oděvu nebo kůže.",
  "scale mail": "Zbroj z koženého oděvu pokrytého překrývajícími se kovovými šupinami.",
  "breastplate": "Tvarovaný kovový kyrys s poddajnou koženou výstrojí, který chrání především trup.",
  "half plate": "Poloplátová zbroj z tvarovaných kovových plátů kryjících většinu těla; nohy chrání jednodušší kovové díly.",
  "ring mail": "Kožená zbroj s našitými těžkými kovovými kruhy, které ji vyztužují proti zásahům.",
  "chain mail": "Kroužková zbroj z propojených kovových kroužků s vycpávanou spodní vrstvou a rukavicemi.",
  "splint": "Zbroj z úzkých svislých kovových pásů přinýtovaných ke koženému podkladu, s pružnou kroužkovou ochranou kloubů.",
  "plate": "Plátová zbroj z tvarovaných a vzájemně spojených kovových plátů kryjících celé tělo.",
  "orb arcane focus": gearDescriptions["arcane focus"],
  "rod arcane focus": gearDescriptions["arcane focus"],
  "staff arcane focus": gearDescriptions["arcane focus"],
  "wand arcane focus": gearDescriptions["arcane focus"],
  "wooden staff druidic focus": gearDescriptions["druidic focus"],
  "yew wand druidic focus": gearDescriptions["druidic focus"],
  "emblem holy symbol": gearDescriptions["holy symbol"],
  "reliquary holy symbol": gearDescriptions["holy symbol"],
  // Core SRD armor prose is not part of the adventuring gear catalog.
  shield: "Štít je vyrobený ze dřeva nebo kovu a drží se v jedné ruce. Používání štítu zvyšuje tvé obranné číslo o 2. Výhody můžeš získat pouze z jednoho štítu současně.",
};

export function czechGearDescription(name: string): string | undefined {
  const key = textKey(name);
  // Some editions spell Thieves\' Tools without the possessive apostrophe.
  return Object.hasOwn(GEAR_DESCRIPTIONS, key) ? GEAR_DESCRIPTIONS[key] : undefined;
}
