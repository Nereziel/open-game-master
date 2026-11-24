## Etapa 4: Revize hlavních kapitol pravidel SRD 5.1
Navazuje na sloučený PR #113 a issue #112. Výchozí commit `099bbaccafeb1341369746b019e22fee3b38f0db`. Cíl: `rebuild/fresh-upstream-2026-11-23` (nikoli main).

## Rozsah
Revize všech 36 stránek `kind: rules` ze `src/lib/rulebook/srd-5.1.json`. Již revidované samostatné katalogy (319 kouzel, 239 předmětů, 318 nestvůr, 12 povolání, 9 ras) znovu plošně nerevidovat.

## Checklist
- [ ] Inventura a úplné porovnání anglické a české stránky podle kanonického ID; d20.cz (D&D 5e 2014) jako hlavní terminologický zdroj.
- [x] Tvorba postavy: racial-traits, beyond-1st-level, multiclassing, alignment, languages, inspiration, backgrounds, feats.
- [x] Vybavení a ekonomika: coinage, selling-treasure, armor, weapons, adventuring-gear, tools, mounts-and-vehicles, trade-goods, expenses.
- [x] Mechaniky: using-ability-scores, adventuring, combat, spellcasting, spell-lists, conditions.
- [x] PJ a svět: traps, diseases, madness, objects, poisons, magic-items, sentient-magic-items, artifacts, monster-statistics, nonplayer-characters, gods-of-the-multiverse, the-planes-of-existence.
- [x] legal-information: ověřit úplnost a zachování původních licenčních údajů, odkazů a atribuce; neměnit právní význam.
- [ ] U každé stránky zkontrolovat každou větu, tabulky, příklady, podmínky, výjimky, čísla, kostky, jednotky, Markdown a odkazy; opravit odchylky přímo v českých datech.
- [x] Doložit 36/36 podle ID a seznam skutečných oprav; neoznačovat strukturální kontrolu za významovou revizi.

