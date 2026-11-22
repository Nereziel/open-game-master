// Full Czech player-facing rules for original cyberpunk class features.
// English keys are retained for the engine and saved sheets.
export const FEATURES_CS_CYBERPUNK: Readonly<Record<string,Record<string,{name:string;description:string}>>> = {
  "netrunner": {
    "Deck Interface": {
      "name": "Rozhraní cyberdecku",
      "description": "Sesíláš kouzla ze seznamu kouzelníka jako infiltrační programy pomocí Inteligence; cyberdeck je povinným ohniskem."
    },
    "Hot-Sim Focus": {
      "name": "Soustředění horké simulace",
      "description": "Známý program se značkou rituálu spustíš za 10 minut bez spotřeby pozice kouzla."
    },
    "Runner Protocol": {
      "name": "Protokol síťového běžce",
      "description": "Vybereš si netrunnerský protokol (podpovolání)."
    },
    "Signal Tap": {
      "name": "Odposlech signálu",
      "description": "Jednou za odpočinek odposlechneš libovolnou elektronickou nebo magickou komunikaci do 100 stop."
    },
    "Ghost in the Feed": {
      "name": "Duch v přenosu",
      "description": "Máš výhodu k Plížení proti kamerám, senzorům a konstruktům."
    },
    "Daemon Cache": {
      "name": "Mezipaměť démonů",
      "description": "Uložíš jeden program 1.–3. úrovně a jednou za dlouhý odpočinek jej spustíš bez pozice kouzla."
    },
    "Overwatch": {
      "name": "Dohled",
      "description": "Dvakrát za odpočinek reakcí uložíš nevýhodu útoku proti spojenci, kterého vidíš."
    },
    "Deep-Dive Rig": {
      "name": "Hlubinné připojení",
      "description": "Na 10 minut promítneš své smysly do libovolného síťového zařízení do jedné míle."
    },
    "Daemon Cache (2 programs)": {
      "name": "Mezipaměť démonů (2 programy)",
      "description": "Mezipaměť pojme dva programy 1.–5. úrovně."
    },
    "Black Market Firmware": {
      "name": "Firmware z černého trhu",
      "description": "Naučíš se dva programy z libovolného seznamu kouzel; pro tebe patří do seznamu kouzelníka."
    },
    "Neural Firewall": {
      "name": "Neuronový firewall",
      "description": "Máš výhodu k záchranám na Inteligenci, Moudrost a Charisma proti kouzlům a psionice."
    },
    "Root Access": {
      "name": "Kořenový přístup",
      "description": "Jednou za dlouhý odpočinek ovládneš konstrukt nebo síťový systém na 1 minutu; úspěšná záchrana na Inteligenci tomu zabrání."
    },
    "The Net Remembers": {
      "name": "Síť si pamatuje",
      "description": "Jednou denně po krátkém odpočinku obnovíš čtyři úrovně utracených pozic kouzel."
    },
    "ICE Pick": {
      "name": "Prolomení ochrany ICE",
      "description": "Reakcí na nepřátelský program či kouzlo proti sobě získáš +2 k OČ nebo +2 k příslušné záchraně."
    },
    "Lethal Payload": {
      "name": "Smrtící náklad",
      "description": "Jednou za tah jeden cíl tvého škodlivého programu utrpí navíc 1k8 bleskového zranění."
    },
    "Counter-Intrusion": {
      "name": "Protiinfiltrace",
      "description": "Když uspěješ v záchraně proti kouzlu, způsobíš sesilateli 2k8 psychického zranění."
    },
    "Flatline Protocol": {
      "name": "Protokol smrti spojení",
      "description": "Tvé programy mají proti konstruktům a sesilatelům kritický zásah při hodu 19–20."
    },
    "Daemon Swarm": {
      "name": "Hejno démonů",
      "description": "Jednou za dlouhý odpočinek rozdělíš jeden škodlivý program zaměřený na jediný cíl mezi až tři cíle."
    }
  },
  "street_samurai": {
    "Chrome Reflexes": {
      "name": "Chromové reflexy",
      "description": "K iniciativě máš +2 a dokud jsi při vědomí, nemůžeš být překvapený."
    },
    "Combat Wetware": {
      "name": "Bojový wetware",
      "description": "Vyber jednu výhodu: +2 k útokům na dálku, +1 k OČ v lehké či střední zbroji, nebo +2 ke zranění nablízko."
    },
    "Adrenal Override": {
      "name": "Adrenalinové přepnutí",
      "description": "Jednou za krátký odpočinek můžeš ve svém tahu provést jednu dodatečnou akci."
    },
    "Edge Discipline": {
      "name": "Disciplína ostří",
      "description": "Vybereš si bojovou disciplínu (podpovolání)."
    },
    "Extra Attack": {
      "name": "Další útok",
      "description": "Při použití akce Útok zaútočíš dvakrát."
    },
    "Subdermal Plating": {
      "name": "Podkožní pláty",
      "description": "Pokud nenosíš těžkou zbroj, získáš +1 k OČ."
    },
    "Target Lock": {
      "name": "Zaměření cíle",
      "description": "Bonusovou akcí označíš viditelného protivníka a tvé útoky proti němu způsobují o 2 zranění více."
    },
    "Indomitable Firmware": {
      "name": "Nezlomný firmware",
      "description": "Jednou za dlouhý odpočinek přehodíš neúspěšný záchranný hod."
    },
    "Reflex Booster II": {
      "name": "Posilovač reflexů II",
      "description": "Bonus k iniciativě se zvyšuje na +4."
    },
    "Extra Attack (2)": {
      "name": "Další útok (2)",
      "description": "Při použití akce Útok zaútočíš třikrát."
    },
    "Bullet Time": {
      "name": "Zpomalený čas",
      "description": "Třikrát za dlouhý odpočinek reakcí získáš +3 k OČ proti jednomu viditelnému útoku na dálku."
    },
    "Adrenal Override (2 uses)": {
      "name": "Adrenalinové přepnutí (2 použití)",
      "description": "Adrenalinové přepnutí použiješ dvakrát za krátký odpočinek."
    },
    "Chrome Constitution": {
      "name": "Chromová odolnost",
      "description": "Máš výhodu k záchranám na Odolnost a odolnost vůči jedovému zranění."
    },
    "Killing Instinct": {
      "name": "Instinkt zabijáka",
      "description": "Tvé útoky zbraněmi jsou kritické při hodu 19–20."
    },
    "Wired Soul": {
      "name": "Drátovaná duše",
      "description": "Jednou za dlouhý odpočinek si při méně než polovině životů bonusovou akcí obnovíš 10 + svou úroveň životů."
    },
    "Apex Predator": {
      "name": "Vrcholový predátor",
      "description": "Jednou za tah získáš okamžitý dodatečný útok zbraní, když nepřítele srazíš na 0 životů."
    },
    "Twin Chrome": {
      "name": "Dvojité chromové ostří",
      "description": "Při boji dvěma čepelemi přičítáš opravu vlastnosti ke zranění druhé ruky a máš +1 k OČ."
    },
    "Whirl of Edges": {
      "name": "Víření čepelí",
      "description": "Jeden svůj útok nahradíš rotačním sekem, který způsobí zranění zbraní každému nepříteli do 5 stop."
    },
    "Afterimage": {
      "name": "Doznívající obraz",
      "description": "Úprk nebo Odpoutání můžeš provést bonusovou akcí a příležitostné útoky proti tobě mají nevýhodu."
    },
    "Storm of Blades": {
      "name": "Bouře čepelí",
      "description": "Jednou za dlouhý odpočinek po 1 minutu provádíš v každém svém tahu jeden dodatečný útok čepelí."
    }
  },
  "rigger": {
    "Drone Companion": {
      "name": "Droní společník",
      "description": "Malý dron poslouchá tvé příkazy: OČ 13, životy 5 + tvá úroveň, rychlost 30 stop; jedná na tvůj pokyn."
    },
    "Jury-Rig": {
      "name": "Nouzová oprava",
      "description": "Dvakrát za dlouhý odpočinek desetiminutovým kutěním opravíš rozbité zařízení nebo uživateli nástrojů udělíš +1k4 na 1 hodinu."
    },
    "Machine Codex": {
      "name": "Kodex strojů",
      "description": "Sesíláš kouzla ze seznamu kouzelníka jako rutiny dronů pomocí Inteligence; dron je tvým ohniskem."
    },
    "Remote Eyes": {
      "name": "Vzdálené oči",
      "description": "Dokud je dron do 100 stop, můžeš jeho prostřednictvím vidět a slyšet."
    },
    "Rig Specialization": {
      "name": "Specializace soupravy",
      "description": "Vybereš si specializaci droní soupravy (podpovolání)."
    },
    "Drone Swarm": {
      "name": "Roj dronů",
      "description": "Získáš druhého drona; všechny své drony ovládáš jedinou akcí."
    },
    "Signal Boost": {
      "name": "Zesílený signál",
      "description": "Dosah velení dronům a Vzdálených očí se prodlužuje na jednu míli."
    },
    "Overclocked Servos": {
      "name": "Přetaktovaná serva",
      "description": "Droni přičítají tvou opravu Inteligence ke svému zranění."
    },
    "Self-Repair Protocol": {
      "name": "Protokol samoopravy",
      "description": "Každý dron si jednou za odpočinek na začátku tvého tahu obnoví 2k6 životů."
    },
    "Hardened Uplink": {
      "name": "Zabezpečené spojení",
      "description": "Máš výhodu k záchranám proti účinkům, které by přerušily či unesly ovládání tvých dronů."
    },
    "Improved Chassis": {
      "name": "Vylepšený podvozek",
      "description": "Droni získají OČ 16 a životy 15 + dvojnásobek tvé úrovně."
    },
    "Backup Frame": {
      "name": "Záložní rám",
      "description": "Zničeného drona zdarma postavíš při dlouhém odpočinku nebo jednou denně během 1 minuty."
    },
    "Omni-Tool Mastery": {
      "name": "Mistrovství univerzálních nástrojů",
      "description": "Nouzová oprava má čtyři použití a ovlivní i magická či exotická zařízení."
    },
    "Drone Legion": {
      "name": "Legie dronů",
      "description": "K roji se přidá třetí dron."
    },
    "Master Uplink": {
      "name": "Mistrovské spojení",
      "description": "Dronům můžeš velet bonusovou akcí."
    },
    "Ghost Protocol": {
      "name": "Duchový protokol",
      "description": "Jednou za dlouhý odpočinek učiníš jednoho drona na 1 minutu neviditelným."
    },
    "Deus in Machina": {
      "name": "Bůh ve stroji",
      "description": "Jednou za dlouhý odpočinek po 1 minutu droni jednají samostatně a skrze každého můžeš seslat jednu rutinu."
    },
    "Combat Chassis": {
      "name": "Bojový podvozek",
      "description": "Primární dron získá zbraň: na tvůj povel útočí a způsobuje 1k8 + oprava Inteligence silového zranění."
    },
    "Evasive Subroutines": {
      "name": "Úhybné podprogramy",
      "description": "Droni utrpí poloviční zranění z plošných účinků, při úspěšné záchraně na Obratnost žádné."
    },
    "Twinned Strike": {
      "name": "Dvojitý úder",
      "description": "Když přikážeš útok, zaútočí dva droni."
    },
    "Titan Frame": {
      "name": "Titánský rám",
      "description": "Primárnímu dronovi se zdvojnásobí životy, způsobuje navíc 1k8 zranění a může nést jezdce."
    }
  },
  "fixer": {
    "Street Contacts": {
      "name": "Pouliční kontakty",
      "description": "Jednou za dlouhý odpočinek požádáš o laskavost: výbavu, odvoz, jméno či vstup na místo; rozsah určí PJ."
    },
    "Grease the Wheels": {
      "name": "Promazání soukolí",
      "description": "Jednou za krátký odpočinek přehodíš neúspěšné ověření založené na Charismatu."
    },
    "Expertise": {
      "name": "Odbornost",
      "description": "U dvou zdatných dovedností zdvojnásobíš zdatnostní bonus."
    },
    "Slippery": {
      "name": "Kluzký únik",
      "description": "Odpoutání nebo Schování můžeš provést bonusovou akcí."
    },
    "The Operation": {
      "name": "Operace",
      "description": "Vybereš si způsob činnosti (podpovolání)."
    },
    "Favor Network": {
      "name": "Síť protislužeb",
      "description": "Pouliční kontakty mají dvě použití a dosáhnou i na kontakty v jiných městech."
    },
    "Silver Ledger": {
      "name": "Stříbrná účetní kniha",
      "description": "Prodáváš zboží za plnou cenu a během dne vždy najdeš kupce nebo prodávajícího."
    },
    "Exit Strategy": {
      "name": "Úniková strategie",
      "description": "Při hodu na iniciativu se přesuneš až o svou rychlost, aniž vyvoláš příležitostné útoky."
    },
    "Word on the Street": {
      "name": "Hlas ulice",
      "description": "Hodinovým vyptáváním zjistíš, kde se nachází konkrétní místní osoba nebo s kým nedávno jednala."
    },
    "Expertise (2 more skills)": {
      "name": "Odbornost (další dvě dovednosti)",
      "description": "Zdvojnásobíš zdatnostní bonus v dalších dvou zdatných dovednostech."
    },
    "The Big Favor": {
      "name": "Velká laskavost",
      "description": "Jednou týdně pro tebe kontakt vykoná skutečně nebezpečnou službu."
    },
    "Neutral Ground": {
      "name": "Neutrální půda",
      "description": "Tvor, který přijme tvou nabídku jednání, tě nemůže napadnout do tvého příštího tahu."
    },
    "Grease the Wheels (3 uses)": {
      "name": "Promazání soukolí (3 použití)",
      "description": "Promazání soukolí má tři použití za krátký odpočinek."
    },
    "Shadow Network": {
      "name": "Stínová síť",
      "description": "Pouliční kontakty mají tři použití a protislužby dorazí za polovinu běžné doby."
    },
    "Everyone Owes You": {
      "name": "Každý ti něco dluží",
      "description": "Jednou za dlouhý odpočinek ti PJ prozradí užitečné tajemství o osobě, se kterou mluvíš."
    },
    "Master of the Board": {
      "name": "Mistr šachovnice",
      "description": "Ty a spojenci do 30 stop přičítáte 1k4 k ověřením založeným na Charismatu."
    },
    "Kingpin": {
      "name": "Král podsvětí",
      "description": "Jednou za dlouhý odpočinek určíš kontakt kdekoli na světě; jedna přiměřená laskavost automaticky vyjde."
    },
    "Dossier": {
      "name": "Složka informací",
      "description": "Po minutě pozorování tvora zjistíš jednu jeho hodnotu, slabinu nebo odolnost."
    },
    "Ear to the Ground": {
      "name": "Ucho na zemi",
      "description": "Máš výhodu k Pátrání při shromažďování informací."
    },
    "Blackmail Files": {
      "name": "Vyděračské spisy",
      "description": "Máš výhodu k ověřením Charismatu proti komukoli, jehož tajemství znáš."
    },
    "Web of Whispers": {
      "name": "Síť šeptandy",
      "description": "Vždy se dozvíš, když se někdo ve městě vyptává na tebe nebo tvou partu."
    },
    "Oracle of the Streets": {
      "name": "Věštec ulic",
      "description": "Jednou za dlouhý odpočinek položíš PJ tři otázky o místních lidech, místech či událostech a dostaneš stručné pravdivé odpovědi."
    }
  },
  "esper": {
    "Wetware Surge": {
      "name": "Výboj wetwaru",
      "description": "Sesíláš kouzla ze seznamu čaroděje jako psionické schopnosti pomocí Charismatu a nepotřebuješ materiální ohnisko."
    },
    "Static Shield": {
      "name": "Statický štít",
      "description": "Jednou za krátký odpočinek získáš bonusovou akcí +2 k OČ do začátku příštího tahu."
    },
    "Psi Font": {
      "name": "Psionický zdroj",
      "description": "Po krátkém odpočinku obnovíš jednu pozici kouzla 1. úrovně."
    },
    "Telekinetic Grip": {
      "name": "Telekinetický stisk",
      "description": "Neviditelnou telekinetickou rukou do 30 stop ovládáš předměty do hmotnosti 10 liber."
    },
    "Surge Momentum": {
      "name": "Setrvačnost výboje",
      "description": "Dvakrát za odpočinek můžeš po seslání úrovňové psionické schopnosti seslat trik bonusovou akcí."
    },
    "Kinetic Buffer": {
      "name": "Kinetický nárazník",
      "description": "Máš odolnost vůči zranění pádem a jednou za tah můžeš po zásahu psionikou odstrčit cíl o 10 stop."
    },
    "Thought Shield": {
      "name": "Myšlenkový štít",
      "description": "Nikdo ti nedokáže číst myšlenky; máš +2 k záchranám na Moudrost."
    },
    "Psychic Flight": {
      "name": "Psychický let",
      "description": "Jednou za dlouhý odpočinek dokážeš 10 minut létat rychlostí 30 stop."
    },
    "Split Focus": {
      "name": "Rozdělená pozornost",
      "description": "Máš výhodu k záchranám na udržení soustředění."
    },
    "Overmind": {
      "name": "Nadmysl",
      "description": "Jednou za dlouhý odpočinek obnovíš úrovně utracených pozic kouzel v součtu do výše opravy Charismatu."
    },
    "Reality Rend": {
      "name": "Roztržení reality",
      "description": "Jednou za dlouhý odpočinek tvá příští škodlivá psionická schopnost způsobí maximální zranění."
    },
    "Ascendant Mind": {
      "name": "Vzestoupená mysl",
      "description": "Jsi imunní vůči psychickému zranění a čtení myšlenek."
    },
    "Singularity": {
      "name": "Singularita",
      "description": "Jednou za dlouhý odpočinek sešleš psionickou schopnost nejvýše 5. úrovně zdarma na dva cíle."
    },
    "Neural Spike": {
      "name": "Neuronový bodec",
      "description": "Jednou za tah přičteš opravu Charismatu k psychickému zranění jedné škodlivé psionické schopnosti."
    },
    "Feedback Loop": {
      "name": "Zpětná vazba",
      "description": "Reakcí při zranění způsobíš útočníkovi psychické zranění ve výši opravy Charismatu."
    },
    "Synaptic Overload": {
      "name": "Synaptické přetížení",
      "description": "Jednou za dlouhý odpočinek musí tvor zasažený tvou psionikou uspět v záchraně na Moudrost, jinak je omráčen do tvého příštího tahu."
    },
    "Mind Fortress": {
      "name": "Pevnost mysli",
      "description": "Máš odolnost vůči psychickému zranění a výhodu k záchranám proti okouzlení a strachu."
    }
  },
  "trauma_doc": {
    "Stim Injector": {
      "name": "Stimulační injektor",
      "description": "Bonusovou akcí dotykem obnovíš spojenci 1k6 + oprava Moudrosti životů, tolikrát za dlouhý odpočinek, kolik činí oprava Moudrosti."
    },
    "Triage Protocol": {
      "name": "Třídicí protokol",
      "description": "Prohlédnutím tvora zjistíš přibližné životy, stavy a nemoci."
    },
    "Nanomed Suite": {
      "name": "Nanomedicínská souprava",
      "description": "Sesíláš kouzla ze seznamu klerika jako injekce nanoléčiv pomocí Moudrosti."
    },
    "Specialty": {
      "name": "Specializace",
      "description": "Vybereš si zdravotnickou specializaci (podpovolání)."
    },
    "Field Surgeon": {
      "name": "Polní chirurg",
      "description": "Stabilizuješ bonusovou akcí; tvor stabilizovaný tebou se po minutě probudí s 1 životem."
    },
    "Boosted Dosage": {
      "name": "Zvýšená dávka",
      "description": "Stimulační injektor léčí 2k6 + oprava Moudrosti životů."
    },
    "Immuno-Shield": {
      "name": "Imunitní štít",
      "description": "Ty a spojenci do 5 stop máte výhodu k záchranám proti jedům a nemocem."
    },
    "Adrenal Protocol": {
      "name": "Adrenalinový protokol",
      "description": "Spojenec, kterému aplikuješ stimulant, může zdarma vstát a ujít polovinu své rychlosti."
    },
    "Miracle Worker": {
      "name": "Zázračný lékař",
      "description": "Jednou za dlouhý odpočinek spojenci s 0 životy do 30 stop okamžitě obnovíš 3k6 + oprava Moudrosti životů."
    },
    "Stim Injector (ranged)": {
      "name": "Stimulační injektor na dálku",
      "description": "Stimulační injektor léčí 3k6 + oprava Moudrosti a můžeš jej vystřelit jako šipku do 30 stop."
    },
    "Nanite Reserve": {
      "name": "Nanodávková rezerva",
      "description": "Jednou denně po krátkém odpočinku obnovíš jednu utracenou pozici kouzla nejvýše 3. úrovně."
    },
    "Combat Calm": {
      "name": "Bojový klid",
      "description": "Ty a spojenci do 10 stop máte výhodu proti vystrašení."
    },
    "Autodoc Implant": {
      "name": "Implantovaný autolékař",
      "description": "Při méně než polovině životů si na začátku tahu obnovuješ životy ve výši opravy Moudrosti, nejvýše pět kol za dlouhý odpočinek."
    },
    "Perfected Formula": {
      "name": "Dokonalá receptura",
      "description": "Každá kostka tvého léčení se počítá nejméně jako polovina svého maxima."
    },
    "Plague Breaker": {
      "name": "Ničitel nákaz",
      "description": "Jednou za krátký odpočinek dotykem vyléčíš libovolnou nemoc, otravu, slepotu, hluchotu či ochromení."
    },
    "Lazarus Protocol": {
      "name": "Lazarův protokol",
      "description": "Jednou týdně oživíš tvora mrtvého méně než minutu s polovinou jeho životů."
    },
    "Under Fire": {
      "name": "Pod palbou",
      "description": "Při pohybu k padlému spojenci můžeš provést Úprk či Odpoutání bonusovou akcí."
    },
    "Shield the Fallen": {
      "name": "Ochrana padlého",
      "description": "Když sousedíš se spojencem na 0 životů, mají útoky proti tobě nevýhodu."
    },
    "Extraction": {
      "name": "Evakuace",
      "description": "Spojence neseš či táhneš plnou rychlostí a spojenci, které stabilizuješ či léčíš, získají 1k6 dočasných životů."
    },
    "Covering Stim": {
      "name": "Krycí stimulant",
      "description": "Spojenec, kterého vyléčíš, získá +2 k OČ do začátku tvého příštího tahu."
    },
    "One More Dawn": {
      "name": "Ještě jeden úsvit",
      "description": "Jednou za dlouhý odpočinek spojenec do 30 stop při poklesu na 0 životů místo toho zůstane na 1."
    }
  }
};
