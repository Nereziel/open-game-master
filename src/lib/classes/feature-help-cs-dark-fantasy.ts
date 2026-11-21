// Full Czech player-facing rules for original dark-fantasy class features.
// Keys stay English for the engine, AI tools and saved characters.
export const FEATURES_CS_DARK_FANTASY: Readonly<Record<string, Record<string, {name:string;description:string}>>> = {
  "witch_hunter": {
    "Hunter's Brand": {
      "name": "Lovcovo znamení",
      "description": "Bonusovou akcí označíš tvora, kterého vidíš. Tvé útoky proti němu způsobují navíc 1k6 zářivého zranění, dokud nezemře nebo si neodpočineš."
    },
    "Grim Resolve": {
      "name": "Ponuré odhodlání",
      "description": "Máš výhodu k záchranným hodům proti strachu."
    },
    "Litany": {
      "name": "Litanie",
      "description": "Sesíláš kouzla ze seznamu paladina jako litanie a používáš k tomu Moudrost."
    },
    "Order": {
      "name": "Řád",
      "description": "Vybereš si lovecký řád (podpovolání)."
    },
    "Extra Attack": {
      "name": "Další útok",
      "description": "Při použití akce Útok můžeš zaútočit dvakrát."
    },
    "Scent of Corruption": {
      "name": "Pach zkaženosti",
      "description": "Akcí zjistíš, zda je tvor do 30 stop běs, nemrtvý či měňavec nebo zda je prokletý či očarovaný."
    },
    "Purging Flame": {
      "name": "Očistný plamen",
      "description": "Jednou za odpočinek způsobíš zasaženému cíli Lovcova znamení navíc 2k10 zářivého zranění; schopnost musíš ohlásit před hodem."
    },
    "Iron Will": {
      "name": "Železná vůle",
      "description": "Máš výhodu k záchranám proti okouzlení a posednutí. Spojenci do 10 stop přičítají 1k4 k záchranám proti strachu."
    },
    "Relentless Pursuit": {
      "name": "Neúnavné pronásledování",
      "description": "Tvůj označený cíl se před tebou nemůže skrýt; do jedné míle znáš směr, kterým leží."
    },
    "Twin Brand": {
      "name": "Dvojité znamení",
      "description": "Můžeš současně udržovat dvě Lovcova znamení a jejich dodatečné zranění stoupá na 1k8."
    },
    "Judgment Shot": {
      "name": "Výstřel rozsudku",
      "description": "Jednou za odpočinek se zásah útokem na dálku proti označenému cíli automaticky stane kritickým zásahem."
    },
    "Anathema Ward": {
      "name": "Ochrana proti kletbám",
      "description": "Máš odolnost vůči nekrotickému zranění a kletby sesílané proti tobě mají nevýhodu."
    },
    "The Litany Unbroken": {
      "name": "Nepřerušená litanie",
      "description": "Zranění 20 či méně ti nemůže přerušit soustředění na litanie."
    },
    "Sanctioned Execution": {
      "name": "Posvěcená poprava",
      "description": "Tvé kritické zásahy proti označeným tvorům zabrání jejich regeneraci a oživení na 24 hodin."
    },
    "No Rest for the Wicked": {
      "name": "Hříšníci neodpočívají",
      "description": "Jednou za dlouhý odpočinek získáš celý dodatečný tah ihned poté, co zabiješ svůj označený cíl."
    },
    "Final Verdict": {
      "name": "Konečný rozsudek",
      "description": "Jednou za dlouhý odpočinek po dobu 1 minuty způsobují všechny tvé útoky proti běsům, nemrtvým a prokletým tvorům maximální zranění kostkami zbraně."
    },
    "Blessed Ammunition": {
      "name": "Požehnané střelivo",
      "description": "Tvé útoky na dálku se považují za magické a provedené postříbřenou zbraní."
    },
    "Candle in the Dark": {
      "name": "Svíce v temnotě",
      "description": "Jednou za odpočinek na 10 minut vyzařuješ jasné ochranné světlo do 20 stop; nepřátelští nemrtví a běsové v něm mají nevýhodu k útokům proti tvým spojencům."
    },
    "Flashfire Litany": {
      "name": "Litanie prudkého ohně",
      "description": "Jednou za odpočinek, když tě zasáhne běs nebo nemrtvý, utrpí 3k8 zářivého zranění; úspěšný záchranný hod na Odolnost zranění půlí."
    },
    "Silver Tide": {
      "name": "Stříbrná vlna",
      "description": "Spojenci do 20 stop způsobují zbraněmi proti tvému označenému cíli navíc 1k4 zářivého zranění."
    },
    "The Flame That Judges": {
      "name": "Soudící plamen",
      "description": "Jednou za dlouhý odpočinek označíš naráz všechny nepřátele do 30 stop; každému úspěšný záchranný hod na Moudrost znamení zruší."
    }
  },
  "plague_doctor": {
    "Miasma Ward": {
      "name": "Ochrana proti miazmatu",
      "description": "Ty a spojenci do 5 stop máte odolnost vůči jedovému zranění a výhodu k záchranám proti nemocem."
    },
    "Anatomist's Eye": {
      "name": "Anatomovo oko",
      "description": "Po jednom kole pozorování tvora zjistíš jednu jeho zranitelnost nebo odolnost."
    },
    "Pharmacopoeia": {
      "name": "Lékopis",
      "description": "Sesíláš kouzla ze seznamu klerika jako léčiva a jedy pomocí Inteligence; ohniskem jsou tvé nástroje a maska."
    },
    "Guild": {
      "name": "Cech",
      "description": "Vybereš si cechovní tradici (podpovolání)."
    },
    "Lance the Wound": {
      "name": "Rozříznutí rány",
      "description": "Jednou za odpočinek způsobíš zásahem nablízko navíc 2k8 nekrotického zranění a cíl nemůže získat životy zpět do tvého příštího tahu."
    },
    "Triage": {
      "name": "Třídění raněných",
      "description": "Tvora stabilizuješ bonusovou akcí; stabilizovaný pacient se po 1 minutě probudí s 1k4 životy."
    },
    "Beaked Mask": {
      "name": "Zobáková maska",
      "description": "S nasazenou maskou jsi imunní vůči vdechovaným jedům a plynům a máš výhodu k záchranám proti strachu."
    },
    "Controlled Dosage": {
      "name": "Řízené dávkování",
      "description": "Tvé léčivé přípravky při každém seslání zároveň odstraní jednu nemoc nebo otravu."
    },
    "Death's Cartographer": {
      "name": "Kartograf smrti",
      "description": "Při prozkoumání těla přesně zjistíš příčinu, čas a okolnosti smrti včetně magického působení."
    },
    "Virulent Strain": {
      "name": "Nakažlivý kmen",
      "description": "Zranění Rozříznutí rány stoupne na 4k8; jeden tvor sousedící s cílem utrpí polovinu tohoto zranění."
    },
    "Quarantine Ring": {
      "name": "Karanténní kruh",
      "description": "Jednou za dlouhý odpočinek vytvoříš na 10 minut kruh o poloměru 20 stop. Pro nepřátele jde o obtížný terén; při vstupu utrpí 2k6 jedového zranění, úspěšná záchrana na Odolnost půlí."
    },
    "Iron Constitution": {
      "name": "Železná odolnost",
      "description": "Jsi imunní vůči jedům a nemocem."
    },
    "Miasma Mantle": {
      "name": "Plášť miazmatu",
      "description": "Dosah Ochrany proti miazmatu se zvětší na 15 stop a ochrana uděluje také odolnost vůči nekrotickému zranění."
    },
    "The Doctor's Cut": {
      "name": "Doktorův řez",
      "description": "Anatomovo oko ti na jediný pohled odhalí všechny zranitelnosti a odolnosti tvora."
    },
    "Panacea": {
      "name": "Všelék",
      "description": "Jednou za dlouhý odpočinek dotykem odstraníš z jednoho tvora všechny jedy, nemoci, kletby 5. či nižší úrovně, slepotu, hluchotu a ochromení."
    },
    "Master of the Black Ledger": {
      "name": "Mistr černé knihy",
      "description": "Jednou za dlouhý odpočinek dotykem rozhodneš o životě či smrti: tvorovi obnovíš všechny životy nebo mu způsobíš 10k10 nekrotického zranění (záchrana na Odolnost půlí)."
    },
    "Carrion Courier": {
      "name": "Mrchožroutí posel",
      "description": "Vycvičená vrána podle tvých příkazů přenáší zprávy a drobné předměty či provádí průzkum; do 100 stop vidíš jejíma očima."
    },
    "Guild Dues": {
      "name": "Cechovní práva",
      "description": "Máš výhodu při ověřeních potřebných k získání vzácných přísad, jedů a mrtvol v libovolné osadě."
    },
    "Murder of Crows": {
      "name": "Hejno vran",
      "description": "Jednou za dlouhý odpočinek hejno na 1 minutu oslepí nepřátele v okruhu 20 stop (každý tah záchrana na Odolnost)."
    },
    "Crowsight Network": {
      "name": "Síť vraních očí",
      "description": "Cechovní ptáci hlídají všechny čtvrti; jednou denně se můžeš PJ zeptat, kde byla spatřena jmenovaná osoba."
    },
    "The Flock Remembers": {
      "name": "Hejno nezapomíná",
      "description": "Jednou za dlouhý odpočinek tě hejno při poklesu na 0 životů odnese 60 stop do bezpečí a stabilizuje."
    }
  },
  "grave_knight": {
    "Deathly Pact Blade": {
      "name": "Čepel smrtelné úmluvy",
      "description": "Bonusovou akcí si odkudkoli přivoláš spoutanou zbraň do ruky; považuje se za magickou."
    },
    "Sepulchral Aura": {
      "name": "Hrobová aura",
      "description": "Nepřátelé do 5 stop způsobují zbraňovými útoky o 1 bod zranění méně (nejméně 1)."
    },
    "Oathbound Casting": {
      "name": "Přísahou vázaná magie",
      "description": "Sesíláš kouzla ze seznamu černokněžníka jako přísahy pomocí Charismatu."
    },
    "Court": {
      "name": "Dvůr",
      "description": "Vybereš si dvůr smrti (podpovolání)."
    },
    "Extra Attack": {
      "name": "Další útok",
      "description": "Při akci Útok zaútočíš dvakrát."
    },
    "Grave Grip": {
      "name": "Sevření hrobu",
      "description": "Jednou za odpočinek vyrazí přízračné ruce z krychle o hraně 15 stop; tvorové v ní musí uspět v záchraně na Sílu, jinak jsou zadržení do tvého příštího tahu."
    },
    "Knight of Dust": {
      "name": "Rytíř prachu",
      "description": "Máš odolnost vůči nekrotickému zranění a potřebuješ polovinu běžného množství jídla a spánku."
    },
    "Barrow Ward": {
      "name": "Mohylová ochrana",
      "description": "Reakcí při zásahu spojence do 10 stop snížíš jeho utržené zranění o svou opravu Charismatu + zdatnostní bonus."
    },
    "Deathless Vigor": {
      "name": "Životní síla nemrtvého",
      "description": "Jednou za dlouhý odpočinek při poklesu na 0 životů zůstaneš na 1 životě a získáš dočasné životy ve výši své úrovně."
    },
    "Reaping Blade": {
      "name": "Žací čepel",
      "description": "Tvá smluvní čepel způsobuje navíc 1k8 nekrotického zranění; zabití nepřátelé se nemohou stát nemrtvými bez tvého souhlasu."
    },
    "Sepulchral Dominion": {
      "name": "Vláda hrobové aury",
      "description": "Hrobová aura dosáhne 10 stop a rovněž půlí léčení nepřátel v jejím dosahu."
    },
    "The Tomb Provides": {
      "name": "Hrob poskytne",
      "description": "Jednou za dlouhý odpočinek obnovíš utracené úrovně pozic kouzel v součtu nejvýše do výše své opravy Charismatu."
    },
    "Wight-Iron Will": {
      "name": "Vůle z hrobového železa",
      "description": "Jsi imunní vůči strachu a okouzlení a máš výhodu proti účinkům stárnutí, vysávání a posednutí."
    },
    "Squire of Bones": {
      "name": "Kostěný panoš",
      "description": "Jednou za dlouhý odpočinek pozvedneš jednoho zabitého nepřítele jako věrného kostěného panoše na 8 hodin. Používá jeho statistiky a poslouchá tě."
    },
    "Champion of the Quiet Court": {
      "name": "Šampion tichého dvora",
      "description": "Nekrotické zranění smluvní čepele vzroste na 2k8; kritické zásahy navíc děsí cíl, pokud neuspěje v záchraně na Moudrost."
    },
    "Deathless Champion": {
      "name": "Nesmrtelný šampion",
      "description": "Jednou za dlouhý odpočinek po dobu 1 minuty nemohou tvé životy klesnout pod 1."
    },
    "Rose Thorn Oath": {
      "name": "Přísaha růžových trnů",
      "description": "Jednou za tah, když zasáhneš smluvní čepelí, obnovíš si životy ve výši opravy Charismatu."
    },
    "Funerary Grace": {
      "name": "Pohřební milost",
      "description": "Máš výhodu k ověřením Charismatu při jednání s truchlícími, nemrtvými a služebníky smrti."
    },
    "Petal Fall": {
      "name": "Pád okvětních lístků",
      "description": "Jednou za odpočinek se bonusovou akcí teleportuješ až 30 stop ve víru mrtvých okvětních lístků."
    },
    "Garden of Grief": {
      "name": "Zahrada žalu",
      "description": "Jednou za dlouhý odpočinek vytvoříš na 1 minutu zahradu černých růží o poloměru 20 stop; spojenci si v ní každý tah obnovují 1k6 životů a nepřátelé jsou zpomaleni."
    },
    "The Last Rose": {
      "name": "Poslední růže",
      "description": "Jednou za dlouhý odpočinek při smrti spojence do 30 stop zůstane na 1 životě; tvůj příští úspěšný útok je automaticky kritický."
    }
  },
  "penitent": {
    "Mortified Flesh": {
      "name": "Umrtvené tělo",
      "description": "Při útoku můžeš obětovat nejvýše tolik životů, kolik činí tvůj zdatnostní bonus, a o stejnou hodnotu zvýšit zranění."
    },
    "Zeal Through Pain": {
      "name": "Horlivost skrze bolest",
      "description": "Při méně než polovině životů máš výhodu k ověřením Síly a +1 k hodům na útok."
    },
    "Unarmored Devotion": {
      "name": "Oddanost bez zbroje",
      "description": "Bez zbroje je tvé OČ rovno 10 + oprava Síly + oprava Moudrosti."
    },
    "Discipline": {
      "name": "Disciplína",
      "description": "Vybereš si kajícnickou disciplínu (podpovolání)."
    },
    "Extra Attack": {
      "name": "Další útok",
      "description": "Při akci Útok útočíš dvakrát."
    },
    "Flagellant's Trance": {
      "name": "Bičovníkovo vytržení",
      "description": "Máš výhodu k záchranným hodům proti bolesti, strachu a účinkům vyčerpání."
    },
    "Blood Offering": {
      "name": "Krvavá oběť",
      "description": "Jednou za odpočinek obětuješ 5 životů, takže jeden útok v tomto tahu automaticky zasáhne, pokud by jeho hod minul nejvýše o 3."
    },
    "Scarred Hide": {
      "name": "Zjizvená kůže",
      "description": "Máš odolnost vůči sečnému zranění z nemagických útoků."
    },
    "Martyr's Endurance": {
      "name": "Mučedníkova výdrž",
      "description": "Jednou za dlouhý odpočinek při poklesu na 0 životů zůstaneš na 1 životě."
    },
    "Greater Mortification": {
      "name": "Vyšší umrtvování",
      "description": "Umrtveným tělem můžeš obětovat životy do dvojnásobku svého zdatnostního bonusu; při méně než polovině životů se bonusové zranění zdvojnásobí."
    },
    "Penance Shared": {
      "name": "Sdílené pokání",
      "description": "Reakcí na zásah spojence do 5 stop utrpíš zranění místo něj; pro tebe se zranění půlí."
    },
    "Numb to the Lash": {
      "name": "Necitlivost k biči",
      "description": "Každé zranění zbraní, které utrpíš, snížíš o opravu Moudrosti (nejméně však utrpíš 1 bod)."
    },
    "Ecstatic Fury": {
      "name": "Extatická zuřivost",
      "description": "Při méně než čtvrtině životů způsobují tvé útoky navíc 2k6 zranění a nemůžeš být vystrašený ani okouzlený."
    },
    "Sainted Scars": {
      "name": "Posvěcené jizvy",
      "description": "Mučedníkova výdrž se obnovuje při krátkém odpočinku a každé použití ti dá dočasné životy ve výši tvé úrovně."
    },
    "The Body Is a Prayer": {
      "name": "Tělo je modlitba",
      "description": "Jsi-li při vědomí a pod polovinou životů, obnovíš si na začátku každého svého tahu životy ve výši opravy Moudrosti."
    },
    "Apotheosis of Suffering": {
      "name": "Zbožštění utrpení",
      "description": "Jednou za dlouhý odpočinek snížíš své životy na 1 a rozdělíš životy takto obětované jako zářivé zranění mezi libovolné tvory do 30 stop; záchrana na Obratnost zranění půlí."
    },
    "Ashen Hymn": {
      "name": "Popelavý hymnus",
      "description": "Bonusovou akcí začneš na 1 minutu zpívat; nepřátelé do 10 stop mají v každém tahu nevýhodu při své první záchraně proti strachu."
    },
    "Cinder Palms": {
      "name": "Žhnoucí dlaně",
      "description": "Tvé neozbrojené údery a cepy způsobují navíc 1k4 ohnivého zranění."
    },
    "Voice Like Embers": {
      "name": "Hlas jako uhlíky",
      "description": "Jednou za odpočinek výkřikem zasáhneš kužel 15 stop. Tvorové musí uspět v záchraně na Odolnost, jinak utrpí 3k6 ohnivého zranění a na 1 minutu ohluchnou."
    },
    "Robes of Soot": {
      "name": "Roucho sazí",
      "description": "Máš odolnost vůči ohnivému zranění; tvor, který tě zasáhne nablízko, utrpí ohnivé zranění ve výši tvé opravy Moudrosti."
    },
    "Immolate the Sin": {
      "name": "Spálení hříchu",
      "description": "Jednou za dlouhý odpočinek se na 1 minutu zahalíš šedým plamenem; tvé útoky způsobují navíc 2k8 ohnivého zranění a jsi imunní vůči ohni."
    }
  },
  "dirgesinger": {
    "Requiem Inspiration": {
      "name": "Inspirace rekviem",
      "description": "Bonusovou akcí dáš spojenci do 60 stop kostku k6, kterou přičte k jednomu útoku, ověření nebo záchraně; použiješ tolikrát za dlouhý odpočinek, kolik činí oprava Charismatu."
    },
    "Dirge of Sorrow": {
      "name": "Žalozpěv",
      "description": "Tichým zpěvem způsobíš, že jeden nepřítel do 30 stop odečte 1k4 od příštího hodu na útok; úspěšná záchrana na Moudrost účinek zruší."
    },
    "Mourning Song": {
      "name": "Píseň smutku",
      "description": "Sesíláš kouzla ze seznamu barda jako žalozpěvy pomocí Charismatu; tvůj hlas je tvůj nástroj."
    },
    "College": {
      "name": "Kolej",
      "description": "Vybereš si kolej truchlení (podpovolání)."
    },
    "Requiem d8": {
      "name": "Rekviem k8",
      "description": "Kostka Inspirace rekviem se mění na k8 a všechna použití obnovíš po krátkém odpočinku."
    },
    "Threnody": {
      "name": "Trenodie",
      "description": "Jednou za odpočinek musí všichni nepřátelé do 30 stop, kteří tě slyší, uspět v záchraně na Moudrost, jinak svým příštím útokem způsobí poloviční zranění."
    },
    "Songs of the Barrow": {
      "name": "Písně mohyly",
      "description": "Máš výhodu k záchranám proti strachu a nekrotickým účinkům; vycítíš nemrtvé do 60 stop."
    },
    "Lament of the Lost": {
      "name": "Nářek ztracených",
      "description": "Tvé léčivé žalozpěvy přidávají k obnoveným životům ještě jednou opravu Charismatu."
    },
    "Requiem d10": {
      "name": "Rekviem k10",
      "description": "Kostka Inspirace rekviem se mění na k10."
    },
    "The Grave Chorus": {
      "name": "Hrobový sbor",
      "description": "Jednou za dlouhý odpočinek tě na 1 minutu doprovázejí přízračné hlasy a tvé žalozpěvy ovlivní o jeden cíl více."
    },
    "Dirge of Ruin": {
      "name": "Žalozpěv zkázy",
      "description": "Žalozpěv nyní ovlivní až tři nepřátele; postih se vztahuje na útoky i záchranné hody."
    },
    "Funeral March": {
      "name": "Pohřební pochod",
      "description": "Dokud zpíváš, ty a spojenci do 30 stop ignorujete obtížný terén a nemůžete být zpomaleni."
    },
    "Requiem d12": {
      "name": "Rekviem k12",
      "description": "Kostka Inspirace rekviem se mění na k12."
    },
    "Song That Ends": {
      "name": "Píseň konce",
      "description": "Jednou za dlouhý odpočinek zazpíváš smrtící tón; jeden tvor s méně než 50 životy, který tě slyší, musí uspět v záchraně na Odolnost, jinak klesne na 0 životů."
    },
    "Voice of the Veil": {
      "name": "Hlas závoje",
      "description": "Tvé žalozpěvy působí i na tvory, kteří neslyší; rezonují totiž v kostech, a hluchota před nimi nechrání."
    },
    "The Final Movement": {
      "name": "Závěrečné dějství",
      "description": "Když házíš na iniciativu bez zbývajících použití Inspirace rekviem, obnovíš si tři; padne-li na inspirační kostce maximum, přihodíš další kostku."
    },
    "Last Rites": {
      "name": "Poslední pomazání",
      "description": "Umírající tvor, nad kterým zpíváš, se automaticky stabilizuje a nemůže být pozvednut jako nemrtvý."
    },
    "Grief Made Strength": {
      "name": "Síla ze žalu",
      "description": "Když spojenec do 30 stop klesne na 0 životů, tvůj příští žalozpěv v této minutě nejvýše 2. úrovně nestojí pozici kouzla."
    },
    "Elegy of Echoes": {
      "name": "Elegie ozvěn",
      "description": "Jednou za odpočinek zopakuješ poslední žalozpěv seslaný v tomto tahu zdarma proti novému cíli, pokud je nejvýše 3. úrovně."
    },
    "Pallbearer's Procession": {
      "name": "Průvod nosičů rakví",
      "description": "Dokud zpíváš, spojenci do 30 stop mají odolnost vůči nekrotickému zranění."
    },
    "The Rite Completed": {
      "name": "Dokončený obřad",
      "description": "Jednou za dlouhý odpočinek můžeš zpěvem vrátit spojence zemřelého před nejvýše minutou na 1 život, bez materiálních složek."
    }
  },
  "vermin_lord": {
    "Swarm Sense": {
      "name": "Smysly hejna",
      "description": "Po minutě průzkumu krysami zjistíš půdorys, obyvatele a nebezpečí budovy nebo části kanalizace do 100 stop."
    },
    "Gutter Fighting": {
      "name": "Boj ve stoce",
      "description": "Jednou za tah způsobíš navíc 1k6 zranění tvorovi, který v tomto boji ještě nejednal nebo je překvapený."
    },
    "Underway": {
      "name": "Podzemní cesty",
      "description": "Znáš kanalizace, sklepy a střechy; v osadě se dokážeš během 10 minut dostat na libovolné místo nepozorovaně."
    },
    "Crown": {
      "name": "Koruna",
      "description": "Vybereš si korunu stok (podpovolání)."
    },
    "Rat Tide": {
      "name": "Krysí příliv",
      "description": "Jednou za odpočinek zaplaví hejno krychli 15 stop; oblast je obtížný terén a tvorové v ní musí uspět v záchraně na Obratnost, jinak utrpí 2k6 bodného zranění a mají nevýhodu k příštímu útoku."
    },
    "Plaguebearer's Immunity": {
      "name": "Morová imunita",
      "description": "Jsi imunní vůči nemocem a máš odolnost vůči jedovému zranění."
    },
    "Nimble Escape": {
      "name": "Hbitý únik",
      "description": "Bonusovou akcí můžeš provést Úprk, Odpoutání nebo Schování."
    },
    "Ten Thousand Eyes": {
      "name": "Deset tisíc očí",
      "description": "Smysly hejna pokrývají celou čtvrť; jednou za krátký odpočinek se PJ můžeš zeptat, co krysy spatřily."
    },
    "Gutter King's Word": {
      "name": "Slovo krále stok",
      "description": "Žebráci, uličníci a krysí lidé tě uznávají jako krále; jednou denně od nich můžeš získat laskavost v jejich silách."
    },
    "Greater Gutter Fighting": {
      "name": "Lepší boj ve stoce",
      "description": "Boj ve stoce způsobuje navíc 2k6 zranění a platí i proti tvorům sousedícím s tvým hejnem."
    },
    "Vanish Below": {
      "name": "Zmizení pod zemí",
      "description": "Jednou za odpočinek se při zaměření útokem reakcí protáhneš mříží, škvírou či stínem; útok mine a přesuneš se 15 stop."
    },
    "Chittering Court": {
      "name": "Švitořivý dvůr",
      "description": "Tvé krysy po celém městě do jedné hodiny dopraví zprávy, drobné předměty i klíče."
    },
    "Rat Tide (2 uses)": {
      "name": "Krysí příliv (2 použití)",
      "description": "Krysí příliv můžeš použít dvakrát za odpočinek a jeho krychle se zvětší na 20 stop."
    },
    "The Walls Have Teeth": {
      "name": "Zdi mají zuby",
      "description": "Dokud je tvé hejno aktivní, nepřátelé do 10 stop od něj nemohou používat reakce."
    },
    "King Below the Streets": {
      "name": "Král pod ulicemi",
      "description": "Jednou za dlouhý odpočinek přivoláš smečku čtyř obřích krys, které ti slouží 10 minut a mají statistiky obřích krys."
    },
    "The City Is Mine": {
      "name": "Město je mé",
      "description": "V libovolné osadě tě nelze stopovat, vždy víš, kdo dnes vstoupil či odešel, a Krysí příliv se ti obnovuje při jakémkoli odpočinku."
    },
    "Favored of the Swarm": {
      "name": "Oblíbenec hejna",
      "description": "Po boku ti bojuje obří potkaní společník (OČ 13, životy 3 × úroveň, kousnutí 1k6 + Obratnost), který poslouchá tvé příkazy."
    },
    "Tunnel Rat": {
      "name": "Tunelová krysa",
      "description": "Poloviční rychlostí se protáhneš každou mezerou, kterou by prošla krysa."
    },
    "Pack Hunting": {
      "name": "Lov ve smečce",
      "description": "Ty i tvůj společník máte výhodu k útokům proti tvorovi, s nímž druhý z vás sousedí."
    },
    "Grey Tide Rising": {
      "name": "Povstání šedého přílivu",
      "description": "Tvůj obří potkan zesílí: životy 5 × úroveň, kousnutí 2k6 + Obratnost; při kousnutí musí cíl uspět v záchraně na Odolnost, jinak má 1 minutu nevýhodu k ověřením Síly."
    },
    "The Crown Descends": {
      "name": "Sestoupení koruny",
      "description": "Jednou za dlouhý odpočinek po dobu 1 minuty obklopí každého nepřítele do 30 stop krysy; jejich rychlost se půlí, nemohou používat reakce a na začátku každého tahu utrpí 1k6 bodného zranění."
    }
  }
};
