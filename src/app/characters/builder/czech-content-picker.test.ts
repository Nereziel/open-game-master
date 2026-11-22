import { describe, expect, it } from "vitest";
import authoredFeats from "@/lib/srd/authored-feats.json";
import { CS_NAMES_BY_TABLE } from "@/lib/content/names-cs";
import { installCsTables } from "@/lib/i18n/cs-tables";
import { contentName } from "@/lib/content/names";
import { builtinFeatSummaryCs } from "@/lib/help/feat-summary-cs";
import { officialCzechSpellPageId } from "@/lib/help/official-cs-reference";
import { itemPickerKindLabel, itemPickerMeta, itemPickerRarityLabel } from "@/lib/help/item-picker-labels";
import { featPickerKey, uniquePlayableFeatRows } from "./feat-picker-logic";

installCsTables({ names: CS_NAMES_BY_TABLE });

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

describe("Czech campaign content pickers", () => {
  it("provides unique Czech names and Czech summaries for all builtin feats", () => {
    const feats = authoredFeats.feats;
    expect(feats).toHaveLength(72);
    const labels = new Set<string>();
    for (const feat of feats) {
      expect(CS_NAMES_BY_TABLE.feats[slug(feat.name)], `Missing Czech feat: ${feat.name}`).toBeTruthy();
      const shown = contentName("feats", { name: feat.name, source: "open5e" }, "cs");
      expect(shown, feat.name).not.toBe(feat.name);
      expect(labels.has(shown), `Repeated Czech feat label: ${shown}`).toBe(false);
      labels.add(shown);
      expect(builtinFeatSummaryCs(feat.name)?.length, feat.name).toBeGreaterThan(30);
    }
    expect(builtinFeatSummaryCs("Homebrew Sorcerer")).toBeNull();
  });

  it("translates official SRD and bundled spell/item rows without translating homebrew", () => {
    expect(contentName("spells", { name: "Cure Wounds", source: "srd" }, "cs")).toBe("Léčení zranění");
    expect(contentName("spells", { name: "Cure Wounds", source: "bundled" }, "cs")).toBe("Léčení zranění");
    expect(contentName("spells", { name: "Cure Wounds", source: "homebrew" }, "cs")).toBe("Cure Wounds");
    expect(contentName("spells", { name: "Cure Wounds", source: "srd" }, "en")).toBe("Cure Wounds");
    expect(contentName("items", { name: "Longsword", source: "srd" }, "cs")).toBe("Dlouhý meč");
  });

  it("reads the official Czech spell book only for official spell refs", () => {
    expect(officialCzechSpellPageId({
      kind: "spells", slug: "srd:acid-splash", name: "Acid Splash", source: "srd", rulebook: "acid-splash",
    })).toBe("acid-splash");
    expect(officialCzechSpellPageId({
      kind: "spells", slug: "cure-wounds", name: "Cure Wounds", source: "open5e", documentSlug: "wotc-srd",
    })).toBe("cure-wounds");
    expect(officialCzechSpellPageId({ kind: "spells", slug: "fireball", source: "homebrew" })).toBeNull();
    expect(officialCzechSpellPageId({ kind: "spells", slug: "fireball", source: "open5e", documentSlug: "deep-magic" })).toBeNull();
    expect(officialCzechSpellPageId({ kind: "items", slug: "srd:acid-splash", source: "srd" })).toBeNull();
    expect(officialCzechSpellPageId({ kind: "spells", slug: "../private", source: "srd" })).toBeNull();
  });

  it("localizes item kind, rarity and leaves English and unknown values intact", () => {
    expect(itemPickerKindLabel("magic_item", "cs")).toBe("Magický předmět");
    expect(itemPickerKindLabel("weapon", "cs")).toBe("Zbraň");
    expect(itemPickerKindLabel("armor", "cs")).toBe("Zbroj");
    expect(itemPickerKindLabel("gear", "cs")).toBe("Dobrodružná výbava");
    expect(itemPickerRarityLabel("very_rare", "cs")).toBe("Velmi vzácný");
    expect(itemPickerRarityLabel("uncommon", "cs")).toBe("Neobvyklý");
    expect(itemPickerMeta({ kind: "magic_item", rarity: "rare" }, "cs", x => x)).toBe("Magický předmět · Vzácný");
    expect(itemPickerMeta({ kind: "gear", cost: "2 gp" }, "cs", x => x)).toBe("Dobrodružná výbava · 2 gp");
    expect(itemPickerMeta({ kind: "magic_item", rarity: "rare" }, "en", x => x)).toBe("magic_item · rare");
    expect(itemPickerKindLabel("aether_tool", "cs")).toBe("aether_tool");
  });

  it("collapses only explicitly equivalent feats and retains distinct homebrew feats", () => {
    const rows = [
      { name: "Attentive", source: "open5e", slug: "one" },
      { name: "Alert", source: "open5e", slug: "two" },
      { name: "Hardy Adventurer", source: "open5e", slug: "three" },
      { name: "Tough", source: "open5e", slug: "four" },
      { name: "Alert", source: "homebrew", slug: "custom" },
      { name: "Battle Caster", source: "open5e", slug: "another" },
      { name: "War Caster", source: "open5e", slug: "last" },
    ];
    const unique = uniquePlayableFeatRows(rows);
    expect(unique.map(row => row.slug)).toEqual(["two", "four", "custom", "another", "last"]);
    expect(featPickerKey("Attentive")).toBe(featPickerKey("Alert"));
    expect(featPickerKey("Battle Caster")).not.toBe(featPickerKey("War Caster"));
    expect(featPickerKey("Alert", "homebrew")).not.toBe(featPickerKey("Alert"));
  });
});
