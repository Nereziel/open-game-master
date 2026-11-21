// Original Czech play guidance for common SRD 5.1 creatures and items.
// Titles follow the established Czech D&D glossary; these notes do not copy
// third-party Czech translations. The complete English stat blocks and item
// descriptions are retained below, including dice and rare edge cases.
export const CZECH_MONSTER_NOTES: Readonly<Record<string, string>> = {
  Basilisk: `Bazilišek je nebezpečný především **zkameňujícím pohledem**. Tvor v jeho blízkosti, který vidí jeho oči, může být nucen k záchranným hodům na Odolnost; opakovaný neúspěch vede ke zkamenění. Pohlédnout jinam znamená omezit vlastní možnosti útoku, ale vyhnout se pohledu. Přesný dosah a záchranné hody stanoví statistický blok.`,

  Bugbear: `Gobr vyniká přepadem ze zálohy. Pokud v prvním kole překvapí cíl a zasáhne jej, způsobí **dodatečné zranění**. Jeho silné údery a dosah mohou být pro postavy nebezpečné; přesné zbraně, čísla a omezení najdeš níže.`,

  "Dire Wolf": `Lítý vlk má výhodu při spolupráci se smečkou: **taktika smečky** mu pomáhá zasahovat protivníka, u kterého stojí jeho spojenec. Po úspěšném kousnutí může cíl srazit na zem, pokud neuspěje v záchranném hodu na Sílu. Má velmi citlivý čich a sluch.`,

  Ghast: `Ghast je mocnější nemrtvý příbuzný ghúla. Jeho **zápach** může oslabit živé tvory v okolí a útok drápy může způsobit **ochromení**. Přesný dosah, obtížnost hodů i zvláštní ochranu některých nemrtvých uvádí anglický blok.`,

  Ghost: `Duch je nehmotný nemrtvý, který dokáže pronikat předměty a působit strach. Jeho **hrůzná podoba** může tvory dokonce zestárnout a **posednutí** mu může dovolit ovládat humanoidního hostitele. Pro tyto účinky platí vlastní záchranné hody a podmínky.`,

  Ghoul: `Ghúl je nemrtvý lovec, jehož **drápy mohou ochromit** zasaženého tvora. Na některé druhy tvorů tato paralýza neúčinkuje. Ghúl také kouše; přesnou výši zranění, typ účinku a obtížnost záchrany určuje jeho statistický blok.`,

  "Giant Spider": `Obří pavouk se pohybuje po stěnách a stropech, vyhledává kořist v pavučinách a dokáže ji **zadržet pavučinovou střelou**. Jeho kousnutí způsobuje i **jedové zranění**. Tvor se z pavučin vysvobodí dle předepsaného ověření; pavoučí síť lze také poškodit či spálit.`,

  Goblin: `Goblin se spoléhá na přesily, útoky ze zálohy a rychlé ústupy. Díky **hbitému úniku** se může jako bonusovou akci **skrýt nebo odpoutat**. Tato schopnost znamená, že obtížněji zůstává v dosahu útoků na blízko.`,

  "Goblin Boss": `Gobliní vůdce používá stejně jako ostatní goblini **hbitý únik**. Navíc může přesunout zásah mířený na sebe na jiného goblina v dosahu, pokud splňuje podmínky své zvláštní reakce. Řiď se přesným omezením této obrany ve statistikách.`,

  Hobgoblin: `Skurut bojuje disciplinovaně a těží z převahy své jednotky. Jeho **bojová výhoda** mu při úspěšném útoku umožní způsobit dodatečné zranění, pokud má poblíž cíle spojence, který je schopný jednat. Přesný dosah i omezení četnosti určuje blok.`,

  Kobold: `Kobold je malý, ale ve skupině nebezpečný. Díky **taktice smečky** má výhodu při útoku na protivníka, u kterého stojí jeho spojenec. **Citlivost na sluneční světlo** mu naopak ztěžuje některé útoky a ověřování zraku.`,

  Lich: `Kostěj je mimořádně silný nemrtvý sesilatel, obvykle chráněný **filaktérií**. Používá kouzla vysokých úrovní, legendární akce a může se bránit záchranným hodům pomocí legendární odolnosti. Pro boj je zásadní jeho úplný seznam připravených kouzel a legendárních akcí.`,

  Medusa: `Medúza dokáže svým **zkameňujícím pohledem** proměnit protivníky v kámen. Tvor, který se jejím očím vědomě vyhýbá, omezuje možnost ji vidět, ale může se bránit zkamenění. Je ozbrojená také běžnými zbraněmi; přesné podmínky a dosah určuje statistický blok.`,

  Mimic: `Mimik se **proměňuje v předmět**, zpravidla v nenápadnou součást vybavení nebo truhlu. Ve falešné podobě se snadno skrývá a jeho lepkavé tělo může **uchvátit** tvora, kterého se dotkne. Při kousnutí útočí i proti již uchvácené kořisti.`,

  Mummy: `Mumie nahání strach **děsivým pohledem** a její úder může na cíl přenést **mumiinu hnilobu**. Tato kletba brání běžnému léčení a může postupně snižovat maximum životů. Její odstranění se řídí přesnými pravidly v původním bloku.`,

  Ogre: `Zlobr je velký a fyzicky silný protivník. Bývá ozbrojen mohutným kyjem a někdy vrhá oštěpy. Oproti obratnějším nepřátelům spoléhá především na vysoké životy a silné jednotlivé zásahy, nikoli na složité zvláštní schopnosti.`,

  Orc: `Ork je útočný bojovník na blízko. Díky schopnosti **agresivní postup** se může bonusovou akcí přiblížit k nepřátelskému tvorovi, kterého vidí nebo slyší. Jeho zbraně a životy stanoví statistický blok.`,

  Owlbear: `Sovodvěd je nebezpečný dravec s ostrým zobákem a drápy. Dokáže provést **více útoků v jednom tahu** a má výhodu při vyhledávání kořisti pomocí zraku nebo čichu.`,

  "Rust Monster": `Rzivý netvor poškozuje hlavně kovovou výbavu. Jeho **tykadla mohou korodovat nemagické kovové zbroje či štíty**, zatímco dotyk nebo zásah některými kovovými zbraněmi může poškodit i zbraň. Přesný pokles obranného čísla nebo postihu zbraně určuje blok.`,

  Shadow: `Stín se dokáže skrývat ve tmě a šeru a pohybovat se nenápadně. Jeho útok **vysává Sílu**, což může být nebezpečnější než samotné zranění. Při snížení Síly na nulu může cíl zemřít; přesné trvání postihu je součástí bloku.`,

  Skeleton: `Kostlivec je nemrtvý, který obvykle útočí mečem nebo lukem. Je **zranitelný vůči drtivému zranění**, ale některé stavy a druhy poškození na něj neúčinkují. Jeho smysly a imunity jsou uvedeny v tabulce.`,

  Troll: `Troll se na začátku svého tahu výrazně **regeneruje**, pokud mu tomu nezabrání zásah **ohněm nebo kyselinou**. Bez využití této slabiny může vstát i po zdánlivém poražení. Má útoky drápy a kousnutím a mimořádně citlivý čich.`,

  Vampire: `Upír je mocný nemrtvý protivník, který může měnit podobu, **okouzlovat**, léčit svá zranění regenerací a ovládat další tvory. Má zároveň zásadní slabiny: **sluneční světlo, tekoucí vodu a zvláštní pravidla pro odpočinek**. Pro boj použij úplný statistický blok včetně legendárních akcí.`,

  "Vampire Spawn": `Upíří zplozenec je slabší upír, stále však nebezpečný svou **regenerací**, úchopem a kousnutím. Ublížit mu může **sluneční světlo či tekoucí voda**. Regeneraci zastavují některé druhy zranění; přesný účinek je v originálním bloku.`,

  Wight: `Fext je nemrtvý válečník. Jeho **vysávání života** může snížit maximum životů oběti a tvor, kterého takto zabije, se může později stát zombie pod jeho vládou. Na přímém slunečním světle mívá nevýhodu k vybraným hodům.`,

  Wolf: `Vlk používá **taktiku smečky** a může po úspěšném kousnutí srazit oběť na zem. Má výhodu při ověřování Vnímání založeném na sluchu a čichu. Jeho účinnost se výrazně zvyšuje, když útočí po boku dalšího spojence.`,

  Zombie: `Zombie je nemrtvý, kterého je obtížné definitivně zničit. **Nemrtvá houževnatost** mu může po smrtícím zranění umožnit zůstat na 1 životě. Kritické zásahy a zářivé zranění mohou tuto schopnost obejít; přesný záchranný hod je níže.`,
};

