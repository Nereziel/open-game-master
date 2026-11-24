// Pure translation helpers re-exported from the gettext-style runtime in
// src/lib/i18n/translate.ts so existing callers and tests keep working.
import { translate, translatePlural, type Locale, type TranslateVars } from "./i18n/translate.ts";
import { localeOfServerLanguage } from "./i18n/locale.ts";

export { translate, translatePlural, type Locale, type TranslateVars };
export type MessageKey = string;
export type MessageVars = TranslateVars;

// Stored and shared table messages follow the campaign language, not the reader UI.
// Unsupported table languages use the English source, just like an English table.
export function tableTranslator(language: string | null | undefined): (key: string, vars?: TranslateVars) => string {
  const locale = localeOfServerLanguage(language) ?? "en";
  return (key, vars) => translate(locale, key, vars);
}

export function pluralCategory(locale: Locale, count: number): "one" | "other" {
  if (!Number.isFinite(count)) {
    return "other";
  }
  return locale === "fr" ? (count <= 1 ? "one" : "other") : count === 1 ? "one" : "other";
}

export function formatMessage(template: string, vars?: MessageVars): string {
  if (!vars) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (slot, key: string) =>
    Object.hasOwn(vars, key) ? String(Reflect.get(vars, key)) : slot,
  );
}

// The BCP 47 tag a locale resolves to, for toLocaleDateString and friends.
export function localeTag(locale: Locale): string {
  return locale === "fr" ? "fr-FR" : locale === "cs" ? "cs-CZ" : "en-US";
}

export type PluralTranslator = (
  englishOne: string,
  englishOther: string,
  vars: TranslateVars & { count: number },
) => string;

export function pluralOf(t?: { locale?: Locale } | ((english: string, vars?: TranslateVars) => string)): PluralTranslator {
  const locale = (t as { locale?: Locale } | undefined)?.locale;
  if (locale) {
    return (one, other, vars) => translatePlural(locale, one, other, vars);
  }
  if (typeof t === "function") {
    return (one, other, vars) => t(vars.count === 1 ? one : other, vars);
  }
  return (one, other, vars) => translatePlural("en", one, other, vars);
}
