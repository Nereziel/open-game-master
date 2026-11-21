# České překlady textu SRD 5.1 – původ a oprávnění

## Zdroj

Úplné české překlady ve `src/lib/rulebook/czech-full-rules-*.ts` jsou
nově vytvořené překlady anglického **System Reference Document 5.1**,
zveřejněného společností **Wizards of the Coast LLC** pod licencí
**Creative Commons Attribution 4.0 International (CC BY 4.0)**.

- Originál: https://dnd.wizards.com/resources/systems-reference-document
- Licence: https://creativecommons.org/licenses/by/4.0/legalcode
- Zdroj pro překládání v této aplikaci: `src/lib/rulebook/srd-5.1.json`
- Identifikátory stránek a původní anglické znění nejsou měněny.
- Každá dosud přeložená stránka zobrazuje úplný český text i původní anglický obsah.
- Stránka `legal-information` uchovává předepsanou atribuci v originálním znění.

Povinná atribuce převzatá z původního SRD:

> This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.

Překlad je adaptací anglického SRD a může obsahovat drobné terminologické
úpravy; pokud dojde ke sporu o pravidlo, původní text je dostupný v
anglickém zobrazení a na konci české stránky.

## Co **není** převzato

České texty na https://dnd5esrd.d20.cz/ vycházejí z komunitního překladu
ShadoWWW a dalších spolupracovníků. Stránka uvádí autorství, ale při kontrole
nebylo nalezeno jednoznačné licenční oprávnění k automatickému převzetí
kompletního českého znění do tohoto projektu. **Proto odtud nekopírujeme
celé odstavce, tabulky, statbloky ani celé knihy.** Lze se inspirovat již
zavedenými českými názvy herních pojmů.

Další cizí český překlad lze importovat, pokud jeho autor nebo platná
licence převzetí výslovně dovolí, a za příslušných podmínek s atribucí.

## Sjednocení názvů s českým D&D 5e (2014)

**Jediné části, které se přebírají doslova z komunitního českého
překladu, jsou samostatné názvy a ustálené herní termíny.**
Všechny popisy, definice, vysvětlení, příklady a celé tabulky pravidel
zůstávají naším vlastním překladem anglického SRD 5.1.
Měníme jen terminologii a nutné vlastní gramatické vazby. Nepřebíráme
delší pasáže ani odstavce cizího překladu.

Srovnání je založeno na české **Příručce hráče D&D 5e (2014)**.
**Jeskyně a draci** a překlad pravidel z roku 2024 jsou odlišné zdroje;
jejich terminologii nemícháme s touto edicí.

- Přehled českého D&D 5e: https://dnd5esrd.d20.cz/
- Dovednosti a používání vlastností: https://dnd5esrd.d20.cz/prirucka-hrace/7-kapitola.html
- Názvy bojových akcí a stavů: https://dnd5esrd.d20.cz/prirucka-hrace/9-kapitola.html
- Názvy vybavení a balíčků: https://dnd5esrd.d20.cz/prirucka-hrace/5-kapitola.html
- Názvy kouzel: https://dnd5esrd.d20.cz/grimoar/grimoar-jmen.html
- Názvy typů a příklady nestvůr: https://dnd5esrd.d20.cz/bestiar/uvod.html

| Anglický pojem | Dřívější název v aplikaci | Sjednocený název |
|---|---|---|
| Animal Handling | Zacházení se zvířaty | Ovládání zvířat |
| Arcana | Magie | Mystika |
| Insight | Odhad | Vhled |
| Performance | Vystupování | Umění |
| Sleight of Hand | Obratnost rukou | Čachry |
| Stealth | Plížení | Nenápadnost |
| Proficiency Bonus | bonus zdatnosti | Zdatnostní bonus |
| Dash | Běh | Sprint |
| Disengage | Odpoutání | Odpoutání se |
| Dodge | Úhyb | Uhýbání |
| Ready | Připravení akce | Příprava |
| Hide | Ukrytí | Schování se |
| Grapple | Chycení | Chvat |
| Expertise (tulák) | Odbornost | Kvalifikace |
| Cunning Action | Lstivá akce | Mazaná akce |
| Aberration | aberace | zrůda |
| Monstrosity | zrůda | obluda |
| Construct | konstrukt | výtvor |

