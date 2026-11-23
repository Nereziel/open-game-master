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

**Updated spell integration:** The builder now tracks `spellContentRefs`
across drafts and loaded character sheets. Clicking an available spell or
cantrip, swapping a known spell, or choosing one from an any-list grant
captures a reference only when the named catalog row has explicit
provenance and there is no competing same-name source. Removing or
replacing the spell removes its previous reference; unpreparing alone
does not. At submit, references are filtered against the actual retained
spell and cantrip names across all active caster desks before being
written to `spellcasting.contentRefs`. English names continue driving
the existing 2014 engine. Quick-build and other automatically granted
name-only spells are intentionally not assigned a guessed source.

**Still pending:** campaign editor mutation endpoints, table spell
management and PDF/help consumers need their own provenance-aware
integration and tests. Multiclass instances of an identical English
spell from different sources still cannot be represented independently
by this optional name-keyed map; conflicting references must remain
unresolved until the long-term casting model uses per-entry identifiers.
Never backfill the source of old name-only entries based on titles.

### Campaign editor persistence

The campaign party-lead editor now receives the same optional
`contentRef` from the shared multi-picker. Adding an item keeps the
canonical English name/slug and selected source; renaming it to free
text clears the old catalog slug, source reference and homebrew
mechanical snapshot.

The spell editor records refs only from clicked catalog rows, preserves
refs for existing retained spells and prunes obsolete names before
saving. `fullPatchSheetSchema` continues accepting legacy sheet values
without any refs. The campaign PATCH endpoint previously merged
`spellcasting` recursively: it now treats an **explicit** `contentRefs`
map as a replacement, including `{}` for removing the final reference,
while missing `contentRefs` from an old client preserves the stored map.
`reference-merge.test.ts` exercises all three cases.

Remaining: other game actions and sheet update paths may still write
name-only spell lists; they must be audited separately rather than
retroactively guessing book origins.

### PDF export (read-only)

The fillable character PDF now uses the saved source references for the
equipment and spell labels. With an explicit `sourceId=srd-5.1` reference
for the correct kind, the shared Czech 5e game-name dictionary is used.
With an explicit reference to another book, the renderer **does not**
borrow the same-name SRD translation: it keeps the canonical label until
that source's own Czech pack exists. Legacy sheets without references
retain their previous localized display behavior. Numbers, mechanics,
saved names and the editable PDF form fields are unchanged.

The source-aware PDF name helper has isolated regression tests and is
included in the source registry CI. This scope covers PDF item and spell
**names**, not a claim that PDF includes translations of every rule
description from non-SRD books.

### DM inventory mutations

`addRowMath` now compares the optional persisted source reference as
part of the inventory-stack identity; equal English names and slugs
from different books must remain separate rows. A legacy unreferenced
row is also distinct from a positively referenced row. The AI/DM
`grantItemMath` path, which currently grants items by name without a
catalog provenance reference, never absorbs an existing source-verified
stack. Old name-only items still stack as before.

Regression tests in `mutation-math-source.test.ts` cover different
books, old records, DM grants and legacy behavior. This change does not
retroactively infer references for historical DM grants.

When a name-only DM remove action matches different book-scoped
references for the same displayed name, `removeItemMath` now declines
the ambiguous choice rather than silently removing the first row.
Single-source removals and historical name-only inventory continue to
work. A future structured DM tool may explicitly supply a source
reference to choose among books; this change does not guess that choice.

### Shared party stash provenance

The shared party inventory previously dropped `contentRef` when loading
its JSON state or stowing an item from an individual character. A book-
scoped item could therefore silently become a name-only row, then later
be merged with a different book's item when withdrawn.

The party's `PartyItem` now keeps an optional validated `contentRef`.
`normalizeParty` accepts only item-kind source references and leaves old
records without references valid. `addPartyItem` stacks only identical
references (or two legacy unreferenced entries); `removePartyItem`
declines same-name selection across different sources. The
`party_stash` tool passes references into and back out of the stash,
and `grantItemMath` restores them to a hero's equipment without
combining known-source and unverified items. A party round-trip
regression suite covers persistence, ambiguous names, and legacy data.

### Name-only carried-item lookup

The legacy `findCarriedItem` lookup must not choose the first record when
an English name matches different source-book identities (or an identified
row and an unreferenced legacy row). It now returns no match in that case,
rather than supplying the wrong book's item to a use or lookup operation.
The unambiguous path and legacy single-item lookup are unchanged.
`item-logic-source.test.ts` covers those distinctions.

### Shop quote lookup

