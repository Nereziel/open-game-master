import assert from "node:assert/strict";
import { planBrowserShards } from "./browser/shards.mjs";

const scenarios = [
  { name: "short", viewports: ["phone", "desktop"] },
  { name: "long", viewports: ["desktop", "phone"] },
  { name: "new" },
  { name: "middle", viewports: ["desktop"] },
  { name: "other", viewports: ["phone"] },
];
const seconds = { "short-phone": 2, "short-desktop": 3, "long-desktop": 40, "long-phone": 20, "middle-desktop": 20, "other-phone": 10 };
for (const count of [1, 2, 3, 5, 8]) {
  const plan = planBrowserShards(scenarios, count, seconds);
  assert.equal(plan.length, count);
  assert.deepEqual(plan.flatMap((s) => s.scenarios.map((v) => v.name)).sort(), scenarios.map((v) => v.name).sort());
  assert.deepEqual(plan, planBrowserShards(scenarios, count, seconds));
  assert.equal(plan.reduce((sum, s) => sum + s.estimatedSeconds, 0), 110);
  for (const shard of plan) {
    const order = shard.scenarios.map((s) => scenarios.indexOf(s));
    assert.deepEqual(order, [...order].sort((a, b) => a - b));
  }
}
const two = planBrowserShards(scenarios, 2, seconds);
assert.equal(Math.max(...two.map((s) => s.estimatedSeconds)), 60);
assert.equal(planBrowserShards(scenarios, 1, seconds, ["phone"])[0].estimatedSeconds, 32);
assert.equal(planBrowserShards([{ name: "new" }], 1, { "new-desktop": -1 })[0].estimatedSeconds, 15);
assert.throws(() => planBrowserShards(scenarios, 0, seconds), /Invalid/);
assert.throws(() => planBrowserShards([scenarios[0], scenarios[0]], 2, seconds), /Duplicate/);
console.log("ok: weighted browser shards preserve all scenarios, viewports and discovery order");
