## Etapa 5: Sjednocení české terminologie napříč překlady
Navazuje na sloučený PR #113 a issue #112. Výchozí commit `099bbaccafeb1341369746b019e22fee3b38f0db`. Cíl: `rebuild/fresh-upstream-2026-11-23` (nikoli main).

## Rozsah
Křížová kontrola existujících českých překladů, nikoli opakování kompletních významových revizí katalogů. Zdroj názvosloví primárně d20.cz pro D&D 5e 2014; u nedoložených termínů uvést vlastní překlad a důvod.

## Checklist
- [x] Inventarizovat identifikované terminologické zdroje: `src/lib/rulebook/czech-terms.ts`, `src/lib/content/names-cs.ts`, české pravidlové texty, UI katalog, názvy a popisy schopností, zdroje povolání a další existující lokalizační tabulky.
- [ ] Ověřit přesnou shodu názvů a mechanik: vlastnosti, dovednosti, záchranné hody, boj, typy zranění, stavy, zbroje, zbraně, vzácnost, sladění, kouzla, nestvůry, rasy a povolání.
- [ ] Dohledat všechny zbývající odkazy na starší varianty názvů Tajemný výšleh a Pekelné pokárání; prověřit také Zapletení/Omotání podle d20, nic nepřejmenovávat bez podkladu.
- [ ] Opravit skutečné nekonzistence v názvech i popisech, včetně pádů a plurálů; vyhnout se slepému globálnímu nahrazování mechanicky odlišných termínů.
- [x] Zachovat oddělená kanonická ID, názvy a data zdrojů, existující upstream lokalizační cesty a EN/FR fallback.
- [ ] Doložit auditovaná místa, rozhodnutí, výjimky a regresní testy pro sjednocené termíny.

## Stav
Provedena další rozsáhlá revize překladových dat. PR #114 byl sloučen a jeho integrační merge commit začleněn; úplné individuální doložení všech rozšířených názvů a finální CI zůstávají otevřené. Nepřidávat další lokalizační architekturu; zachovat stávající vzor francouzštiny. Před dokončením aktualizovat větev o předchozí sloučené etapy; doporučené pořadí 4 → 5 → 6 → 7.

## Provedený audit (24. 11. 2026)

- [x] Interní párování názvů podle normalizovaného anglického klíče: 322 shodných klíčů kouzel, 311 nestvůr, 239 magických předmětů, 12 povolání a 20 ras/podras. Jde o kontrolu shody existujících tabulek, nikoli o jednotlivé doložení každého názvu na d20.
- [x] Cílené vyhledání variant v 30 souborech úplných kouzel, 12 souborech povolání, 2 souborech ras, 38 souborech úplných nestvůr, 28 souborech předmětů, 21 souborech pravidel a poznámkách ke kouzlům a vybraných dalších tabulkách. Nejde o úplnou kontextovou kontrolu každé věty ani všech synonym.
- [x] Kontrola všech 12 915 zpráv v `cs.json` na vybrané termíny a oprava 55 hodnot; klíče i struktura JSON zachovány.
- [x] Ověřeny existující překladové hodnoty typů zranění; implementace zobrazovací cesty hodů a typů zranění přesunuta mimo rozsah čistě překladové revize. Předchozí funkční změny byly vráceny v `f96409b`.
- [x] Doplněny regresní případy do stávajících testů `czech-names.test.ts` a `czech-locale.test.ts`.
- [ ] Spustit regresní testy, typecheck, lint a build; pro poslední commit nebyl nalezen žádný PR workflow run. Testy nebyly lokálně spuštěny.
- [ ] Dokončit jednotlivé ověření zbývajících názvů podle d20 a kontextovou kontrolu stavů, schopností, vybavení, odborností, skloňování a dosud nepokrytých zdrojů.
- [x] Na začleněném snapshotu #114 aplikovat níže uvedené cílené změny.
- [x] Po finálním sloučení #114 ověřit případné nové změny: merge tree #114 je identický s již začleněným snapshotem; cílené kontroly katalogu a UI viz závěrečná evidence.
- [ ] Úplné živé UI ověření je v #117.
- **Mimo rozsah podle pokynu uživatele:** PDF: chybí lokalizační cesta; `src/lib/pdf/character-sheet-pdf.ts` má anglické popisky a standardní WinAnsi fonty, `sanitize` odstraňuje část českých znaků. `src/lib/pdf/download.ts` nepředává locale. Nutno napojit stávající katalog, zajistit české znaky a prověřit export. PDF není hotové.

