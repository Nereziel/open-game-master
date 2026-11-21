// Structural coverage regression for all translated SRD 5.1 monster and magic item pages.
// Called from test-rulebook.mjs after its TypeScript module loader is registered.
import assert from "node:assert/strict";
import {
  CZECH_FULL_MONSTER_BATCHES,
  CZECH_FULL_ITEM_BATCHES,
  CZECH_FULL_MONSTERS,
  CZECH_FULL_ITEMS,
} from "../src/lib/rulebook/czech-full-bestiary.ts";

export function assertCzechFullBestiary(rulebookPages) {
  const english = rulebookPages("en");
  const czech = new Map(rulebookPages("cs").map((page) => [page.id, page]));

  for (const [kind, batches, combined, expectedBatchSizes] of [
    ["monster", CZECH_FULL_MONSTER_BATCHES, CZECH_FULL_MONSTERS, [80, 80, 80, 78]],
    ["item", CZECH_FULL_ITEM_BATCHES, CZECH_FULL_ITEMS, [80, 80, 79]],
  ]) {
    const originalPages = english.filter((page) => page.kind === kind);
    const expectedIds = originalPages.map((page) => page.id).sort();
    assert.equal(expectedIds.length, kind === "monster" ? 318 : 239, `Unexpected English ${kind} catalog size`);
    assert.equal(batches.length, expectedBatchSizes.length, `Wrong number of ${kind} batches`);

    // Check each batch separately: an Object.assign merge alone can conceal duplicate IDs.
    let offset = 0;
    const seen = new Set();
    for (const [index, batch] of batches.entries()) {
      const ids = Object.keys(batch).sort();
      assert.equal(ids.length, expectedBatchSizes[index], `${kind} batch ${index + 1} count`);
      assert.deepEqual(ids, expectedIds.slice(offset, offset + ids.length), `${kind} batch ${index + 1} ID range`);
      for (const id of ids) {
        assert.ok(!seen.has(id), `Duplicate Czech ${kind} translation: ${id}`);
        seen.add(id);
        const text = batch[id];
        assert.equal(typeof text, "string", `Missing Czech body: ${id}`);
        assert.ok(text.trim().length > 20, `Truncated Czech body: ${id}`);
        assert.doesNotMatch(text, /\b(?:TODO|FIXME|TBD)\b/i, `Placeholder in Czech body: ${id}`);
      }
      offset += ids.length;
    }
    assert.deepEqual(Object.keys(combined).sort(), expectedIds, `${kind} combined ID coverage`);

    for (const source of originalPages) {
      const localized = czech.get(source.id);
      const translated = combined[source.id];
      assert.ok(localized, `Missing localized page: ${source.id}`);
      assert.equal(localized.kind, source.kind, `Changed kind: ${source.id}`);
      assert.equal(localized.chapter, source.chapter, `Changed chapter: ${source.id}`);
      assert.match(localized.md, /## Úplné znění pravidel v češtině/, `Missing full Czech section: ${source.id}`);
      assert.ok(localized.md.includes(translated), `Czech full text not connected: ${source.id}`);
      assert.ok(localized.md.endsWith(source.md), `Changed original English Markdown: ${source.id}`);
      assert.ok(localized.md.length > source.md.length, `Empty localized page: ${source.id}`);
    }
  }
}
