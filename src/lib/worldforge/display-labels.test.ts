import { describe, expect, it } from "vitest";
import { defaultTypes } from "@/lib/worldforge/model";
import { worldFieldLabel, worldFolderLabel, worldTypeLabel } from "@/lib/worldforge/display-labels";

describe("WorldForge Czech display names", () => {
  const types = defaultTypes();

  it("translates all seven built-in type labels only for Czech", () => {
    const expected: Record<string, string> = {
      t_character: "Postava",
      t_location: "Místo",
      t_faction: "Frakce",
      t_artifact: "Artefakt",
      t_deity: "Božstvo",
      t_culture: "Kultura",
      t_other: "Ostatní",
    };
    expect(types).toHaveLength(7);
    for (const type of types) {
      expect(worldTypeLabel(type, "cs")).toBe(expected[type.id]);
      expect(worldTypeLabel(type, "en")).toBe(type.name);
      expect(worldTypeLabel(type, "fr")).toBe(type.name);
    }
  });

  it("translates default WorldForge folder names but retains the stored names", () => {
    const originals = ["Characters", "Locations", "Factions", "Artifacts", "Deities", "Cultures", "Geography", "History", "Magic", "Religion", "Other"];
    const translated = ["Postavy", "Místa", "Frakce", "Artefakty", "Božstva", "Kultury", "Zeměpis", "Historie", "Magie", "Náboženství", "Ostatní"];
    expect(originals.map((name) => worldFolderLabel(name, "cs"))).toEqual(translated);
    expect(originals.map((name) => worldFolderLabel(name, "en"))).toEqual(originals);
    expect(worldFolderLabel("The Broken Coast", "cs")).toBe("The Broken Coast");
  });

  it("translates only default field names and preserves custom names", () => {
    const all = types.flatMap((type) => type.fields);
    expect(all).toHaveLength(10);
    for (const field of all) {
      expect(worldFieldLabel(field, "cs")).not.toBe(field.name);
      expect(worldFieldLabel(field, "en")).toBe(field.name);
    }
    const renamedType = { ...types[0], name: "My Characters" };
    expect(worldTypeLabel(renamedType, "cs")).toBe("My Characters");
    const renamedField = { ...types[0].fields[0], name: "Birth date" };
    expect(worldFieldLabel(renamedField, "cs")).toBe("Birth date");
    expect(worldTypeLabel({ id: "custom", name: "Character" }, "cs")).toBe("Character");
  });

  it("does not modify the original world data", () => {
    const before = JSON.stringify(types);
    for (const type of types) {
      worldTypeLabel(type, "cs");
      for (const field of type.fields) worldFieldLabel(field, "cs");
    }
    expect(JSON.stringify(types)).toBe(before);
  });
});
