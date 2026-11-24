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
- [x] SQLite v této etapě nepoužívat. Pokud bez něj nebo bez licencovaného zdrojového textu nelze něco ověřit, uvést konkrétní blokaci, počty a nepovažovat položku za dokončenou.
- [ ] Doložit pokrytí po balíčcích a typech, případné neověřitelné položky, skutečné opravy a testy načítání.

## Stav
Dílčí audit; zbývající položky checklistu nejsou odškrtnuty, protože nebyly splněny v plném rozsahu.

## Audit 2026-11-24 — dílčí výsledek (bez SQLite)

Rozsah byl zjištěn ze stromů Git na `4534058b4cbf53cf56d233a7a3ac1eb598e23bb0` a záloze `fe02afefcc3055b4992bf1cc5144dafa58d8475e`. `docs/content.md`, `scripts/import-open5e.mjs` a `scripts/fetch-content-pack.mjs` potvrzují, že úplný importovaný katalog pochází z Open5e a distribuovaného SQLite; raw API cache není v Git stromu. Dokumentace uvádí historický import 31 dokumentů včetně SRD a authored zdrojů, nikoli aktuální počty po knize. Skutečný počet a všechny identity v instalovaném katalogu proto **neověřeny**; SQLite se nečetlo ani nespouštělo. Základní SRD a `odm-expanded` nejsou v tomto součtu.

### Doložený vzorek, nikoli kompletní katalog

Sjednocení podle přesné kombinace `documentSlug + druh + slug` ze souborů `scripts/fixtures/open5e-pack-rows.json`, `pack-species-rows.json` a sedmi `reader-golden/{archetype,background,class,feat,monster,race,spell}.json`. Při překryvu má přednost golden řádek. Čísla označují pouze fixture identity.

| Dokument | Doložené kategorie a počty | Názvy | Přeložené dostupné texty | Zbývají texty |
|---|---|---:|---:|---:|
| toh | 40 ras/podras, 6 zázemí, 1 archetyp, 2 odbornosti | 49 | 3 | 46 |
| dmag | 8 kouzel | 8 | 8 | 0 |
| a5e | 2 zázemí, 3 odbornosti, 1 kouzlo | 6 | 5 | 1 |
| a5e-ag | 1 povolání, 1 zázemí, 1 archetyp | 3 | 0 | 3 |
| bfrd | 1 povolání | 1 | 0 | 1 |
| o5e | 2 zázemí, 1 rasa, 1 archetyp | 4 | 1 | 3 |
| taldorei | 2 zázemí | 2 | 0 | 2 |
| a5e-ddg | 2 zázemí | 2 | 0 | 2 |
| a5e-gpg | 1 zázemí | 1 | 0 | 1 |
| open5e | 1 archetyp | 1 | 0 | 1 |
| tob | 1 nestvůra | 1 | 0 | 1 |
| blackflag | 1 nestvůra | 1 | 0 | 1 |
| warlock | 1 kouzlo | 1 | 1 | 0 |
| spells-that-dont-suck | 1 kouzlo | 1 | 1 | 0 |
| **Celkem** | **41 ras, 16 zázemí, 2 povolání, 4 archetypy, 5 odborností, 11 kouzel, 2 nestvůry** | **81** | **19** | **62** |

81 zdrojově přesných názvů (68 odlišných českých znění, 13 ponechaných názvů). U 19 položek přeložen dostupný originální text po větách: 11 kouzel (desc, higher_level, duration), 5 odborností (desc, effects_desc, prerequisite), 3 zázemí (desc, zdatnosti, výbava, schopnost, charakteristiky). Con Artist má ve zdroji u charakteristik pouze „Coming soon!“; nic nebylo domýšleno. U kouzel nejsou ve fixture dostupné všechny údaje o škole, vyvolání, složkách, dosahu, úrovni a soustředění. Rozdělení na triky a kouzla proto není přesně doloženo; nejsou vydávána za úplný audit všech metadat. Samostatné schopnosti povolání, úplné statbloky a rasové vlastnosti dosud neprošly významovým auditem. V tomto vzorku není žádný doložený externí předmět s originálem.

