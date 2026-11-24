// Úplné české překlady SRD 5.1 (2014), magické předměty 161–170 podle řazených ID.
// Původní pravidlové texty: CC BY 4.0, Wizards of the Coast.
export const CZECH_FULL_ITEMS_03_A: Readonly<Record<string, string>> = {
  "ring-of-regeneration": `*Prsten, velmi vzácný (vyžaduje sladění)*

Když nosíš tento prsten a máš alespoň 1 život, obnovíš si každých 10 minut 1k6 životů. Pokud přijdeš o část těla, prsten způsobí, že chybějící část po 1k6+1 dnech znovu doroste a bude plně funkční, pokud jsi po celou tuto dobu měl alespoň 1 život.`,
  "ring-of-resistance": `*Prsten, vzácný (vyžaduje sladění)*

Když nosíš tento prsten, máš odolnost vůči jednomu typu zranění. Drahokam zasazený do prstenu označuje typ zranění; PJ jej vybere nebo určí náhodně.

**Tabulka – Prsten odolnosti**

| k10 | Typ zranění | Drahokam |
|-----|-------------|----------|
| 1 | Kyselinové | Perla |
| 2 | Chladné | Turmalín |
| 3 | Ohnivé | Granát |
| 4 | Silové | Safír |
| 5 | Bleskové | Citrín |
| 6 | Nekrotické | Gagát |
| 7 | Jedové | Ametyst |
| 8 | Psychické | Nefrit |
| 9 | Zářivé | Topaz |
| 10 | Hromové | Spinel |`,
  "ring-of-shooting-stars": `*Prsten, velmi vzácný (vyžaduje sladění venku v noci)*

Když nosíš tento prsten v šeru nebo ve tmě, můžeš z něj libovolně sesílat kouzla *tančící světla* a *světlo*. Seslání každého z těchto kouzel z prstenu vyžaduje akci.

Prsten má 6 nábojů pro následující další vlastnosti. Denně za úsvitu si obnoví 1k6 spotřebovaných nábojů.

***Vílový oheň.*** Jako akci můžeš utratit 1 náboj a seslat z prstenu *vílí oheň*.

***Kulový blesk.*** Jako akci můžeš utratit 2 náboje a vytvořit jednu až čtyři koule blesků o průměru 3 stopy. Čím více koulí vytvoříš, tím slabší je každá z nich.

Každá koule se objeví na neobsazeném místě, které vidíš do vzdálenosti 120 stop. Koule vydrží, dokud se na ně soustředíš (jako při soustředění na kouzlo), nejvýše 1 minutu. Každá koule vydává šero v okruhu 30 stop.

Jako bonusovou akci můžeš každou kouli přesunout až o 30 stop, ale žádná se nesmí vzdálit více než 120 stop od tebe. Když se jiný tvor než ty přiblíží ke kouli na 5 stop nebo méně, koule na něj vyšle blesk a zmizí. Tvor musí uspět v záchranném hodu na Obratnost se SO 15. Při neúspěchu utrpí bleskové zranění podle počtu vytvořených koulí.

**Tabulka – Prsten padajících hvězd**

| Počet koulí | Bleskové zranění |
|-------------|------------------|
| 4 | 2k4 |
| 3 | 2k6 |
| 2 | 5k4 |
| 1 | 4k12 |

***Padající hvězdy.*** Jako akci můžeš utratit 1 až 3 náboje. Za každý utracený náboj vystřelíš z prstenu zářící světelnou jiskru na bod, který vidíš do vzdálenosti 60 stop. Každého tvora v krychli o hraně 15 stop vycházející z daného bodu zasypou jiskry; musí uspět v záchranném hodu na Obratnost se SO 15, jinak utrpí ohnivé zranění 5k4. Při úspěchu utrpí poloviční zranění.`,
  "ring-of-spell-storing": `*Prsten, vzácný (vyžaduje sladění)*

Tento prsten uchovává kouzla, která do něj někdo sešle, dokud je sladěný nositel nepoužije. Současně dokáže uchovávat kouzla v souhrnu nejvýše 5 stupňů. Při nalezení obsahuje kouzla v souhrnu 1k6 − 1 stupňů, která zvolí PJ.

Libovolný tvor může do prstenu uložit kouzlo 1. až 5. stupně tak, že se při jeho sesílání prstenu dotýká. Kouzlo nemá žádný jiný účinek než uložení do prstenu. Pokud prsten kouzlo nepojme, kouzlo se spotřebuje bez účinku. Místo, které kouzlo zabere, určuje stupeň pozice použité k jeho seslání.

Když nosíš tento prsten, můžeš seslat libovolné kouzlo, které je v něm uložené. Kouzlo používá stupeň pozice, SO záchrany proti kouzlu, bonus k útoku kouzlem a sesílací vlastnost původního sesilatele; ve všem ostatním se považuje za tebou seslané. Seslané kouzlo se z prstenu odstraní a uvolní v něm místo.`,
  "ring-of-spell-turning": `*Prsten, legendární (vyžaduje sladění)*

Když nosíš tento prsten, máš výhodu k záchranným hodům proti každému kouzlu, které cílí pouze na tebe (a nezasahuje tě v oblasti účinku). Navíc pokud při takovém záchranném hodu padne na kostce 20 a jde o kouzlo 7. nebo nižšího stupně, kouzlo na tebe nemá žádný účinek a místo tebe zacílí na svého sesilatele. Použije se stupeň jeho pozice kouzla, SO záchrany proti kouzlu, bonus k útoku kouzlem i sesílací vlastnost sesilatele.`,
  "ring-of-swimming": `*Prsten, neobvyklý*

Když nosíš tento prsten, máš rychlost plavání 40 stop.`,
  "ring-of-telekinesis": `*Prsten, velmi vzácný (vyžaduje sladění)*

Když nosíš tento prsten, můžeš libovolně sesílat kouzlo *telekineze*, ale jako cíl můžeš zvolit pouze předměty, které nikdo nemá na sobě ani je nedrží či nenese.`,
  "ring-of-the-ram": `*Prsten, vzácný (vyžaduje sladění)*

Prsten má 3 náboje a každý den za úsvitu si obnoví 1k3 spotřebovaných nábojů. Když jej nosíš, můžeš jako akci utratit 1 až 3 jeho náboje a zaútočit na jednoho tvora, kterého vidíš do vzdálenosti 60 stop. Prsten vytvoří přízračnou beraní hlavu, která provede hod na útok s bonusem +7. Při zásahu utrpí cíl za každý utracený náboj silové zranění 2k10 a je odtlačen o 5 stop od tebe.

Případně můžeš jako akci utratit 1 až 3 náboje prstenu a pokusit se rozbít předmět, který vidíš do vzdálenosti 60 stop a který nikdo nemá na sobě ani jej nedrží či nenese. Prsten provede ověření Síly s bonusem +5 za každý utracený náboj.`,
  "ring-of-three-wishes": `*Prsten, legendární*

Když nosíš tento prsten, můžeš jako akci utratit 1 z jeho 3 nábojů a seslat z něj kouzlo *přání*. Po spotřebování posledního náboje prsten přestane být magický.`,
  "ring-of-warmth": `*Prsten, neobvyklý (vyžaduje sladění)*

Když nosíš tento prsten, máš odolnost vůči chladnému zranění. Navíc tobě ani ničemu, co máš na sobě nebo neseš, neškodí teploty až do -50 stupňů Fahrenheita.`,
};
