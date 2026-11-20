// A local, opt-in trace is useful only when its records are readable, private
// and never created for the default server configuration.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  dmTraceEnabled,
  recordDmTrace,
  safeDmTraceValue,
  withDmTrace,
} from "../src/lib/dm/trace.ts";

const oldCwd = process.cwd();
const oldFlag = process.env.DM_TRACE;
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "odm-dm-trace-"));

try {
  process.chdir(temp);
  delete process.env.DM_TRACE;
  assert.equal(dmTraceEnabled(), false);
  recordDmTrace("model_request", { messages: ["do not store by default"] });
  assert.equal(fs.existsSync(path.join(temp, "data", "dm-traces")), false);

  process.env.DM_TRACE = "1";
  assert.equal(dmTraceEnabled(), true);
  await withDmTrace({ campaignId: "campaign-example", flow: "saga_generation" }, async () => {
    recordDmTrace("model_request", {
      traceId: "test-model-call",
      messages: [{ role: "user", content: "Najdi ztracený zvon v Marrowově Brodě." }],
      apiKey: "sk-top-secret-example-12345678",
      provider_items: [{ private: "never-log" }],
      tool_calls: [{ function: { name: "show_title", arguments: "{\"title\":\"Zvon\"}" } }],
    });
    recordDmTrace("model_response", {
      traceId: "test-model-call",
      message: { content: "{\"title\":\"Marrowův Brod\",\"premise\":\"Ztracený zvon\"}" },
      authorization: "Bearer top-secret-do-not-log",
    });
    recordDmTrace("json_validation", { stage: "saga_plan", accepted: false, reason: "invalid-shape" });
  });
  const dir = path.join(temp, "data", "dm-traces");
  const files = fs.readdirSync(dir);
  assert.equal(files.length, 1);
  assert.ok(files[0].endsWith(".jsonl"));
  const raw = fs.readFileSync(path.join(dir, files[0]), "utf8");
  assert.equal(raw.includes("top-secret"), false);
  assert.equal(raw.includes("never-log"), false);
  assert.ok(raw.includes("Marrowův Brod"), "UTF-8 Czech survives JSONL");
  const events = raw.trim().split("\n").map((line) => JSON.parse(line));
  assert.deepEqual(events.map((event) => event.event), ["model_request", "model_response", "json_validation"]);
  assert.ok(events[0].flowId && events.every((event) => event.flowId === events[0].flowId));
  assert.ok(events.every((event) => event.campaignId === "campaign-example"));
  assert.equal(events[0].apiKey, "[REDACTED]");
  assert.equal(events[0].provider_items, "[REDACTED]");
  assert.equal(events[1].authorization, "[REDACTED]");
  assert.equal(events[2].accepted, false);
  assert.deepEqual(safeDmTraceValue({ image_url: { url: "https://host/?secret=abcdef" } }), {
    image_url: "[image URL/bytes omitted]",
  });
  console.log("ok: opt-in DM trace, correlation, UTF-8, redaction and JSONL output");
} finally {
  process.chdir(oldCwd);
  if (oldFlag === undefined) delete process.env.DM_TRACE;
  else process.env.DM_TRACE = oldFlag;
  fs.rmSync(temp, { recursive: true, force: true });
}
