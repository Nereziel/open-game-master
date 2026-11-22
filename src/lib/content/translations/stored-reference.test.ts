import { describe, expect, it } from "vitest";
import { equipmentItemSchema, spellcastingSchema } from "@/lib/schemas/sheet";
import {
  sameStoredContentReference, storedContentReferenceSchema,
  storedReferenceForCatalogRow,
} from "./stored-reference";

describe("backwards-compatible saved content references (#107)", () => {
  it("keeps legacy equipment and spell lists valid without any new metadata", () => {
    const oldItem = { name: "Shield", qty: 1, slug: "shield" };
    expect(equipmentItemSchema.parse(oldItem)).toEqual(oldItem);
    const oldCasting = { ability: "int", slots: {}, prepared: ["Light"], known: [], cantrips: [] };
    expect(spellcastingSchema.parse(oldCasting)).toMatchObject(oldCasting);
  });

  it("round-trips the source identity of identically named entries", () => {
    const srd = storedReferenceForCatalogRow("items", {
      source: "open5e", documentSlug: "wotc-srd", slug: "shield",
    });
    const extension = storedReferenceForCatalogRow("items", {
      source: "open5e", documentSlug: "toh", slug: "shield",
    });
    expect(srd).toEqual({
      sourceId: "srd-5.1", contentType: "items", contentId: "shield", documentSlug: "wotc-srd",
    });
    expect(sameStoredContentReference(srd!, extension!)).toBe(false);
    const stored = equipmentItemSchema.parse({
      name: "Shield", slug: "shield", qty: 1, contentRef: srd,
    });
    expect(stored.contentRef).toEqual(srd);
    expect(stored.name).toBe("Shield");
    expect(stored.slug).toBe("shield");
  });

  it("allows spell provenance without replacing the spell names the engine uses", () => {
    const ref = storedReferenceForCatalogRow("spells", {
      source: "open5e", documentSlug: "wotc-srd", slug: "light",
    });
    const spellcasting = spellcastingSchema.parse({
      ability: "int", slots: {}, prepared: ["Light"], known: [], cantrips: [],
      contentRefs: { Light: ref },
    });
    expect(spellcasting?.prepared).toEqual(["Light"]);
    expect(spellcasting?.contentRefs?.Light).toEqual(ref);
  });

  it("does not guess identities for unidentified bundled rows, or accept empty IDs", () => {
    expect(storedReferenceForCatalogRow("items", {
      source: "bundled", slug: "unidentified",
    })).toBeNull();
    expect(storedReferenceForCatalogRow("spells", {
      source: "open5e", documentSlug: "wotc-srd", slug: " ",
    })).toBeNull();
    expect(() => storedContentReferenceSchema.parse({
      sourceId: "srd-5.1", contentType: "items", contentId: "",
    })).toThrow();
  });
});
