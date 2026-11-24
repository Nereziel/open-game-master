## Etapa 5: Sjednocení české terminologie napříč překlady
Navazuje na sloučený PR #113 a issue #112. Výchozí commit `099bbaccafeb1341369746b019e22fee3b38f0db`. Cíl: `rebuild/fresh-upstream-2026-11-23` (nikoli main).

## Rozsah
Křížová kontrola existujících českých překladů, nikoli opakování kompletních významových revizí katalogů. Zdroj názvosloví primárně d20.cz pro D&D 5e 2014; u nedoložených termínů uvést vlastní překlad a důvod.

## Checklist
- [ ] Inventarizovat terminologické zdroje: `src/lib/rulebook/czech-terms.ts`, `src/lib/content/names-cs.ts`, české pravidlové texty, UI katalog, názvy a popisy schopností, zdroje povolání a další existující lokalizační tabulky.
- [ ] Ověřit přesnou shodu názvů a mechanik: vlastnosti, dovednosti, záchranné hody, boj, typy zranění, stavy, zbroje, zbraně, vzácnost, sladění, kouzla, nestvůry, rasy a povolání.
- [ ] Dohledat všechny zbývající odkazy na starší varianty názvů Tajemný výšleh a Pekelné pokárání; prověřit také Zapletení/Omotání podle d20, nic nepřejmenovávat bez podkladu.
- [ ] Opravit skutečné nekonzistence v názvech i popisech, včetně pádů a plurálů; vyhnout se slepému globálnímu nahrazování mechanicky odlišných termínů.
- [ ] Zachovat oddělená kanonická ID, názvy a data zdrojů, existující upstream lokalizační cesty a EN/FR fallback.
- [ ] Doložit auditovaná místa, rozhodnutí, výjimky a regresní testy pro sjednocené termíny.

## Stav
Rozpracovaný plán, revize dosud neprovedena. Výsledky, důkazy a případné blokace budou doplněny zde. Nepřidávat další lokalizační architekturu; zachovat stávající vzor francouzštiny. Před dokončením aktualizovat větev o předchozí sloučené etapy; doporučené pořadí 4 → 5 → 6 → 7.
