import { describe, expect, it } from "vitest";
import cs from "@/lib/i18n/cs.json";
import { CS_NAMES_BY_TABLE } from "@/lib/content/names-cs";
import { installCsTables } from "@/lib/i18n/cs-tables";
import { installCatalog, translate, type Locale } from "@/lib/i18n/translate";
import { canMulticlassInto, describeGrantT, describePrereqT, type MulticlassGrant } from "./multiclass";
import { multiclassRefusalLabel } from "./multiclass-labels";

installCatalog("cs", cs);
installCsTables({ names: CS_NAMES_BY_TABLE });

const reader = (locale: Locale) => (key: string, vars?: Record<string, string | number>) =>
  translate(locale, key, vars);

describe("multiclass terminology in Czech", () => {
  it("reads canonical prerequisites in Czech without changing the underlying ability requirements", () => {
    const csText = describePrereqT(reader("cs"), "monk");
    expect(csText).toContain(`${translate("cs", "Dexterity")} 13`);
    expect(csText).toContain(`${translate("cs", "Wisdom")} 13`);
    expect(csText).not.toContain("Dexterity");
    expect(describePrereqT(reader("en"), "monk")).toBe("Dexterity 13 and Wisdom 13");
  });

  it("uses shared armor, weapon and tool labels in grant descriptions", () => {
    const grant: MulticlassGrant = {
      armor: ["light armor"], weapons: ["simple weapons"], tools: ["flute"],
      skillChoice: { count: 1, from: [] },
    };
    const csText = describeGrantT(reader("cs"), grant, "cs");
    expect(csText).toContain("Lehká zbroj");
    expect(csText).toContain("Jednoduché zbraně");
    expect(csText).toContain("Flétna");
    expect(csText).not.toContain("simple weapons");
    const enText = describeGrantT(reader("en"), grant);
    expect(enText).toContain("light armor");
    expect(enText).toContain("simple weapons");
    expect(enText).toContain("Flute");
    expect(grant).toEqual({
      armor: ["light armor"], weapons: ["simple weapons"], tools: ["flute"],
      skillChoice: { count: 1, from: [] },
    });
  });

  it("localizes all five typed refusal reasons but keeps original server errors", () => {
    const abilities = { str: 10, dex: 10, con: 14, int: 10, wis: 16, cha: 10 };
    const fighter = { class: "fighter", level: 1, abilities };
    const cases = [
      { check: canMulticlassInto(fighter, "unknown_example_class"), next: "unknown_example_class", reason: "unknown" },
      { check: canMulticlassInto(fighter, "fighter"), next: "fighter", reason: "already" },
      {
        check: canMulticlassInto({
          ...fighter, classes: [
            { id: "fighter", subclass: "", level: 1 },
            { id: "rogue", subclass: "", level: 1 },
            { id: "bard", subclass: "", level: 1 },
          ],
        }, "cleric"),
        next: "cleric", reason: "limit",
      },
      { check: canMulticlassInto(fighter, "monk"), next: "monk", reason: "new_prereq" },
      { check: canMulticlassInto(fighter, "cleric"), next: "cleric", reason: "held_prereq" },
    ] as const;
    for (const item of cases) {
      expect(item.check.ok).toBe(false);
      expect(item.check.reason).toBe(item.reason);
      expect(item.check.error).toBeTruthy();
      const czech = multiclassRefusalLabel(reader("cs"), item.check, item.next, "cs");
      expect(czech).toBeTruthy();
      expect(czech).not.toBe(item.check.error);
      const english = multiclassRefusalLabel(reader("en"), item.check, item.next, "en");
      expect(english).toBeTruthy();
    }
    expect(cases[4].check.relatedClassId).toBe("fighter");
    expect(multiclassRefusalLabel(reader("cs"), cases[3].check, "monk", "cs"))
      .toContain("Obratnost 13");
    expect(multiclassRefusalLabel(reader("cs"), cases[4].check, "cleric", "cs"))
      .toContain("Bojovník");
    expect(cases[3].check.error).toContain("Multiclassing into");
    expect(multiclassRefusalLabel(reader("cs"), { ok: true }, "monk", "cs")).toBeNull();
  });

  it("keeps unknown homebrew tool names intact", () => {
    const grant: MulticlassGrant = { armor: [], weapons: [], tools: ["aetherwright's kit"] };
    expect(describeGrantT(reader("cs"), grant, "cs")).toContain("Aetherwright's kit");
  });
});
