// Full Czech player-facing rules for original mystery class features.
// English keys are retained for the engine and saved sheets.
export const FEATURES_CS_MYSTERY: Readonly<Record<string,Record<string,{name:string;description:string}>>> = {
  "detective": {
    "Keen Deduction": {
      "name": "Bystrý úsudek",
      "description": "Jednou za krátký odpočinek po prohlédnutí místa, osoby či předmětu položíš PJ jednu konkrétní otázku a dostaneš pravdivou užitečnou stopu."
    },
    "Case Notes": {
      "name": "Poznámky k případu",
      "description": "Doslova si vybavíš libovolnou stopu, jméno, datum nebo rozhovor z aktuálního případu."
    },
    "Expertise": {
      "name": "Odbornost",
      "description": "U dvou dovedností, v nichž jsi zdatný, zdvojnásobíš svůj zdatnostní bonus."
    },
    "Method": {
      "name": "Metoda",
      "description": "Vybereš si vyšetřovací metodu (podpovolání)."
    },
    "Reading People": {
      "name": "Čtení lidí",
      "description": "Po minutě rozhovoru poznáš, zda ti tvor během něj lhal."
    },
    "Connect the Threads": {
      "name": "Propojení stop",
      "description": "Jednou za dlouhý odpočinek ti PJ řekne, jak spolu souvisejí dvě stopy, které máš, nebo že nesouvisejí."
    },
    "Practiced Composure": {
      "name": "Cvičený klid",
      "description": "Máš výhodu k záchranám proti strachu a okouzlení; podvodníci tě těžko oklamou."
    },
    "Anticipate Violence": {
      "name": "Předvídání násilí",
      "description": "Dokud jsi při vědomí, nemůžeš být překvapen; máš +2 k iniciativě."
    },
    "Expertise (2 more skills)": {
      "name": "Odbornost (další dvě dovednosti)",
      "description": "Zdvojnásobíš zdatnostní bonus u dalších dvou dovedností, v nichž jsi zdatný."
    },
    "Perfect Recall": {
      "name": "Dokonalá paměť",
      "description": "Poznámky k případu se vztahují na všechny případy a vše, co jsi kdy četl."
    },
    "Pressure Point": {
      "name": "Citlivý bod",
      "description": "Jednou za odpočinek musí vyslýchaný na otázku odpovědět pravdivě, nebo viditelně odmítnout; úspěšná záchrana na Moudrost dovolí odmítnout nenápadně."
    },
    "Web of Informants": {
      "name": "Síť informátorů",
      "description": "V libovolné osadě ti hodina a několik mincí zajistí místní informace o osobě, místě či události."
    },
    "Deductive Counter": {
      "name": "Deduktivní protiakce",
      "description": "Reakcí na útok uložíš útočníkovi nevýhodu; za dlouhý odpočinek tolikrát, kolik činí oprava Inteligence."
    },
    "The Scene Speaks": {
      "name": "Místo činu promlouvá",
      "description": "Bystrý úsudek má tři použití za krátký odpočinek."
    },
    "Mind Palace": {
      "name": "Palác mysli",
      "description": "Jednou za dlouhý odpočinek dokonale rekonstruuješ místo, které jsi dříve navštívil; PJ zodpoví tři otázky o této scéně."
    },
    "Elementary": {
      "name": "Elementární",
      "description": "Jednou za dlouhý odpočinek vyslovíš teorii o pachateli, mechanismu nebo motivu a PJ potvrdí její správné části."
    },
    "Cold Read": {
      "name": "První odhad",
      "description": "Při setkání s tvorem zjistíš jednu věc podle volby: povolání, nedávný pobyt nebo emoční stav."
    },
    "Irregulars": {
      "name": "Pouliční pomocníci",
      "description": "Kontakty v kterémkoli městě pro tebe něco přinesou, pozorují nebo sledují osobu; rozsah určí PJ."
    },
    "Sharpened Logic": {
      "name": "Vybroušená logika",
      "description": "K ověřením Inteligence a Moudrosti, v nichž nejsi zdatný, přičítáš polovinu zdatnostního bonusu."
    },
    "The Game Afoot": {
      "name": "Hra začíná",
      "description": "Jednou za odpočinek získáš ty a spojenci do 30 stop výhodu k příštímu ověření při pronásledování podezřelého."
    },
    "Nemesis Study": {
      "name": "Studium úhlavního nepřítele",
      "description": "Vybereš si jmenovaného protivníka a do konce případu máš výhodu ke všem ověřením a záchranám proti němu."
    }
  },
  "alienist": {
    "Read the Mind's Wound": {
      "name": "Čtení ran mysli",
      "description": "Zdvojnásobíš zdatnostní bonus k Vhledu; jednou za odpočinek zjistíš, zda tvor lže, bojí se nebo něco tají."
    },
    "Talking Cure": {
      "name": "Léčba rozhovorem",
      "description": "Během krátkého odpočinku si jeden tvor, kterému radíš, obnoví životy za jednu kostku životů navíc a ukončí účinek strachu či okouzlení."
    },
    "Clinical Practice": {
      "name": "Klinická praxe",
      "description": "Sesíláš kouzla ze seznamu kouzelníka jako psychologické léčebné postupy pomocí Inteligence."
    },
    "School of Thought": {
      "name": "Myšlenková škola",
      "description": "Vybereš si psychologickou školu (podpovolání)."
    },
    "Trauma Map": {
      "name": "Mapa traumatu",
      "description": "Po 10 minutách s pacientem ti PJ pravdivě sdělí jeho nejhlubší současný strach či posedlost."
    },
    "Steadying Presence": {
      "name": "Uklidňující přítomnost",
      "description": "Spojenci do 10 stop přičítají 1k4 k záchranám proti strachu a šílenství."
    },
    "Hypnotic Induction": {
      "name": "Hypnotické uvedení",
      "description": "Jednou za dlouhý odpočinek tvor v hypnóze odpoví pravdivě na tři otázky; musí souhlasit nebo být zadržen. Neochotný může odolat záchranou na Moudrost."
    },
    "Professional Detachment": {
      "name": "Profesionální odstup",
      "description": "Máš výhodu k záchranám proti strachu, okouzlení a šílenství."
    },
    "Break the Delusion": {
      "name": "Prolomení klamu",
      "description": "Jednou za odpočinek ukončíš u tvora do 30 stop jeden účinek okouzlení, strachu či iluze."
    },
    "Case Study": {
      "name": "Případová studie",
      "description": "Zvol tvora, kterého jsi léčil či studoval; trvale proti němu získáš výhodu k Vhledu a Přesvědčování."
    },
    "Depth Analysis": {
      "name": "Hloubková analýza",
      "description": "Léčba rozhovorem pomůže dvěma tvorům za odpočinek a také odstraní jeden stupeň vyčerpání."
    },
    "The Unconscious Speaks": {
      "name": "Nevědomí promlouvá",
      "description": "Jednou za dlouhý odpočinek čteš sny spícího či bezvědomého tvora a získáš tři pravdivé dojmy."
    },
    "Iron Composure": {
      "name": "Železný klid",
      "description": "Nemůžeš být vystrašený a bez tvého svolení ti nelze číst myšlenky."
    },
    "Group Therapy": {
      "name": "Skupinová terapie",
      "description": "Dosah Uklidňující přítomnosti vzroste na 30 stop a spojenci v ní jsou imunní vůči účinkům šílenství."
    },
    "Radical Breakthrough": {
      "name": "Radikální průlom",
      "description": "Jednou za dlouhý odpočinek vyléčíš tvora z dlouhodobého šílenství, fobie nebo nutkání, i magického původu."
    },
    "Master of the Couch": {
      "name": "Mistr pohovky",
      "description": "Hypnotické uvedení trvá jen 1 minutu a lze je během rozhovoru použít i na nepřátelského tvora."
    },
    "The Examined Mind": {
      "name": "Prozkoumaná mysl",
      "description": "Jednou za dlouhý odpočinek sešleš jeden léčebný postup nejvýše 5. úrovně bez pozice; tvor, jehož Mapu traumatu znáš, mu nemůže odolat."
    },
    "Dream Logic": {
      "name": "Logika snu",
      "description": "Jednou za odpočinek vyslovením pochybnosti uložíš tvorovi nevýhodu k útoku či ověření; úspěšná záchrana na Moudrost účinek zruší."
    },
    "Symbol Reading": {
      "name": "Čtení symbolů",
      "description": "Máš výhodu k výkladu snů, umění, šifer a obřadní symboliky."
    },
    "Projection": {
      "name": "Projekce",
      "description": "Jednou za dlouhý odpočinek postavíš tvora před iluzorní obraz jeho viny; je tebou vystrašen 1 minutu, pokud neuspěje v záchraně na Moudrost."
    },
    "Shared Subconscious": {
      "name": "Sdílené podvědomí",
      "description": "Jednou za dlouhý odpočinek na 10 minut propojíš mysli družiny; můžete tiše komunikovat a sdílet výsledky Vhledu."
    },
    "Archetype Made Flesh": {
      "name": "Zhmotněný archetyp",
      "description": "Jednou za dlouhý odpočinek se záchranný hod jednoho cíle tvé léčby považuje za přirozenou 1."
    }
  },
  "grifter": {
    "Silver Tongue": {
      "name": "Stříbrný jazyk",
      "description": "Jednou za krátký odpočinek přehodíš neúspěšné Klamání nebo Přesvědčování."
    },
    "A New Face": {
      "name": "Nová tvář",
      "description": "Za 10 minut s drobnými rekvizitami vytvoříš přesvědčivou totožnost a máš výhodu ke Klamání při jejím udržování."
    },
    "Expertise": {
      "name": "Odbornost",
      "description": "U dvou zdatných dovedností zdvojnásobíš zdatnostní bonus."
    },
    "The Angle": {
      "name": "Trik",
      "description": "Vybereš si podvodnickou specializaci (podpovolání)."
    },
    "Uncanny Dodge": {
      "name": "Neuvěřitelný úhyb",
      "description": "Reakcí snížíš zranění jednoho útoku, který tě zasáhl, na polovinu."
    },
    "Cold Read the Mark": {
      "name": "Odhad oběti",
      "description": "Po minutě rozhovoru zjistíš, po čem tvor nejvíce touží nebo čeho se nejvíce bojí."
    },
    "Slippery": {
      "name": "Kluzký únik",
      "description": "Odpoutání nebo Schování můžeš provést bonusovou akcí; máš výhodu při úniku ze zápasu."
    },
    "The Long Game": {
      "name": "Dlouhá hra",
      "description": "Udržuješ až tři úplné falešné identity s doklady a pověstí, které PJ uznává jako zavedené."
    },
    "Expertise (2 more skills)": {
      "name": "Odbornost (další dvě dovednosti)",
      "description": "Zdvojnásobíš zdatnostní bonus u dalších dvou zdatných dovedností."
    },
    "Twist the Knife": {
      "name": "Zatočení nožem",
      "description": "Jednou za tah způsobíš navíc 2k6 zranění tvorovi, kterého jsi okouzlil či oklamal nebo který tě nepovažuje za hrozbu."
    },
    "Contingency Exit": {
      "name": "Připravená úniková cesta",
      "description": "Jednou za dlouhý odpočinek popíšeš předem připravený únik, například podplaceného strážného nebo otevřené okno; PJ jej v přiměřeném rozsahu umožní."
    },
    "Mirror Talk": {
      "name": "Zrcadlové řeči",
      "description": "Máš výhodu k záchranám proti okouzlení a magii čtení myšlenek nebo vynucení pravdy."
    },
    "Silver Tongue (3 uses)": {
      "name": "Stříbrný jazyk (3 použití)",
      "description": "Stříbrný jazyk má tři použití za krátký odpočinek."
    },
    "Everybody's Friend": {
      "name": "Přítel všech",
      "description": "Jednou za dlouhý odpočinek tě slyšící tvor považuje 10 minut za důvěryhodného přítele; úspěšná záchrana na Moudrost účinek zruší."
    },
    "Vanish": {
      "name": "Zmizení",
      "description": "Třikrát za dlouhý odpočinek se můžeš bonusovou akcí Schovat i na očích."
    },
    "The Perfect Con": {
      "name": "Dokonalý podvod",
      "description": "Jednou za dlouhý odpočinek odhalíš, že celý tento herní sezení připravuješ podvod; PJ zpětně v rozumných mezích uzná jeho přípravu."
    },
    "Seed the Story": {
      "name": "Zasetý příběh",
      "description": "Rozšíříš v osadě fámu; do dne ji uslyší většina místních a polovina jí uvěří."
    },
    "Patient Hands": {
      "name": "Trpělivé ruce",
      "description": "Máš výhodu k Obratnosti rukou a pozorovatelé mají nevýhodu při pokusu tě přistihnout."
    },
    "Sunk Cost": {
      "name": "Utopené náklady",
      "description": "Tvor, který uvěřil jedné tvé lži, má nadále nevýhodu k Vhledu proti tobě."
    },
    "The Shill Network": {
      "name": "Síť nastrčených pomocníků",
      "description": "V kterémkoli městě najmeš a koordinuješ komplice; jedna laskavost na zakázku je zdarma."
    },
    "House of Cards": {
      "name": "Domeček z karet",
      "description": "Jednou za dlouhý odpočinek odhalíš podvod v pravý okamžik; každý nepřítel, který mu uvěřil, je omráčen do příštího tahu, pokud neuspěje v záchraně na Moudrost."
    }
  },
  "enforcer": {
    "Intimidating Presence": {
      "name": "Zastrašující přítomnost",
      "description": "Zdvojnásobíš zdatnostní bonus k Zastrašování a tvorové tvé či nižší úrovně se snaží tě neprovokovat."
    },
    "Bodyguard": {
      "name": "Osobní strážce",
      "description": "Když sousední spojenec utrpí zásah, reakcí jej přijmeš místo něj."
    },
    "Heavy Hands": {
      "name": "Těžké pěsti",
      "description": "Neozbrojené údery způsobují 1k6 + oprava Síly drtivého zranění a bonusovou akcí můžeš tvora chytit do zápasu."
    },
    "The Outfit": {
      "name": "Organizace",
      "description": "Vybereš si vymahačské zázemí (podpovolání)."
    },
    "Extra Attack": {
      "name": "Další útok",
      "description": "Při použití akce Útok zaútočíš dvakrát."
    },
    "Meat Shield": {
      "name": "Živý štít",
      "description": "Osobního strážce použiješ i pro spojence do 10 stop; k zachycení zásahu se přesuneš až o 10 stop."
    },
    "Hard to Kill": {
      "name": "Těžko zabitelný",
      "description": "Jednou za dlouhý odpočinek při poklesu na 0 životů zůstaneš na 1."
    },
    "Menace": {
      "name": "Hrozba",
      "description": "Jednou za odpočinek přinutíš nepřátele do 30 stop uspět v záchraně na Moudrost, jinak se tě 1 minutu bojí."
    },
    "Iron Jaw": {
      "name": "Železná čelist",
      "description": "Máš odolnost vůči drtivému zranění z nemagických útoků."
    },
    "Extra Attack (2)": {
      "name": "Další útok (2)",
      "description": "Při akci Útok můžeš zaútočit třikrát."
    },
    "Immovable": {
      "name": "Nehnutelný",
      "description": "Máš výhodu proti přesunutí, sražení a sevření do zápasu; protivníci mají nevýhodu při úniku z tvého zápasu."
    },
    "Message Sent": {
      "name": "Jasný vzkaz",
      "description": "Když srazíš tvora na 0 životů, jeho spojenci musí uspět v záchraně na Moudrost, jinak se tě bojí do tvého příštího tahu."
    },
    "Guardian's Instinct": {
      "name": "Ochráncův instinkt",
      "description": "Dokud jsi při vědomí, mají spojenci do 10 stop +1 k OČ."
    },
    "Unbreakable": {
      "name": "Nezlomný",
      "description": "Schopnost Těžko zabitelný se obnovuje po krátkém odpočinku."
    },
    "Wall of Muscle": {
      "name": "Zeď svalů",
      "description": "Nepřátelé považují všechny prostory do 10 stop kolem tebe za obtížný terén."
    },
    "Last Man Standing": {
      "name": "Poslední stojící",
      "description": "Při méně než polovině životů máš odolnost vůči veškerému zranění a tvé útoky způsobují o 10 zranění více."
    },
    "Rally the Line": {
      "name": "Semknutí řady",
      "description": "Jednou za odpočinek dáš spojencům do 30 stop dočasné životy ve výši své úrovně + opravy Odolnosti."
    },
    "Working Class Hero": {
      "name": "Hrdina pracujících",
      "description": "Máš výhodu k Přesvědčování dělníků, přístavních nosičů a chudých; jsou ochotni tě skrýt či ti pomoci."
    },
    "Picket Stance": {
      "name": "Stávková pozice",
      "description": "Nepřátelé opouštějící tvůj dosah vyvolají příležitostný útok i při Odpoutání."
    },
    "Solidarity": {
      "name": "Solidarita",
      "description": "Když použiješ Osobního strážce, útočník utrpí zranění ve výši opravy Síly + zdatnostního bonusu."
    },
    "General Strike": {
      "name": "Generální stávka",
      "description": "Jednou za dlouhý odpočinek po 1 minutu získáš ty i spojenci do 30 stop možnost reakčního útoku, kdykoli je kdokoli z vás zasažen."
    }
  },
  "muckraker": {
    "Press Credentials": {
      "name": "Novinářský průkaz",
      "description": "Věrohodné doklady a vystupování ti zajistí přístup k místům činu, úřadům a společenským akcím nepřístupným veřejnosti; rozhodne PJ."
    },
    "Headline Instinct": {
      "name": "Instinkt titulku",
      "description": "Jednou za odpočinek se PJ zeptáš, kdo na aktuální scéně ví něco o tvém příběhu, a dostaneš pravdivé vodítko."
    },
    "Shorthand": {
      "name": "Těsnopis",
      "description": "Rozhovory zapisuješ doslova, i když vypadáš, že si jen čmáráš; zdvojnásobíš zdatnostní bonus k Pátrání."
    },
    "The Beat": {
      "name": "Rubrika",
      "description": "Vybereš si novinářskou rubriku (podpovolání)."
    },
    "Doorstep Ambush": {
      "name": "Nečekaná otázka",
      "description": "Tvor, kterého otázkou překvapíš, vysloví před rozmyšlením jednu pravdivou větu; úspěšná záchrana na Moudrost tomu zabrání."
    },
    "Morgue File": {
      "name": "Archiv redakce",
      "description": "Archivy a dávní známí během dne odhalí písemné stopy k libovolné osobě či společnosti."
    },
    "Duck the Consequences": {
      "name": "Vyhnutí se následkům",
      "description": "Reakcí uložíš nevýhodu jednomu útoku proti sobě; za dlouhý odpočinek tolikrát, kolik činí oprava Charismatu."
    },
    "Byline Armor": {
      "name": "Ochrana podpisem",
      "description": "Veřejně známí lidé váhají; tvorové, kteří vědí, že jsi novinář, mají nevýhodu k Zastrašování proti tobě a před násilím se dvakrát rozmýšlejí."
    },
    "Follow the Money": {
      "name": "Po stopě peněz",
      "description": "S poskytnutým jménem či účetní knihou ti PJ sdělí, kam peníze skutečně putovaly."
    },
    "Front Page Pressure": {
      "name": "Tlak titulní stránky",
      "description": "Jednou za dlouhý odpočinek zveřejníš nebo pohrozíš zveřejněním zprávy; jmenovaná organizace musí během dne veřejně reagovat a otevře družině příležitost."
    },
    "Source Protection": {
      "name": "Ochrana zdrojů",
      "description": "Magie ani výslech z tebe bez souhlasu nevytáhnou jména zdrojů ani tvé poznámky."
    },
    "Two Steps Ahead": {
      "name": "Dva kroky napřed",
      "description": "Máš výhodu k iniciativě a tvorové, které jsi vyšetřoval, tě nemohou překvapit."
    },
    "The Rolodex": {
      "name": "Seznam kontaktů",
      "description": "Instinkt titulku má tři použití za odpočinek a platí na libovolné téma, nejen na tvůj nynější příběh."
    },
    "Scandal Sense": {
      "name": "Instinkt pro skandál",
      "description": "Při setkání s tvorem zjistíš, zda něco skrývá, co by jej mohlo zničit (ano, nebo ne)."
    },
    "Voice of the People": {
      "name": "Hlas lidu",
      "description": "Jednou za dlouhý odpočinek přiměješ dav, který tě slyší, jednat podle tvých slov: zatarasit ulici, vypískat padoucha či ukrýt uprchlíka."
    },
    "The Story of the Century": {
      "name": "Příběh století",
      "description": "Jednou za dlouhý odpočinek zveřejníš pravdu; pověst jmenovaného tvora se zhroutí a jeho spojenci musí uspět v záchraně na Moudrost, jinak jej opustí."
    },
    "Stringers Everywhere": {
      "name": "Dopisovatelé všude",
      "description": "V libovolné osadě ti místní sběrači tipů hlásí pozoruhodné příjezdy, úmrtí a obchody za uplynulý týden."
    },
    "Print Deadline": {
      "name": "Tiskařská uzávěrka",
      "description": "Máš výhodu k ověřením prováděným pod časovým tlakem."
    },
    "Wire Service": {
      "name": "Telegrafní služba",
      "description": "Kódované zprávy mezi městy posíláš a přijímáš v řádu hodin, ne dnů."
    },
    "Syndicated": {
      "name": "Syndikace",
      "description": "Tlak titulní stránky dosáhne do všech měst napojených na síť; má dvě použití za dlouhý odpočinek."
    },
    "The Editor's Desk": {
      "name": "Stůl šéfredaktora",
      "description": "Jednou za dlouhý odpočinek povoláš celou síť a získáš tři pravdivé odpovědi o libovolném probíhajícím spiknutí."
    }
  },
  "spirit_medium": {
    "Speak with the Departed": {
      "name": "Rozhovor se zesnulými",
      "description": "Jednou za odpočinek rozmlouváš s duchem spojeným s místem, předmětem nebo tělem; stručně a pravdivě podle svého vědění odpoví na tři otázky."
    },
    "Spirit Ward": {
      "name": "Ochrana ducha",
      "description": "Bonusovou akcí ti ochranný duch dá tobě či spojenci +2 k OČ do tvého příštího tahu; za dlouhý odpočinek tolikrát, kolik činí oprava Moudrosti."
    },
    "Open Channel": {
      "name": "Otevřený kanál",
      "description": "Sesíláš kouzla ze seznamu klerika jako účinky seancí pomocí Moudrosti; duchové slouží jako prostředníci."
    },
    "Grave Whispers": {
      "name": "Šepoty hrobu",
      "description": "Při vstupu do místnosti vycítíš každé úmrtí, které se v ní stalo, i přibližný čas a míru násilí."
    },
    "Borrowed Voice": {
      "name": "Vypůjčený hlas",
      "description": "Jednou za dlouhý odpočinek skrze tebe 10 minut promlouvá duch a může hovořit s družinou."
    },
    "Cold Spots": {
      "name": "Chladná místa",
      "description": "Automaticky odhalíš duchy, posednutí a strašidelné předměty do 30 stop."
    },
    "Between Worlds": {
      "name": "Mezi světy",
      "description": "Máš odolnost vůči nekrotickému zranění a duchové tě bez svolení nemohou posednout."
    },
    "Séance Circle": {
      "name": "Kruh seance",
      "description": "Rozhovoru se zesnulými se mohou účastnit všichni členové družiny a duch se může viditelně zhmotnit."
    },
    "Unquiet Testimony": {
      "name": "Neklidné svědectví",
      "description": "Jednou za dlouhý odpočinek přinutíš ducha svědka nahlas prožít poslední hodinu před smrtí; PJ popíše, co viděl."
    },
    "Guardian Shade": {
      "name": "Strážný stín",
      "description": "Provází tě spoutaný ochranný duch; jednou za odpočinek zruší jeden zásah, který by tě jinak trefil."
    },
    "Ferrywoman's Due": {
      "name": "Převoznická daň",
      "description": "Jednou za dlouhý odpočinek bez soupeření uložíš ducha k odpočinku či ukončíš posednutí; nepřátelské entity mají záchranu na Charisma."
    },
    "The Veil Thins": {
      "name": "Řídnoucí závoj",
      "description": "Kdykoli chceš, vidíš do Éterické sféry na 60 stop."
    },
    "Chorus of the Dead": {
      "name": "Sbor mrtvých",
      "description": "Ochrana ducha chrání dva tvory současně a navíc dává výhodu k jejich příští záchraně."
    },
    "Deathless Counsel": {
      "name": "Rada nesmrtelných",
      "description": "Rozhovor se zesnulými funguje s duchy libovolného stáří a má tři použití za odpočinek."
    },
    "Anchor of the Living": {
      "name": "Kotva živých",
      "description": "Jednou za dlouhý odpočinek zadržíš ducha tvora zemřelého do 30 stop; po dalších 24 hodin jej lze oživit, jako by právě zemřel."
    },
    "Queen of the Quiet Court": {
      "name": "Královna tichého dvora",
      "description": "Jednou za dlouhý odpočinek přivoláš procesí duchů; po 1 minutu podle tvých příkazů zakrývají výhled, děsí (záchrana na Moudrost) a útočí za 2k8 nekrotického zranění."
    },
    "Second Sight": {
      "name": "Druhý zrak",
      "description": "Jednou za odpočinek zahlédneš pravdivý obraz místa, osoby či události spojené s předmětem, který držíš."
    },
    "Ectoplasmic Shield": {
      "name": "Ektoplazmatický štít",
      "description": "Reakcí při zásahu získáš odolnost vůči tomuto jedinému zranění; za dlouhý odpočinek tolikrát, kolik činí oprava Moudrosti."
    },
    "Trance of the Crossing": {
      "name": "Trans přechodu",
      "description": "Jednou za dlouhý odpočinek na 10 minut promítneš svého ducha až na míli daleko; tělo je bezmocné, ale chráněné."
    },
    "Mistress of the Threshold": {
      "name": "Paní prahu",
      "description": "Tvorové, které vidíš, se nemohou změnit v nemrtvé a nemrtví do 30 stop mají nevýhodu k záchranám proti tvým seancím."
    }
  }
};
