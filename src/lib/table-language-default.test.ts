import { describe, expect, it } from "vitest";
import { newTableLanguage, tableLanguageForLocale } from "./table-language-default";

describe("language defaults for newly created campaigns", () => {
  it("follows the Czech and French interface rather than English defaults", () => {
    expect(tableLanguageForLocale("cs")).toBe("czech");
    expect(tableLanguageForLocale("fr")).toBe("french");
    expect(tableLanguageForLocale("en")).toBe("english");
  });

  it("never resets a Czech or French interface to English from server capabilities", () => {
    expect(newTableLanguage("cs", "english")).toBe("czech");
    expect(newTableLanguage("fr", "english")).toBe("french");
    expect(newTableLanguage("cs", "czech")).toBe("czech");
    expect(newTableLanguage("cs", null)).toBe("czech");
  });

  it("honors a configured server language for an English interface", () => {
    expect(newTableLanguage("en", "czech")).toBe("czech");
    expect(newTableLanguage("en", "french")).toBe("french");
    expect(newTableLanguage("en", "english")).toBe("english");
    expect(newTableLanguage("en", undefined)).toBe("english");
  });
});
