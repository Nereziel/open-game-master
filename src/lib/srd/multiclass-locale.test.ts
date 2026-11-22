import { describe, expect, it } from "vitest";
import cs from "@/lib/i18n/cs.json";
import { installCatalog, translate, type Locale } from "@/lib/i18n/translate";
import { describeGrantT, describePrereqT, type MulticlassGrant } from "./multiclass";

installCatalog("cs", cs);

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

  it("keeps unknown homebrew tool names intact", () => {
    const grant: MulticlassGrant = { armor: [], weapons: [], tools: ["aetherwright's kit"] };
    expect(describeGrantT(reader("cs"), grant, "cs")).toContain("Aetherwright's kit");
  });
});
