import { describe, expect, it } from "vitest";
import { addRowMath, grantItemMath, sameItemRow } from "./mutation-math";

describe("DM inventory source identity (#107)", () => {
  const srd = {
    name: "Shield", qty: 1, slug: "shield",
    contentRef: { sourceId: "srd-5.1", contentType: "items", contentId: "shield", documentSlug: "wotc-srd" },
  };
  const tome = {
    ...srd,
    contentRef: { ...srd.contentRef, sourceId: "tome-of-heroes", documentSlug: "toh" },
  };

  it("does not stack same-name, same-slug rows from different source books", () => {
    expect(sameItemRow(srd, tome)).toBe(false);
    expect(addRowMath([srd], tome)).toEqual([srd, tome]);
    expect(addRowMath([srd], { ...srd })).toEqual([{ ...srd, qty: 2 }]);
  });

  it("does not silently attach an unreferenced legacy row to a verified source", () => {
    const legacy = { name: "Shield", qty: 2, slug: "shield" };
    expect(sameItemRow(legacy, srd)).toBe(false);
    expect(addRowMath([legacy], srd)).toEqual([legacy, srd]);
  });

  it("does not merge an AI-granted name-only item into a source-verified stack", () => {
    const result = grantItemMath([srd], "Shield", 1);
    expect(result.equipment).toHaveLength(2);
    expect(result.equipment[0]).toEqual(srd);
    expect(result.equipment[1]).toMatchObject({ name: "Shield", qty: 1 });
    expect(result.equipment[1].contentRef).toBeUndefined();
  });

  it("preserves the historical name-only stacking behavior", () => {
    const legacy = { name: "Shield", qty: 1 };
    expect(addRowMath([legacy], legacy)).toEqual([{ name: "Shield", qty: 2 }]);
    expect(grantItemMath([legacy], "Shield", 1).equipment).toEqual([{ name: "Shield", qty: 2 }]);
  });
});
