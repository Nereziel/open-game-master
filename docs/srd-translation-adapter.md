# SRD 5.1 Czech companion adapter (Issue #107, phase 2)

This change is stacked on PR #108 and does not modify the original 2014 SRD
or any existing Czech translation batch.

## Source and identity

The caller passes the existing English and Czech `RulebookPage[]` arrays.
`srdTranslationPack` indexes both books by the immutable page ID, checks
matching chapter and kind, and emits a `TranslationPack` under `srd-5.1`.
Mappings: rule → rules, race → species, class → classes, spell → spells,
monster → monsters, item → items.

The Czech companion currently appends an unchanged English source page at
the end of each Czech page. The adapter checks that suffix exactly and
removes it from the registered Czech description, including the source-language
divider. This avoids displaying the English original twice if a consumer
later renders an English fallback separately.

## Coverage and boundary

The returned `coverage` reports the total number of original pages, counts
of localized entries by content type, and IDs of pages for which no Czech
name, body or metadata is available. This is a structural check only and
does not certify the fidelity of a prose translation.

The old rulebook remains the authority during this phase. Do **not** call
`registry.resolve` as a replacement for its existing page data until phase
4's consumer integration and side-by-side regression testing are complete.

Open5e's `document_slug=wotc-srd` and bundled SRD must map to this same
logical source, but distinct Open5e slugs must be crosswalked to the stable
rulebook page IDs explicitly. Never match solely on the English title.
The SRD 2024 documents are excluded from this conversion.

## Regression tests

`npx vitest run src/lib/content/translations`

Tests cover the actual bundled SRD corpus as well as synthetic corrupted
pages, per-page fallback, unchanged origin, correct content kinds and
stable source IDs. Run on a known commit; pre-existing failures on the
`main` Linux smoke must not be attributed to this adapter.

## Open5e ↔ SRD page crosswalk

`srdPageIdForCatalogRecord(record, englishPages)` is a **display-only**
bridge between the Open5e catalog and this translated rulebook pack:

1. Refuse rows unless their proven source resolves to `srd-5.1`.
2. For bundled `srd:<page-id>` rows or explicit `rulebook` links, verify
   that the page ID, content kind and canonical English title (or an explicit
   vetted catalog alias) agree.
3. For Open5e slugs, match against **English SRD pages of the same kind**;
   return null on zero or multiple matching pages. Never infer a source
   from a title or select the first ambiguous result.
4. Never rewrite the original row, slug, saved IDs or rulebook content.
   Source-specific translations are looked up by the resulting page ID.
5. Some subraces, spells with alternative printed names and nested entries
   may need additional explicit mappings in a later integration PR. A
   missing/unmapped entry stays English rather than borrowing from another
   source.

The legacy `rulebookPageIdFor` helper performs broader page discovery,
including fuzzy race sections; the new translator must not use that
fuzziness to guess a canonical translation identity.

## Display resolver (opt-in)

`resolveSrdCatalogTranslation(registry, row, englishPages, original, locale)`
combines the strict crosswalk with the source pack. It returns `pageId`,
a `translated` flag, and localized `display` fields; it never modifies the
original row or game mechanics. It is now wired into catalog results, direct detail, builder pickers and the workshop as an **optional display-only layer**.
Unmapped, non-SRD, user-authored and English-language entries retain their
original display fields. The UI migration should use this bridge instead of
calling `contentName` without provenance.

Integration tests cover real bundled SRD spell/item rows, cross-book name
collisions, ambiguous IDs, translated fields and unchanged English mechanics.

## Completeness accounting

`coverage.translated` counts entries with any Czech field; it is **not**
proof of full prose translation. `coverage.fullText` counts pages whose
companion Markdown includes the SRD full-text section heading;
`coverage.incompleteIds` lists pages without that heading (except the
required unmodified legal page). `coverage.missingIds` lists pages without
any translation. These are structural signals, not semantic accuracy
validation. Full text coverage is tested independently for rule chapters,
classes, monsters, magic items, spells and race pages, using the source
catalog's actual category sizes.

The source has 36 rule-kind pages including licensing information; 35 are
expected to contain complete Czech rules text. The license is excluded from
the `fullText` requirement and retained in the original form.

## Metadata mechanical audit

`auditSrdLocalizedMetadata(english, czech)` compares the multiset of
numeric and dice tokens in localized metadata and magic-item names against
the original SRD. It catches changed spell levels, dice, enchantment bonuses
and fractions such as challenge rating. Tokens are compared without
depending on Czech word order. The corresponding regression test runs on
every bundled page, not only a few selected examples.

**Scope:** This is a mechanical sanity check, not proof that all spell-school,
creature-type, rarity, alignment, attunement or rule-prose translations are
correct. Those terms still require glossary review against d20.cz and
line-by-line comparison with the licensed English original.

## Feat coverage boundary