### Záloha — co lze obnovit

| Kniha | Historické mapy názvů | Neauditované úplné návrhy | Orientační poznámky |
|---|---|---|---|
| Tome of Heroes (`toh`) | 65 předmětů, 91 kouzel, 13 odborností | 14 kouzel, 13 odborností | 65 předmětů, 91 kouzel |
| Deep Magic (`deepm`, `dmag`) | 56 kouzel | 12 kouzel | 56 kouzel |
| Vault of Magic (`vom`) | 249 předmětů | 48 předmětů | 249 předmětů |
| **Celkem** | **474** | **87** | **461** |

Počty spočteny z jednotlivých map ve `src/lib/content/translations/{tome-of-heroes,deep-magic,vault-of-magic}/cs-data.ts` v záloze, nikoli odhadnuté z katalogu. `docs/supplement-translation-packs.md` v záloze návrhy výslovně označuje za neauditované. V novém základu není starý registry; nepřenášel se. Převzaty byly konkrétní doložené názvy Accelerate, Abhorrent Apparition, Floriographer, Rimecaster, jejich text znovu porovnán s golden originálem. Ostatní historické návrhy bez doložené shody původu, slugu a kompletního textu zůstávají v záloze; 474 historických klíčů není počet aktuálně nainstalovaných položek. Vault of Magic má v záloze překlady, ale v kontrolovaném vzorku nemá originální řádek. **Neověřitelné položky mimo fixture: počet neznámý.**

### Načítání a kompatibilita

- Stávající `contentName` dostal zdrojově přesný český lookup; původní EN/FR tabulky a fallback zůstávají. Nová data jsou oddělená po skutečných dokumentových klíčích. Nový registry, DB schéma, mechaniky ani uložené identity nevznikly.
- `localizeEntryCs` je již volána seznamovým i detailovým API pro cs; rozšířený adaptér doplňuje pouze `data.localized_desc`, které čte `describeContentEntry` a InfoDialog. Vyžaduje shodu source=open5e, documentSlug, slug, originálního názvu a všech doložených původních polí; při změně anglického textu, chybějícím poli, jiné knize nebo homebrew ponechá angličtinu.
- ContentPicker/MultiContentPicker používají české názvy při zachování anglického výběru; usePickerGroups podporuje známé pack identity s documentSlug. Některé konzumenty předávají jen anglický název, ztrácejí ID (např. některé rasové kolize, archetypy), nebo zobrazují předem připravený inline popis (zázemí). Tam pokrytí není potvrzeno. Hledání podle českého názvu, metadata mimo dostupná pole, PDF, všechny obrazovky a živý SQLite katalog nebyly ověřeny.
- Regresní test rozšířen v existujícím `entry-descriptions-cs.test.ts` o 19 skutečných fixture textů, 81 názvů, kontrolu zachování dat, ID, homebrew a fallback při změně originálu. Test není náhrada jazykového auditu. CI na posledním kódu `3f0299092782e1e7ec1f830a8a13395155c85a55` zatím čeká; lokální clone není v tomto prostředí dostupný, runtime/build nepotvrzen.
- Terminologická kontrola proti české PH 2014: [vlastnosti a dovednosti](https://dnd5esrd.d20.cz/prirucka-hrace/7-kapitola.html), [boj a Sprint](https://dnd5esrd.d20.cz/prirucka-hrace/9-kapitola.html), [stavy](https://dnd5esrd.d20.cz/prirucka-hrace/dodatek-a.html). Nejde o doložení oficiálního českého překladu třetích stran. Ostatní názvy jsou vlastní návrhy dle originálních fixture názvů.

### Závěr

Etapa 6 **není kompletní**. Zbývá obsahová revize 62 dalších položek doloženého vzorku, zjištění originálů mimo vzorek (včetně předmětů a dalších rozšíření), audit metadat, úplné UI a CI ověření. PR ponechat otevřený jako draft. SQLite je záměrně mimo rozsah.
