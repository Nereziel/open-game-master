# GitHub Actions – low-usage fork policy

The fork deliberately does not run expensive builds and test matrices on each
push or PR. This is a usage-control measure, not a waiver of regression checks.
GitHub can still suspend Actions; a maintainer must re-enable them when required.

## Before merging an integration or releasing a version

Run the following manually on the actual candidate branch or tag:

```sh
gh workflow run linux-smoke.yml --ref YOUR_BRANCH --field mode=full
gh workflow run windows-smoke.yml --ref YOUR_BRANCH --field mode=full
```

Wait for both workflows to pass on the candidate commit. For intermediate work,
use Linux `mode=build` (default; lint, dead code, build, bundle budget and
platform checks), `mode=tests` (build plus all unit shards), or `mode=browser`
(build plus all Chromium shards). Windows `mode=build` validates native
installation, lint and production build; `mode=full` adds the complete suite.
No tests are removed. Full Linux runs phases in order; at most two matrix jobs
run at once within each workflow. Superseded runs on the same ref are canceled.

Run dependency audit manually as needed; the weekly and lockfile-change audit
remain lightweight automatic checks. Addon catalog checks are limited to PRs
changing the catalog, with platform starts serialized. Badge statistics, Docker
publishing and moving the stable branch require an explicit manual dispatch.
For Docker, a manual dispatch publishes only the selected version or edge;
stable/beta promotion is not automatic under this fork policy. Do not publish
or promote an unvalidated release. Do not start multiple full matrices across
branches or repositories unnecessarily.

The GitHub UI exposes the mode selector under Actions → Run workflow. If Actions
are suspended at the fork level, first use Enable workflows in the repository.
