import { describe, expect, it } from "vitest";
import { equipmentFrom, itemRowsOf } from "./lead-edit-logic";
import { keepChosenSpellReferences, updateChosenSpellReference } from "@/lib/content/translations/spell-selection-reference";
import { storedReferenceForCatalogRow } from "@/lib/content/translations/stored-reference";

describe("campaign editor preserves explicit catalog provenance (#107)", () => {
  const first = storedReferenceForCatalogRow("items", {
    source: "open5e", documentSlug: "wotc-srd", slug: "shield",
  })!;
  const second = storedReferenceForCatalogRow("spells", {
    source: "open5e", documentSlug: "toh", slug: "light",
  })!;

  it("retains item references and engine names through quantity edits", () => {
    const rows = itemRowsOf([{ name: "Shield", qty: 1, slug: "shield", contentRef: first }]);
    rows[0].qty = "2";
    expect(equipmentFrom(rows)).toEqual([{
      name: "Shield", qty: 2, slug: "shield", contentRef: first,
    }]);
  });

  it("retains spell refs for still selected spells but not removed names", () => {
    const before = { Light: second };
    const after = keepChosenSpellReferences(before, ["Light", "Magic Missile"]);
    expect(after).toEqual(before);
    expect(keepChosenSpellReferences(before, ["Magic Missile"])).toEqual({});
    expect(updateChosenSpellReference(before, "Light", null)).toEqual({});
  });

  it("does not infer a source for an old name-only sheet", () => {
    const rows = itemRowsOf([{ name: "Old shield", qty: 1 }]);
    expect(equipmentFrom(rows)).toEqual([{ name: "Old shield", qty: 1 }]);
    expect(keepChosenSpellReferences({}, ["Light"])).toEqual({});
  });
});
