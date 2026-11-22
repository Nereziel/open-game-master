# Překlady herního obsahu

Hra uchovává interní ID a pravidlová data v původním jazyce. Překlad probíhá **až při zobrazení** v klientu, herním deníku, při čtení pravidel a při exportu PDF. Překlad nesmí měnit hodnoty, ze kterých se počítají pravidla.

## Společné zdroje

- `src/lib/i18n/cs.json` – rozhraní, věty a předpřipravené osobnostní volby. Volání `translate(locale, key)` (v Reactu `useT()`).
- `src/lib/content/names-cs.ts` – názvy herních záznamů podle typu a kanonického klíče (povolání, rasy, kouzla, předměty, nestvůry).
- `src/lib/content/species-traits-cs.ts` – schválené české názvy **i celé popisy** rasových schopností.
- `src/lib/content/proficiency-labels.ts` – názvy kategorií zbrojí a zbraní, včetně zkrácené a rozvinuté varianty.
- `src/lib/i18n/game-text.ts` – **společný přístupový bod** k hernímu slovníku pro hru a PDF: `gameName`, `gameProficiency`, `gameFeature`, `gamePersonalityLine`.

České katalogy načítá na serveru `src/lib/i18n/cs-catalog.ts` a v prohlížeči `src/lib/i18n/catalog-loader.ts`. Nezakládat další ad hoc mapy v komponentách nebo PDF: nové výrazy patří do odpovídajícího společného zdroje a komponenty mají volat společné funkce.

## Příklady

| Zdroj | Výstup v deníku | Výstup v PDF |
| --- | --- | --- |
| `martial` (weapons) | Vojenské | vojenské zbraně |
| `light` (armor) | Lehká | lehká zbroj |
| `Light Bearer (the light cantrip)` | Nositel světla | Nositel světla — Znáš trik Světlo. |
| Předvolený osobnostní rys | Text z `cs.json` | Stejný překlad z `cs.json` |

Vlastní/nezmapované názvy a volný text zůstanou nezměněné. Jestliže překlad schází, doplnit jej do sdíleného katalogu, nikoliv přímo do exportního kódu.
