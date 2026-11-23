// Original Czech explanations of commonly used SRD 5.1 (2014) spells.
// These texts are newly written from the CC BY 4.0 English rules. d20.cz is
// consulted for established short names, not used as a source of prose.
// The full original spell text remains available below each Czech entry.
// Record keys are canonical English SRD titles, never translated engine IDs.
export const CZECH_SPELL_NOTES: Readonly<Record<string, string>> = {
  "Acid Splash": `**Vyvolání:** 1 akce. **Dosah:** 60 stop.

Zvol jednoho tvora v dosahu, nebo dva tvory, kteří jsou od sebe nejvýše 5 stop. Každý z nich si hodí záchranný hod na Obratnost. Při neúspěchu utrpí kyselinové zranění **1k6**.

Na 5., 11. a 17. úrovni sesilatele se zranění zvýší na **2k6, 3k6 a 4k6**.`,

  "Bane": `**Vyvolání:** 1 akce. **Dosah:** 30 stop. **Trvání:** soustředění, nejvýše 1 minuta.

Vyber až tři tvory v dosahu. Každý si hází záchranný hod na Charisma. Dokud kouzlo trvá, každý z neúspěšných cílů odečítá **1k4** od svých hodů na útok a záchranných hodů. Při seslání z pozice 2. či vyšší úrovně můžeš za každou úroveň pozice nad první zacílit dalšího tvora.`,

  "Bless": `**Vyvolání:** 1 akce. **Dosah:** 30 stop. **Trvání:** soustředění, nejvýše 1 minuta.

Vyber až tři tvory v dosahu. Po dobu trvání si mohou k hodům na útok a záchranným hodům přičítat **1k4**. Při použití pozice 2. nebo vyšší úrovně můžeš za každou úroveň nad první vybrat dalšího tvora.`,

  "Burning Hands": `**Vyvolání:** 1 akce. **Dosah:** kužel dlouhý 15 stop od sesilatele. **Trvání:** okamžité.

Všichni tvorové v kuželu si hodí záchranný hod na Obratnost. Neúspěch znamená **3k6 ohnivého zranění**, úspěch polovinu. Kouzlo zapaluje také hořlavé předměty v oblasti, které nikdo nedrží ani nenese. Za každou úroveň pozice nad první přidej **1k6** zranění.`,

  "Charm Person": `**Vyvolání:** 1 akce. **Dosah:** 30 stop. **Trvání:** 1 hodina.

Humanoid, kterého vidíš, si hází záchranný hod na Moudrost; pokud s ním ty nebo tví spojenci bojujete, má k hodu výhodu. Při neúspěchu je tebou **okouzlený** až do konce kouzla, nebo dokud mu ty či tví spojenci neublížíte. Považuje tě za přátelského známého. Po skončení kouzla si uvědomí, že jsi ho očaroval. Pozice 2. a vyšší úrovně přidají po jednom cíli za každou úroveň navíc, pokud jsou cíle v dosahu 30 stop jeden od druhého.`,

  "Counterspell": `**Vyvolání:** 1 reakce, když do 60 stop vidíš tvora sesílat kouzlo. **Trvání:** okamžité.

Pokusíš se přerušit právě sesílané kouzlo. Kouzlo **3. nebo nižší úrovně** přerušíš automaticky. U vyšší úrovně provedeš ověření své sesílací vlastnosti proti **SO 10 + úroveň přerušovaného kouzla**; při úspěchu kouzlo selže. Jestliže protikouzlo sesíláš z vyšší pozice, automaticky přeruší kouzlo úrovně nejvýše rovné úrovni použité pozice.`,

  "Cure Wounds": `**Vyvolání:** 1 akce. **Dosah:** dotyk. **Trvání:** okamžité.

Dotčenému tvorovi se obnoví životy v množství **1k8 + oprava tvé sesílací vlastnosti**. Kouzlo nepůsobí na nemrtvé a konstrukty. Za každou úroveň pozice nad první se léčení zvýší o další **1k8**.`,

  "Dancing Lights": `**Vyvolání:** 1 akce. **Dosah:** 120 stop. **Trvání:** soustředění, nejvýše 1 minuta.

Vytvoříš až čtyři světýlka, každé osvětlující okolí **šerým světlem v okruhu 10 stop**. Mohou mít podobu pochodní, luceren či světelných koulí, nebo společně vytvořit zářící postavu zhruba humanoidního tvaru. Bonusovou akcí je můžeš přesunout až o 60 stop. Jednotlivá světýlka musí zůstávat nanejvýš 20 stop od jiného vytvořeného světla a v dosahu kouzla.`,

  "Detect Magic": `**Vyvolání:** 1 akce nebo rituál. **Trvání:** soustředění, nejvýše 10 minut.

Po dobu trvání vnímáš přítomnost magie do **30 stop** od sebe. Pomocí akce si můžeš všimnout slabé aury na viditelném tvorovi či předmětu a poznat školu magie, pokud nějakou má. Kouzlo proniká většinou překážek, avšak blokuje ho **1 stopa kamene, 1 palec běžného kovu, tenká vrstva olova nebo 3 stopy dřeva či hlíny**.`,

  "Dispel Magic": `**Vyvolání:** 1 akce. **Dosah:** 120 stop. **Trvání:** okamžité.

Vyber jednoho tvora, předmět nebo magický účinek. Na zvoleném cíli skončí všechna působící kouzla **3. či nižší úrovně**. Za každé kouzlo vyšší úrovně proveď ověření své sesílací vlastnosti proti **SO 10 + úroveň daného kouzla**. Při seslání rozptylu magie z vyšší pozice automaticky skončí všechna kouzla úrovně nejvýše rovné použité pozici. Nejde o univerzální zrušení každého magického předmětu.`,

  "Eldritch Blast": `**Vyvolání:** 1 akce. **Dosah:** 120 stop. **Trvání:** okamžité.

Proti tvorovi v dosahu proveď útok kouzlem na dálku. Při zásahu způsobíš **1k10 silového zranění**. Na 5. úrovni vytváříš **dva paprsky**, na 11. tři a na 17. čtyři. Každý paprsek vyžaduje samostatný hod na útok a může mít vlastní cíl.`,

  "Fire Bolt": `**Vyvolání:** 1 akce. **Dosah:** 120 stop. **Trvání:** okamžité.

Vrhneš oheň proti tvorovi či předmětu. Proveď útok kouzlem na dálku; při zásahu způsobíš **1k10 ohnivého zranění**. Hořlavý předmět se vznítí, pokud ho nikdo nedrží ani nenese. Na 5., 11. a 17. úrovni se zranění zvýší na **2k10, 3k10 a 4k10**.`,

  Fireball: `**Vyvolání:** 1 akce. **Dosah:** 150 stop. **Oblast:** koule o poloměru 20 stop. **Trvání:** okamžité.

V místě, které zvolíš v dosahu, vyšlehne ohnivý výbuch. Každý tvor v oblasti si hodí záchranný hod na Obratnost. Při neúspěchu utrpí **8k6 ohnivého zranění**, při úspěchu polovinu. Oheň se šíří i za rohy a zapaluje nechráněné hořlavé předměty, které nikdo nedrží ani nenese. Za každou úroveň pozice nad třetí se zranění zvýší o **1k6**.`,

  Guidance: `**Vyvolání:** 1 akce. **Dosah:** dotyk. **Trvání:** soustředění, nejvýše 1 minuta.

Dotkneš se ochotného tvora. Před skončením kouzla může při **jednom ověření vlastnosti** přidat **1k4** k výsledku. Kostkou může hodit před ověřením nebo po něm, musí však bonus použít dříve, než Pán jeskyně určí výsledek. Poté kouzlo skončí.`,

  "Healing Word": `**Vyvolání:** 1 bonusová akce. **Dosah:** 60 stop. **Trvání:** okamžité.

Tvor, kterého vidíš v dosahu, si obnoví **1k4 + oprava tvé sesílací vlastnosti** životů. Kouzlo nepůsobí na nemrtvé ani konstrukty. Za každou úroveň pozice nad první se obnovené životy zvýší o **1k4**.`,

  "Hold Person": `**Vyvolání:** 1 akce. **Dosah:** 60 stop. **Trvání:** soustředění, nejvýše 1 minuta.

Vybraný humanoid, kterého vidíš, si hodí záchranný hod na Moudrost. Při neúspěchu je **ochromený**. Na konci každého svého tahu může záchranný hod zopakovat a při úspěchu účinek ukončí. Za každou úroveň použité pozice nad druhou lze zacílit dalšího humanoida, pokud jsou při seslání navzájem nejvýše 30 stop od sebe.`,

  Identify: `**Vyvolání:** 1 minuta nebo rituál. **Dosah:** dotyk. **Trvání:** okamžité.

Vezmeš magický předmět do rukou nebo se ho po celou dobu sesílání dotýkáš. Zjistíš jeho magické vlastnosti a způsob použití, zda vyžaduje sladění a kolik má případně nabití. Odhalíš také kouzla, která na předmět právě působí. Kouzlo lze místo toho seslat na tvora a zjistit, jaká kouzla ho momentálně ovlivňují. Materiální složkou je mimo jiné **perla v hodnotě alespoň 100 zl**, která se nespotřebovává.`,

  Invisibility: `**Vyvolání:** 1 akce. **Dosah:** dotyk. **Trvání:** soustředění, nejvýše 1 hodina.

Dotčený tvor je neviditelný. Neviditelná je také jeho oblečená či nesená výbava, dokud ji má u sebe. Pro konkrétního tvora kouzlo skončí, jakmile zaútočí nebo sešle kouzlo. Použitím pozice 3. či vyšší úrovně lze za každou úroveň pozice nad druhou zacílit jednoho dalšího tvora.`,

  Light: `**Vyvolání:** 1 akce. **Dosah:** dotyk. **Trvání:** 1 hodina.

Předmět, jehož žádný rozměr nepřesahuje 10 stop, začne svítit: do **20 stop jasně** a dalších **20 stop šerým světlem**. Barvu si zvolíš. Zakrytím neprůsvitným předmětem světlo zablokuješ. Pokud se předmět nachází u nepřátelského tvora, může se tvor účinku vyhnout úspěšným záchranným hodem na Obratnost.`,

  "Mage Armor": `**Vyvolání:** 1 akce. **Dosah:** dotyk. **Trvání:** 8 hodin, bez soustředění.

Dotkneš se ochotného tvora, který nemá na sobě zbroj. Jeho základní **obranné číslo se změní na 13 + oprava Obratnosti**. Kouzlo předčasně skončí, pokud si cíl oblékne zbroj, nebo pokud ho ukončíš akcí.`,

  "Mage Hand": `**Vyvolání:** 1 akce. **Dosah:** 30 stop. **Trvání:** 1 minuta.

Vyvoláš průsvitnou přízračnou ruku. Můžeš ji ovládat akcí: manipulovat předměty, otevírat nezamčené dveře či nádobu, něco z nádoby vyzvednout nebo vylít její obsah. Rukou **nelze útočit, aktivovat kouzelné předměty ani nést více než 10 liber**. Každou akcí s ní lze také pohnout nejvýše o 30 stop, stále však musí zůstat v dosahu kouzla.`,

  "Magic Missile": `**Vyvolání:** 1 akce. **Dosah:** 120 stop. **Trvání:** okamžité.

Vytvoříš **tři magické šipky**, které automaticky zasáhnou viditelné tvory v dosahu. Každá způsobí **1k4 + 1 silového zranění**. Šipky můžeš rozdělit mezi více cílů a zasáhnou současně. Při použití pozice 2. či vyšší úrovně vytvoříš jednu další šipku za každou úroveň nad první. Proti tomuto kouzlu může chránit například kouzlo **Štít**.`,

  "Magic Weapon": `**Vyvolání:** 1 bonusová akce. **Dosah:** dotyk. **Trvání:** soustředění, nejvýše 1 hodina.

Dotkneš se nemagické zbraně. Po dobu trvání se považuje za magickou a má **bonus +1 k hodům na útok i na zranění**. Použiješ-li pozici 4. nebo 5. úrovně, bonus se zvýší na **+2**; při pozici 6. a vyšší na **+3**.`,

  Mending: `**Vyvolání:** 1 minuta. **Dosah:** dotyk. **Trvání:** okamžité.

Opravíš jedno roztržení či prasklinu v předmětu, pokud žádný rozměr poškození nepřesahuje **1 stopu**. Spojení může být dokonale neviditelné. Kouzlo dokáže opravit fyzickou podobu kouzelného předmětu, ale **neobnoví ztracenou magii**.`,

  Message: `**Vyvolání:** 1 akce. **Dosah:** 120 stop. **Trvání:** 1 kolo.

Ukážeš na tvora a pošeptáš krátkou zprávu, kterou slyší pouze on. Cíl může šeptem odpovědět a odpověď uslyšíš jen ty. Nemusíte se vidět; musíš však vědět, kde cíl je, a cestu neblokovat ochranný materiál. Kouzlo obejde rohy i překážky, avšak pronikání omezí například olovo či silná vrstva kamene, kovu nebo dřeva.`,

  "Minor Illusion": `**Vyvolání:** 1 akce. **Dosah:** 30 stop. **Trvání:** 1 minuta.

Vytvoříš **zvuk nebo nehybný obraz předmětu** v krychli o hraně nejvýše **5 stop**. Zvuk může mít proměnlivou hlasitost a trvat nepřetržitě nebo se opakovat. Obraz nedokáže vydávat světlo ani zvuk a nelze se ho skutečně dotknout. Tvor může iluzi odhalit fyzickým kontaktem nebo úspěšným ověřením Inteligence (Pátrání) proti SO tvých kouzel při použití akce. Opakovaným sesláním předchozí iluzi ukončíš.`,

  "Misty Step": `**Vyvolání:** 1 bonusová akce. **Dosah:** vlastní osoba. **Trvání:** okamžité.

Obklopí tě stříbřitá mlha a teleportuješ se až **30 stop** na **volné místo, které vidíš**. Není třeba provádět hod na útok ani záchranný hod.`,

  "Poison Spray": `**Vyvolání:** 1 akce. **Dosah:** 10 stop. **Trvání:** okamžité.

Ze své ruky vypustíš oblak jedovatého plynu proti tvorovi, kterého vidíš. Cíl si hodí záchranný hod na Odolnost; při neúspěchu utrpí **1k12 jedového zranění**. Na 5., 11. a 17. úrovni se zranění zvýší na **2k12, 3k12 a 4k12**.`,

  Prestidigitation: `**Vyvolání:** 1 akce. **Dosah:** 10 stop. **Trvání:** nejvýše 1 hodina podle účinku.

Provedeš drobný neškodný magický trik: okamžitý smyslový efekt, zapálení či zhasnutí malé ohně, vyčištění nebo zašpinění předmětu, ohřátí, ochlazení či ochucení neživého materiálu, malou značku či symbol nebo drobný předmět či iluzi, která se vejde do dlaně. Předměty vytvořené kouzlem nejsou cenné ani použitelné jako nástroje. Lze současně udržovat nejvýše **tři neokamžité účinky**.`,

  "Protection from Energy": `**Vyvolání:** 1 akce. **Dosah:** dotyk. **Trvání:** soustředění, nejvýše 1 hodina.

Ochotný tvor, kterého se dotkneš, získá po dobu trvání **odolání** vůči jednomu druhu zranění, který zvolíš při seslání: **kyselinovému, chladnému, ohnivému, bleskovému nebo hromovému**.`,

  "Ray of Frost": `**Vyvolání:** 1 akce. **Dosah:** 60 stop. **Trvání:** okamžité.

Proveď útok kouzlem na dálku proti tvorovi. Při zásahu utrpí **1k8 chladného zranění** a do začátku tvého příštího tahu se mu **rychlost sníží o 10 stop**. Zranění se zvýší na **2k8, 3k8 a 4k8** při dosažení 5., 11. a 17. úrovně.`,

  Resistance: `**Vyvolání:** 1 akce. **Dosah:** dotyk. **Trvání:** soustředění, nejvýše 1 minuta.

Ochotný tvor, kterého se dotkneš, může během trvání kouzla při **jednom záchranném hodu** přičíst **1k4** k výsledku. Kostku smí použít po hodu, ale dříve, než se určí výsledek. Tím kouzlo končí.`,

  Revivify: `**Vyvolání:** 1 akce. **Dosah:** dotyk. **Trvání:** okamžité.

Dotkneš se tvora, který zemřel **během poslední minuty**. Vrátí se k životu s **1 životem**. Kouzlo neoživí tvora zemřelého stářím a neobnoví chybějící části těla. Vyžaduje **diamanty v hodnotě 300 zl**, které se sesláním spotřebují.`,

  "Sacred Flame": `**Vyvolání:** 1 akce. **Dosah:** 60 stop. **Trvání:** okamžité.

Na tvora, kterého vidíš, dopadne zářivý plamen. Cíl si hodí záchranný hod na Obratnost; při neúspěchu utrpí **1k8 zářivého zranění**. Cíl z tohoto kouzla nemá prospěch z krytu při záchranném hodu. Zranění se na 5., 11. a 17. úrovni zvýší na **2k8, 3k8 a 4k8**.`,

  Shield: `**Vyvolání:** 1 reakce při zásahu útokem nebo při zacílení magickou střelou. **Trvání:** do začátku tvého příštího tahu.

Získáš **+5 k obrannému číslu**, a to i proti útoku, který reakci vyvolal. Do začátku svého příštího tahu zároveň neutrpíš zranění od kouzla **Magická střela**.`,

  "Shield of Faith": `**Vyvolání:** 1 bonusová akce. **Dosah:** 60 stop. **Trvání:** soustředění, nejvýše 10 minut.

Vybraný tvor v dosahu získá po dobu trvání kouzla **bonus +2 k obrannému číslu**.`,

  Sleep: `**Vyvolání:** 1 akce. **Dosah:** 90 stop. **Oblast:** koule o poloměru 20 stop. **Trvání:** 1 minuta.

Hoď **5k8**; součet je zásoba životů, kterou může kouzlo uspat. Tvorové v oblasti jsou zasaženi podle svých **aktuálních životů od nejnižších**. Jestliže má tvor životů nanejvýš tolik, kolik zbývá v zásobě, upadne do bezvědomí a jeho životy se od zásoby odečtou; jinak kouzlo pokračuje dalšími tvory. Spící se probudí při zranění nebo když ho někdo akcí probudí. **Nemrtví ani tvorové imunní vůči okouzlení nejsou ovlivněni.** Za každou úroveň pozice nad první hoď o **2k8** více.`,

  "Spare the Dying": `**Vyvolání:** 1 akce. **Dosah:** dotyk. **Trvání:** okamžité.

Dotkneš se živého tvora na **0 životech** a **stabilizuješ ho**. Kouzlo mu životy neobnoví a nepůsobí na nemrtvé ani konstrukty.`,

  "Speak with Animals": `**Vyvolání:** 1 akce nebo rituál. **Dosah:** vlastní osoba. **Trvání:** 10 minut.

Po dobu trvání chápeš komunikaci zvířat a dokážeš s nimi mluvit. Zvířata mohou sdělit jednoduché poznatky o bezprostředním okolí či o tom, co v poslední době vnímala. Kouzlo nezaručuje jejich ochotu pomáhat; přesvědčování může vyžadovat ověření vlastnosti.`,

  Thaumaturgy: `**Vyvolání:** 1 akce. **Dosah:** 30 stop. **Trvání:** nejvýše 1 minuta podle účinku.

Vyvoláš jeden drobný nadpřirozený projev: tvůj hlas se zesílí až trojnásobně, plameny zablikají nebo změní barvu, zemi rozvibruje neškodný otřes, zazní okamžitý zvuk, odemčené dveře či okno se prudce otevřou nebo zavřou, případně se na chvíli promění vzhled tvých očí. Současně mohou trvat až **tři minutové účinky**.`,

  Thunderwave: `**Vyvolání:** 1 akce. **Oblast:** krychle o hraně 15 stop s počátkem u tebe. **Trvání:** okamžité.

Všechny tvory v oblasti zasáhne tlaková vlna. Každý hází záchranný hod na Odolnost. Při neúspěchu utrpí **2k8 hromového zranění** a je odtlačen **10 stop** od tebe; při úspěchu utrpí polovinu a není odtlačen. Uvolněné předměty se také odsunou a zazní dunění slyšitelné až do **300 stop**. Za každou úroveň pozice nad první přidej **1k8** zranění.`,

  "Web": `**Vyvolání:** 1 akce. **Dosah:** 60 stop. **Trvání:** soustředění, nejvýše 1 hodina.

Vytvoříš pavučiny v krychli o hraně **20 stop**. Oblast je **těžký terén** a je lehce zastřená. Tvor, který vstoupí do pavučin během svého tahu nebo v nich svůj tah začne, musí uspět v záchranném hodu na Obratnost, jinak je **zadržený**. Akcí se může pokusit uniknout ověřením Síly proti SO tvých kouzel. Pavučiny jsou hořlavé; část zasažená ohněm shoří během jednoho kola a tvor, který v ní začne tah, utrpí **2k4 ohnivého zranění**. Nejsou-li pavučiny ukotvené mezi pevnými body, po jednom kole se zhroutí.`,

  "Aid": `**Vyvolání:** 1 akce. **Dosah:** 30 stop. **Trvání:** 8 hodin.

Vyber až **tři tvory** v dosahu. Každému se zvýší **maximum životů o 5** a zároveň i aktuální životy o 5. Za každou úroveň pozice nad druhou se oba přírůstky zvýší o dalších **5**.`,

  "Haste": `**Vyvolání:** 1 akce. **Dosah:** 30 stop. **Trvání:** soustředění, nejvýše 1 minuta.

Ochotnému tvorovi se **zdvojnásobí rychlost**, získá **+2 k obrannému číslu** a **výhodu k záchranným hodům na Obratnost**. V každém svém tahu navíc získá jednu omezenou akci: může zaútočit **jedním zbraňovým útokem**, sprintovat, odpoutat se, skrýt se nebo použít předmět. Když kouzlo skončí, tvor se do konce svého příštího tahu nemůže pohnout ani provádět akce.`,
};