Zároveň byly sjednoceny izolované názvy nestvůr z bestiáře,
například **Abolet, Zřící, Slád, Kovatl, Skurut, Gobr,
Neviditelný stopař, Vodní div, Ent, Tlející valivec, Diblík**.

Názvy souvisejících předmětů byly sjednoceny také v kapitole
`adventuring-gear`: například **Torna, Karimatka, Brašnička na suroviny,
Ježci, Okovy, Nádobíčko** a názvy sedmi výbavových balíčků.

Anglické identifikátory (`Stealth`, `Dash`, `monster-statistics` atd.),
interní hodnoty a názvy MCP nástrojů se **nesmějí překladem měnit**.
Český slovník dovedností je v `src/lib/rulebook/czech-terms.ts`.
Regresní test v `scripts/test-rulebook.mjs` ověřuje všech 18 názvů.

Zavedené české názvy povolání a schopností se používají pouze jako
**názvosloví**. Úplné popisy povolání jsou nově napsány na základě
anglického SRD 5.1 pod licencí CC BY 4.0; česká komunitní vysvětlení
a odstavce nejsou kopírovány. Anglické zdroje zůstávají v čtečce pod
českým textem a identifikátory povolání zůstávají nezměněné.

## Terminologická revize povolání (2026-11-21)

