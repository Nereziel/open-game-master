# České názvy obsahu mimo SRD

Tento katalog navazuje na [společnou překladovou vrstvu](../src/lib/content/names.ts) a problém #100. Nejde o kopii překladů pravidlových knih.

## Aktuální rozsah (PR #106)

| Open5e `documentSlug` | Kniha | Předměty | Kouzla | Odbornosti |
| --- | --- | ---: | ---: | ---: |
| `toh` | Tome of Heroes | 62 | 106 | 10 |
| `deepm` | Deep Magic | 0 | 58 | 0 |
| `vom` | Vault of Magic | 194 | 0 | 0 |
| **Celkem** | | **256** | **164** | **10** |

**Celkem 430 vlastních českých názvů.** Jsou to původní návrhy českého názvosloví, nikoli licencované/autor­izované překlady vydavatelů. Výběrové dialogy a české hledání je používají jen u řádků `source: "open5e"` s odpovídajícím `documentSlug`.

- Slovník: `src/lib/content/third-party-names-cs.ts`; říká pouze, jak se zobrazí identifikovaný název.
- Názvy používají `contentName()` společně s katalogem SRD. Původní anglická `name`, `slug`, hodnoty mechanik, API a ukládané údaje se nemění.
- Český dotaz se mapuje na **původní anglické jméno**; výsledný řádek se znovu ověřuje podle českého názvu. První přednost mají shody v centrálním SRD katalogu.
- Vlastní uživatelské `homebrew` a jiné knihy se stejným názvem se nepřekládají. Neznámé řádky ponechávají anglický původní název.
- U 15 zbraní Tome of Heroes je navíc vlastní stručný český informační přehled (`third-party-item-summary-cs.ts`), vycházející z veřejně uváděných mechanických údajů. Zobrazuje se vedle původních pravidel, nikoli místo nich.

## Co ještě není přeložené

Úplné popisy kouzel, magických předmětů a pravidlové vlastnosti obsažené ve třetích knihách jsou prozatím v původním znění. Český název **není** tvrzením, že je k dispozici úplný český překlad pravidel. Pro další překlady je třeba samostatně připravit ověřené české texty, zachovat veškerou herní mechaniku a respektovat licenční podmínky příslušné knihy.

Při rozšiřování:
1. Ověřit přesnou anglickou položku a Open5e `documentSlug`, nikoli jen podobný název.
2. Doplnit vlastní český název do správné knihy a tabulky, zachovat jiná vydání a homebrew.
3. U herních účinků doplnit kontrolované krátké autorské shrnutí nebo samostatně oprávněný překlad; nepřepisovat anglický text při importu.
4. Rozšířit `czech-content-picker.test.ts` o název, české hledání, cizí dokument, homebrew a EN fallback.
5. Ověřit `npm run dead-code`, cílené testy a produkční build. Prohlížečový Linux smoke ověřit po integraci do `main`.

Datové katalogy Open5e jsou volitelné a závisí na instalaci obsahu na serveru. PR nevkládá nové knihy do databáze; překládá názvy těch položek, které Open5e skutečně vrátí.
