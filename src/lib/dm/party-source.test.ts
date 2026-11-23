import { describe, expect, it } from "vitest";
import { addPartyItem, normalizeParty, removePartyItem } from "./party-logic";
import { grantItemMath } from "./mutation-math";

describe("party stash provenance round-trip (#107)", () => {
  const srd = {
    name: "Shield", qty: 2,
    contentRef: { sourceId: "srd-5.1", contentType: "items" as const, contentId: "shield", documentSlug: "wotc-srd" },
  };
  const other = {
    name: "Shield", qty: 1,
    contentRef: { sourceId: "tome-of-heroes", contentType: "items" as const, contentId: "shield", documentSlug: "toh" },
  };

  it("keeps same-name entries from distinct books separate", () => {
    const added = addPartyItem([srd], other);
    expect("inventory" in added && added.inventory).toEqual([srd, other]);
    expect("inventory" in addPartyItem([srd], { ...srd, qty: 1 })
      && (addPartyItem([srd], { ...srd, qty: 1 }) as { inventory: typeof srd[] }).inventory[0].qty).toBe(3);
  });

  it("restores an explicitly validated source identity after JSON reload", () => {
    const restored = normalizeParty({ inventory: [srd, other] });
    expect(restored.inventory.map((row) => row.contentRef)).toEqual([srd.contentRef, other.contentRef]);
    const bad = normalizeParty({ inventory: [{ name: "Mystery", qty: 1,
      contentRef: { sourceId: "srd-5.1", contentType: "spells", contentId: "shield" },
    }] });
    expect(bad.inventory[0].contentRef).toBeUndefined();
  });

  it("refuses an ambiguous take by a plain name", () => {
    const result = removePartyItem([srd, other], "Shield", true, 1);
    expect("error" in result).toBe(true);
    const exact = removePartyItem([srd], "Shield", true, 1);
    expect("item" in exact && exact.item.contentRef).toEqual(srd.contentRef);
  });

  it("takes exactly the requested book when provided an explicit itemRef", () => {
    const selected = removePartyItem([srd, other], "Shield", true, 1, srd.contentRef);
    expect("item" in selected).toBe(true);
    if (!("item" in selected)) return;
    expect(selected.item.contentRef).toEqual(srd.contentRef);
    expect(selected.inventory).toEqual([{ ...srd, qty: 1 }, other]);
    const unknown = removePartyItem([srd, other], "Shield", true, 1, {
      ...srd.contentRef, contentId: "not-this-shield",
    });
    expect("error" in unknown).toBe(true);
  });

  it("preserves source identity when an item leaves the shared pack", () => {
    const taken = removePartyItem([srd], "Shield", true, 1);
    expect("item" in taken).toBe(true);
    if (!("item" in taken)) return;
    const received = grantItemMath([], taken.item.name, taken.removed, {
      identified: true,
      contentRef: taken.item.contentRef,
    });
    expect(received.equipment[0].contentRef).toEqual(srd.contentRef);
    expect(grantItemMath(received.equipment, "Shield", 1).equipment).toHaveLength(2);
  });

  it("preserves old name-only party stacks", () => {
    const old = { name: "Rope", qty: 1 };
    const result = addPartyItem([old], old);
    expect("inventory" in result && result.inventory).toEqual([{ name: "Rope", qty: 2 }]);
  });
});
