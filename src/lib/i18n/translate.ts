export type Locale = "en" | "fr" | "cs";

export type TranslateVars = Record<string, string | number> & {
  context?: string;
};

type Catalog = {
  messages: Record<string, string>;
  contexts: Record<string, Record<string, string>>;
  plurals: Record<string, [string, string, string?]>;
};

// Small patches for missing Czech UI keys while the large generated catalog
// remains unchanged. Only apply when the catalog would display English.
const CZECH_LABEL_FALLBACKS: Record<string, string> = {
  "{name} is ready": "{name} je připravená postava",
  "Level {level}": "{level}. úroveň",
  "Three things to try on your turn": "Tři věci, které můžeš vyzkoušet ve svém tahu",
  "Your sheet lists everything you can do once you sit down at a table.": "Na deníku postavy najdeš všechny své možnosti pro hru.",
  "Don't show this again": "Příště už nezobrazovat",
  "Bring to a table": "Přidat ke hernímu stolu",
  "Done": "Hotovo",
  "Portrait of {name}": "Portrét postavy {name}",
  "{name}, placeholder portrait": "Náhradní portrét postavy {name}",
  "The portrait is still painting. It will appear here when it is done.": "Portrét se stále vytváří. Po dokončení se zde zobrazí.",
  "The portrait could not be painted. You can paint or upload one from the sheet.": "Portrét se nepodařilo vytvořit. Můžeš jej vytvořit nebo nahrát v deníku postavy.",
  "Could not save that. Try again.": "Nastavení se nepodařilo uložit. Zkus to znovu.",
  "Changing the {because} set aside {named}: it no longer fits.": "Změna {because} vyřadila {named}, protože už nevyhovuje.",
  "Changing the {because} set aside {named}: they no longer fit.": "Změna {because} vyřadila {named}, protože už nevyhovují.",
  "{bonus} to hit": "Zásah {bonus}",
  "Swing your {name}": "Zaútoč zbraní {name}",
  "Shoot your {name}": "Vystřel ze zbraně {name}",
  "Use {name}": "Použij {name}",
  "Cast {name}": "Seslat {name}",
  "Reaction roll": "Hod na reakci",
  "Cancel": "Zrušit",
  "overworld.size.small": "Malá",
  "overworld.size.medium": "Střední",
  "overworld.size.large": "Velká",
  "overworld.size.vast": "Rozlehlá",
  "{label} ({width} by {height})": "{label} ({width} × {height})",
  "{width} by {height}": "{width} × {height}",
  "Read it into the dials": "Převést popis na nastavení terénu",
  "Sea level": "Hladina moře",
  "Mountains": "Hory",
  "Forests": "Lesy",
  "Aridity": "Suchost",
  "Coastline": "Pobřeží",
  "Dials set.": "Nastavení terénu je připraveno.",
  "Reroll below until the coastline falls where you want it.": "Znovu vygenerujte terén, dokud nebude pobřeží podle vašich představ.",
  "Roll a world": "Vygenerovat svět",
  "Size of the next roll": "Velikost nové mapy",
  "Reroll the terrain under these dials, at this size. Places, pins, lines and notes stay.": "Znovu vygenerovat terén v nastavené velikosti. Místa, značky, cesty a poznámky zůstanou.",
  "Add {count} place": "Přidat {count} místo",
  "Add {count} places": "Přidat {count} místa",
  "Add a place": "Přidat místo",
  "Put it on the map": "Umístit na mapu",
  "Notes on the region": "Poznámky o oblasti",
  "Yours alone; players never see this.": "Pouze pro vás, hráči tyto poznámky neuvidí.",
  "What a traveller would say": "Co by řekl pocestný",
  "What a traveller would say about it (optional)": "Co by o místě řekl pocestný (nepovinné)",
  "What lies past the edge. Which roads are watched.": "Co leží za hranicí oblasti? Které cesty jsou hlídané?",
  "A chain of islands off a storm coast, pine forest inland.": "Řetězec ostrovů u bouřlivého pobřeží, ve vnitrozemí borové lesy.",
  "The Salt Wharf": "Solné přístaviště",
  "That did not work.": "Akci se nepodařilo provést.",
  "The model had nothing for that.": "Model nedokázal zpracovat popis oblasti.",
  "Rolls how an NPC takes the party on the DMG reaction table.": "Určí počáteční postoj cizí postavy k družině hodem podle tabulky reakcí.",
};

// The French catalog is about 1 MB of JSON (340 KiB gzip). Imported here it
// rode in the first load of every page, French reader or not (the shared
// LocaleApplier and every useT pull this module in). It is installed
// instead: on the server at start (fr-catalog.ts, from instrumentation.ts,
// the root layout and request-locale.ts), in a browser on demand when the
// reader's language is French (catalog-loader.ts, its own chunk). Until a
// catalog is installed its locale reads English, the source. The store sits
// on globalThis so the server's module layers (route, page, SSR) share one.
const STORE = "__odmI18nCatalogs";

function catalogs(): Partial<Record<Locale, Catalog>> {
  const holder = globalThis as typeof globalThis & { [STORE]?: Partial<Record<Locale, Catalog>> };
  holder[STORE] ??= {};
  return holder[STORE];
}

export function installCatalog(locale: Locale, catalog: unknown): void {
  if (locale !== "en") {
    catalogs()[locale] = catalog as Catalog;
  }
}

// English is the source and needs no catalog.
export function catalogInstalled(locale: Locale): boolean {
  return locale === "en" || Boolean(catalogs()[locale]);
}

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) => {
    if (name === "context") return match;
    return name in vars ? String(vars[name]) : match;
  });
}

// Gettext-style translation: English is the key and fallback.
// Context overrides are selected from the catalog of the requested locale.
export function translate(locale: Locale, english: string, vars?: TranslateVars): string {
  let text = english;
  const catalog = locale !== "en" ? catalogs()[locale] : undefined;
  if (catalog) {
    const ctx = vars?.context;
    const ctxMatch = ctx ? catalog.contexts[english]?.[ctx] : undefined;
    text = ctxMatch ?? catalog.messages[english] ?? english;
  }
  if (locale === "cs" && text === english) {
    text = CZECH_LABEL_FALLBACKS[english] ?? text;
  }
  return interpolate(text, vars);
}

export function translatePlural(
  locale: Locale,
  englishOne: string,
  englishOther: string,
  vars: TranslateVars & { count: number },
): string {
  const isOne = locale === "fr" ? vars.count <= 1 : vars.count === 1;
  const catalog = locale !== "en" ? catalogs()[locale] : undefined;
  if (catalog) {
    const pair = catalog.plurals[`${englishOne}\0${englishOther}`];
    if (pair) {
      // Czech: one (1), few (2–4), other (0 and 5+). The third
      // translation is optional so two-form catalogs still work.
      if (locale === "cs") {
        const form = vars.count === 1 ? 0 : vars.count >= 2 && vars.count <= 4 ? 1 : 2;
        return interpolate(pair[form] ?? pair[1], vars);
      }
      return interpolate(isOne ? pair[0] : pair[1], vars);
    }
  }
  return interpolate(isOne ? englishOne : englishOther, vars);
}
