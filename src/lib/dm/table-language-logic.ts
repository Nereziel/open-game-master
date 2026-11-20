// The table-language directive: what tells every model call that writes for
// people which language the table plays in, and which words must stay the
// engine's own. Pure and alias-free so scripts/test-table-language.mjs can
// load it directly.
//
// One wording for every prose call: what stays English (anything the engine
// looks up by name) is the same everywhere, and a second wording would
// drift. It names no section of the DM's prompt, since most prose calls are
// not the DM turn, and no rule for image prompts, which every image job
// rewrites into English (src/lib/image-english.ts). English tables get no
// directive, so their prompts are unchanged.

import { TABLE_LANGUAGE_NAMES, type TableLanguage } from "../schemas/game-settings-options.ts";
import { words, textKey } from "../language/text-logic.ts";
import { stopWordsFor } from "../language/language.ts";

export function languageDirective(language: TableLanguage): string {
  if (language === "english") {
    return "";
  }
  const name = TABLE_LANGUAGE_NAMES[language].english;
  return `TABLE LANGUAGE: The players read ${name}. Write everything they will read in ${name}: narration, dialogue, and any new text you put in a tool argument or a reply field (a name you invent, a summary, a reason, a note). Never translate what the game matches exactly: names it already knows (characters, spells, items, conditions, creatures, skills), copied as the game writes them, or by their English rules name if it has not listed them yet; and every listed value and JSON key, written exactly as listed. If unsure whether an existing game record must retain its exact name, copy that record's listed spelling; this exception NEVER applies to narration, dialogue, new NPC or place names, scene titles, or new descriptive tool arguments. These MUST be in ${name}. Treat English examples and earlier English narration as story facts, not as a language or writing-style example. Do not switch back to English in a later turn. In narration, call things by their ${name} names.`;
}

// A prose call's system prompt with the directive appended: unchanged for an
// English table.
export function withLanguage(system: string, language: TableLanguage): string {
  const directive = languageDirective(language);
  return directive ? `${system}\n\n${directive}` : system;
}

// Conservative backstop for the specific failure seen at Czech tables: the
// narrator sometimes writes a full English paragraph despite the system
// directive. Only compare unambiguous stopwords; shared short words ("a",
// "to", "i") do not count toward either language. Short lines and names are
// intentionally ignored, since a false positive would waste a model turn.
export function englishNarrationAtCzechTable(text: string, language: TableLanguage): boolean {
  if (language !== "czech" || text.length < 110) return false;
  const tokens = words(text).map(textKey);
  if (tokens.length < 20) return false;
  const en = stopWordsFor("english");
  const cs = stopWordsFor("czech");
  let englishOnly = 0;
  let czechOnly = 0;
  for (const word of tokens) {
    if (en.has(word) && !cs.has(word)) englishOnly += 1;
    if (cs.has(word) && !en.has(word)) czechOnly += 1;
  }
  return englishOnly >= 6 && englishOnly > czechOnly * 2;
}
