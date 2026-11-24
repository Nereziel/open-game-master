import { describe, expect, it } from "vitest";
import "./fr-catalog";
import "./cs-catalog";
import { localizedTables } from "./localized-tables";
import { catalogReady } from "./catalog-loader";
import { FR_NAMES_BY_TABLE } from "../content/names-fr";
import { FR_TRANSLATED_NAMES_BY_TABLE } from "../content/names-fr-translated";
import { CS_NAMES_BY_TABLE } from "../content/names-cs";
import { RESOURCE_FR } from "../srd/class-resources-fr-data";
import { RESOURCE_CS_GUIDANCE } from "../srd/class-resources-cs-data";
import { resourceDisplayName, resourceGuidance } from "../srd/class-resources-fr";
import { cardDisplayName, chipName } from "../battlemap/hand-display";
import type { HandCard } from "../battlemap/hand-core";

describe("Shared reader-language display tables", () => {
  it("retains every original name and resource map without mixing languages", () => {
    expect(localizedTables("en")).toBeNull();
    expect(catalogReady("fr")).toBe(true);
    expect(catalogReady("cs")).toBe(true);
    expect(localizedTables("fr")?.names).toEqual(FR_NAMES_BY_TABLE);
    expect(localizedTables("fr")?.translated).toEqual(FR_TRANSLATED_NAMES_BY_TABLE);
    expect(localizedTables("cs")?.names).toEqual(CS_NAMES_BY_TABLE);
    for (const [id, data] of Object.entries(RESOURCE_FR)) {
      expect(resourceDisplayName(id, "fr")).toBe(data.name);
      expect(resourceGuidance(id, "fr")).toBe(data.guidance);
    }
    for (const [id, name] of Object.entries(CS_NAMES_BY_TABLE.resources ?? {})) {
      expect(resourceDisplayName(id, "cs")).toBe(name);
    }
    for (const [id, guidance] of Object.entries(RESOURCE_CS_GUIDANCE)) {
      expect(resourceGuidance(id, "cs")).toBe(guidance);
    }
    for (const locale of ["en", "fr", "cs"] as const) {
      expect(resourceDisplayName("__unknown_resource__", locale)).toBeNull();
      expect(resourceGuidance("__unknown_resource__", locale)).toBeNull();
    }
  });

  it("uses the same render functions for English, French and Czech combat cards", () => {
    const spell = { id: "spell:fireball", name: "Fireball" } as HandCard;
    const resource = { id: "feature:second_wind", name: "Second Wind" } as HandCard;
    for (const [locale, name, resourceName] of [
      ["en", "Fireball", "Second Wind"],
      ["fr", "Boule de feu", "Second souffle"],
      ["cs", "Ohnivá koule", "Druhý dech"],
    ] as const) {
      expect(chipName(spell.name, locale)).toBe(name);
      expect(cardDisplayName(spell, locale)).toBe(name);
      expect(cardDisplayName(resource, locale)).toBe(resourceName);
      expect(cardDisplayName({ ...spell, name: "__unknown_spell__" }, locale)).toBe("__unknown_spell__");
    }
    expect(spell).toEqual({ id: "spell:fireball", name: "Fireball" });
    expect(resource).toEqual({ id: "feature:second_wind", name: "Second Wind" });
  });
});
