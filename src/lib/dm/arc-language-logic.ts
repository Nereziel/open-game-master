// Story plans use English JSON keys and enum values even at a Czech table.
// Read only story prose, never the keys, enum values or entity names, when
// checking whether the model ignored the campaign's output language.
import { englishNarrationAtCzechTable } from "./table-language-logic.ts";
import type { TableLanguage } from "../schemas/game-settings-options.ts";

const PROSE_KEYS = new Set([
  "title", "premise", "stakes", "antagonist", "milestone", "finale",
  "detail", "role", "agenda", "goal", "hook", "hooks",
  "text", "trigger", "subtitle", "recap", "summary",
  "beats", "allies", "place",
]);

function storyProse(input: unknown, key: string | null, lines: string[]): void {
  if (typeof input === "string") {
    if (key && PROSE_KEYS.has(key)) lines.push(input);
    return;
  }
  if (Array.isArray(input)) {
    for (const entry of input) storyProse(entry, key, lines);
    return;
  }
  if (!input || typeof input !== "object") return;
  for (const [field, value] of Object.entries(input)) storyProse(value, field, lines);
}

export function englishArcPlanningAtCzechTable(plan: unknown, language: TableLanguage): boolean {
  if (language !== "czech") return false;
  const lines: string[] = [];
  storyProse(plan, null, lines);
  return lines.some((line) => englishNarrationAtCzechTable(line, language)) ||
    englishNarrationAtCzechTable(lines.join("\n"), language);
}

// The system instruction is kept, but on agent backends the last user
// message can carry more weight. This reminder is used for every arc pass.
// Do not demand Czech JSON keys or translated enum values: parsers need
// their exact English spellings.
export function arcPlanningLanguageRequest(prompt: string, language: TableLanguage): string {
  if (language !== "czech") return prompt;
  return `${prompt}\n\nMANDATORY OUTPUT LANGUAGE: Write ALL newly generated human-readable story text INSIDE the JSON in natural Czech. This includes every act milestone, beat, waypoint, event description, premise, stake, finale, NPC agenda and hook. English input descriptions and examples are NOT the output language. Keep JSON property names, enum values, and names already established in the world exactly as given. Output only the JSON object, without Markdown.`;
}
