import type { Locale } from "./translate";

export const LOCALE_COOKIE = "odm_locale";

// One registry for supported UI languages and their server-language names.
export const LOCALE_METADATA = {
  en: { serverLanguage: "english", tag: "en-US", nativeName: "English" },
  fr: { serverLanguage: "french", tag: "fr-FR", nativeName: "Français" },
  cs: { serverLanguage: "czech", tag: "cs-CZ", nativeName: "Čeština" },
} as const satisfies Record<Locale, { serverLanguage: string; tag: string; nativeName: string }>;

export function localeTag(locale: Locale): string {
  return (LOCALE_METADATA[locale] ?? LOCALE_METADATA.en).tag;
}

export function serverLanguageOfLocale(locale: Locale) {
  return (LOCALE_METADATA[locale] ?? LOCALE_METADATA.en).serverLanguage;
}

export function parseLocale(raw: string | null | undefined): Locale | null {
  return raw && Object.hasOwn(LOCALE_METADATA, raw) ? raw as Locale : null;
}

// The menus' language a server's own language asks for (global config
// serverLanguage, set by its admin): a supported non-English UI language. English is every server's default and says nothing
// about its readers, so it leaves the choice to them and their browser.
export function localeOfServerLanguage(language: string | null | undefined): Locale | null {
  return (Object.keys(LOCALE_METADATA) as Locale[]).find((locale) => locale !== "en" && LOCALE_METADATA[locale].serverLanguage === language) ?? null;
}

export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return "en";
  const tags = header
    .split(",")
    .map((part, at) => {
      const [tag, ...params] = part.split(";");
      const q = params.map((param) => /^\s*q\s*=\s*([0-9.]+)\s*$/i.exec(param)?.[1]).find((value) => value !== undefined);
      const weight = q === undefined ? 1 : Number(q);
      return { tag: tag.trim().toLowerCase(), weight: Number.isFinite(weight) ? weight : 0, at };
    })
    .filter(({ weight }) => weight > 0)
    .sort((a, b) => b.weight - a.weight || a.at - b.at);
  for (const { tag } of tags) {
    const locale = parseLocale(tag.split("-")[0]);
    if (locale) return locale;
  }
  return "en";
}

function cookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      try {
        return decodeURIComponent(part.slice(eq + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

// Server-side locale resolution (per @mcerina's design in #919):
// 1. User's saved profile setting (when signed in)
// 2. `odm_locale` cookie (set by the client when switching language / pre-login)
// 3. the server's own language, where the menus have it (localeOfServerLanguage)
// 4. `Accept-Language` header
// 5. Default `"en"`
export function resolveLocale(options: {
  savedLocale?: string | null;
  cookieHeader?: string | null;
  serverLocale?: Locale | null;
  acceptLanguage?: string | null;
}): Locale {
  return (
    parseLocale(options.savedLocale) ??
    parseLocale(cookieValue(options.cookieHeader ?? null, LOCALE_COOKIE)) ??
    options.serverLocale ??
    localeFromAcceptLanguage(options.acceptLanguage)
  );
}

export function resolveRequestLocale(request: Request, savedLocale?: string | null, serverLocale?: Locale | null): Locale {
  return resolveLocale({
    savedLocale,
    cookieHeader: request.headers.get("cookie"),
    serverLocale,
    acceptLanguage: request.headers.get("accept-language"),
  });
}

// API readers may explicitly override their UI language. SSR profile resolution stays separate.
export function resolveApiLocale(request: Request, serverLocale?: Locale | null): Locale {
  return parseLocale(request.headers.get("x-odm-locale")) ?? resolveRequestLocale(request, null, serverLocale);
}
