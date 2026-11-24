## Etapa 4: Revize hlavních kapitol pravidel SRD 5.1
Navazuje na sloučený PR #113 a issue #112. Výchozí commit `099bbaccafeb1341369746b019e22fee3b38f0db`. Cíl: `rebuild/fresh-upstream-2026-11-23` (nikoli main).

## Rozsah
Revize všech 36 stránek `kind: rules` ze `src/lib/rulebook/srd-5.1.json`. Již revidované samostatné katalogy (319 kouzel, 239 předmětů, 318 nestvůr, 12 povolání, 9 ras) znovu plošně nerevidovat.

## Checklist
- [ ] Inventura a úplné porovnání anglické a české stránky podle kanonického ID; d20.cz (D&D 5e 2014) jako hlavní terminologický zdroj.
- [ ] Tvorba postavy: racial-traits, beyond-1st-level, multiclassing, alignment, languages, inspiration, backgrounds, feats.
- [ ] Vybavení a ekonomika: coinage, selling-treasure, armor, weapons, adventuring-gear, tools, mounts-and-vehicles, trade-goods, expenses.
- [ ] Mechaniky: using-ability-scores, adventuring, combat, spellcasting, spell-lists, conditions.
- [ ] PJ a svět: traps, diseases, madness, objects, poisons, magic-items, sentient-magic-items, artifacts, monster-statistics, nonplayer-characters, gods-of-the-multiverse, the-planes-of-existence.
- [ ] legal-information: ověřit úplnost a zachování původních licenčních údajů, odkazů a atribuce; neměnit právní význam.
- [ ] U každé stránky zkontrolovat každou větu, tabulky, příklady, podmínky, výjimky, čísla, kostky, jednotky, Markdown a odkazy; opravit odchylky přímo v českých datech.
- [ ] Doložit 36/36 podle ID a seznam skutečných oprav; neoznačovat strukturální kontrolu za významovou revizi.

## Stav
Rozpracovaný plán, revize dosud neprovedena. Výsledky, důkazy a případné blokace budou doplněny zde. Nepřidávat další lokalizační architekturu; zachovat stávající vzor francouzštiny. Před dokončením aktualizovat větev o předchozí sloučené etapy; doporučené pořadí 4 → 5 → 6 → 7.
