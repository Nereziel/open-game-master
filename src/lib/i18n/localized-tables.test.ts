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
import { pickerName, pickerMeta } from "../content/picker-display";
import { itemDisplayName } from "../content/item-display";
import { characterEventDisplay } from "../characters/event-display";
import { describeAuditEntry } from "@/app/campaigns/[campaignId]/event-log-logic";
import { armorChangeMinutes } from "../dm/don-doff";
import type { EquipmentItem } from "../schemas/sheet";
import { localizeCoins, formatCopper, formatPrice, parseCoins } from "../srd/currency";

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

describe("Catalog picker, item editor and market presentation", () => {
  it("shares source-aware labels without changing the entry selected", () => {
    const spell = { slug: "fireball", name: "Fireball", source: "srd", level: 3 };
    const gear = { slug: "longsword", name: "Longsword", source: "srd", rarity: "rare" };
    const snapshot = JSON.stringify([spell, gear]);
    for (const [locale, spellLabel, itemLabel, level, rarity] of [
      ["en", "Fireball", "Longsword", "Level 3", "rare"],
      ["fr", "Boule de feu", "Épée longue", "Niveau 3", "rare"],
      ["cs", "Ohnivá koule", "Dlouhý meč", "Úroveň 3", "vzácný"],
    ] as const) {
      expect(pickerName("spells", spell, locale)).toBe(spellLabel);
      expect(pickerName("items", gear, locale)).toBe(itemLabel);
      expect(pickerMeta(spell, locale)).toBe(level);
      expect(pickerMeta(gear, locale)).toBe(rarity);
      expect(pickerName("spells", { ...spell, source: "homebrew" }, locale)).toBe("Fireball");
      expect(pickerName("spells", { ...spell, source: "open5e", documentSlug: "unrelated-book" }, locale)).toBe("Fireball");
      expect(pickerName("hazards", { name: "Custom Trap" }, locale)).toBe("Custom Trap");
      expect(pickerMeta({ kind: "unknown_kind" }, locale)).toBe("unknown_kind");
      expect(pickerMeta({}, locale)).toBe("");
      expect(itemDisplayName({ name: "Longsword", srdName: "Longsword" }, locale)).toBe(itemLabel);
      expect(itemDisplayName({ name: "Longsword +1", srdName: "Longsword" }, locale)).toBe(itemLabel + " +1");
      expect(itemDisplayName({ name: "Night's Edge", srdName: "Longsword" }, locale)).toBe("Night's Edge");
      expect(itemDisplayName({ name: "Longsword", slug: "homebrew:123" }, locale)).toBe("Longsword");
      expect(itemDisplayName({ name: "Longsword" }, locale, false)).toBe("Longsword");
    }
    expect(JSON.stringify([spell, gear])).toBe(snapshot);
    expect(pickerName("archetypes", { name: "Champion", slug: "champion", source: "srd" }, "cs", "fighter")).toBe("Šampion");
    expect(pickerName("archetypes", { name: "Champion", slug: "champion", source: "homebrew" }, "cs", "fighter")).toBe("Champion");
  });
  it("localizes closed editor categories, currencies and moment templates", () => {
    const categories = [
      ["item.weaponCategory", ["simple", "martial", "firearm", "exotic"], ["jednoduchá", "vojenská", "palná", "exotická"]],
      ["item.armorCategory", ["light", "medium", "heavy", "shield"], ["lehká", "střední", "těžká", "štít"]],
    ] as const;
    for (const [context, keys, labels] of categories) {
      expect(keys.map((key) => translate("en", key, { context }))).toEqual(keys);
      expect(keys.map((key) => translate("cs", key, { context }))).toEqual(labels);
      expect(keys.every((key) => translate("fr", key, { context }) !== key)).toBe(true);
    }
    expect(localizeCoins(formatCopper(1342), "en")).toBe("1 pp 3 gp 4 sp 2 cp");
    expect(localizeCoins(formatCopper(1342), "cs")).toBe("1 pl 3 zl 4 st 2 md");
    expect(localizeCoins(formatCopper(1342), "fr")).toBe("1 pp 3 po 4 pa 2 pc");
    expect(formatPrice(1342)).toBe("13 gp 4 sp 2 cp");
    expect(parseCoins(formatPrice(1342))).toBe(1342);
    expect(translate("cs", "{name} reaches level {level}", { name: "Mira", level: 5 })).toBe("Mira dosahuje úrovně 5");
    expect(translate("cs", "{hp}/{max} hit points", { hp: 5, max: 12 })).toBe("5/12 životů");
    expect(translate("fr", "{hp}/{max} hit points", { hp: 5, max: 12 })).toBe("5/12 points de vie");
  });
});

