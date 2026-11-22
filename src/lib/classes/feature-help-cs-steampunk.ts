// Full Czech player-facing rules for original steampunk class features.
// English keys are retained for the engine and saved sheets.
export const FEATURES_CS_STEAMPUNK: Readonly<Record<string,Record<string,{name:string;description:string}>>> = {
  "machinist": {
    "Arcanomechanical Casting": {
      "name": "Arkanomechanické sesílání",
      "description": "Sesíláš kouzla ze seznamu kouzelníka jako sestavené schémata pomocí Inteligence; tvým ohniskem je opasek s nástroji."
    },
    "Field Repair": {
      "name": "Polní oprava",
      "description": "Dvakrát za odpočinek minutou práce obnovíš 1k8 + oprava Inteligence životů konstruktu, stroji či obrněnému spojenci."
    },
    "Blueprint Memory": {
      "name": "Paměť plánů",
      "description": "Po minutě studia dokážeš stroj nebo mechanismus kvalifikovaně popsat, ovládat či sabotovat."
    },
    "Guild Chapter": {
      "name": "Cechovní kapitula",
      "description": "Vybereš si inženýrskou kapitulu (podpovolání)."
    },
    "Clockwork Familiar": {
      "name": "Hodinový pomocník",
      "description": "Pomáhá ti malý mosazný automat: nosí věci, přináší předměty a jednou za odpočinek dá výhodu k ověření."
    },
    "Overpressure Valve": {
      "name": "Přetlakový ventil",
      "description": "Jednou za odpočinek sešleš schéma 1. úrovně bez spotřeby pozice kouzla."
    },
    "Reinforced Chassis": {
      "name": "Zpevněný podvozek",
      "description": "Máš +1 k OČ, nosíš-li zbroj, kterou jsi naladil; po dlouhém odpočinku můžeš naladit libovolnou zbroj."
    },
    "Steamvent Burst": {
      "name": "Výron páry",
      "description": "Jednou za odpočinek při vypuštění páry ze zbroje musí sousední tvorové uspět v záchraně na Obratnost, jinak utrpí 3k8 ohnivého zranění a jsou odhozeni 10 stop."
    },
    "Precision Engineering": {
      "name": "Přesné inženýrství",
      "description": "Tvá schémata ignorují poloviční kryt a tříčtvrteční kryt považují za poloviční."
    },
    "Field Repair (2d8)": {
      "name": "Polní oprava (2k8)",
      "description": "Polní oprava obnovuje 2k8 + oprava Inteligence životů a má čtyři použití za odpočinek."
    },
    "Aether Capacitor": {
      "name": "Éterový kondenzátor",
      "description": "Jednou za dlouhý odpočinek obnovíš utracené úrovně pozic kouzel do součtu opravy Inteligence."
    },
    "Master Schematic": {
      "name": "Mistrovské schéma",
      "description": "Vybereš jedno schéma 3. úrovně a jednou za dlouhý odpočinek je sešleš bez pozice."
    },
    "Redundant Systems": {
      "name": "Záložní systémy",
      "description": "Máš výhodu k záchranám na Odolnost k udržení soustředění na schémata."
    },
    "Difference Engine Mind": {
      "name": "Mysl diferenčního stroje",
      "description": "Jednou za odpočinek u jednoho ověření založeného na Inteligenci použiješ výsledek přirozené 20."
    },
    "Perpetual Motion": {
      "name": "Věčný pohyb",
      "description": "Přetlakový ventil funguje pro schémata až 3. úrovně dvakrát za odpočinek."
    },
    "Magnum Opus": {
      "name": "Velké dílo",
      "description": "Jednou za dlouhý odpočinek bez pozice sešleš jedno schéma nejvýše 6. úrovně; konstrukti a stroje mu nemohou odolat."
    },
    "Improved Familiar Frame": {
      "name": "Vylepšený rám pomocníka",
      "description": "Pomocník získá bodnutí za 1k8 + oprava Inteligence bodného zranění s dosahem 30 stop a životy ve výši 3 × tvé úrovně."
    },
    "Wind-Up Ally": {
      "name": "Natahovací spojenec",
      "description": "Pomocníkovi můžeš velet bonusovou akcí."
    },
    "Gear Swarm": {
      "name": "Hejno ozubených kol",
      "description": "Jednou za odpočinek vypustíš na tvora do 30 stop skříň vířících kol; krychle 15 stop kolem něj se na 1 minutu změní v obtížný terén a tvorové do ní vstupující utrpí 2k6 sečného zranění."
    },
    "Twin Automata": {
      "name": "Dvojice automatů",
      "description": "Sestavíš druhého pomocníka; oba jednají na tvůj příkaz."
    },
    "The Great Work Walks": {
      "name": "Kráčející velké dílo",
      "description": "Jednou za dlouhý odpočinek se oba pomocníci na 10 minut spojí v mosazného obra (dvojnásobné životy, úder 2k10 + Inteligence) a můžeš na něm jet."
    }
  },
  "aeronaut": {
    "Sky Legs": {
      "name": "Nebeské nohy",
      "description": "Máš výhodu k lezení, rovnováze a udržení postoje; utržené zranění pádem se půlí."
    },
    "Daring Maneuver": {
      "name": "Odvážný manévr",
      "description": "Jednou za tah přičteš 1k6 ke zranění útoku provedeného po pohybu nejméně 15 stop přímo či v zhoupnutí."
    },
    "Rigging Runner": {
      "name": "Běžec v lanoví",
      "description": "Lezení nestojí žádný pohyb navíc a Úprk můžeš provést bonusovou akcí."
    },
    "Commission": {
      "name": "Pověření",
      "description": "Vybereš si vzduchoplavecké pověření (podpovolání)."
    },
    "Extra Attack": {
      "name": "Další útok",
      "description": "Při akci Útok můžeš zaútočit dvakrát."
    },
    "Grapnel Line": {
      "name": "Vystřelovací hák",
      "description": "Odpalovačem s lanem se při pohybu přehoupneš nebo přitáhneš 30 stop; za odpočinek tolikrát, kolik činí oprava Inteligence."
    },
    "Evasion": {
      "name": "Vyhnutí",
      "description": "Při záchraně na Obratnost proti účinku s polovičním zraněním neutrpíš při úspěchu žádné, při neúspěchu polovinu."
    },
    "Duelist's Flourish": {
      "name": "Šermířský výpad",
      "description": "Když tě nepřítel mine útokem nablízko, můžeš mu reakcí oplatit jedním útokem zbraní."
    },
    "Weather Eye": {
      "name": "Oko pro počasí",
      "description": "Z větru a počasí předpovíš další den a nikdy tě nepřekvapí povětrnostní podmínky ve výšce."
    },
    "Greater Daring": {
      "name": "Vyšší odvaha",
      "description": "Odvážný manévr způsobuje navíc 2k6 zranění a platí i na útoky na dálku ze vzduchu či vyvýšeného místa."
    },
    "Boarding Action": {
      "name": "Přepad na palubě",
      "description": "Jednou za odpočinek se při začátku boje okamžitě přesuneš o svou rychlost a provedeš jeden útok."
    },
    "Cat's Grace": {
      "name": "Kočičí ladnost",
      "description": "Dokud jsi při vědomí, neutrpíš zranění pádem a příležitostné útoky proti tobě mají nevýhodu."
    },
    "Grapnel Ace": {
      "name": "Mistr vystřelovacího háku",
      "description": "Vystřelovacím hákem můžeš do 30 stop také odzbrojit nebo podrazit cíl; brání se soupeřením Síly."
    },
    "Sky Duelist": {
      "name": "Nebeský šermíř",
      "description": "Při kritickém zásahu jednoruční zbraní můžeš cíl srazit na zem nebo odzbrojit."
    },
    "Master of the High Wire": {
      "name": "Mistr vysokého lana",
      "description": "Tvá rychlost vzroste o 10 stop a obtížný terén tě nikdy nezpomaluje."
    },
    "Legend of the Skies": {
      "name": "Legenda nebes",
      "description": "Když hodíš na iniciativu, dostaneš jeden celý dodatečný tah ještě před prvním kolem."
    },
    "Pistol and Blade": {
      "name": "Pistole a čepel",
      "description": "Při útoku zbraní nablízko můžeš bonusovou akcí provést jeden útok palnou zbraní."
    },
    "Corsair's Swagger": {
      "name": "Korzárská kuráž",
      "description": "Na lodích a v přístavech máš výhodu k Zastrašování a Přesvědčování."
    },
    "Powder Discipline": {
      "name": "Disciplína střelného prachu",
      "description": "Útoky palnými zbraněmi ignorují poloviční kryt a nabíjení tě nikdy nestojí útok."
    },
    "Broadside": {
      "name": "Boční salva",
      "description": "Jednou za odpočinek vystřelíš na až tři cíle v kuželu 15 stop; proti každému hodíš na útok."
    },
    "Terror of the Trade Winds": {
      "name": "Postrach pasátů",
      "description": "Jednou za dlouhý odpočinek po 1 minutu platí Odvážný manévr pro každý tvůj útok a nepřátelé, kteří tě vidí, musí uspět v záchraně na Moudrost, jinak jsou vystrašení."
    }
  },
  "alchemist": {
    "Volatile Concoctions": {
      "name": "Nestálé směsi",
      "description": "Sesíláš kouzla ze seznamu kouzelníka jako vařené receptury pomocí Inteligence; škodlivé receptury můžeš házet jako lahvičky."
    },
    "Catalyst Stone": {
      "name": "Katalyzátorový kámen",
      "description": "Jednou za odpočinek přičteš 1k4 ke zranění nebo léčení jedné receptury pomocí připraveného kamene."
    },
    "School of Practice": {
      "name": "Škola praxe",
      "description": "Vybereš si alchymistickou školu (podpovolání)."
    },
    "Reagent Pouch": {
      "name": "Váček s přísadami",
      "description": "Podle vůně a bezpečného ochutnání poznáš libovolný lektvar, jed či chemikálii."
    },
    "Emergency Draught": {
      "name": "Nouzový doušek",
      "description": "Dvakrát za dlouhý odpočinek uvaříš lektvar, kterým si pijící bonusovou akcí obnoví 2k4 + oprava Inteligence životů."
    },
    "Acid Resistant Apron": {
      "name": "Kyselinovzdorná zástěra",
      "description": "Máš odolnost vůči kyselinovému a jedovému zranění."
    },
    "Fumes and Vapors": {
      "name": "Výpary a páry",
      "description": "Jednou za odpočinek na 1 minutu vyplní poloměr 10 stop páchnoucí mrak; tvorové uvnitř musí uspět v záchraně na Odolnost, jinak zvracejí a ztrácejí akci."
    },
    "Improved Catalyst": {
      "name": "Lepší katalyzátor",
      "description": "Katalyzátorový kámen přičítá 1k8 a má tři použití za odpočinek."
    },
    "Transmuter's Touch": {
      "name": "Dotyk transmutátora",
      "description": "Za 10 minut změníš až krychlovou stopu běžné látky v jinou, například dřevo v železo nebo vodu v kyselinu."
    },
    "Sublimation": {
      "name": "Sublimace",
      "description": "Jednou za dlouhý odpočinek sešleš recepturu nejvýše 3. úrovně bez pozice kouzla."
    },
    "Philosopher's Draught": {
      "name": "Filosofův doušek",
      "description": "Nouzové doušky nyní vyléčí také jeden jed či nemoc a dají na hodinu imunitu vůči jedům."
    },
    "Volatile Chain": {
      "name": "Řetězec výbuchů",
      "description": "Škodlivé receptury mohou zasáhnout i sousedního tvora; utrpí zranění stejného typu ve výši tvé opravy Inteligence."
    },
    "Stone of the Magnum Opus": {
      "name": "Kámen velkého díla",
      "description": "Katalyzátorovým kamenem můžeš místo bonusu přehodit všechny kostky receptury a ponechat vyšší součet."
    },
    "Elixir of Mastery": {
      "name": "Elixír mistrovství",
      "description": "Jednou za dlouhý odpočinek uvaříš vyšší elixír, jehož vypití dá na 1 minutu výhodu ke všemu."
    },
    "Alkahest": {
      "name": "Alkahest",
      "description": "Tvé kyselinové receptury ignorují odolnost a rozpouštějí nemagické překážky do tloušťky jedné stopy."
    },
    "The Great Work": {
      "name": "Velké dílo",
      "description": "Jednou za dlouhý odpočinek bez pozice sešleš jednu recepturu nejvýše 7. úrovně; všechny její kostky mají maximální hodnotu."
    },
    "Corrosive Focus": {
      "name": "Žíravé soustředění",
      "description": "Jednou za tah způsobí škodlivá receptura navíc 1k6 kyselinového zranění a můžeš změnit typ zranění kterékoli receptury na kyselinu."
    },
    "Etching Acid": {
      "name": "Leptavá kyselina",
      "description": "Tvé kyselinové zranění sníží zasaženému cíli OČ o 1 do tvého příštího tahu; účinek se nesčítá."
    },
    "Vitriol Ampoule": {
      "name": "Ampule vitriolu",
      "description": "Když tě někdo zasáhne nablízko, reakcí způsobíš útočníkovi 2k6 kyselinového zranění; za dlouhý odpočinek tolikrát, kolik činí oprava Inteligence."
    },
    "Dissolving Mist": {
      "name": "Rozpouštěcí mlha",
      "description": "Jednou za dlouhý odpočinek vytvoříš na 1 minutu kyselinovou mlhu o poloměru 20 stop kolem tvora do 60 stop; na začátku tahu uvnitř utrpí tvorové 3k6 kyselinového zranění, úspěšná záchrana na Odolnost půlí."
    },
    "Universal Solvent": {
      "name": "Univerzální rozpouštědlo",
      "description": "Tvé kyselinové receptury považují imunitu za odolnost a postih Leptavé kyseliny se může sčítat až na −3 k OČ."
    }
  },
  "gadgeteer": {
    "Utility Gadgets": {
      "name": "Užitkové vynálezy",
      "description": "Vyber dva vynálezy (vystřelovací hák, dýmovnici, obloukovou lampu, naslouchátko, univerzální klíč či kapesní štít). Každý použiješ tolikrát za odpočinek, kolik činí oprava Inteligence; účinek odpovídá předmětu."
    },
    "Overclock": {
      "name": "Přetaktování",
      "description": "Jednou za odpočinek po 1 minutu zdvojnásobíš účinek vynálezu či stroje, který držíš."
    },
    "Tinker's Speed": {
      "name": "Hbitost kutila",
      "description": "Vynálezy vytahuješ, vyměňuješ a nasazuješ bonusovou akcí."
    },
    "Workshop": {
      "name": "Dílna",
      "description": "Vybereš si dílenskou tradici (podpovolání)."
    },
    "Extra Attack": {
      "name": "Další útok",
      "description": "Při použití akce Útok zaútočíš dvakrát."
    },
    "Third Gadget": {
      "name": "Třetí vynález",
      "description": "Naučíš se třetí vynález; SO záchran proti vynálezům = 8 + zdatnostní bonus + oprava Inteligence."
    },
    "Spring Heels": {
      "name": "Pružinové paty",
      "description": "Tvoje skoky jsou třikrát delší a při pádu ignoruješ prvních 20 stop."
    },
    "Smoke Discipline": {
      "name": "Dýmová disciplína",
      "description": "Dýmovnice vyplní poloměr 15 stop a skrze vlastní dým vidíš."
    },
    "Fourth Gadget": {
      "name": "Čtvrtý vynález",
      "description": "Naučíš se čtvrtý vynález a Přetaktování má dvě použití za odpočinek."
    },
    "Sabotage": {
      "name": "Sabotáž",
      "description": "Jednou za odpočinek dotykem způsobíš poruchu stroje, pasti či konstruktu v nejnevhodnější okamžik pro majitele; účinek určí PJ."
    },
    "Backup Rig": {
      "name": "Záložní souprava",
      "description": "Vynález v ruce přežije pokus o zničení či vyřazení; jednou za dlouhý odpočinek zabráníš vlastnímu odzbrojení."
    },
    "Fifth Gadget": {
      "name": "Pátý vynález",
      "description": "Naučíš se pátý vynález."
    },
    "Chain Deployment": {
      "name": "Řetězové nasazení",
      "description": "Stejnou bonusovou akcí použiješ dva různé vynálezy."
    },
    "Signature Invention": {
      "name": "Osobní vynález",
      "description": "S PJ navrhneš vlastní jedinečný vynález, který se obnovuje po krátkém odpočinku."
    },
    "Perpetual Toolkit": {
      "name": "Nevyčerpatelná souprava",
      "description": "Všechna použití tvých vynálezů se obnovují při krátkém odpočinku."
    },
    "One Gadget for Everything": {
      "name": "Vynález na všechno",
      "description": "Jednou za dlouhý odpočinek prohlásíš, že sis pro danou situaci připravil přesně správný přístroj; PJ mu umožní jediné použití."
    },
    "Prodigy's Precision": {
      "name": "Přesnost génia",
      "description": "K útokům zbraněmi vylepšenými vynálezy, včetně naladěných technických čepelí a palných zbraní, přičítáš 1k4."
    },
    "Quick Study": {
      "name": "Rychlé studium",
      "description": "Máš výhodu k ověřením pochopení či napodobení neznámé technologie."
    },
    "Arc Coil": {
      "name": "Oblouková cívka",
      "description": "Jednou za odpočinek naladěnou zbraní způsobíš při zásahu navíc 2k8 bleskového zranění a cíl nemůže používat reakce do příštího tahu."
    },
    "Auto-Loader Harness": {
      "name": "Automatický nabíječ",
      "description": "Jednou za tah provedeš při akci Útok jeden dodatečný útok palnou zbraní."
    },
    "Masterwork Arsenal": {
      "name": "Mistrovský arzenál",
      "description": "Naladěné zbraně se považují za magické zbraně +2 a kriticky zasáhnou při hodu 19–20."
    }
  },
  "aether_channeler": {
    "Conduit Body": {
      "name": "Tělo vodiče",
      "description": "Sesíláš kouzla ze seznamu čaroděje jako éterická umění pomocí Charismatu; při sesílání po tobě viditelně přeskakují jiskry."
    },
    "Galvanic Discharge": {
      "name": "Galvanický výboj",
      "description": "Jednou za odpočinek si na 1 minutu nabiješ kůži: příští tvor, který se tě dotkne či zasáhne nablízko, utrpí 1k8 bleskového zranění."
    },
    "Static Sense": {
      "name": "Statický smysl",
      "description": "Vycítíš aktivní stroje, éterové vedení a nabité tvory do 30 stop."
    },
    "Grounded Stance": {
      "name": "Uzemněný postoj",
      "description": "Máš odolnost vůči bleskovému zranění."
    },
    "Surge Casting": {
      "name": "Sesílání výbojem",
      "description": "Dvakrát za odpočinek můžeš po seslání úrovňového éterického umění seslat trik bonusovou akcí."
    },
    "Power the Works": {
      "name": "Energie pro stroje",
      "description": "Svým dotykem uvedeš libovolný stroj do chodu bez paliva na 1 hodinu; za dlouhý odpočinek tolikrát, kolik činí oprava Charismatu."
    },
    "Capacitor Soul": {
      "name": "Duše kondenzátoru",
      "description": "Jednou za dlouhý odpočinek, když tě zasáhne bleskový či éterický účinek, můžeš jej reakcí pohltit bez zranění a obnovit pozici kouzla 1. úrovně."
    },
    "Storm Step": {
      "name": "Bouřný krok",
      "description": "Jednou za odpočinek se bonusovou akcí proměníš v praskající energii a přesuneš se 30 stop skrze tvory i předměty."
    },
    "Overcharge": {
      "name": "Přetížení",
      "description": "Jednou za dlouhý odpočinek škodlivé éterické umění způsobí maximální zranění, ale utrpíš 1k10 bleskového zranění."
    },
    "Aetheric Battery": {
      "name": "Éterická baterie",
      "description": "Jednou za dlouhý odpočinek obnovíš utracené úrovně pozic kouzel v součtu do výše opravy Charismatu."
    },
    "Lightning Rod": {
      "name": "Bleskosvod",
      "description": "Jsi imunní vůči bleskovému zranění a Galvanický výboj je stále aktivní."
    },
    "The Grid Bows": {
      "name": "Síť se podřídí",
      "description": "Stroje a konstrukti mají nevýhodu k záchranám proti tvým éterickým uměním."
    },
    "Living Dynamo": {
      "name": "Živé dynamo",
      "description": "Jednou za dlouhý odpočinek po 1 minutu nestojí tvá éterická umění nejvýše 3. úrovně pozice kouzel."
    },
    "Dynamo Spark": {
      "name": "Jiskra dynama",
      "description": "Jednou za tah přičteš opravu Charismatu jako bleskové zranění k jednomu škodlivému éterickému umění."
    },
    "Chain Arc": {
      "name": "Řetězový oblouk",
      "description": "Jednou za odpočinek přeskakuje bleskové umění zaměřené na jediný cíl na druhý cíl do 15 stop za poloviční zranění."
    },
    "Tempest Shell": {
      "name": "Bouřný krunýř",
      "description": "Jednou za dlouhý odpočinek vytvoříš na 1 minutu vířící bouřný štít: máš +2 k OČ a útočníci nablízko utrpí 2k8 bleskového zranění."
    },
    "Heart of the Storm": {
      "name": "Srdce bouře",
      "description": "Tvá blesková umění ignorují odolnost vůči bleskům a imunitu považují za odolnost."
    }
  },
  "steam_knight": {
    "Boiler Plate": {
      "name": "Kotelní pláty",
      "description": "Naladěná zbroj ti dá +1 k OČ a dokud jsi při vědomí, nemůžeš být odstrčen."
    },
    "Piston Strike": {
      "name": "Pístový úder",
      "description": "Jednou za tah způsobíš zásahem nablízko navíc 1k6 drtivého zranění písty."
    },
    "Head of Steam": {
      "name": "Nárůst tlaku",
      "description": "Bonusovou akcí zvýšíš tlak; tvůj příští Pístový úder v tomto tahu způsobí navíc 2k6 zranění místo obvyklého bonusu."
    },
    "Order of the Boiler": {
      "name": "Kotelní řád",
      "description": "Vybereš si rytířský řád (podpovolání)."
    },
    "Extra Attack": {
      "name": "Další útok",
      "description": "Při akci Útok zaútočíš dvakrát."
    },
    "Steam Vent": {
      "name": "Výron páry",
      "description": "Jednou za odpočinek musí sousední tvorové uspět v záchraně na Odolnost, jinak jsou opařující mlhou oslepeni do tvého příštího tahu."
    },
    "Locomotive Charge": {
      "name": "Lokomotivní náraz",
      "description": "Po přesunu alespoň 15 stop přímo k cíli a zásahu musí cíl uspět v záchraně na Sílu, jinak spadne na zem."
    },
    "Pressure Seal": {
      "name": "Tlakové těsnění",
      "description": "Máš výhodu k záchranám proti jedovatým plynům a topení; zbroj může být 10 minut vzduchotěsná."
    },
    "Reinforced Boiler": {
      "name": "Vyztužený kotel",
      "description": "Kotelní pláty dávají +2 k OČ a máš odolnost vůči ohnivému zranění."
    },
    "Extra Attack (2)": {
      "name": "Další útok (2)",
      "description": "Při akci Útok můžeš zaútočit třikrát."
    },
    "Emergency Release": {
      "name": "Nouzové upuštění",
      "description": "Jednou za odpočinek při pádu pod polovinu životů vypustíš páru: útočníci do 10 stop utrpí 3k8 ohnivého zranění; úspěšná záchrana na Obratnost půlí."
    },
    "Juggernaut Frame": {
      "name": "Rám obra",
      "description": "Tvou rychlost nelze snížit a obtížný terén tě ve zbroji nezpomaluje."
    },
    "Piston Barrage": {
      "name": "Pístová palba",
      "description": "Pístový úder platí při každém zásahu nablízko, nikoli jen jednou za tah."
    },
    "Adamant Boiler": {
      "name": "Adamantinový kotel",
      "description": "Kritické zásahy proti tobě se mění na běžné zásahy."
    },
    "Full Throttle": {
      "name": "Plný výkon",
      "description": "Jednou za dlouhý odpočinek se ti na 1 minutu zdvojnásobí rychlost a v každém tahu získáš dodatečnou akci; po skončení utrpíš 3k10 ohnivého zranění."
    },
    "The Engine Eternal": {
      "name": "Věčný stroj",
      "description": "Dokud jsi při vědomí a máš méně než polovinu životů, na začátku každého tahu si obnovíš 5 životů; Nárůst tlaku je jednou za tah zdarma."
    },
    "Hold the Line": {
      "name": "Držet linii",
      "description": "Pro nepřátele je prostor v dosahu tvých útoků obtížným terénem."
    },
    "Shield Coupling": {
      "name": "Spojení štítů",
      "description": "Pokud držíš štít, sousední spojenci mají +1 k OČ."
    },
    "Intercept Protocol": {
      "name": "Zachycovací protokol",
      "description": "Reakcí si vyměníš místo se sousedním spojencem, proti němuž směřuje útok; útok zasáhne místo něj tebe."
    },
    "Bulwark Advance": {
      "name": "Postupující hradba",
      "description": "Spojenci za tebou mají proti útokům na dálku tříčtvrteční kryt."
    },
    "Unbreakable Vanguard": {
      "name": "Nezlomný předvoj",
      "description": "Jednou za dlouhý odpočinek po 1 minutu máš ty i sousední spojenci odolnost vůči všemu zranění."
    }
  }
};
