import { describe, expect, it } from "vitest";
import { bookLocaleOf, localeFromAcceptLanguage, rulebookContents, rulebookPage, rulebookPages } from "./book";

describe("Czech SRD companion in the upstream book reader", () => {
  it("selects Czech via headers without changing English or French", () => {
    expect(localeFromAcceptLanguage("cs-CZ,fr;q=0.8,en;q=0.5")).toBe("cs");
    expect(bookLocaleOf(new Request("https://example.test/api/rulebook", {
      headers: { "x-odm-locale": "cs", "accept-language": "fr" },
    }))).toBe("cs");
    expect(localeFromAcceptLanguage("fr-FR")).toBe("fr");
    expect(localeFromAcceptLanguage("en-US")).toBe("en");
  });

  it("preserves all canonical pages and page order across locales", () => {
    const en = rulebookPages("en");
    const fr = rulebookPages("fr");
    const cs = rulebookPages("cs");
    expect(en).toHaveLength(933);
    expect(new Set(en.map(page => page.id)).size).toBe(933);
    expect(cs.map(page => page.id)).toEqual(en.map(page => page.id));
    expect(fr.map(page => page.id)).toEqual(en.map(page => page.id));
    expect(rulebookContents("cs").pageCount).toBe(en.length);
  });

  it("restores the complete Czech SRD texts without changing English mechanics", () => {
    const en = rulebookPages("en");
    const cs = rulebookPages("cs");
    const full = cs.filter(page => page.md.includes("## Úplné znění pravidel v češtině"));
    expect(full).toHaveLength(932);
    for (let i = 0; i < en.length; i += 1) {
      expect(cs[i].kind).toBe(en[i].kind);
      expect(cs[i].chapter).toBe(en[i].chapter);
      if (cs[i].md !== en[i].md) {
        expect(cs[i].md.endsWith(en[i].md)).toBe(true);
      }
    }
    expect(rulebookPage("combat", "cs")?.page.md).toContain("Úplné znění pravidel v češtině");
    expect(rulebookPage("combat", "en")?.page.md).not.toContain("Úplné znění pravidel v češtině");
  });
});
