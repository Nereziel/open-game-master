## Etapa 6 — externí rozšíření D&D (issue #112, PR #116)

Cílová větev: `rebuild/fresh-upstream-2026-11-23`; pracovní větev: `review/cs-external-expansions-review`. Záloha: `backup/pre-upstream-restart-2026-11-23` (`fe02afefcc3055b4992bf1cc5144dafa58d8475e`). SRD a odm-expanded mimo rozsah. SQLite nebylo otevřeno ani dotazováno.

## Checklist

- [x] Najít veřejné originální zdroje nezávislé na SQLite a porovnat se zálohou.
- [x] Obnovit všech 474 historických názvů a porovnat 87 historických plných návrhů s původním textem.
- [x] Tome of Heroes v1: 303 názvů, 91 kouzel, 18 zázemí, 13 odborností, 40 ras/podras, 29 magických předmětů, 36 statických záznamů výzbroje (bez nedostupných speciálních pravidel).
- [x] Zachovat zdrojové identity, anglická pravidlová pole, původní EN/FR cestu, bez nového registru.
- [x] SQLite vynechat; oddělit nedostupný text od dostupného, dosud nepřeloženého.
- [ ] Dokončit zbývající kouzla, archetypy, zázemí, předměty, nestvůry a ostatní knihy.
- [ ] Doložit přesný katalog nainstalované verze bez SQLite (raw počty nejsou totéž co import po deduplikaci).
- [ ] Úplná terminologická a metadata revize zbývajících položek, všechny UI cesty a úspěšné CI.

## Podklady a inventura

