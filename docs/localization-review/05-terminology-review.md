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
Provedena další rozsáhlá revize překladových dat. Úplná individuální kontrola všech názvů, integrace #114 a finální CI zatím nejsou potvrzeny. Nepřidávat další lokalizační architekturu; zachovat stávající vzor francouzštiny. Před dokončením aktualizovat větev o předchozí sloučené etapy; doporučené pořadí 4 → 5 → 6 → 7.

## Provedený audit (24. 11. 2026)

- [x] Interní párování názvů podle normalizovaného anglického klíče: 322 shodných klíčů kouzel, 311 nestvůr, 239 magických předmětů, 12 povolání a 20 ras/podras. Jde o kontrolu shody existujících tabulek, nikoli o jednotlivé doložení každého názvu na d20.
- [x] Cílené vyhledání variant v 30 souborech úplných kouzel, 12 souborech povolání, 2 souborech ras, 38 souborech úplných nestvůr, 28 souborech předmětů, 21 souborech pravidel a poznámkách ke kouzlům a vybraných dalších tabulkách. Nejde o úplnou kontextovou kontrolu každé věty ani všech synonym.
- [x] Kontrola všech 12 915 zpráv v `cs.json` na vybrané termíny a oprava 55 hodnot; klíče i struktura JSON zachovány.
- [x] Ověřeny existující překladové hodnoty typů zranění; implementace zobrazovací cesty hodů a typů zranění přesunuta mimo rozsah čistě překladové revize. Předchozí funkční změny byly vráceny v `f96409b`.
- [x] Doplněny regresní případy do stávajících testů `czech-names.test.ts` a `czech-locale.test.ts`.
- [ ] Spustit regresní testy, typecheck, lint a build; pro poslední commit nebyl nalezen žádný PR workflow run. Testy nebyly lokálně spuštěny.
- [ ] Dokončit jednotlivé ověření zbývajících názvů podle d20 a kontextovou kontrolu stavů, schopností, vybavení, odborností, skloňování a dosud nepokrytých zdrojů.
- [ ] Po začlenění #114 aplikovat níže uvedené změny na aktualizované kapitoly, poté ověřit celý katalog a UI.
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

### Fronta změn po #114 (zatím bez editace dotčených kapitol)
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

PR #114 je stále otevřený; tato větev zůstává Draft, bez merge. Etapu #112-5 zatím neoznačovat jako dokončenou.

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
- [ ] Kapitoly #114: čeká se na začlenění, bez zásahů z této větve. Stav #114 při kontrole: otevřený, nesloučený.
- [ ] Testy nebyly spuštěny; technické ověření mimo tento překladový průchod.

Nové commity: `83fd932`, `57aa1db`, `35c4505`, `ee67b00` (statbloky), `f96409b` (oddělení logiky), `c96088e`, `f0f9ea5` (kouzla), `62cddfa`, `92b5ad9`, `3422af0`, `76d2447`, `8a9e20d`, `f0d0d50` (povolání, guidance a UI), `57c7c68` (předměty), `c775c9b`, `e83a5aa` (poznámky), `74b600f` (Ještěr, Trojzubec).
