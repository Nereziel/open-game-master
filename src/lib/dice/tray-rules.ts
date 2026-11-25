// What a player may ask the dice tray to throw.
//
// The tray rolls loose dice for a player: the server throws them and the
// result lands in the table's log under that player's character. So the log
// only ever holds dice. An expression with no die in it is a number the
// player wrote, and one whose flat bonus dwarfs anything a sheet can hold is
// the same thing with a die stapled on. Both are refused before anything is
// stored.
//
// Pure: no database and no alias imports beyond the dice parser.
import { rollExpression } from "../dice.ts";
import { formatMessage, type MessageVars } from "../messages-logic.ts";
import { diceErrorDisplay } from "./error-display.ts";

import { TRAY_MODIFIER_LIMIT } from "./tray-pool.ts";

export { TRAY_MODIFIER_LIMIT };

// Null when the expression may be rolled, otherwise the sentence to refuse
// it with.
export function trayExpressionProblem(expression: string, t: (key: string, vars?: MessageVars) => string = formatMessage): string | null {
  let terms;
  try {
    // A constant face: only the grammar is being read here.
    terms = rollExpression(expression, () => 1).terms;
  } catch (error) {
    return diceErrorDisplay(error instanceof Error ? error.message : "Bad dice expression.", t);
  }
  if (!terms.some((term) => term.kind === "dice")) {
    return t("A roll needs at least one die, such as 1d20+3: a bare number is not a roll.");
  }
  const flat = terms.reduce(
    (sum, term) => (term.kind === "modifier" ? sum + term.sign * term.value : sum),
    0,
  );
  if (Math.abs(flat) > TRAY_MODIFIER_LIMIT) {
    return t("A roll's flat bonus is at most {limit} either way: roll the dice and add the rest at the table.", { limit: TRAY_MODIFIER_LIMIT });
  }
  return null;
}

