import type { TranslateVars } from "./translate.ts";

type T = (key: string, vars?: TranslateVars) => string;
const termKey = (text: string) => text.trim().normalize("NFC").toUpperCase().toLowerCase();

// Only complete, unambiguous vocabulary entries may become engine keys.
// Never translate a substring, a compound damage expression or custom prose.
export function ruleTermOptions(known: readonly string[], t: T): { value: string; label: string }[] {
  return known.map((value) => ({ value, label: t(value, { context: "glossary.option" }) }));
}

export function canonicalRuleTerm(input: string, options: readonly { value: string; label: string }[]): string {
  const key = termKey(input);
  if (!key) return input;
  const canonical = options.find((option) => termKey(option.value) === key);
  if (canonical) return canonical.value;
  const matches = options.filter((option) => termKey(option.label) === key);
  return matches.length === 1 ? matches[0].value : input;
}

export function ruleTermLabel(value: string, options: readonly { value: string; label: string }[]): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

// Preserve the punctuation and spacing of list fields. A compound clause
// such as "fire from nonmagical attacks" is not a vocabulary entry.
export function canonicalRuleTermList(input: string, options: readonly { value: string; label: string }[]): string {
  return input.replace(/[^,;]+/g, (segment) => {
    const term = segment.trim();
    if (!term) return segment;
    const canonical = canonicalRuleTerm(term, options);
    return canonical === term ? segment : segment.replace(term, canonical);
  });
}
