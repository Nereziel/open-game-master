import { describe, expect, it } from "vitest";
import { canonicalSrdSearchQuery } from "./catalog-query";

describe("Czech SRD catalog search aliases (#107)", () => {
  it("searches the English catalog for a uniquely named Czech spell", () => {
    expect(canonicalSrdSearchQuery("spells", "Světlo", "cs")).toBe("Light");
    expect(canonicalSrdSearchQuery("spells", "Light", "cs")).toBe("Light");
  });
  it("does not rewrite unknown, partial, homebrew or other-locale searches", () => {
    expect(canonicalSrdSearchQuery("spells", "Vlastní kouzlo", "cs")).toBe("Vlastní kouzlo");
    expect(canonicalSrdSearchQuery("spells", "Svět", "cs")).toBe("Svět");
    expect(canonicalSrdSearchQuery("spells", "Světlo", "en")).toBe("Světlo");
    expect(canonicalSrdSearchQuery("feats", "Odbornost", "cs")).toBe("Odbornost");
  });
});
