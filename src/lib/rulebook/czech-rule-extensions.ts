// Original Czech explanations of additional SRD 5.1 rules.
// These are concise summaries, never verbatim copies of external Czech PDFs.
// The complete CC BY 4.0 English SRD text is shown below each summary.
export const CZECH_RULE_NOTES: Readonly<Record<string, string>> = {
  alignment: `Přesvědčení popisuje obecné morální postoje postavy. V pravidlech se pracuje se dvěma osami: **dobro – neutralita – zlo** a **zákonnost – neutralita – chaos**. Dohromady tvoří devět běžných přesvědčení. Není to náhrada za povahu, motivace ani rozhodnutí konkrétní postavy.`,

  languages: `Postava na začátku zná jazyky podle rasy a zázemí; další může získat prostřednictvím povolání nebo jiných schopností. Znalost jazyka zahrnuje obvykle mluvení, čtení i psaní. Některé jazyky sdílejí písmo. Běžné a exotické jazyky jsou uvedené v anglické tabulce níže.`,

  backgrounds: `**Zázemí** popisuje, čím se postava živila a co zažila před dobrodružstvím. Typicky poskytuje zdatnosti ve dvou dovednostech, případně s nástroji a jazyky, počáteční vybavení a zvláštní příběhovou schopnost. Osobnost dotvářejí povahové rysy, ideály, pouta a vady. Zázemí lze se souhlasem Pána jeskyně upravit.`,

  coinage: `Peníze se používají při nákupu výbavy a placení služeb. Základní měnou je **zlatý (zl; gold piece / gp)**. Jeden zlatý odpovídá deseti stříbrným, jeden stříbrný deseti měděným. Elektrum má hodnotu pěti stříbrných a platina deseti zlatých. Cena předmětů a směnné kurzy jsou součástí původní tabulky.`,

  "selling-treasure": `Běžné, nepoškozené vybavení lze zpravidla prodat za polovinu uvedené ceny. Zbraně a zbroje získané od nestvůr nemusí být v použitelném stavu. Drahokamy, šperky a umělecká díla se obvykle prodávají za plnou hodnotu. Pro magické předměty platí zvláštní pravidla a dostupnost kupujících určuje Pán jeskyně.`,

  "adventuring-gear": `Dobrodružná výbava zahrnuje například batohy, lana, světelné zdroje, příděly, nádoby nebo lektvary. Každý předmět má cenu a často také hmotnost. Některé předměty vyžadují použití akce a mají konkrétní herní účinek; ten popisují původní položky v tabulce.`,

  tools: `Zdatnost s nástroji umožňuje přičíst **zdatnostní bonus** k ověřením, při nichž dané nástroje používáte. Nejde automaticky o výhodu a samotná zdatnost neznamená, že nástroje postava vlastní. Vybavení zahrnuje řemeslnické nástroje, hudební nástroje, herní sady a zvláštní vybavení, například zlodějské náčiní.`,

  "mounts-and-vehicles": `Jízdní zvířata a dopravní prostředky umožňují cestovat, převážet vybavení a někdy bojovat ze sedla. Každý prostředek má vlastní cenu, rychlost a případnou nosnost. Při nasedání a sesedání se spotřebovává část pohybu. Ovládaný jízdní tvor má při boji omezené volby akcí; samostatný jízdní tvor jedná podle své iniciativy.`,

  "trade-goods": `Obchodní zboží zahrnuje suroviny a běžné produkty obchodované mezi osadami. Na rozdíl od použitého vybavení se obchodní zboží při běžném prodeji oceňuje přibližně uvedenou hodnotou, pokud ve světě nejsou zvláštní okolnosti.`,

  expenses: `Životní náklady určují pohodlí postavy, její možnosti bydlení a běžnou každodenní útratu. Náklady se běžně počítají za den, a to podle zvoleného životního stylu. Pán jeskyně může upravit ceny podle místa, dostupnosti a povahy světa.`,

  "spell-lists": `Jednotlivá povolání mají své seznamy dostupných kouzel. Zná-li postava kouzlo nebo si ho může připravit, ještě to samo o sobě neznamená, že má volnou pozici pro jeho seslání. Počet známých či připravených kouzel a pozic se řídí tabulkou konkrétního povolání. Kouzla 0. úrovně se označují jako **triky**.`,

  traps: `Past může být mechanická nebo magická. Při jejím nalezení a zneškodnění se často používá **ověření vlastnosti** proti stupni obtížnosti (SO). Aktivace může způsobit zranění, stav nebo jinou komplikaci. Pán jeskyně určuje, jaké indicie mohou postavy objevit ještě před spuštěním pasti.`,

  diseases: `Nemoci představují dlouhodobé následky nákazy, zranění nebo působení prostředí. Jejich nástup, příznaky, postup a léčba se liší. U některých nemocí jsou potřebné opakované záchranné hody na Odolnost. Konkrétní nemoc určuje také případnou změnu životů či jiných mechanik.`,

  madness: `Šílenství může mít **krátkodobé, dlouhodobé nebo trvalé** následky podle zdroje účinku a rozhodnutí Pána jeskyně. Zvláštní účinky mohou změnit chování, omezit jednání nebo narušit vnímání. Pro náhodné projevy pravidla obsahují tabulky. Některé magické účinky mohou vybrané projevy odstranit.`,

  objects: `Také předměty mají **obranné číslo a životy**. OČ se obvykle odvíjí od materiálu, životy od velikosti a pevnosti. Velký či výjimečně odolný objekt může mít **práh zranění**: jednotlivé poškození pod prahem se vůbec neodečte. Některé typy zranění jsou vůči předmětu neúčinné.`,

  poisons: `Jedy se mohou aplikovat na zbraň, přijímat s jídlem, vdechnout nebo působit při kontaktu. Obvykle vyžadují záchranný hod na Odolnost a při neúspěchu způsobují zranění nebo stav **otrávený**. Každý jed má vlastní cenu, obtížnost záchrany a způsob použití.`,

  "magic-items": `Kouzelné předměty se liší vzácností, vlastnostmi a případným počtem nabití. Některé vyžadují **sladění**: postava musí splnit podmínky a věnovat předmětu krátký odpočinek. Jeden tvor se běžně může sladit nejvýše se třemi předměty. Přesný účinek, spotřebu nabití a obnovu jejich počtu určují pravidla konkrétního předmětu.`,

  "sentient-magic-items": `**Inteligentní kouzelný předmět** má vlastní smysly, vlastnosti, způsob komunikace a často i cíle. Jestliže se jeho zájmy střetnou se zájmy držitele, může dojít ke konfliktu. Způsob jeho vyhodnocení a hranice vlivu předmětu jsou popsány v úplném anglickém znění.`,

  artifacts: `Artefakty jsou mimořádně vzácné kouzelné předměty s jedinečnou historií. Vedle prospěšných účinků mohou mít i nevýhody nebo zvláštní požadavky. Zničení artefaktu obvykle vyžaduje výjimečný postup určený jeho příběhem, nikoli obyčejné poškození.`,

  "monster-statistics": `Statistický blok nestvůry uvádí její **obranné číslo, životy, rychlost, vlastnosti, záchranné hody, dovednosti, odolnosti, smysly, jazyky a nebezpečnost (CR)**. Dále obsahuje zvláštní rysy, akce a případně reakce či legendární akce. Nebezpečnost napovídá, jak náročné může být střetnutí, není však zárukou výsledku boje.`,

  "nonplayer-characters": `Nehráčské postavy se ve světě řídí stejnými základními pravidly jako ostatní tvorové, ale obvykle nepotřebují úplný list hráčské postavy. Pán jeskyně jim přiřadí vhodné statistiky a popíše jejich motivace, vztahy a úlohu v příběhu.`,

  "gods-of-the-multiverse": `Přehled božstev pomáhá zařadit náboženství a přesvědčení postav do světa. Konkrétní bohové se liší mezi jednotlivými herními prostředími a Pán jeskyně je může pro vlastní svět změnit nebo nahradit.`,

  "the-planes-of-existence": `Mnohosvětí zahrnuje **Materiální sféru** a řadu dalších sfér existence. Sféry mohou mít jiné přírodní zákony, magické vlastnosti či obyvatele. Přechod mezi nimi obvykle vyžaduje speciální cestu nebo kouzlo.`,
};
