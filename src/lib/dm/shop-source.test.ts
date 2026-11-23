import { describe, expect, it } from "vitest";
import { normalizeStock } from "@/lib/db/shops";
import { addStock, findStockLine, refillStock, stockFromPool, stockItemPromptName, stockReferenceMatchesCatalog, takeStock } from "./shop-logic";

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

  it("selects only an exact source ID and never consumes the other book", () => {
    const stock = normalizeStock([srd, other]);
    expect(findStockLine(stock, "Shield", other.contentRef)?.contentRef).toEqual(other.contentRef);
    expect(takeStock(stock, "Shield", 1, other.contentRef)).toEqual([srd]);
    expect(findStockLine(stock, "Shield", { ...other.contentRef, contentId: "wrong" })).toBeNull();
    expect(findStockLine(stock, "Shield", { ...other.contentRef, documentSlug: "wrong-document" })).toBeNull();
    expect(takeStock(stock, "Shield", 1, { ...other.contentRef, sourceId: "wrong" })).toBeNull();
  });

  it("requires a real catalog source, canonical slug, document and English name", () => {
    const row = { source: "open5e" as const, slug: "shield", name: "Shield", documentSlug: "wotc-srd" };
    expect(stockReferenceMatchesCatalog(srd, row)).toBe(true);
    expect(stockReferenceMatchesCatalog(other, row)).toBe(false);
    expect(stockReferenceMatchesCatalog(srd, { ...row, name: "Unrelated Item" })).toBe(false);
    expect(stockReferenceMatchesCatalog(srd, { ...row, slug: "different-item" })).toBe(false);
    expect(stockReferenceMatchesCatalog(srd, { ...row, documentSlug: "toh" })).toBe(false);
    expect(stockReferenceMatchesCatalog({ ...srd, contentRef: undefined }, row)).toBe(false);
    expect(stockReferenceMatchesCatalog({ ...srd, srdName: "Shield", itemName: "Štít" }, row)).toBe(true);
  });

  it("refuses name-only stock lookup or deduction when books collide", () => {
    const stock = normalizeStock([srd, other]);
    expect(findStockLine(stock, "Shield")).toBeNull();
    expect(takeStock(stock, "Shield", 1)).toBeNull();
    expect(stock).toHaveLength(2);
    expect(findStockLine([srd], "Shield")).toEqual(srd);
  });

  it("keeps source-specific sales separate when adding stock", () => {
    const combined = addStock([srd], "Shield", 2, 1000, undefined, other.contentRef);
    expect(combined).toHaveLength(2);
    expect(combined[1].contentRef).toEqual(other.contentRef);
    expect(addStock([srd], "Shield", 1, 1000, undefined, srd.contentRef)).toEqual([{ ...srd, qty: 2 }]);
  });

  it("refills matching books separately without losing a different source", () => {
    const refilled = refillStock([{ ...srd, qty: 3 }, other], [{ ...srd, qty: 2 }]);
    expect(refilled).toEqual([{ ...srd, qty: 3 }, other]);
  });

  it("carries actual source references from generated catalog pool into saved stock", () => {
    const generated = stockFromPool([
      { name: "Shield", cost: "1000 cp", staple: true, contentRef: srd.contentRef },
      { name: "Rope", cost: "100 cp", staple: true },
    ], "village", () => 0.5);
    expect(generated.find((line) => line.itemName === "Shield")?.contentRef).toEqual(srd.contentRef);
    expect(generated.find((line) => line.itemName === "Rope")?.contentRef).toBeUndefined();
    expect(normalizeStock(JSON.parse(JSON.stringify(generated)))).toEqual(generated);
  });

  it("exposes exact book identifiers only when a shelf has same-name variants", () => {
    expect(stockItemPromptName([srd], srd)).toBe("Shield");
    const collision = stockItemPromptName([srd, other], other);
    expect(collision).toContain("itemRef sourceId=tome-of-heroes contentId=shield documentSlug=toh");
    expect(stockItemPromptName([srd, { itemName: "Shield", qty: 1, priceCp: 100, note: "" }], srd)).toContain("sourceId=srd-5.1");
    const legacy = { itemName: "Shield", qty: 1, priceCp: 100, note: "" };
    expect(stockItemPromptName([legacy, srd], legacy)).toContain("legacy stock without source ID");
  });

  it("preserves historical single-name stock behavior", () => {
    const legacy = { itemName: "Torch", qty: 2, priceCp: 1, note: "" };
    expect(addStock([legacy], "Torch", 1, 1)).toEqual([{ ...legacy, qty: 3 }]);
    expect(takeStock([legacy], "Torch", 1)).toEqual([{ ...legacy, qty: 1 }]);
  });
});
