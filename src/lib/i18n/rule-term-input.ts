import { textKey } from "../language/text-logic.ts";
import type { TranslateVars } from "./translate.ts";

type T = (key: string, vars?: TranslateVars) => string;

// Only complete, unambiguous vocabulary entries may become engine keys.
// Never translate a substring, a compound damage expression or custom prose.
export function ruleTermOptions(known: readonly string[], t: T): { value: string; label: string }[] {
  return known.map((value) => ({ value, label: t(value, { context: "glossary.option" }) }));
}

export function canonicalRuleTerm(input: string, options: readonly { value: string; label: string }[]): string {
  const key = textKey(input);
  if (!key) return input;
  const canonical = options.find((option) => textKey(option.value) === key);
  if (canonical) return canonical.value;
  const matches = options.filter((option) => textKey(option.label) === key);
  return matches.length === 1 ? matches[0].value : input;
}

export function ruleTermLabel(value: string, options: readonly { value: string; label: string }[]): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
