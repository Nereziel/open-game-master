// What a caster's spell lists may become when the class gains a level.
//
// SRD 5.1, each class's Spellcasting feature: a new spell is on the class's
// own list and of a level the class has slots for; a bard, sorcerer, warlock
// or ranger learns what the Spells Known column adds and may replace ONE
// spell they know; cantrips are never replaced; a wizard writes two spells in
// the book for the level (six for a first wizard level) and prepares only
// from the book; a caster who knows spells prepares none.
//
// Pure. The player's picks arrive either as the names picked
// (`levelUpSpells`, with `levelUpForget` for the one a known caster gives
// up) or, from a client built before that, as the lists whole; both are read
// as "the lists the player wants" and judged against the lists held.
import {
  cantripCapOf,
  dedupeNames,
  grantedSpellsOf,
  maxSpellLevelOf,
  preparedCount,
  spellCapOf,
  spellbookAllowance,
  spellbookOf,
  spellOnCasterList,
  widerListOf,
  type CasterView,
} from "@/lib/srd/spell-prep";
import { classLabelOf, spellListLabel } from "@/lib/classes/class-spell-list";
import type { AbilityScores } from "@/lib/schemas/sheet";
import type { SpellFacts } from "@/lib/srd/legality/types";
import { thirdCasterCantripProblem, thirdCasterOutside, thirdCasterSchoolProblem } from "@/lib/srd/third-caster";
import { textKey } from "@/lib/language/text-logic";
import { isCantripName } from "@/lib/srd/spell-lists";
import { revisedOnlySpellProblem } from "@/lib/content/edition";
import { classSpellGrants, offListProblems } from "@/lib/srd/class-spell-grants";
import { originSwap } from "@/lib/dm/ar-ws-origin-swap";
import { arcanumExtraProblem, arcanumSplit, mysticArcanumTop } from "@/lib/srd/mystic-arcanum";
import { translate, translatePlural, type Locale, type MessageVars } from "@/lib/messages-logic";
import { contentName } from "@/lib/content/names";

// A name no list carries: a 2024-only spell says so, anything else is unknown.
function unknownSpell(name: string, list: string, locale: Locale): string {
  return revisedOnlySpellProblem(name, "spell", locale) ?? translate(locale, "{name} is not a spell this server knows; pick one from the {list} spell list.", { name, list });
}

const has = (list: string[], name: string) => list.some((entry) => textKey(entry) === textKey(name));
const added = (after: string[], before: string[]) =>
  dedupeNames(after).filter((name) => !has(before, name));

export type SpellPicks =
  | { kind: "picks"; spells: string[]; forget?: string }
  | {
      kind: "lists";
      lists: {
        known: string[];
        prepared: string[];
        cantrips: string[];
        pending?: string[];
        spellbook?: string[];
      };
    };

export type SpellLevelUp = {
  // The caster's lists before the level, at the class's OLD level; empty
  // lists for a class that starts casting with this level.
  before: CasterView;
  // The class's level and subclass after it.
  level: number;
  subclass: string;
  // The spell list the class draws from ("wizard" for an Eldritch Knight).
  list: string;
  // True when this is the first level in the class (a first wizard level
  // writes a whole starting book).
  firstLevel: boolean;
  abilities: AbilityScores;
  // Cantrips the race gave, known on top of the class's own.
  freeCantrips: number;
  // The sheet's features after the level, for the picks a feature widens
  // (a pact boon taken with this level, src/lib/srd/class-spell-grants.ts).
  features?: Array<{ name: string }>;
  spellOf: (name: string) => SpellFacts | null;
  picks: SpellPicks | null;
  locale?: Locale;
};

export type SpellLevelUpResult = { view: CasterView } | { error: string };

