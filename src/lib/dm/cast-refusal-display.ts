// Player-only presentation of the cast rules' canonical English refusals.
// Only complete, known producer templates match. Unknown wording is returned
// unchanged; spell, item, feature and character identities are not translated.
import type { MessageVars } from "@/lib/messages-logic";
type T = (key: string, vars?: MessageVars) => string;

// spellHeldProblem may be followed by this exact ring instruction (cast-guard.ts).
const RING_SUFFIX = "{ring} holds it: use_item with spell casts it from there, then cast it with this tool.";
const HELD_TEMPLATES = [
  "{name} has no Spellcasting feature and cannot cast spells.",
  "{name} cannot cast \"{spell}\": it is not among the spells they know or have prepared ({ready}).",
  "No spell called \"{spell}\" is known. {name} knows or has prepared {ready}: send the one meant, by the name on the sheet.",
  "{spell} is chosen but not prepared yet: it becomes ready after the next long rest.",
  "{spell} is in the spellbook but not prepared, so it cannot be cast. Prepare it from the sheet; it is ready after the next long rest.",
  "{name} casts {spell} through {source} as a ritual only: ten minutes longer, no slot. Send ritual true.",
  "{name} casts {spell} through {source} for {cost} {resource}, and has {left} left. It comes back after a {rest} rest.",
  "{name} casts {spell} through {source} {times}, and again after a {rest} rest; {uses} spent.",
  "{name} holds {spell} as a {classId} spell, and a {classId}'s Spellcasting does not cast rituals (bards, clerics, druids, wizards and artificers do, through their own spells). It can be cast from a slot instead.",
  "{spell} is not written in {name}'s ritual book, so it cannot be cast as a ritual. It goes in the book first (a ritual of a level they can cast, found and copied), or it is cast from a slot.",
] as const;

