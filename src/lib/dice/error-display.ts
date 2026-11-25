// Translate known dice validation diagnostics only at the reader boundary.
// Dice parser messages, expressions, raw terms and RNG behavior stay canonical.
import { formatMessage, type MessageVars } from "../messages-logic.ts";
type T = (key: string, vars?: MessageVars) => string;

const STATIC = new Set([
  "Empty dice expression.",
  "Too many terms in dice expression.",
  "Bad dice expression.",
  "Not enough die values for this roll.",
  "Too many die values for this roll.",
]);
const PREFIXES = [
  ["Invalid dice expression: ", "Invalid dice expression: {value}"],
  ["Invalid dice term: ", "Invalid dice term: {value}"],
  ["Dice count out of range in: ", "Dice count out of range in: {value}"],
  ["Die size out of range in: ", "Die size out of range in: {value}"],
  ["Keep count out of range in: ", "Keep count out of range in: {value}"],
  ["Reroll threshold out of range in: ", "Reroll threshold out of range in: {value}"],
  ["Dice count out of range: ", "Dice count out of range: {value}"],
  ["Die size out of range: ", "Die size out of range: {value}"],
] as const;

export function diceErrorDisplay(error: string, t: T = formatMessage): string {
  if (STATIC.has(error)) return t(error);
  for (const [prefix, key] of PREFIXES) {
    if (error.startsWith(prefix)) return t(key, { value: error.slice(prefix.length) });
  }
  const die = /^Die (\d+) must be a whole number from 1 to (\d+)\.$/.exec(error);
  if (die) return t("Die {index} must be a whole number from 1 to {sides}.", { index: die[1], sides: die[2] });
  // Unexpected errors (including invalid RNG values) are not guessed.
  return error;
}
