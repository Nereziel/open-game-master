import { describe, expect, it } from "vitest";
import { pdfReferencedName } from "./source-name";

describe("PDF source-scoped Czech labels (#107)", () => {
  it("uses the verified SRD term when provenance explicitly matches", () => {
    expect(pdfReferencedName("spells", "Light", "cs", {
      sourceId: "srd-5.1", contentType: "spells", contentId: "light", documentSlug: "wotc-srd",
    })).toBe("Světlo");
  });

  it("does not borrow SRD Czech titles for a spell or item from another book", () => {
    expect(pdfReferencedName("spells", "Light", "cs", {
      sourceId: "other-book", contentType: "spells", contentId: "light", documentSlug: "toh",
    })).toBe("Light");
    expect(pdfReferencedName("spells", "Light", "cs", {
      sourceId: "srd-5.1", contentType: "spells", contentId: "light", documentSlug: "toh",
    })).toBe("Light");
    expect(pdfReferencedName("items", "Shield", "cs", {
      sourceId: "other-book", contentType: "items", contentId: "shield", documentSlug: "toh",
    })).toBe("Shield");
  });

  it("preserves backwards-compatible displays for name-only sheets", () => {
    expect(pdfReferencedName("spells", "Light", "cs")).toBe("Světlo");
    expect(pdfReferencedName("spells", "Light", "en")).toBe("Light");
  });

  it("does not use an item reference to translate a spell", () => {
    expect(pdfReferencedName("spells", "Light", "cs", {
      sourceId: "srd-5.1", contentType: "items", contentId: "light",
    })).toBe("Light");
  });
});
