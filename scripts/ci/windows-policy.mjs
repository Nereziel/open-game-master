// Conservative Windows PR policy: only known low-risk paths may use smoke.
// All unknown paths, dependency changes and platform/server changes run the full suite.
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const smokeFiles = [
  "scripts/test-addons-core.mjs",
  "scripts/test-addons-parts.mjs",
  "scripts/test-addons-runtime.mjs",
  "scripts/test-backend-fetch.mjs",
  "scripts/test-backup-in-app.mjs",
  "scripts/test-backup-restore.mjs",
  "scripts/test-build-info.mjs",
  "scripts/test-build-trace.mjs",
  "scripts/test-bundle-media.mjs",
  "scripts/test-db-statement-cache.mjs",
  "scripts/test-device-world-host.mjs",
  "scripts/test-embedding-language.mjs",
  "scripts/test-embedding-reindex.mjs",
  "scripts/test-embeddings.mjs",
  "scripts/test-enforce-import.mjs",
  "scripts/test-enforce-permissions.mjs",
  "scripts/test-enforce-sweep-dice-windows.mjs",
  "scripts/test-enforce-sweep-lifecycle-restart.mjs",
  "scripts/test-harness-antigravity.mjs",
  "scripts/test-harness-claude-probe.mjs",
  "scripts/test-harness-completion-slots.mjs",
  "scripts/test-harness-discover.mjs",
  "scripts/test-harness-grok-probe.mjs",
  "scripts/test-harness-late-start.mjs",
  "scripts/test-harness-logic.mjs",
  "scripts/test-harness-opencode-probe.mjs",
  "scripts/test-harness-opencode-run.mjs",
  "scripts/test-harness-pi.mjs",
  "scripts/test-harness-pictures.mjs",
  "scripts/test-harness-run-dir.mjs",
  "scripts/test-harness-turn.mjs",
  "scripts/test-import-older-files.mjs",
  "scripts/test-import-preflight.mjs",
  "scripts/test-media-access.mjs",
  "scripts/test-media-failure.mjs",
  "scripts/test-network-interfaces.mjs",
  "scripts/test-pdf-import.mjs",
  "scripts/test-real-dice-restart.mjs",
  "scripts/test-restore-swap.mjs",
  "scripts/test-return-paths.mjs",
  "scripts/test-serve-file.mjs",
  "scripts/test-server-address.mjs",
  "scripts/test-server-env-file.mjs",
  "scripts/test-server-log.mjs",
  "scripts/test-setup-code.mjs",
  "scripts/test-setup-comfy.mjs",
  "scripts/test-setup-wizard.mjs",
  "scripts/test-shared-host.mjs",
  "scripts/test-shell-report.mjs",
  "scripts/test-shell-share.mjs",
  "scripts/test-sqlite-fallback.mjs",
  "scripts/test-test-temp-root.mjs",
  "scripts/test-tts-backend.mjs",
  "scripts/test-workshop-import-feedback.mjs",
  "scripts/test-workshop-import.mjs",
  "scripts/test-world-archive.mjs",
  "scripts/test-world-file-losses.mjs",
  "scripts/test-world-install.mjs",
  "scripts/test-world-reimport-kept.mjs",
  "scripts/test-world-reimport.mjs",
  "scripts/test-windows-ci-policy.mjs"
];

export function lowRiskPath(file) {
  if (typeof file !== "string" || !file || file.includes("\\") || file.split("/").includes("..")) return false;
  if (/^(?:README|CHANGELOG|CONTRIBUTING)(?:\.[^/]+)?\.md$/i.test(file)) return true;
  if (/^docs\/.*\.md$/i.test(file)) return true;
  if (/^src\/lib\/(?:i18n|content|rulebook|classes|backgrounds|bestiary|reference)\/.*\.json$/.test(file)) return true;
  // Presentation only: API handlers, server/config files and shared TS
  // helpers are deliberately not blanket-exempted.
  if (/^src\/(?:components|app)\/.*\.tsx$/.test(file) &&
      !/(?:^|\/)(?:api|server|native|setup|admin)(?:\/|\.)/i.test(file) &&
      !/(?:file|import|export|backup|restore|install|shell|device|host|platform|download|upload|update|storage|harness)/i.test(file)) return true;
  return false;
}

export function fullWindows(event, paths) {
  return event !== "pull_request" || !Array.isArray(paths) || !paths.length || paths.some((p) => !lowRiskPath(p));
}

function plan() {
  const event = process.env.GITHUB_EVENT_NAME;
  const base = process.env.PR_BASE_SHA;
  let paths = null;
  if (event === "pull_request" && /^[a-f0-9]{40}$/i.test(base ?? "")) {
    // HEAD is the merge checkout: classify the actual tree CI will exercise.
    // --no-renames makes a move out of a risky path count as a deletion too.
    const diff = spawnSync("git", ["diff", "--name-only", "--no-renames", "-z", base, "HEAD", "--"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
    if (diff.status === 0 && !diff.error) paths = diff.stdout.split("\0").filter(Boolean);
    else console.warn("Unable to classify changed paths; running full Windows suite.");
  }
  const full = fullWindows(event, paths);
  const matrix = full ? { include: [1, 2, 3, 4, 5].map((shard) => ({ mode: "full", shard })) } : { include: [{ mode: "smoke", shard: 1 }] };
  console.log(`Windows policy: ${full ? "full" : "targeted"}; changed paths: ${paths?.length ?? "unknown"}`);
  if (full && paths) console.log("Full-suite paths:", paths.filter((p) => !lowRiskPath(p)).map((p) => JSON.stringify(p)).join(", "));
  if (!process.env.GITHUB_OUTPUT) throw new Error("GITHUB_OUTPUT is required");
  appendFileSync(process.env.GITHUB_OUTPUT, `matrix=${JSON.stringify(matrix)}\n`);
}

function smoke() {
  for (const file of smokeFiles) if (!existsSync(file)) throw new Error(`Windows smoke file missing: ${file}`);
  console.log(`Windows targeted suite: ${smokeFiles.length} files`);
  const result = spawnSync(process.execPath, ["node_modules/vitest/vitest.mjs", "run", ...smokeFiles], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === "plan") plan();
  else if (process.argv[2] === "smoke") smoke();
  else throw new Error("Expected plan or smoke");
}
