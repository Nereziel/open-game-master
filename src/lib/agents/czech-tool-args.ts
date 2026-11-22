// Czech D&D terminology at the MCP boundary. Only known, fixed rules
// arguments are canonicalized. Narrative text, player/NPC names, target IDs,
// arbitrary items and unknown values pass through unchanged. All authorization,
// validation and action limits remain in the existing MCP/DM code.
import {
  CZECH_ABILITIES,
  CZECH_CLASSES,
  CZECH_ITEMS,
  CZECH_MONSTERS,
  CZECH_RACES,
  CZECH_SKILLS,
  CZECH_SPELLS,
} from "../rulebook/czech-terms.ts";

type Args = Record<string, unknown>;

function record(value: unknown): value is Args {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// Case-insensitive and Unicode-normalized, without dropping Czech diacritics
// (unrelated names must not accidentally collapse to the same key).
function key(value: string): string {
  return value.trim().normalize("NFKC").toLocaleLowerCase("cs").replace(/\s+/g, " ");
}

// Some campaigns and older translations used alternate skill words; all
// spellings resolve to the one canonical 2014 SRD skill id.
const SKILL_ALIASES: Readonly<Record<string, string>> = {
  "ovládání zvířat": "animal_handling",
  mystika: "arcana",
  vhled: "insight",
  umění: "performance",
  čachry: "sleight_of_hand",
  nenápadnost: "stealth",
  plížení: "stealth",
};

function reverseMap(values: Readonly<Record<string, string>>, canonical: (original: string) => string): Map<string, string> {
  const result = new Map<string, string>();
  for (const [english, czech] of Object.entries(values)) {
    result.set(key(czech), canonical(english));
    result.set(key(english), canonical(english));
  }
  return result;
}

const SKILLS = reverseMap(CZECH_SKILLS, (name) => name.toLowerCase().replace(/\s+/g, "_"));
for (const [alias, id] of Object.entries(SKILL_ALIASES)) SKILLS.set(key(alias), id);
const ABILITIES = reverseMap(CZECH_ABILITIES, (name) => name.slice(0, 3).toLowerCase());
const SPELLS = reverseMap(CZECH_SPELLS, (name) => name);
const MONSTERS = reverseMap(CZECH_MONSTERS, (name) => name);
const ITEMS = reverseMap(CZECH_ITEMS, (name) => name);
const RACES = reverseMap(CZECH_RACES, (name) => name);
const CLASSES = reverseMap(CZECH_CLASSES, (name) => name);
const CONDITIONS = reverseMap(
  {
    Blinded: "Oslepený",
    Charmed: "Okouzlený",
    Deafened: "Ohlušený",
    Frightened: "Vystrašený",
    Grappled: "Uchvácený",
    Incapacitated: "Neschopný",
    Invisible: "Neviditelný",
    Paralyzed: "Ochromený",
    Petrified: "Zkamenělý",
    Poisoned: "Otrávený",
    Prone: "Sražený",
    Restrained: "Zadržený",
    Stunned: "Omráčený",
    Unconscious: "V bezvědomí",
    Exhaustion: "Vyčerpání",
  },
  (name) => name.toLowerCase(),
);

function canonical(value: unknown, map: Map<string, string>): unknown {
  if (typeof value !== "string") return value;
  return map.get(key(value)) ?? value;
}

// Important: no guessing or fuzzy matching. Only fields that a DM tool
// declares as structured rules names are normalized.
const FIELDS: Readonly<Record<string, Map<string, string>>> = {
  skill: SKILLS,
  contestSkill: SKILLS,
  sense: SKILLS,
  ability: ABILITIES,
  againstMonster: MONSTERS,
  monster: MONSTERS,
  spell: SPELLS,
  item: ITEMS,
  itemName: ITEMS,
  race: RACES,
  species: RACES,
  class: CLASSES,
  condition: CONDITIONS,
};

function normalizeDmArgs(args: Args): Args {
  let next: Args | undefined;
  for (const [field, original] of Object.entries(args)) {
    const mapped = FIELDS[field];
    if (!mapped) continue;
    const normalized = canonical(original, mapped);
    if (normalized !== original) {
      next ??= { ...args };
      next[field] = normalized;
    }
  }

  // pc_attack submits a list of attack entries. Other list fields are left
  // untouched; in particular names and descriptions are never rewritten.
  if (Array.isArray(args.attacks)) {
    const originalAttacks = args.attacks;
    const attacks = originalAttacks.map((entry) => {
      if (!record(entry)) return entry;
      const spell = canonical(entry.spell, SPELLS);
      return spell === entry.spell ? entry : { ...entry, spell };
    });
    if (attacks.some((entry, index) => entry !== originalAttacks[index])) {
      next ??= { ...args };
      next.attacks = attacks;
    }
  }
  return next ?? args;
}

// The MCP turn bridge receives direct names (request_roll, cast_buff,
// pc_attack...). A connected GM instead uses odm_dm_invoke with its action
// in "name" and tool arguments in "args". We never translate tool names,
// campaign IDs, character IDs, the narration or unknown workbench methods.
export function canonicalMcpToolArgs(toolName: string, args: Args): Args {
  if (toolName === "odm_dm_invoke") {
    if (!record(args.args)) return args;
    const normalized = normalizeDmArgs(args.args);
    return normalized === args.args ? args : { ...args, args: normalized };
  }
  if (toolName.startsWith("odm_")) return args;
  return normalizeDmArgs(args);
}

export const CZECH_MCP_TERMINOLOGY_HINT =
  "Czech D&D 5e names are understood in structured MCP rule arguments (skills, abilities, spells, monster types, magic items and conditions). " +
  "Always use tool names, parameter keys, IDs and enumerated action types exactly as tools/list declares. " +
  "Czech rule aliases are converted to canonical English SRD names before the rules engine validates them. " +
  "Keep narration, character names and location names in the campaign language.";
