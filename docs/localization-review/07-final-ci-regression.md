## Etapa 7 – technická stabilizace a finální CI
Navazuje na #112; zúžený rozsah #117. Integrační základ po #116: `4e3acba44c3740155fdf253f9302101ca5933bb4`. Main neměnit před live testem.

- [x] Integrovat #114–#116; merge do pracovní větve `3623d95e7625ed414e47ccb00fc6d98477e23b89`, zachovány testy #115 i výjimka Alkahest.
- [x] Opravit potvrzenou chybu SSR: layout používal pouze fr-FR/en-US; využít existující localeTag i pro cs-CZ. Browser assertion beze změny.
- [x] Cíleně upravit navigaci table-layout: původní timeout při networkidle, nově DOMContentLoaded + hydratace + stávající kontroly připravenosti. Příčina síťového čekání není nezávisle potvrzená; ověřit novým CI.
- [ ] Ověřit existující TypeScript/lint/Knip/testy/build a Linux/Windows smoke na finálním headu.
- [ ] Základní funkčnost CS, EN/FR, načítání překladů; zdokumentovat výsledky.
- [ ] Merge #117 po ověření; detailní UI kontrola v live testu.

Dosavadní starší CI: Windows success; Linux build a 3/3 testovací shardy success, 2/6 browser skupin failure (SSR a timeout table-layout). Nové běhy dosud nepotvrzeny. PDF #119, ostatní rozšíření #118, SQLite mimo rozsah. Bez změny mechaniky ani persistence. Historická evidence v předchozích revizích PR.