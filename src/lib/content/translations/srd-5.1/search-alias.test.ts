import { describe, expect, it } from "vitest";
import { appendExactSrdAlias } from "./search-alias";

describe("source-safe Czech catalog search aliases (#107)", () => {
  const own = { source: "homebrew" as const, documentSlug: "homebrew", slug: "homebrew:123", name: "Světlo" };
  const srd = { source: "open5e" as const, documentSlug: "wotc-srd", slug: "light", name: "Light" };
  const other = { source: "open5e" as const, documentSlug: "toh", slug: "light", name: "Light" };

  it("keeps original Czech-named homebrew when adding the English SRD result", () => {
    expect(appendExactSrdAlias([own], [other, srd], "Light")).toEqual([own, srd]);
  });
  it("does not duplicate an existing canonical ID or borrow other-book text", () => {
    expect(appendExactSrdAlias([srd, own], [srd, other], "Light")).toEqual([srd, own]);
  });
  it("requires an exact English title, not a substring result", () => {
    expect(appendExactSrdAlias([own], [{ ...srd, name: "Light Bearer" }], "Light")).toEqual([own]);
  });
  it("supports a bundled SRD row and retains stable source provenance", () => {
    const bundled = { source: "srd" as const, documentSlug: "wotc-srd", slug: "srd:light", name: "Light" };
    expect(appendExactSrdAlias([own], [bundled], "Light")).toEqual([own, bundled]);
  });
});
