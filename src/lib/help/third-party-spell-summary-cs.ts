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
