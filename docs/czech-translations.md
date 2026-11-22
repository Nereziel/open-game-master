# České překlady v Open Game Master

Tento dokument popisuje **společné zdroje překladů**. Překlady se vytvářejí pro zobrazení; **interní anglické názvy, ID, slugs, API a uložená herní data se nepřekládají**.

| Co překládáš | Kam to patří | Jak to použít |
| --- | --- | --- |
| Tlačítka, stavy, popisky, validační a systémové zprávy | `src/lib/i18n/cs.json` (`messages`, `contexts`, `plurals`) | `useT()` / `t("English source")` nebo `translate(locale, ...)` |
| Názvy kouzel, zbraní, zbrojí, vybavení, nestvůr, povolání atd. | `src/lib/content/names-cs.ts` | `contentName(kind, englishName, locale)` |
| Názvy dovedností | společný `skillLabel()` v `src/lib/srd/index.ts` | `skillLabel(skillId, locale)` |
| Zkratky vlastností | `src/lib/srd/ability-short-label.ts` | `abilityShortLabel(abilityId, locale)` |
| Typy zranění, výrazy zranění a odolnosti | `src/lib/dm/damage-logic.ts` | `damageTypeWord(typeId, locale)` / `damageWords(expression, locale)`; stejné výrazy pro historii, deník i PDF |
| Dlouhé herní/pravidlové popisy | vhodný existující `src/lib/help/*-cs.ts` nebo SRD obsah | obsahový renderer (ne UI katalog) |
| Texty webu a generovaného PDF | výše uvedené společné funkce, případně `src/lib/i18n/game-text.ts` | stejné názvy v obou výstupech |

## Pravidla

1. **Texty rozhraní:** zdrojem je anglický UI klíč; česká hodnota patří do `cs.json`. Nevytvářej druhý slovník stejných UI textů ani `locale === "cs" ? "..." : "..." ` v komponentách. Pokud dva stejné anglické klíče vyžadují v různých kontextech odlišné překlady, použij `contexts`.
2. **Proměnné:** zachovej názvy placeholderů (např. `{name}`, `{level}`); pro množná čísla používej `plurals`.
3. **Herní názvy:** nekopíruj překlady z `names-cs.ts` do UI katalogu, pokud jde o dynamický název. Přelož samotný název přes `contentName()` a vlož jej do lokalizované UI šablony jako parametr.
4. **Dynamická historie:** překládej pouze bezpečně rozpoznané systémové šablony při zobrazení; nepřepisuj uživatelský či vypravěčský obsah v databázi.
5. **Výpočty:** zobrazení herního údaje může být přeloženo, herní mechanika nikoli. Zápis hodů zůstává `1d8`, `2d6`, nikoli `k`.
6. **EN/FR:** zachovávej jazykové mutace a bezpečné anglické fallbacky u homebrew neznámých názvů.


## Systémové události, stavové štítky a bezpečný překlad

Události ukládej ve strojově čitelné podobě (typ + parametry), pokud to existující schéma umožňuje. Čtenářská část sestaví lokalizovanou větu až podle aktuálního jazyka; **neukládej českou větu místo původního `delta`**.

- Historie kampaně: `src/app/campaigns/[campaignId]/event-log-logic.ts` přijímá lokalizovaný `t` z `useT()`. Zároveň překládá známé názvy z `delta` přes `contentName("items" | "spells" | "conditions" | "monsters", name, locale)`. Pro ID spotřebovaných třídních zdrojů používá `resourceDisplayName()` a pro předměty výcviku `skillLabel()`; neznámé názvy a předměty výcviku z hráčské prózy nechává beze změny.
- Historie postavy: `src/lib/characters/event-summary-cs.ts` rozpoznává pouze bezpečné historické šablony (`Acquired {item}`); nesmí rozpoznávat vícerádkový příběh.
- Nápověda stavů: `src/lib/battlemap/condition-notes.ts` používá `abilityShortLabel()` pro záchranné hody a `contentName("spells", ...)` pro známý zdrojový název kouzla; vlastní spouštěč připravené akce se nepřekládá.
- Audit polí postavy: seznam rozpoznaných strojových klíčů je jediný ve `src/lib/sheet-audit-logic.ts` (`knownFieldWords()`). Pouze rozpoznané klíče se překládají jako popisky při zobrazení; neznámé klíče a hodnoty rozšíření se zachovávají doslova.
- Zranění a odolnosti: 13 standardních typů mají **jediný** česko-francouzský katalog v `damage-logic.ts`; nevytvářej nový seznam ani nezkoušej překládat jednotlivé ID přes náhodné UI klíče. Překlad `damageTypeWord()` je jen zobrazovací. `damageWords()` zachovává zápis kostek `1d8`, `2d6` atd. Neznámý typ `dreamfire` a vlastní dovětky jako `nonmagical piercing` musí zůstat nedotčené.
- Když předáváš překladač jiné pomocné funkci, zachovej `t.locale`, pokud podle něj funkce lokalizuje obsahové názvy. Samotný obyčejný callback bez informace o locale používá bezpečný anglický fallback.

