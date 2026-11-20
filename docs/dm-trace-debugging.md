# Diagnostika AI vypravěče (JSONL)

Pro těžko reprodukovatelné chyby typu `saga plan: unreadable reply`,
`claims: invalid-claims-shape`, anglické odpovědi u české kampaně
a odmítnutí obrázku lze zapnout **lokální** diagnostickou stopu.

## Zapnutí na Windows Serveru

Pro běžné spuštění Next.js můžete dát do souboru `.env` v kořeni
projektu obě proměnné a restartovat Node proces:

~~~dotenv
DM_DEBUG=1
DM_TRACE=1
~~~

Alternativně v PowerShellu, **před spuštěním** Node aplikace:

~~~powershell
$env:DM_TRACE = "1"
npm run start
~~~

Pro vývojový režim použijte místo `start` příkaz `npm run dev`.
Pro jednorázové vypnutí stačí restartovat server bez této proměnné
(`Remove-Item Env:DM_TRACE` ve stejném PowerShell okně).

Proměnná `DM_DEBUG=1` je nezávislá: vypisuje stručná hlášení
do konzole. `DM_TRACE=1` navíc ukládá detailní JSONL stopy do souborů.

## Kde záznamy najít

Z kořenového adresáře aplikace:

`data/dm-traces/YYYY-MM-DD-PID.jsonl`

Příklad pro čtení posledních řádků v PowerShellu:

~~~powershell
Get-Content .\data\dm-traces\*.jsonl -Tail 30
~~~

Každý řádek je samostatný objekt JSON. Pro filtr pouze selhání parseru:

~~~powershell
Get-Content .\data\dm-traces\*.jsonl |
  ConvertFrom-Json |
  Where-Object { $_.event -eq 'json_validation' -and $_.accepted -eq $false } |
  Select-Object at, campaignId, flowId, stage, attempt, reason
~~~

## Co se ukládá

- `model_request`: typ úlohy, použitý model/provider, předané zprávy,
  seznam nabízených nástrojů a parametry volání.
- `model_response`: původní text a nástrojová volání vrácená modelem,
  finish reason, doba volání, případná chyba a údaje o spotřebě.
- `model_blocked` a `model_exception`: odmítnutí kvůli kontextovému
  oknu nebo výjimce.
- `json_validation`: konkrétní krok (plán ságy, úvodní akt, světové
  oblouky, čtečka tvrzení, překlad obrazového promptu), číslo pokusu
  a zda prošel kontrolou.
- `arc_step`: konkrétní krok generování příběhu (`opening act`,
  `act detail`, `saga replot` apod.), aby šlo odlišit různé
  požadavky se společným úkolem `arc_plan`.
- `arc_stored`: výsledek uložení a při změně kompletní podoba
  ságy/dějství po zpracování odpovědi AI. Rozdíl mezi `model_response`
  a `arc_stored` ukáže, co aplikace skutečně přijala a uložila.
- `arc_plan_language`: odmítnutí plánu v nesprávném jazyce.
- `flow_start`, `flow_end`, `arc_plan_result`, `claims_result`,
  `world_arcs_result` a `image_prompt_fallback`: průběh a výsledek.
- `image_generation_request` a `image_generation_result`: prompt
  odeslaný pro mapu nebo scénu a důvod odmítnutí poskytovatelem.

Záznamy generování ságy (`saga_generation`), aktualizace po kapitole
(`arc_refresh`) a obnovení plánování (`arc_exhausted_recovery`) lze
spojit podle `flowId`. Požadavek s odpovědí podle `traceId`.
Plánovací krok, odpověď AI a uložená sága tak zůstávají propojené
i při opakovaném generování. U tahů modelu se ukládá i `turnId` a `callIndex`,
jsou-li dostupné.

## Soukromí a limity

**Výchozí stav je vypnuto.** Po zapnutí mohou soubory obsahovat celé
herní prompty, dialogy, osobní zprávy hráčů a skryté plány kampaně.
Nesdílejte je veřejně ani je neumisťujte do Git repozitáře. Před
předáním k diagnostice je zkontrolujte a odstraňte citlivé údaje.
Na víceuživatelském serveru před zapnutím informujte hráče.

Známé formáty API klíčů, autorizační hlavičky a položky s názvy
jako `apiKey`, `password`, `authorization`, `provider_items`
se maskují. Obrazové datové URL a soukromé binární přílohy se neukládají.
Maskování však nemusí rozpoznat každé tajemství, které někdo ručně
napíše do obyčejného textu.

Limit jednoho textového pole je 100 000 znaků, jednoho záznamu 512 KiB,
jednoho souboru 8 MiB. Ponechává se nanejvýš 12 souborů, nejdéle
3 dny; staré soubory se odstraňují při dalších zápisech.
Adresář `data/` je v `.gitignore`, zápis souborů používá soukromá
oprávnění, kde je OS podporuje. Chyba zápisu nezastaví hru.