## Stav
Významové porovnání celých 36/36 stránek s anglickým Markdownem provedeno, terminologická kontrola d20 průběžná (ne všechny názvy ověřeny). Porovnání textů je dokončeno, stručné souhrny upraveny; strukturální kontrola ID a interních odkazů prošla; CI dosud bez finálního výsledku. Terminologické názvy bez jednoznačného doložení na d20 zůstávají otevřené pro následnou etapu sjednocení (#112). Nepřidávat další lokalizační architekturu; zachovat stávající vzor francouzštiny. Před dokončením aktualizovat větev o předchozí sloučené etapy; doporučené pořadí 4 → 5 → 6 → 7.

## Průběžná evidence podle ID

- [x] `inspiration` — porovnán plný český text s EN, opravy commitnuty.
- [x] `coinage` — porovnán plný český text s EN, opravy commitnuty.
- [x] `selling-treasure` — porovnán plný český text s EN, opravy commitnuty.
- [x] `languages` — porovnán plný český text s EN, opravy commitnuty.
- [x] `trade-goods` — porovnán plný český text s EN, opravy commitnuty.
- [x] `feats` — porovnán plný český text s EN, opravy commitnuty.
- [x] `nonplayer-characters` — porovnán plný český text s EN, opravy commitnuty.
- [x] `racial-traits` — porovnán plný český text s EN, opravy commitnuty.
- [x] `beyond-1st-level` — porovnán plný český text s EN, opravy commitnuty.
- [x] `alignment` — porovnán plný český text s EN, opravy commitnuty.
- [x] `objects` — porovnán plný český text s EN, opravy commitnuty.
- [x] `conditions` — porovnán plný český text s EN, opravy commitnuty.
- [x] `diseases` — porovnán plný český text s EN, opravy commitnuty.
- [x] `artifacts` — porovnán plný český text s EN, opravy commitnuty.

Commity: `ff1ec9f2`, `3a98a9cc`, `b87e76a2`. D20 reference: [PHB 4](https://dnd5esrd.d20.cz/prirucka-hrace/4-kapitola.html), [PHB 5](https://dnd5esrd.d20.cz/prirucka-hrace/5-kapitola.html), [PHB 6](https://dnd5esrd.d20.cz/prirucka-hrace/6-kapitola.html), [stavy](https://dnd5esrd.d20.cz/prirucka-hrace/dodatek-a.html), [DMG 7](https://dnd5esrd.d20.cz/pruvodce-pana-jeskyne/7-kapitola.html), [DMG 8](https://dnd5esrd.d20.cz/pruvodce-pana-jeskyne/8-kapitola.html). Při rozporu v mechanice je autoritativní SRD: 1 pl = 20 el; Dračí jablko sesílá zhoj zranění na 5. úrovni za 3 náboje. Nepřebírat nesouvisející obsah PHB/DMG.

- [x] `armor` — porovnán plný text s EN; opravy commitnuty.
- [x] `madness` — porovnán plný text s EN; opravy commitnuty.
- [x] `legal-information` — české znění doplněno, anglická atribuce a URL zachovány.
- [x] `mounts-and-vehicles` — porovnán plný text s EN; opravy commitnuty.
- [x] `tools` — porovnán plný text s EN; opravy commitnuty.
- [x] `magic-items` — porovnán plný text s EN; opravy commitnuty.
- [x] `sentient-magic-items` — porovnán plný text s EN; opravy commitnuty.
- [x] `poisons` — porovnán plný text s EN; opravy commitnuty.

Další commity: `4391c0fd`, `b6ace4f7`, `c20e061c`, `b25b4b6f`, `aef7e3da`, `e4c732c1`.

- [x] `multiclassing` — plný text porovnán s EN a opraven.
- [x] `the-planes-of-existence` — plný text porovnán s EN a opraven.
- [x] `backgrounds` — plný text porovnán s EN a opraven.
- [x] `weapons` — plný text porovnán s EN a opraven.

Commity: `dd80ef59`, `7b42c954`, `e8f76625`, `6c6fd65b`. V tabulce zbraní zachovány původní stopy a dostřely SRD, nikoli odlišná čísla v českém PHB. Tvorba postavy odškrtnuta pro porovnání plného textu, sjednocení souhrnů stále otevřené.

- [x] `expenses` — plný text/seznam porovnán s EN a opraven.
- [x] `spell-lists` — plný text/seznam porovnán s EN a opraven.
- [x] `gods-of-the-multiverse` — plný text/seznam porovnán s EN a opraven.
- [x] `traps` — plný text/seznam porovnán s EN a opraven.

Commity: `e4c4abb6`, `0bd1858c`, `babd6853`, `83d12f9d`. Seznamy kouzel: 778 položek EN i CS, totožné rozdělení, 115 upravených výskytů (56 různých názvů); mapování na již revidované názvy, beze změny katalogu kouzel. Pasti: ověřeny všechny tabulky, podmínky a příklady.

- [x] `spellcasting` — porovnány podmínky, příklady, složky a sesílání.
- [x] `adventuring` — porovnány pohyb, vnímání, odpočinek a mezidobí.
- [x] `adventuring-gear` — porovnány texty, balíčky a všechny tabulky cen a hmotností.

Commity: `58444bbd`, `2c78c47c`, `820fcb0b`.

- [x] `using-ability-scores` — porovnání vlastností, dovedností, konfliktů, tabulek a hodů.
- [x] `combat` — porovnání všech akcí, pohybu, útoků, zranění, léčení a boje na zvířeti/pod vodou.
- [x] `monster-statistics` — porovnání typů, smyslů, tabulek, sesílání a legendárních akcí.

Commity: `c27332f4`, `120d2d75`, `3424a1ab`, `19121cec`, `0d6ef6ac`. Souhrny pravidel sjednoceny s plnými texty. Výjimky importu EN (neúplná XP tabulka, poškozený odstavec o sesílání nestvůr) ponechány s vysvětlením v CS.

## Závěrečná kontrola
- [x] 35 neprázdných plných překladů v 21 souborech + česká licenční poznámka a původní anglická atribuce = 36/36.
- [x] Žádná ID mimo rozsah a žádný chybějící interní odkaz `page:` oproti anglickým textům 35 plných překladů.
- [x] Anglický katalog a samostatné katalogy kouzel, předmětů, nestvůr, ras a povolání nezměněny; žádná změna enginu či způsobu načítání.
- [x] Opraveny také stručné české přehledy a sjednoceny definice stavů (`54852924`).
- [ ] Konečné CI: Windows a Linux smoke — dosud neověřen konečný výsledek. Lokální build nebyl spuštěn.
- [ ] Terminologie bez jednoznačného potvrzení na d20: zejména vlastní jména a některé názvy nestvůr, předmětů a kouzel citované v pravidlech. Plošná kontrola samostatných katalogů je mimo tento PR.

Další terminologické zdroje: [PHB 7](https://dnd5esrd.d20.cz/prirucka-hrace/7-kapitola.html), [PHB 9](https://dnd5esrd.d20.cz/prirucka-hrace/9-kapitola.html), [Bestiář – úvod](https://dnd5esrd.d20.cz/bestiar/uvod.html).
