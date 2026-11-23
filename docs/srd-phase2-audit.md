# Kontrola fáze 2 — SRD 5.1 (issue #107)

## Zdroje a rozsah

- Kanonický originál: `rulebookPages("en")` nad **SRD 5.1 (2014)**.
- Český protějšek: `rulebookPages("cs")`, sestavený beze změny anglických ID a pravidlových dat.
- **933** kanonických stránek; **932** českých stránek označených jako úplné znění, jedna stránka právní atribuce. Tyto počty říkají, že text existuje, ne že jde o bezchybný překlad.
- Doplňky Tome of Heroes / Deep Magic / Vault of Magic a homebrew **nejsou** součástí SRD auditu.

## Provedené automatické kontroly

| Kontrola | Výsledek | Co konkrétně zaručuje |
|---|---|---|
| ID, druh stránky a kapitola | shoda | Česky zobrazená stránka nemůže potichu přejít na jiný druh obsahu |
| Metadata a původní metadata, skupiny/family | 0 neshod | Převod prvního anglického pravidlového řádku, skupiny a původní hodnoty je kontrolovatelný |
| Úroveň kouzla | 0 neshod | Anglická a česká metadata označují stejnou úroveň nebo trik |
| Český název mezi čtečkou a katalogem | testy pro všechny druhy | U řádků propojených se SRD stránkami se jméno rozlišuje pomocí kanonického ID |
| Záložní kouzla a magické předměty | 500+ položek | Katalog zachová anglický `slug`, pravidlová `data` a používá český čtecí název |
| Škola magie, vzácnost, kategorie, zdatnosti/dovednosti | regresní testy | Změna je pouze zobrazovací, mechanické hodnoty v originálu jsou neměnné |
| Kostky v úplných českých a anglických pravidlech | kontrola `d/k` + počet a počet stěn | Zaznamenává podezřelé rozdíly, nikoli soulad celé pravidlové věty |
| Záhlaví kouzel | casting time, range, components, duration/concentration | Porovnává vybraná mechanicky významná pole z úplných pravidel, nikoli jen metadata |
| Statbloky nestvůr | OČ, životy, kostky životů, rychlost, nebezpečnost, šest vlastností včetně oprav | Porovnání původních čísel proti českým statblokům; prozaická stránka `customizing-npcs` se nestaví na roveň statbloku |
| Tabulky postupu povolání | všech 12 povolání, minimálně 20 úrovňových řádků a všechny jejich číselné sloupce | Porovnává zachování hodnot a bonusů, nikoli význam názvů schopností |

Výstup při běhu: `src/lib/content/translations/srd-5.1/phase2-audit.test.ts` a `spell-header-audit.test.ts`. CI je spouští na změnách SRD v `main` přes `.github/workflows/translation-pack-registry.yml`.

## Zjištěné rozdíly interních klíčů

- Čtečka používá stránkové `page.id`, API Open5e `slug` a `document_slug`; nejsou automaticky zaměnitelné. `srdPageIdForCatalogRecord` vyžaduje prokázaný SRD zdroj, přesný druh obsahu a jednoznačné přiřazení k anglickému originálu. Odkaz `rulebook` a zabudovaný `srd:<page-id>` jsou explicitní mosty.
- **Drow**: `elf-drow` je v seznamu stránek **nestvůra**, nikoli hratelná rasa. Alias `Drow` se použije jen pro správný druh obsahu; nesmí směrovat rasu na statblok nestvůry.
- Starší `contentName` má jmenné mapy pro SRD. U záznamů Open5e z *jiné knihy* už nepoužije shodný název SRD; upřednostní ověřený `localizedCs.name`, jinak původní angličtinu. SRD upřednostní samostatný `display.name` z překladového adaptéru.
- Dovednosti a vlastnosti v čtečce SRD, `common/cs` a `skillLabel()` jsou navzájem porovnávány regresním testem.

## Dodatečná kontrola pravidlových hodnot

Mechanická kontrola obsahu byla rozšířena o samostatné regresní moduly:
`monster-stat-audit.ts` pro OČ, HP, kostky životů, rychlost,
nebezpečnost a šest atributů (včetně jejich oprav) a
`class-progression-audit.ts` pro úrovňové tabulky všech dvanácti povolání.
Pro případné chyby jsou vypisována přesná kanonická ID a původní i české
hodnoty. Kontroly jsou součástí `src/lib/content/translations/srd-5.1/`
a CI na `main`. Záznam `customizing-npcs` je stránka s radami bez
statbloku a nemá žádné údaje OČ/HP/CR k porovnání.

Tyto testy jsou nezávislé na samotném štítku „úplný překlad“; opravují
především pravidlové číselné hodnoty, aniž by upravovaly anglická data.
**Výsledek ověřeného běhu:** 933 stránek / 932 úplných českých textů, 0
neshod strukturovaných metadat, 0 neshod záhlaví kouzel, 0 neshod číselných
statbloků nestvůr a 0 neshod číselných hodnot v postupových tabulkách dvanácti
povolání. Kontrola kostkových zápisů vypsala jen dva vysvětlující příklady
navíc (klerikovo k100 a bojovníkovo k20), nikoli chybějící kostky v překladu.
[CI #45180571807](https://github.com/Nereziel/open-game-master/actions/runs/45180571807):
**31 souborů testů, 141 testů a TypeScript úspěšně**. Fáze 2 issue #107 je
proto splněná v rozsahu překladu identit, měřitelných pravidlových hodnot a
automatických regresí. Samotná přesnost významu všech vět se ověřuje
odděleně redakční revizí v otevřené fázi 5.

## Pravidlová kontrola a její omezení

Hodnoty v českém překladu se **nedají bezpečně považovat za správné jen proto, že sedí ID, metadata a kostky**. Automatický parser nepostihne například negaci, změnu cíle, neexistující výjimku, prahy úspěchu, všechny přepočty stop/sáhů nebo délku popisu. Proto **obsahový redakční audit úplných odstavců není označený jako dokončený**.

Při prvním rozšířeném porovnání zůstaly dva kontrolní nálezy: `cleric` používá české `k100` při výkladu percentilových kostek a `fighter` používá `k20` při vysvětlování kritického zásahu. Nejsou prokázanou změnou mechanik (přidávají vysvětlení); byly zaznamenány pro redakční revizi. Další falešný pozitivní nález `warlock` vznikal rozpoznáním předložky „k 12“ jako kostky — parser teď vyžaduje sousedící znak kostky a počet stěn.

Závěrečné ruční ověření doporučuje postupovat po pravidlových stránkách a porovnávat čísla, podmínky, výjimky a úplnost odstavců s původním anglickým SRD. Pro případné chybějící Open5e záznamy je nutné testovat i instalaci s plným volitelným SQLite balíčkem; CI používající pouze zabudovaný SRD nenahradí tuto kontrolu.
