// Full Czech player-facing rules for original post-apocalyptic class features.
// English keys are retained for the engine and saved sheets.
export const FEATURES_CS_POST_APOCALYPTIC: Readonly<Record<string,Record<string,{name:string;description:string}>>> = {
  "scavenger": {
    "Scrap Sense": {
      "name": "Cit pro šrot",
      "description": "Jednou za krátký odpočinek desetiminutovým průzkumem ruiny či vraku najdeš jeden skutečně užitečný předmět; o věrohodnosti rozhodne PJ."
    },
    "Improvised Weapon Mastery": {
      "name": "Mistr improvizovaných zbraní",
      "description": "S improvizovanými zbraněmi jsi zdatný jako s jednoduchými; způsobují 1k6, při držení oběma rukama 1k8 zranění."
    },
    "Packrat": {
      "name": "Křeček",
      "description": "Tvá nosnost se zdvojnásobí a vždy máš základní potřeby: provaz, pásku, drát a zdroj světla."
    },
    "Haunt": {
      "name": "Útočiště",
      "description": "Vybereš si sběračské útočiště (podpovolání)."
    },
    "Extra Attack": {
      "name": "Další útok",
      "description": "Při použití akce Útok zaútočíš dvakrát."
    },
    "Trap Eye": {
      "name": "Oko na pasti",
      "description": "Máš výhodu při hledání pastí, léček a nestabilního terénu; v ruinách získáš +2 k iniciativě."
    },
    "Make It Work": {
      "name": "Dám to dohromady",
      "description": "Jednou za odpočinek během minuty opravíš či provizorně sestavíš zařízení, vozidlo nebo zbraň, aby fungovalo po jednu scénu."
    },
    "Waste-Wise": {
      "name": "Znalec pustiny",
      "description": "Máš výhodu k záchranám proti radiaci, jedům a nemocem."
    },
    "Deep Pockets": {
      "name": "Hluboké kapsy",
      "description": "Jednou za dlouhý odpočinek vytáhneš přesně ten běžný předmět, který družina potřebuje, protože jsi ho už dříve našel."
    },
    "Junkyard Strikes": {
      "name": "Údery ze šrotiště",
      "description": "Improvizované a jednoduché zbraně způsobují navíc 1k6 zranění a považují se za magické."
    },
    "Escape Artist": {
      "name": "Mistr útěků",
      "description": "Bonusovou akcí můžeš provést Odpoutání nebo Schování a máš výhodu při úniku ze zápasu a pout."
    },
    "Scrap Sense (2 uses)": {
      "name": "Cit pro šrot (2 použití)",
      "description": "Cit pro šrot má dvě použití za krátký odpočinek a průzkum zabere jen 1 minutu."
    },
    "Built From Salvage": {
      "name": "Sestaveno ze šrotu",
      "description": "Provizorní zařízení vytvořená schopností Dám to dohromady vydrží den a můžeš je předat spojencům."
    },
    "The Good Stuff": {
      "name": "To nejlepší",
      "description": "Jednou za dlouhý odpočinek najdeš při průzkumu něco vzácného, například technologii starého světa, munici nebo léky; podobu vybere PJ."
    },
    "Never Unarmed": {
      "name": "Nikdy beze zbraně",
      "description": "Když tě odzbrojí nebo ti dojde munice, v tomto tahu vždy najdeš další dostupnou zbraň."
    },
    "King of the Heap": {
      "name": "Král haldy",
      "description": "Cit pro šrot vždy najde dva předměty a jednou denně je jeden z nich přesně ten, o který požádáš."
    },
    "Rust Reader": {
      "name": "Čtení rzi",
      "description": "Jediným pohledem poznáš, co se v ruině nacházelo, kdy se zhroutila a co jí od té doby prošlo."
    },
    "Silent Salvage": {
      "name": "Tichá záchrana",
      "description": "V ruinách a vracích máš výhodu k Plížení."
    },
    "Tetanus Edge": {
      "name": "Tetanové ostří",
      "description": "Jednou za tah improvizovaná zbraň způsobí navíc 1k4 jedového zranění a cíl si nemůže obnovit životy do tvého příštího tahu."
    },
    "Collapse Instinct": {
      "name": "Instinkt závalu",
      "description": "Jednou za odpočinek způsobíš nebo předpovíš zhroucení konstrukce; tvorové v krychli 15 stop musí uspět v záchraně na Obratnost, jinak utrpí 4k6 drtivého zranění a sutiny je zadrží."
    },
    "One With the Ruins": {
      "name": "Jedno s ruinami",
      "description": "V ruinách nemůžeš být překvapen, sledován ani obklíčen; Cit pro šrot se obnovuje při jakémkoli odpočinku."
    }
  },
  "road_warrior": {
    "Death or Glory": {
      "name": "Smrt, nebo sláva",
      "description": "Můžeš zaútočit bezhlavě: v tomto tahu máš výhodu k útokům nablízko, ale útoky proti tobě mají výhodu do příštího tahu."
    },
    "Hardened": {
      "name": "Ostřílený",
      "description": "Jednou za odpočinek snížíš veškeré zranění utržené v tomto kole o opravu Odolnosti."
    },
    "Wheelman": {
      "name": "Mistr volantu",
      "description": "Máš výhodu k ověřením řízení, jízdy či oprav vozidel; útoky z jedoucího vozidla nemají postih."
    },
    "Crew": {
      "name": "Posádka",
      "description": "Vybereš si silniční posádku (podpovolání)."
    },
    "Extra Attack": {
      "name": "Další útok",
      "description": "Při akci Útok můžeš zaútočit dvakrát."
    },
    "Fear No Rust": {
      "name": "Neboj se rzi",
      "description": "Máš výhodu k záchranám proti strachu; spojenci do 10 stop k nim přičítají 1k4, dokud bojuješ."
    },
    "Ram Speed": {
      "name": "Rychlost nárazu",
      "description": "Pokud se k cíli pohneš přímo alespoň 20 stop a zasáhneš jej nablízko, způsobíš navíc 2k6 zranění a odstrčíš ho 10 stop."
    },
    "Scar Tissue": {
      "name": "Zjizvená tkáň",
      "description": "Máš odolnost vůči drtivému zranění z nemagických útoků."
    },
    "Hardened (2 uses)": {
      "name": "Ostřílený (2 použití)",
      "description": "Ostříleného použiješ dvakrát a zranění snížíš o dvojnásobek opravy Odolnosti."
    },
    "Extra Attack (2)": {
      "name": "Další útok (2)",
      "description": "Při akci Útok můžeš zaútočit třikrát."
    },
    "Blood and Chrome": {
      "name": "Krev a chrom",
      "description": "Při méně než polovině životů způsobují tvé útoky nablízko navíc 1k8 zranění."
    },
    "Road Rage": {
      "name": "Silniční zuřivost",
      "description": "Jednou za odpočinek, když spojenec do 30 stop klesne na 0 životů, okamžitě se přesuneš o svou rychlost a provedeš jeden útok."
    },
    "Unstoppable": {
      "name": "Nezastavitelný",
      "description": "Dokud jsi při vědomí, nelze snížit tvou rychlost a nemůžeš být sražen na zem."
    },
    "Witnessed": {
      "name": "Poslední svědek",
      "description": "Jednou za dlouhý odpočinek při poklesu na 0 životů dál 1 minutu bojuješ při vědomí s 0 životy a teprve pak padneš."
    },
    "Warlord of the Wastes": {
      "name": "Válečník pustiny",
      "description": "Spojenci do 30 stop mají +1 k hodům na útok, dokud tě vidí."
    },
    "Ride Eternal": {
      "name": "Věčná jízda",
      "description": "Smrt, nebo sláva již neposkytuje nepřátelům výhodu k útokům proti tobě."
    },
    "Chained Hook": {
      "name": "Řetězový hák",
      "description": "Hák na řetězu (1k8 bodného zranění, dosah 15 stop); při zásahu přitáhneš cíl o 10 stop."
    },
    "Reaver's Toll": {
      "name": "Rejdařská daň",
      "description": "Máš výhodu k Zastrašování cestujících, obchodníků a konkurenčních posádek."
    },
    "Skull Takers": {
      "name": "Sběrači lebek",
      "description": "Když srazíš tvora na 0 životů, nepřátelé do 15 stop musí uspět v záchraně na Moudrost, jinak se tě bojí do příštího tahu."
    },
    "Gore Drift": {
      "name": "Krvavý smyk",
      "description": "Po zásahu Rychlostí nárazu provedeš jeden další útok proti jinému tvorovi v dosahu."
    },
    "Last Ride of the Reaver": {
      "name": "Poslední jízda nájezdníka",
      "description": "Jednou za dlouhý odpočinek se ti na 1 minutu zdvojnásobí rychlost, Rychlost nárazu způsobuje navíc 4k6 zranění a máš odolnost vůči všemu zranění."
    }
  },
  "aberrant": {
    "Unstable Genome": {
      "name": "Nestabilní genom",
      "description": "Sesíláš kouzla ze seznamu čaroděje jako mutace pomocí Charismatu; při seslání se na okamžik viditelně deformuje tvé tělo."
    },
    "Adaptive Hide": {
      "name": "Přizpůsobivá kůže",
      "description": "Bez zbroje je tvé OČ rovno 13 + oprava Obratnosti."
    },
    "Rapid Adaptation": {
      "name": "Rychlé přizpůsobení",
      "description": "Jednou za dlouhý odpočinek po utržení živlového zranění získáš odolnost vůči jeho typu až do odpočinku."
    },
    "Predator Senses": {
      "name": "Predátorské smysly",
      "description": "Máš vidění ve tmě do 60 stop a výhodu k Vnímání založenému na čichu."
    },
    "Surge of Change": {
      "name": "Příval změny",
      "description": "Dvakrát za odpočinek můžeš po seslání úrovňové mutace seslat trik bonusovou akcí."
    },
    "Regenerative Strain": {
      "name": "Regenerační kmen",
      "description": "Bonusovou akcí utratíš kostku životů k léčení; za dlouhý odpočinek tolikrát, kolik činí oprava Charismatu."
    },
    "Toxic Blood": {
      "name": "Jedovatá krev",
      "description": "Jsi imunní vůči jedům a nemocem; tvor, který tě kousne, utrpí 2k6 jedového zranění."
    },
    "Chameleon Skin": {
      "name": "Chameleonská kůže",
      "description": "Máš výhodu k Plížení; jednou za odpočinek se staneš téměř neviditelným, dokud nezaútočíš nebo nesešleš kouzlo."
    },
    "Grafted Power": {
      "name": "Naroubovaná moc",
      "description": "Naučíš se dvě kouzla z libovolného seznamu; pro tebe se považují za mutace."
    },
    "Hardened Mutation": {
      "name": "Zpevněná mutace",
      "description": "Jednou za dlouhý odpočinek při poklesu pod polovinu životů obnovíš utracené úrovně pozic kouzel v součtu do výše opravy Charismatu."
    },
    "Apex Genome": {
      "name": "Vrcholový genom",
      "description": "Každé ráno si vybereš dva druhy zranění, proti nimž budeš mít odolnost."
    },
    "Perfected Instability": {
      "name": "Dokonalá nestabilita",
      "description": "Tvé mutace ignorují odolnost vůči svému typu zranění."
    },
    "The Next Step": {
      "name": "Další krok",
      "description": "Jednou za dlouhý odpočinek po 1 minutu nestojí tvé mutace nejvýše 3. úrovně žádné pozice kouzel a Přizpůsobivá kůže dává další +2 k OČ."
    },
    "Chimeric Limb": {
      "name": "Chimérická končetina",
      "description": "Dráp, chapadlo či kostěná čepel je přirozená zbraň za 1k8 + oprava Charismatu sečného zranění; můžeš přes ni sesílat mutace."
    },
    "Second Adaptation": {
      "name": "Druhé přizpůsobení",
      "description": "Rychlé přizpůsobení má dvě použití a může také na hodinu dát rychlost lezení či plavání."
    },
    "Splintered Form": {
      "name": "Rozštěpená podoba",
      "description": "Jednou za dlouhý odpočinek se reakcí na zásah do příštího tahu proměníš v roj; utrpíš polovinu zranění útoku a procházíš mezerami."
    },
    "Perfect Chimera": {
      "name": "Dokonalá chiméra",
      "description": "Chimérická končetina způsobuje 2k8 zranění, považuje se za magickou a má dosah 10 stop."
    }
  },
  "salvage_tech": {
    "Old-World Interface": {
      "name": "Rozhraní starého světa",
      "description": "Za minutu pokusů dokážeš ovládat, odemykat a číst libovolnou technologii před Pádem."
    },
    "Percussive Maintenance": {
      "name": "Oprava poklepáním",
      "description": "Dvakrát za odpočinek úderem do stroje či konstruktu obnovíš 1k8 + oprava Inteligence životů nebo odstraníš jednu poruchu."
    },
    "Rebuilt Arsenal": {
      "name": "Znovusestavený arzenál",
      "description": "Sesíláš kouzla ze seznamu kouzelníka jako účinky obnovené techniky pomocí Inteligence; přestavěná souprava je ohniskem."
    },
    "Doctrine": {
      "name": "Doktrína",
      "description": "Vybereš si doktrínu zachráněné techniky (podpovolání)."
    },
    "Power Cell Cache": {
      "name": "Zásoba článků",
      "description": "Jednou za odpočinek sešleš technický účinek 1. úrovně bez spotřeby pozice kouzla."
    },
    "EMP Coil": {
      "name": "EMP cívka",
      "description": "Jednou za odpočinek musí konstrukti a stroje do 15 stop uspět v záchraně na Odolnost, jinak jsou omráčeni do tvého příštího tahu."
    },
    "Scrap Armor Weave": {
      "name": "Propletená šrotová zbroj",
      "description": "Máš +1 k OČ a odolnost vůči bleskovému zranění."
    },
    "Signal Whisperer": {
      "name": "Šeptání signálu",
      "description": "Vycítíš a vystopuješ aktivní techniku, signály a zdroje energie do jedné míle."
    },
    "Overcharged Rounds": {
      "name": "Přebité střely",
      "description": "Jednou za tah zásah palnou zbraní způsobí navíc 1k8 bleskového zranění."
    },
    "Field Fabricator": {
      "name": "Polní výrobna",
      "description": "Během dlouhého odpočinku postavíš jedno dočasné zařízení napodobující technický účinek 2. úrovně; aktivovat jej může kdokoli."
    },
    "Salvaged Shield Node": {
      "name": "Zachráněný štítový uzel",
      "description": "Jednou za dlouhý odpočinek na 1 minutu vytvoříš energetickou kopuli o poloměru 10 stop; spojenci uvnitř mají +2 k OČ a odolnost vůči zranění útoky zbraněmi na dálku."
    },
    "Power Cell Cache (3rd)": {
      "name": "Zásoba článků (3. úroveň)",
      "description": "Zásoba článků funguje pro technické účinky až 3. úrovně."
    },
    "Machine Empathy": {
      "name": "Empatie strojů",
      "description": "Konstrukti a automatické obranné systémy musí uspět v záchraně na Moudrost, aby před jinými tvory zacílily tebe."
    },
    "Prototype Rig": {
      "name": "Prototypová souprava",
      "description": "Vybereš si jeden technický účinek 5. úrovně a jednou za dlouhý odpočinek jej sešleš bez pozice."
    },
    "The Old World Answers": {
      "name": "Starý svět odpovídá",
      "description": "Jednou za dlouhý odpočinek položíš PJ otázku, na kterou by odpověděly záznamy před Pádem, a vybavíš si odpověď."
    },
    "Reactor Heart": {
      "name": "Srdce reaktoru",
      "description": "Jednou za dlouhý odpočinek po 1 minutu nestojí technické účinky nejvýše 4. úrovně pozice kouzel; viditelně záříš."
    },
    "Blessed Isotope": {
      "name": "Požehnaný izotop",
      "description": "Jednou za tah škodlivý technický účinek způsobí jednomu cíli navíc 1k6 zářivého zranění při záblesku jádra."
    },
    "Geiger Sense": {
      "name": "Geigerův smysl",
      "description": "Přesně vycítíš radiaci a máš odolnost vůči jejím účinkům."
    },
    "Halo of the Core": {
      "name": "Svatozář jádra",
      "description": "Jednou za odpočinek vyšleš záblesk do 10 stop; nepřátelé musí uspět v záchraně na Odolnost, jinak jsou oslepení do tvého příštího tahu."
    },
    "Meltdown Ward": {
      "name": "Ochrana proti roztavení",
      "description": "Jsi imunní vůči zářivému a nekrotickému zranění způsobenému technikou a radiací."
    },
    "Second Sun": {
      "name": "Druhé slunce",
      "description": "Jednou za dlouhý odpočinek vypustíš výbuch jádra v okruhu 30 stop za 8k6 zářivého zranění (záchrana na Odolnost půlí); spojenci jsou ušetřeni."
    }
  },
  "waste_preacher": {
    "Words for the End": {
      "name": "Slova konce",
      "description": "Sesíláš kouzla ze seznamu klerika jako kázání pomocí Moudrosti; tvůj hlas působí přesvědčením, nikoli liturgií."
    },
    "Flock's Shepherd": {
      "name": "Pastýř stáda",
      "description": "Bonusovou akcí poskytneš spojenci do 30 stop dočasné životy ve výši své úrovně + opravy Moudrosti; za dlouhý odpočinek tolikrát, kolik činí oprava Moudrosti."
    },
    "Testify": {
      "name": "Svědectví",
      "description": "Jednou za odpočinek proslov slyšitelný do 30 stop dá spojencům výhodu k příští záchraně proti strachu či zoufalství."
    },
    "Water From Stone": {
      "name": "Voda z kamene",
      "description": "Jednou denně najdeš nebo očistíš dost vody a jídla pro šest lidí."
    },
    "Lay On the Word": {
      "name": "Uzdravující slovo",
      "description": "Tvé léčivé proslovy přičítají k obnoveným životům ještě jednou opravu Moudrosti."
    },
    "Shepherd's Stare": {
      "name": "Pastýřův pohled",
      "description": "Máš výhodu k Zastrašování a Přesvědčování nájezdníků, kultistů a zoufalých lidí."
    },
    "Deliverance": {
      "name": "Vysvobození",
      "description": "Jednou za odpočinek ukončíš jeden účinek strachu, okouzlení či kletby na tvorovi do 30 stop."
    },
    "Judgment": {
      "name": "Soud",
      "description": "Jednou za tah jeden cíl škodlivého kázání utrpí navíc 1k8 zářivého zranění."
    },
    "Congregation": {
      "name": "Shromáždění",
      "description": "Pastýř stáda může najednou zacílil dva spojence."
    },
    "Walk Through the Valley": {
      "name": "Údolím stínů",
      "description": "Ty a spojenci do 10 stop máte odolnost vůči nekrotickému zranění a výhodu proti strachu."
    },
    "Prophet of the Wastes": {
      "name": "Prorok pustiny",
      "description": "Jednou za dlouhý odpočinek dostaneš pravdivé znamení o zamýšleném činu: dobro, zlo nebo obojí."
    },
    "The Word Made Iron": {
      "name": "Slovo jako železo",
      "description": "Zranění ti nemůže přerušit soustředění na kázání."
    },
    "Revelation": {
      "name": "Zjevení",
      "description": "Jednou za dlouhý odpočinek proneseš úplné kázání: spojencům do 60 stop obnovíš 5k8 životů, zbavíš je strachu, okouzlení a jednoho stupně vyčerpání."
    },
    "Dawnlight": {
      "name": "Světlo úsvitu",
      "description": "Jednou za odpočinek zvednutou rukou vyzařuješ sluneční světlo do 30 stop na 10 minut; nemrtví a mutanti uvnitř mají nevýhodu k útokům."
    },
    "Baptism of Ash": {
      "name": "Křest popelem",
      "description": "Když léčíš tvora pod polovinou životů, získá navíc +1 k útokům do tvého příštího tahu."
    },
    "Stand at the Dawn": {
      "name": "Stát při úsvitu",
      "description": "Jednou za dlouhý odpočinek spojenec do 30 stop při pádu na 0 životů místo toho zůstane s pětinásobkem tvé opravy Moudrosti životů."
    },
    "The Last Dawn Rises": {
      "name": "Poslední úsvit povstává",
      "description": "Světlo úsvitu nyní zraňuje: nepřátelští nemrtví a aberace při vstupu nebo zahájení svého tahu ve světle utrpí 2k8 zářivého zranění."
    }
  },
  "packmaster": {
    "Bonded Beast": {
      "name": "Spoutané zvíře",
      "description": "Věrná šelma pustiny bojuje po tvém boku (OČ 13 + zdatnostní bonus, životy 5 × úroveň, útok 1k8 + Moudrost) a poslouchá příkazy."
    },
    "Pack Tactics Training": {
      "name": "Výcvik smečkové taktiky",
      "description": "Ty a tvá šelma máte výhodu k útokům proti tvorovi, s nímž druhý z vás sousedí."
    },
    "Green Tongue": {
      "name": "Zelená řeč",
      "description": "Sesíláš kouzla ze seznamu druida jako staré svazky pomocí Moudrosti; vždy dokážeš zvířatům sdělit jednoduché myšlenky."
    },
    "Pack Law": {
      "name": "Zákon smečky",
      "description": "Vybereš si zákon smečky (podpovolání)."
    },
    "Extra Attack": {
      "name": "Další útok",
      "description": "Při použití akce Útok útočíš dvakrát; tvá šelma zaútočí, když jí to přikážeš bonusovou akcí."
    },
    "Scent the Wind": {
      "name": "Zachycení pachu",
      "description": "Ty a tvá šelma máte výhodu při stopování a nemohou vás překvapit zvířata ani mutanti."
    },
    "Mended Hide": {
      "name": "Zhojená kůže",
      "description": "Tvé léčivé svazky léčí zvířecího společníka s dvojnásobným účinkem."
    },
    "Call the Wild": {
      "name": "Volání divočiny",
      "description": "Jednou za dlouhý odpočinek přivoláš 1k4 místní zvířata se statistikami vlka na 10 minut."
    },
    "Alpha's Roar": {
      "name": "Řev alfy",
      "description": "Jednou za odpočinek musí nepřátelská zvířata a mutanti do 30 stop uspět v záchraně na Moudrost, jinak se k tobě 1 minutu nemohou přiblížit."
    },
    "War Beast": {
      "name": "Válečná šelma",
      "description": "Útoky tvé šelmy způsobují 2k8 + Moudrost zranění, považují se za magické a šelma získá +2 k OČ."
    },
    "Twin Bond": {
      "name": "Dvojité pouto",
      "description": "Spoutáš druhou menší šelmu (OČ 12 + zdatnostní bonus, životy 2 × úroveň, útok 1k4 + Moudrost, rychlost 50 stop); smysly obou vnímáš do jedné míle."
    },
    "Pack Endurance": {
      "name": "Výdrž smečky",
      "description": "Jednou za dlouhý odpočinek při pádu na 0 životů tvá šelma zůstane na 1; totéž platí pro tebe, dokud žije."
    },
    "Coordinated Takedown": {
      "name": "Koordinované složení",
      "description": "Když ty i šelma zasáhnete v jednom tahu stejný cíl, musí uspět v záchraně na Sílu, jinak spadne a je chycen do zápasu."
    },
    "Lord of the Green": {
      "name": "Pán zeleně",
      "description": "Zvířata a rostliny ti neublíží, pokud nejsou magicky donuceny; máš výhodu ke všem ověřením Moudrosti při jednání s nimi."
    },
    "The Pack Provides": {
      "name": "Smečka zajistí",
      "description": "Volání divočiny přivolá 2k4 zvířata a jednou denně se obnovuje při krátkém odpočinku."
    },
    "One Blood": {
      "name": "Jedna krev",
      "description": "Dokud jsi do 30 stop od své šelmy, oba máte odolnost vůči všemu zranění od tvorů, které jste v tomto boji ještě nezranili."
    },
    "Shared Fury": {
      "name": "Sdílená zuřivost",
      "description": "Jednou za odpočinek získáte ty i šelma +2 ke zranění na 1 minutu."
    },
    "Den Mother's Eye": {
      "name": "Matčino oko",
      "description": "Šelma může samostatně střežit osobu či místo a upozornit tě až na vzdálenost jedné míle."
    },
    "Blood Bond": {
      "name": "Krevní pouto",
      "description": "Když šelma do 30 stop utrpí zranění, můžeš je reakcí rozdělit rovnoměrně mezi vás."
    },
    "Apex Pair": {
      "name": "Vrcholový pár",
      "description": "Výhoda Výcviku smečkové taktiky se vztahuje na všechny spojence sousedící s tvou šelmou."
    },
    "Legend of the Pack": {
      "name": "Legenda smečky",
      "description": "Jednou za dlouhý odpočinek tvá šelma na 1 minutu obludně vzroste: životy se zdvojnásobí, rychlost stoupne o 10 stop, útoky způsobují navíc 2k8 zranění a děsí (záchrana na Moudrost)."
    }
  }
};
