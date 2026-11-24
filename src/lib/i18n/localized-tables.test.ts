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
import { genderLabel, storedGender } from "../gender";
import { ATTRACTION_CHOICES, attractionLabel } from "../attraction";
import { glossaryTerm, localizedGlossaryTerm } from "../help";
import { translate } from "./translate";
import { localizeAcParts } from "@/app/characters/builder/derivedReasons";
import { DM_STATUS_PHRASES, DM_STATUS_PHRASES_FR, dmStatusPhrase } from "@/app/campaigns/[campaignId]/dmStatusPhrases";
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
      expect(cardDisplayName({ ...spell, id: "attack:granted:fireball" }, locale)).toBe(name);
      expect(cardDisplayName(resource, locale)).toBe(resourceName);
      expect(cardDisplayName({ ...spell, name: "__unknown_spell__" }, locale)).toBe("__unknown_spell__");
    }
    expect(spell).toEqual({ id: "spell:fireball", name: "Fireball" });
    expect(resource).toEqual({ id: "feature:second_wind", name: "Second Wind" });
  });
});

describe("Reader-facing labels and status messages", () => {
  it("translates gender and attraction labels without changing stored values", () => {
    expect(genderLabel("Female", "en")).toBe("Female");
    expect(genderLabel("Female", "fr")).toBe("Féminin");
    expect(genderLabel("Female", "cs")).toBe("Ženské");
    expect(genderLabel("", "cs")).toBe("");
    expect(storedGender("Female")).toBe("Female");
    expect(ATTRACTION_CHOICES.map((choice) => attractionLabel(choice.label, "cs"))).toEqual(["Ženy", "Muži", "Nebinární osoby"]);
    expect(ATTRACTION_CHOICES.map((choice) => choice.gender)).toEqual(["Female", "Male", "Nonbinary"]);
  });

  it("selects status phrases deterministically in all reader languages", () => {
    for (const status of Object.keys(DM_STATUS_PHRASES) as Array<keyof typeof DM_STATUS_PHRASES>) {
      const en = dmStatusPhrase("en", status, "turn-1");
      const fr = dmStatusPhrase("fr", status, "turn-1");
      const cs = dmStatusPhrase("cs", status, "turn-1");
      expect(DM_STATUS_PHRASES[status]).toContain(en);
      expect(DM_STATUS_PHRASES_FR[status]).toContain(fr);
      expect(cs).not.toBe(en);
      expect(dmStatusPhrase("cs", status, "turn-1")).toBe(cs);
    }
    expect(dmStatusPhrase("cs", "idle", "turn-1")).toBe("");
  });

  it("uses canonical numbers and localized labels for AC explanations", () => {
    const parts = ["Chain Mail 16", "DEX -1", "Shield +2"];
    expect(localizeAcParts(parts, (key) => key, "en")).toEqual(parts);
    expect(localizeAcParts(parts, (key) => translate("cs", key), "cs")[1]).toBe("OBR -1");
    expect(localizeAcParts(parts, (key) => translate("fr", key), "fr")[1]).toBe("DEX -1");
    expect(parts).toEqual(["Chain Mail 16", "DEX -1", "Shield +2"]);
  });

  it("uses the shared glossary adapter with per-field English fallback", () => {
    const term = glossaryTerm("ability_score")!;
    expect(localizedGlossaryTerm(term, "cs").term).toBe(term.cs);
    expect(localizedGlossaryTerm(term, "fr").short).toBe(term.shortFr);
    expect(localizedGlossaryTerm({ ...term, shortCs: undefined }, "cs").short).toBe(term.short);
    expect(localizedGlossaryTerm(term, "en").long).toBe(term.long);
  });
});
