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
ShadoWWWa a dalších spolupracovníků. Stránka uvádí autorství, ale při kontrole
nebylo nalezeno jednoznačné licenční oprávnění k automatickému převzetí
kompletního českého znění do tohoto projektu. **Proto odtud nekopírujeme
celé odstavce, tabulky, statbloky ani celé knihy.** Lze se inspirovat již
zavedenými českými názvy herních pojmů.

Další cizí český překlad lze importovat, pokud jeho autor nebo platná
licence převzetí výslovně dovolí, a za příslušných podmínek s atribucí.

## Stav

- Stručné české přehledy: 932/933 kanonických stránek (výjimkou je atribuce).
- Úplné české znění pravidlových stránek: **26/35 obsahových pravidlových stránek**.
- Nově kompletní kapitoly: **Stavy, Nemoci, Objekty, Artefakty**; celkem 26/35.
- V další dávce jsou úplně přeloženy kapitoly **Jízdní zvířata a dopravní prostředky, Nástroje, Kouzelné předměty, Jedy a Inteligentní kouzelné předměty**.
- Následující dávka přeložila celé kapitoly **Zbroje**, **Šílenství** a
  **Sféry existence**, včetně tabulek a konkrétních pravidlových omezení.
- Aktuálně nově přeložené celé kapitoly **Kombinování povolání** a
  **Zázemí**, včetně všech tabulek a všech 26 návrhů vlastností akolyty.
- Nově přeloženy také celé kapitoly **Zbraně** a **Výdaje**, včetně
  všech 37 zbraní a třech tabulek životních nákladů, jídla a služeb.
- Úplné české texty kouzel, statistiky nestvůr, předmětů, ras a povolání:
  zbývá dopracovat; přehledy nejsou totéž co plné překlady.
- Testy ověřují dostupnost úplných textů a zachování originálu, ale před
  sloučením je třeba samostatně spustit build a test suite.