Originální veřejný katalog: [Open5e API, commit bdcddf2b](https://github.com/open5e/open5e-api/tree/bdcddf2b5f7995c42ac89722d8da563346b6744a/data). V1 a v2 jsou rozdílné zdrojové snapshoty; importer je normalizuje a deduplikuje. Čísla níže jsou počty raw řádků, nikoli tvrzení o skutečném počtu instalovaných položek. Knihy a licence zůstávají identifikovány původním dokumentem Open5e; původní licenční metadata se nemění. Některé velké bestiáře nástroj vrací zkrácené, takže přesný počet nebylo možné ověřit.

| Dokument v1 | Zdrojové položky |
|---|---|
| toh | 91 kouzel, 13 odborností, 18 zázemí, 76 archetypů, 11 ras + 29 podras, 31 zbraní + 5 zbrojí + 29 magických předmětů |
| dmag | 514 kouzel včetně 38 triků |
| vom | 805 magických předmětů |
| a5e | 371 kouzel včetně 29 triků, 59 odborností, 16 zázemí, 546 předmětů |
| blackflag | 360 nestvůr |
| dmag-e | 64 kouzel včetně 1 triku |
| kp | 31 kouzel |
| o5e | 15 archetypů, 2 zázemí, 2 kouzla, 1 podrasa |
| taldorei | 4 archetypy, 5 zázemí, 1 odbornost, 1 předmět, 4 nestvůry |
| warlock | 43 kouzel včetně 2 triků |
| cc, menagerie, tob, tob2, tob3, tob-2023 | bestiáře existují, úplný JSON výstup nedostupný (zkrácený), počet neověřen |

| Dokument v2 | Zdrojové položky |
|---|---|
| a5e-ag | 371 kouzel včetně 29 triků, 59 odborností, 21 zázemí, 1 povolání + 3 archetypy, 6 stavů |
| a5e-ddg | 4 zázemí |
| a5e-gpg | 2 zázemí |
| a5e-mm | bestiář, počet neověřen |
| tdcs | 5 zázemí, 4 archetypy, 4 nestvůry, 1 odbornost |
| bfrd | 16 povolání + 17 archetypů, 360 nestvůr |
| ccdx | 356 nestvůr |
| deepm | 515 kouzel včetně 38 triků |
| deepmx | 64 kouzel včetně 1 triku |
| kp | 31 kouzel |
| toh | 91 kouzel, 13 odborností, 19 zázemí, 76 archetypů, 40 ras/podras |
| wz | 43 kouzel včetně 2 triků |
| open5e | 2 zázemí, 16 archetypů, 1 rasa, 2 kouzla |
| spells-that-dont-suck | 180 kouzel včetně 17 triků |
| tob, tob2, tob3, tob-2023, vom | bestiáře/předměty, úplný JSON výstup nedostupný, počet neověřen |

V1 ToH kouzla mají ve zdroji nulový počet level=0; neopravujeme zdrojová metadata podle domněnky. V2 soubory nelze automaticky počítat jako další unikátní řádky. Fixture `scripts/fixtures/open5e-pack-rows.json`, `pack-species-rows.json` a `reader-golden` doložily v první etapě 81 identit a 19 přeložených textů; ty jsou zahrnuty níže.

## Stav skutečných překladových dat

Počty přímo z `src/lib/content/expansion-descriptions-cs.json` v aktuální revizi. Plný text znamená přeložený dostupný zdrojový popis, nikoli potvrzení všech UI cest nebo všech metadat.

| Kniha / kategorie | Názvy | Plné dostupné texty | Pouze statistiky |
|---|---:|---:|---:|
| Tome of Heroes – předměty | 65 | 29 | 36 |
| Tome of Heroes – kouzla | 91 | 91 | 0 |
| Tome of Heroes – odbornosti | 13 | 13 | 0 |
| Tome of Heroes – rasy a podrasy | 40 | 40 | 0 |
| Tome of Heroes – zázemí | 18 | 18 | 0 |
| Tome of Heroes – archetypy | 76 | 25 | 0 |
| Deep Magic | 62 | 19 | 0 |
| Vault of Magic | 249 | 48 | 0 |
| Ostatní fixture | 24 | 8 | 0 |
| **Celkem** | **638** | **291** | **36** |

Historických 474 názvů (ToH 169, DM 56, VoM 249) obnoveno po spárování s přesným originálním slugem a názvem. Všech 87 historických plných návrhů (ToH 27, DM 12, VoM 48) prošlo porovnáním; opraveny významové odchylky a nedostatečné podmínky, nikoli pouhý přenos. Orientační souhrny nepovažujeme za plná pravidla. Nově 40 ras/podras, 29 magických předmětů ToH, další dostupné texty a názvy. U 36 záznamů nemagické výzbroje přeloženy dostupné číselné a typové údaje, bez vymyšlených zvláštních vlastností, které veřejný záznam neobsahuje.

Zbývající dostupné v1 texty: ToH 51 archetypů (51 popisů); Deep Magic 495 popisů (452 názvů chybí); Vault of Magic 757 popisů (556 názvů chybí). Ostatní knihy pouze dílčí pokrytí podle fixture. To jsou nezpracované dostupné originály, nikoli blokace SQLite. Úplná inventura instalovaných položek a počty velkých zkrácených bestiářů zůstávají neověřené.

### Dokončení kouzel Tome of Heroes

Všech 91 záznamů v1 má český název, celý dostupný popis a pravidla vyšších úrovní, pokud jsou v originálu. Hlavičky obsahují školu, úroveň, vyvolání, dosah, složky, soustředění, trvání, rituál a povolání. Všech 91 originálních sad 14 kontrolních polí bylo porovnáno přímo s veřejným zdrojovým JSON; 0 neshod. Porovnání množin explicitních výrazů kostek (d/k) ve zdrojovém a českém textu: 0 rozdílů. Není to důkaz správnosti každé mechaniky. U 36 kouzel je příznak surovinové složky bez vyplněné suroviny; doplněna poznámka, nikoli vymyšlená složka. Immolating Gibbet má v originálu výšku 60 bez jednotky; výslovně označeno. Některé zdrojové doby trvání (Gale, Jagged Forcelance, Never Surrender) jsou v rozporu s popisem; původní metadata zachována, neopraveno domněnkou. Školy podle d20 PH 2014 (Vymítání, Transmutace atd.), vzdálenosti zachovány ve stopách jako v projektu. Nový test kontroluje 91 záznamů a fallback při změně zdrojové úrovně.

### Dokončení zázemí a zahájení archetypů Tome of Heroes

Všech 18 zázemí v1 má kompletní dostupný český text: úvod, zdatnosti, jazyky, výbavu, schopnost, charakteristiky a osobnostní tabulky. Přímá kontrola originálů: 534 tabulkových řádků včetně doplňujících tabulek původu, specializace a událostí; stejné počty řádků a velikosti tabulek, bez rozdílu ve zkontrolovaných uložených zdrojových polích. U diplomata zdroj opakuje ideál č. 4 v řádku č. 3; v české tabulce je uveden jednou na správném místě. Testy kontrolují 26 základních osobnostních položek každého zázemí a fallback při změně schopnosti. Neznamená to, že jsou české texty již propagovány do všech samostatných UI polí.

Archetypy: přeloženy kompletní popisy Prastaří draci (Ancient Dragons) a Vládci zvířat (Animal Lords), včetně všech úrovní schopností, variant požehnání, výběru patrona a rozšířených seznamů kouzel. Názvy běžných SRD kouzel převzaty ze stávajícího names-cs.ts; názvy dosud nepřeložených externích kouzel označeny i anglicky. V této etapě zbývalo 74 archetypů. Změny pouze v překladových datech, testech a dokumentaci; SQLite nedotčeno.


### Pokračování archetypů Tome of Heroes

Doplněny čtyři úplné dostupné popisy v1 (Beast Trainer, Cantrip Adept, Cat Burglar, Chaplain). Přeloženy všechny úvody a schopnosti, `desc` zachováno přesně podle zdrojového JSON. Kontrola výrazů kostek d/k bez rozdílů. Beast Trainer nově Cvičitel zvířat (není omezen na šelmy). U Cat Burglar je označeno vložené číslo 118, pravděpodobně číslo stránky. Názvy schopností jsou vlastní překlady v duchu d20, nikoli potvrzené oficiální názvy. Test rozšířen o původní pole a anglický fallback při změně zdroje. CI zatím neověřeno. V této dílčí etapě 6/76 archetypů.

Doplněny i Circle of Ash, Circle of Bees a Circle of Crystals (Kruh popela, včel a krystalů). Včetně všech schopností, variant a tabulky kouzel; kontrola četností výrazů kostek d/k bez rozdílů. Bombardment of Stings má pracovní český název Záplava žihadel s anglickým ekvivalentem, SRD kouzla podle `names-cs.ts`. V této dílčí etapě 9/76 archetypů.

Doplněny Circle of Sand, Circle of the Green, Circle of the Shapeless, Circle of Wind, Cold-Blooded a College of Echoes; včetně schopností a tabulek kouzel. Četnosti výrazů kostek d/k shodné (d8/k8 normalizováno jako 1k8). U Ducha zeleně není v původním popisu odkazovaný blok statistik; u Mirrored Lamina není uvedena vlastnost pro záchranu. Obě omezení označena bez domýšlení mechaniky. V této dílčí etapě 15/76 archetypů.

Doplněno dalších pět bardských kolejí: Investigation, Shadows, Sincerity, Tactics a the Cat. Úvody, všechny schopnosti, podmínky, trvání a omezení použití; názvy SRD kouzel převzaty z existujícího slovníku, původní `desc` zachováno přesně. V této dílčí etapě 20/76 archetypů.

Přeloženy Courser Mage, Dawn Blade, Familiar Master, Gravebinding a Grove Warden. Courser Mage přejmenován na Mága stopaře (zdroj neobsahuje jízdu na koni), Familiar Master na Mistra přítelíčků podle Najdi přítelíčka. Četnosti výrazů kostek shodné včetně samostatného d4/d8. U Gravebinding označeny pracovní překlady pěti odkazovaných kouzel a neuvedené SO Radiant Nimbus; originální úrovně zachovány. Celkem 25/76 archetypů, zbývá 51.

## Načítání

`contentName` a `localizeEntryCs` využívají existující lokalizační cestu. Přesná kombinace source=open5e, documentSlug, druh, slug a anglický název, u popisu také shoda uložených původních polí; jinak anglický fallback. Pouze zobrazovací `localized_desc`; nemění pravidla, identity ani databázi. ContentPicker/MultiContentPicker čtou české názvy, ale některé výběry předávají jen anglický název, zejména archetypy, odvozené rasové názvy a inline zázemí. Úplná propagace do UI, české vyhledávání a PDF nejsou potvrzené.

Regresní testy v `entry-descriptions-cs.test.ts` pokrývají 638 názvů, původní fixture, 13 odborností, 29 předmětů, 36 stat záznamů, 91+19 kouzel, 48 předmětů VoM, 40 ras/podras, 18 zázemí a 25 archetypů; část testů používá uložená původní pole (nejde o nezávislý test živého importu). CI nebylo při zápisu výsledku potvrzené; lokální runtime bez clone nedostupný.

Terminologie: [d20 PH 2014 vlastnosti](https://dnd5esrd.d20.cz/prirucka-hrace/7-kapitola.html), [boj](https://dnd5esrd.d20.cz/prirucka-hrace/9-kapitola.html), [stavy](https://dnd5esrd.d20.cz/prirucka-hrace/dodatek-a.html). Nedoložené názvy jsou vlastní překlady; nejsou vydávány za oficiální.

## Závěr

Výrazně rozšířený dílčí audit, nikoli kompletní překlad externího katalogu. PR neslučovat ani neoznačovat dokončený.