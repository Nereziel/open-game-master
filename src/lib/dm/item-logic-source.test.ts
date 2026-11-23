import { describe, expect, it } from "vitest";
import { ambiguousCarriedItem, findCarriedItem } from "./item-logic";

describe("source-safe carried item lookup (#107)", () => {
  const srd = {
    name: "Shield", qty: 1, slug: "shield",
    contentRef: { sourceId: "srd-5.1", contentType: "items" as const, contentId: "shield", documentSlug: "wotc-srd" },
  };
  const other = {
    ...srd,
    contentRef: { ...srd.contentRef, sourceId: "other-book", documentSlug: "toh" },
  };

  it("refuses a same-name item from different books rather than choosing the first", () => {
    expect(findCarriedItem([srd, other], "Shield")).toBeNull();
    expect(findCarriedItem([{ name: "Shield", qty: 1 }, srd], "Shield")).toBeNull();
  });

  it("reports the two distinct books rather than claiming the item is absent", () => {
    const message = ambiguousCarriedItem([srd, other], "Shield");
    expect(message).toMatchObject({ retry: true });
    expect(message?.error).toContain("wotc-srd");
    expect(message?.error).toContain("toh");
    expect(ambiguousCarriedItem([srd], "Shield")).toBeNull();
    expect(ambiguousCarriedItem([{ name: "Rope", qty: 1 }], "Rope")).toBeNull();
  });

  it("preserves exact lookups for a single book and old name-only inventory", () => {
    expect(findCarriedItem([srd], "Shield")).toEqual(srd);
    const old = { name: "Rope", qty: 1 };
    expect(findCarriedItem([old], "Rope")).toEqual(old);
  });
});
