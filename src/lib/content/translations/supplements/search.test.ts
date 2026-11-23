import { describe, expect, it } from "vitest";
import { supplementCzechRegistry } from "./index";
import {
  combineSupplementSearchResults,
  czechSupplementCandidates,
  matchesSupplementCandidate,
} from "./search";
import type { SupplementCatalogRow } from "./build-pack";

const rows: SupplementCatalogRow[] = [
  { source: "open5e", kind: "spells", slug: "fuse-armor", documentSlug: "toh", name: "Fuse Armor" },
  { source: "open5e", kind: "items", slug: "axespear", documentSlug: "toh", name: "Axespear" },
  { source: "open5e", kind: "spells", slug: "abhorrent-apparition", documentSlug: "dmag", name: "Abhorrent Apparition" },
  { source: "open5e", kind: "spells", slug: "abhorrent-apparition", documentSlug: "deepm", name: "Abhorrent Apparition" },
  { source: "open5e", kind: "spells", slug: "fuse-armor", documentSlug: "wotc-srd", name: "Fuse Armor" },
  { source: "homebrew", kind: "spells", slug: "fuse-armor", documentSlug: "toh", name: "Fuse Armor" },
];
const { registry } = supplementCzechRegistry(rows);

describe("Czech source-scoped supplement title search (#107)", () => {
  it("finds a Czech title without diacritics and preserves canonical English ID", () => {
    expect(czechSupplementCandidates(registry, rows, "spells", "znehybneni", 12)).toEqual([{
      kind: "spells", name: "Fuse Armor", slug: "fuse-armor", documentSlug: "toh",
    }]);
    expect(czechSupplementCandidates(registry, rows, "items", "sekerokopi", 12)).toEqual([{
      kind: "items", name: "Axespear", slug: "axespear", documentSlug: "toh",
    }]);
  });

  it("filters by book and type before matching a Czech translation", () => {
    const result = czechSupplementCandidates(registry, rows, "spells", "prizrak");
    expect(result).toEqual([
      { kind: "spells", name: "Abhorrent Apparition", slug: "abhorrent-apparition", documentSlug: "deepm" },
      { kind: "spells", name: "Abhorrent Apparition", slug: "abhorrent-apparition", documentSlug: "dmag" },
    ].sort((a, b) => a.documentSlug.localeCompare(b.documentSlug)));
    expect(czechSupplementCandidates(registry, rows, "feats", "prizrak")).toEqual([]);
    expect(czechSupplementCandidates(registry, rows, "spells", "x")).toEqual([]);
    expect(czechSupplementCandidates(registry, rows, "monsters", "prizrak")).toEqual([]);
  });

  it("rejects the wrong book, same slug in SRD and homebrew even with an exact title", () => {
    const [candidate] = czechSupplementCandidates(registry, rows, "spells", "znehybnění");
    expect(matchesSupplementCandidate(rows[0], candidate)).toBe(true);
    expect(matchesSupplementCandidate(rows[4], candidate)).toBe(false);
    expect(matchesSupplementCandidate(rows[5], candidate)).toBe(false);
    expect(matchesSupplementCandidate({ source: "open5e", slug: "another", documentSlug: "toh" }, candidate)).toBe(false);
  });

  it("keeps distinct books with the same English name, and dedupes exact source IDs only", () => {
    const sr = { slug: "shield", name: "Shield", source: "open5e", documentSlug: "wotc-srd" };
    const toh = { slug: "shield", name: "Shield", source: "open5e", documentSlug: "toh" };
    const homebrew = { slug: "homebrew:1", name: "Shield", source: "homebrew", documentSlug: "homebrew" };
    expect(combineSupplementSearchResults([toh, sr], [sr, homebrew, toh], 20))
      .toEqual([toh, sr, homebrew]);
    expect(combineSupplementSearchResults([toh, sr], [sr, homebrew], 2))
      .toEqual([toh, sr]);
  });

  it("requires distinct source identities and respects a bound on result count", () => {
    const translated = czechSupplementCandidates(registry, rows, "spells", "odpudivy", 1);
    expect(translated).toHaveLength(1);
    expect(translated[0].documentSlug).toBe("deepm");
    expect(czechSupplementCandidates(registry, rows, "spells", "odpudivy", 0)).toEqual([]);
    expect(combineSupplementSearchResults([], [], 10)).toEqual([]);
  });
});
