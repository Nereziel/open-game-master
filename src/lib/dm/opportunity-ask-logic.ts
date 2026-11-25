// The ask before a character's opportunity attack (src/lib/dm/opportunity-ask.ts),
// in its pure half: what the card carries and the words it and the table read.
// No "@/" imports, so the card on the table's page draws from this too.
//
// SRD 5.1, Opportunity Attacks: "You CAN make an opportunity attack when a
// hostile creature that you can see moves out of your reach ... you use your
// reaction". The reaction is the one Shield, Hellish Rebuke or Uncanny Dodge
// would spend, so it is the player's to keep.

import { translate } from "../i18n/translate.ts";

// What draws the swing: leaving the reach (the rule itself), entering a
// polearm's (Polearm Master), moving within it (Hold the Line), or moving away
// from a Manifest Echo's side.
export type OpportunityTrigger = "leaves" | "enters" | "within" | "echo";

// The card's question, carried on the parked roll (dm-turns.ts PendingCarry).
// `walker` is the walker's name as the table sees it, `weapon` the one the
// swing would use. `deadline` only while another player is at the table
// (after-roll-timer.ts afterRollDeadline). `strike` and `timedOut` are the
// answer, written as the card lands. `smiteSlot` is the slot a paladin's
// Divine Smite would spend on this swing (smiteSlotOf), offered only when
// the swing is a melee weapon attack and a slot is open; `smite` is the
// answer that takes it. `rider` is the enemy on the walker's back (issue 1055,
// ruling 5: enemy-riders.ts): "If the mount provokes an opportunity attack
// while you're on it, the attacker can target you or the mount" (SRD 5.1,
// Mounted Combat), so the card offers both by name and `target` is the id of
// the one the player chose.
export type OpportunityAsk = {
  walkerId: string;
  walker: string;
  weapon: string;
  trigger: OpportunityTrigger;
  rider?: { id: string; name: string };
  deadline?: string;
  smiteSlot?: number;
  strike?: boolean;
  smite?: boolean;
  target?: string;
  timedOut?: boolean;
};

// The answer, as the walk's call reads it when it runs again (held-call.ts).
// `targetId` only when the player named one of a mounted pair.
export type OpportunityChoice = { walkerId: string; strike: boolean; smite?: boolean; targetId?: string; timedOut?: boolean };

// Which of a mounted pair an answer names: the rider's id when the card
// offered a rider and the answer chose it, else nothing, and the swing is at
// the walker as it always was.
export function chosenOfPair(ask: Pick<OpportunityAsk, "rider">, target: string | undefined): string | undefined {
  return ask.rider && target === ask.rider.id ? ask.rider.id : undefined;
}

// The slot a smite on the opportunity attack spends: the lowest one open,
// a pact slot among them, as the Hand's Divine Smite card picks it
// (hand-core.ts lowestSlot). Null with none left.
export function smiteSlotOf(casting: { slots?: Record<string, { max: number; used: number }>; pact?: { level: number; max: number; used: number } | null } | null | undefined): number | null {
  if (!casting) {
    return null;
  }
  const open = Object.entries(casting.slots ?? {})
    .filter(([, slot]) => slot.max - slot.used > 0)
    .map(([level]) => Number(level));
  if (casting.pact && casting.pact.max - casting.pact.used > 0) {
    open.push(casting.pact.level);
  }
  const levels = open.filter((level) => Number.isFinite(level) && level >= 1);
  return levels.length ? Math.min(...levels) : null;
}

// The card's smite choice in words: "Strike and smite (1st-level slot)", or
// on a mounted pair's card, where each of the two has its own pair of
// buttons, "Strike Goblin and smite (1st-level slot)", beside "Strike Goblin".
type OpportunityT = (key: string, vars?: Record<string, string | number>) => string;
const englishT: OpportunityT = (key, vars) => translate("en", key, vars);

export function smiteChoiceLine(slot: number, at?: string, t: OpportunityT = englishT): string {
  const suffix = slot === 1 ? "st" : slot === 2 ? "nd" : slot === 3 ? "rd" : "th";
  const ordinal = `${slot}${suffix}`;
  return at
    ? t("Strike {target} and smite ({ordinal}-level slot)", { target: at, ordinal: t(ordinal) })
    : t("Strike and smite ({ordinal}-level slot)", { ordinal: t(ordinal) });
}

const PLAYER_MOVES: Record<OpportunityTrigger, string> = {
  leaves: "{walker} is moving out of your reach",
  enters: "{walker} is moving into your reach",
  within: "{walker} is moving within your reach",
  echo: "{walker} is moving away from your echo",
};
const WATCHER_MOVES: Record<OpportunityTrigger, string> = {
  leaves: "{walker} is moving out of {name}'s reach",
  enters: "{walker} is moving into {name}'s reach",
  within: "{walker} is moving within {name}'s reach",
  echo: "{walker} is moving away from {name}'s echo",
};

// The player's own card: "The Goblin is moving out of your reach. Take your
// opportunity attack with your Longsword? It uses your reaction."
// With a rider on the walker's back: "The Wolf is moving out of your reach
// with Goblin on its back. Take your opportunity attack with your Longsword,
// and at which of them? It uses your reaction."
export function askLine(ask: Pick<OpportunityAsk, "walker" | "weapon" | "trigger" | "rider">, t: OpportunityT = englishT): string {
  // Only the UI supplies a translator; the parked roll keeps its canonical reason.
  const movement = t(PLAYER_MOVES[ask.trigger], { walker: ask.walker });
  return ask.rider
    ? t("{movement} with {rider} on its back. Take your opportunity attack with your {weapon}, and at which of them? It uses your reaction.", { movement, rider: ask.rider.name, weapon: ask.weapon })
    : t("{movement}. Take your opportunity attack with your {weapon}? It uses your reaction.", { movement, weapon: ask.weapon });
}

// What everyone else at the table reads while the player decides.
export function waitLine(ask: Pick<OpportunityAsk, "walker" | "trigger">, name: string, t: OpportunityT = englishT): string {
  return t("{movement}. {name} is deciding whether to take an opportunity attack.", { movement: t(WATCHER_MOVES[ask.trigger], { walker: ask.walker, name }), name });
}

// The roll card's own detail, for a screen that draws it as any roll.
export function askDetail(ask: Pick<OpportunityAsk, "walker" | "trigger">, name: string): string {
  return `Opportunity attack on ${ask.walker}? (${name})`;
}

// The table note for a swing let go: the GM narrates it, and nobody asks
// later why the reaction is still there.
export function letGoNote(name: string, walker: string): string {
  return `${name} lets ${walker} go: no opportunity attack, and the reaction is kept.`;
}

// The swing the clock took, said as such.
export function timedOutNote(name: string, note: string): string {
  return `${name}'s player did not answer in time, so the opportunity attack was taken. ${note}`;
}
