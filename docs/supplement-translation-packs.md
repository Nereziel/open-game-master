# České překladové balíčky rozšíření – issue #107, fáze 3

Tento PR **neslučuje PR #106** a nijak neupravuje anglické zdrojové katalogy, uložené postavy, engine ani MCP. Převádí vlastní české návrhy textů z PR #106 do samostatných zdrojových modulů.

## Knihy a původ návrhů

| Kniha | Open5e documentSlug | České názvy | Návrhy úplných pravidlových textů |
|---|---|---:|---:|
| Tome of Heroes | `toh` | 65 předmětů, 91 kouzel, 13 odborností | 14 kouzel, 13 odborností |
| Deep Magic | `deepm`, `dmag` | 56 kouzel | 12 kouzel |
| Vault of Magic | `vom` | 249 předmětů | 48 předmětů |

Každý z údajů byl převeden **beze změny obsahu** z konkrétního souboru větve PR #106 (`third-party-names-cs.ts`, `third-party-full-rules-cs.ts`, `third-party-feat-description-cs.ts`, `third-party-item-summary-cs.ts`, `third-party-spell-summary-cs.ts`). Původní překlady a krátké české přehledy jsou v balíčcích oddělené; dlouhé texty se neslučují ani nepřepisují. Autorské a licenční informace pocházejí ze zdrojových dokumentů Open5e, včetně atribuce vydavateli Kobold Press a příslušné licence OGL.

**Pozor:** To, že byl text v PR #106 označen jako „úplný“, není důkaz pravidlové shody s originálem. Tyto návrhy nejsou v aktivním registru úplných pravidel; `report.unverifiedFullRules` je počítá odděleně od `report.completeRules`. Dokud neproběhne obsahový audit podle celé zdrojové položky, zůstává úplné znění anglicky. Krátký přehled nikdy nezastupuje úplný text kouzla či předmětu.

## Bezpečný kontrakt

- `tomeOfHeroesCsPack(rows)`, `deepMagicCsPack(rows)`, `vaultOfMagicCsPack(rows)` přijímají skutečné **katalogové řádky** (`source`, `documentSlug`, `kind`, `slug`, `name`), nikoli odhadnuté ID.
- Návrhy jsou historicky indexované anglickými názvy, proto migrátor nejprve ověří `sourceId` (jen `open5e`) a druh záznamu, vyřeší jednoznačnou shodu s anglickým názvem **uvnitř knihy** a teprve potom použije **skutečný `slug` jako `contentId`** v `TranslationRegistry`.
- Dva různé katalogové slugs se stejným jménem a druhem v jedné knize jsou nejednoznačné: překlad se nepřiřadí ani jednomu. Chybějící ID, neexistující překlad a sirotčí návrhy jsou rozlišeny v `report`.
- **Neauditované návrhy úplných textů** z `fullRules` se nikdy nepřenášejí do `description`. Zůstávají uložené pro pozdější obsahový audit. Až samostatně zkontrolované překlady patří do `approvedFullRules` a mohou vyplnit `description`. **Stručné přehledy** jsou jen v `metadata.summaryCs`; do auditu se jako úplná pravidla zobrazí anglický originál **téhož** katalogového záznamu.
- `homebrew` i SRD jsou z těchto balíčků vyloučeny. Alias `deepm` / `dmag` je mapován do jednoho zdroje `deep-magic`; identická `kind + slug + name` se deduplikuje.
- `supplementCzechRegistry(rows)` sestaví registry všech tří knih a vrátí samostatné reporty. Nevyžaduje žádné změny ukládání nebo herních výpočtů.

## Co zůstává otevřené

Balíčky zatím nejsou napojené na všechny UI konzumenty (čtečka, picker, detail, workshop, export do PDF); to patří do fáze 4. Přesun návrhů také **nedoplňuje** chybějící překlady dalších 458 kouzel Deep Magic a 556 předmětů Vault of Magic. Každé skutečné pokrytí závisí na katalogových řádcích dostupných v instalaci serveru.

Regresní testy v `src/lib/content/translations/supplements/build-pack.test.ts` ověřují counts původních map, kolize knih, fallback, skutečné `slug`, bezpečnost homebrew a označení přehledů.

