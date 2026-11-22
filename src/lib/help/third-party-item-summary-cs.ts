// Independent Czech orientation notes for a few documented supplement
// weapons. These deliberately do NOT replace the source's full rules: the
// unique 'special' mechanics remain in the original English description.
import { textKey } from "@/lib/language/text-logic";
import type { Locale } from "@/lib/i18n/translate";

const TOME_OF_HEROES_ITEM_NOTES: Readonly<Record<string, string>> = {
  "Axespear": "Vojenská zbraň na blízko se dvěma údernými konci. Její druhý konec má vlastní kostku zranění.",
  "Barge Pole": "Jednoduchá obouruční zbraň s prodlouženým dosahem a zvláštními pravidly použití.",
  "Bladed Scarf": "Ohebná sečná zbraň s prodlouženým dosahem a vlastností vytříbená.",
  "Blunderbuss": "Obouruční palná zbraň na střelný prach. Před dalším výstřelem vyžaduje nabití.",
  "Bolas": "Vrhací zbraň se zvláštními pravidly. Uvedený dosah je 5/15 stop.",
  "Chain Hook": "Řetězový hák s prodlouženým dosahem, který lze také vrhat.",
  "Chakram": "Vrhací sečná zbraň s dostřelem 20/60 stop.",
  "Climbing Adze": "Lehká sečná zbraň použitelná při boji na blízko.",
  "Clockwork Crossbow": "Mechanická obouruční kuše se zásobníkem na šest střel.",
  "Dwarven Revolving Musket": "Obouruční mušketa na střelný prach s otočným zásobníkem na osm střel.",
  "Elven Dueling Blade": "Obouruční elfská sečná zbraň s vlastností vytříbená.",
  "Joining Dirks": "Dvojice lehkých vytříbených dýk se zvláštním způsobem společného použití.",
  "Wormsilk Net": "Vrhací síť se zvláštními pravidly a dostřelem 10/20 stop.",
  "Wormsilk Whip": "Sečná zbraň s prodlouženým dosahem a vlastností vytříbená.",
  "Wrist Knife": "Lehká vytříbená čepel pro boj na blízko.",
  "Esquire's Rowels": "Při jízdě na koni dávají ostruhy +1 k iniciativě a +2 k třídě zbroje jezdeckého zvířete. Jezdec i zvíře mají výhodu k záchranám na Odolnost proti vyčerpání z cestování delšího než osm hodin denně.",
  "Soulbound Wraps": "Při zásahu neozbrojeným úderem můžeš snížit způsobené zranění až o 10. Za každých 10 neuděleného zranění získáš jeden bod ki. Po dosažení limitu obnovy rovného polovině zdatnostního bonusu se bandáže rozvinou až do příštího úsvitu.",
  "Stasis Stone": "Krystal lze akcí hodit do vzdálenosti 30 stop. Při dopadu se rozbije a všichni tvorové do 10 stop podstoupí záchranu na Odolnost SO 15; při neúspěchu zkamení do konce svého příštího tahu.",
  "Stormheart Bow": "Magický luk při zásahu způsobuje navíc 1k6 bleskového zranění. Má pět nábojů, z nichž 1k4 + 1 se obnoví za úsvitu; náboje umožňují zvláštní ledové a hromové zásahy.",
  "Victory Banner": "Prapor má tři náboje a obnovuje je za úsvitu. Za jeden náboj získáš na minutu výhodu k útokům zbraní; při hodu přirozené 20 můžeš za náboj projít až svou rychlostí bez příležitostných útoků. Musíš být do 5 stop od praporu.",
  "Argent Mantle": "Stříbrný rytířský plášť může příkazovým slovem vyvolat zlatou záři: jasné světlo 20 stop, šero dalších 20 stop. Spojenci v jasném světle mají výhodu k iniciativě a pokud nejsou zneschopnění, nemohou být překvapeni. Jednou do příštího úsvitu lze akcí nastavit vlastní Charisma na 20 po dobu 10 minut.",
  "Axe of Many Strikes": "Magická sekera dává +1 k útokům i zranění. Po zásahu můžeš místo poškození uložit sílu rány až na minutu, nejvýše tři rány; při pozdějším zásahu je můžeš uvolnit. Za každé uvolnění hrozí 10% riziko výbuchu, který sekery zničí a způsobí sesilateli 2k6 silového zranění za každou uloženou ránu.",
  "Beads of Contemplation": "Osm korálků dokáže uchovat dohromady osm bodů ki. Po krátkém nebo dlouhém odpočinku můžeš vložit body ki v množství odpovídajícím polovině zdatnostního bonusu; bonusovou akcí je lze z korálků znovu načerpat.",
  "Bloodspeed Elixir": "Po vypití se rychlost na jednu minutu ztrojnásobí. Kdykoli v této době provedeš akci Běh, utrpíš 2k6 jedového zranění.",
  "Campaign Field Tent": "Látková kostka se příkazovým slovem promění ve stan 15 × 15 × 10 stop až pro šest Středních tvorů. Tvor v místě rozvinutí podstoupí záchranu na Obratnost SO 15 proti 5k10 drtivého zranění. Stan má 50 životů, odolnost proti většině zranění a lze ho zrušit příkazem, pokud je prázdný.",
  "Cestus": "Magické kožené bandáže posilují neozbrojené údery. K hodům na útok i zranění přičítají +1, +2 nebo +3 podle vzácnosti.",
  "Chain Cilice": "Ostnatý řetěz lze příkazem utáhnout, takže na začátku každého tahu způsobuje nositeli 1k6 bodného zranění. Za každých pět utrpěných zranění může obnovit jeden bod ki; účinek nedovolí klesnout na nula životů a po takovém ukončení se obnoví až za úsvitu.",
  "Cloak of Tentacles": "Plášť může akcí na chvíli zneschopnit viditelné tvory do 10 stop po neúspěšné záchraně na Moudrost SO 15. Bonusovou akcí také vyvolá čtyři chapadla na minutu; každé při zásahu útočníka zblízka útočí s bonusem +7 a způsobí 2k10 drtivého zranění. Obě schopnosti se obnovují za úsvitu.",
  "Deepstone Cestus": "Runami osazené bojové bandáže zvyšují obtížnost záchran proti tvým schopnostem ki o +2.",
  "Fletcher's Retort Gloves": "Rukavice vylepšují reakci Odražení střel: za jeden bod ki můžeš zranění snížit o 1k10 + opravu Obratnosti + dvojnásobek úrovně mnicha. Odraženou střelu lze poslat až 30/120 stop a chránit můžeš i spojence do 5 stop.",
  "Giantstrike Cestus": "Bandáže s železnými pláty zvyšují kostku zranění používanou pro mnišská bojová umění o jeden stupeň.",
  "Heartglow Lantern": "Krystalová lucerna bez plamene vydává jasné světlo do 20 stop a šero dalších 20 stop. Živý tvor jí může za cenu dočasného snížení maxima životů dodat náboje; jednotlivé varianty lucerny mají různé další účinky.",
  "Javelin of Teleportation": "Magický oštěp poskytuje +1 k útokům a zranění. Po zásahu může příkazovým slovem přemístit cíl na viditelné volné místo na zemi do 60 stop, pokud neuspěje v záchraně na Moudrost SO 13. Tato vlastnost se obnovuje za úsvitu.",
  "Knight-Sergeant's Surcoat": "Rytířský varkoč dává výhodu při Zacházení se zvířaty u koní a při Přesvědčování společensky výše postavených humanoidů. Pokud jej nosíš sladěný spolu se Stříbrným pláštěm, tvé Charisma je 20.",
  "Medic's Sash": "Šerpa zdvojnásobuje nosnost a dovoluje bez příležitostných útoků odnášet spojence s nula životy. Má tři náboje: za jeden lze akcí seslat Stabilizaci, za dva Léčení zranění. Náboje se obnovují za úsvitu.",
  "Momentblade": "Magická čepel dává +1 k útokům i zranění. Po přirozené dvacítce při útoku cíl zmizí v čase a vrátí se na konci příštího tahu útočníka; sám žádný čas nevnímá.",
  "Ninefold Swarmdagger": "Magická dýka +1 může po zásahu bonusovou akcí vyslat až na tři další viditelné tvory do 30 stop přízračné kopie. Každá zasahuje samostatným útokem a způsobuje 1k4 silového zranění. Po šesti zásazích kopiemi se vlastnost obnoví za úsvitu.",
  "Paired Gauntlets of Striking": "Dvě osoby s jednou rukavicí z páru získají výhodu k prvnímu útoku v každém svém tahu proti témuž tvorovi, pokud jsou obě do 5 stop od něj.",
  "Phase Arrow": "Šíp při střelbě ignoruje poloviční a tříčtvrteční kryt. Pokud víš, ve kterém prostoru se skrývá cíl za úplným krytem, můžeš se jej pokusit zasáhnout s nevýhodou.",
  "Potion Belt": "Opasek ukládá lektvary do krystalových pruhů. Běžná verze pojme jeden lektvar a účinek vyvoláš akcí; vzácnější verze pojme tři lektvary a vybraný účinek vyvoláš bonusovou akcí.",
  "Potion of Infinite Possibilities": "Po vypití získáš na hodinu slepozrak do 60 stop, schopnost vidět do Éterické sféry a možnost přehodit jedničku při útoku, ověření vlastnosti nebo záchraně (nový výsledek musíš použít). Po skončení budeš do konce příštího tahu omráčený.",
  "Pouch of Runestones": "Z nekonečného váčku lze akcí vytáhnout runový kámen. Jeho účinek určí hod k12 a poloha runy podle ověření Moudrosti SO 12; záchrany proti účinkům mají SO 15. Opakované použití před úsvitem zvyšuje obtížnost vyložení run. Jednotlivé runy mají vlastní pravidla.",
  "Serpentine Sandals": "Sandály umožňují ignorovat obtížný terén z mokřadů a mělké vody. Poskytují také výhodu k ověřením a záchranám při úniku z uchopení nebo znehybnění.",
  "Shattershot Arrow": "Šíp při zásahu způsobí navíc 3k6 hromového zranění. Tvorové z kamene, kovu či krystalu do 10 stop podstoupí záchranu na Odolnost SO 13 proti dalším 3k6 hromového zranění; zasaženy jsou také nenesené nemagické předměty.",
  "Dwarven Arquebus": "Trpasličí arkebuza je vojenská obouruční palná zbraň na dálku, zranění 2k6 bodné, dostřel 25/100 stop. Má vlastnosti Těžká, Nabíjecí a Střelný prach.",
  "Hand Trebuchet": "Ruční trebuchet je vojenská zbraň na dálku se střelivem, dostřelem 60/240 stop a zvláštními pravidly; běžné kostky zranění nemá uvedené.",
  "Light Pick": "Lehký krumpáč je jednoduchá lehká zbraň na blízko za 1k4 bodného zranění; lze jej vrhnout na 20/60 stop.",
  "Musket": "Mušketa je vojenská obouruční zbraň na dálku způsobující 1k10 bodného zranění, dostřel 80/320 stop. Používá střelný prach a vyžaduje nabití.",
  "Shashka": "Šaška je vojenská sečná zbraň na blízko za 1k4 zranění se zvláštními pravidly. Při obouručním použití způsobuje 1k10.",
  "Stone Rake": "Kamenné hrábě jsou jednoduchá obouruční zbraň na blízko způsobující 1k8 bodného zranění.",
  "Temple Sword": "Chrámový meč je lehká vytříbená vojenská zbraň na blízko způsobující 1k4 sečného zranění.",
  "Brigandine": "Brigantina patří mezi lehké zbroje. Její základní třída zbroje je 13 a přičítá se oprava Obratnosti.",
  "Kite shield": "Kapkovitý štít má zvláštní ochranné hodnoty vedené ve zdrojovém katalogu. Přesný výpočet třídy zbroje určuje jeho pravidlový blok.",
  "Manica": "Manika je štítová ochrana předloktí se samostatným pravidlovým blokem pro třídu zbroje.",
  "Silk-Backed Coin Mail": "Mincová zbroj na hedvábném podkladu je střední zbroj se základní třídou zbroje 14 a bonusem za Obratnost nejvýše +2.",
  "Stonesteel": "Kamenoocelová těžká zbroj má základní třídu zbroje 19; oprava Obratnosti ji nezvyšuje.",
  "Club Shield": "Kyjový štít lze použít jako lehkou vojenskou zbraň na blízko za 1k4 drtivého zranění. Jeho zvláštní ochranná pravidla zůstávají v původním popisu.",
  "Double Axe": "Dvojitá sekera je těžká obouruční vojenská zbraň na blízko za 1k8 sečného zranění. Druhý konec zbraně způsobuje 1k6.",
  "Dwarven Axe": "Trpasličí sekera je vojenská sečná zbraň za 1k4 zranění s možností obouručního úderu za 1k10 a zvláštními pravidly.",
  "Granite Fist": "Žulová pěst je jednoduchá zbraň na blízko, která způsobuje 1k4 drtivého zranění.",
  "Khopesh": "Chopéš je vojenská zbraň na blízko za 1k4 sečného zranění; při obouručním držení způsobuje 1k8.",
  "Pistol": "Pistole je lehká jednoduchá palná zbraň na dálku za 1k6 bodného zranění, dostřel 30/120 stop. Používá střelný prach a vyžaduje nabití.",
  "Pneumatic War Pick": "Pneumatický válečný krumpáč je vojenská bodná zbraň na blízko za 1k4 zranění se zvláštním pravidlem.",
  "Shotel": "Šotel je vytříbená vojenská zbraň na blízko, která způsobuje 1k4 sečného zranění a má zvláštní pravidlo.",
  "Whipsaw": "Bičová pila je vytříbená vojenská sečná zbraň na blízko za 1k4 zranění.",
};
const VAULT_OF_MAGIC_ITEM_NOTES: Readonly<Record<string, string>> = {
  "Air Seed": "Po použití uvolňuje dýchatelný vzduch, rozptyluje okolní plyny a pomáhá tvorům zadržet dech i pod vodou.",
  "Bag of Traps": "Magický vak vytváří náhodné mechanické pasti. Počet vyvolaných pastí je omezen na určité období.",
  "Eye of Horus": "Amulet pomáhá prohlédnout iluze a dává výhodu k záchranným hodům proti vystrašení.",
  "Cloak of the Rat": "Plášť poskytuje bonus +5 k pasivnímu Vnímání.",
};

const VAULT_BY_NAME = Object.fromEntries(
  Object.entries(VAULT_OF_MAGIC_ITEM_NOTES).map(([english, czech]) => [textKey(english), czech]),
);

const BY_NAME = Object.fromEntries(
  Object.entries(TOME_OF_HEROES_ITEM_NOTES).map(([english, czech]) => [textKey(english), czech]),
);

export function thirdPartyItemSummaryCs(
  reference: { source?: string; documentSlug?: string; name?: string },
  locale: Locale,
): string | null {
  if (locale !== "cs" || reference.source !== "open5e") return null;
  const key = textKey(reference.name ?? "");
  if (reference.documentSlug === "toh") return BY_NAME[key] ?? null;
  if (reference.documentSlug === "vom") return VAULT_BY_NAME[key] ?? null;
  return null;
}
