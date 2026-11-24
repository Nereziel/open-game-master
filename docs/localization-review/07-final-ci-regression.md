## Etapa 7: Finální CI a regresní kontrola české lokalizace
Navazuje na sloučený PR #113 a issue #112. Výchozí commit `099bbaccafeb1341369746b019e22fee3b38f0db`. Cíl: `rebuild/fresh-upstream-2026-11-23` (nikoli main).

## Rozsah
Integrační ověření po sloučení etap 4–6 do `rebuild/fresh-upstream-2026-11-23`. Nepřepínat main před úspěšným ověřením. Opravit pouze skutečné chyby a regresní testy.

## Checklist
- [ ] Aktualizovat větev po merge etap 4–6; zaznamenat testovaný SHA, verzi Node a výsledky aktuálních GitHub Actions Linux smoke a Windows smoke.
- [ ] Spustit `npx tsc --noEmit`, `npm run lint`, `npm run dead-code`, `npm test`, `npm run build` a relevantní upstream kontroly; opravit příčiny selhání, nikoli vypínat testy.
- [ ] Ověřit české regresní testy `czech-book.test.ts`, `czech-locale.test.ts`, `czech-names.test.ts`, `class-resources-cs.test.ts` a EN/FR fallback.
- [ ] Ověřit 933 kanonických SRD stránek bez duplicit, zachování ID a pořadí, všechna česká pokrytí včetně 36 pravidlových stránek, a nezměněný anglický/francouzský obsah.
- [ ] Smoke test výběru jazyka, SSR/klienta, cookies, pravidlové příručky, českého vyhledávání, tvorby a editace postavy, kampaní, výběru kouzel/předmětů/odborností, metadat a exportu PDF; ověřit i dostupná rozšíření.
- [ ] Ověřit, že lokalizace nemění herní mechaniku, persistence, AI DM ani MCP. Bez migrace kampaní a bez auditu dat SQLite.
- [ ] Zaznamenat odkazy na CI a skutečné výsledky; všechny povinné kontroly zelené na finálním SHA. Pokud něco nelze spustit, uvést blokaci a neoznačovat jako hotové.

## Stav
Rozpracovaný plán, revize dosud neprovedena. Výsledky, důkazy a případné blokace budou doplněny zde. Nepřidávat další lokalizační architekturu; zachovat stávající vzor francouzštiny. Před dokončením aktualizovat větev o předchozí sloučené etapy; doporučené pořadí 4 → 5 → 6 → 7.