**Nedělej** plošný `replace()` anglických frází na celém deníku, v databázi ani v odpovědích AI; změnit lze pouze pevně vymezené systémové šablony. Při testování ověř vždy češtinu, angličtinu, francouzštinu, placeholdery, neznámý homebrew název i neměnnost uloženého vstupu.

Relevantní testy: `src/app/campaigns/[campaignId]/event-log-localization.test.ts`, `src/lib/battlemap/condition-notes-locale.test.ts`, `src/lib/characters/event-summary-cs.test.ts`, `src/lib/pdf/character-sheet-pdf.test.ts`.

## Český deník postavy a knihy kouzel

- Dlaždice šesti vlastností a popisky v editoru i PDF získávají zkratky **výhradně** přes `abilityShortLabel()`. Exportovaný `CS_ABILITY_ABBR` v `SheetParts.tsx` je jen kompatibilní odvozený pohled, ne druhý slovník.
- Nápověda portrétu používá `contentName("classes", ...)`, záložka kouzel z odborností využívá UI klíč `Feats`. Jména custom povolání a kouzel se neukládají přeložená.
- `SpellBook.tsx` vyhledává podle zobrazeného českého i původního anglického názvu; uživatel může zadat český dotaz bez diakritiky. Výběry a požadavky API vždy posílají původní jméno. Testuje `spell-name-search.test.ts`.
- Formulář fyzického hodu životovou kostkou (`SheetState.tsx`) používá `useT()` pro instrukce, tlačítka a `aria-label`. Nové UI klíče se přidávají **pouze do `cs.json`**, nikoli jako české podmínky v JSX. Kontroluje `czech-catalog-coverage.test.ts`.

Při pokračování Issue #100 je cílem **čeština a funkční angličtina**. Francouzský katalog se aktivně nerozšiřuje; zůstává pouze technická kompatibilita a neporušený fallback.

## Kontrola

- `npm run i18n:cs:report` — existující přehled pokrytí katalogu.
- `npm run i18n:cs:check` — validace překladů a placeholderů.
- `npm run i18n:cs:ui-report` — audit **literal** volání `t("...")` a `tp("...", "...")` v `.ts` i `.tsx` souborech kampaní, postav a sdílených komponent (nikoli v `*.test.ts`, `*.spec.ts`, stories a složkách s fixtures); vypíše chybějící klíče s cestou a číslem řádku. Funguje na Windows i Unixu.
- `node scripts/audit-cs-ui-keys.mjs --json` — strojově čitelný úplný report: chybějící klíče, duplicitní JSON klíče a **podezřelé české literály v JSX** (`title`, `placeholder`, `aria-label`, krátké texty apod.). Podezřelé JSX literály jsou **pouze kandidáti k ručnímu posouzení**: mohou zahrnovat záměrnou prózu a pravidlový obsah, nenahrazovat je automaticky.
- `npm run i18n:cs:ui-check` — přísná kontrola chybějících literal UI překladů a duplicitních katalogových klíčů, zapnutá v lokalizačním PR CI po doplnění počátečních 49 unikátních klíčů. Kandidáti na české JSX literály jsou stále informativní a dynamické klíče musí projít ručním auditem.
- `npm run i18n:cs:ui-test` — samostatný test analyzátoru volání pomocí TypeScript AST.
- `npm test -- src/lib/i18n/czech-catalog-coverage.test.ts` — regresní kontrola úplnosti katalogu.

Po doplnění chybějících UI klíčů se při auditu očekává **0 chybějících překladů a 0 duplicitních klíčů**. Oprávněný český nápis „Komunitní český překlad na d20.cz“ v JSX je pouze informativní nález. U překladů počtů se vždy používá český plurál (1, 2–4, 5+), například „úroveň / úrovně / úrovní“.

Po změně katalogu doporučujeme zkontrolovat editor hrdiny, deník postavy, dílnu a PDF. Další etapy: [issue #100](https://github.com/Nereziel/open-game-master/issues/100).
