# Following upstream without losing Czech localization

This fork follows [Lebbitheplow/open-game-master](https://github.com/Lebbitheplow/open-game-master).
Upstream is a source of fixes and new features, **not** a replacement for the
fork's `main`. Do not reset or force-push `main` to upstream.

## Update process

1. Compare `Nereziel:main...Lebbitheplow:main` and record the upstream commit
   hashes, affected files and cross-cutting dependencies.
2. Open a `sync/upstream-*` branch based on the fork's current `main`.
   Prefer coherent batches; for a whole upstream release, use a three-way
   tree comparison against the shared base and resolve overlapping paths
   explicitly. Preserve the upstream commit as a merge parent.
3. Preserve and adapt the fork's localization machinery: `src/lib/i18n/cs.json`,
   `cs-tables.ts`, `src/lib/content/names-cs.ts`, `cs` locale selection,
   Czech PDF labels/fonts, and any locally translated user-facing screens.
   Apply upstream fixes to both `fr` and `cs` where they share logic.
4. Check new English UI messages against the catalogs and translate their
   Czech versions in the same PR. Never replace a localized component with
   an upstream English-only version just to make a merge easy.
5. Temporarily, GitHub Actions runs on `main` only (and explicit manual
   triggers): PRs have no automatic tests. After merging a sync branch,
   inspect the `main` Linux build, lint, browser scenarios and test shards,
   then fix failures without hiding any genuine regression.
6. Compare again after merging. Include the upstream commit as an actual
   merge parent if the whole release was integrated. For small manual ports,
   note the upstream SHA so the same change is not re-applied.

## Starting comparison (2026-11-20)

- Fork `main` baseline: `32ecce9cbd4a34708e11f1b57975e00a8fe6ac54`
- Upstream `main` baseline: `3ca600b914f70bef95d85b1cd82a52d48d285866`
  (release 0.38.2)
- The compare showed 34 upstream-only commits and 13 fork-only commits.
  Counts are historical snapshots, not permanent progress indicators.

## Upstream release 0.38.2 integration (2026-11-20)

- Baseline: `3ca600b914f70bef95d85b1cd82a52d48d285866`
- 335 upstream-changed paths compared with the common ancestor.
- 85 fork-changed paths, including Czech UI texts, Czech name tables and PDF
  fonts. The 316 upstream-only and 66 fork-only paths were retained exactly.
  Nineteen overlapping paths were resolved explicitly.
- Includes Next.js 16.4.6 with the WorldForge packed-response fix, independent
  mounts, rule fixes, API validation, dead-code cleanup, appearance assets and
  the upstream signed-in Antigravity work.
- The fork retains an explicit model-facing MCP allowlist and per-run tool
  denials for Antigravity. A successful functional test does not prove that
  every CLI-native capability was removed; its reduced-tool mode is warned
  about in the UI and operator guide.
- Czech labels, `cs.json`, PDF fontkit dependency and Czech SRD names remain.
  Added Czech text for the new reduced-rules warning.
- **Checks run after merge on main, not in pull requests.** This document
  records the integration, not a claim that every test has passed.

After this release, compare against the **latest** upstream main again before
starting the next update. Keep future changes in separate reviewed batches.
