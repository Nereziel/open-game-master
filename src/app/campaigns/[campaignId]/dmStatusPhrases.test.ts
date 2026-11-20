import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import csCatalog from "@/lib/i18n/cs.json";
import { installCatalog } from "@/lib/i18n/translate";
import { localeTag } from "@/lib/messages-logic";
import { DM_STATUS_PHRASES, DM_STATUS_PHRASES_FR, dmStatusPhrase } from "./dmStatusPhrases";
import type { DmStatus } from "./useCampaignStream";

installCatalog("cs", csCatalog);

describe("localized DM progress messages", () => {
  const statuses = Object.keys(DM_STATUS_PHRASES) as Array<Exclude<DmStatus, "idle">>;

  it("includes Czech in the language variants", () => {
    expect(localeTag("cs")).toBe("cs-CZ");
    expect(dmStatusPhrase("cs", "idle", "turn")).toBe("");
    expect(dmStatusPhrase("fr", "idle", "turn")).toBe("");
  });

  for (const status of statuses) {
    it(`has a Czech translation for every ${status} message`, () => {
      const english = DM_STATUS_PHRASES[status];
      const french = DM_STATUS_PHRASES_FR[status];
      expect(french.length).toBe(english.length);

      for (const phrase of english) {
        const translation = csCatalog.messages[phrase as keyof typeof csCatalog.messages];
        expect(translation, `Missing Czech: ${phrase}`).toBeTruthy();
        expect(translation).not.toBe(phrase);
      }

      // Each status picks a deterministic index from the message id.
      // Vary the ids to exercise all variants instead of checking just one.
      const variants = new Set(
        Array.from({ length: 256 }, (_, index) => dmStatusPhrase("cs", status, `turn-${index}`)),
      );
      expect(variants.size).toBe(english.length);
      for (const phrase of english) {
        expect(variants.has(csCatalog.messages[phrase as keyof typeof csCatalog.messages])).toBe(true);
      }
      expect(dmStatusPhrase("fr", status, "same-turn")).toMatch(/\S/u);
      expect(dmStatusPhrase("en", status, "same-turn")).toMatch(/\S/u);
    });
  }


  it("uses complete Latin Extended webfonts for Czech labels and headings", () => {
    const css = readFileSync(new URL("../../globals.css", import.meta.url), "utf8");
    const fonts = readFileSync(new URL("../../styles/fonts.css", import.meta.url), "utf8");
    expect(css).toContain('@import "./styles/fonts.css"');
    for (const name of ["--font-ui", "--font-source-serif", "--font-display", "--font-code-face"]) {
      expect(fonts, `No webfont family for ${name}`).toContain(`${name}:`);
    }
    expect(fonts).toContain("unicode-range: U+0100-02BA");
    expect(fonts).toContain("../fonts/cinzel-latin-ext.woff2");
  });

  it("keeps animated dice digits out of text selection", () => {
    const spinner = readFileSync(new URL("../../../components/ui/D20Spinner.tsx", import.meta.url), "utf8");
    expect(spinner).toContain("select-none");
  });

  it("renders the reported d20 phrase in Czech", () => {
    const phrase = "Somewhere, a d20 holds its breath…";
    expect(csCatalog.messages[phrase as keyof typeof csCatalog.messages]).toBe("Kdesi i dvacetistěnná kostka tají dech…");
  });
});