The shop's sale-price helper used to inspect the first matching inventory
line via `lineNamed` even when that English item name represented
different book-specific items. It now shares the source-safe
`findCarriedItem` lookup, avoiding a false identification of the first
item's magical properties in ambiguous cases. The actual sale mutation
continues to use `removeItemMath`, which refuses source ambiguity.

### Ambiguous item commands

A source-safe lookup alone is not enough: previously `party_stash stow`
and shop `sell` reported "item not carried" when a same-name item was
present in multiple source books. Both tools now use
`ambiguousCarriedItem` to return an actionable retry message identifying
the conflicting books without changing inventory, rather than a false
missing-item error. `findCarriedItem` shares the same source comparison.
The sale-price helper also safely handles nullable lookup results.

### Explicit source selection in party stash

The `party_stash` DM tool accepts optional `itemRef` in addition to
`item` and `qty` for `stow` and `take`: `{ sourceId, contentId,
documentSlug? }` (the kind is implicitly `items`). The model can copy
this ID from the game state when two books define items of the same name.
The tool matches both the name and the complete explicit source ref;
it never guesses an item if the ref is missing or does not match.
The old name-only tool calls remain valid, and still refuse ambiguous
same-name items across sources. Targeted math and party-stash tests
cover exact source selection and invalid references.

### Source-specific sales and purchase routing

Both shop `sell_item` and the ordinary `purchase action=sell`
path accept a verified optional `itemRef`:
`{ sourceId, contentId, documentSlug? }`; its content type is
implicitly `items`. The shop rejects wrong or unmatched references,
while `tradeCall` forwards the ref when routing a sale to a shop.
For sales outside a shop, `computePurchase` first identifies the
correct carried row via `removeItemMath`, then uses **that same row**
for all price, curse and inventory calculations; it never prices the
first same-name row and removes another. A shop quote also looks up
the matching source row when the ref is supplied.

The visible `purchase` tool's per-item schema exposes optional
`itemRef` for the model to copy from game state when names collide.
All older name-only calls remain accepted and refuse conflicting
book identities without making changes. `purchase-source.test.ts`
exercises a source-specific sale and rejection of an invalid ref.

### Unverified references on name-only purchases

The ordinary `purchase action=buy` path outside a catalog shop has no
trusted selected catalog row against which to validate a supplied `itemRef`.
It now **rejects** such a purchase with a retry error before changing coin or
equipment, instead of silently discarding the submitted reference. Purchases
without `itemRef` keep their legacy behavior and do not manufacture one.
Book-specific acquisitions need a separate trusted catalog lookup before
persisting provenance; accepting model-supplied IDs alone would be unsafe.
`purchase-source.test.ts` covers this contract.

### Catalog-verified shop acquisition

Shop stock and prepared stock can now persist an optional validated
item-kind `contentRef`. The stock normalizer preserves source identity on
JSON reload, does not merge same-name items from different books (or
legacy unreferenced lines), and drops malformed refs. Selling a character
item into a shop keeps its reference; refilling prepared stock also
matches by book identity rather than title alone.

For `purchase action=buy`, `tradeCall` forwards optional `itemRef`
into `buy_item`. A named source must select exactly one matching shelf
line by English item name *and* stored source ID, catalog slug and
document slug. Even when the shelf supplies the reference, `buy_item`
verifies the catalog record in the server's read-only Open5e database
against all of these, including canonical English title (or a vetted
`srdName`), **before** changing equipment, money or stock. If the
catalog is absent or the match is invalid, the transaction is refused
rather than guessing a source. When verified, the source reference
travels to the acquired equipment and only the selected book's stock
quantity is reduced.

Legacy stock without `contentRef` still supports name-only buying,
without inventing an identity. Name-only purchases from a shelf with
two same-name books are rejected until a source is selected. The
ordinary `purchase action=buy` outside a shop still refuses a supplied
`itemRef`: it has no trusted catalog-backed stock row to verify.
`shop-source.test.ts` exercises exact selection, catalog matching,
persistence, collisions, restocking and legacy behavior.

Automatically generated shelves now inherit `contentRef` from the
**actual Open5e catalog rows** selected by `stockPool`; the source,
document and canonical slug are carried through `stockFromPool`,
persistence and restocking. A book-backed generated item can therefore
be purchased using its source identity, subject to the catalog check.
The no-content-pack fallback (bundled SRD equipment tables), homebrew
and manually created name-only shelves are deliberately left without
inferred references. `shop-source.test.ts` checks this round-trip.

Known limits: stock generation still chooses a single source when
multiple catalog books publish the same English item name; it does
not expose every edition as a separate automatically stocked option.
A legacy name-only row cannot be selected unambiguously when an
otherwise identical book-specific row is present.
