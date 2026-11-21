// Full Czech player-facing rules for original horror class features.
// English keys are retained for the engine and saved sheets.
export const FEATURES_CS_HORROR: Readonly<Record<string,Record<string,{name:string;description:string}>>> = {
  "exorcist": {
    "Rite of Repulsion": {
      "name": "Obřad odpuzování",
      "description": "Akcí přinutíš běsy, nemrtvé a duchy do 30 stop uspět v záchraně na Moudrost, jinak se od tebe musí 1 minutu vzdalovat. Za dlouhý odpočinek použiješ tolikrát, kolik činí oprava Moudrosti."
    },
    "Consecrated Tools": {
      "name": "Posvěcené nástroje",
      "description": "Tvé útoky zbraní se proti běsům, nemrtvým a duchům považují za magické."
    },
    "Liturgy": {
      "name": "Liturgie",
      "description": "Sesíláš kouzla ze seznamu klerika jako obřady pomocí Moudrosti; ohniskem je svatý symbol nebo obřadní sada."
    },
    "Order": {
      "name": "Řád",
      "description": "Vybereš si exorcistický řád (podpovolání)."
    },
    "Sanctified Ground": {
      "name": "Posvěcená zem",
      "description": "Desetiminutovým rituálem ochráníš oblast 30 stop na 8 hodin; nepřátelští duchové jsou při vstupu viditelní a utrpí 1k8 zářivého zranění."
    },
    "Read the Possession": {
      "name": "Odhalení posednutí",
      "description": "Na pohled poznáš posednutí, strašení a kletby i druh jména a cíl působící entity."
    },
    "Litany of Defense": {
      "name": "Litanie ochrany",
      "description": "Ty a spojenci do 10 stop máte výhodu k záchranám proti strachu a posednutí."
    },
    "Binding Words": {
      "name": "Spoutávající slova",
      "description": "Jednou za dlouhý odpočinek je duch nebo běs, který neuspěje proti Obřadu odpuzování, navíc na 1 minutu zadržen."
    },
    "Voice of Authority": {
      "name": "Hlas autority",
      "description": "Obřad odpuzování působí i na tvory imunní vůči vystrašení."
    },
    "Greater Rite": {
      "name": "Vyšší obřad",
      "description": "Když Obřad odpuzování začne působit, postižený tvor utrpí 2k8 zářivého zranění."
    },
    "Anathema": {
      "name": "Zapovězené",
      "description": "Jednou za tah způsobíš zásahem zbraní proti běsu, nemrtvému či duchovi navíc 2k8 zářivého zranění."
    },
    "Unshakeable Faith": {
      "name": "Neotřesitelná víra",
      "description": "Jsi imunní vůči vystrašení a máš výhodu k záchranám proti okouzlení."
    },
    "Rite of Severance": {
      "name": "Obřad odloučení",
      "description": "Jednou za dlouhý odpočinek minutovým rituálem vypudíš posedávající entitu z hostitele; soutěžíte v Moudrosti a máš výhodu."
    },
    "Sacred Bulwark": {
      "name": "Svatá hradba",
      "description": "Máš odolnost vůči nekrotickému a psychickému zranění."
    },
    "Final Benediction": {
      "name": "Poslední požehnání",
      "description": "Jednou za dlouhý odpočinek při pádu spojence do 30 stop na 0 životů místo toho zůstane na životě s pěti násobkem tvé opravy Moudrosti."
    },
    "The Unhosted Word": {
      "name": "Slovo bez hostitele",
      "description": "Jednou za dlouhý odpočinek vypudíš běsa, nemrtvého nebo ducha s nebezpečností nejvýše 15 do jeho domovské sféry; úspěšná záchrana na Charisma účinek zruší."
    },
    "Candlelight Vigil": {
      "name": "Bdění při svíčce",
      "description": "Bonusovou akcí zažehneš na 1 minutu ochranné světlo; spojenci do 10 stop přičítají 1k4 k záchranám proti nadpřirozeným účinkům."
    },
    "Wax and Wick": {
      "name": "Vosk a knot",
      "description": "Posvěcení země ti zabere 1 minutu místo 10."
    },
    "Light Against the Dark": {
      "name": "Světlo proti temnotě",
      "description": "Tvé světlo odhaluje neviditelné a éterické tvory do 10 stop."
    },
    "Unguttering Flame": {
      "name": "Nehasnoucí plamen",
      "description": "Při Bdění při svíčce nemohou být ty ani spojenci v jejím dosahu posednuti a máte odolnost vůči nekrotickému zranění."
    },
    "The Last Candle": {
      "name": "Poslední svíce",
      "description": "Jednou za dlouhý odpočinek při poklesu na 0 životů zůstaneš na 1 a tvé ochranné světlo se znovu rozhoří s dvojnásobným dosahem."
    }
  },
  "occultist": {
    "Forbidden Lore": {
      "name": "Zakázané vědění",
      "description": "Při ověřeních Magie a Náboženství zdvojnásobuješ zdatnostní bonus."
    },
    "Warding Sigil": {
      "name": "Ochranný znak",
      "description": "Za 1 minutu nakreslíš křídou ochranu dveří či pětistopé linie na 8 hodin. První nepřítel, který ji překročí, utrpí 2k6 psychického zranění, úspěšná záchrana na Inteligenci půlí."
    },
    "Pact of the Page": {
      "name": "Úmluva stránky",
      "description": "Sesíláš kouzla ze seznamu černokněžníka jako invokace pomocí Inteligence; ohniskem je grimoár."
    },
    "The Patronless Path": {
      "name": "Cesta bez patrona",
      "description": "Vybereš si okultní disciplínu (podpovolání)."
    },
    "Whispered Names": {
      "name": "Šeptaná jména",
      "description": "Znáš-li pravé či používané jméno tvora, máš v každém boji výhodu k prvnímu útoku kouzlem proti němu nebo jeho první záchrana proti tvému kouzlu má nevýhodu."
    },
    "Borrowed Eyes": {
      "name": "Vypůjčené oči",
      "description": "Jednou za odpočinek vidíš po 1 minutu očima tvora, kterého vidíš; úspěšná záchrana na Moudrost to zruší."
    },
    "Ink-Stained Mind": {
      "name": "Mysl potřísněná inkoustem",
      "description": "Máš výhodu k záchranám proti šílenství, okouzlení a strachu vyvolaným aberacemi či běsy."
    },
    "Rite of the Threshold": {
      "name": "Obřad prahu",
      "description": "Ochranný znak může pokrýt poloměr 15 stop a rovněž brání éterickému průchodu."
    },
    "Marginalia": {
      "name": "Poznámky na okraji",
      "description": "Naučíš se dva rituály z libovolného seznamu kouzel; můžeš je sesílat jen jako rituály."
    },
    "The Debt Comes Due": {
      "name": "Dluh je splatný",
      "description": "Jednou za dlouhý odpočinek po utracení poslední pozice kouzla tuto pozici okamžitě obnovíš."
    },
    "Apocrypha": {
      "name": "Apokryfy",
      "description": "Naučíš se jedno kouzlo černokněžníka 6. úrovně a jednou za dlouhý odpočinek je sešleš bez pozice."
    },
    "Unblinking Study": {
      "name": "Neúnavné studium",
      "description": "Aberace, běsi a nemrtví tě nemohou překvapit."
    },
    "Palimpsest Soul": {
      "name": "Palimpsest duše",
      "description": "Máš odolnost vůči psychickému zranění a nikdo ti bez svolení nedokáže číst myšlenky."
    },
    "Seventh Seal": {
      "name": "Sedmá pečeť",
      "description": "Naučíš se jedno kouzlo černokněžníka 7. úrovně a jednou za dlouhý odpočinek je sešleš bez pozice."
    },
    "The Final Chapter": {
      "name": "Poslední kapitola",
      "description": "Jednou za dlouhý odpočinek přehodíš libovolnou právě hozenou kostku svou nebo tvora do 60 stop; nový výsledek platí."
    },
    "Author of the Unwritten": {
      "name": "Autor nenapsaného",
      "description": "Jednou za dlouhý odpočinek bez pozice sešleš libovolné kouzlo černokněžníka nejvýše 5. úrovně a zacílíš je současně na dva cíle."
    },
    "Veilsight": {
      "name": "Vidění za závojem",
      "description": "Vidíš neviditelné a éterické tvory do 30 stop."
    },
    "Quiet the Voices": {
      "name": "Utišení hlasů",
      "description": "Jednou za odpočinek spojenec do 30 stop ukončí jeden účinek okouzlení, strachu nebo šílenství na sobě."
    },
    "Stitch the Tear": {
      "name": "Sešití trhliny",
      "description": "Jednou za dlouhý odpočinek akcí uzavřeš portál, přivolání či trhlinu nebezpečnosti nebo úrovně nejvýše 5."
    },
    "Walk Between": {
      "name": "Krok mezi světy",
      "description": "Jednou za dlouhý odpočinek se skrze závoj teleportuješ až 60 stop na viditelné místo."
    },
    "Warden of the Threshold": {
      "name": "Strážce prahu",
      "description": "Nikdo se bez tvého svolení nemůže teleportovat do ani z okruhu 30 stop kolem tebe."
    }
  },
  "survivor": {
    "Adrenaline Surge": {
      "name": "Adrenalinový nápor",
      "description": "Úprk, Odpoutání nebo Schování můžeš provést bonusovou akcí tolikrát za krátký odpočinek, kolik činí oprava Odolnosti."
    },
    "Won't Die Here": {
      "name": "Tady nezemřu",
      "description": "Jednou denně při poklesu na 0 životů zůstaneš na 1."
    },
    "Scrounger's Instinct": {
      "name": "Sběračský instinkt",
      "description": "Jednou za odpočinek najdeš poblíž běžný užitečný předmět, třeba zbraň, klíče či obvazy; o věrohodnosti rozhodne PJ."
    },
    "How They Made It": {
      "name": "Jak to přežili",
      "description": "Vybereš si způsob přežití (podpovolání)."
    },
    "Extra Attack": {
      "name": "Další útok",
      "description": "Při akci Útok můžeš zaútočit dvakrát."
    },
    "Read the Room": {
      "name": "Odhad situace",
      "description": "Máš výhodu k iniciativě; v prvním tahu odhalíš nejbezprostřednější nebezpečí na scéně."
    },
    "Pain Tolerance": {
      "name": "Odolnost vůči bolesti",
      "description": "Jednou za krátký odpočinek snížíš zranění jediného zásahu proti sobě na polovinu."
    },
    "Nine Lives": {
      "name": "Devět životů",
      "description": "Schopnost Tady nezemřu se obnovuje při dlouhém odpočinku a také na tobě ukončí jeden stav."
    },
    "Hypervigilant": {
      "name": "Přehnaná ostražitost",
      "description": "Dokud jsi při vědomí, nemůžeš být překvapen."
    },
    "Desperate Strength": {
      "name": "Zoufalá síla",
      "description": "Při méně než polovině životů máš +2 k hodům na útok a ověřením Síly a Obratnosti."
    },
    "Last One Out": {
      "name": "Poslední odejde",
      "description": "Když použiješ pohybové možnosti Adrenalinového náporu, spojenci do 10 stop mohou totéž provést reakcí; každý jednou za odpočinek."
    },
    "Seen Worse": {
      "name": "Už jsem zažil horší",
      "description": "Dokud tě vidí alespoň jeden spojenec, nemůžeš být vystrašený."
    },
    "Deep Reserves": {
      "name": "Skryté rezervy",
      "description": "Při hodu na iniciativu bez zbývajících použití Adrenalinového náporu si obnovíš všechna použití."
    },
    "Death's Old Acquaintance": {
      "name": "Starý známý smrti",
      "description": "Máš výhodu k záchranám proti smrti a k tvé stabilizaci není třeba ověření."
    },
    "Terminal Focus": {
      "name": "Soustředění na hraně",
      "description": "Jednou za dlouhý odpočinek odehraješ v prvním kole boje dva celé tahy."
    },
    "The One Who Lives": {
      "name": "Ten, kdo přežil",
      "description": "Tady nezemřu můžeš použít dvakrát denně a každé použití ti navíc obnoví životy v hodnotě pětinásobku opravy Odolnosti."
    },
    "Alone in the Dark": {
      "name": "Sám ve tmě",
      "description": "Není-li do 10 stop žádný spojenec, máš +1 k OČ a výhodu k Plížení."
    },
    "Grim Arithmetic": {
      "name": "Ponurý odhad",
      "description": "U každého viditelného tvora pod polovinou životů zjistíš přesný počet jeho zbývajících životů."
    },
    "Bitter Endurance": {
      "name": "Hořká výdrž",
      "description": "Jednou za dlouhý odpočinek při zahájení boje získáš dočasné životy ve výši dvojnásobku své úrovně."
    },
    "No Witnesses Left": {
      "name": "Nezůstali svědkové",
      "description": "Tvé útoky způsobují navíc 1k8 zranění tvorům, kteří v tomto boji srazili tvého spojence na 0 životů."
    },
    "Sole Survivor": {
      "name": "Jediný přeživší",
      "description": "Jsi-li posledním členem družiny při vědomí, máš odolnost vůči všem druhům zranění a dvojnásobnou rychlost."
    }
  },
  "slayer": {
    "Monster Lore": {
      "name": "Znalost nestvůr",
      "description": "Poté, co uvidíš tvora jednat, poznáš jednu jeho zranitelnost, odolnost či zvláštní obranu."
    },
    "Silvered Strikes": {
      "name": "Postříbřené údery",
      "description": "Tvé útoky zbraněmi se pro překonání odolností považují za postříbřené a magické."
    },
    "Hunter's Kit": {
      "name": "Lovcova výbava",
      "description": "Během odpočinku připravíš kolíky, solné linie a ochranné znaky; ochrana dá jednomu spojenci na jednu noc +2 k OČ proti jednomu typu nestvůr."
    },
    "Lodge": {
      "name": "Lóže",
      "description": "Vybereš si loveckou lóži (podpovolání)."
    },
    "Extra Attack": {
      "name": "Další útok",
      "description": "Při akci Útok útočíš dvakrát."
    },
    "Iron Stomach": {
      "name": "Železný žaludek",
      "description": "Máš výhodu k záchranám proti jedům, nemocem a kletbám."
    },
    "Quarry": {
      "name": "Kořist",
      "description": "Bonusovou akcí označíš tvora a způsobuješ mu útoky navíc 1k6 zranění, dokud nezemře."
    },
    "Flinchless": {
      "name": "Bez zachvění",
      "description": "Máš výhodu k záchranám proti strachu; spojenci do 10 stop si k nim přičítají 1k4."
    },
    "Tracker of the Strange": {
      "name": "Stopař podivností",
      "description": "Dokážeš vystopovat jakéhokoli tvora, který v posledním týdnu zabil, dokonce přes vodu či střechy."
    },
    "Improved Quarry": {
      "name": "Lepší kořist",
      "description": "Zranění označené Kořisti vzroste na 2k6 a označení je zdarma, pokud tvor ublíží spojenci."
    },
    "Called Shot": {
      "name": "Mířený zásah",
      "description": "Jednou za krátký odpočinek předem ohlásíš mířený útok; při zásahu cíl do tvého příštího tahu ztratí jeden způsob pohybu, útok nebo smysl."
    },
    "Veteran's Guard": {
      "name": "Ostražitost veterána",
      "description": "Máš +1 k OČ a příležitostné útoky proti tobě mají nevýhodu."
    },
    "Deathblow": {
      "name": "Smrtící rána",
      "description": "Kritické zásahy proti tvé Kořisti způsobují maximální zranění."
    },
    "One Against the Night": {
      "name": "Sám proti noci",
      "description": "Jednou za dlouhý odpočinek po dobu 1 minuty tvé útoky ignorují odolnost a imunitu vůči nemagickému zranění."
    },
    "The Long Hunt": {
      "name": "Dlouhý lov",
      "description": "Při lovu nemusíš spát a jednou týdně získáš krátkým odpočinkem výhody dlouhého odpočinku."
    },
    "Extinction": {
      "name": "Vyhubení",
      "description": "Jednou za tah smíš přehodit minutý útok proti Kořisti a můžeš současně označit dva tvory."
    },
    "Stake and Salt": {
      "name": "Kolík a sůl",
      "description": "Ochrany z Lovcovy výbavy pokrývají celou družinu a během odpočinku připravíš dvě."
    },
    "Vampiric Scholar": {
      "name": "Znalec upírů",
      "description": "Máš výhodu k ověřením určení a znalostí o nemrtvých a měňavcích."
    },
    "Piercing the Heart": {
      "name": "Proražené srdce",
      "description": "Kritické zásahy proti nemrtvým či měňavcům je omráčí do konce tvého příštího tahu, neuspějí-li v záchraně na Odolnost. SO = 8 + zdatnostní bonus + oprava Síly nebo Obratnosti."
    },
    "Blessed Silver": {
      "name": "Požehnané stříbro",
      "description": "Postříbřené údery způsobují nemrtvým, běsům a měňavcům navíc 1k8 zářivého zranění."
    },
    "The Stake Remembers": {
      "name": "Kolík si pamatuje",
      "description": "Jednou za dlouhý odpočinek je tvůj úspěšný zásah proti tvorovi s nejvýše polovinou životů automaticky kritický."
    }
  },
  "parapsychologist": {
    "Field Instruments": {
      "name": "Polní přístroje",
      "description": "Akcí zjistíš přítomnost nadpřirozena do 60 stop a přibližný směr, odkud působí."
    },
    "Rational Mind": {
      "name": "Racionální mysl",
      "description": "Máš výhodu k záchranám proti okouzlení a strachu."
    },
    "Applied Theory": {
      "name": "Aplikovaná teorie",
      "description": "Sesíláš kouzla ze seznamu kouzelníka jako účinky kalibrovaných přístrojů pomocí Inteligence; souprava je tvým ohniskem."
    },
    "Research Program": {
      "name": "Výzkumný program",
      "description": "Vybereš si výzkumný program (podpovolání)."
    },
    "Baseline Readings": {
      "name": "Výchozí měření",
      "description": "Po minutě měření získá družina výhodu k první příští záchraně některého člena proti strašení či psychickému účinku."
    },
    "Peer Review": {
      "name": "Odborné posouzení",
      "description": "Jednou za odpočinek umožníš spojenci do 30 stop přehodit neúspěšnou záchranu na Inteligenci, Moudrost či Charisma."
    },
    "Calibrated Sensors": {
      "name": "Kalibrované senzory",
      "description": "Polní přístroje nyní odhalí druh entity a zda je nepřátelská."
    },
    "Controlled Exposure": {
      "name": "Řízené vystavení",
      "description": "Máš odolnost vůči psychickému zranění."
    },
    "Documented Phenomena": {
      "name": "Zdokumentované jevy",
      "description": "Máš výhodu k ověřením pro určení nadpřirozených tvorů a účinků, které jsi už někdy měřil."
    },
    "Grounding Rig": {
      "name": "Uzemňovací souprava",
      "description": "Jednou za dlouhý odpočinek desetiminutovou přípravou vytvoříš na 1 hodinu oblast o poloměru 20 stop, v níž není možná teleportace ani přechod mezi sférami."
    },
    "Predictive Model": {
      "name": "Předpovědní model",
      "description": "Jednou za odpočinek uložíš nevýhodu útoku tvora, kterého jsi už změřil."
    },
    "Clinical Detachment": {
      "name": "Klinický odstup",
      "description": "Dokud držíš své přístroje, nemůžeš být vystrašen."
    },
    "Resonance Lock": {
      "name": "Rezonanční zámek",
      "description": "Kouzla z tvých přístrojů ignorují odolnost vůči psychickému a silovému zranění."
    },
    "Unified Theory": {
      "name": "Jednotná teorie",
      "description": "Naučíš se tři kouzla z libovolného seznamu; pro tebe se považují za kouzelnické přístrojové účinky."
    },
    "Observer Effect": {
      "name": "Efekt pozorovatele",
      "description": "Jednou za dlouhý odpočinek přinutíš neviditelného, éterického či proměněného tvora do 60 stop nabýt na 1 minutu skutečnou viditelnou podobu; záchrana na Charisma účinek zruší."
    },
    "Proof": {
      "name": "Důkaz",
      "description": "Jednou za dlouhý odpočinek se tvé příští přístrojové kouzlo projeví v maximální síle a nelze mu odolat legendární odolností."
    },
    "Séance Protocol": {
      "name": "Protokol seance",
      "description": "Jednou za dlouhý odpočinek se při desetiminutové seanci družina zeptá přetrvávajícího ducha na tři otázky; odpoví stručně, ale pravdivě."
    },
    "Automatic Writing": {
      "name": "Automatické psaní",
      "description": "Máš výhodu k Pátrání na místech, kde někdo násilně zemřel."
    },
    "Ectoplasmic Sample": {
      "name": "Vzorek ektoplazmy",
      "description": "Poté, co zraníš ducha, se útoky celé družiny proti němu po 1 minutu považují za magické."
    },
    "Controlled Manifestation": {
      "name": "Řízená manifestace",
      "description": "Jednou za dlouhý odpočinek donutíš ducha do 30 stop na 10 minut se viditelně a slyšitelně projevit."
    },
    "Beyond the Veil": {
      "name": "Za závojem",
      "description": "Jednou za dlouhý odpočinek vidíš a můžeš útočit do Éterické sféry ty a nejvýše tři spojenci po dobu 1 minuty."
    }
  },
  "apostate": {
    "Residue of the Rite": {
      "name": "Pozůstatek obřadu",
      "description": "Sesíláš kouzla ze seznamu čaroděje jako stigmata pomocí Charismatu; sesílání zanechává viditelné znaky na tvé kůži."
    },
    "Mark of the Cult": {
      "name": "Znamení kultu",
      "description": "Na pohled poznáš členy, symboly a praktiky svého bývalého kultu."
    },
    "Bleeding Power": {
      "name": "Krvácející moc",
      "description": "Jednou za odpočinek sešleš stigma 1. úrovně bez pozice kouzla a utrpíš 1k4 nekrotického zranění, které nelze snížit."
    },
    "Scar Tissue": {
      "name": "Jizevnatá tkáň",
      "description": "Máš odolnost vůči nekrotickému zranění."
    },
    "The Rite Remembers": {
      "name": "Obřad si pamatuje",
      "description": "Dvakrát za odpočinek můžeš po seslání stigmatu úrovňového kouzla seslat trik jako bonusovou akci."
    },
    "Hunted Instincts": {
      "name": "Instinkty štvaného",
      "description": "Máš výhodu k iniciativě v přítomnosti kultistů či jejich vyvolaných bytostí; ti tě nemohou překvapit."
    },
    "Blood Ward": {
      "name": "Krvavá ochrana",
      "description": "Jednou za odpočinek reakcí při zásahu získáš odolnost vůči danému typu zranění do svého příštího tahu."
    },
    "Deeper Scars": {
      "name": "Hlubší jizvy",
      "description": "Krvácející moc dovoluje seslat stigma až 3. úrovně, ale zpětný náraz způsobí 2k4 nekrotického zranění."
    },
    "Turncoat's Insight": {
      "name": "Poznání přeběhlíka",
      "description": "Máš výhodu k záchranám proti kouzlům běsů, kultistů a aberací."
    },
    "Unfinished Ritual": {
      "name": "Nedokončený obřad",
      "description": "Jednou za dlouhý odpočinek při poklesu pod polovinu životů obnovíš utracené úrovně pozic kouzel až do součtu opravy Charismatu."
    },
    "The Mark Burns Back": {
      "name": "Znamení vrací úder",
      "description": "Reakcí při zásahu kouzlem způsobíš útočníkovi nekrotické zranění ve výši opravy Charismatu + tvé úrovně."
    },
    "Apostasy Complete": {
      "name": "Dokončené odpadlictví",
      "description": "Jsi imunní vůči okouzlení a posednutí běsy a aberacemi."
    },
    "Their Power, Your Hands": {
      "name": "Jejich moc ve tvých rukou",
      "description": "Jednou za dlouhý odpočinek sešleš jedno stigma nejvýše 5. úrovně bez pozice s maximálním účinkem."
    },
    "First Scar": {
      "name": "První jizva",
      "description": "Jednou za tah přičteš opravu Charismatu k nekrotickému zranění jednoho škodlivého stigmatu."
    },
    "Ritual Echo": {
      "name": "Ozvěna rituálu",
      "description": "Jednou za dlouhý odpočinek zdarma zopakuješ právě seslané stigma nejvýše 2. úrovně proti druhému cíli."
    },
    "Skin Like Scripture": {
      "name": "Kůže popsaná obřady",
      "description": "Při méně než polovině životů máš +2 k OČ a tvá stigmata ignorují odolnost vůči nekrotickému zranění."
    },
    "The Rite Completed": {
      "name": "Dokončený rituál",
      "description": "Jednou za dlouhý odpočinek tvá stigmata po 1 minutu nepotřebují verbální ani somatické složky a nelze je zrušit protikouzlem."
    }
  }
};
