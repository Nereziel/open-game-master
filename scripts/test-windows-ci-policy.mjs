import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fullWindows, lowRiskPath, smokeFiles } from "./ci/windows-policy.mjs";

for (const p of ["docs/example.md", "src/lib/i18n/cs.json", "src/lib/content/authored-feat-descriptions-cs.json", "src/app/characters/builder/ContentPicker.tsx"]) {
  assert.equal(lowRiskPath(p), true, p);
  assert.equal(fullWindows("pull_request", [p]), false, p);
}
for (const p of ["package-lock.json", ".github/workflows/windows-smoke.yml", "scripts/test-harness-discover.mjs", "src/lib/db/core.ts", "src/lib/harness/example.ts", "src/app/api/example/route.ts", "src/lib/srd/sheet-legality.ts", "src/components/UploadFile.tsx", "unknown", "docs/../package.json"]) {
  assert.equal(fullWindows("pull_request", ["src/lib/i18n/cs.json", p]), true, p);
}
for (const event of ["push", "schedule", "workflow_dispatch", "release"]) assert.equal(fullWindows(event, ["docs/example.md"]), true);
assert.equal(fullWindows("pull_request", null), true);
assert.equal(fullWindows("pull_request", []), true);
assert.equal(new Set(smokeFiles).size, smokeFiles.length);
assert.ok(smokeFiles.length >= 50);
for (const file of smokeFiles) assert.ok(existsSync(file), file);
for (const file of ["scripts/test-sqlite-fallback.mjs", "scripts/test-backup-restore.mjs", "scripts/test-test-temp-root.mjs", "scripts/test-harness-discover.mjs"]) assert.ok(smokeFiles.includes(file), file);
console.log("ok: conservative Windows policy, existing platform smoke files and full-suite fallback");