describe("History, audit and equipment reader language", () => {
  it("localizes only known history templates and leaves names and free prose intact", () => {
    const samples = [
      { kind: "item", summary: "Acquired Custom Lantern x2." },
      { kind: "item", summary: "Bought Custom Lantern for 2 gp 5 sp at Marla's." },
      { kind: "achievement", summary: "Copied Custom Spell into the spellbook." },
      { kind: "level_up", summary: "Reached enough experience for level 5." },
      { kind: "death", summary: "Died: The dragon's fire." },
      { kind: "story", summary: "Mira joined the party as an AI companion (party)." },
      { kind: "story", summary: "Mira left the party: a promise to her sister." },
    ];
    const before = JSON.stringify(samples);
    for (const locale of ["en", "fr", "cs"] as const) {
      for (const sample of samples) {
        const result = characterEventDisplay(sample, locale);
        if (locale === "en") expect(result).toBe(sample.summary);
        else expect(result).not.toBe(sample.summary);
      }
      expect(characterEventDisplay({ kind: "story", summary: "Acquired Custom Lantern x2." }, locale)).toBe("Acquired Custom Lantern x2.");
      expect(characterEventDisplay({ kind: "relationship", summary: "Mira left the party." }, locale)).toBe("Mira left the party.");
      expect(characterEventDisplay(samples[6], locale)).toContain("a promise to her sister.");
      expect(characterEventDisplay(samples[2], locale)).toContain("Custom Spell");
    }
    expect(characterEventDisplay(samples[0], "cs")).toBe("Získáno: Custom Lantern x2.");
    expect(characterEventDisplay(samples[1], "cs")).toContain("2 zl 5 st");
    expect(JSON.stringify(samples)).toBe(before);
  });

  it("renders structured audit rows without changing rollback data", () => {
    const row = { kind: "pact_weapon", delta: { created: "Custom Blade" } };
    const before = JSON.stringify(row);
    const cs = Object.assign((key: string, vars?: Record<string, string | number>) => translate("cs", key, vars), { locale: "cs" as const });
    const fr = Object.assign((key: string, vars?: Record<string, string | number>) => translate("fr", key, vars), { locale: "fr" as const });
    expect(describeAuditEntry(row, "Mira")).toBe("Mira creates a pact weapon: Custom Blade");
    expect(describeAuditEntry(cs, row, "Mira")).toBe("Mira vytváří paktovou zbraň: Custom Blade");
    expect(describeAuditEntry(fr, row, "Mira")).toBe("Mira crée une arme de pacte : Custom Blade");
    const reaction = { kind: "reaction", delta: {} };
    expect(describeAuditEntry(reaction, "Mira")).toBe("Mira takes a reaction");
    expect(describeAuditEntry(cs, reaction, "Mira")).toBe("Mira používá reakci");
    expect(describeAuditEntry(fr, reaction, "Mira")).toBe("Mira utilise une réaction");
    expect(JSON.stringify(row)).toBe(before);
  });

  it("uses identical armor timing in all reader languages and preserves hidden item names", () => {
    const items = [{ name: "Chain Mail", qty: 1, equipped: false }] as EquipmentItem[];
    const gear = { "Chain Mail": { equipped: true } };
    const before = JSON.stringify(items);
    const en = armorChangeMinutes(items, gear);
    expect(en.minutes).toBe(10);
    expect(en.lines).toEqual(["Putting on Chain Mail takes 10 minutes."]);
    for (const locale of ["cs", "fr"] as const) {
      const display = armorChangeMinutes(items, gear, { locale });
      expect(display.minutes).toBe(en.minutes);
      expect(display.lines).not.toEqual(en.lines);
      expect(itemDisplayName({ name: "Longsword", identified: false, srdName: "Longsword" }, locale)).toBe("Longsword");
      expect(itemDisplayName({ name: "Longsword", documentSlug: "unrelated-book", source: "open5e", slug: "longsword" }, locale)).toBe("Longsword");
      expect(itemDisplayName({ name: "Longsword", gear: {} }, locale)).toBe("Longsword");
    }
    expect(JSON.stringify(items)).toBe(before);
  });
});
