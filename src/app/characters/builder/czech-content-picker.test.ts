import { describe, expect, it } from "vitest";
import authoredFeats from "@/lib/srd/authored-feats.json";
import { CS_NAMES_BY_TABLE } from "@/lib/content/names-cs";
import { installCsTables } from "@/lib/i18n/cs-tables";
import { contentName } from "@/lib/content/names";
import { builtinFeatSummaryCs } from "@/lib/help/feat-summary-cs";
import { thirdPartyItemSummaryCs } from "@/lib/help/third-party-item-summary-cs";
import { contentRefMatches, sameContentDocument } from "@/lib/help/content-ref-match";
import { thirdPartySpellSummaryCs, localizedThirdPartySpellDescription } from "@/lib/help/third-party-spell-summary-cs";
import { thirdPartyFeatDescriptionCs } from "@/lib/help/third-party-feat-description-cs";
import { thirdPartyFullRulesCs, THIRD_PARTY_FULL_RULES_CS_COUNTS } from "@/lib/help/third-party-full-rules-cs";
import { thirdPartyCzechPickerQueries } from "@/lib/content/third-party-names-cs";
import { officialCzechSpellPageId } from "@/lib/help/official-cs-reference";
import { itemPickerKindLabel, itemPickerMeta, itemPickerRarityLabel } from "@/lib/help/item-picker-labels";
import { featPickerKey, uniquePlayableFeatRows } from "./feat-picker-logic";
import { appendCzechPickerMatches, czechPickerQueries } from "./czech-picker-search";

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

  it("localizes verified Tome of Heroes entries only for that Open5e document", () => {
    const tohItem = { name: "Clockwork Crossbow", slug: "clockwork-crossbow", source: "open5e", documentSlug: "toh" };
    const tohSpell = { name: "Fuse Armor", slug: "fuse-armor", source: "open5e", documentSlug: "toh" };
    expect(contentName("items", tohItem, "cs")).toBe("Mechanická kuše");
    expect(contentName("spells", tohSpell, "cs")).toBe("Znehybnění kovu");
    expect(contentName("items", { ...tohItem, documentSlug: "wotc-srd" }, "cs")).toBe("Clockwork Crossbow");
    expect(contentName("items", { ...tohItem, documentSlug: "another-book" }, "cs")).toBe("Clockwork Crossbow");
    expect(contentName("items", { ...tohItem, source: "homebrew" }, "cs")).toBe("Clockwork Crossbow");
    expect(contentName("items", tohItem, "en")).toBe("Clockwork Crossbow");
    expect(contentName("items", "Clockwork Crossbow", "cs")).toBe("Clockwork Crossbow");
    expect(contentName("spells", { ...tohSpell, documentSlug: "other-book" }, "cs")).toBe("Fuse Armor");
    expect(contentName("spells", { name: "Heart to Heart", source: "open5e", documentSlug: "toh" }, "cs")).toBe("Heart to Heart");
    expect(contentName("spells", { name: "Instant Snare", source: "open5e", documentSlug: "toh" }, "cs")).toBe("Instant Snare");
    const verifiedSpellNames: Array<[string, string]> = [
      ["Secret Blind", "Skrytý úkryt"],
      ["Pincer", "Klešťový úder"],
      ["Lightless Torch", "Pochodeň temnovidu"],
      ["Long Game", "Odložená odplata"],
      ["Stone Fetch", "Kamenný dvojník"],
      ["Clear The Board", "Rozdělení bojiště"],
      ["Wild Hunt", "Divoký hon"],
      ["Mud", "Vazké bahno"],
    ];
    for (const [english, translated] of verifiedSpellNames) {
      const reference = { name: english, source: "open5e", documentSlug: "toh" };
      expect(contentName("spells", reference, "cs")).toBe(translated);
      expect(contentName("spells", { ...reference, source: "homebrew" }, "cs")).toBe(english);
      expect(contentName("spells", { ...reference, documentSlug: "deepm" }, "cs")).toBe(english);
    }

    expect(czechPickerQueries("items", "mechanicka kuse", CS_NAMES_BY_TABLE)).toContain("Clockwork Crossbow");
    expect(czechPickerQueries("spells", "znehybneni kovu", CS_NAMES_BY_TABLE)).toContain("Fuse Armor");
    expect(contentName("feats", { name: "Boundless Reserves", source: "open5e", documentSlug: "toh" }, "cs"))
      .toBe("Nevyčerpatelné zásoby");
    expect(contentName("spells", { name: "Acid Gate", source: "open5e", documentSlug: "deepm" }, "cs"))
      .toBe("Kyselinová brána");
    expect(contentName("spells", { name: "Acid Gate", source: "homebrew", documentSlug: "deepm" }, "cs"))
      .toBe("Acid Gate");
    expect(czechPickerQueries("spells", "kyselinova brana", CS_NAMES_BY_TABLE)).toContain("Acid Gate");
    expect(contentName("items", { name: "Bag of Traps", source: "open5e", documentSlug: "vom" }, "cs"))
      .toBe("Vak pastí");
    expect(contentName("items", { name: "Bag of Traps", source: "open5e", documentSlug: "toh" }, "cs"))
      .toBe("Bag of Traps");
    expect(contentName("items", { name: "Air Seed", source: "open5e", documentSlug: "vom" }, "cs"))
      .toBe("Vzdušné semínko");
    expect(czechPickerQueries("items", "vak pasti", CS_NAMES_BY_TABLE)).toContain("Bag of Traps");
    expect(thirdPartyItemSummaryCs({ name: "Air Seed", source: "open5e", documentSlug: "vom" }, "cs"))
      .toContain("dýchatelný vzduch");
    expect(thirdPartyItemSummaryCs({ name: "Air Seed", source: "homebrew", documentSlug: "vom" }, "cs"))
      .toBeNull();
    expect(thirdPartyItemSummaryCs(tohItem, "cs")).toContain("šest střel");
    expect(thirdPartyItemSummaryCs({ ...tohItem, documentSlug: "other-book" }, "cs")).toBeNull();
    expect(thirdPartyItemSummaryCs(tohItem, "en")).toBeNull();
  });

  it("shows Czech supplement spell explanations only for matching books", () => {
    const ref = { kind: "spells", name: "Fuse Armor", source: "open5e", documentSlug: "toh" };
    expect(thirdPartySpellSummaryCs(ref, "cs")).toContain("kovové části");
    const rendered = localizedThirdPartySpellDescription(ref, "cs", "Original complete rule mechanics.");
    expect(rendered).toContain("Stručný český přehled");
    expect(rendered).toContain("Original complete rule mechanics.");
    expect(localizedThirdPartySpellDescription(ref, "en", "Original rules.")).toBe("Original rules.");
    expect(thirdPartySpellSummaryCs({ ...ref, source: "homebrew" }, "cs")).toBeNull();
    expect(thirdPartySpellSummaryCs({ ...ref, documentSlug: "deepm" }, "cs")).toBeNull();
    expect(localizedThirdPartySpellDescription({ ...ref, documentSlug: "deepm" }, "cs", "Different rules."))
      .toBe("Different rules.");
    expect(thirdPartySpellSummaryCs({ kind: "feats", name: "Fuse Armor", source: "open5e", documentSlug: "toh" }, "cs")).toBeNull();
    expect(thirdPartySpellSummaryCs({ kind: "spells", name: "Unknown Spell", source: "open5e", documentSlug: "toh" }, "cs")).toBeNull();
  });

  it("does not mix content with the same title from different publishers", () => {
    const reference = { kind: "spells", slug: "fuse-armor", name: "Fuse Armor", source: "open5e", documentSlug: "toh" };
    expect(sameContentDocument(reference, { name: "Fuse Armor", source: "open5e", documentSlug: "toh" })).toBe(true);
    expect(sameContentDocument(reference, { name: "Fuse Armor", source: "open5e", documentSlug: "deepm" })).toBe(false);
    expect(sameContentDocument(reference, { name: "Fuse Armor", source: "homebrew", documentSlug: "toh" })).toBe(false);
    expect(contentRefMatches(reference, { name: "Fuse Armor", source: "open5e", documentSlug: "toh" })).toBe(true);
    expect(contentRefMatches(reference, { name: "Other Spell", source: "open5e", documentSlug: "toh" })).toBe(false);
    expect(contentRefMatches({ slug: "custom-id", source: "homebrew" }, { name: "Custom", slug: "custom-id", source: "homebrew" })).toBe(true);
  });

  it("provides full source-scoped Czech mechanics for all thirteen Tome of Heroes feats", () => {
    const names = [
      "Boundless Reserves", "Diehard", "Floriographer", "Forest Denizen",
      "Friend of the Forest", "Giant Foe", "Harrier", "Inner Resilience",
      "Part of the Pack", "Rimecaster", "Sorcerous Vigor", "Stalker", "Stunning Sniper",
    ];
    for (const name of names) {
      const ref = { kind: "feats", name, source: "open5e", documentSlug: "toh" };
      const full = thirdPartyFeatDescriptionCs(ref, "cs");
      expect(full?.length, name).toBeGreaterThan(85);
      expect(thirdPartyFeatDescriptionCs(ref, "en")).toBeNull();
      expect(thirdPartyFeatDescriptionCs({ ...ref, source: "homebrew" }, "cs")).toBeNull();
      expect(thirdPartyFeatDescriptionCs({ ...ref, documentSlug: "deepm" }, "cs")).toBeNull();
      expect(thirdPartyCzechPickerQueries("feats", contentName("feats", ref, "cs"), 6)).toContain(name);
    }
    expect(thirdPartyFeatDescriptionCs({ kind: "feats", name: "Unknown", source: "open5e", documentSlug: "toh" }, "cs")).toBeNull();
    expect(thirdPartyFeatDescriptionCs({ kind: "spells", name: "Diehard", source: "open5e", documentSlug: "toh" }, "cs")).toBeNull();
  });

  it("keeps complete Tome of Heroes names and descriptions, plus verified partial supplements", () => {
    const tohItems = [
      "Axespear", "Clockwork Crossbow", "Khopesh", "Wrist Knife",
      "Esquire's Rowels", "Soulbound Wraps", "Stasis Stone", "Victory Banner",
      "Dwarven Arquebus", "Brigandine", "Stonesteel",
    ];
    for (const name of tohItems) {
      const ref = { source: "open5e", documentSlug: "toh", name };
      expect(contentName("items", ref, "cs"), name).not.toBe(name);
      expect(thirdPartyItemSummaryCs(ref, "cs")?.length, name).toBeGreaterThan(35);
    }
    const deepRef = { kind: "spells", name: "Acid Gate", source: "open5e", documentSlug: "dmag" };
    expect(contentName("spells", deepRef, "cs")).toBe("Kyselinová brána");
    expect(thirdPartySpellSummaryCs(deepRef, "cs")).toContain("portál");
    expect(thirdPartySpellSummaryCs({ ...deepRef, documentSlug: "deepm" }, "cs")).toContain("portál");
    expect(thirdPartySpellSummaryCs({ ...deepRef, documentSlug: "toh" }, "cs")).toBeNull();
    const vaultRef = { name: "Bloodthirsty Weapon", source: "open5e", documentSlug: "vom" };
    expect(thirdPartyItemSummaryCs(vaultRef, "cs")).toContain("2k6");
    expect(thirdPartyItemSummaryCs({ ...vaultRef, documentSlug: "toh" }, "cs")).toBeNull();
    expect(thirdPartyItemSummaryCs(vaultRef, "en")).toBeNull();
    expect(contentName("spells", { name: "Heart to Heart", source: "open5e", documentSlug: "toh" }, "cs")).toBe("Heart to Heart");
    expect(thirdPartySpellSummaryCs({ kind: "spells", name: "Instant Snare", source: "open5e", documentSlug: "toh" }, "cs")).toBeNull();
  });

  it("delivers complete Czech supplement rules only for the exact book, kind and language", () => {
    expect(THIRD_PARTY_FULL_RULES_CS_COUNTS).toEqual({ tomeSpells: 14, vaultItems: 15 });
    const tome = { kind: "spells", name: "Spite", source: "open5e", documentSlug: "toh" };
    const text = thirdPartyFullRulesCs(tome, "cs");
    expect(text).toContain("Vyvolání:");
    expect(text).toContain("Složky:");
    expect(text).toContain("Trvání:");
    expect(text).toContain("Na vyšších úrovních.");
    expect(text).toContain("1k6");
    expect(thirdPartyFullRulesCs({ ...tome, documentSlug: "deepm" }, "cs")).toBeNull();
    expect(thirdPartyFullRulesCs({ ...tome, source: "homebrew" }, "cs")).toBeNull();
    expect(thirdPartyFullRulesCs({ ...tome, kind: "items" }, "cs")).toBeNull();
    expect(thirdPartyFullRulesCs(tome, "en")).toBeNull();

    const vault = { kind: "items", name: "Broom of Sweeping", source: "open5e", documentSlug: "vom" };
    expect(thirdPartyFullRulesCs(vault, "cs")).toContain("5 krychlových stop");
    expect(thirdPartyFullRulesCs({ ...vault, documentSlug: "toh" }, "cs")).toBeNull();
    expect(thirdPartyFullRulesCs({ ...vault, name: "Nonexistent" }, "cs")).toBeNull();
    expect(thirdPartyFullRulesCs(vault, "en")).toBeNull();

    const completeTomeSpells = [
      "Lance", "Feint", "Sneer", "Spite", "Misdirection", "Oversized Paws",
      "Sightburst", "Stone Aegis", "Less Fool, I", "Retribution",
      "Sacrifice Pawn", "Sacrificial Healing", "Crown of Thorns", "Convey Inner Peace",
    ];
    for (const name of completeTomeSpells) {
      const complete = thirdPartyFullRulesCs({ ...tome, name }, "cs");
      expect(complete?.length, name).toBeGreaterThan(140);
      expect(complete, name).toContain("Vyvolání:");
      expect(complete, name).toContain("Dosah:");
    }
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

  it("searches Czech spell, item and feat names against canonical English IDs", () => {
    expect(czechPickerQueries("spells", "leceni", CS_NAMES_BY_TABLE))
      .toContain("cure wounds");
    expect(czechPickerQueries("items", "dlouhy mec", CS_NAMES_BY_TABLE))
      .toContain("longsword");
    expect(czechPickerQueries("feats", "ostrostrelec", CS_NAMES_BY_TABLE))
      .toContain("sharpshooter");
    // The Open5e weapon slug is reversed; the API expects "Light Crossbow".
    expect(czechPickerQueries("items", "lehka kuse", CS_NAMES_BY_TABLE))
      .toContain("light crossbow");
    expect(czechPickerQueries("feats", "a", CS_NAMES_BY_TABLE)).toEqual([]);
    expect(czechPickerQueries("unrecognized", "leceni", CS_NAMES_BY_TABLE)).toEqual([]);
    expect(czechPickerQueries("spells", "nejaka-vlastni-homebrew", CS_NAMES_BY_TABLE)).toEqual([]);
  });

  it("keeps Czech matches when an English query returned other rows", () => {
    const EnglishMatches = [{ name: "Leceni's Tonic", source: "homebrew", slug: "own" }];
    const localized = [
      { name: "Cure Wounds", source: "srd", slug: "srd:cure-wounds" },
      { name: "Magic Missile", source: "srd", slug: "srd:magic-missile" },
      { name: "Cure Wounds", source: "homebrew", slug: "custom" },
    ];
    const combined = appendCzechPickerMatches("spells", "leceni", EnglishMatches, localized);
    expect(combined.map((row) => row.slug)).toEqual(["own", "srd:cure-wounds"]);
    expect(appendCzechPickerMatches("items", "lehka kuse", [], [
      { name: "Light Crossbow", source: "open5e", slug: "crossbow-light" },
    ])).toHaveLength(1);
    expect(appendCzechPickerMatches("classes", "leceni", EnglishMatches, localized)).toEqual(EnglishMatches);
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
