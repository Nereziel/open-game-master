import { describe, expect, it } from "vitest";
import {
  selectedSpellReference, updateChosenSpellReference, keepChosenSpellReferences,
} from "./spell-selection-reference";

describe("explicit spell provenance selection (#107)", () => {
  const light = { name: "Light", level: 0, source: "open5e" as const, documentSlug: "wotc-srd", slug: "light" };
  it("derives only explicit, uniquely identified catalog rows", () => {
    expect(selectedSpellReference("Light", [light])).toEqual({
      sourceId: "srd-5.1", contentType: "spells", contentId: "light", documentSlug: "wotc-srd",
    });
    expect(selectedSpellReference("Light", [{ name: "Light", level: 0 }])).toBeNull();
    expect(selectedSpellReference("Light", [light, { ...light, documentSlug: "toh" }])).toBeNull();
    expect(selectedSpellReference("Light", [light, light])).toEqual(selectedSpellReference("Light", [light]));
  });

  it("refuses to keep the wrong source for a same-name spell", () => {
    const ref = selectedSpellReference("Light", [light])!;
    const other = selectedSpellReference("Light", [{ ...light, documentSlug: "toh" }])!;
    expect(updateChosenSpellReference({ Light: ref }, "Light", other)).toEqual({});
    expect(updateChosenSpellReference({ Light: ref }, "Light", null)).toEqual({});
    expect(updateChosenSpellReference({}, "Light", ref)).toEqual({ Light: ref });
  });

  it("keeps only spells remaining in any active multiclass list", () => {
    const light = selectedSpellReference("Light", [
      { name: "Light", level: 0, source: "open5e", documentSlug: "wotc-srd", slug: "light" },
    ])!;
    const shield = selectedSpellReference("Shield", [
      { name: "Shield", level: 1, source: "open5e", documentSlug: "wotc-srd", slug: "shield" },
    ])!;
    expect(keepChosenSpellReferences({ Light: light, Shield: shield }, ["Shield", "light"])).toEqual({
      Light: light, Shield: shield,
    });
    expect(keepChosenSpellReferences({ Light: light, Shield: shield }, ["Shield"])).toEqual({
      Shield: shield,
    });
  });

  it("normalizes duplicate saved spell names before replacing their source", () => {
    const srd = selectedSpellReference("Light", [
      { name: "Light", level: 0, source: "open5e", documentSlug: "wotc-srd", slug: "light" },
    ])!;
    const other = selectedSpellReference("Light", [
      { name: "Light", level: 0, source: "open5e", documentSlug: "toh", slug: "light" },
    ])!;
    expect(updateChosenSpellReference({ Light: srd }, "light", other)).toEqual({});
    expect(updateChosenSpellReference({ Light: srd }, "LIGHT", srd)).toEqual({ LIGHT: srd });
    expect(updateChosenSpellReference({ Light: srd }, "light", null)).toEqual({});
  });

  it("preserves old name-only lists and drops provenance for removed spells", () => {
    const ref = selectedSpellReference("Light", [light])!;
    expect(keepChosenSpellReferences({ Light: ref }, ["Shield"])).toEqual({});
    expect(keepChosenSpellReferences({}, ["Light"])).toEqual({});
  });
});
