// Independently written Czech quick guides to verified Tome of Heroes
// effects. They are explanatory summaries, not full translations of the
// published rules. The complete source text remains available underneath.
// No invented save DCs, ranges, durations, costs or dice values.
import { textKey } from "@/lib/language/text-logic";
import type { Locale } from "@/lib/i18n/translate";

const TOME_OF_HEROES_SPELL_NOTES: Readonly<Record<string, string>> = {
  "Fuse Armor": "Způsobí, že pohyblivé kovové části srostou a přestanou pracovat. Může znehybnit klouby zbroje i další kovové mechanismy, například naviják nebo součásti konstruktu. Konkrétní záchrany, trvání a omezení určuje původní popis kouzla.",
  "Secret Blind": "Vytvoří ochrannou sféru, která brání pohledu dovnitř a maskuje chráněný prostor iluzí. Slouží jako nenápadný úkryt; podrobnosti o vstupu a odhalení sféry jsou v původních pravidlech.",
  "Pincer": "Vyvolá hromový útok z protilehlých stran, takže zasáhne prostor sevřený mezi dvěma výsečemi. Přesnou oblast a způsob vyhodnocení zranění určuje původní popis.",
  "Lightless Torch": "Vytvoří prostor, v němž temnovid umožňuje vnímat okolí jako za jasného světla, aniž by kouzlo samo vydávalo světlo. Z běžného osvětlení tím nevzniká skutečné světlo.",
  "Long Game": "Uloží skrytý psychický účinek, který může sesilatel spustit později. Podmínky spuštění, časové omezení a způsob odolání určuje původní text kouzla.",
  "Clear The Board": "Teleportací oddělí spojence od protivníků a přesune obě skupiny na opačné strany bojiště. Podrobnosti o cílech, vzdálenosti a možném odolání uvádí původní kouzlo.",
  "Mud": "Promění oblast ve vazké bahno, které ztěžuje pohyb a může tvory zadržet. Rozsah, trvání a případné záchranné hody se řídí původními pravidly.",
  "Invested Champion": "Dotykem propojíš dvě bytosti ve vztahu ochránce a chráněného. Můžeš svého šampiona podporovat kouzly s dosahem dotyk na vzdálenost 60 stop a poskytovat mu výhody k útokům; pokud sám sloužíš jako šampion, lépe bráníš svého svěřence.",
  "Lance": "Vyšleš kopí čisté magické síly. Při úspěšném kouzelném útoku na dálku způsobí 5k6 silového zranění a cíl znehybní do konce jeho dalšího tahu.",
  "Less Fool, I": "Dotykem chráníš tvora proti lžím a duševnímu ovlivnění. Ostatní mají nevýhodu k ověřením Charismatu, jimiž na něj působí, a cíl má výhodu při odolávání okouzlení a vystrašení způsobenému kouzly.",
  "Martyr's Rally": "Když upadneš do bezvědomí, povzbudíš spojence, kteří tě vidí a slyší do 60 stop. Po dobu účinku mají výhodu k hodům na útok; kouzlo skončí, jakmile znovu získáš životy.",
  "Piper's Lure": "Očaruješ nemagický dechový hudební nástroj. Tvorové v jeho blízkosti mohou neuspět v záchraně na Moudrost, být okouzleni a nuceni se k nástroji přibližovat; přímo u nástroje přestanou jednat. Útok na očarovaný cíl účinek ukončí.",
  "Reaper's Knell": "Zvuk zvonu označí tvory v kouli o poloměru 20 stop nekrotickou energií, pokud neuspějí v záchraně na Moudrost. Když označený tvor padne na nula životů nebo zemře, může sesilatel obnovit sobě nebo spojenci 2k8 životů plus opravu sesílací vlastnosti.",
  "Silvershout": "Křik pokryje tvory v kuželu o délce 30 stop stříbrným prachem. Prach odhaluje měňavce a po neúspěšné záchraně na Odolnost způsobí, že útoky zbraní proti zasaženému se při překonávání odpovídajících odolností počítají jako postříbřené.",
  "Smelting Blast": "Vystřelíš proud žhavého kovu. Úspěšný kouzelný útok způsobí 2k8 ohnivého zranění; neúspěšná záchrana na Odolnost navíc cíl obalí kovem a na začátku dalších tahů ho zraňuje za 1k8, dokud neuspěje v opakované záchraně.",
  "Sneer": "Pohrdavým úšklebkem psychicky zraníš viditelného tvora. Pokud neuspěje v záchranném hodu na Charisma, utrpí 2k4 psychického zranění plus tvou opravu sesílací vlastnosti.",
  "Spiked Barricade": "Vytvoříš šest dřevěných zátarasů s hroty. Jejich oblasti jsou obtížný terén a poskytují poloviční kryt; při vstupu nebo zahájení tahu mohou po neúspěšné záchraně na Sílu způsobit 3k6 bodného zranění. Při soustředění po celou dobu se zátarasy stanou trvalými.",
  "Spite": "Za cenu 1 bodného zranění si vytvoříš odvetnou ochranu. První tvor, který tě během trvání zasáhne útokem, utrpí 3k6 psychického zranění; pak kouzlo skončí.",
  "Steam Gout": "Vyvoláš vysoký gejzír páry, který zhasí otevřené plameny. Tvorové v oblasti při vzniku podstupují záchranu na Obratnost proti 2k8 ohnivého zranění a sražení k zemi; později může kluzká podlaha srážet další tvory.",
  "Stone Aegis": "Kamenný povlak ti ihned poskytne 5 dočasných životů a bonus +2 k třídě zbroje, včetně vyvolávajícího útoku. Bonus lze v dalších tazích udržovat bonusovou akcí, nejvýše po uvedenou dobu.",
  "Stone Fetch": "Vytvoříš kamenného dvojníka s údaji zemního elementála. Dvojník neumí útočit, ale plní příkazy, napodobuje tvůj hlas i chování a můžeš přes jeho smysly pozorovat okolí.",
  "Sudden Slue": "Přivoláš příval medvědů do krychle o hraně 20 stop. Tvorové v oblasti podstoupí záchranu na Obratnost; při neúspěchu utrpí 6k6 drtivého zranění a spadnou k zemi, při úspěchu jen polovinu zranění.",
  "Sudden Stampede": "Přízrační koně procválají v pásu širokém 10 stop a dlouhém 60 stop. Každý tvor v cestě utrpí 6k10 drtivého zranění a padne k zemi; úspěšná záchrana na Obratnost zranění půlí a pádu zabrání.",
  "Toadstool Ring": "Vyroste kruh hub, v němž může vybraný tvor meditovat a položit tři otázky: o minulosti, přítomnosti a budoucnosti. Pán jeskyně odpovídá pravdivými snovými vizemi; opakované sesílání před dlouhým odpočinkem zvyšuje riziko nesouvisejících vidin.",
  "Toothless Beast": "Oslabíš přirozené útoky cíle. Po neúspěšné záchraně na Moudrost hází zranění kousnutím, drápy či jinou přirozenou zbraní dvakrát a použije nižší výsledek. Kouzlo nepůsobí na konstrukty.",
  "Trollish Charge": "Ochotného spojence zahalíš iluzí nejhorších nočních můr. Po přímém náběhu alespoň 10 stop může jeho útok cíl vystrašit; proti vystrašenému cíli si při zásahu hodí kostkami zranění dvakrát a použije lepší součet.",
  "Vine Carpet": "Necháš vyrůst hustý koberec lián o poloměru 20 stop. Nehybné ležící tvory a předměty pod sebou zcela kryje, při pohybu poskytuje jen tříčtvrteční kryt. Po vršku lze přejít, aniž by byly ukryté věci snadno objeveny.",
  "War Horn": "Zvuk válečného rohu může vystrašit až tři protivníky po neúspěšné záchraně na Moudrost. Až tři spojenci zároveň získají 2k4 dočasných životů plus opravu sesílací vlastnosti a výhodu k příštímu útoku.",
  "Wild Hunt": "Spolu s až devíti dalšími účastníky vyvoláš ducha divokého honu. Účastníci jsou imunní vůči okouzlení a vystrašení, mají +1 k třídě zbroje, výhodu k zvolenému druhu fyzických záchran a každé kolo posílí první zásah. Po skončení utrpí stupeň vyčerpání.",
  "Ambush Chute": "Dotykem pevného povrchu vytvoříš dvojici poklopů spojených krátkým extradimenzionálním průchodem. Otvory mohou být až 30 stop od sebe a najednou jimi může projít nejvýše pět tvorů.",
  "Armored Formation": "Až dvanáct ochotných tvorů získá výhody obranné formace, pokud stojí ve skupině nejvýše 5 stop od sebe. Konkrétní bonusy závisejí na počtu tvorů v dané formaci.",
  "Babble": "V kouli o poloměru 30 stop se po neúspěšné záchraně na Inteligenci mění řeč tvorů v nesrozumitelné blábolení. Nemohou používat mluvené jazyky ani sesílat kouzla se slovní složkou; telepatie funguje dál.",
  "Battle Mind": "Předvídáš překvapení v boji a můžeš varovat spojence. Bonusovou akcí jim poskytneš výhodu k příštímu hodu, znevýhodníš nepřátelský útok nebo prozradíš polohu skrytého či neviditelného protivníka.",
  "Beast Within": "Ochotný tvor získá dočasné vlkodlačí rysy: odolnost proti nepostříbřeným nemagickým fyzickým útokům, lepší čich a sluch a údery drápy (1k4 + Síla) či kousnutím (1k6 + Síla). Kouzlo nepřenáší lykantropii.",
  "Betraying Bauble": "Spojíš dva malé předměty, které mohou sloužit ke vzájemnému hledání. Při držení jednoho vnímáš směr druhého, případně i pohyb; do 30 stop od sebe slabě vibrují. Silná vrstva olova sledování blokuje.",
  "Bloodlust": "Ochotný tvor získá 1k6 dočasných životů, výhodu k ověřením Síly a při zásahu zbraní přidává 1k6 zranění. Po skončení účinku na jednu minutu utrpí stupeň vyčerpání.",
  "Blunted Edge": "Po neúspěšné záchraně na Moudrost má cíl nevýhodu k útokům zbraní a při zásahu hází kostkami zranění dvakrát, přičemž musí použít nižší výsledek. Záchranu může opakovat na konci každého tahu.",
  "Bolster Fortifications": "Ochranné kouzlo zpevní budovy a hradby o celkové ploše nejvýše 2 500 čtverečních stop a výšce do 20 stop. Jejich práh poškození se zvýší o 5, nebo se stane 5, pokud žádný neměly.",
  "Bound Haze": "Kolem cíle se roztočí prach, kamínky a vítr. Po neúspěšné záchraně na Obratnost má nevýhodu k útokům a Vnímání; v mlze nebo plynu se jeho odolávání ještě zhorší.",
  "Burst Stone": "Půda, písek nebo neopracovaný kámen v bodě vybuchne. Tvorové do 10 stop podstoupí záchranu na Obratnost proti 4k8 drtivého zranění a sražení k zemi; zůstane pět stop hluboká jáma a obtížný terén.",
  "Butterfly Effect": "Roj iluzorních motýlů může cíl okouzlit po neúspěšné záchraně na Charisma. Cíl nemůže reagovat a na začátku každého tahu určuje hodem k10 své nepředvídatelné chování.",
  "Calm Beasts": "Zvířata v kouli o poloměru 20 stop podstoupí záchranu na Charisma. Neúspěšným můžeš dočasně potlačit okouzlení či strach nebo změnit jejich nepřátelskost na lhostejnost.",
  "Conjure Construct": "Přivoláš přátelský konstrukt s nebezpečností nejvýše 5. Má vlastní iniciativu a poslouchá slovní příkazy; pokud ztratíš soustředění, může se obrátit proti družině a zmizí až po uplynutí své doby.",
  "Conjure Spectral Allies": "Přivoláš pomstychtivé duchy ze hřbitovní hlíny. Tvorové v kouli o poloměru 30 stop podstoupí záchranu na Moudrost; při neúspěchu utrpí 6k10 nekrotického zranění a na minutu se vystraší, při úspěchu poloviční zranění.",
  "Convey Inner Peace": "Ty a až pět ochotných tvorů můžete jednou během trvání kouzla absolvovat dlouhý odpočinek čtyřhodinovou meditací podobně jako elfové; získáte obvyklé výhody osmihodinového odpočinku.",
  "Crown of Thorns": "Psychická pouta trestají sesílání kouzel. Pokaždé když postižený tvor sesílá kouzlo, musí uspět v záchraně na Charisma, jinak utrpí 2k6 psychického zranění a seslání selže bez utracení pozice.",
  "Damaging Intel": "Odhalíš zranitelnosti, odolnosti a imunity tvora vůči druhům zranění, pokud neuspěje v záchraně na Charisma. Příští útok jednoho spojence proti němu do konce tvého následujícího tahu má výhodu.",
  "Deadly Salvo": "Z ruky vypálíš až pět magicky poháněných střel na viditelné cíle. Za každou provedeš kouzelný útok na dálku; při zásahu způsobí 3k6 bodného zranění a mohou interagovat s vlastností výbuchu střelného prachu.",
  "Divine Retribution": "Při upadnutí do bezvědomí sesíláš odvetný zásah. Útočník utrpí zářivé zranění 1k8 plus zranění spouštěcího útoku, démoni a nemrtví navíc 1k8; po neúspěšné záchraně na Odolnost může být omráčen.",
  "Dreamwine": "Vílí víno propůjčí až osmi účastníkům schopnost vidět neviditelné tvory, předměty i do Éterické sféry a výhodu k ověřením a záchranám na Charisma.",
  "Emerald Eyes": "Po neúspěšné záchraně na Moudrost se cíl stane paranoidním: věří, že mu ostatní chtějí vše ukrást, a musí útočit na nejbližšího tvora kromě sebe a sesilatele.",
  "Enchanted Bloom": "Očarovaná růže způsobí tomu, kdo se jí dotkne a neuspěje v záchraně na Charisma, hluboký spánek až na 24 hodin. Probuzení vyžaduje silnou obnovovací magii, rozhodnutí sesilatele nebo úspěšné opakované odolání po zranění.",
  "Eruption": "Na zvoleném místě vyrazí malá sopka. Okolní tvorové podstoupí záchranu na Sílu proti 8k6 drtivého zranění a sražení k zemi; v dalších kolech sopka při soustředění chrlí kouř a další nebezpečí.",
  "Feint": "V okamžiku útoku vytvoříš mihotavého iluzorního dvojníka, který rozptýlí pozornost cíle. K příštímu útoku proti tomuto cíli do konce dalšího tahu máš výhodu.",
  "Fey Food": "Očaruješ jídlo nebo nápoj vílí magií. Až čtyři jedlíci na libru jídla či galon nápoje po neúspěšné záchraně na Charisma podle tvé volby usnou, budou okouzleni nebo si budou pamatovat jen útržky uplynulé hodiny.",
  "Fey-Touched Blade": "Nemagická zbraň se na dobu účinku stane magickou a při zásahu způsobuje navíc 1k4 silového, psychického, nekrotického nebo zářivého zranění podle tvé volby.",
  "Forced Reposition": "Cíl teleportuješ do volného prostoru až 60 stop nad sebou. Neochotný tvor může uspět v záchraně na Odolnost; pokud neumí létat ani se zachytit, utrpí obvyklé zranění pádem.",
  "Furious Wail": "Výkřik zasáhne mysl až pěti tvorů. Při neúspěšné záchraně na Charisma utrpí 10k10 + 30 psychického zranění a jsou omráčeni do konce příštího tahu; při úspěchu utrpí poloviční zranění.",
  "Gale": "Venku vyvoláš prudký vítr a ledový déšť v obrovské oblasti. Místo je silně zahalené, kluzké a obtížné; letci musejí přistát a tvorové po neúspěšné záchraně na Odolnost utrpí chladné zranění.",
  "Glare": "Pohrdavým pohledem zaskočíš až dva tvory. Neúspěšná záchrana na Moudrost jim zabrání jednat v příštím tahu; při neúspěchu alespoň o 5 nemohou jednat ve dvou dalších tazích.",
  "High Ground": "Venku vyzvedneš terén do vyvýšeného valu vysokého 10 stop a dlouhého až 30 stop. Tvorům na vrcholu zdvojnásobuješ dostřel útoků směrem na níže položené cíle.",
  "Immolating Gibbet": "Až tři tvory můžeš po neúspěšné záchraně na Obratnost vytáhnout do výšky 60 stop a znehybnit. Na začátku tahů čelí záchraně na Odolnost proti 7k6 ohnivého zranění; při vysvobození mohou utrpět zranění pádem.",
  "Inexorable Summons": "Přivoláš vybraného tvora teleportací do volného prostoru do 5 stop od sebe. Neochotný tvor se může ubránit záchranou na Moudrost; cíl nesmí skončit v nebezpečném terénu.",
  "Instant Armored Vehicle": "Z dostupných materiálů okamžitě vytvoříš obří obrněné vozidlo pro až čtyři Střední tvory. Má TZ 18, 100 životů a podle podoby se pohybuje po zemi, ve vzduchu nebo po vodě.",
  "Iron Gut": "Ochotný tvor získá odolnost proti jedovému zranění a výhodu k záchranám proti jedům. Jednu záchranu na Odolnost může automaticky uspět za cenu ukončení kouzla; také bezpečně požívá běžně závadné jídlo.",
  "Jagged Forcelance": "Mezi dvěma ochotnými tvory vznikne zubaté pouto magické síly, pokud zůstávají do 15 stop od sebe. Tvor, který jím projde, podstoupí záchranu na Sílu proti 3k6 silového zranění a pádu.",
  "Jarring Growl": "Hrdelní zavrčení ti dá výhodu k zastrašování do začátku příštího tahu. Tvorové do 5 stop podstoupí záchranu na Moudrost; proti neúspěšným máš do konce tahu výhodu k útokům.",
  "Life Burst": "S výkřikem vyčerpáš všechny zbývající body schopnosti Vložení rukou a rozdělíš jejich léčivou sílu spojencům do 30 stop. Nejprve léčí nemoci a jedy za pět bodů každé, zbytek obnoví životy.",
  "Magma Spray": "Ze země vytryskne sloup magmatu vysoký i široký 5 stop. Tvorové, kteří se v něm objeví, vstoupí do něj nebo v něm skončí tah, čelí 3k8 ohnivého zranění, při úspěšné záchraně na Obratnost polovině.",
  "Mantle of the Brave": "Dotykem posílíš odvahu až čtyř tvorů. K nejbližší záchraně proti vystrašení mají výhodu; po využití této výhody účinek pro daného tvora skončí.",
  "Mass Faerie Fire": "Až tři krychle o hraně 20 stop pokryješ vílím světlem. Neúspěšnou záchranu na Obratnost u tvorů provází záření, které brání výhodám neviditelnosti a dává útočníkům schopným cíl vidět výhodu.",
  "Misdirection": "Krátkým zábleskem, zvukem nebo jiným rozptýlením narušíš právě prováděný útok tvora, kterého vidíš. Jeho hod na útok má nevýhodu.",
  "Muted Foe": "Dotykem očaruješ nemagickou zbraň. Při příštím zásahu způsobí navíc 1k6 hromového zranění a cíl na minutu ohluší; po dobu účinku nedokáže sesílat kouzla se slovní složkou.",
  "Never Surrender": "Když cíl klesne na nula životů, zůstane při vědomí a může dál bojovat, ale stále podstupuje záchrany proti smrti. První provádí se zpožděním a nevýhodou; při obnovení životů kouzlo skončí.",
  "Oathbound Implement": "Zavážeš cíli úkol spojený s použitím zbraně. Pokud neuspěje v záchraně na Moudrost, má při jeho plnění výhodu k prvnímu útoku v tahu; při použití zbraně mimo úkol má nevýhodu a používá nižší ze dvou hodů kostkami zranění.",
  "Outmaneuver": "Když protivník vyprovokuje příležitostný útok tvého spojence, můžeš po jeho neúspěšné záchraně na Moudrost zastavit jeho pohyb a přiblížit se k němu bez příležitostných útoků.",
  "Oversized Paws": "Ochotnému tvorovi se zvětší ruce a chodidla. Po dobu účinku způsobují jeho neozbrojené údery navíc 1k4 zranění.",
  "Portal Jaunt": "Pomocí připraveného klíče vytvoříš jednosměrný portál mezi dvěma uměle vytvořenými dveřmi nebo průchody. Projdeš jím ty nebo jiný ochotný tvor; přenese se i vše, co nese.",
  "Portal Trap": "Vytvoříš iluzí skrytý portál na povrchu. Tvor, který ho naruší, po neúspěšné záchraně na Moudrost náhodně teleportuje do vzdálenosti až 30 stop.",
  "Power Word Fling": "Slovem moci vymrštíš viditelného tvora až o 15 stop vodorovně nebo svisle. Po nárazu může utrpět 3k6 drtivého zranění, při pádu další zranění a být sražen k zemi.",
  "Power Word Rend": "Slovo moci naruší životně důležité orgány cíle. Po neúspěšné záchraně na Odolnost utrpí 4k6 + 20 silového zranění, při úspěchu polovinu. Na cíle bez vnitřních orgánů nepůsobí.",
  "Rebounding Bolt": "Silový paprsek přeskakuje mezi různými cíli vzdálenými od sebe nejvýše 30 stop. Prvnímu způsobí 5k6 silového zranění, dalším postupně o jednu k6 méně; záchrana na Odolnost zranění půlí.",
  "Repulsing Wall": "Vytvoříš poloprůhlednou stěnu, jejíž jedna strana způsobuje 5k8 zářivého zranění a při neúspěšné záchraně na Sílu tvory odstrčí o 10 stop a srazí je k zemi. Druhá strana je neškodná.",
  "Retribution": "Zahalíš se přízračnou zbrojí. První tvor, který tě zasáhne útokem na blízko, utrpí silové zranění rovné polovině zranění, které ti způsobil, a může být odstrčen o 5 stop; kouzlo pak skončí.",
  "Rockfall Ward": "Na chvíli zpomalíš padající ne-magické trosky nejvýše o velikosti krychle s hranou 10 stop. Klesají 60 stop za kolo a zastaví se 5 stop nad zemí; kouzlo neblokuje vystřelené střely.",
  "Sacrifice Pawn": "Když spojenecký tvor v dosahu spadne na nula životů, využiješ uvolněnou životní energii. Obnovíš si počet životů rovný jeho úrovni nebo nebezpečnosti plus své opravě sesílací vlastnosti.",
  "Sacrificial Healing": "Vyléčíš tvorovi 4k8 životů, ale stejné množství zranění přeneseš na sebe nebo na jiného ochotného tvora v dosahu.",
  "Safe Transposition": "Když je napaden spojenec s méně než polovinou maxima životů, okamžitě si s ním vyměníš místo teleportací. Spouštěcí útok se pak porovná s tvou třídou zbroje.",
  "Shared Frenzy": "Spojenečtí tvorové v dosahu mohou podle výsledku záchrany na Charisma získat odolnost proti drtivému, bodnému a sečnému zranění a výhodu k útokům. Útoky proti nim však mají také výhodu.",
  "Shocking Volley": "Z iluzorního luku vystřelíš bleskové šípy do oblasti o poloměru 20 stop. Neúspěšná záchrana na Obratnost znamená 2k8 bleskového zranění a zneschopnění do konce příštího tahu; úspěch půlí zranění.",
  "Sightburst": "Zvuková vlna ti do začátku příštího tahu poskytne slepozrak do vzdálenosti 100 stop a umožní odhalovat přírodní nebezpečí. K záchranám proti takto zjištěným hrozbám máš výhodu.",
};

const INDEX = Object.fromEntries(
  Object.entries(TOME_OF_HEROES_SPELL_NOTES)
    .map(([name, description]) => [textKey(name), description]),
);

export function thirdPartySpellSummaryCs(
  reference: { name?: string; source?: string; documentSlug?: string; kind: string },
  locale: Locale,
): string | null {
  if (locale !== "cs" || reference.kind !== "spells"
    || reference.source !== "open5e" || reference.documentSlug !== "toh") return null;
  return INDEX[textKey(reference.name ?? "")] ?? null;
}

export function localizedThirdPartySpellDescription(
  reference: { name?: string; source?: string; documentSlug?: string; kind: string },
  locale: Locale,
  original: string | null,
): string | null {
  const summary = thirdPartySpellSummaryCs(reference, locale);
  if (!summary) return original;
  return `**Stručný český přehled:** ${summary}${original
    ? `\n\n**Úplný pravidlový popis (anglicky):**\n\n${original}`
    : ""}`;
}
