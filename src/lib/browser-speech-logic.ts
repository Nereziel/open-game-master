import type { TableLanguage } from "@/lib/schemas/game-settings-options";

// Web Speech voices come from the browser/OS, not from the Open Game Master
// speech service. Keep language and text handling pure for regression tests.
const LANGUAGE_TAGS: Record<TableLanguage, string> = {
  english: "en-US",
  czech: "cs-CZ",
  danish: "da-DK",
  dutch: "nl-NL",
  finnish: "fi-FI",
  french: "fr-FR",
  german: "de-DE",
  hungarian: "hu-HU",
  indonesian: "id-ID",
  irish: "ga-IE",
  italian: "it-IT",
  norwegian: "nb-NO",
  portuguese: "pt-PT",
  russian: "ru-RU",
  spanish: "es-ES",
  swedish: "sv-SE",
};

export function browserSpeechLanguage(language: TableLanguage): string {
  return LANGUAGE_TAGS[language];
}

export type BrowserVoice = { voiceURI: string; lang: string };

// The stream can rerender or re-fetch older messages at any time. Only new
// completed story lines after the first snapshot are offered to Web Speech.
export function liveBrowserPassages<T extends { seq: number; authorType: string; content: string }>(
  messages: readonly T[],
  sinceSeq: number,
): T[] {
  return messages
    .filter((message) =>
      message.seq > sinceSeq &&
      message.authorType === "dm" &&
      !message.content.startsWith("(ooc)") &&
      Boolean(message.content.trim()),
    )
    .sort((a, b) => a.seq - b.seq);
}


export function preferredBrowserVoice<T extends BrowserVoice>(
  voices: readonly T[],
  savedVoice: string,
  language: string,
): T | null {
  const chosen = savedVoice && voices.find((voice) => voice.voiceURI === savedVoice);
  if (chosen) return chosen;
  const target = language.toLowerCase();
  return (
    voices.find((voice) => voice.lang.toLowerCase() === target) ??
    voices.find((voice) => voice.lang.toLowerCase().split("-")[0] === target.split("-")[0]) ??
    null
  );
}

// Remove markup that reads poorly aloud. This runs only in the browser; it
// never posts the campaign's prose or a player-authored line anywhere.
export function browserSpeechText(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/(?:^|\n)\s{0,3}#{1,6}\s*/g, ". ")
    .replace(/[\u0060*_~]/g, "")
    .replace(/\r?\n+/g, ". ")
    .replace(/\s+/g, " ")
    .replace(/^(?:\.\s*)+/, "")
    .trim();
}

// Several engines silently stop on long utterances. Keep each request
// comfortably below that limit and split at a sentence or word boundary.
export function browserSpeechChunks(input: string, limit = 180): string[] {
  const text = browserSpeechText(input);
  if (!text) return [];
  const result: string[] = [];
  let current = "";
  const push = () => {
    if (current.trim()) result.push(current.trim());
    current = "";
  };
  for (const sentence of text.split(/(?<=[.!?])\s+/u)) {
    let rest = sentence;
    while (rest.length) {
      const available = limit - (current ? current.length + 1 : 0);
      if (available <= 0) {
        push();
        continue;
      }
      if (rest.length <= available) {
        current += (current ? " " : "") + rest;
        break;
      }
      if (current) {
        push();
        continue;
      }
      const split = rest.lastIndexOf(" ", available);
      const at = split > 0 ? split : available;
      result.push(rest.slice(0, at).trim());
      rest = rest.slice(at).trimStart();
    }
  }
  push();
  return result;
}
