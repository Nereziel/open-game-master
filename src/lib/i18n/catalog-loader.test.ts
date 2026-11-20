import { describe, expect, it } from "vitest";
import { loadCatalog } from "./catalog-loader";
import { catalogInstalled } from "./translate";

describe("lazy UI catalog loading", () => {
  it("reuses the same settled promise for the source language", async () => {
    const first = loadCatalog("en");
    expect(loadCatalog("en")).toBe(first);
    await first;
    expect(loadCatalog("en")).toBe(first);
  });

  it.each(["cs", "fr"] as const)(
    "keeps one promise for %s before and after its catalog arrives",
    async (locale) => {
      const pending = loadCatalog(locale);
      expect(loadCatalog(locale)).toBe(pending);
      await pending;
      expect(catalogInstalled(locale)).toBe(true);
      expect(loadCatalog(locale)).toBe(pending);
    },
  );
});