The bundled SRD publishes feats within the rules page with ID `feats`,
rather than as independent `RulebookKind=feat` pages. The adapter verifies
that this full Czech rules page exists. It does **not** claim individual
completeness of the app's separate `odm-expanded` authored feat catalog
(`src/lib/srd/authored-feats.json`), which is not the same book and will
need its own provenance-aware localization check during consumer migration.

## Structured catalog display fields

`srdStructuredMetadataCs` translates the known **display values** for
spell school, magic item rarity and item category, using the existing
SRD Czech terminology. It runs only for a verified SRD source and Czech
locale. Unknown categories stay in the original language, not a guessed
translation; the original model/data row and mechanics remain untouched.

`resolveSrdCatalogTranslation` calls it only **after** successfully
mapping an actual catalog row to a canonical SRD page ID. The result
continues to carry a separate `display.metadata`, not a modified
`data_json` or rules-engine field. The builder pickers and workshop catalog now consume this display layer.
Campaign character sheets and PDF still need explicit consumer-side coverage
and the new bridge does not automatically replace those other labels.

## Consumer integration (source-safe display layer)

The catalog API and direct detail API now add an optional `display`
object for Czech SRD entries only. `display.name`, `description`,
`school`, `rarity`, `category` and `meta` are for presentation.
`name`, `slug`, `source`, `documentSlug`, `data` and mechanics remain
canonical and continue to drive selection, game rules and persistence.

The character builder's single/multi pickers request the active UI locale,
show these Czech display fields and include source-book provenance in result
labels. The info dialog prefers the localized rule text when available.
Picker row deduplication now uses provenance and exact slug instead of
English name; two separate books' identically named rows are not collapsed.
The multi-picker's pending selection also uses slug identity, while existing
stored character names remain unchanged.

The server supports **unique, exact Czech SRD titles** as catalog search
aliases; unknown or ambiguous requests remain unchanged. This deliberately
does not promise full substring searching or translation of other books.

Remaining work: audit all consumers (campaign sheet, workshop, PDF,
reference), migrate any name-only persistence flows carefully and add
source-specific packs for other licensed content. The new SRD display object
is not evidence that those other surfaces have been migrated.

### Additional consumer coverage and performance

The builder's browse-all `CatalogBrowser`, workshop `CatalogStart` and
direct detail endpoint also read the same optional display layer. The
browsable list refetches when the user's language changes, and every
source-distinct row carries its book label. This does not modify draft or
character engine data.

For `lite=1` queries only the translated display name/metadata are
returned; the server omits lengthy Czech descriptions, so phone pickers
do not download a whole book to display short lists. The full detail
endpoint still provides the appropriate Czech rules on demand.

Known integration limit: some saved character selections still store only
English names (not provenance). Although the picker keeps multiple book
rows visible and pending selections are slug-aware, a complete storage
migration must be designed before claiming that two same-name entries
remain distinguishable after saving.

### Search, source identity and legacy save compatibility

A Czech SRD alias **adds** an exact canonical English SRD match to the
results of the user's original query. It does not replace that query:
Czech-named homebrew, unrelated books, campaign scope and user-defined
entries remain searchable. The `appendExactSrdAlias` helper verifies
`sourceId=srd-5.1`, exact English title and
`source + documentSlug + slug` identity, and includes focused regressions.

For standard catalog browsing, API list results now include only localized
short labels. The full Czech prose is loaded when the user opens the item
detail/info dialog; workshop mechanics copy requests still receive the full
localized description because that interaction needs complete rules.

Before stored characters are migrated to keep provenance, two distinct
book entries with the same English name cannot safely be persisted as
separate rows in some character save models. The multi-picker therefore
permits **only one pending choice per canonical English name** and lets
the player switch its book source. This is an explicit compatibility
boundary, not a permanent solution for the persisted content reference.

## Optional persisted source references (in progress)

`src/lib/content/translations/stored-reference.ts` defines a compact,
strictly validated identity for catalog selections:
`{ sourceId, contentType, contentId, documentSlug? }`. The
`contentId` here is the **catalog slug**, not a translated title (and not
necessarily a rulebook Markdown page ID).

`equipmentItemSchema.contentRef?` and
`spellcastingSchema.contentRefs?` are optional so previously saved
character sheets continue to parse unchanged. Existing English display
and mechanic fields remain the authority in the 2014 rules engine.

The new character builder forwards a source reference for a newly selected
catalog equipment item, restores it when editing an existing item and
retains it through the creation payload. Switching books for an already
present English item name replaces its source reference instead of
silently combining incompatible mechanics.

**Not yet complete:** spell pickers and multiclass spell lists do not yet
populate `spellcasting.contentRefs`; editor/campaign mutation endpoints and
all PDF/help consumers still require a provenance audit. Do not guess the
source for old name-only entries; preserve them as unresolved legacy rows.
