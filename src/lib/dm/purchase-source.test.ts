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
  it("rejects a matching book with a different document slug", () => {
    const result = computePurchase(sheet, {
      item: "Shield", qty: 1, action: "sell", price: 10,
      itemRef: { ...other.contentRef, documentSlug: "another-edition" },
    });
    expect("error" in result).toBe(true);
    expect(sheet.equipment).toEqual([srd, other]);
    expect(sheet.gold).toBe(0);
  });

  it("does not mistake a legacy name-only row for a sourced item", () => {
    const legacySheet = {
      ...sheet,
      equipment: [{ name: "Shield", qty: 1 }, other],
    } as unknown as CharacterSheet;
    const ambiguous = computePurchase(legacySheet, {
      item: "Shield", qty: 1, action: "sell", price: 10,
    });
    expect("error" in ambiguous).toBe(true);
    const selected = computePurchase(legacySheet, {
      item: "Shield", qty: 1, action: "sell", itemRef: other.contentRef, price: 10,
    });
    expect("patch" in selected).toBe(true);
    if ("patch" in selected) {
      expect(selected.patch.equipment).toEqual([{ name: "Shield", qty: 1 }]);
    }
    expect(legacySheet.equipment).toHaveLength(2);
  });

  it("refuses unverifiable book references on name-only purchases without changing coin", () => {
    const buyer = { ...sheet, equipment: [], gold: 50 } as unknown as CharacterSheet;
    const result = computePurchase(buyer, {
      item: "Shield", qty: 1, action: "buy", price: 10,
      itemRef: other.contentRef,
    });
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain("itemRef");
    expect(buyer.equipment).toEqual([]);
    expect(buyer.gold).toBe(50);
  });

  it("does not invent a source reference for a name-only purchase", () => {
    const buyer = { ...sheet, equipment: [], gold: 50 } as unknown as CharacterSheet;
    const result = computePurchase(buyer, {
      item: "Shield", qty: 1, action: "buy", price: 10,
    });
    expect("patch" in result).toBe(true);
    if (!("patch" in result)) return;
    expect(result.patch.equipment).toHaveLength(1);
    expect(result.patch.equipment?.[0]).not.toHaveProperty("contentRef");
    expect(buyer.equipment).toEqual([]);
  });

});
