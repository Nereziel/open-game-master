# Czech language support (Čeština)

The UI language is selected under **Settings → Language → Čeština** or detected from a Czech browser. An administrator may choose **Čeština (Czech)** as server language, and campaigns may use Czech for the AI Game Master's narration. The language choice persists across sessions.

Czech uses the `cs-CZ` locale, three plural forms, Czech stop words, the Snowball Czech stemmer, and multilingual embeddings for campaign memory. `src/lib/i18n/cs.json` contains the first set of UI translations. Common classes, spells, conditions, equipment, and other D&D terms are display-only translations in `src/lib/content/names-cs.ts`; underlying English keys, SRD content and rules are unchanged.

**Coverage:** This is an initial translation, *not* a complete Czech edition. Untranslated UI strings, rulebook passages, monster descriptions, and unsupported content names fall back to English. The Czech names are community translations rather than official D&D terminology. Additional translations can be contributed to the catalog and names table without changing game state.
