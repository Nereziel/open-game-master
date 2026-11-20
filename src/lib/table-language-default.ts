import type { Locale } from "./i18n/translate.ts";
import type { TableLanguage } from "./schemas/game-settings-options.ts";

// The UI's language is the default for a NEW table only. Stored campaign
// languages and explicit user choices are never changed by this helper.
export function tableLanguageForLocale(locale: Locale): TableLanguage {
  return locale === "cs" ? "czech" : locale === "fr" ? "french" : "english";
}

// An explicitly configured non-English server language still applies for
// an English UI. A Czech/French UI must never be silently reset to English
// by capabilities.defaultLanguage (which is English on many installations).
export function newTableLanguage(locale: Locale, serverLanguage?: TableLanguage | null): TableLanguage {
  return locale === "en" ? serverLanguage ?? "english" : tableLanguageForLocale(locale);
}
