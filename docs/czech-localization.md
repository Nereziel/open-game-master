# Czech language support (Čeština)

The UI language is selected under **Settings → Language → Čeština** or detected from a Czech browser. An administrator may choose **Čeština (Czech)** as server language, and campaigns may use Czech for the AI Game Master's narration. The language choice persists across sessions.

Czech uses the `cs-CZ` locale, three plural forms, Czech stop words, the Snowball Czech stemmer, and multilingual embeddings for campaign memory. `src/lib/i18n/cs.json` contains the first set of UI translations. Common classes, spells, conditions, equipment, and other D&D terms are display-only translations in `src/lib/content/names-cs.ts`; underlying English keys, SRD content and rules are unchanged.

**Coverage:** This is an initial translation, *not* a complete Czech edition. Untranslated UI strings, rulebook passages, monster descriptions, and unsupported content names fall back to English. The Czech names are community translations rather than official D&D terminology. Additional translations can be contributed to the catalog and names table without changing game state.

## Completing the translation catalog

The full UI manifest contains over 10,000 English strings, plus context-specific
variants and plural forms. The initial catalog includes reviewed Czech wording;
missing strings continue to fall back to English until translated.

### Preferred: DeepL for interface strings

DeepL's new API Developer plan allows **1 million source characters total** free,
not monthly. The older API Free plan has 500,000 monthly characters but is no
longer offered to new customers. Check current terms before signing up.

```bash
npm run i18n:cs:deepl -- --report
npm run i18n:cs:deepl -- --self-test
export DEEPL_API_KEY="YOUR_KEY"
# For a legacy Free plan key ending :fx, the correct host is selected automatically.
# Override DEEPL_API_URL if your Developer account uses a different host.
npm run i18n:cs:deepl -- --limit=100 --batch=10
npm run i18n:cs:deepl
npm run i18n:cs:check -- --require-complete
```

The DeepL script uses the English keys in `fr.json` (not the French translations),
translates only missing entries, protects placeholders, HTML, URLs and inline
code as ignored XML elements, validates each batch and saves progress so the run
can resume. A nonempty `DEEPL_API_KEY` is required for translation, not for
reporting or self-tests. Do not commit API keys.

### Alternative: context-aware language model

For more contextual translation or terminology review, use a capable Gemini,
Claude or other OpenAI-compatible model with the existing generator:

```bash
export CS_TRANSLATION_API_KEY="YOUR_KEY"
export CS_TRANSLATION_ENDPOINT="https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
CS_TRANSLATION_MODEL=gemini-2.5-flash npm run i18n:cs:generate -- --limit=100
```

The model identifier above is an example, not a guarantee of availability:
use a current model permitted by your Gemini API account. Also supported:
`CS_TRANSLATION_ENDPOINT` to any compatible endpoint and
`CS_TRANSLATION_MODEL` set to the actual model. The local Ollama workflow
remains optional but Qwen is **not** recommended as the Czech-quality default.

**Review machine-generated Czech before release**, especially plurals, spell
terminology and long messages. The full rulebook and SRD descriptions are not
covered by this UI catalog.

The rulebook and long-form SRD text need a separate content localization,
not just UI catalog coverage.

## Verified coverage on this branch

- **Interface:** 3,049 of 10,549 source UI message keys translated (28.9%).
- **Context-specific variants:** 304 of 304 translated.
- **Plural keys:** 239 of 239 translated with Czech one/few/many forms.
- **Core SRD display names:** 1,463 of 1,463 keys translated (spells, monsters, items, classes, class features, equipment and other name tables).

These figures measure catalog keys, not the percent of the user experience that
appears in Czech. Some longer UI screens and the full SRD/rulebook descriptions
remain in English, so **this is still a partial localization**. The main branch
does not gain these changes until the pull request is merged. Changes should be
tested with `npm run lint`, `npm test` and `npm run build` before merging.


## Manual translation batches

- **Batch 1 (200 strings, Nov 2026):** Hand-translated story-lore entries, party-roster setup, map generation and worldpack settings. Preserved variable placeholders and verified the entries against the English source keys. No DeepL or other translation API was used.

Current source catalog: **3049 / 10549 messages translated**, **7500 missing**. The remaining UI messages can be translated in additional manually reviewed batches. Full rulebook descriptions still need their own translation effort.

- **Batch 2 (647 strings, Nov 2026):** Manually translated worldpack settings, storyboard and lore connections, bestiary linking, regional maps, WorldForge encyclopedia and timeline, image generation, session and narration controls, trading, and companions. Seven consecutive commits (six 100-key batches and one 47-key batch), all saved to `feat/czech-localization`. Source placeholders and markup were compared with the English keys across the full Czech UI catalog: zero mismatches.

**Current catalog coverage:** 3,049 of 10,549 strings (28.9%), with 7500 still untranslated. Full build/test not yet run.

- **Batch 3 (500 strings, Nov 2026):** Manually translated five 100-key groups covering voice chat and speaker casting, combat conditions, character sheets, spell slots and spellbooks, inventory, level advancement and character creation. All source placeholders and markup checked; no missing or altered tokens.

**After batch 3:** 3,049 of 10,549 source messages have Czech translations (28.9%); 7,500 remain. Context-specific and plural catalogs are unchanged. The full build and automated tests have not yet been run.
