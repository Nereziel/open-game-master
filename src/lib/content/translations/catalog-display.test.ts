import { describe, expect, it } from "vitest";
import { withCatalogDisplay } from "./catalog-display";
import { bundledSpellRows, bundledItemRows } from "@/lib/rulebook/catalog-rows";

describe("SRD catalog API presentation boundary (#107)", () => {
  it("adds translated display fields without touching mechanics or stored identifiers", () => {
    const row = bundledSpellRows().find((spell) => spell.name === "Light");
    expect(row).toBeDefined();
    const result = withCatalogDisplay("spells", row!, "cs");
    expect(result.slug).toBe(row!.slug);
    expect(result.name).toBe(row!.name);
    expect(result.data).toBe(row!.data);
    expect(result.school).toBe(row!.school);
    expect(result.level).toBe(row!.level);
    expect(result.display?.name).toBe("Světlo");
    expect(result.display?.description).toContain("Úplné znění pravidel v češtině");
    expect(withCatalogDisplay("spells", row!, "en")).toBe(row);
  });

  it("retains provenance for an item and translates its display metadata only", () => {
    const item = bundledItemRows().find((row) => row.rarity.toLowerCase().includes("rare"));
    expect(item).toBeDefined();
    const result = withCatalogDisplay("items", item!, "cs");
    expect(result.slug).toBe(item!.slug);
    expect(result.name).toBe(item!.name);
    expect(result.rarity).toBe(item!.rarity);
    expect(result.data).toBe(item!.data);
    expect(result.display?.description).toBeTruthy();
  });

  it("cannot translate an equal-name entry from a different source", () => {
    const name = "Light";
    const original = {
      source: "open5e" as const, documentSlug: "toh",
      kind: "spell", slug: "tome-light", name,
      school: "evocation", data: { desc: "Other book's original" },
    };
    expect(withCatalogDisplay("spells", original, "cs")).toBe(original);
    expect(withCatalogDisplay("spells", { ...original, source: "homebrew", documentSlug: "homebrew" }, "cs").display).toBeUndefined();
  });
});
