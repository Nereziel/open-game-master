# České překladové balíčky rozšíření – issue #107, fáze 3

Tento PR **neslučuje PR #106** a nijak neupravuje anglické zdrojové katalogy, uložené postavy, engine ani MCP. Převádí vlastní české návrhy textů z PR #106 do samostatných zdrojových modulů.

## Knihy a původ návrhů

| Kniha | Open5e documentSlug | České názvy | Návrhy úplných pravidlových textů |
|---|---|---:|---:|
| Tome of Heroes | `toh` | 65 předmětů, 91 kouzel, 13 odborností | 14 kouzel, 13 odborností |
| Deep Magic | `deepm`, `dmag` | 56 kouzel | 12 kouzel |
| Vault of Magic | `vom` | 249 předmětů | 48 předmětů |

Každý z údajů byl převeden **beze změny obsahu** z konkrétního souboru větve PR #106 (`third-party-names-cs.ts`, `third-party-full-rules-cs.ts`, `third-party-feat-description-cs.ts`, `third-party-item-summary-cs.ts`, `third-party-spell-summary-cs.ts`). Původní překlady a krátké české přehledy jsou v balíčcích oddělené; dlouhé texty se neslučují ani nepřepisují. Autorské a licenční informace pocházejí ze zdrojových dokumentů Open5e, včetně atribuce vydavateli Kobold Press a příslušné licence OGL.

**Pozor:** To, že byl text v PR #106 označen jako „úplný“, není důkaz pravidlové shody s originálem. Tyto texty jsou převzaté autorské návrhy a před konečným schválením vyžadují samostatný obsahový audit. Krátký přehled nikdy nezastupuje úplný text kouzla či předmětu.

## Bezpečný kontrakt

- `tomeOfHeroesCsPack(rows)`, `deepMagicCsPack(rows)`, `vaultOfMagicCsPack(rows)` přijímají skutečné **katalogové řádky** (`source`, `documentSlug`, `kind`, `slug`, `name`), nikoli odhadnuté ID.
- Návrhy jsou historicky indexované anglickými názvy, proto migrátor nejprve ověří `sourceId` (jen `open5e`) a druh záznamu, vyřeší jednoznačnou shodu s anglickým názvem **uvnitř knihy** a teprve potom použije **skutečný `slug` jako `contentId`** v `TranslationRegistry`.
- Dva různé katalogové slugs se stejným jménem a druhem v jedné knize jsou nejednoznačné: překlad se nepřiřadí ani jednomu. Chybějící ID, neexistující překlad a sirotčí návrhy jsou rozlišeny v `report`.
- Ověřené návrhy pravidlových textů se ukládají do `description`. **Stručné přehledy** se ukládají jen do `metadata.summaryCs`; `description` pak zůstává původní anglický text **toho samého** katalogového záznamu.
- `homebrew` i SRD jsou z těchto balíčků vyloučeny. Alias `deepm` / `dmag` je mapován do jednoho zdroje `deep-magic`; identická `kind + slug + name` se deduplikuje.
- `supplementCzechRegistry(rows)` sestaví registry všech tří knih a vrátí samostatné reporty. Nevyžaduje žádné změny ukládání nebo herních výpočtů.

## Co zůstává otevřené

Balíčky zatím nejsou napojené na všechny UI konzumenty (čtečka, picker, detail, workshop, export do PDF); to patří do fáze 4. Přesun návrhů také **nedoplňuje** chybějící překlady dalších 458 kouzel Deep Magic a 556 předmětů Vault of Magic. Každé skutečné pokrytí závisí na katalogových řádcích dostupných v instalaci serveru.

Regresní testy v `src/lib/content/translations/supplements/build-pack.test.ts` ověřují counts původních map, kolize knih, fallback, skutečné `slug`, bezpečnost homebrew a označení přehledů.
