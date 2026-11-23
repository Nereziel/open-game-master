import { describe, expect, it } from "vitest";
import { contentName } from "./names";

describe("book-scoped SRD vs supplement display identity (#107 phase 2)", () => {
  it("never borrows SRD names for an identically named spell from Tome of Heroes", () => {
    const tome = { source: "open5e", documentSlug: "toh", name: "Shield", slug: "shield" };
    expect(contentName("spells", tome, "cs")).toBe("Shield");
    expect(contentName("spells", { ...tome, localizedCs: { name: "Štít hrdinů" } }, "cs"))
      .toBe("Štít hrdinů");
    expect(contentName("spells", { ...tome, localizedCs: { name: "Štít hrdinů" } }, "en"))
      .toBe("Shield");
  });

  it("prioritizes catalog-verified SRD Czech metadata over old name-only maps", () => {
    const srd = {
      source: "open5e", documentSlug: "wotc-srd", name: "Shield", slug: "shield",
      display: { name: "Štít" },
    };
    expect(contentName("spells", srd, "cs")).toBe("Štít");
    expect(contentName("spells", srd, "en")).toBe("Shield");
    expect(contentName("spells", { ...srd, display: { name: "Jiný ověřený název" } }, "cs"))
      .toBe("Jiný ověřený název");
  });

  it("never accepts a forged source name for user-authored or bundled content", () => {
    expect(contentName("items", {
      source: "homebrew", documentSlug: "wotc-srd", name: "Shield",
      display: { name: "Štít" }, localizedCs: { name: "Kouzelný štít" },
    }, "cs")).toBe("Shield");
    expect(contentName("items", {
      source: "bundled", name: "Shield", display: { name: "Štít" },
    }, "cs")).toBe("Shield");
    expect(contentName("items", {
      source: "open5e", documentSlug: "vom", name: "Shield", slug: "shield",
      display: { name: "SRD štít" },
    }, "cs")).toBe("Shield");
  });
});