export function levelUpSpells(input: SpellLevelUp): SpellLevelUpResult {
  const { before, picks, locale = "en" } = input;
  const t = (key: string, vars?: MessageVars) => translate(locale, key, vars);
  const className = classLabelOf(before.classId);
  const displayClass = before.classId.startsWith("homebrew-") ? className : contentName("classes", className, locale);
  const label = t("{className} of level {level}", { className: displayClass, level: input.level });
  // A workshop class's list is named by its id (spellPoolKeyFor); a player
  // reads the list it borrows or the class's own name.
  const listName = spellListLabel(input.list);
  const displayList = input.list.startsWith("homebrew-") ? listName : contentName("classes", listName, locale);
  const after: CasterView = {
    ...before,
    level: input.level,
    subclass: input.subclass,
    known: [...before.known],
    prepared: [...before.prepared],
    cantrips: [...before.cantrips],
    pending: [...before.pending],
    spellbook: [...before.spellbook],
    ...(input.features ? { features: input.features } : {}),
  };
  let granted = grantedSpellsOf(after);
  const isGranted = (name: string) => has(granted, name);
  // The Mystic Arcanum reaches past pact slots for a class that holds one
  // (src/lib/srd/mystic-arcanum.ts); a setting pact caster stops at 5th.
  const top = Math.max(maxSpellLevelOf(after), mysticArcanumTop(before.classId, input.level));

  // ---- what the player asked for, as lists ----
  let removed: string[] = [];
  if (picks?.kind === "picks") {
    const held = [...after.cantrips, ...after.known, ...after.prepared, ...after.pending, ...after.spellbook];
    for (const name of dedupeNames(picks.spells)) {
      if (has(held, name) || isGranted(name)) {
        continue;
      }
      const spell = input.spellOf(name);
      if (!spell) {
        return { error: unknownSpell(name, displayList, locale) };
      }
      if (spell.level === 0) {
        after.cantrips.push(spell.name);
      } else if (after.style === "known") {
        after.known.push(spell.name);
      } else if (after.style === "spellbook") {
        // The book holds what was prepared before it was kept as a list.
        after.spellbook = dedupeNames([...spellbookOf(after), spell.name]);
      } else {
        after.prepared.push(spell.name);
      }
    }
    const forget = (picks.forget ?? "").trim();
    // One of a sorcerer origin's own spells given up (a Divine Soul's affinity
    // spell, a psionic or clockwork spell) is replaced under its feature's
    // rule and stays free of the count (src/lib/dm/ar-ws-origin-swap.ts).
    const swapped = forget ? originSwap({ before, after, forget, top, spellOf: input.spellOf, locale }) : null;
    if (swapped && "error" in swapped) {
      return { error: swapped.error };
    }
    if (swapped) {
      Object.assign(after, { features: swapped.features, known: swapped.known, prepared: swapped.prepared, cantrips: swapped.cantrips });
      granted = grantedSpellsOf(after);
    } else if (forget) {
      if (after.style !== "known" || !has(before.known, forget)) {
        return { error: t("{name} is not a spell this character knows, so it cannot be given up for another.", { name: forget }) };
      }
      after.known = after.known.filter((name) => textKey(name) !== textKey(forget));
      removed = [forget];
    }
  } else if (picks?.kind === "lists") {
    const wanted = picks.lists;
    const legacyKnown = after.style === "known" && !before.known.length && before.prepared.length > 0;
    after.cantrips = dedupeNames(wanted.cantrips ?? []);
    after.known = dedupeNames(wanted.known ?? []);
    after.prepared = dedupeNames(wanted.prepared ?? []);
    after.pending = dedupeNames(wanted.pending ?? before.pending);
    after.spellbook = dedupeNames(wanted.spellbook ?? before.spellbook);
    if (after.style === "known" && !legacyKnown) {
      const apart = after.prepared.filter((name) => !has(after.known, name) && !isGranted(name));
      if (apart.length) {
        return {
          error: t("A {label} knows its spells and prepares none; {spells} would be held beside the spells known. Learn them as spells known, within the number the class knows.", { label, spells: apart.join(", ") }),
        };
      }
    }
    const lostCantrips = before.cantrips.filter((name) => !has(after.cantrips, name));
    if (lostCantrips.length) {
      return {
        error: t("A cantrip, once known, is known for good; {spells} cannot be replaced at a level-up.", { spells: lostCantrips.join(", ") }),
      };
    }
    const heldBefore = after.style === "known" ? (before.known.length ? before.known : before.prepared) : [];
    const heldAfter = after.known.length ? after.known : after.prepared;
    removed = heldBefore.filter((name) => !has(heldAfter, name) && !isGranted(name));
    if (after.style === "spellbook") {
      const torn = spellbookOf(before).filter(
        (name) => !has(spellbookOf(after), name),
      );
      if (torn.length) {
        return { error: t("{spells} is written in the spellbook and stays there; a level-up adds to the book.", { spells: torn.join(", ") }) };
      }
    }
  }
  if (removed.length > 1) {
    return {
      error: t("On gaining a level a {label} may replace one spell they know with another, not {count} ({spells}).", { label, count: removed.length, spells: removed.join(", ") }),
    };
  }

  // The subclass's always-prepared spells arrive on their own, free; a
  // cantrip among them (the Light Domain's light) with the cantrips, where
  // a cantrip is kept and cast.
  for (const name of granted) {
    if (isCantripName(name)) {
      if (!has(after.cantrips, name)) {
        after.cantrips.push(name);
      }
      after.known = after.known.filter((entry) => textKey(entry) !== textKey(name));
      after.prepared = after.prepared.filter((entry) => textKey(entry) !== textKey(name));
      continue;
    }
    const home = after.style === "known" ? after.known : after.prepared;
    if (!has([...after.known, ...after.prepared, ...after.pending], name)) {
      home.push(name);
    }
  }

  // ---- every new name: a real spell, on the list, within reach ----
  const newCantrips = added(after.cantrips, before.cantrips).filter((name) => !isGranted(name));
  const beforeSpells = [...before.known, ...before.prepared, ...before.pending, ...before.spellbook];
  const newSpells = added(
    [...after.known, ...after.prepared, ...after.pending, ...after.spellbook],
    beforeSpells,
  ).filter((name) => !isGranted(name));
  // A pick off the class's list is one Magical Secrets or the Book of
  // Shadows lets in, as far as their number reaches (class-spell-grants.ts).
  // A patron's expanded spells and a Divine Soul's cleric list widen it.
  // One answer with the server's check and the builder's pool
  // (spell-prep.ts spellOnCasterList), a workshop class's own list included.
  const onList = (spell: SpellFacts) => spellOnCasterList(after, spell);
  const grants = classSpellGrants(after);
  const strays: Array<{ name: string; cantrip: boolean; ritual?: boolean }> = [];
  for (const name of newCantrips) {
    const spell = input.spellOf(name);
    if (!spell) {
      return { error: unknownSpell(name, displayList, locale) };
    }
    if (spell.level !== 0) {
      return { error: t("{name} is a level {level} spell, not a cantrip; it cannot sit on the cantrip list.", { name: spell.name, level: spell.level }) };
    }
    if (!onList(spell)) {
      if (!grants.anyList) {
        return { error: t("{name} is not a {list} cantrip, so a {label} cannot learn it.", { name: spell.name, list: displayList, label }) };
      }
      strays.push({ name: spell.name, cantrip: true });
    }
  }
  for (const name of newSpells) {
    const spell = input.spellOf(name);
    if (!spell) {
      return { error: unknownSpell(name, displayList, locale) };
    }
    if (spell.level === 0) {
      return { error: t("{name} is a cantrip; it belongs on the cantrip list, not among the spells.", { name: spell.name }) };
    }
    if (!onList(spell)) {
      if (!grants.anyListSpells) {
        return { error: t("{name} is not on the {list} spell list, so a {label} cannot learn or prepare it.", { name: spell.name, list: displayList, label }) };
      }
      strays.push({ name: spell.name, cantrip: false, ritual: Boolean(spell.ritual) });
    }
    if (spell.level > top) {
      return {
        error:
          top === 0
            ? t("A {label} has no spell slots yet, so {name} cannot be learned.", { label, name: spell.name })
            : t("{name} is a level {level} spell; a {label} casts up to level {top}.", { name: spell.name, level: spell.level, label, top }),
      };
    }
  }

  if (strays.length) {
    // What the caster already held off the list, and still holds: spells an
    // earlier Magical Secrets brought (a race's cantrips may be off it too,
    // and are left out by their count).
    const keptNow = new Set([...after.cantrips, ...after.known, ...after.prepared, ...after.pending, ...after.spellbook].map(textKey));
    const offBefore = (names: string[]) =>
      dedupeNames(names).filter((name) => {
        const spell = keptNow.has(textKey(name)) && !isGranted(name) ? input.spellOf(name) : null;
        return Boolean(spell && !onList(spell));
      }).length;
    const keptCantrips = grants.anyList ? Math.max(0, offBefore(before.cantrips) - input.freeCantrips) : 0;
    const kept = keptCantrips + (grants.anyListSpells ? offBefore(beforeSpells) : 0);
    const [refusal] = offListProblems({
      grants,
      allowedBefore: classSpellGrants({ ...before, features: after.features }).anyList,
      kept,
      strays,
      list: displayList,
      label,
      locale,
    });
    if (refusal) {
      return { error: refusal };
    }
  }

  // ---- a third caster's two schools (src/lib/srd/third-caster.ts) ----
  if (newSpells.length) {
    const schoolOf = (name: string) => ({ name, school: input.spellOf(name)?.school ?? null });
    // A workshop subclass's own additions to the list are its author's
    // picks, outside the two schools' count (issue #833).
    const added = new Set(widerListOf(after).spells.map(textKey));
    const levelled = (list: string[]) => dedupeNames(list).filter((name) => !isGranted(name) && !added.has(textKey(name))).map(schoolOf);
    const schools = thirdCasterSchoolProblem({
      classId: before.classId,
      subclass: input.subclass,
      profile: after.progression,
      level: input.level,
      spells: levelled(after.known.length ? after.known : after.prepared),
      locale,
      heldOutside: thirdCasterOutside(
        before.classId,
        levelled(before.known.length ? before.known : before.prepared),
        after.progression ?? before.progression,
      ),
    });
    if (schools) {
      return { error: schools };
    }
  }

  // ---- the counts ----
  // A warlock's arcana sit beside the Spells Known column (mystic-arcanum.ts
  // arcanumSplit): one of each level reached, never counted in it.
  const levelOf = (name: string) => input.spellOf(name)?.level ?? null;
  const arcanaAfter = arcanumSplit(after, after.known.length ? after.known : after.prepared, levelOf);
  const arcanaBefore = arcanumSplit(before, before.known.length ? before.known : before.prepared, levelOf);
  const extraArcanum = arcanumExtraProblem(arcanaAfter, levelOf, after.classId, locale);
  if (extraArcanum && arcanaAfter.extra.some((name) => !has(arcanaBefore.extra, name))) {
    return { error: extraArcanum };
  }
  const notArcanum = (arcana: { arcanum: string[] }) => (name: string) => !has(arcana.arcanum, name);
  const tableCantrips = cantripCapOf(after);
  const cantripCap = tableCantrips === null ? null : tableCantrips + grants.extraCantrips;
  // A subclass's own cantrips are known on top of the column.
  const cantrips = dedupeNames(after.cantrips).filter((name) => !isGranted(name));
  if (newCantrips.length && cantripCap === null) {
    return { error: t("A {label} knows no cantrips.", { label }) };
  }
  if (cantripCap !== null && newCantrips.length && cantrips.length - input.freeCantrips > cantripCap) {
    return {
      error: translatePlural(locale, "A {label} knows {count} cantrip; that list would have {actual}.", "A {label} knows {count} cantrips; that list would have {actual}.", { label, count: cantripCap, actual: cantrips.length - input.freeCantrips }),
    };
  }
  // The cantrip a third caster's Spellcasting names (an Arcane Trickster's
  // Mage Hand), once the new cantrips fill the list.
  const namedCantrip = newCantrips.length
    ? thirdCasterCantripProblem({
        classId: before.classId,
        subclass: input.subclass,
        profile: after.progression,
        level: input.level,
        // A race's cantrips sit on top of the class's, so the list is full at
        // the class's count plus theirs.
        cantrips,
        locale,
        cap: cantripCap === null ? null : cantripCap + input.freeCantrips,
      })
    : null;
  if (namedCantrip) {
    return { error: namedCantrip };
  }
  const tableCap = spellCapOf(after, input.abilities);
  const cap = tableCap ? { ...tableCap, count: tableCap.count + grants.extraSpells } : null;
  if (after.style === "spellbook") {
    const written = added(spellbookOf(after), spellbookOf(before)).filter((name) => !isGranted(name));
    const allowance = input.firstLevel ? spellbookAllowance(input.level) : 2;
    if (written.length > allowance) {
      return {
        error: t("A wizard writes {count} new spells in the spellbook at this level, not {actual}.", { count: allowance, actual: written.length }),
      };
    }
    const book = [...after.spellbook, ...spellbookOf(before)];
    const unwritten = [...after.prepared, ...after.pending].filter(
      (name) => !has(book, name) && !isGranted(name),
    );
    if (unwritten.length) {
      return {
        error: t(unwritten.length === 1 ? "A wizard prepares only spells written in the spellbook; {spells} is not in it. Write them in the book first, two a level." : "A wizard prepares only spells written in the spellbook; {spells} are not in it. Write them in the book first, two a level.", { spells: unwritten.join(", ") }),
      };
    }
    if (picks?.kind === "picks") {
      // Written in the book, and prepared as far as the limit has room.
      let room = cap ? Math.max(0, cap.count - preparedCount(after)) : written.length;
      for (const name of written) {
        if (room <= 0) {
          break;
        }
        after.prepared.push(name);
        room -= 1;
      }
    }
    if (cap && preparedCount(after) > cap.count && added(after.prepared, before.prepared).length) {
      return {
        error: t("A {label} may hold {count} {cap}; that list would have {actual}.", { label, count: cap.count, cap: t(cap.label), actual: preparedCount(after) }),
      };
    }
  } else if (cap) {
    const held =
      after.style === "known"
        ? dedupeNames(after.known.length ? after.known : after.prepared).filter((name) => !isGranted(name)).filter(notArcanum(arcanaAfter)).length
        : preparedCount(after);
    const grew =
      newSpells.length > 0 ||
      held >
        (after.style === "known"
          ? dedupeNames(before.known.length ? before.known : before.prepared).filter((name) => !isGranted(name)).filter(notArcanum(arcanaBefore)).length
          : preparedCount(before));
    if (grew && held > cap.count) {
      return {
        error: t("A {label} may hold {count} {cap}; that list would have {actual}.", { label, count: cap.count, cap: t(cap.label), actual: held }),
      };
    }
  } else if (newSpells.length) {
    return { error: t("A {label} has no spells to learn yet.", { label }) };
  }

  return { view: after };
}