### Rozhodnutí a výjimky
| Anglický termín | Český termín |
|---|---|
| Eldritch Blast | Tajemný výšleh (správný již v obou tabulkách) |
| Hellish Rebuke | Pekelné pokárání (správný již v obou tabulkách) |
| Entangle | Zapletení (správný již v obou tabulkách) |
| Truesight / True Seeing | Pravdivé vidění |
| Armor Class | Obranné číslo (OČ) |
| Martial weapons | Vojenské zbraně |
| Grappled / Restrained | Uchvácený / Zadržený |
| Stunned / Paralyzed | Ochromený / Paralyzovaný |
| Blinded / Deafened / Charmed | Slepý / Hluchý / Zmámený |
| Incapacitated / Exhaustion | Neschopný / Únava |
| Frost Giant | Mrazivý obr |
| Drider / Grimlock / Lizard | Dravouk / Divous / Ještěr |
| Glabrezu / Guardian Naga / Spirit Naga | Glabrez / Strážný nága / Přízračný nága |
| Arcanist's Magic Aura | Nystulova magická aura (zobrazovaný název; původní SRD ID beze změny) |
| Sphere of Annihilation / Talisman of the Sphere | Koule anihilace / Talisman koule |

Zdroje: [Příručka hráče 2014](https://dnd5esrd.d20.cz/prirucka-hrace/), [Bestiář 2014](https://dnd5esrd.d20.cz/bestiar/), [Průvodce Pána jeskyně 2014](https://dnd5esrd.d20.cz/pruvodce-pana-jeskyne/), [kartotéka kouzel d20](https://kartoteky.d20.cz/dnd/kouzla). Při rozdílu v názvosloví mezi zdroji preferovat název konkrétního záznamu z příslušné příručky. U obrů ponechat existující názvy předmětů opasek/lektvar síly ledového obra podle DMG; v názvu samotné nestvůry preferovat Mrazivý obr. Omotávací lano je samostatný předmět, nikoliv kouzlo Entangle; Mystický výboj (Arcane Jolt) je samostatná schopnost, nikoliv Eldritch Blast. Tato místa se nesmějí hromadně nahrazovat.

### Původní fronta změn po #114 (výsledky viz níže)
- `czech-full-rules-3.ts`: názvy stavů Oslepený, Okouzlený, Ohlušený, Vyčerpání, Omráčený a odpovídající tvary ve vysvětleních; sjednotit s 2014 a rozlišovat obecné vyčerpání od stavu Únava.
- `czech-full-rules-9.ts`: čtyři výskyty válečné zbraně v tabulce multiklasování.
- `czech-full-rules-11.ts`: čtyři výskyty válečných zbraní v kapitole o zbraních.
- `czech-full-rules-17.ts` a `czech-full-rules-21.ts`: Pravé vidění / pravým viděním → Pravdivé vidění / pravdivým viděním.
- `czech-full-rules-13.ts`: názvy Tajemný výšleh, Pekelné pokárání a Zapletení ponechat, pokud budou po revizi stále správně.
- Vše znovu ověřit vůči aktuálnímu znění po #114; uvedená místa jsou nálezy ve výchozí větvi, nikoliv pokyn k bezkontextovému nahrazení.

### Commity
- `ea1c2a2` — sjednocení českých zobrazovaných názvů a UI.
- `64c6891` — názvy nestvůr a magických předmětů.
- `3501b9b` — české zobrazování typů zranění, hodů a regresní případy.
- `3055b3a` — Pravdivé vidění v poznámce ke kouzlu.

Historický stav před sloučením #114; nyní je #114 sloučen, #115 zatím Draft. Etapu #112-5 zatím neoznačovat jako dokončenou.

## Pokračování — pouze překladová data

Rozsah upřesněn uživatelem: neopravovat logiku aplikace, načítání lokalizace ani PDF. Předchozí změny v `src/lib/dm/damage-logic.ts` a `src/lib/roll-labels.ts` byly vráceny přesně na výchozí blob; odpovídající test funkční změny odstraněn. Existující překladové hodnoty a testy názvosloví zůstávají.

- [x] Cílený průchod 38 soubory úplných statbloků; 29 souborů upraveno (284 evidovaných oprav názvů stavů a příslušných textů; navíc opraven název Divous v popisu). Imunity vůči stavům používají stejné názvy jako tabulka stavů; jednotlivé popisy opravovány v kontextu.
- [x] Cílený průchod všech 30 souborů úplných kouzel; 31 výskytů stavů a pravdivého vidění opraveno ve 13 souborech. Navíc ještěr v Najdi přítelíčka.
- [x] Cílený průchod všech 28 souborů magických předmětů; 7 dalších oprav ve 6 souborech.
- [x] Průchod 12 soubory poznámek ke kouzlům a vybranými poznámkami k předmětům/nestvůrám; 33 oprav. Nižší navrácení: Paralyzed je paralyzovaný, nikoli ochromený.
- [x] Průchod 12 soubory povolání, 2 soubory ras a dvěma soubory guidance; 11 oprav v 5 souborech.
- [x] Dalších 30 opravených UI hodnot v `cs.json` (celkem 85 změněných řádků proti výchozímu stavu); 12 915 klíčů zpráv a struktura zachovány.
- [x] Trojzubec místo Trident; Ještěr místo Ještěrka u Lizard. Giant Lizard zůstává Obří ještěrka.
- [x] Primární zdroje přímo ověřeny: [Dodatek A – stavy](https://dnd5esrd.d20.cz/prirucka-hrace/dodatek-a.html), [kapitola 5 – vybavení](https://dnd5esrd.d20.cz/prirucka-hrace/5-kapitola.html), [kapitola 11 – kouzla](https://dnd5esrd.d20.cz/prirucka-hrace/11-kapitola.html), [Obři](https://dnd5esrd.d20.cz/bestiar/obri.html), [seznam nestvůr](https://dnd5esrd.d20.cz/pruvodce-pana-jeskyne/dodatek-B.html), [poklad](https://dnd5esrd.d20.cz/pruvodce-pana-jeskyne/7-kapitola.html).
- [x] Výjimky: běžné vyčerpání zásob, nábojů nebo použití se nemění na stav Únava. Sražení k zemi jako děj, oslepnutí/ohluchnutí jako děj a chytání balvanu jako akce nejsou slepě přejmenovávány. Válečná sekera a Válečné kladivo jsou vlastní názvy zbraní; kategorie zbraní je vojenské. Mrazivý obr je název konkrétního statbloku, i když seznamy a názvy některých předmětů používají ledový obr.
- [ ] Zbývá úplná individuální kontrola termínů mimo cílený průchod, především všech názvů odborností a schopností a méně obvyklých variant v rozšířeních; externí balíčky souběžně řeší #116.
- [x] Kapitoly aktuálního snapshotu #114 začleněny a terminologicky upraveny; viz následující část. PR #114 je otevřený, nesloučený.
- [ ] Testy nebyly spuštěny; technické ověření mimo tento překladový průchod.

Nové commity: `83fd932`, `57aa1db`, `35c4505`, `ee67b00` (statbloky), `f96409b` (oddělení logiky), `c96088e`, `f0f9ea5` (kouzla), `62cddfa`, `92b5ad9`, `3422af0`, `76d2447`, `8a9e20d`, `f0d0d50` (povolání, guidance a UI), `57c7c68` (předměty), `c775c9b`, `e83a5aa` (poznámky), `74b600f` (Ještěr, Trojzubec).

## Odbornosti, schopnosti a integrace #114 (24. 11. 2026)

- [x] Všech 72 názvů z `src/lib/srd/authored-feats.json` má český klíč v tabulce feats (původně 7, doplněno 65). Názvy z PHB 2014 a Xanathara porovnány s [PHB, kap. 6](https://dnd5esrd.d20.cz/prirucka-hrace/6-kapitola.html) a [Xanatharem, kap. 1](https://dnd5esrd.d20.cz/xanathar/1-kapitola.html). Popisy odborností nejsou součástí této kontroly názvů.
- Vlastní pracovní názvy pro 15 odborností z Tashy bez jednoznačně ověřeného českého zdroje: Fey Touched, Shadow Touched, Telekinetic, Telepathic, Eldritch Adept, Metamagic Adept, Skill Expert, Chef, Crusher, Piercer, Slasher, Poisoner, Gunner, Fighting Initiate, Artificer Initiate. Přeloženy významově, nikoli označeny za doložené názvy d20.
- [x] Všech 211 unikátních dvojic povolání–schopnost ze `class-features.json` má český název. Porovnáno s 12 českými kapitolami povolání; sjednoceny Rychlé ruce, Zvířecí podoba (vylepšení) a Rozený průzkumník (vylepšení). Zdroj: [PHB, kap. 3](https://dnd5esrd.d20.cz/prirucka-hrace/3-kapitola.html). Samostatné názvy vylepšení na kartách nemusejí mít vlastní nadpis v knize.
- [x] Porovnáno 1544 klíčů classFeatures s 417 klíči resourceFeatureNames. Sjednoceno 111 odlišných hodnot u jednoznačně párovaných názvů; po opravách všech 372 jednoznačných společných klíčů souhlasí. Vlastní žánrová pojmenování zůstávají vlastními překlady; shoda tabulek není individuální revizí významu každé externí schopnosti.
- [x] Integrační merge commit `33d924b` převzal všech 24 souborů z #114 na revizi `c654d347`; před integrací žádný překryv změněných souborů. #114 nebyl sloučen do cílové větve. Při případné další změně #114 synchronizovat znovu.
- [x] Prohledáno 21 integrovaných souborů pravidel, companion a extensions. Vojenské zbraně, Pravdivé vidění a uvedené názvy kouzel již byly v dotčených kapitolách sjednoceny. Ve třech kapitolách a companion opraveny zbývající názvy stavů, únava a zmámení. Číselné tokeny a odkazy page: ve všech čtyřech změněných souborech zůstaly identické s #114.
- [x] Přidány tři regresní testy: odbornosti, schopnosti základních povolání, shoda jednoznačných společných názvů. Nezávislá strukturální kontrola dat: 0 chybějících názvů odborností, 0 chybějících názvů schopností základních povolání, 0 neshod jednoznačných společných klíčů.
- [ ] Vitest, typecheck, lint a build nebyly v tomto průchodu spuštěny. Úplné individuální ověření zbývajících externích schopností a vlastní názvy Tashy zůstávají otevřené.

Commity: `c7b2a9a`, `33d924b`, `01c8a6e`, `b275f8e`, `a373d27`, `603d895`, `5f2684c`, `22d3ea8`, `592510b`. Žádná nová aplikační logika.

## Integrační kontrola po sloučení #114

- [x] Integrační základ `6d637f9ecbf772129146d2641d58391ac0cf73dc`; Git tree `e209d2af7500962af2f489637164bc8624b279ca` je identický s dříve začleněným snapshotem #114 `c654d347`. Merge do této větve `43a37e6` zachoval beze změny tree předchozího #115. Bez konfliktů.
- [x] Znovu ověřeno skutečné pokrytí názvů: 72/72 odborností, 211/211 unikátních dvojic základních povolání a divotvůrce, 106/106 vestavěných rozšířených archetypů a 540/540 jejich schopností, 733/733 žánrových schopností (36 povolání). Všech 733 má také neprázdný překlad popisu podle původního klíče v CS katalogu; Alkahest má správně identický zápis názvu (známá chyba testu #117).
- [x] Křížová kontrola 1544 klíčů schopností a 417 názvů resourceFeatureNames: všech 372 jednoznačných společných klíčů souhlasí. Všech 136 přímo párovatelných resource ID z resource-names-cs-extra.ts souhlasilo před dodatečnou synchronní opravou Unwavering Mark. U 47 přímo párovatelných UI klíčů jsou po opravě rozdíly pouze kontextové: Order = Pořadí (řazení UI, nikoli schopnost Řád) a (expertise) = (kvalifikace) (závorky zachovány).
- [x] Opraveno 21 dalších hodnot UI: 2 věty s odkazy na kouzla (Tajemný výšleh, Sežehující paprsek), 6 názvů schopností a dalších 13 UI hodnot (např. Božská přízeň, Čchi, Ochromující úder, Kvalifikace, Technika otevřené ruky). Unwavering Mark sjednocen ve třech tabulkách na Neoblomná kořist, podle Xanathara. Storm Herald: Bouřlivá aura, Bouřlivá duše, Štítová bouře; Odvracení nemrtvých sjednoceno v kapitole klerika. Zdroje: [PHB 3](https://dnd5esrd.d20.cz/prirucka-hrace/3-kapitola.html), [PHB 6](https://dnd5esrd.d20.cz/prirucka-hrace/6-kapitola.html), [Xanathar 1](https://dnd5esrd.d20.cz/xanathar/1-kapitola.html), [Kouzelník / Zpěv meče](https://dnd5esrd.d20.cz/soupis/kouzelnik.html).
- [x] CS UI: 12 915 klíčů, celkem 105 změněných hodnot proti integračnímu základu, totožné klíče, plurály a zástupné proměnné. 6/6 názvů vlastností shodných s UI; 18 názvů dovedností v českých datech, všech 8 přesně párovatelných UI hodnot shodných. Halfling v katalogu jazyků je Půlčíkština, odlišný pojem od rasy Hobit. Anglický a francouzský SRD, francouzský UI katalog a tabulka názvů, zdrojové feat/class/subclass JSON a resolver názvů mají stejné Git blob SHA jako integrační základ. Diff je omezen na česká data, testy a dokumentaci.
- [x] Nové testy odborností a základních schopností používají přímo existující resolvery, bez vlastního kopírování normalizačních regexů; test společných názvů má čtyři konkrétní regresní případy. Úplná shoda 372 klíčů ověřena nezávisle staticky, nikoli spuštěním Vitestu.
- [x] 15 nedoložených názvů z Tashy porovnáno s mechanikami vestavěných anglických odborností. D20 [odkazuje na pracovní podklady](https://www.d20.cz/diskuze/pravidla-diskuze/51780.html), cílová složka nebyla dostupná (404). Ponechány vlastní české názvy: Dotčený vílami / stínem (původ magie), Telekinetik / Telepat (pohyb a komunikace myslí), Znalec tajemných vzývání / metamagie (existující názvy mechanik), Expert na dovednosti (zdatnost a kvalifikace), Kuchař (příprava pokrmů), Drtič / Bodavec / Sekáč (druhy zranění), Travič (jedy), Střelec z palných zbraní (zdatnost se střelnými zbraněmi), Zasvěcenec boje / divotvůrců (bojový styl nebo kouzla a náčiní divotvůrce). Nejde o doložené komunitní názvy; anglický význam zachován.
- [ ] Zbývá nezávislé jednotlivé doložení dalších rozšířených názvů podle d20, kde příslušný překlad existuje. Pokrytí názvů a shoda tabulek nejsou ekvivalentem úplného jazykového auditu všech 540 schopností. Externí balíčky řeší #116.

### Předání technických a obsahových omezení do #117

- `src/lib/help/index.ts:describeFeature` překládá přes UI katalog pouze classText; subclassFeatureDescription, exactSrdText, volby a další fallbacky vracejí EN. Všech 540 popisů z vestavěného subclasses.json nemá přesný klíč v cs.json. Je nutno doplnit české texty v existujícím mechanismu a lokalizovat zobrazovací resolver, nikoliv měnit pravidla.
- `useFeatDescs.ts` načítá původní text přes packFeatText; žádný z 72 popisů vestavěných odborností nemá přesný klíč v cs.json. Zobrazovací text oddělit od EN textu pro feat engine. Názvy již fungují přes contentName; plný překlad popisů tím není prokázán. PDF a zobrazovací logika hodů / typů zranění nadále #117.
- #114 Linux [45374480459](https://github.com/Nereziel/open-game-master/actions/runs/45374480459): lint prošel, 6/6 browser jobů prošlo, Knip a dva testovací shardy selhaly; logy prokázaly dříve známé Knip, Alkahest a dvě upstream inventury. #115 před integračními změnami [45378615980](https://github.com/Nereziel/open-game-master/actions/runs/45378615980): lint prošel, dead-code selhal, browser buildy prošly před zrušením jobů; testy zrušeny. Nové CI po synchronizaci a následných commitech se rušilo při novém pushi. Nelze z toho odvodit úspěch nových regresních testů ani absenci nové chyby.
- Lokální npm příkazy nebyly provedeny: checkout přes GitHub v sandboxu selhal na DNS. #117 již řeší zděděná selhání; nepřenášet sem jeho opravy. Finální CI musí odpovídat finálnímu SHA; neoznačovat zrušené či nedokončené kontroly za úspěšné.

Commity nového průchodu: `43a37e6`, `2301222`, `1d0051a`, `2a48418`, `94e44cd`, `027ff47`, `7273d61`, `c69794f`, `e223d3b`, `7de6e1b`, `b7bf2ec`. Žádná změna produkční aplikační logiky. Před případným merge znovu ověřit CI, head/base a splnění podmínky bez nových regresí.
