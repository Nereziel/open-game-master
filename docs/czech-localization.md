# Czech language support (Čeština)

The UI language is selected under **Settings → Language → Čeština** or detected from a Czech browser. An administrator may choose **Čeština (Czech)** as server language, and campaigns may use Czech for the AI Game Master's narration. The language choice persists across sessions.

Czech uses the `cs-CZ` locale, three plural forms, Czech stop words, the Snowball Czech stemmer, and multilingual embeddings for campaign memory. `src/lib/i18n/cs.json` contains the first set of UI translations. Common classes, spells, conditions, equipment, and other D&D terms are display-only translations in `src/lib/content/names-cs.ts`; underlying English keys, SRD content and rules are unchanged.

**Coverage:** This is an initial translation, *not* a complete Czech edition. Untranslated UI strings, rulebook passages, monster descriptions, and unsupported content names fall back to English. The Czech names are community translations rather than official D&D terminology. Additional translations can be contributed to the catalog and names table without changing game state.

## Completing the translation catalog

The full UI manifest contains over 10,000 English strings, plus context-specific
variants and plural forms. The initial catalog includes reviewed Czech wording;
missing strings continue to fall back to English until translated.

Use a locally running **Ollama** model through its OpenAI-compatible API (no
paid API key required), or point the generator to a compatible hosted model:

```bash
npm run i18n:cs:report
CS_TRANSLATION_MODEL=qwen3:14b npm run i18n:cs:generate
npm run i18n:cs:check -- --require-complete
```

Change the model to whichever Czech-capable model you installed in Ollama.
For another provider, set `CS_TRANSLATION_ENDPOINT` to the full chat-completions
URL and `CS_TRANSLATION_API_KEY` if required. You can also pass
`--batch=8 --limit=100` to translate a manageable first portion.

The script translates English source keys from `fr.json` (not the French
translations), preserves previously reviewed translations, checks placeholders
and URLs, writes progress after every batch and supports resuming safely.
**Review AI-generated Czech before release.** It is not a substitute for
human review of rules, technical text, terminology and grammatical context.

The rulebook and long-form SRD text need a separate content localization,
not just UI catalog coverage.

## Verified coverage on this branch

- **Interface:** 1,702 of 10,549 source UI message keys translated (16.1%).
- **Context-specific variants:** 304 of 304 translated.
- **Plural keys:** 239 of 239 translated with Czech one/few/many forms.
- **Core SRD display names:** 1,463 of 1,463 keys translated (spells, monsters, items, classes, class features, equipment and other name tables).

These figures measure catalog keys, not the percent of the user experience that
appears in Czech. Some longer UI screens and the full SRD/rulebook descriptions
remain in English, so **this is still a partial localization**. The main branch
does not gain these changes until the pull request is merged. Changes should be
tested with `npm run lint`, `npm test` and `npm run build` before merging.