Všechny následující úpravy se týkají **pouze názvů schopností a podtříd**.
Jejich česká podoba byla ověřena proti [3. kapitole české Příručky hráče
D&D 5e (2014)](https://dnd5esrd.d20.cz/prirucka-hrace/3-kapitola.html).
Vysvětlující texty, mechaniky, tabulky a jejich čísla se z komunitního
překladu nepřebírají. Interní názvy, klíče SRD a MCP API zůstávají anglicky.

| Povolání | Příklady sjednocených názvů |
|---|---|
| Bojovník | Mimořádný atlet; Dokonalejší kritický zásah; Zarputilec |
| Bard | Kolej znalostí; Kolej odvahy; Slovní výpad; Nedostižná dovednost |
| Klerik | Ničení nemrtvých; Doménová kouzla |
| Druid | Nestárnoucí tělo; Kruhová kouzla; Chůze krajem; Přírodní ochrana; Přírodní svatyně |
| Mnich | Klid; Smrtící dlaň |
| Čaroděj | Dračí nezlomnost; Spřízněnost s živly; Dračí vzhled |
| Paladin | Vnímání božství; Přikládání rukou; Boží úder; Čistota duše; Svatozář |
| Hraničář | Rozený průzkumník; Pravěká ostražitost; Schování se přímo před zraky; Mimořádná lovcova obrana |
| Kouzlící povolání | Sesílání rituálů; Sesílací ohniskový předmět |

Ověření názvů bylo přidáno do `scripts/test-rulebook.mjs`.
## Revize názvů kouzel a multipovolání (21. 11. 2026)

Z českého [Abecedního grimoáru D&D 5e (2014)](https://dnd5esrd.d20.cz/grimoar/grimoar-jmen.html)
byly ověřeny tyto **samostatné názvy kouzel**; jejich původní anglická
ID a popisy kouzel zůstávají nezměněné:

| Originální ID kouzla | Použitý český název |
|---|---|
| `Friends` | Přátelé |
| `Haste` | Rychlost |
| `Hold Person` | Znehybni osobu |
| `Cloudkill` | Oblak smrti |
| `Tree Stride` | Chůze stromy |
| `Passwall` | Projdi zdí |
| `Insect Plague` | Hmyzí zhouba |
| `Storm of Vengeance` | Bouře odplaty |
| `Contact Other Plane` | Mluva sfér |
| `Flesh to Stone` | Zkamenění |
| `Mass Cure Wounds` | Hromadné zhojení zranění |
| `Conjure Celestial` | Vyvolej nebešťana |
| `Conjure Fey` | Vyvolej vílu |
| `Create Undead` | Stvoř nemrtvé |
| `Dispel Evil and Good` | Rozptyl zlo a dobro |
| `Power Word Kill` | Slovo moci „ZABIJ“ |
| `Power Word Stun` | Slovo moci „OCHROM“ |

Upraven byl centrální slovník `czech-terms.ts`, plný seznam kouzel
`czech-full-rules-13.ts` a odpovídající tabulky druida.
V tabulkách a odkazech se nemění pořadí, pozice ani původní anglické klíče.

Následná revize dalších deseti názvů zahrnuje také odkaz na kouzlo
*Mluva sfér* v kapitole Šílenství a doménové kouzlo
*Hromadné zhojení zranění* u klerika. Prohledáno 21 úplných
pravidlových kapitol, 12 úplných překladů povolání a 12 souborů
stručných poznámek ke kouzlům; v těchto souborech nezůstávají
staré varianty právě opravovaných deseti názvů.
Jde o statickou kontrolu obsahu, nikoli spuštěnou testovací sadu.


Název **Multipovolání** odpovídá české
[6. kapitole Příručky hráče](https://dnd5esrd.d20.cz/prirucka-hrace/6-kapitola.html).
Anglické pravidlové ID `multiclassing` zůstalo stejné.

Regresní kontroly názvů jsou v `scripts/test-rulebook.mjs`.
## Další ověřené názvy kouzel (21. 11. 2026)

Následujících **10 individuálních názvů** bylo ověřeno podle českého
[Abecedního grimoáru D&D 5e (2014)](https://dnd5esrd.d20.cz/grimoar/grimoar-jmen.html),
pouze u položek označených *Příručka hráče*:

| Anglické ID | Český název |
|---|---|
| `Alter Self` | Změň svůj tvar |
| `Polymorph` | Proměň tvora |
| `Seeming` | Hromadné přestrojení |
| `Wall of Force` | Zeď síly |
| `Harm` | Zraň |
| `Planar Binding` | Sférická vazba |
| `Magic Jar` | Schránka života |
| `True Seeing` | Pravdivé vidění |
| `Sunburst` | Sluneční záblesk |
| `Prismatic Spray` | Spektrální sprška |
| `Feeblemind` | Slabomyslnost |
| `Mind Blank` | Ukryj mysl |

Opravy jsou provedeny v `czech-terms.ts` a `czech-full-rules-13.ts`
bez změny ID nebo pořadí kouzel. Také kapitola Sféry existence nyní
používá názvy kouzel *Zeď síly* a *Pravdivé vidění*.

**Pozor:** samostatný herní smysl *pravé vidění* (`truesight`)
v kapitolách Dobrodružství a Statistiky nestvůr není názvem
kouzla `True Seeing` a zůstává beze změny. Stejně tak obecné
slovo *proměna* v pravidlech druida není názvem kouzla `Polymorph`.

Kontroly v `scripts/test-rulebook.mjs` zahrnují nyní 29 individuálně
ověřených názvů. Testovací sada ani build se pro Draft PR nespouštěly.
## Úplné překlady ras SRD 5.1 (21. 11. 2026)

V PR #35 jsou nově **úplné české překlady 9 z 9 samostatných rasových
stránek** v anglickém SRD 5.1 (2014). Nejde pouze o stručné anotace.
Zahrnují všechny rasové rysy, věk, přesvědčení, velikost, rychlost,
jazyky, číselné hodnoty a všechny podrody skutečně uvedené v tomto SRD.

| Anglické ID stránky | Česká rasa | Podrasa v SRD 5.1 |
|---|---|---|
| `dwarf` | Trpaslík | Kopcový trpaslík |
| `elf` | Elf | Vznešený elf |
| `halfling` | Hobit | Tichošlápek |
| `human` | Člověk | – |
| `dragonborn` | Drakorozený | Tabulka 10 dračích původů |
| `gnome` | Gnóm | Skalní gnóm |
| `half-elf` | Půlelf | – |
| `half-orc` | Půlork | – |
| `tiefling` | Tiefling | – |

Základní text je **samostatně přeložen z anglického SRD 5.1 (CC BY 4.0)**.
Z české [2. kapitoly Příručky hráče 2014](https://dnd5esrd.d20.cz/prirucka-hrace/2-kapitola.html)
byly převzaty pouze ustálené názvy ras, rodů a schopností,
nikoli souvislé popisy nebo vysvětlení.

Překlad je rozdělen mezi `czech-full-races-1.ts` a
`czech-full-races-2.ts`. Na každé stránce zůstává zachováno
původní anglické ID a celé nezměněné anglické znění, které se zobrazí
za českým překladem. Integrace je v `czech-companion.ts`.
Statické porovnání s kanonickým anglickým JSON potvrdilo
**9/9 ras**, shodné počty schopností a strukturu nadpisů u všech devíti.
Tabulka dračího původu obsahuje všech **10 typů**, gnómský Kutil
všechny **3 typy zařízení**.

Byly přidány regresní kontroly v `scripts/test-rulebook.mjs`;
sada testů ani build se na Draft PR podle dohody zatím nespouštěly.

## Úplný překlad všech triků SRD 5.1 (21. 11. 2026)

Prvních **24 úplných českých popisů kouzel** je dokončeno.
Jde o **24/24 triků (0. úroveň)** v kanonickém anglickém SRD 5.1,
tedy o 24 z celkových 319 jednotlivých stránek kouzel.

- `src/lib/rulebook/czech-full-spells-1.ts`: Kyselinová koule,
  Dotek smrti, Tančící světla, Druidství, Tajemný výšleh, Ohnivá střela,
  Vedení, Světlo, Mágova ruka, Oprav, Zpráva, Drobná iluze.
- `src/lib/rulebook/czech-full-spells-2.ts`: Jedová sprška,
  Kejkle, Stvoř plamen, Mrazivý paprsek, Odolání, Posvátný plamen,
  Sukovice, Šokující sevření, Ušetři umírajícího, Taumaturgie,
  Přesný úder, Zlomyslný výsměch.

**Každý překlad** obsahuje dobu sesílání, dosah, původní kombinaci
složek V/S/M, české vysvětlení materiálních složek, trvání a úplný
popis účinků, včetně omezení a případného vývoje podle úrovně.
Vysvětlující pasáže jsou **samostatně přeložené z anglického SRD 5.1
(CC BY 4.0)**; ze zavedené české terminologie se přebírají pouze
samostatné názvy kouzel a pravidlové pojmy.

Překlady se načítají prostřednictvím `czech-companion.ts`.
Původní anglická ID, anglický obsah stránek, zdrojová metadata
i herní/MCP klíče zůstávají zachované. Czech reader zobrazuje české
znění před původním anglickým zněním.

**Statická kontrola** všech 24 kouzel potvrdila shodu všech čtyř
parametrů sesílání a kombinací složek V/S/M, zachování všech kostek
zranění a bonusů, výčtů účinků i původního pořadí ID. Zároveň je
zaveden test se specifickými kontrolami kouzel
v `scripts/test-rulebook.mjs`.
Build ani automatické testy na Draft PR podle dohody zatím
nebyly spuštěny.

## Úplné popisy kouzel 1. úrovně – první dvě dávky (21. 11. 2026)

Po dokončení všech 24 triků jsou nyní přeloženy také **první 21 z 49 kouzel 1. úrovně**, přesně v pořadí původního anglického SRD 5.1. Celkový počet úplných překladů jednotlivých kouzel je tedy **45 z 319**.

- `czech-full-spells-3.ts` – 13 kouzel: Poplach, Přátelství zvířat, Uřknutí, Požehnání, Hořící ruce, Zmam osobu, Barevná sprška, Rozkaz, Porozumění jazykům, Stvoř nebo znič vodu, Zhoj zranění, Najdi zlo a dobro, Najdi magii.
- `czech-full-spells-4.ts` – dalších 8 kouzel: Najdi jed a nemoc, Přestrojení, Přízeň bohů, Zapletení, Spěšný ústup, Vílí oheň, Falešný život, Pomalý pád.

Každá položka obsahuje původní kombinaci složek V/S/M a úplné nově formulované české podmínky sesílání, trvání a účinků včetně případného sesílání pozicí vyšší úrovně. Zavedené názvy odpovídají internímu slovníku a českému [Abecednímu grimoáru](https://dnd5esrd.d20.cz/grimoar/grimoar-jmen.html). Z tohoto webu přebíráme **pouze samostatné názvy, nikoli pravidlový text**. Úplný popis je přeložen výhradně z anglického SRD 5.1 pod licencí CC BY 4.0.

Zápisy jsou propojeny v `czech-companion.ts` se čtečkou. Anglická ID, originální anglické tělo stránek, jejich metadata a herní/MCP identifikátory jsou zachované.

**Statická kontrola:** 21/21 přeložených kouzel 1. úrovně odpovídá anglickému originálu v době sesílání, dosahu, trvání, kombinaci složek, všech původních kostkách a počtu pojmenovaných účinků. Kontroly doplňuje cílený regresní test v `scripts/test-rulebook.mjs`. **Testy a build zůstávají na Draft PR nespouštěné**.

## Dokončená kouzla 1. úrovně SRD 5.1 (21. 11. 2026)

V rámci PR #35 byly dokončeny **úplné české texty zbývajících 28 kouzel
1. úrovně**, takže nyní mají český úplný text **všechna kouzla 1. úrovně
(49/49)**. Spolu s 24 triky jde o **73/319 úplných českých popisů kouzel**.

Nově vytvořené soubory:

- `czech-full-spells-5.ts` (10 kouzel): Najdi přítelíčka, Tenserův
  létající disk, Oblak mlhy, Dobrůvka, Sádlo, Naváděcí blesk, Léčivé slovo,
  Pekelné pokárání, Hrdinství a Tašin děsivý smích.
- `czech-full-spells-6.ts` (10 kouzel): Lovcova marka, Určení,
  Iluzorní text, Způsob zranění, Skok, Dlouhokrok, Mágova zbroj,
  Magická střela, Ochrana před zlem a dobrem a Očisti jídlo a pití.
- `czech-full-spells-7.ts` (8 kouzel): Svatyně, Štít, Štít víry,
  Tichý obraz, Spánek, Mluv se zvířaty, Hromová vlna a Neviditelný služebník.

Všech **49 kouzel 1. úrovně** je napojeno přes `czech-companion.ts`.
Původní anglická ID, údaje `meta`, anglický text za českou verzí
a klíče pro herní mechaniku a MCP se nemění. České popisy vznikly
samostatným překladem anglického SRD 5.1 pod licencí CC BY 4.0.
Z komunitního českého D&D byly převzaty nanejvýš ustálené názvy,
nikoli souvislé pasáže.

**Statická kontrola podle anglického SRD:** všech **49/49** kouzel
1. úrovně má správnou dobu sesílání, dosah, trvání a složky V/S/M,
stejné kostky zranění a účinků, počet podúčinků a všechna ustanovení
`At Higher Levels`. U nových 28 překladů bylo individuálně
ověřeno také **52 klíčových pravidlových podmínek**.
Regresní kontrola pokrývající všech 49 kouzel je v
`scripts/test-rulebook.mjs`.

**Build a automatické testy na Draft PR nebyly spuštěny**;
výsledky se vztahují ke statickému porovnání zdrojů.

## Zahájení úplných popisů kouzel 2. úrovně (21. 11. 2026)

V PR #35 je doplněno prvních **12 kouzel 2. úrovně** (v pořadí anglického SRD):
Melfův kyselinový šíp, Podpora, Změň svůj tvar, Zvířecí posel,
Mystický zámek, Nystulova magická aura, Předvídání, Kůrokůže,
Slepota nebo hluchota, Rozmazání, Cejchovací úder a Uklidni emoce.

- Nový soubor `src/lib/rulebook/czech-full-spells-8.ts` obsahuje úplné nezávislé
  české překlady včetně doby sesílání, dosahu, složek, trvání, volitelných
  účinků, záchran a sesílání vyšší pozicí.
- Napojeno do české čtečky v `czech-companion.ts` bez změn anglického
  originálu, ID, metadat či herního/MCP rozhraní.
- Nový regresní test v `scripts/test-rulebook.mjs` ověřuje všech 12 ID,
  jejich pořadí, zobrazení, původní texty, složky a zásadní mechaniky.
- České ustálené názvy zůstávají v `czech-terms.ts`; žádné souvislé
  pasáže českého komunitního překladu nejsou přebírány.

**Stav: 85/319 kompletních českých popisů kouzel** (24 triků,
49 kouzel 1. úrovně, 12 kouzel 2. úrovně). Zbývá **234 kouzel**,
z toho dalších **42 kouzel 2. úrovně**. Build a test suite nebyly
podle dohody pro Draft PR spuštěny.

## Druhá dávka kouzel 2. úrovně (21. 11. 2026)

Přidáno dalších **12 úplných samostatných českých popisů**, od
**Věčného plamene** po **Poryv větru** v pořadí anglického SRD 5.1:
Věčný plamen, Tma, Vidění ve tmě, Odhal myšlenky, Zlepši vlastnost,
Zvětšení nebo zmenšení, Fascinuj, Najdi pasti, Ohnivá čepel,
Planoucí koule, Důstojný odpočinek a Poryv větru.

Nový soubor `src/lib/rulebook/czech-full-spells-9.ts` je připojen v
`czech-companion.ts`. Anglická ID, původní texty, metadata a MCP
zůstávají nedotčené. Regresní kontrola v `scripts/test-rulebook.mjs`
ověřuje původní pořadí, složky, kostky, české názvy, důležité podmínky
a nezměněný anglický originál. Účinky jsou nezávisle přeložené z
anglického SRD 5.1 (CC BY 4.0); česká komunitní terminologie je
použita pouze pro ustálené názvy.

**Stav: 97/319 úplných popisů kouzel; zbývá 222, z toho 30 kouzel
2. úrovně.** Build ani automatické testy na Draft PR nebyly spuštěny.

## Třetí dávka úplných kouzel 2. úrovně (21. 11. 2026)

V PR #35 je nově dokončeno dalších **12 úplných českých popisů**:
Rozpal kov, Znehybni osobu, Neviditelnost, Zaklep, Nižší navrácení,
Levitace, Najdi zvířata a rostliny, Najdi předmět, Magická ústa,
Magická zbraň, Zrcadlový obraz a Mlžný krok.

- Nový soubor `src/lib/rulebook/czech-full-spells-10.ts` obsahuje kompletní
  vlastní překlady kouzel č. 26–37 v pořadí 2. úrovně SRD 5.1.
- Překladová mapa je napojena do `czech-companion.ts`. Anglický
  originál, kanonická ID, metadata, mechanika hry a MCP se nemění.
- Kontroly v `scripts/test-rulebook.mjs` zahrnují pořadí, všechny čtyři
  údaje sesílání, složky V/S/M, doby trvání, dosahy, kostky, české
  názvy, klíčové výjimky a zachování anglického znění.
- České **názvy** vycházejí ze stávající terminologie projektu;
  souvislé popisy jsou samostatné překlady z anglického SRD 5.1
  (CC BY 4.0), nikoli převzaté z komunitního českého grimoáru.
- **Celkem 109/319 úplných českých popisů kouzel**. Hotovo
  **36/54 kouzel 2. úrovně**, zbývá jich **18** a celkově **210**.

Build ani automatická testovací sada zatím nebyly spuštěny, podle
dohody pro rozpracované Draft PR.

## Kompletní české popisy všech kouzel 2. úrovně SRD 5.1 (21. 11. 2026)

Dokončena všechna **54/54 kouzla 2. úrovně** podle původního anglického SRD 5.1.
Předchozí dávky obsahovaly 36 úplných popisů. Při závěrečné kontrole
bylo nalezeno vynechané kouzlo **Najdi oře (Find Steed)**, které bylo doplněno
v původním pořadí do `czech-full-spells-9.ts` mezi `enthrall` a `find-traps`.
Zbývajících 17 kouzel od **Měsíčního paprsku** po **Zónu pravdy** je nově
přeloženo v `src/lib/rulebook/czech-full-spells-11.ts`.

Nová dávka zahrnuje Měsíční paprsek, Projdi beze stop, Léčivá modlitba,
Ochrana před jedem, Paprsek slabosti, Trik s lanem, Sežehující paprsek,
Spatři neviditelné, Tříštění, Ticho, Pavoučí šplh, Trny, Duchovní zbraň,
Sugesce, Strážné pouto, Pavučina a Zóna pravdy.

Česká čtečka je rozšířena v `czech-companion.ts`. Nový regresní test
v `scripts/test-rulebook.mjs` kontroluje **všech 54 ID v přesném kanonickém
pořadí**, počty překladů ve 4 dávkách (12+13+12+17), české názvy, všechny
čtyři parametry sesílání, rituály, složky V/S/M, kostky, výjimky jednotlivých
kouzel a úplné zachování anglického textu. Opraveny též pořadové rozsahy
starších testů druhé a třetí dávky.

**Úplné české popisy kouzel: 127/319** (24 triků + 49 kouzel 1. úrovně
+ 54 kouzel 2. úrovně). **Zbývá 192 kouzel úrovní 3–9**.

Texty jsou samostatným českým překladem původního anglického SRD 5.1
(CC BY 4.0). České komunitní zdroje se používají pouze k pojmenování
jednotlivých ustálených termínů, nikoli ke kopírování pravidlových pasáží.
Anglická ID, původní anglický obsah, metadata i MCP zůstávají beze změn.

**Build a automatické testy nebyly na Draft PR spuštěny**, podle předchozí
dohody. Regresní kontroly jsou připravené v repozitáři.

## Stav

- Stručné české přehledy: 932/933 kanonických stránek (výjimkou je atribuce).
- Úplné české znění pravidlových stránek: **35/35 obsahových pravidlových stránek**.
- Úplné české překlady jednotlivých ras: **9/9 rasových stránek SRD 5.1**, včetně všech podras obsažených ve zdrojovém SRD.
- Úplné české popisy jednotlivých kouzel: **127/319** – všech **24/24 triků** a všech **49/49 kouzel 1. úrovně** a všech **54/54 kouzel 2. úrovně**.
- Dříve dokončené kapitoly zahrnují **Stavy, Nemoci, Objekty, Artefakty** a další pravidla.
- V další dávce jsou úplně přeloženy kapitoly **Jízdní zvířata a dopravní prostředky, Nástroje, Kouzelné předměty, Jedy a Inteligentní kouzelné předměty**.
- Následující dávka přeložila celé kapitoly **Zbroje**, **Šílenství** a
  **Sféry existence**, včetně tabulek a konkrétních pravidlových omezení.
- Aktuálně nově přeložené celé kapitoly **Multipovolání** a
  **Zázemí**, včetně všech tabulek a všech 26 návrhů vlastností akolyty.
- Nově přeloženy také celé kapitoly **Zbraně** a **Výdaje**, včetně
  všech 37 zbraní a tří tabulek životních nákladů, jídla a služeb.
- Nově přeložena celá kapitola **Seznamy kouzel**: **778 výskytů**
  **319 jedinečných kouzel**, v seznamech osmi povolání a 70 skupinách úrovní,
  všechny podle existujícího českého slovníku.
- Také kapitola **Božstva mnohovesmíru**: všechny úvodní popisy i **67 božstev**
  keltského, řeckého, egyptského a severského panteonu, včetně všech tabulkových hodnot.
- Dokončené základní kapitoly zahrnují také **Dobrodružství**, **Dobrodružné vybavení**, **Používání vlastností**, **Boj** a **Statistiky nestvůr**, čímž je uzavřeno všech **35/35** nelegálních pravidlových kapitol.
- Úplné české texty **všech 12 povolání SRD 5.1 (2014)** jsou nyní v
  `src/lib/rulebook/czech-full-classes-1.ts` až `czech-full-classes-12.ts`:
  obsahují zdatnosti, počáteční vybavení, 20 úrovní, kouzelné pozice, všechny
  vypsané schopnosti a **jednu úplně popsanou podtřídu na povolání**.
- U druida je zahrnuto **7 tabulek kouzel krajin**, u čaroděje všech
  **8 možností Metamagie**, u černokněžníka všech **32 mystických invokací**
  a u kouzelníka pravidla knihy kouzel.
- Úplné české texty jednotlivých kouzel, statbloků nestvůr, magických
  předmětů a ras je stále nutné dopracovat. **Další podtřídy mimo výchozí
  SRD 5.1** nejsou součástí této dokončené dávky povolání.
- Testy ověřují dostupnost úplných textů a zachování originálu, ale před
  sloučením je třeba samostatně spustit build a test suite.