## První integrace čtečky/detailů a výběrů – navazující PR #111

Zobrazení čte české balíčky **pouze podle celého katalogu**. Serverové
`supplements/server-display.ts` načte skutečné kombinace
`document_slug + slug + name` ze všech tří tabulek Open5e
(`items`, `spells`, `feats`) a sestaví registr jednou pro danou
read-only databázi. Nelze sestavit správný jednoznačný překlad pouze
ze dvanácti výsledků aktuálního vyhledávání: jiný záznam stejného
názvu může být až na další stránce.

API `/api/content/{kind}` a detail `/api/content/{kind}/{slug}`
vracejí volitelný objekt `localizedCs`:

- `name` – český zobrazovací název, zvolený podle skutečného zdroje;
- `summary` – pouze krátký přehled, nikdy úplná pravidla;
- `hasFullRules` – údaj, že redakčně schválený úplný český pravidlový text existuje;
- `fullRules` – pouze v detailové odpovědi, ne v lehkém seznamu.

Kanoničtí `name`, `slug`, `data` a mechaniky v odpovědi zůstávají
anglické a nedotčené. UI `ContentPicker`, `MultiContentPicker` a
`InfoDialog` při české lokalizaci používají `localizedCs` a jinak
vlastní dosavadní výstup. U neauditovaného návrhu úplných pravidel detail používá anglické znění; u pouhého českého přehledu detail zároveň zobrazí
**úplný anglický popis stejného katalogového záznamu** s
explicitním označením. Neexistující či chybně přiřazené překlady
nepřepisují jinou knihu. U katalogu, který není nainstalován
nebo je nečitelný, zůstává angličtina.

UI výběry zachovávají oddělené řádky z různých knih a označují zdroj.
Části výběru, které dosud ukládají jen anglický název (zejména
`MultiContentPicker`), jsou závislé na dokončení a spojení
zdrojových referencí z PR #109; české názvy se neukládají jako engine
ID. Zatím **nejsou** přepojené všechny obrazovky a české dotazy na
rozšíření je ještě nutné propojit s vyhledáváním. Tento PR je
dílčí krok fáze 4, nikoli dokončení celého issue.

### Přesná identita při otevření detailu

Picker předává ke `slug` také `documentSlug` **jen u řádků
Open5e**. Detailové API čte katalog přímo podle dvojice
`(slug, document_slug)` a odmítá cizí zdroj; se stejným názvem
se nevrací jiná kniha. Při nenalezení nelze přejít na homebrew,
zabudované SRD ani anglický záznam jiného dokumentu.
Staré odkazy bez `documentSlug` a záložní SRD řádky nadále
používají původní chování. Totéž platí pro existující české
popisy SRD vybavení: speciální fallback rozšíření je nemění.

### Hledání podle českého názvu (PR #111)

Builder posílá do katalogového API `locale=cs` podle aktuálního
rozhraní. Pouze při českém dotazu pro `items`, `spells` a `feats`
vybere `supplementCzechSearchCandidates` nejvýše 12 odpovídajících
českých názvů z úplného katalogu Open5e. `searchKey` dovoluje
psaní bez diakritiky. Kandidát vždy obsahuje **původní anglický
název, typ, `documentSlug` a kanonický `slug`**. Následný
anglický dotaz prochází standardními filtrovacími cestami:
omezením povolání, úrovně, školy a druhu předmětu, dostupností
pravidel pro danou hru a scope kampaně. Výsledek se připojí
jen při přesné shodě původu i ID. Homebrew a SRD záznamy
nezdědí překlad rozšíření.

Další větev katalogových požadavků a stránkování zůstává beze
změny; české aliasy se přidávají pouze při prvním offsetu
(`offset=0`) a pouze v nainstalovaném katalogu, s omezením
počtu kandidátů a výsledků. Pro více kandidátů používá UI
stále stejné anglické uložené názvy a ID, české jsou jen
zobrazovací.

Omezení: není dosud sjednoceno stránkování kombinovaných
českých/anglických výsledků v pokročilých velkých katalozích.
Zbývá také integrovat lokalizaci do dalšího workshopu,
reference/čtečky a exportu do PDF.
