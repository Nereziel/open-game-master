# České překlady textu SRD 5.1 – původ a oprávnění

## Zdroj

Úplné české překlady ve `src/lib/rulebook/czech-full-rules-*.ts` jsou
nově vytvořené překlady anglického **System Reference Document 5.1**,
zveřejněného společností **Wizards of the Coast LLC** pod licencí
**Creative Commons Attribution 4.0 International (CC BY 4.0)**.

- Originál: https://dnd.wizards.com/resources/systems-reference-document
- Licence: https://creativecommons.org/licenses/by/4.0/legalcode
- Zdroj pro překládání v této aplikaci: `src/lib/rulebook/srd-5.1.json`
- Identifikátory stránek a původní anglické znění nejsou měněny.
- Každá dosud přeložená stránka zobrazuje úplný český text i původní anglický obsah.
- Stránka `legal-information` uchovává předepsanou atribuci v originálním znění.

Povinná atribuce převzatá z původního SRD:

> This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.

Překlad je adaptací anglického SRD a může obsahovat drobné terminologické
úpravy; pokud dojde ke sporu o pravidlo, původní text je dostupný v
anglickém zobrazení a na konci české stránky.

## Co **není** převzato

České texty na https://dnd5esrd.d20.cz/ vycházejí z komunitního překladu
ShadoWWW a dalších spolupracovníků. Stránka uvádí autorství, ale při kontrole
nebylo nalezeno jednoznačné licenční oprávnění k automatickému převzetí
kompletního českého znění do tohoto projektu. **Proto odtud nekopírujeme
celé odstavce, tabulky, statbloky ani celé knihy.** Lze se inspirovat již
zavedenými českými názvy herních pojmů.

Další cizí český překlad lze importovat, pokud jeho autor nebo platná
licence převzetí výslovně dovolí, a za příslušných podmínek s atribucí.

## Sjednocení názvů s českým D&D 5e (2014)

**Jediné části, které se přebírají doslova z komunitního českého
překladu, jsou samostatné názvy a ustálené herní termíny.**
Všechny popisy, definice, vysvětlení, příklady a celé tabulky pravidel
zůstávají naším vlastním překladem anglického SRD 5.1.
Měníme jen terminologii a nutné vlastní gramatické vazby. Nepřebíráme
delší pasáže ani odstavce cizího překladu.

Srovnání je založeno na české **Příručce hráče D&D 5e (2014)**.
**Jeskyně a draci** a překlad pravidel z roku 2024 jsou odlišné zdroje;
jejich terminologii nemícháme s touto edicí.

- Přehled českého D&D 5e: https://dnd5esrd.d20.cz/
- Dovednosti a používání vlastností: https://dnd5esrd.d20.cz/prirucka-hrace/7-kapitola.html
- Názvy bojových akcí a stavů: https://dnd5esrd.d20.cz/prirucka-hrace/9-kapitola.html
- Názvy vybavení a balíčků: https://dnd5esrd.d20.cz/prirucka-hrace/5-kapitola.html
- Názvy kouzel: https://dnd5esrd.d20.cz/grimoar/grimoar-jmen.html
- Názvy typů a příklady nestvůr: https://dnd5esrd.d20.cz/bestiar/uvod.html

| Anglický pojem | Dřívější název v aplikaci | Sjednocený název |
|---|---|---|
| Animal Handling | Zacházení se zvířaty | Ovládání zvířat |
| Arcana | Magie | Mystika |
| Insight | Odhad | Vhled |
| Performance | Vystupování | Umění |
| Sleight of Hand | Obratnost rukou | Čachry |
| Stealth | Plížení | Nenápadnost |
| Proficiency Bonus | bonus zdatnosti | Zdatnostní bonus |
| Dash | Běh | Sprint |
| Disengage | Odpoutání | Odpoutání se |
| Dodge | Úhyb | Uhýbání |
| Ready | Připravení akce | Příprava |
| Hide | Ukrytí | Schování se |
| Grapple | Chycení | Chvat |
| Expertise (tulák) | Odbornost | Kvalifikace |
| Cunning Action | Lstivá akce | Mazaná akce |
| Aberration | aberace | zrůda |
| Monstrosity | zrůda | obluda |
| Construct | konstrukt | výtvor |

