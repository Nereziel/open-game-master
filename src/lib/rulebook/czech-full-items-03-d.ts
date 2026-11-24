// Úplné české překlady SRD 5.1, magické předměty 191–200.
// Původní SRD 5.1: CC BY 4.0, Wizards of the Coast.
export const CZECH_FULL_ITEMS_03_D: Readonly<Record<string, string>> = {
  "spell-scroll": `*Svitek, vzácnost se liší*

*Kouzelný svitek* obsahuje slova jediného kouzla zapsaná tajemnou šifrou. Pokud je kouzlo na seznamu kouzel tvého povolání, můžeš jako akci svitek přečíst a seslat jeho kouzlo, aniž bys musel zajistit jakékoli složky kouzla. Jinak je pro tebe svitek nesrozumitelný.

Pokud je kouzlo na seznamu tvého povolání, ale má vyšší úroveň, než jakou běžně dokážeš seslat, musíš provést ověření své sesílací vlastnosti, abys zjistil, zda kouzlo úspěšně sešleš. SO je rovno 10 + úroveň kouzla. Při neúspěchu kouzlo ze svitku zmizí bez dalšího účinku. Jakmile kouzlo sešleš, slova na svitku vyblednou a svitek se rozpadne na prach.

Úroveň kouzla na svitku určuje SO záchranného hodu proti kouzlu, bonus k útoku kouzlem i vzácnost svitku, jak ukazuje následující tabulka.

**Tabulka – Kouzelný svitek**

| Úroveň kouzla | Vzácnost | SO záchrany | Bonus k útoku |
|---------------|----------|-------------|---------------|
| Trik | Běžný | 13 | +5 |
| 1. | Běžný | 13 | +5 |
| 2. | Neobvyklý | 13 | +5 |
| 3. | Neobvyklý | 15 | +7 |
| 4. | Vzácný | 15 | +7 |
| 5. | Vzácný | 17 | +9 |
| 6. | Velmi vzácný | 17 | +9 |
| 7. | Velmi vzácný | 18 | +10 |
| 8. | Velmi vzácný | 18 | +10 |
| 9. | Legendární | 19 | +11 |

Kouzelníkovo kouzlo z *kouzelného svitku* lze opsat stejně jako kouzla z knih kouzel. Při opisování kouzla ze svitku musí opisující uspět v ověření Inteligence (Mystiky) se SO rovným 10 + úroveň kouzla. Při úspěchu se kouzlo podaří opsat. Bez ohledu na úspěch nebo neúspěch ověření je *kouzelný svitek* zničen.`,
  "spellguard-shield": `*Zbroj (štít), velmi vzácný (vyžaduje sladění)*

Když držíš tento štít, máš výhodu k záchranným hodům proti kouzlům a jiným magickým účinkům a útoky kouzly proti tobě mají nevýhodu.`,
  "sphere-of-annihilation": `*Divotvorný předmět, legendární*

Tato černá koule o průměru 2 stopy je otvorem v mnohovesmíru. Vznáší se v prostoru a stabilizuje ji okolní magické pole.

Koule naprosto zničí veškerou hmotu, kterou prochází nebo která prochází jí. Výjimkou jsou artefakty. Pokud není artefakt výslovně náchylný ke zničení *sférou zničení*, projde koulí bez újmy. Cokoli jiného, co se koule dotkne, ale není jí zcela pohlceno a zničeno, utrpí silové zranění 4k10.

Dokud ji někdo neovládne, koule zůstává na místě. Pokud jsi do 60 stop od neovládané koule, můžeš jako akci provést ověření Inteligence (Mystiky) se SO 25. Při úspěchu se koule vznášením pohne směrem podle tvé volby až o počet stop rovný 5 × tvá oprava Inteligence (nejméně 5 stop). Při neúspěchu se koule pohne o 10 stop k tobě. Tvor, do jehož prostoru koule vstoupí, musí uspět v záchranném hodu na Obratnost se SO 13, jinak se ho dotkne a utrpí silové zranění 4k10.

Pokusíš-li se ovládnout kouli, kterou už řídí jiný tvor, provedeš ověření Inteligence (Mystiky) v soupeření s jeho ověřením Inteligence (Mystiky). Vítěz soupeření získá kontrolu nad koulí a může s ní běžně pohybovat vznášením.

Pokud se koule dotkne portálu mezi sférami, například portálu vytvořeného kouzlem *brána*, nebo mimodimenzionálního prostoru, například v *přenosné díře*, PJ náhodně určí, co se stane, podle následující tabulky.

**Tabulka – Sféra zničení**

| k100 | Výsledek |
|------|----------|
| 01–50 | Koule je zničena. |
| 51–85 | Koule projde portálem nebo vstoupí do mimodimenzionálního prostoru. |
| 86–00 | Prostorová trhlina přenese každého tvora a předmět do vzdálenosti 180 stop od koule, včetně samotné koule, do náhodně určené sféry existence. |`,
  "staff-of-charming": `*Berla, vzácná (vyžaduje sladění bardem, klerikem, druidem, čarodějem, černokněžníkem nebo kouzelníkem)*

Když držíš tuto hůl, můžeš jako akci utratit 1 z jejích 10 nábojů a seslat z ní kouzlo *zmam osobu*, *rozkaz* nebo *porozumění jazykům* s použitím svého SO záchrany proti kouzlům. Hůl lze také použít jako magickou hůl (zbraň).

Pokud hůl držíš a neuspěješ v záchranném hodu proti očarovacímu kouzlu, které cílí pouze na tebe, můžeš změnit neúspěch na úspěch. Tuto vlastnost hole můžeš znovu použít až za příštího úsvitu. Uspěješ-li v záchranném hodu proti očarovacímu kouzlu, které cílí pouze na tebe, ať už s pomocí hole, nebo bez ní, můžeš jako reakci utratit 1 náboj hole a obrátit kouzlo zpět proti sesilateli, jako bys ho seslal ty.

Hůl si každý den za úsvitu obnoví 1k8+2 spotřebovaných nábojů. Pokud utratíš poslední náboj, hoď k20. Při výsledku 1 se z hole stane nemagická hůl (zbraň).`,
  "staff-of-fire": `*Berla, velmi vzácná (vyžaduje sladění druidem, čarodějem, černokněžníkem nebo kouzelníkem)*

Když držíš tuto hůl, máš odolnost vůči ohnivému zranění.

Hůl má 10 nábojů. Když ji držíš, můžeš jako akci utratit 1 nebo více nábojů a seslat jedno z následujících kouzel se svým SO záchrany proti kouzlům: *hořící ruce* (1 náboj), *ohnivá koule* (3 náboje) nebo *ohnivá zeď* (4 náboje).

Hůl si každý den za úsvitu obnoví 1k6+4 spotřebovaných nábojů. Pokud utratíš poslední náboj, hoď k20. Při výsledku 1 hůl zčerná, rozpadne se na popel a je zničena.`,
  "staff-of-frost": `*Berla, velmi vzácná (vyžaduje sladění druidem, čarodějem, černokněžníkem nebo kouzelníkem)*

Když držíš tuto hůl, máš odolnost vůči chladnému zranění.

Hůl má 10 nábojů. Když ji držíš, můžeš jako akci utratit 1 nebo více nábojů a seslat jedno z následujících kouzel se svým SO záchrany proti kouzlům: *kužel chladu* (5 nábojů), *oblak mlhy* (1 náboj), *ledová bouře* (4 náboje) nebo *ledová zeď* (4 náboje).

Hůl si každý den za úsvitu obnoví 1k6+4 spotřebovaných nábojů. Pokud utratíš poslední náboj, hoď k20. Při výsledku 1 se hůl promění ve vodu a je zničena.`,
  "staff-of-healing": `*Berla, vzácná (vyžaduje sladění bardem, klerikem nebo druidem)*

Tato hůl má 10 nábojů. Když ji držíš, můžeš jako akci utratit 1 nebo více nábojů a seslat jedno z následujících kouzel se svým SO záchrany proti kouzlům a opravou sesílací vlastnosti: *zhoj zranění* (1 náboj za každou úroveň kouzla, nejvýše 4. úroveň), *nižší navrácení* (2 náboje) nebo *hromadné zhojení zranění* (5 nábojů).

Hůl si každý den za úsvitu obnoví 1k6+4 spotřebovaných nábojů. Pokud utratíš poslední náboj, hoď k20. Při výsledku 1 hůl navždy zmizí v záblesku světla.`,
  "staff-of-power": `*Berla, velmi vzácná (vyžaduje sladění čarodějem, černokněžníkem nebo kouzelníkem)*

Tuto hůl lze používat jako magickou hůl (zbraň), která poskytuje bonus +2 k hodům na útok i zranění při útocích jí. Když ji držíš, získáváš bonus +2 k OČ, záchranným hodům a hodům na útok kouzlem.

Hůl má 20 nábojů pro následující vlastnosti. Každý den za úsvitu si obnoví 2k8+4 spotřebovaných nábojů. Pokud utratíš poslední náboj, hoď k20. Při výsledku 1 hůl zachová bonus +2 k hodům na útok a zranění, ale ztratí všechny ostatní vlastnosti. Při výsledku 20 si obnoví 1k8+2 nábojů.

***Mocný úder.*** Když holí zasáhneš útokem na blízko, můžeš utratit 1 náboj a způsobit cíli dodatečné silové zranění 1k6.

***Kouzla.*** Když držíš tuto hůl, můžeš jako akci utratit 1 nebo více jejích nábojů a seslat jedno z následujících kouzel se svým SO záchrany proti kouzlům a bonusem k útoku kouzlem: *kužel chladu* (5 nábojů), *ohnivá koule* (ve verzi 5. úrovně, 5 nábojů), *koule nezranitelnosti* (6 nábojů), *znehybni nestvůru* (5 nábojů), *levitace* (2 náboje), *blesk* (ve verzi 5. úrovně, 5 nábojů), *magická střela* (1 náboj), *paprsek slabosti* (1 náboj) nebo *zeď síly* (5 nábojů).

***Odvetný úder.*** Jako akci můžeš hůl zlomit přes koleno nebo o pevný povrch, čímž provedeš odvetný úder. Hůl se zničí a zbývající magie se uvolní ve výbuchu, který vyplní kouli o poloměru 30 stop se středem v holi.

Máš 50procentní šanci okamžitě se přenést do náhodně určené sféry existence a výbuchu uniknout. Pokud mu neunikneš, utrpíš silové zranění rovné 16 × počet nábojů v holi. Každý další tvor v oblasti musí provést záchranný hod na Obratnost se SO 17. Při neúspěchu utrpí zranění podle své vzdálenosti od místa výbuchu, jak uvádí tabulka. Při úspěchu utrpí poloviční zranění.

**Tabulka – Hůl moci**

| Vzdálenost od středu | Zranění |
|---------------------|---------|
| 10 stop nebo méně | 8 × počet nábojů v holi |
| 11 až 20 stop | 6 × počet nábojů v holi |
| 21 až 30 stop | 4 × počet nábojů v holi |`,
  "staff-of-striking": `*Berla, velmi vzácná (vyžaduje sladění)*

Tuto hůl lze používat jako magickou hůl (zbraň), která poskytuje bonus +3 k hodům na útok i zranění při útocích jí.

Hůl má 10 nábojů. Když s ní zasáhneš útokem na blízko, můžeš utratit až 3 její náboje. Za každý utracený náboj utrpí cíl dodatečné silové zranění 1k6. Hůl si každý den za úsvitu obnoví 1k6+4 spotřebovaných nábojů. Pokud utratíš poslední náboj, hoď k20. Při výsledku 1 se hůl změní na nemagickou hůl (zbraň).`,
  "staff-of-swarming-insects": `*Berla, vzácná (vyžaduje sladění bardem, klerikem, druidem, čarodějem, černokněžníkem nebo kouzelníkem)*

Tato hůl má 10 nábojů a každý den za úsvitu si obnoví 1k6+4 spotřebovaných nábojů. Pokud utratíš poslední náboj, hoď k20. Při výsledku 1 hůl pohltí a zničí roj hmyzu, který se poté rozptýlí.

***Kouzla.*** Když držíš hůl, můžeš jako akci utratit některé z jejích nábojů a seslat s použitím svého SO záchrany proti kouzlům jedno z následujících kouzel: *obří hmyz* (4 náboje) nebo *hmyzí zhouba* (5 nábojů).

***Hmyzí oblak.*** Když držíš hůl, můžeš jako akci utratit 1 náboj a nechat kolem sebe v okruhu 30 stop rozletět roj neškodného létajícího hmyzu. Hmyz zůstane po dobu 10 minut a pro všechny tvory kromě tebe vytvoří silně zastřenou oblast. Roj se pohybuje s tebou a stále je kolem tebe vystředěný. Vítr o rychlosti alespoň 10 mil za hodinu roj rozptýlí a účinek ukončí.`,
};
