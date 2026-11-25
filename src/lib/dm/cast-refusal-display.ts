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

// pointsPlan has separate singular/plural output and only refuses when the
// points available are below the price. Reject malformed legacy values.
const POINTS_REFUSALS = [
  { singular: true, key: "{name} has 1 sorcery point left, and {spell} through {feature} costs {cost}. Nothing was spent." },
  { singular: false, key: "{name} has {left} sorcery points left, and {spell} through {feature} costs {cost}. Nothing was spent." },
].map(({ singular, key }) => ({ singular, key, pattern: patternFor(key) }));

export function castRefusalDisplay(error: string, t: T, actor?: string): string {
  for (const { key, pattern, singular } of POINTS_REFUSALS) {
    const groups = pattern.exec(error)?.groups;
    if (!groups || !groups.name.trim() || !groups.spell.trim() || !groups.feature.trim()) continue;
    if (actor && groups.name !== actor) continue;
    const left = singular ? 1 : Number(groups.left);
    const cost = Number(groups.cost);
    if (!Number.isSafeInteger(left) || !Number.isSafeInteger(cost) || left < 0 || left >= cost) continue;
    if (!singular && (left === 1 || String(left) !== groups.left) || String(cost) !== groups.cost) continue;
    return t(key, groups);
  }
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

// Successful slot notes are separate from refusals, and only read from the
// tool result's slot fields by the console. The engine keeps its own text.
const SLOT_RESULT_PATTERNS = [
  "{spell} cast as a ritual: no slot spent.",
  "{spell} completes the casting Slow held back: no slot spent.",
  "{spell} is a Signature Spell: cast at 3rd level with no slot, once until a short rest.",
  "{spell} is cast without a slot (a feat's spell at will).",
  "{spell} is cast without a slot (a feat's free cast): once until a short rest.",
  "{spell} is cast without a slot (a feat's free cast): once until a long rest.",
  "{spell} is cast as a Mystic Arcanum, with no spell slot: once until a long rest.",
  "{spell} is cast through Mantle of Majesty: no slot spent.",
  "{spell} is cast through Read Thoughts: no slot spent, and the reading ends.",
  "{spell} is a cantrip: no spell slot is spent. Cantrips are unlimited.",
  "{spell} is mastered (Spell Mastery): cast at its own level, no slot is spent.",
  "{spell} is cast with no spell slot ({condition}, now spent).",
  "{spell} is cast with no spell slot ({condition}, for the minute).",
  "{spell} is cast through {source} with no spell slot, at will.",
  "{spell} is cast through {source}, with no spell slot.",
  "{spell} is cast through {source}, with no spell slot: once until a long rest.",
  "{spell} is cast through {source} with no spell slot: once, and again after a short rest, as a level {level} spell.",
  "{spell} is cast through {source} with no spell slot: once, and again after a short rest.",
  "{spell} is cast through {source} with no spell slot: {count} times, and again after a short rest, as a level {level} spell.",
  "{spell} is cast through {source} with no spell slot: {count} times, and again after a short rest.",
  "{spell} is cast through {source} with no spell slot: once, and again after a long rest, as a level {level} spell.",
  "{spell} is cast through {source} with no spell slot: once, and again after a long rest.",
  "{spell} is cast through {source} with no spell slot: {count} times, and again after a long rest, as a level {level} spell.",
  "{spell} is cast through {source} with no spell slot: {count} times, and again after a long rest.",
  "{spell} is cast through {source} with no spell slot, at will, as a level {level} spell.",
  "{spell} is cast with 1 sorcery point in place of a spell slot ({source}). {left} left.",
  "{spell} is cast with 1 sorcery point in place of a spell slot ({source}), with no verbal, somatic or material component. {left} left.",
  "{spell} is cast with 1 sorcery point in place of a spell slot ({source}); {name} sees through it. {left} left.",
  "{spell} is cast with {cost} sorcery points in place of a spell slot ({source}). {left} left.",
  "{spell} is cast with {cost} sorcery points in place of a spell slot ({source}), with no verbal, somatic or material component. {left} left.",
  "{spell} is cast with {cost} sorcery points in place of a spell slot ({source}); {name} sees through it. {left} left.",
].map((key) => ({ key, pattern: patternFor(key) }));

export function castSlotDisplay(raw: string, t: T): string {
  const slot = /^(pact slot )?level (\d+): (\d+)\/(\d+) left$/.exec(raw);
  if (slot) {
    return t(slot[1] ? "pact slot level {level}: {left}/{max} left" : "level {level}: {left}/{max} left", { level: slot[2], left: slot[3], max: slot[4] });
  }
  for (const { key, pattern } of SLOT_RESULT_PATTERNS) {
    const match = pattern.exec(raw);
    if (!match?.groups?.spell) continue;
    const { source, name, count, cost, level, left } = match.groups;
    if (source !== undefined && !source.trim() || name !== undefined && !name.trim()) continue;
    if ([count, cost, level, left].some((value) => value !== undefined &&
      (!Number.isSafeInteger(Number(value)) || String(Number(value)) !== value || Number(value) < 0))) continue;
    if (count !== undefined && Number(count) < 2 || cost !== undefined && Number(cost) < 2 ||
      level !== undefined && (Number(level) < 1 || Number(level) > 9)) continue;
    return t(key, match.groups);
  }
  return raw;
}


// Other successful cast result fields. Keep the source/feature names as
// supplied by the engine; a grant with unknown appended prose is not a
// plain grant. A dot in a source name is ambiguous in the legacy format.
const EXTRA_CAST_PATTERNS = [
  { field: "granted", key: "{spell} is cast through Chains of Carceri. Chains of Carceri targets a celestial, fiend or elemental only, and not the same creature again until a long rest." },
  { field: "granted", key: "{spell} is cast through Grasping Tentacles. Casting it gives the warlock temporary hit points equal to their warlock level, and damage cannot break their concentration on it." },
  { field: "granted", key: "{spell} is cast through Shapechanger. The free casting is on the wizard themselves, into a beast of challenge rating 1 or lower." },
  { field: "granted", key: "{spell} is cast with a spell slot; {source} gives it without one, once a short rest." },
  { field: "granted", key: "{spell} is cast with a spell slot; {source} gives it without one, once a long rest." },
  { field: "granted", key: "{spell} is cast with a spell slot; {source} gives it without one, {count} times a short rest." },
  { field: "granted", key: "{spell} is cast with a spell slot; {source} gives it without one, {count} times a long rest." },
  { field: "granted", key: "{spell} is cast with a spell slot; {source} gives it without one." },
  { field: "granted", key: "{spell} is cast through {source}." },
  { field: "slotRefund", key: "{feature}: a spent level {level} slot comes back." },
  { field: "completed", key: "{spell}'s casting is complete and it takes effect now; it costs no action." },
  { field: "debtComesDue", key: "The Debt Comes Due: that was {name}'s last spell slot, and it comes straight back (level {level}). The use is spent until a long rest." },
  { field: "cost", key: "their action" },
  { field: "cost", key: "their bonus action" },
  { field: "cost", key: "their reaction" },
  { field: "wildMagicSurge", key: "Tides of Chaos is spent: the GM may have {name} roll on the wild magic table now, and if so use_resource \"Wild Magic Surge\" rolls it and gives the use back." },
  { field: "wildMagicSurge", key: "The GM may have {name} roll a d20 for a Wild Magic Surge now: use_resource \"Wild Magic Surge\" rolls it, and on a 1 rolls on the wild magic table." },
  { field: "refilled", key: "Benign Transposition is ready again: a conjuration spell of level 1 or higher was cast." },
  { field: "castingTime", key: "1 minute of casting; the clock moved on." },
  { field: "castingTime", key: "{count} minutes of casting; the clock moved on." },
  { field: "castingTime", key: "1 hour of casting; the clock moved on." },
  { field: "castingTime", key: "{count} hours of casting; the clock moved on." },
  { field: "lunarBoons", key: "Lunar Boons: the spell just cast is of the {phase} phase's schools, so the Metamagic costs 1 sorcery point less. {name} has {left}/{max} boons left." },
  { field: "lunarBoons", key: "Lunar Boons: a spell of the {phase} phase's schools, so the Metamagic costs 1 sorcery point less. {name} has {left}/{max} boons left." },
  { field: "lunarBoons", key: "Lunar Boons: if the next spell {name} casts is of the {phase} phase's schools (abjuration or divination), 1 sorcery point comes back and a boon is spent." },
  { field: "lunarBoons", key: "Lunar Boons: if the next spell {name} casts is of the {phase} phase's schools (enchantment or necromancy), 1 sorcery point comes back and a boon is spent." },
  { field: "lunarBoons", key: "Lunar Boons: if the next spell {name} casts is of the {phase} phase's schools (illusion or transmutation), 1 sorcery point comes back and a boon is spent." },
  { field: "shares", key: "{spell} holds {count} attack rolls from this one casting; {left} left this turn at no further cost, each its own entry in pc_attack's attacks." },
  { field: "shares", key: "{spell} holds {count} darts from this one casting; {left} left this turn at no further cost, each its own entry in cast_at_enemy's targets." },
  { field: "shares", key: "{spell} holds {count} darts from this one casting; {left} left this turn at no further cost, each its own entry in heal's targets." },
  { field: "shares", key: "{spell} holds {count} targets from this one casting; {left} left this turn at no further cost, each its own entry in cast_at_enemy's targets." },
  { field: "shares", key: "{spell} holds {count} targets from this one casting; {left} left this turn at no further cost, each its own entry in heal's targets." },
  { field: "stoneChange", key: "{feature}: {name} may change its benefit now (it is {choice}): use_resource \"{feature}\" with the new one in variant, before their turn ends." },
  { field: "droppedConcentration", key: "The earlier casting of {spell} ended when it was cast again; its effects are gone." },
  { field: "droppedConcentration", key: "{previous} ended when {spell} was cast; its effects are gone." },
  { field: "droppedConcentration", key: "{name}'s casting of {spell} fails ({next} took the concentration): the spell does not take effect, and no spell slot is spent." },
  { field: "note", key: "{spell} cast as a ritual: {count} minutes of casting, no slot spent. The clock moved on." },
  { field: "note", key: "{spell} cast as a ritual: no slot spent. Awakened Spellbook: cast at the spell's own casting time, without a ritual's 10 extra minutes (once until a long rest)." },
  { field: "note", key: "{spell} cast as a ritual: no slot spent. Awakened Spellbook: cast at the spell's own casting time, without a ritual's 10 extra minutes (once until a long rest). 1 minutes of casting; the clock moved on." },
  { field: "note", key: "{spell} cast as a ritual: no slot spent. Awakened Spellbook: cast at the spell's own casting time, without a ritual's 10 extra minutes (once until a long rest). {count} minutes of casting; the clock moved on." },
  { field: "costNote", key: "Quickened Spell: {spell} took the bonus action instead of the action." },
  { field: "costNote", key: "{feature}: {spell} took the bonus action instead of the action." },
  { field: "costNote", key: "{name} spends their additional action (Action Surge) on casting {spell}." },
  { field: "costNote", key: "{name} spends their extra action (Haste) on casting {spell}." },
  { field: "metamagic", key: "Twinned Spell: {spell} takes a second creature in range, for 1 sorcery point. The second target is another creature, never the first again." },
  { field: "metamagic", key: "Twinned Spell: {spell} takes a second creature in range, for {count} sorcery points. The second target is another creature, never the first again." },
].map(({ field, key }) => ({ field, key, pattern: patternFor(key) }));

export function castExtraDisplay(raw: string, t: T, field: "granted" | "slotRefund" | "completed" | "debtComesDue" | "cost" | "wildMagicSurge" | "lunarBoons" | "refilled" | "castingTime" | "shares" | "stoneChange" | "droppedConcentration" | "note" | "costNote" | "metamagic"): string {
  for (const entry of EXTRA_CAST_PATTERNS) {
    if (entry.field !== field) continue;
    const match = entry.pattern.exec(raw);
    if (!match) continue;
    const groups = match.groups ?? {};
    if (Object.values(groups).some((value) => !value.trim())) continue;
    const { source, count, level, left, max } = groups;
    if (source?.includes(".") || groups.previous?.includes(". ") ||
      (field === "costNote" && groups.feature?.includes(". ")) ||
      ((field === "note" || field === "costNote") && groups.spell?.includes(". "))) continue;
    if (left !== undefined) {
      const remaining = Number(left);
      const ceiling = Number(max ?? count);
      if (!Number.isSafeInteger(remaining) || String(remaining) !== left || remaining < 0 ||
        !Number.isSafeInteger(ceiling) || ceiling < 1 || remaining > ceiling ||
        (max !== undefined && String(ceiling) !== max)) continue;
    }
    if (count !== undefined && (!Number.isSafeInteger(Number(count)) || String(Number(count)) !== count || Number(count) < 2)) continue;
    if (level !== undefined && (!Number.isSafeInteger(Number(level)) || String(Number(level)) !== level || Number(level) < 1 || Number(level) > (field === "slotRefund" ? 8 : 9))) continue;
    return t(entry.key, groups);
  }
  return raw;
}
