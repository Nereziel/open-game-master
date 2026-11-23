import { describe, expect, it } from "vitest";
import { supplementCzechRegistry } from "./index";
import { isSupplementDocumentSlug, matchesRequestedCatalogDocument, supplementCzechDisplay, supplementRulesForDisplay } from "./display";
import type { SupplementCatalogRow } from "./build-pack";

const row = (documentSlug: string, kind: SupplementCatalogRow["kind"], slug: string, name: string): SupplementCatalogRow => ({
  source: "open5e", documentSlug, kind, slug, name,
});

const source = [
  row("toh", "spells", "fuse-armor", "Fuse Armor"),
  row("toh", "spells", "lance", "Lance"),
  row("toh", "items", "axespear", "Axespear"),
  row("toh", "feats", "boundless-reserves", "Boundless Reserves"),
  row("dmag", "spells", "abhorrent-apparition", "Abhorrent Apparition"),
  row("vom", "items", "ashwood-wand", "Ashwood Wand"),
  row("wotc-srd", "spells", "lance", "Lance"),
] as const;

describe("source-scoped Czech catalog display (#107 phase 4)", () => {
  const { registry } = supplementCzechRegistry(source);
  it("adds a book-specific Czech label without changing English identity", () => {
    const original = source[0];
    const localized = supplementCzechDisplay(registry, "spells", original);
    expect(localized?.name).toBe("Znehybnění kovu");
    expect(localized?.hasFullRules).toBe(false);
    expect(localized?.summary).toContain("kov");
    expect(localized?.fullRules).toBeUndefined();
    expect(original.name).toBe("Fuse Armor");
    expect(original.slug).toBe("fuse-armor");
  });

  it("keeps summaries explicitly marked and always retains the same source's full English rules", () => {
    const localized = supplementCzechDisplay(registry, "spells", source[0], true);
    const english = "Full original spell text, including every exception.";
    const shown = supplementRulesForDisplay(localized ?? undefined, english, "cs");
    expect(shown).toContain("Stručný český přehled");
    expect(shown).toContain("Úplná pravidla (anglicky)");
    expect(shown).toContain(english);
    expect(supplementRulesForDisplay(localized ?? undefined, english, "en")).toBe(english);
  });

  it("offers full Czech rules only in a requested detail, not a compact list", () => {
    const entry = source[1];
    const list = supplementCzechDisplay(registry, "spells", entry);
    const detail = supplementCzechDisplay(registry, "spells", entry, true);
    expect(list?.name).toBe("Silové kopí");
    expect(list?.hasFullRules).toBe(true);
    expect(list?.fullRules).toBeUndefined();
    expect(detail?.fullRules).toContain("5k6");
    expect(supplementRulesForDisplay(detail ?? undefined, "English rules", "cs")).toBe(detail?.fullRules);
  });

  it("isolates source, slug, homebrew, and unknown content types", () => {
    expect(supplementCzechDisplay(registry, "spells", source[6])).toBeNull();
    expect(supplementCzechDisplay(registry, "spells", { ...source[0], source: "homebrew" })).toBeNull();
    expect(supplementCzechDisplay(registry, "monsters", source[0])).toBeNull();
    expect(supplementCzechDisplay(registry, "spells", { ...source[0], slug: "unknown" })).toBeNull();
    expect(supplementCzechDisplay(registry, "spells", { ...source[0], documentSlug: "vom" })).toBeNull();
  });

  it("uses the corresponding book for feats, weapons and Deep Magic spells", () => {
    expect(supplementCzechDisplay(registry, "items", source[2])?.name).toBe("Sekerokopí");
    expect(supplementCzechDisplay(registry, "feats", source[3], true)?.fullRules).toContain("Moudrost");
    expect(supplementCzechDisplay(registry, "spells", source[4])?.name).toBe("Odpudivý přízrak");
    expect(supplementCzechDisplay(registry, "items", source[5], true)?.fullRules).toContain("3 náboje");
  });

  it("refuses a same-slug entry from another source document", () => {
    expect(matchesRequestedCatalogDocument(source[0], "toh")).toBe(true);
    expect(matchesRequestedCatalogDocument(source[0], "dmag")).toBe(false);
    expect(matchesRequestedCatalogDocument({ source: "homebrew", documentSlug: "toh" }, "toh")).toBe(false);
    expect(matchesRequestedCatalogDocument(undefined, "toh")).toBe(false);
    expect(matchesRequestedCatalogDocument(source[0], null)).toBe(true);
  });

  it("does not redirect SRD or bundled item descriptions into supplement fallback", () => {
    expect(isSupplementDocumentSlug("wotc-srd")).toBe(false);
    expect(isSupplementDocumentSlug("odm-expanded")).toBe(false);
    expect(isSupplementDocumentSlug(undefined)).toBe(false);
    expect(isSupplementDocumentSlug("toh")).toBe(true);
    expect(isSupplementDocumentSlug("deepm")).toBe(true);
    expect(isSupplementDocumentSlug("dmag")).toBe(true);
    expect(isSupplementDocumentSlug("vom")).toBe(true);
  });

  it("preserves English fallback if a catalog row is genuinely untranslated", () => {
    const unlisted = row("dmag", "spells", "untranslated-spell", "Untranslated Spell");
    expect(supplementCzechDisplay(registry, "spells", unlisted)).toBeNull();
    expect(supplementRulesForDisplay(undefined, "English", "cs")).toBe("English");
  });
});
