# Source-scoped content localization — Issue #107

Phase 1 introduces a standalone, non-invasive `TranslationRegistry`. It does
not replace the current SRD reader or install the translations from PR #106.

## Contract

- Key: `sourceId + contentType + contentId + locale`. The `contentId` must be
  the canonical entry identifier **within its source and content type**.
- `translationSourceId` normalizes importer aliases: `wotc-srd` → `srd-5.1`,
  `toh` → `tome-of-heroes`, `deepm|dmag` → `deep-magic`,
  `vom` → `vault-of-magic`. Homebrew is not silently translated. Unidentified
  `bundled` rows are not presumed to belong to SRD.
- A single pack supplies one source/locale combination. Registering the same
  pair twice throws; translation keys must be non-empty. Each entry has
  display-only `name`, `description` and/or `metadata`.
- `resolve` never loads content from another source. Missing fields fall back
  to **that record's own English original**, and unresolved keys are exposed
  by `missingTranslations()`. The registry never modifies stored IDs.
- `common/cs.ts` contains reusable terminology; actual book-specific names,
  mechanics and descriptive text will live in each book's own adapter/pack.
- The registry is instance-based, has no global singleton, and can be shared by
  client and server without reading the database, React or Node-specific APIs.

## Planned integrations

Phase 2: adapt existing `rulebook/czech-full-*` into an `srd-5.1` pack
without moving source text; reconcile stable rulebook IDs with Open5e slugs.

Phase 3: split PR #106 translations into distinct `tome-of-heroes`,
`deep-magic`, `vault-of-magic` packs; preserve original texts and license
attribution.

Phase 4: migrate display call sites one by one (`contentName`, pickers, sheet,
workshop, PDF). Dedupe **by provenance and canonical identity**, not English
name. MCP may accept localized aliases but must retain canonical tool names,
argument keys and engine IDs.

## Verification

`npx vitest run src/lib/content/translations/registry.test.ts`

The test file covers same-name collisions between books, missing translations,
per-field fallback, immutable originals, edition/source aliases, duplicate pack
registration and the d20.cz D&D 5e (2014) glossary.
