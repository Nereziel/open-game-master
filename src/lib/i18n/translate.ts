export type Locale = "en" | "fr" | "cs";

export type TranslateVars = Record<string, string | number> & {
  context?: string;
};

type Catalog = {
  messages: Record<string, string>;
  contexts: Record<string, Record<string, string>>;
  plurals: Record<string, [string, string] | [string, string, string]>;
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

export function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) => {
    if (name === "context") return match;
    return name in vars ? String(vars[name]) : match;
  });
}

// Gettext-style translation: English is the key and fallback.
// When `vars.context` is given and an override exists in `contexts`,
// that disambiguated French string wins over the default entry.
export function translate(locale: Locale, english: string, vars?: TranslateVars): string {
  let text = english;
  const catalog = locale === "en" ? undefined : catalogs()[locale];
  if (catalog) {
    const ctx = vars?.context;
    const ctxMatch = ctx ? catalog.contexts[english]?.[ctx] : undefined;
    text = ctxMatch ?? catalog.messages[english] ?? english;
  }
  return interpolate(text, vars);
}

// Catalog grammar is selected only when a translation exists. English
// fallback always uses English grammar, regardless of the reader locale.
const SINGULAR_BY_LOCALE: Record<Locale, (count: number) => boolean> = {
  en: (count) => count === 1,
  fr: (count) => count <= 1,
  cs: (count) => count === 1,
};

export function pluralCategory(locale: Locale, count: number): "one" | "other" {
  return Number.isFinite(count) && (SINGULAR_BY_LOCALE[locale] ?? SINGULAR_BY_LOCALE.en)(count) ? "one" : "other";
}

const PLURAL_FORMS_BY_LOCALE: Partial<Record<Locale, (count: number) => 0 | 1 | 2>> = {
  cs: (count) => count === 1 ? 0 : Number.isInteger(count) && count >= 2 && count <= 4 ? 1 : 2,
};

export function translatePlural(
  locale: Locale,
  englishOne: string,
  englishOther: string,
  vars: TranslateVars & { count: number },
): string {

  const catalog = locale === "en" ? undefined : catalogs()[locale];
  if (catalog) {
    const pair = catalog.plurals[`${englishOne}\0${englishOther}`];
    if (pair) {
      const chooseForm = PLURAL_FORMS_BY_LOCALE[locale];
      const form = pair.length === 3 && chooseForm ? chooseForm(vars.count) : pluralCategory(locale, vars.count) === "one" ? 0 : 1;
      return interpolate(pair[form] ?? pair[1], vars);
    }
  }
  return interpolate(pluralCategory("en", vars.count) === "one" ? englishOne : englishOther, vars);
}
