import { describe, expect, it } from "vitest";
import { browserSpeechChunks, browserSpeechLanguage, browserSpeechText, liveBrowserPassages, preferredBrowserVoice } from "./browser-speech-logic";

describe("browser Web Speech narration", () => {
  it("only narrates new GM story lines and keeps stream sequence order", () => {
    const messages = [
      { seq: 5, authorType: "dm", content: "Old passage" },
      { seq: 8, authorType: "dm", content: "New passage" },
      { seq: 6, authorType: "dm", content: "(ooc) Answer to a question" },
      { seq: 7, authorType: "system", content: "System line" },
      { seq: 9, authorType: "dm", content: " " },
    ];
    expect(liveBrowserPassages(messages, 5).map((line) => line.content)).toEqual(["New passage"]);
  });

  it("uses Czech for a Czech-language table", () => {
    expect(browserSpeechLanguage("czech")).toBe("cs-CZ");
  });

  it("picks a matching Czech voice, then an explicit installed one", () => {
    const voices = [
      { voiceURI: "english", lang: "en-US" },
      { voiceURI: "czech", lang: "cs-CZ" },
      { voiceURI: "czech-generic", lang: "cs" },
    ];
    expect(preferredBrowserVoice(voices, "", "cs-CZ")?.voiceURI).toBe("czech");
    expect(preferredBrowserVoice(voices, "english", "cs-CZ")?.voiceURI).toBe("english");
    expect(preferredBrowserVoice(voices, "missing", "cs-SK")?.voiceURI).toBe("czech");
    expect(preferredBrowserVoice(voices, "", "fr-FR")).toBeNull();
  });

  it("removes Markdown formatting without deleting spoken words", () => {
    expect(browserSpeechText("## Příběh\n**Ahoj**, [rytíři](https://example.org)!")).toBe("Příběh. Ahoj, rytíři!");
  });

  it("chunks long narration on word boundaries without losing text", () => {
    const source = "Z lesa se ozval tichý hlas. ".repeat(30);
    const chunks = browserSpeechChunks(source);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 180)).toBe(true);
    expect(chunks.join(" ")).toBe(browserSpeechText(source));
  });

  it("ignores empty passages and long unbroken words are also bounded", () => {
    expect(browserSpeechChunks("  ")).toEqual([]);
    const chunks = browserSpeechChunks("a".repeat(450));
    expect(chunks.map((chunk) => chunk.length)).toEqual([180, 180, 90]);
  });
});
