import { describe, expect, it } from "vitest";
import { layOver } from "@/lib/schemas/parse-keeping-valid";
import { castingOverlayBase } from "./reference-merge";

describe("campaign spell source-ref replacement (#107)", () => {
  const old = {
    ability: "int", prepared: ["Light"], known: [],
    contentRefs: { Light: { sourceId: "srd-5.1", contentType: "spells", contentId: "light" } },
  };

  it("preserves references when a legacy client omits the new field", () => {
    const edit = { prepared: ["Light", "Shield"] };
    const result = layOver(castingOverlayBase(old, edit), edit) as typeof old;
    expect(result.contentRefs).toEqual(old.contentRefs);
    expect(result.prepared).toEqual(["Light", "Shield"]);
  });

  it("removes stale references when a modern client explicitly sends an empty map", () => {
    const edit = { prepared: [], contentRefs: {} };
    const result = layOver(castingOverlayBase(old, edit), edit) as typeof old;
    expect(result.contentRefs).toEqual({});
    expect(result.ability).toBe("int");
  });

  it("replaces existing map instead of merging dropped spell identifiers back in", () => {
    const edit = { contentRefs: { Shield: { sourceId: "tome-of-heroes", contentType: "spells", contentId: "shield" } } };
    const result = layOver(castingOverlayBase(old, edit), edit) as typeof old;
    expect(Object.keys(result.contentRefs)).toEqual(["Shield"]);
  });
});