export const CZECH_ITEM_NOTES: Readonly<Record<string, string>> = {
  "Adamantine Armor": `Zbroj vyrobená z adamantinu činí **kritický zásah proti nositeli obyčejným zásahem**. Vztahuje se na příslušné střední a těžké zbroje, nikoli na samostatný štít. Přesné varianty a omezení uvádí originální záznam.`,

  "Amulet of Health": `Když amulet nosíš, tvá **Odolnost se nastaví na 19**, pokud ji přirozeně nemáš vyšší. Předmět vyžaduje **sladění**; jeho účinek se uplatní jen za podmínek uvedených v původních pravidlech.`,

  "Amulet of Proof Against Detection and Location": `Při nošení tohoto amuletu tě nelze cílit **věšteckou magií** ani sledovat magickými prostředky vyhledávání, jak je vymezuje jeho popis. Amulet vyžaduje sladění.`,

  "Boots of Elvenkind": `Elfí boty při chůzi **nevydávají zvuk**, ať se pohybuješ po jakémkoli povrchu. Máš **výhodu k ověřením Obratnosti (Plížení)**, pokud záleží na tichém pohybu. Neposkytují automaticky neviditelnost.`,

  "Boots of Striding and Springing": `Se sedmimílovými botami máš při nošení rychlost chůze alespoň **30 stop** a nemůže ji snížit přetížení ani těžká zbroj. Doskok se násobí **třemi**, stále však platí omezení dostupným pohybem. Boty vyžadují sladění.`,

  "Bracers of Defense": `Nátepníky obrany ti dávají **+2 k obrannému číslu**, pokud **nemáš na sobě zbroj a nepoužíváš štít**. Vyžadují sladění a jejich bonus se vyhodnocuje podle aktuální výbavy.`,

  "Cloak of Elvenkind": `Elfí plášť po nasazení kapuce způsobí, že tvorové mají **nevýhodu k ověřením Moudrosti (Vnímání)** při pokusu tě spatřit. Ty máš zároveň **výhodu k ověřením Obratnosti (Plížení)**, která provádíš při skrývání. Nasazení i stažení kapuce vyžaduje akci. Plášť vyžaduje sladění.`,

  "Cloak of Protection": `Když máš ochranný plášť na sobě a jsi s ním sladěný, získáš **+1 k obrannému číslu a +1 ke všem záchranným hodům**.`,

  "Gauntlets of Ogre Power": `Rukavice zlobří síly ti při nošení nastaví **Sílu na 19**, pokud už ji nemáš vyšší. Pro využití účinku je potřeba sladění.`,

  "Hat of Disguise": `Klobouk přestrojení ti dovoluje pomocí akce **seslat kouzlo Přestrojení bez omezení počtu seslání**, dokud klobouk nosíš. Účinek skončí, pokud si klobouk sundáš. Je nutné sladění.`,

  "Headband of Intellect": `Čelenka intelektu nastaví nositeli **Inteligenci na 19**, pokud už ji nemá vyšší. Je nutné sladění s předmětem.`,

  "Necklace of Fireballs": `Z náhrdelníku můžeš odtrhnout kouzelný korálek a hodit ho až do **60 stop**, čímž sešleš **Ohnivou kouli 3. úrovně**. Použiješ-li při jednom hodu více korálků, zvýšíš úroveň kouzla o jednu za každý další korálek. Po vyčerpání všech korálků náhrdelník zanikne.`,

  "Pearl of Power": `Sesilatel sladěný s perlou moci může pomocí akce vyslovit její příkaz a **obnovit jednu spotřebovanou pozici kouzla** nejvýše **3. úrovně**. Funguje **jednou za úsvit**. Přesná pravidla pro výběr pozice jsou v originálním popisu.`,

  "Ring of Protection": `Prsten ochrany poskytuje sladěnému nositeli **+1 k obrannému číslu a +1 k záchranným hodům**.`,

  "Ring of Regeneration": `Prsten regenerace obnovuje nositeli **1k6 životů každých 10 minut**, pokud má alespoň jeden život. Dokáže postupně obnovit i ztracené části těla. Vyžaduje sladění a má zvláštní časové podmínky obnovy.`,

  "Ring of Spell Storing": `Prsten uchovávání kouzel pojme až **pět úrovní kouzel** ve formě seslaných kouzel. Nositel, který je s prstenem sladěný, je pak může seslat; používají se hodnoty původního sesilatele podle pravidel prstenu. Pozice kouzla se spotřebuje při uložení, nikoli při pozdějším použití.`,

  "Sun Blade": `Sluneční čepel má zářivou čepel a funguje jako magický meč. Poskytuje **bonus +2 k hodům na útok a zranění**, způsobuje zářivé zranění a má zvláštní dodatečný účinek proti **nemrtvým**. Její světlo lze ovládat podle původního popisu. Vyžaduje sladění.`,

  "Wand of Fireballs": `Hůlka ohnivých koulí má **7 dávek**. Za **3 dávky** sešleš **Ohnivou kouli 3. úrovně**; za každou další dávku zvýšíš úroveň seslaného kouzla o 1. Za úsvitu se jí obnoví **1k6 + 1** dávek. Při vyčerpání poslední dávky hrozí zničení hůlky. Vyžaduje sladění se sesilatelem kouzel.`,

  "Wand of Magic Missiles": `Hůlka magických střel má **7 dávek** a dovoluje seslat **Magickou střelu** za **1 dávku**. Za každou další dávku zvyšuje úroveň seslaného kouzla o 1. Za úsvitu obnoví **1k6 + 1** dávek; při použití poslední dávky hrozí její zničení.`,

  "Weapon of Warning": `Zbraň varování poskytuje **výhodu k hodům na iniciativu**. Pokud nejsi neschopný jinak než běžným spánkem, ty a spojenci v dosahu **30 stop** nemůžete být překvapeni; zbraň vás v případě nebezpečí probudí. Pro její účinky je potřeba sladění.`,
};
