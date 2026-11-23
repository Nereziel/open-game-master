import { describe, expect, it } from "vitest";
import { normalizeStock } from "@/lib/db/shops";
import { addStock, findStockLine, takeStock } from "./shop-logic";

describe("shop stock source identity (#107)", () => {
  const srd = {
    itemName: "Shield", qty: 1, priceCp: 1000, note: "",
    contentRef: { sourceId: "srd-5.1", contentType: "items" as const, contentId: "shield", documentSlug: "wotc-srd" },
  };
  const other = {
    ...srd,
    contentRef: { sourceId: "tome-of-heroes", contentType: "items" as const, contentId: "shield", documentSlug: "toh" },
  };

  it("preserves validated references across saved-stock normalization without combining books", () => {
    const stock = normalizeStock([srd, other]);
    expect(stock).toHaveLength(2);
    expect(stock.map((line) => line.contentRef)).toEqual([srd.contentRef, other.contentRef]);
    expect(normalizeStock(JSON.parse(JSON.stringify(stock)))).toEqual(stock);
  });

  it("does not merge legacy stock with verified stock and drops malformed references", () => {
    const legacy = { itemName: "Shield", qty: 2, priceCp: 1000, note: "" };
    const stock = normalizeStock([legacy, srd, { ...other, contentRef: { ...other.contentRef, contentType: "spells" } }]);
    expect(stock).toHaveLength(2);
    expect(stock[0].qty).toBe(3);
    expect(stock[0].contentRef).toBeUndefined();
    expect(stock[1].contentRef).toEqual(srd.contentRef);
  });

  it("refuses name-only stock lookup or deduction when books collide", () => {
    const stock = normalizeStock([srd, other]);
    expect(findStockLine(stock, "Shield")).toBeNull();
    expect(takeStock(stock, "Shield", 1)).toBeNull();
    expect(stock).toHaveLength(2);
    expect(findStockLine([srd], "Shield")).toEqual(srd);
  });

  it("preserves historical single-name stock behavior", () => {
    const legacy = { itemName: "Torch", qty: 2, priceCp: 1, note: "" };
    expect(addStock([legacy], "Torch", 1, 1)).toEqual([{ ...legacy, qty: 3 }]);
    expect(takeStock([legacy], "Torch", 1)).toEqual([{ ...legacy, qty: 1 }]);
  });
});
