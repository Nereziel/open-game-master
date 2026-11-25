// Reader-only presentation of canonical engine refusals. Exact matches keep
// unknown engine wording as a fallback; never translate inputs to the engine.
import type { ActKind } from "@/lib/dm/can-act";
import type { TurnBudget } from "@/lib/dm/action-budget";
import type { MessageVars } from "@/lib/messages-logic";
type T = (key: string, vars?: MessageVars) => string;

const KIND_WORDS: Record<ActKind, string> = {
  action: "take an action",
  bonus: "take a bonus action",
  reaction: "take a reaction",
  attack: "attack",
  cast: "cast a spell",
  move: "move",
  free: "act",
};

export function engineRefusalKey(error: string, kind: ActKind, name: string, what: string, t: T): string {
  const act = KIND_WORDS[kind] ?? KIND_WORDS.free;
  const doing = t(KIND_WORDS[kind], { context: "table.hand.gate.verb" });
  if (error === `${name} is dead and cannot ${act}. Only magic that raises the dead brings them back.`) {
    return t("{name} is dead and cannot {what}. Only magic that raises the dead brings them back.", { name, what: doing });
  }
  if (error === `${name} is at 0 HP and cannot ${act}. They act again once they are healed above 0.`) {
    return t("{name} is at 0 HP and cannot {what}. They act again once they are healed above 0.", { name, what: doing });
  }
  const heldPrefix = `${name} is `;
  const stoppedTail = ` and cannot ${act} until the condition ends.`;
  if (error.startsWith(heldPrefix) && error.endsWith(stoppedTail)) {
    const condition = error.slice(heldPrefix.length, error.length - stoppedTail.length);
    if (condition) {
      return t("{name} is {condition} and cannot {what} until the condition ends.", { name, condition: t(condition), what: doing });
    }
  }
  const spellHeldTail = ` and cannot ${act} while it lasts.`;
  if (error.startsWith(heldPrefix) && error.endsWith(spellHeldTail)) {
    const held = error.slice(heldPrefix.length, error.length - spellHeldTail.length);
    if (held) {
      return t("{name} is {held} and cannot {what} while it lasts.", { name, held, what: doing });
    }
  }
  if (error === `${name} is surprised and has no reaction until their first turn has passed.`) {
    return t("{name} is surprised and has no reaction until their first turn has passed.", { name });
  }
  if (error === `${name} is surprised: Feral Instinct lets them act this turn only if they enter their rage before anything else (use_resource rage). They cannot ${act} first.`) {
    return t("{name} is surprised: Feral Instinct lets them act this turn only if they enter their rage before anything else. They cannot {what} first.", { name, what: doing });
  }
  if (error === `${name} is surprised and cannot ${act} in the first round. They act from round 2.`) {
    return t("{name} is surprised and cannot {what} in the first round. They act from round 2.", { name, what: doing });
  }
  if (error === `Initiative is still being rolled, so ${name} cannot ${act} yet. Roll initiative for every character first.`) {
    return t("Initiative is still being rolled, so {name} cannot {what} yet. Roll initiative for every character first.", { name, what: doing });
  }
  const turnTail = `'s turn, not ${name}'s. Off their own turn a character can only use their reaction. What they declared waits for their turn.`;
  if (error.startsWith("It is ") && error.endsWith(turnTail)) {
    // The sentence is "It is {who}" + this tail; the tail already opens with
    // "'s turn", so the who is everything between the prefix and the tail.
    const who = error.slice("It is ".length, error.length - turnTail.length);
    if (who) {
      if (who === "the enemy") return t("It is the enemy's turn, not {name}'s. Off their own turn a character can only use their reaction. What they declared waits for their turn.", { name });
      return t("It is {who}'s turn, not {name}'s. Off their own turn a character can only use their reaction. What they declared waits for their turn.", { who: who === "someone else" ? t("someone else") : who, name });
    }
  }
  const reactionSpent = `${name} has already used their reaction; it comes back at the start of their next turn. ${what} does not happen.`;
  if (error === reactionSpent) {
    return t("{name} has already used their reaction; it comes back at the start of their next turn. {what} does not happen.", { name, what: intentFeature(what, t) });
  }
  return error;
}

// The spend the reaction refusal names: a feature's own name, else the word.
function intentFeature(what: string, t: T): string {
  return what === "The reaction" ? t("The reaction") : what;
}

export function spendActionReason(budget: TurnBudget, kind: "action" | "bonus" | "reaction", what: string, who: string, error: string, t: T, displayWhat = what): string {
  const other = kind === "bonus" ? "action" : "bonus action";
  if (error === `${who} is slowed: an action or a bonus action this turn, not both, and the ${other} is already spent. ${what} does not happen.`) {
    return t("{name} is slowed: an action or a bonus action this turn, not both, and the {other} is already spent. {what} does not happen.", {
      name: who,
      other: (other === "action" ? t("action", { context: "table.hand.gate.word.action" }) : t("bonus action", { context: "table.hand.gate.word.bonus" })),
      what: displayWhat,
    });
  }
  if (kind === "action") {
    const bonus = budget.bonusUsed ? "" : " or take a bonus action";
    if (error === `${who}'s action this turn goes on the spell they are casting (a spell of a minute or more takes their action on each of their turns), so ${what} cannot have it. To act otherwise they stop casting first (clear_condition "concentration"): the spell fails, no slot is spent, and the action is theirs again. They can still move${bonus}.`) {
      return t("{name}'s action this turn goes on the spell they are casting (a spell of a minute or more takes their action on each of their turns), so {what} cannot have it. To act otherwise they stop casting first: the spell fails, no slot is spent, and the action is theirs again. They can still move{bonus}.", { name: who, what: displayWhat, bonus: bonus ? t(" or take a bonus action") : "" });
    }
    const hasted = (budget.extraActions ?? 0) > 0;
    const bonusLeft = !budget.bonusUsed;
    if (
      error ===
      `${who} has already used their action this turn; ${what} needs one.${
        hasted ? " The extra action from Haste is only for one weapon attack, Dash, Disengage, Hide or Use an Object." : ""
      } They can still move${bonusLeft ? " or take a bonus action" : ""}, or end their turn.`
    ) {
      return t("{name} has already used their action this turn; {what} needs one.{haste} They can still move{bonus}, or end their turn.", {
        name: who,
        what: displayWhat,
        haste: hasted ? t(" The extra action from Haste is only for one weapon attack, Dash, Disengage, Hide or Use an Object.") : "",
        bonus: bonusLeft ? t(" or take a bonus action") : "",
      });
    }
  }
  if (kind === "bonus") {
    if (error === `${who} has already used their bonus action this turn; ${what} needs one.`) {
      return t("{name} has already used their bonus action this turn; {what} needs one.", { name: who, what: displayWhat });
    }
  }
  if (kind === "reaction") {
    if (error === `${who} has already used their reaction; it comes back at the start of their next turn. ${what} does not happen.`) {
      return t("{name} has already used their reaction; it comes back at the start of their next turn. {what} does not happen.", { name: who, what: displayWhat });
    }
  }
  return error;
}

