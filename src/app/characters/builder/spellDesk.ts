// The spell desk on the builder's spell step (backlog F13): the caps said as
// their sums, the casting numbers the sheet will carry, and the swap a full
// list offers instead of a refusal. Pure, so
// scripts/test-builder-spell-desk.mjs can check it without React.
import { formatModifier } from "@/lib/srd";
import { textKey } from "@/lib/language/text-logic";
import { translate, type Locale } from "@/lib/i18n/translate";
import { preparedCapLine, type PreparedSum } from "./casting";

// Which list a swap changes: the cantrips, the levelled spells (a known
// caster's spells, a prepared caster's list, a wizard's book), or what a
// wizard prepares from the book.
export type SwapKind = "cantrip" | "spell" | "prepared";

// A swap waiting for the player to say which spell goes.
export type PendingSwap = { kind: SwapKind; name: string };

// The list with `out` replaced by `into` where it stood, so the order the
// player chose in holds.
export function swapInList(list: string[], out: string, into: string): string[] {
  const key = textKey(out);
  return list.map((entry) => (textKey(entry) === key ? into : entry));
}

// What can go to make room: the player's own picks, never a spell the
// subclass, the race or a feat grants (those never count against the cap).
export function swapCandidates(list: string[], locked: (name: string) => boolean): string[] {
  return list.filter((entry) => !locked(entry));
}

// What can go to make room for `into`: the player's own picks (`locked`
// keeps the granted ones), and only those whose leaving lets `into` in by
// the rule the list is held to (`problem`: an Eldritch Knight's or Arcane
// Trickster's two schools, said as the refusal, or null). `ruledOut` says
// the player had picks to trade and the rule turned every one away, so the
// step says the rule instead of offering a swap that would be refused.
export function swapChoices(input: {
  list: string[];
  into: string;
  locked: (name: string) => boolean;
  problem?: (into: string, out: string) => string | null;
}): { candidates: string[]; ruledOut: boolean } {
  const own = swapCandidates(input.list, input.locked);
  const problem = input.problem;
  const candidates = problem ? own.filter((out) => problem(input.into, out) === null) : own;
  return { candidates, ruledOut: own.length > 0 && candidates.length === 0 };
}

// What the question over the tiles asks.
export function swapQuestion(swap: PendingSwap, full: string): string {
  return `${full}. Swap ${swap.name} in for:`;
}

const ORDINALS = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];

// The casting numbers the sheet will carry, from the same calculation the
// build math table reads (buildMath.ts): the save DC, the attack bonus and
// the slots stored (casting.ts builderSpellSlots).
export function castingNumbers(input: {
  spellSaveDc: number | null | undefined;
  spellAttack: number | null | undefined;
  spellSlots: Record<string, { max: number }>;
}, t: (key: string) => string = (key) => key): { dc: string | null; attack: string | null; slots: Array<{ level: number; label: string; max: number }> } {
  const slots = Object.entries(input.spellSlots)
    .map(([level, slot]) => ({ level: Number(level), max: slot.max }))
    .filter((slot) => slot.max > 0 && slot.level >= 1 && slot.level <= 9)
    .sort((a, b) => a.level - b.level)
    .map((slot) => ({ ...slot, label: t(ORDINALS[slot.level]) }));
  return {
    dc: typeof input.spellSaveDc === "number" ? String(input.spellSaveDc) : null,
    attack: typeof input.spellAttack === "number" ? formatModifier(input.spellAttack) : null,
    slots,
  };
}

// Each cap the step holds the player to, said as its working: "Prepared:
// Wizard level 3 + INT +3 = 6", "Spellbook: 6 at level 1 + 2 a level after
// = 10".
export function capLines(input: {
  className: string;
  level: number;
  cantripCap: number | null;
  spellbookCap: number | null;
  spellCap: { label: string; count: number; sum?: PreparedSum } | null;
  known: boolean;
}, locale: Locale = "en"): Array<{ id: string; label: string; line: string }> {
  const { className, level } = input;
  const tableLine = (count: number) => translate(locale, "{count}, from the {class} table at level {level}", { count, class: className, level });
  const lines: Array<{ id: string; label: string; line: string }> = [];
  if (input.cantripCap !== null) {
    lines.push({ id: "cantrips", label: translate(locale, "Cantrips", { context: "sheet.spells.cantrips" }), line: tableLine(input.cantripCap) });
  }
  if (input.spellbookCap !== null) {
    lines.push({
      id: "spellbook",
      label: translate(locale, "Spellbook"),
      line: level > 1
        ? translate(locale, "6 at level 1 + 2 a level after = {count}", { count: input.spellbookCap })
        : translate(locale, "{count} at level 1", { count: input.spellbookCap }),
    });
  }
  if (input.spellCap) {
    const { count, sum } = input.spellCap;
    lines.push(
      input.known || !sum
        ? { id: "list", label: input.known ? translate(locale, "Known", { context: "sheet.spells.known" }) : translate(locale, "Prepared"), line: tableLine(count) }
        : { id: "list", label: translate(locale, "Prepared"), line: preparedCapLine(className, sum, count, locale) },
    );
  }
  return lines;
}