const TEMPLATES = [
  "{spell} is from the 2024 rules, which this server does not play; pick a 2014 spell in its place. Nothing was spent.",
  "{name} is dead and cannot spend a spell slot.",
  "{name} is at 0 HP and cannot spend a spell slot.",
  "{name} is {condition} and cannot spend a spell slot until the condition ends.",
  "{spell} brings its creatures in with their stat blocks: cast it with cast_buff, the creature in variant (and count for fewer). Nothing was spent.",
  "{name} casts {spell} through {source} only {limit}; this casting is not, and no spell slot of theirs casts it. Nothing was spent.",
  "{spell} has a material component: {name}'s focus is their drone ({feature}), and no drone of theirs stands (Drone Companion builds them out of a fight; a component pouch serves too). Nothing was spent.",
  "{name} stands inside Antimagic Field, where no spell can be cast. Step out of it first. Nothing was spent.",
  "{name} stands inside {owner}'s Antimagic Field, where no spell can be cast. Step out of it first. Nothing was spent.",
  "{spell} came to {name} through Marginalia, which casts it as a ritual only: cast it with ritual true (ten minutes longer, no slot). Nothing was spent.",
  "{spell} takes {time} to cast. In a fight it is begun with use_spell_slot: the server holds the casting across {name}'s turns (their action on each, their concentration throughout) and spends the slot when it is complete, and then this tool resolves its effect. Nothing was spent.",
  "{name} used Arcane Deflection and casts only cantrips until the end of their next turn, so {spell} is not cast. Nothing was spent.",
  "No Ring of Spell Storing named \"{ring}\" is there to hold {spell}. Nothing was spent.",
  "{ring} stores spells of 1st through 5th level, not level {level}. Nothing was spent.",
  "{ring} has {free} of {total} levels free, and {spell} at level {level} does not fit. Nothing was spent.",
  "{spell} is laid within {range} feet of {name}, and ({x},{y}) is {distance} feet away. Name a square within range. Nothing was spent.",
  "A wall stands between {name} and ({x},{y}): {spell} needs a clear path to where it is laid. Name a square {name} can see. Nothing was spent.",
  "Slow holds {spell} back (the d20 came up 11 or higher): the slot and this turn's action are spent and the spell does not take effect yet. On {name}'s next turn, cast it again with its tool to complete it: that spends their action and no slot. If they do not, the spell is wasted. Do not resolve it now.",
  "{name} is raging and cannot cast spells or concentrate on them. They can cast once the rage ends.",
  "{name} is polymorphed into a {form} and cannot cast spells; the form has no capacity for it. The spell waits until the transformation ends.",
  "{name} is wild shaped as a {form} and cannot cast spells in beast form, cantrips included (that unlocks with Beast Spells at druid level 18). They can revert with use_resource on Wild Shape.",
  "{name} is wearing armor they are not trained in ({armor}) and cannot cast spells in it. They cast again once it is off.",
  "{spell} has a verbal component and {name} is {condition}: they cannot speak the words. A spell with no verbal component could still be cast.",
  "{spell} needs a free hand for its gestures, and both of {name}'s hands are full. They must put a weapon away or lower the shield first (unequip it on the sheet).",
  "{spell} needs a free hand for its material component{gestures}, and both of {name}'s hands are full{warcaster}. They must put a weapon away or lower the shield first (unequip it on the sheet).",
  "{name} stands inside {area}Silence, where no sound is made: {spell} has a verbal component and cannot be cast there. Step out of the silence first, or cast a spell with no verbal component. Nothing was spent.",
  ...HELD_TEMPLATES,
  "A ritual is a named spell with the ritual tag; name the spell being cast.",
  "{spell} is not a spell the server knows to be a ritual; it needs a slot.",
  "{spell} has no ritual tag; it cannot be cast as a ritual and needs a slot.",
  "{name}'s class does not cast rituals (bards, clerics, druids and wizards do); {spell} needs a slot.",
  "{name} has no free level {level} spell slot for {spell}. {slots} Ask the player which, unless they named one.",
  "{name} has no spell slot of level {level} or higher left for {spell}; spent slots come back on a long rest (a Pact Magic slot on a short one).",
  "{spell} is a level {level} spell; it cannot be cast from a level {slot} slot. Use a slot of level {level} or higher. {slots} Ask the player which, unless they named one.",
  "{spell} is not a spell the server knows, so the slot level it is cast from must be named (1 to 9). {slots} Ask the player which, unless they named one.",
  "A spell slot has a level from 1 to 9; name the level to spend. {slots} Ask the player which, unless they named one.",
  "{name} has already used their reaction; it comes back at the start of their next turn. {spell} is not cast.",
  "{name} has already cast a levelled spell this turn, so {spell} cannot be cast with the bonus action: beside a bonus action spell the only other spell of the turn is a cantrip.",
  "{name} has cast a spell with their bonus action this turn, so the only other spell they can cast is a cantrip with a casting time of one action. {spell} waits for another turn.",
  "{name} has cast a spell with their bonus action this turn, so the only other spell they can cast on it is a cantrip with a casting time of one action; {spell} on their own turn is not one.",
  "{spell}'s component is worth {gp} gp per Hit Die of its target: send units with the target's Hit Dice. Nothing was spent.",
  "{spell} needs {material}, and {name} does not carry it (a line on the sheet with its worth, like \"{item}\" with worth {gp}). There is no buying one in the middle of a fight. Nothing was spent.",
  "{spell} needs {material}. {name} carries none (a line on the sheet with its worth, like \"{item}\" with worth {gp}) and has not the gold to buy it. Nothing was spent.",
  "{spell} has a material component{material}: {name} needs a component pouch or {focus} to cast it, and carries neither. Add one to the sheet. Nothing was spent.",
  "{spell} has a material component{material}: {name} needs their cyberdeck as the focus ({feature}; a Cyberdeck or an arcane focus on the sheet) or a component pouch to cast it, and carries neither. Add one to the sheet. Nothing was spent.",
  "{spell} has a material component{material}: {name}'s focus is their kit and mask ({feature}; a herbalism kit, a healer's kit or the beaked mask on the sheet) or a component pouch, and they carry neither. Add one to the sheet. Nothing was spent.",
  "{spell} has a material component{material}: {requirement}, and {name} carries none. Add one to the sheet. Nothing was spent.",
  "{spell} has a material component{material}, and {name} cannot provide one as a {form}: Beast Spells gives a beast shape the words and the gestures only. A spell with no material component can still be cast, or they revert first (use_resource Wild Shape with variant 'revert'). Nothing was spent.",
  "{name} has no attack of the Attack action left to make {spell} with: Extra Attack lets one attack of the action be a cantrip, and {reason}. Nothing was spent.",
  "{name} has already cast a cantrip in place of one attack of this Attack action, and Extra Attack allows one: the other attack is made with a weapon. {spell} is not cast. Nothing was spent.",
  "{name} has already used their action this turn; casting {spell} needs one. Extra Attack lets one attack of the Attack action be a cantrip with a casting time of one action, not a spell of 1st level or higher. Nothing was spent.",
  "{name} has already used their action this turn; casting {spell} needs one.{haste} They can still move{bonus}, or end their turn.",
  "{name} has already used their bonus action this turn; casting {spell} needs one.",
  "{spell} is cast as a reaction: use_reaction with feature \"{spell}\" when its trigger happens; the server checks the trigger and applies it. Nothing was spent.",
  "A spell slot has a level from 1 to 9, not {level}. Name the slot {spell} is cast from, or leave the level out for the spell's own.",
  "The caster is no longer at the table."
] as const;

