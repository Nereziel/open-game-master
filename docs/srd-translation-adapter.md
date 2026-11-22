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
original row or game mechanics. It is **not yet wired into the application**.
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
`data_json` or rules-engine field. The downstream editor, picker,
character sheet and PDF still need explicit consumer-side integration
in phase 4; the new bridge by itself does not replace their labels.
