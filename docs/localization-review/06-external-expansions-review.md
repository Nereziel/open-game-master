## Etapa 6: Kontrola překladů externích rozšíření
Navazuje na sloučený PR #113 a issue #112. Výchozí commit `099bbaccafeb1341369746b019e22fee3b38f0db`. Cíl: `rebuild/fresh-upstream-2026-11-23` (nikoli main).

## Rozsah
Inventura všech skutečně dostupných externích zdrojů (např. Tome of Heroes, pokud je přítomen). Oddělit zdroje od SRD a odlišit skutečnou dostupnost v čistém upstreamu od pouhé existence překladu v záloze.

## Checklist
- [ ] Zjistit katalogy a existující lokalizační cesty na aktuálním základu, přesné počty podle zdroje a typu; porovnat se zálohou `backup/pre-upstream-restart-2026-11-23`.
- [ ] Zkontrolovat, zda aplikace opravdu načítá názvy, popisy a metadata rozšíření v češtině stejnou cestou jako francouzštinu; chybějící podporu zdokumentovat.
- [ ] Pro dostupné zdrojové texty ověřit názvy i úplné věty, pravidlové podmínky, čísla, kostky a metadata předmětů, kouzel, odborností, schopností, ras/povolání, zázemí a nestvůr podle skutečného katalogu.
- [ ] Použít d20 pro doložené termíny; jinak přirozená čeština v duchu D&D, bez domýšlení pravidel nebo záznamů.
- [ ] Převzít existující hotové překlady ze zálohy, zachovat oddělení zdrojů, slugy a identity; nepřidávat nový registry či zásahy do herního enginu.
- [ ] SQLite v této etapě nepoužívat. Pokud bez něj nebo bez licencovaného zdrojového textu nelze něco ověřit, uvést konkrétní blokaci, počty a nepovažovat položku za dokončenou.
- [ ] Doložit pokrytí po balíčcích a typech, případné neověřitelné položky, skutečné opravy a testy načítání.

## Stav
Rozpracovaný plán, revize dosud neprovedena. Výsledky, důkazy a případné blokace budou doplněny zde. Nepřidávat další lokalizační architekturu; zachovat stávající vzor francouzštiny. Před dokončením aktualizovat větev o předchozí sloučené etapy; doporučené pořadí 4 → 5 → 6 → 7.
