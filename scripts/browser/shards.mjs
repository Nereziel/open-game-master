// Pure duration-based partitioning for CI. No test is removed or split.
export function planBrowserShards(scenarios, count, seconds, viewportFilter = null) {
  if (!Number.isSafeInteger(count) || count < 1) throw new Error("Invalid browser shard count");
  const shards = Array.from({ length: count }, () => ({ load: 0, entries: [] }));
  const names = new Set();
  const entries = scenarios.map((scenario, order) => {
    if (names.has(scenario.name)) throw new Error(`Duplicate browser scenario: ${scenario.name}`);
    names.add(scenario.name);
    const viewports = (scenario.viewports ?? ["desktop"]).filter((v) => !viewportFilter || viewportFilter.includes(v));
    const weight = viewports.reduce((sum, viewport) => {
      const measured = seconds[`${scenario.name}-${viewport}`];
      return sum + (Number.isFinite(measured) && measured > 0 ? measured : 15);
    }, 0);
    return { scenario, order, weight };
  });
  // Assign the heaviest scenario to the currently lightest shard. Keep all
  // viewports together and restore discovery order inside each shard.
  entries.sort((a, b) => b.weight - a.weight || a.order - b.order);
  for (const entry of entries) {
    const lightest = shards.reduce((a, b) => a.load < b.load || (a.load === b.load && a.entries.length <= b.entries.length) ? a : b);
    lightest.entries.push(entry);
    lightest.load += entry.weight;
  }
  return shards.map(({ load, entries }) => ({
    estimatedSeconds: load,
    scenarios: entries.sort((a, b) => a.order - b.order).map((entry) => entry.scenario),
  }));
}
