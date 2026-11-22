# České překlady v Open Game Master

Tento dokument popisuje **společné zdroje překladů**. Překlady se vytvářejí pro zobrazení; **interní anglické názvy, ID, slugs, API a uložená herní data se nepřekládají**.

| Co překládáš | Kam to patří | Jak to použít |
| --- | --- | --- |
| Tlačítka, stavy, popisky, validační a systémové zprávy | `src/lib/i18n/cs.json` (`messages`, `contexts`, `plurals`) | `useT()` / `t("English source")` nebo `translate(locale, ...)` |
| Názvy kouzel, zbraní, zbrojí, vybavení, nestvůr, povolání atd. | `src/lib/content/names-cs.ts` | `contentName(kind, englishName, locale)` |
| Názvy dovedností | společný `skillLabel()` v `src/lib/srd/index.ts` | `skillLabel(skillId, locale)` |
| Zkratky vlastností | `src/lib/srd/ability-short-label.ts` | `abilityShortLabel(abilityId, locale)` |
| Dlouhé herní/pravidlové popisy | vhodný existující `src/lib/help/*-cs.ts` nebo SRD obsah | obsahový renderer (ne UI katalog) |
| Texty webu a generovaného PDF | výše uvedené společné funkce, případně `src/lib/i18n/game-text.ts` | stejné názvy v obou výstupech |

## Pravidla

1. **Texty rozhraní:** zdrojem je anglický UI klíč; česká hodnota patří do `cs.json`. Nevytvářej druhý slovník stejných UI textů ani `locale === "cs" ? "..." : "..." ` v komponentách. Pokud dva stejné anglické klíče vyžadují v různých kontextech odlišné překlady, použij `contexts`.
2. **Proměnné:** zachovej názvy placeholderů (např. `{name}`, `{level}`); pro množná čísla používej `plurals`.
3. **Herní názvy:** nekopíruj překlady z `names-cs.ts` do UI katalogu, pokud jde o dynamický název. Přelož samotný název přes `contentName()` a vlož jej do lokalizované UI šablony jako parametr.
4. **Dynamická historie:** překládej pouze bezpečně rozpoznané systémové šablony při zobrazení; nepřepisuj uživatelský či vypravěčský obsah v databázi.
5. **Výpočty:** zobrazení herního údaje může být přeloženo, herní mechanika nikoli. Zápis hodů zůstává `1d8`, `2d6`, nikoli `k`.
6. **EN/FR:** zachovávej jazykové mutace a bezpečné anglické fallbacky u homebrew neznámých názvů.

## Kontrola

- `npm run i18n:cs:report` — existující přehled pokrytí katalogu.
- `npm run i18n:cs:check` — validace překladů a placeholderů.
- `npm run i18n:cs:ui-report` — audit **literal** volání `t("...")` a `tp("...", "...")` v kampaních, postavách a sdílených komponentách; vypíše chybějící klíče s cestou a číslem řádku.
- `npm run i18n:cs:ui-check` — stejný audit v přísném režimu s nenulovým návratovým kódem při chybějících překladech. **Nezapínat plošně do CI bez vyřešení počátečního nálezu**; audit zatím nepostihuje dynamické klíče ani nekontroluje libovolné JSX literály.
- `npm run i18n:cs:ui-test` — samostatný test analyzátoru volání pomocí TypeScript AST.
- `npm test -- src/lib/i18n/czech-catalog-coverage.test.ts` — regresní kontrola úplnosti katalogu.

Po změně katalogu doporučujeme zkontrolovat editor hrdiny, deník postavy, dílnu a PDF. Další etapy: [issue #100](https://github.com/Nereziel/open-game-master/issues/100).
