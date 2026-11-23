import { describe, expect, it } from "vitest";
import { auditCatalogCollisions, type CollidableCatalogRow } from "./collision-audit";
import { supplementCzechRegistry } from "./index";
import { supplementCzechDisplay } from "./display";
import { matchesRequestedCatalogDocument } from "./display";
import { sourceRowIdentity, togglePendingSourceRow, uniqueBySource } from "@/app/characters/builder/pickerRows";
import { storedReferenceForCatalogRow, sameStoredContentReference } from "../stored-reference";
import { TOME_OF_HEROES_CS } from "../tome-of-heroes/cs-data";

const row = (
  source: CollidableCatalogRow["source"],
  documentSlug: string,
  kind: CollidableCatalogRow["kind"],
  slug: string,
  name: string,
): CollidableCatalogRow => ({ source, documentSlug, kind, slug, name });

describe("phase 3: source identity and duplicate feats across books (#107)", () => {
  const rows = [
    row("open5e", "wotc-srd", "spells", "shield", "Shield"),
    row("open5e", "toh", "spells", "shield", "Shield"),
    row("open5e", "dmag", "spells", "shield", "Shield"),
    row("homebrew", "homebrew", "spells", "homebrew:shield", "Shield"),
    row("open5e", "toh", "feats", "duplicate-a", "Duplicate Feat"),
    row("open5e", "toh", "feats", "duplicate-b", "Duplicate Feat"),
    row("open5e", "deepm", "feats", "duplicate-a", "Duplicate Feat"),
  ] as const;

  it("reports same-name source collisions without merging their identities", () => {
    const report = auditCatalogCollisions(rows);
    expect(report.crossBookNames.find(row => row.name === "Shield")?.identities).toHaveLength(4);
    expect(report.duplicateFeatsInBook).toEqual([expect.objectContaining({
      kind: "feats", name: "Duplicate Feat",
    })]);
    expect(report.duplicateFeatsInBook[0].identities).toHaveLength(2);
    expect(report.conflictingIds).toEqual([]);
    expect(uniqueBySource(rows)).toHaveLength(rows.length);
    expect(new Set(rows.slice(0, 4).map(sourceRowIdentity)).size).toBe(4);
  });

  it("reports differing titles under one translated source and slug, but not honest aliases", () => {
    const rows = [
      row("open5e", "dmag", "spells", "reused", "Spell One"),
      row("open5e", "deepm", "spells", "reused", "Spell Two"),
      row("open5e", "dmag", "spells", "shared", "Shared Spell"),
      row("open5e", "deepm", "spells", "shared", "Shared Spell"),
    ];
    expect(auditCatalogCollisions(rows).conflictingIds).toEqual([expect.objectContaining({
      name: "Spell One", identities: expect.arrayContaining([
        sourceRowIdentity(rows[0]), sourceRowIdentity(rows[1]),
      ]),
    })]);
  });

  it("keeps the chosen book in the saved reference, search identity and detail scope", () => {
    const srd = row("open5e", "wotc-srd", "spells", "shield", "Shield");
    const tome = row("open5e", "toh", "spells", "shield", "Shield");
    const srdRef = storedReferenceForCatalogRow("spells", srd);
    const tomeRef = storedReferenceForCatalogRow("spells", tome);
    expect(srdRef?.sourceId).toBe("srd-5.1");
    expect(tomeRef?.sourceId).toBe("tome-of-heroes");
    expect(tomeRef?.documentSlug).toBe("toh");
    expect(sameStoredContentReference(srdRef!, tomeRef!)).toBe(false);
    expect(matchesRequestedCatalogDocument(tome, "toh")).toBe(true);
    expect(matchesRequestedCatalogDocument(srd, "toh")).toBe(false);
    let pending = togglePendingSourceRow([], srd);
    pending = togglePendingSourceRow(pending, tome);
    // Until a name-only saved spell list supports multiple same-name refs,
    // changing a book selects one unambiguous canonical reference.
    expect(pending).toEqual([tome]);
    expect(storedReferenceForCatalogRow("spells", pending[0])?.documentSlug).toBe("toh");
  });

  it("leaves duplicate same-title feats untranslated when no unique catalog slug can be inferred", () => {
    const feats = [
      row("open5e", "toh", "feats", "feat-a", "Boundless Reserves"),
      row("open5e", "toh", "feats", "feat-b", "Boundless Reserves"),
    ];
    expect(Object.prototype.hasOwnProperty.call(TOME_OF_HEROES_CS.feats.names, "Boundless Reserves")).toBe(true);
    const result = supplementCzechRegistry(feats);
    expect(result.reports.find(r => r.sourceId === "tome-of-heroes")?.ambiguous).toHaveLength(2);
    expect(supplementCzechDisplay(result.registry, "feats", feats[0])).toBeNull();
    expect(supplementCzechDisplay(result.registry, "feats", feats[1])).toBeNull();
  });
});
