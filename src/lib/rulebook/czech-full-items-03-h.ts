// Úplné české překlady SRD 5.1, magické předměty 231–239.
// Původní SRD 5.1: CC BY 4.0, Wizards of the Coast.
export const CZECH_FULL_ITEMS_03_H: Readonly<Record<string, string>> = {
  "wand-of-secrets": `*Hůlka, neobvyklá*

Tato hůlka má 3 náboje. Když ji držíš, můžeš jako akci utratit 1 její náboj. Pokud se do vzdálenosti 30 stop od tebe nacházejí tajné dveře nebo past, hůlka začne pulzovat a ukáže na nejbližší z nich. Hůlka si každý den za úsvitu obnoví 1k3 spotřebovaných nábojů.`,
  "wand-of-the-war-mage-1-2-or-3": `*Hůlka, neobvyklá (+1), vzácná (+2) nebo velmi vzácná (+3) (vyžaduje sladění sesilatelem kouzel)*

Když držíš tuto hůlku, získáváš bonus k hodům na útok kouzlem podle vzácnosti hůlky. Navíc při provádění útoku kouzlem ignoruješ poloviční kryt.`,
  "wand-of-web": `*Hůlka, neobvyklá (vyžaduje sladění sesilatelem kouzel)*

Tato hůlka má 7 nábojů. Když ji držíš, můžeš jako akci utratit 1 náboj a seslat z ní kouzlo *pavučina* (SO záchrany 15).

Hůlka si každý den za úsvitu obnoví 1k6+1 spotřebovaných nábojů. Pokud utratíš poslední náboj, hoď k20. Při výsledku 1 se hůlka rozpadne na popel a je zničena.`,
  "wand-of-wonder": `*Hůlka, vzácná (vyžaduje sladění sesilatelem kouzel)*

Tato hůlka má 7 nábojů. Když ji držíš, můžeš jako akci utratit 1 náboj a zvolit cíl do vzdálenosti 120 stop od sebe. Cílem může být tvor, předmět nebo bod v prostoru. Hoď k100 a podle následující tabulky urči, co se stane.

Pokud účinek způsobí, že z hůlky sešleš kouzlo, je SO záchrany proti kouzlu 15. Pokud má kouzlo běžně dosah udaný ve stopách, změní se jeho dosah na 120 stop, není-li už takový.

Pokud účinek pokrývá oblast, musíš kouzlo vystředit na vybraný cíl a zahrnout ho do oblasti. Pokud může být účinkem zasaženo několik možných objektů nebo tvorů, PJ náhodně určí, na které dopadne.

Hůlka si každý den za úsvitu obnoví 1k6+1 spotřebovaných nábojů. Pokud utratíš poslední náboj, hoď k20. Při výsledku 1 se hůlka rozpadne na prach a je zničena.

**Tabulka – Hůlka divů**

| k100 | Účinek |
|------|--------|
| 01–05 | Sešleš kouzlo *zpomalení*. |
| 06–10 | Sešleš kouzlo *vílí oheň*. |
| 11–15 | Jsi omráčený až do začátku svého příštího tahu, protože věříš, že se právě stalo něco úžasného. |
| 16–20 | Sešleš kouzlo *poryv větru*. |
| 21–25 | Sešleš kouzlo *odhal myšlenky* na vybraný cíl. Pokud jsi jako cíl nevybral tvora, místo toho utrpíš psychické zranění 1k6. |
| 26–30 | Sešleš kouzlo *páchnoucí oblak*. |
| 31–33 | V okruhu 60 stop se středem ve vybraném cíli začne hustě pršet. Oblast se stane lehce zastřenou. Déšť trvá do začátku tvého příštího tahu. |
| 34–36 | Na nejbližším neobsazeném místě od cíle se objeví zvíře. Není pod tvou kontrolou a jedná tak, jak by jednalo obvykle. Hodem k100 urči, jaké zvíře se objeví: při 01–25 nosorožec, při 26–50 slon a při 51–100 krysa. |
| 37–46 | Sešleš kouzlo *blesk*. |
| 47–49 | Oblast o poloměru 30 stop se středem v cíli vyplní oblak 600 nadměrně velkých motýlů. Oblast se stane silně zastřenou. Motýli zůstanou 10 minut. |
| 50–53 | Zvětšíš vybraný cíl, jako bys seslal kouzlo *zvětšení nebo zmenšení*. Pokud cíl tímto kouzlem nelze ovlivnit nebo jsi jako cíl nevybral tvora, staneš se cílem ty. |
| 54–58 | Sešleš kouzlo *temnota*. |
| 59–62 | Na zemi v okruhu 60 stop se středem ve vybraném cíli vyroste tráva. Pokud tam tráva už roste, zvětší se na desetinásobek své běžné velikosti a zůstane přerostlá 1 minutu. |
| 63–65 | Předmět, který zvolí PJ, zmizí do Éterické sféry. Předmět nesmí mít nikdo na sobě ani jej držet či nést, musí být do vzdálenosti 120 stop od cíle a nesmí mít v žádném rozměru více než 10 stop. |
| 66–69 | Zmenšíš sám sebe, jako bys na sebe seslal kouzlo *zvětšení nebo zmenšení*. |
| 70–79 | Sešleš kouzlo *ohnivá koule*. |
| 80–84 | Sešleš na sebe kouzlo *neviditelnost*. |
| 85–87 | Na vybraném cíli vyrostou listy. Pokud jsi jako cíl zvolil bod v prostoru, vyrostou listy na tvorovi nejbližším k tomuto bodu. Pokud je nikdo neotrhá, po 24 hodinách zhnědnou a opadají. |
| 88–90 | Z hrotu hůlky vystřelí proud 1k4 × 10 drahokamů, každý v hodnotě 1 zl, v čáře dlouhé 30 stop a široké 5 stop. Každý drahokam způsobí 1 drtivé zranění a celkové zranění od drahokamů se rovnoměrně rozdělí mezi všechny tvory v čáře. |
| 91–95 | Z tebe se do okruhu 30 stop rozšíří záblesk barevného třpytivého světla. Ty i každý tvor v oblasti, který vidí, musíte uspět v záchranném hodu na Odolnost se SO 15, jinak oslepnete na 1 minutu. Každý takový tvor může na konci každého svého tahu záchranný hod zopakovat a při úspěchu účinek na něj skončí. |
| 96–97 | Kůže cíle se na 1k10 dní zbarví jasně modře. Pokud jsi zvolil bod v prostoru, je zasažen tvor nejbližší tomuto bodu. |
| 98–100 | Pokud jsi zacílil tvora, musí provést záchranný hod na Odolnost se SO 15. Pokud jsi nezacílil tvora, staneš se cílem ty a musíš tento hod provést. Pokud je výsledek záchranného hodu neúspěšný o 5 nebo více, cíl okamžitě zkamení. Při jakémkoli jiném neúspěšném záchranném hodu je cíl zadržený a začíná se měnit v kámen. Dokud je takto zadržený, musí na konci svého příštího tahu záchranný hod zopakovat. Při neúspěchu zkamení, při úspěchu účinek skončí. Zkamenění trvá, dokud není cíl osvobozen kouzlem *mocné navrácení* nebo podobnou magií. |`,
  "weapon-1-2-or-3": `*Zbraň (libovolná), neobvyklá (+1), vzácná (+2) nebo velmi vzácná (+3)*

S touto magickou zbraní získáváš bonus k hodům na útok i zranění. Výše bonusu závisí na vzácnosti zbraně.`,
  "well-of-many-worlds": `*Divotvorný předmět, legendární*

Tato jemná černá látka, hebká jako hedvábí, je složená do velikosti kapesníku. Rozložením vznikne kruhová plachta o průměru 6 stop.

Jako akci můžeš *studnu mnoha světů* rozložit a položit na pevný povrch. Vytvoří tak obousměrný portál do jiného světa nebo sféry existence. Pokaždé, když předmět portál otevře, PJ rozhodne, kam vede. Otevřený portál můžeš zavřít akcí, při níž uchopíš okraje látky a znovu ji složíš. Poté, co *studna mnoha světů* otevře portál, to nemůže zopakovat po dobu 1k8 hodin.`,
  "wind-fan": `*Divotvorný předmět, neobvyklý*

Když držíš tento vějíř, můžeš z něj jako akci seslat kouzlo *poryv větru* (SO záchrany 13). Po použití bys vějíř neměl znovu použít před příštím úsvitem. Při každém dalším použití před úsvitem má kumulativní 20procentní šanci, že nebude fungovat a roztrhá se na bezcenné nemagické cáry.`,
  "winged-boots": `*Divotvorný předmět, neobvyklý (vyžaduje sladění)*

Když nosíš tyto boty, máš rychlost létání stejnou jako svou rychlost chůze. Boty ti umožní létat celkem až 4 hodiny, buď nepřetržitě, nebo v několika kratších letech, z nichž každý spotřebuje nejméně 1 minutu dostupné doby. Pokud letíš v okamžiku, kdy doba vyprší, začneš klesat rychlostí 30 stop za kolo, dokud nepřistaneš.

Za každých 12 hodin, kdy se boty nepoužívají, se jim obnoví 2 hodiny schopnosti létat.`,
  "wings-of-flying": `*Divotvorný předmět, vzácný (vyžaduje sladění)*

Když nosíš tento plášť, můžeš jako akci vyslovit jeho příkazové slovo. Plášť se ti na zádech promění v pár netopýřích nebo ptačích křídel na 1 hodinu nebo do okamžiku, kdy pomocí akce příkazové slovo zopakuješ. Křídla ti poskytují rychlost létání 60 stop. Když zmizí, nemůžeš je znovu použít po dobu 1k12 hodin.`,
};