function escapePattern(value: string): string {
  return value.replace(/[.*+?^$${}()|[\]\\]/g, "\\$&");
}

function patternFor(template: string): RegExp {
  const seen = new Set<string>();
  const slots = /\{(\w+)\}/g;
  let pattern = "^";
  let at = 0;
  for (const match of template.matchAll(slots)) {
    const index = match.index ?? 0;
    pattern += escapePattern(template.slice(at, index));
    const field = match[1];
    pattern += seen.has(field) ? `\\k<${field}>` : `(?<${field}>.*?)`;
    seen.add(field);
    at = index + match[0].length;
  }
  return new RegExp(pattern + escapePattern(template.slice(at)) + "$");
}

const PATTERNS = [
  ...HELD_TEMPLATES.map((key) => ({ key, pattern: patternFor(`${key} ${RING_SUFFIX}`), ring: true })),
  ...TEMPLATES.map((key) => ({ key, pattern: patternFor(key), ring: false })),
];

function slotDisplay(raw: string, t: T): string {
  if (raw === "No slot is free.") return t("No slot is free.");
  const match = /^Free slots, lowest first: (.+)\.$/.exec(raw);
  if (!match) return raw;
  const entries = match[1].split(", ").map((entry) => {
    const slot = /^level (\d+) \((\d+) left\)$/.exec(entry);
    return slot ? t("level {level} ({left} left)", { level: slot[1], left: slot[2] }) : entry;
  });
  return t("Free slots, lowest first: {list}.", { list: entries.join(", ") });
}

function fragment(field: string, raw: string, t: T): string {
  if (field === "slots") return slotDisplay(raw, t);
  if (field === "focus") return raw.split(" or ").map((entry) => t(entry)).join(t(" or "));
  if (field === "times") {
    const match = /^(\d+) times$/.exec(raw);
    return match ? t("{count} times", { count: match[1] }) : t(raw);
  }
  if (field === "reason") {
    const match = /^all (\d+) attacks of it are made$/.exec(raw);
    return match ? t("all {count} attacks of it are made", { count: match[1] }) : t(raw);
  }
  if (field === "requirement") {
    const match = /^a (\w+) who casts spells needs a component pouch; the class has no spellcasting focus$/.exec(raw);
    return match ? t("a {classId} who casts spells needs a component pouch; the class has no spellcasting focus", { classId: t(match[1]) }) : t(raw);
  }
  if (field === "area") return raw; // A source name may be authored.
  if (field === "ready" && (raw === "none" || raw === "no spells")) return t(raw);
  if (["condition", "gestures", "warcaster", "haste", "bonus", "rest", "uses", "classId"].includes(field)) return raw ? t(raw) : raw;
  if (field === "armor" && raw === "their armor") return t(raw);
  return raw;
}

export function castRefusalDisplay(error: string, t: T, actor?: string): string {
  for (const { key, pattern, ring } of PATTERNS) {
    const match = pattern.exec(error);
    if (!match) continue;
    const groups = match.groups ?? {};
    if (actor && groups.name !== undefined && groups.name !== actor) continue;
    const vars = Object.fromEntries(Object.entries(groups).map(([field, raw]) => [field, fragment(field, raw, t)]));
    if (ring && !groups.ring) continue;
    const message = t(key, vars);
    return ring ? `${message} ${t(RING_SUFFIX, { ring: groups.ring })}` : message;
  }
  return error;
}
