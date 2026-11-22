import { describe, expect, it } from "vitest";
import { uniqueBySource } from "./pickerRows";

describe("source-specific picker identity (#107)", () => {
  it("preserves same-name rows from different books, and deduplicates only identical source IDs", () => {
    const rows = [
      { name: "Shield", source: "open5e", documentSlug: "wotc-srd", slug: "shield" },
      { name: "Shield", source: "open5e", documentSlug: "toh", slug: "shield" },
      { name: "Shield", source: "homebrew", documentSlug: "homebrew", slug: "homebrew:123" },
      { name: "Shield", source: "open5e", documentSlug: "wotc-srd", slug: "shield" },
    ];
    expect(uniqueBySource(rows)).toEqual(rows.slice(0, 3));
  });

  it("does not merge two unrelated IDs from the same book", () => {
    const rows = [
      { source: "open5e", documentSlug: "wotc-srd", name: "Protection", slug: "a" },
      { source: "open5e", documentSlug: "wotc-srd", name: "Protection", slug: "b" },
    ];
    expect(uniqueBySource(rows)).toEqual(rows);
  });
});
