import { describe, expect, it } from "vitest";
import { computePurchase } from "./purchase-math";
import type { CharacterSheet } from "@/lib/schemas/sheet";

describe("source-scoped selling outside shops (#107)", () => {
  const srd = {
    name: "Shield", qty: 1, slug: "shield",
    contentRef: { sourceId: "srd-5.1", contentType: "items" as const, contentId: "shield", documentSlug: "wotc-srd" },
  };
  const other = {
    ...srd,
    contentRef: { ...srd.contentRef, sourceId: "other-book", documentSlug: "toh" },
  };
  // The rules and price resolver need only these fields in this fixture.
  const sheet = {
    id: "hero", campaignId: "campaign", name: "Hero",
    gold: 0, copper: 0, equipment: [srd, other],
  } as unknown as CharacterSheet;

  it("refuses a name-only sale when two books carry the same item", () => {
    const result = computePurchase(sheet, { item: "Shield", qty: 1, action: "sell" });
    expect("error" in result).toBe(true);
    expect(sheet.equipment).toHaveLength(2);
  });

  it("sells only the exact book-specific row and prices that same row", () => {
    const result = computePurchase(sheet, {
      item: "Shield", qty: 1, action: "sell", itemRef: other.contentRef,
      // The isolated fixture does not install the optional pack price list.
      price: 10,
    });
    expect("patch" in result).toBe(true);
    if (!("patch" in result)) return;
    expect(result.patch.equipment).toEqual([srd]);
    expect(result.result).toMatchObject({ ok: true, sold: "Shield", qty: 1 });
  });

  it("refuses incorrect source IDs without a fallback to another book", () => {
    const result = computePurchase(sheet, {
      item: "Shield", qty: 1, action: "sell",
      itemRef: { ...other.contentRef, contentId: "not-shield" },
    });
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain("itemRef");
  });
});
