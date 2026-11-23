# Česká lokalizace doplňků Open5e mimo SRD

Rozšíření společné překladové vrstvy pro Issue #100 a PR #106. Překlady jsou vlastní autorské české texty na základě pravidlových dat, ne oficiální české edice knih. Zdrojová herní data zůstávají nezměněná a autorské/licenční informace Open Gaming License (OGL) se dále vedou u jednotlivých knih a jejich řádků.

## Ověřený stav proti originálním datům Open5e

| Kniha (identifikátor) | Záznamů v Open5e | České názvy | České popisy |
| --- | ---: | ---: | ---: |
| Tome of Heroes (`toh`): kouzla | 91 | 91 | 14 úplných pravidlových textů, 77 přehledů |
| Tome of Heroes (`toh`): odbornosti | 13 | 13 | 13 úplných českých pravidlových textů |
| Tome of Heroes (`toh`): předměty, zbraně a zbroje | 65 | 65 | 65 stručných přehledů |
| Deep Magic (`dmag`, `deepm`): kouzla, starší v1 | 514 | 56 | 12 úplných pravidlových textů, 44 přehledů |
| Vault of Magic (`vom`): magické předměty | 805 | 249 | 48 úplných pravidlových textů, 201 přehledů |
| **Celkem** | **1 488** | **474** | **474** |

Počty se týkají konkrétních Open5e zdrojových záznamů v importovatelném katalogu 5e v1, nikoli součtu všech vydání knih nebo všech položek na uživatelském serveru. Celkem 474 českých textů: 387 stručných přehledů a 87 úplných českých pravidlových textů (14 kouzel Tome of Heroes, 12 kouzel Deep Magic, 13 odborností Tome of Heroes a 48 předmětů Vault of Magic). Úplné překlady v `third-party-full-rules-cs.ts` jsou zobrazovány přednostně před přehledy a anglickým originálem.

Ověřený zdroj: `open5e/open5e-api`, větev `staging`, soubory `data/v1/toh/{Spell,Feat,MagicItem,Weapon,Armor}.json`, `data/v1/dmag/Spell.json` a `data/v1/vom/MagicItem.json`. Dokumenty označují svoji licenci jako Open Gaming License a obsahují připsání Kobold Press / Open Design.

**Důležitá oprava proti první verzi PR:** dosavadních 430 názvů zahrnovalo nesprávné položky a rozdílný zápis. Slovník byl srovnán se zdrojovými ID: Tome of Heroes nyní odpovídá všem skutečným záznamům 65/65, 91/91 a 13/13. Zároveň se odstranily chybné vazby jako `Heart to Heart` a `Instant Snare` z knihy `toh` (ve zdrojovém záznamu této knihy nejsou) a opravila se interpunkce, velikost písmen a apostrofy.

## Kde se používají

- `src/lib/content/third-party-names-cs.ts`: české názvy přes přesnou kombinaci knihy (`documentSlug`), druhu a anglického jména. `deepm` a `dmag` ukazují na stejný ověřený překladový katalog; obě podoby existují v Open5e.
- `src/lib/help/third-party-spell-summary-cs.ts`: české stručné přehledy ověřených kouzel, před původním plným pravidlovým textem.
- `src/lib/help/third-party-full-rules-cs.ts`: samostatně kontrolované úplné české pravidlové texty 14 kouzel Tome of Heroes, 12 kouzel Deep Magic a 48 předmětů Vault of Magic, přísně omezené na příslušnou knihu a druh.
- `src/lib/help/third-party-feat-description-cs.ts`: úplné české pravidlové mechaniky všech 13 odborností Tome of Heroes včetně požadavků, hodů, obnovování a omezení.
- `src/lib/help/third-party-item-summary-cs.ts`: české přehledy konkrétních magických předmětů, zbraní a zbrojí, za nimiž lze zobrazit původní anglická pravidla.
- `src/lib/help/content-ref-match.ts`: ochrana proti načtení textu shodného jména z jiné knihy. Detaily z API se ověřují podle `source` a `documentSlug`.

Vlastní uživatelské homebrew se nikdy nepřekládá ani nepřepisuje. Originální anglické `name`, `slug` a údaje mechanik zůstávají zdrojem pro herní engine a ukládání; překlady slouží pouze k zobrazení a vyhledávání (včetně hledání bez diakritiky).

## Pravidla kvality a další práce

U názvů rozhoduje pravidlový účinek, ne jen doslovná podobnost: například `Fuse Armor` je **Znehybnění kovu**, protože působí i na jiné kovové mechanismy. `Secret Blind` je **Skrytý úkryt**. Názvy nejsou vydavatelsky potvrzené oficiální české názvy.

*Stručný český přehled* není úplný překlad původního pravidlového popisu. Originální anglický text se ponechává přístupný, zvláště pokud obsahuje výjimky, tabulky či varianty, které se do přehledu nevejdou. Nesmí se vydávat za ověřený úplný překlad. Úplné české pravidlové texty nyní mají 13 odborností Tome of Heroes, 14 kouzel Tome of Heroes, 12 kouzel Deep Magic a 48 předmětů Vault of Magic. U ostatních záznamů jde pouze o stručné přehledy.

Zbývá dokončit názvy a popisy ostatních 458 kouzel Deep Magic, dalších 556 předmětů Vault of Magic a plné české přepisy pravidel u položek, které mají zatím jen přehled. Zdrojové knihy jsou volitelnou součástí serveru; tento PR je do serveru nevkládá.

Při každém dalším doplnění:
1. Nejdřív ověřit anglické jméno, pravidlový popis, `documentSlug` a licenční informace ze zdrojového záznamu.
2. Přidat vlastní český název pouze do tabulky odpovídající knize; nesměšovat různé knihy a homebrew.
3. V českém textu ověřit veškeré číselné hodnoty a herní mechaniku. Nevyplňovat pravidlové údaje odhadem.
4. Přidat test konkrétního překladu, rozsahu a oddělení zdrojů; spustit `npm run dead-code`, testy a produkční build.
