import { describe, expect, it } from "vitest";
import { SRD_SKILLS, skillLabel } from "@/lib/srd";
import { pdfLabel } from "@/lib/pdf/labels";
import { CZECH_SKILLS as READER_SKILLS } from "@/lib/rulebook/czech-terms";
import { CS_SKILLS } from "./common/cs";

describe("D&D 5e (2014) skill terminology shared by sheet, PDF and reader (#107)", () => {
  it("uses every d20.cz skill name consistently without changing canonical IDs", () => {
    expect(SRD_SKILLS).toHaveLength(18);
    for (const skill of SRD_SKILLS) {
      const expected = CS_SKILLS[skill.name as keyof typeof CS_SKILLS];
      expect(expected, `missing common translation: ${skill.name}`).toBeTruthy();
      expect(skillLabel(skill.id, "cs")).toBe(expected);
      expect(pdfLabel("cs", skill.name)).toBe(expected);
      expect(READER_SKILLS[skill.name]).toBe(expected);
      expect(skillLabel(skill.id, "en")).toBe(skill.name);
    }
  });

  it("retains unknown skill identifiers instead of modifying engine inputs", () => {
    expect(skillLabel("unknown-custom-skill", "cs")).toBe("unknown-custom-skill");
    expect(skillLabel("unknown-custom-skill", "en")).toBe("unknown-custom-skill");
  });
});
