# Following upstream without losing Czech localization

This fork follows [Lebbitheplow/open-game-master](https://github.com/Lebbitheplow/open-game-master).
Upstream is a source of fixes and new features, **not** a replacement for the
fork's `main`. Do not reset or force-push `main` to upstream.

## Update process

1. Compare `Nereziel:main...Lebbitheplow:main` and record the upstream commit
   hashes, affected files and cross-cutting dependencies.
2. Open a small `sync/upstream-*` branch based on the fork's current `main`.
   Port one cohesive change or tightly coupled set of changes at a time.
   Upstream commits can depend on one another: review the whole feature before
   selecting a patch.
3. Preserve and adapt the fork's localization machinery: `src/lib/i18n/cs.json`,
   `cs-tables.ts`, `src/lib/content/names-cs.ts`, `cs` locale selection,
   Czech PDF labels/fonts, and any locally translated user-facing screens.
   Apply upstream fixes to both `fr` and `cs` where they share logic.
4. Check new English UI messages against the catalogs and translate their
   Czech versions in the same PR. Never replace a localized component with
   an upstream English-only version just to make a merge easy.
5. Run lint, build, relevant tests and Czech catalog coverage in CI.
   Resolve discrepancies and review UI text before merging each PR.
6. Compare again after merging. A ported patch does not automatically change
   Git ancestry; upstream commits may still appear as pending until their
   history is merged. Record what has been ported to avoid duplicate work.

## Starting comparison (2026-11-20)

- Fork `main` baseline: `32ecce9cbd4a34708e11f1b57975e00a8fe6ac54`
- Upstream `main` baseline: `3ca600b914f70bef95d85b1cd82a52d48d285866`
  (release 0.38.2)
- The compare showed 34 upstream-only commits and 13 fork-only commits.
  Counts are historical snapshots, not permanent progress indicators.

## Batches

| Batch | Upstream reference | Scope | Status |
| --- | --- | --- | --- |
| 1 | `094a037` | Stable React catalog loading promise; adapt upstream fix for Czech and French | In PR |
| 2 | `8cb47ad`, `94e1540` | Next.js security patch and coupled large-world response fix | Not started |
| 3 | `20c14a1` plus follow-ups | Reconcile signed-in Antigravity features with this fork's MCP allowlist and restrictions | Not started |
| 4 | `42e3a44`, `2ea54c8`, `b43eac2` | Independent mounts, movement and targeting | Not started |
| 5 | `9e6039e` plus related commits | Request body validation, accessibility, unused code and game rule fixes | Not started |
| 6 | `2cb6f1a` plus follow-ups | Theme art and browser checks | Not started |

These references are integration starting points, not a promise that their
changes can be copied without conflict. Recheck upstream before each batch.

For a large upstream release, prefer several reviewed PRs over one wholesale
merge. Preserve both the new upstream behavior and the fork-specific features.