Zároveň byly sjednoceny izolované názvy nestvůr z bestiáře,
například **Abolet, Zřící, Slád, Kovatl, Skurut, Gobr,
Neviditelný stopař, Vodní div, Ent, Tlející valivec, Diblík**.

Názvy souvisejících předmětů byly sjednoceny také v kapitole
`adventuring-gear`: například **Torna, Karimatka, Brašnička na suroviny,
Ježci, Okovy, Nádobíčko** a názvy sedmi výbavových balíčků.

Anglické identifikátory (`Stealth`, `Dash`, `monster-statistics` atd.),
interní hodnoty a názvy MCP nástrojů se **nesmějí překladem měnit**.
Český slovník dovedností je v `src/lib/rulebook/czech-terms.ts`.
Regresní test v `scripts/test-rulebook.mjs` ověřuje všech 18 názvů.

Zavedené české názvy povolání a schopností se používají pouze jako
**názvosloví**. Úplné popisy povolání jsou nově napsány na základě
anglického SRD 5.1 pod licencí CC BY 4.0; česká komunitní vysvětlení
a odstavce nejsou kopírovány. Anglické zdroje zůstávají v čtečce pod
českým textem a identifikátory povolání zůstávají nezměněné.

## Stav

- Stručné české přehledy: 932/933 kanonických stránek (výjimkou je atribuce).
- Úplné české znění pravidlových stránek: **35/35 obsahových pravidlových stránek**.
- Dříve dokončené kapitoly zahrnují **Stavy, Nemoci, Objekty, Artefakty** a další pravidla.
- V další dávce jsou úplně přeloženy kapitoly **Jízdní zvířata a dopravní prostředky, Nástroje, Kouzelné předměty, Jedy a Inteligentní kouzelné předměty**.
- Následující dávka přeložila celé kapitoly **Zbroje**, **Šílenství** a
  **Sféry existence**, včetně tabulek a konkrétních pravidlových omezení.
- Aktuálně nově přeložené celé kapitoly **Kombinování povolání** a
  **Zázemí**, včetně všech tabulek a všech 26 návrhů vlastností akolyty.
- Nově přeloženy také celé kapitoly **Zbraně** a **Výdaje**, včetně
  všech 37 zbraní a tří tabulek životních nákladů, jídla a služeb.
- Nově přeložena celá kapitola **Seznamy kouzel**: **778 výskytů**
  **319 jedinečných kouzel**, v seznamech osmi povolání a 70 skupinách úrovní,
  všechny podle existujícího českého slovníku.
- Také kapitola **Božstva mnohovesmíru**: všechny úvodní popisy i **67 božstev**
  keltského, řeckého, egyptského a severského panteonu, včetně všech tabulkových hodnot.
- Dokončené základní kapitoly zahrnují také **Dobrodružství**, **Dobrodružné vybavení**, **Používání vlastností**, **Boj** a **Statistiky nestvůr**, čímž je uzavřeno všech **35/35** nelegálních pravidlových kapitol.
- Úplné české texty **všech 12 povolání SRD 5.1 (2014)** jsou nyní v
  `src/lib/rulebook/czech-full-classes-1.ts` až `czech-full-classes-12.ts`:
  obsahují zdatnosti, počáteční vybavení, 20 úrovní, kouzelné pozice, všechny
  vypsané schopnosti a **jednu úplně popsanou podtřídu na povolání**.
- U druida je zahrnuto **7 tabulek kouzel krajin**, u čaroděje všech
  **8 možností Metamagie**, u černokněžníka všech **32 mystických invokací**
  a u kouzelníka pravidla knihy kouzel.
- Úplné české texty jednotlivých kouzel, statbloků nestvůr, magických
  předmětů a ras je stále nutné dopracovat. **Další podtřídy mimo výchozí
  SRD 5.1** nejsou součástí této dokončené dávky povolání.
- Testy ověřují dostupnost úplných textů a zachování originálu, ale před
  sloučením je třeba samostatně spustit build a test suite.
