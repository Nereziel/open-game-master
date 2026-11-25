// What a character is trained in, from what grants it.
//
// A class gives two saving throws, its armor, weapon and tool training and a
// count of skills from its own list; a background gives skills, tools and
// languages; a race gives what its traits say; a class taken second gives the
// multiclass row and never a saving throw. Training is derived and written by
// the server. Skills, expertise and chosen languages are the player's picks,
// so they are checked: every pick needs a grant that offers it.
import { fitName, LANGUAGE_NAME_MAX, TOOL_NAME_MAX, type Ability, type ClassEntry, type Proficiencies } from "@/lib/schemas/sheet";
import { findSkill, skillLabel } from "@/lib/srd";
import { expertiseAllowed, expertiseSlotsFor } from "@/lib/srd/features";
import { multiclassGrantsFor } from "@/lib/srd/multiclass";
import { repeatedGrants } from "@/lib/srd/racial-grants";
import {
  repeatedToolChoice,
  splitToolGrants,
  toolChoiceOf,
  toolPickProblem,
  toolPicksOwed,
} from "@/lib/srd/tool-choices";
import {
  lower,
  uniqueNames,
  type BackgroundGrants,
  type ClassGrants,
  type RaceGrants,
} from "@/lib/srd/legality/types";
import { textKey } from "@/lib/language/text-logic";
import { KNOWN_TOOLS } from "@/lib/srd/feat-grant-text";
import { translate, translatePlural, type Locale } from "@/lib/messages-logic";
import { contentName } from "@/lib/content/names";

export type ProficiencyInput = {
  locale?: Locale;
  sent: Proficiencies;
  classes: ClassEntry[];
  classOf: (classId: string) => ClassGrants | null;
  race: RaceGrants;
  background: BackgroundGrants | null;
  racialTool: string;
  // The weapons named from the race's weaponChoice.
  racialWeapons?: string[];
  // Skills or tools named from the race's trainingChoice, and the skill its
  // expertiseChoice doubles.
  racialTraining?: string[];
  racialExpertise?: string;
  // Training the stored character already holds, on an edit: earned in play
  // (a second class's pick, a DM's grant) and kept.
  held?: Proficiencies | null;
  // A character made here names the tools an open grant leaves to it ("three
  // musical instruments"). A stored one may still carry the grant's words.
  requireToolPicks?: boolean;
  // Tools a subclass or a feat names outright (an Alchemist's alchemist's
  // supplies, a Chef's cook's utensils). The sheet carries them beside the
  // class's and background's picks, and the subclass and feat grants write
  // them back after this; they are not picks of an open tool grant.
  grantedTools?: string[];
  // Skills a subclass or a feat gives (a Lore bard's three, Skilled's),
  // written back with their grants after this: the class's expertise may
  // double them too (SRD 5.1, Bard and Rogue: "choose two of your skill
  // proficiencies"), as the level-up already allows.
  grantedSkills?: string[];
};

export type ProficiencyVerdict = { problems: string[]; proficiencies: Proficiencies };

type Slot = { label: string; count: number; from: Set<string> | null };

// Every pick placed on a slot that offers it, or null when they cannot all
// be. The lists are a handful long, so plain backtracking is enough.
function placePicks(picks: string[], slots: Slot[]): boolean {
  const left = slots.map((slot) => slot.count);
  // The pick with the fewest slots open to it goes first.
  const ordered = [...picks].sort(
    (a, b) =>
      slots.filter((slot) => !slot.from || slot.from.has(a)).length -
      slots.filter((slot) => !slot.from || slot.from.has(b)).length,
  );
  const place = (index: number): boolean => {
    if (index === ordered.length) {
      return true;
    }
    for (let slot = 0; slot < slots.length; slot += 1) {
      if (left[slot] > 0 && (!slots[slot].from || slots[slot].from!.has(ordered[index]))) {
        left[slot] -= 1;
        if (place(index + 1)) {
          return true;
        }
        left[slot] += 1;
      }
    }
    return false;
  };
  return place(0);
}

// A language or a tool as a sheet holds it. The sheet fits a long name to
// its field (src/lib/schemas/sheet.ts), so what a player sends back may be
// the fitted copy of a workshop or content pack grant; it is still that
// grant, not a language or tool they chose.
const languageKey = (name: string) => textKey(fitName(name, LANGUAGE_NAME_MAX));
const toolKey = (name: string) => textKey(fitName(name, TOOL_NAME_MAX));

function counted(count: number, word: "weapon" | "skill" | "language", locale: Locale): string {
  switch (word) {
    case "weapon": return translatePlural(locale, "{count} weapon", "{count} weapons", { count });
    case "skill": return translatePlural(locale, "{count} skill", "{count} skills", { count });
    case "language": return translatePlural(locale, "{count} language", "{count} languages", { count });
  }
}

export function judgeProficiencies(input: ProficiencyInput): ProficiencyVerdict {
  const problems: string[] = [];
  const { sent, race, background, held } = input;
  const locale = input.locale ?? "en";
  const raceName = contentName("species", race.name, locale);
  const backgroundName = background ? contentName("backgrounds", background.name, locale) : "";
  const shownSkill = (id: string) => locale === "en" ? id : skillLabel(id, locale);
  const skillList = (ids: string[]) => ids.map(shownSkill).join(", ");
  const [first, ...others] = input.classes;
  const primary = input.classOf(first.id);
  const heldSkills = new Set((held?.skills ?? []).map(lower));
  const heldLanguages = new Set((held?.languages ?? []).map(languageKey));

  // ---- training: one legal answer, so it is written, not read ----
  const secondary = others.map((entry) => multiclassGrantsFor(entry.id));
  const armor = uniqueNames([
    ...(primary?.armor ?? []),
    ...(race.armor ?? []),
    ...secondary.flatMap((grant) => grant.armor),
    ...(held?.armor ?? []),
  ]);
  // The weapons a race lets the player name: each from its list, as many as
  // it offers. Before this the pick was never asked, and a derro of the
  // mutated caste was trained in no weapon its text promised.
  const weaponChoice = race.weaponChoice;
  const racialWeapons = uniqueNames((input.racialWeapons ?? []).filter(Boolean));
  const offWeapons = racialWeapons.filter((name) => !weaponChoice?.from.some((weapon) => textKey(weapon) === textKey(name)));
  if (offWeapons.length) {
    problems.push(translatePlural(locale, "{names} is not a weapon the {race} may choose{choices}.", "{names} are not weapons the {race} may choose{choices}.", { count: offWeapons.length, names: offWeapons.join(", "), race: raceName, choices: weaponChoice ? translate(locale, "; pick from {choices}", { choices: weaponChoice.from.map(name => contentName("weapons", name, locale)).join(", ") }) : "" }));
  }
  if (weaponChoice && racialWeapons.length > weaponChoice.count) {
    problems.push(translate(locale, "The {race} names {weapons}; {actual} were chosen.", { race: raceName, weapons: counted(weaponChoice.count, "weapon", locale), actual: racialWeapons.length }));
  }
  if (weaponChoice && input.requireToolPicks && racialWeapons.length < weaponChoice.count) {
    problems.push(translate(locale, "Name the {weapons} the {race} is trained with.", { race: raceName, weapons: counted(weaponChoice.count, "weapon", locale) }));
  }
  const weapons = uniqueNames([
    ...(primary?.weapons ?? []),
    ...(race.weapons ?? []),
    ...(offWeapons.length ? [] : racialWeapons.slice(0, weaponChoice?.count ?? 0)),
    ...secondary.flatMap((grant) => grant.weapons),
    ...(held?.weapons ?? []),
  ]);
  const toolChoice = race.toolChoice;
  const racialTool =
    toolChoice && toolChoice.from.some((tool) => textKey(tool) === textKey(input.racialTool))
      ? input.racialTool
      : "";
  if (input.racialTool && !racialTool) {
    problems.push(
      translate(locale, "{name} is not a tool the {race} may choose{choices}.", { name: input.racialTool, race: raceName, choices: toolChoice ? translate(locale, "; pick one of {choices}", { choices: toolChoice.from.map(name => contentName("gear", name, locale)).join(", ") }) : "" }),
    );
  }
  // A grant that leaves the tool to the player ("three musical
  // instruments", "one gaming set") is answered by named tools. A sheet that
  // names none keeps the grant's own wording, as sheets stored before the
  // choice existed do.
  const granted = splitToolGrants([
    ...(primary?.tools ?? []),
    ...(background?.tools ?? []),
    ...secondary.flatMap((grant) => grant.tools),
  ]);
  // Adaptable Acumen: skills or tools in any mix, as many as the race names.
  const trainingPicks = race.trainingChoice ? uniqueNames((input.racialTraining ?? []).filter(Boolean)).slice(0, race.trainingChoice.count) : [];
  const trainedToolPicks = trainingPicks.filter((pick) => KNOWN_TOOLS.some((tool) => textKey(tool) === textKey(pick)));
  const unknownPicks = trainingPicks.filter((pick) => !trainedToolPicks.includes(pick) && !findSkill(lower(pick)));
  if (unknownPicks.length) {
    problems.push(translate(locale, "{names}: neither a skill nor a tool the {race} may be trained in.", { names: unknownPicks.join(", "), race: raceName }));
  }
  if (race.trainingChoice && input.requireToolPicks && trainingPicks.length < race.trainingChoice.count) {
    problems.push(translate(locale, "Name the {count} skills or tools the {race} is trained in.", { count: race.trainingChoice.count, race: raceName }));
  }
  // A tool the class, the background and the race each name (a rogue
  // criminal's thieves' tools) is a tool of the player's choice in place of
  // the second, after the open grants so their picks fill those first. It
  // may be left unpicked: a sheet made before it was offered still stands.
  const replacement = repeatedToolChoice(primary?.tools, background?.tools, race.tools);
  if (replacement) {
    granted.choices.push(replacement);
  }
  const fixedTools = uniqueNames([...granted.fixed, ...(race.tools ?? []), racialTool, ...trainedToolPicks].filter(Boolean));
  const heldTools = new Set((held?.tools ?? []).map(toolKey));
  const fixedToolKeys = new Set(fixedTools.map(toolKey));
  // A grant's own words ("one type of gaming set"), fitted or whole.
  const grantWordKeys = new Set(
    [...(primary?.tools ?? []), ...(background?.tools ?? []), ...secondary.flatMap((grant) => grant.tools)]
      .filter((tool) => toolChoiceOf(tool))
      .map(toolKey),
  );
  const grantWords = (tool: string) => Boolean(toolChoiceOf(tool)) || grantWordKeys.has(toolKey(tool));
  const toolPicks = uniqueNames(
    (sent.tools ?? []).filter(
      (tool) => !grantWords(tool) && !fixedToolKeys.has(toolKey(tool)) && !heldTools.has(toolKey(tool)),
    ),
  ).map(lower);
  // A tool a subclass or feat names is its grant's, not a pick: read as one
  // it overfilled the open grant, and every Alchemist, Armorer, Rune Knight,
  // Drunken Master or Mercy monk whose class or background pick was another
  // tool was refused ("alchemist's supplies is not a tool this character may
  // choose"). It still answers the open grant when it is the player's only
  // pick there (an artificer who took alchemist's supplies as the class's
  // artisan's tools and then the Alchemist).
  const grantedToolKeys = new Set((input.grantedTools ?? []).map(toolKey));
  const ownPicks = toolPicks.filter((tool) => !grantedToolKeys.has(toolKey(tool)));
  const picked =
    ownPicks.length < toolPicks.length && toolPickProblem(granted.choices, ownPicks) && !toolPickProblem(granted.choices, toolPicks)
      ? toolPicks
      : ownPicks;
  let chosenTools: string[] = [];
  let toolProblemIndex = -1;
  if (granted.choices.length && picked.length) {
    const problem = toolPickProblem(granted.choices, picked);
    if (problem) {
      toolProblemIndex = problems.length;
      problems.push(problem);
    }
    chosenTools = picked;
  }
  if (input.requireToolPicks && granted.choices.length) {
    // Picks kept from the stored character (an edit) answer their choice too.
    const named = (sent.tools ?? []).filter((tool) => !grantWords(tool) && !fixedToolKeys.has(toolKey(tool)));
    const owed = toolPicksOwed(granted.choices, named);
    if (owed && !problems.some((problem) => problem.startsWith("Choose "))) {
      problems.push(toolPicksOwed(granted.choices, named, input.locale) ?? owed);
    }
  }
  // Keep the existing English duplicate-refusal check above independent of reader locale.
  if (toolProblemIndex >= 0) {
    problems[toolProblemIndex] = toolPickProblem(granted.choices, picked, input.locale) ?? problems[toolProblemIndex];
  }
  // A tool an edited character already holds answers its open grant as a
  // fresh pick does: a soldier's dice set is the "one gaming set", and the
  // grant's words are not written back beside it (nor kept, where an earlier
  // edit did write them).
  const heldAnswers = (held?.tools ?? []).some((tool) => granted.choices.some((choice) => choice.from.some((option) => textKey(option) === textKey(tool))));
  // In the grants' own order; the named picks take the place of the words.
  // Each is written as the sheet holds it.
  const answered = (tool: string) => !((chosenTools.length || heldAnswers) && grantWords(tool));
  const tools = uniqueNames(
    [
      ...(primary?.tools ?? []).filter(answered),
      ...(background?.tools ?? []).filter(answered),
      ...(race.tools ?? []),
      racialTool,
      ...trainedToolPicks,
      ...secondary.flatMap((grant) => grant.tools).filter(answered),
      ...chosenTools,
      ...(held?.tools ?? []).filter(answered),
    ].map((tool) => fitName(tool, TOOL_NAME_MAX)),
  );
  const saves = uniqueNames([...(primary?.saves ?? []), ...(held?.saves ?? [])]) as Ability[];

  // ---- skills ----
  const fixed = uniqueNames([...(background?.skills ?? []), ...(race.skills ?? [])].map(lower));
  const sentSkills = uniqueNames(sent.skills.map(lower));
  for (const skill of sentSkills) {
    if (!findSkill(skill)) {
      problems.push(translate(locale, "\"{skill}\" is not one of the eighteen skills.", { skill }));
    }
  }
  const picks = sentSkills.filter(
    (skill) => findSkill(skill) && !fixed.includes(skill) && !heldSkills.has(skill),
  );
  const slots: Slot[] = [];
  if (background?.skillChoice) {
    slots.push({
      label: backgroundName,
      count: background.skillChoice.count,
      from: new Set(background.skillChoice.from.map(lower)),
    });
  }
  if (primary) {
    slots.push({
      label: contentName("classes", primary.name, locale),
      count: primary.skillChoices.count,
      from: primary.skillChoices.from.length
        ? new Set(primary.skillChoices.from.map(lower))
        : null,
    });
  }
  if (race.skillChoice) {
    const from = race.skillChoice.from ?? [];
    slots.push({ label: raceName, count: race.skillChoice.count, from: from.length ? new Set(from.map(lower)) : null });
  }
  const trainedSkillCount = trainingPicks.length - trainedToolPicks.length - unknownPicks.length;
  if (trainedSkillCount > 0) {
    slots.push({ label: raceName, count: trainedSkillCount, from: null });
  }
  // The same skill from the background and the race: the player chooses
  // another in its place (SRD 5.1, Backgrounds).
  const repeated = repeatedGrants(background?.skills, race.skills).length;
  if (repeated) {
    slots.push({ label: translate(locale, "the repeated grant"), count: repeated, from: null });
  }
  secondary.forEach((grant, index) => {
    if (grant.skillChoice) {
      slots.push({
        label: contentName("classes", others[index].id, locale),
        count: grant.skillChoice.count,
        from: grant.skillChoice.from.length ? new Set(grant.skillChoice.from.map(lower)) : null,
      });
    }
  });
  if (picks.length && !placePicks(picks, slots)) {
    const offered = slots
      .map(
        (slot) =>
          translate(locale, "{skills} from {label} ({choices})", { skills: counted(slot.count, "skill", locale), label: slot.label, choices: slot.from ? skillList([...slot.from]) : translate(locale, "any") }),
      )
      .join("; ");
    problems.push(
      translate(locale, "The skills chosen ({picks}) are more than, or other than, what this character is offered: {offered}. {fixed}", { picks: skillList(picks), offered: offered || translate(locale, "no skill of their choice"), fixed: fixed.length ? translate(locale, "{skills} come with the background and race.", { skills: fixed.map(shownSkill).join(` ${translate(locale, "and")} `) }) : "" }).trim(),
    );
  }
  const skills = uniqueNames([
    ...fixed,
    ...(held?.skills ?? []).map(lower).filter((skill) => findSkill(skill)),
    ...sentSkills.filter((skill) => findSkill(skill)),
  ]);

  // ---- expertise ----
  const heldExpertise = new Set((held?.expertise ?? []).map(lower));
  const expertise = uniqueNames([...(held?.expertise ?? []), ...(sent.expertise ?? [])].map(lower));
  const classIds = input.classes.map((entry) => entry.id);
  // A race's expertise may double a tool held (Adaptable Acumen: "one of
  // those skills or tools"), as a rogue's may double thieves' tools.
  const racialToolExpertise = race.expertiseChoice ? lower(input.racialExpertise ?? "") : "";
  const toolHeld = (pick: string) => pick === racialToolExpertise && tools.some((tool) => lower(tool) === pick);
  const unproficient = expertise.filter((skill) => !expertiseAllowed(skill, [...skills, ...(input.grantedSkills ?? []).map(lower)], classIds) && !toolHeld(skill));
  if (unproficient.length) {
    problems.push(
      translatePlural(locale, "Expertise doubles a proficiency the character has; {skills} is not among their skills.", "Expertise doubles a proficiency the character has; {skills} are not among their skills.", { count: unproficient.length, skills: skillList(unproficient) }),
    );
  }
  // A race's own expertise (Adaptable Acumen) adds to the class's.
  const expertiseSlots = input.classes.reduce(
    (sum, entry) => sum + expertiseSlotsFor(entry.id, entry.level),
    0,
  ) + (race.expertiseChoice ?? 0);
  const expertisePicks = expertise.filter((skill) => !heldExpertise.has(skill));
  if (expertisePicks.length > Math.max(0, expertiseSlots - heldExpertise.size)) {
    problems.push(
      expertiseSlots
        ? translate(locale, "This character has earned expertise in {skills}{tools}, not {actual}.", { skills: counted(expertiseSlots, "skill", locale), tools: race.expertiseChoice ? translate(locale, " or tool") : "", actual: expertise.length })
        : translate(locale, "Expertise is a rogue's feature (1st and 6th level) and a bard's (3rd and 10th); this character has none to pick."),
    );
  }

  // ---- languages ----
  const spoken = uniqueNames([
    ...race.languages,
    ...input.classes.flatMap((entry) => input.classOf(entry.id)?.languages ?? []),
    ...(background?.knownLanguages ?? []),
  ]);
  const spokenKeys = new Set(spoken.map(languageKey));
  const chosen = uniqueNames(sent.languages).filter(
    (language) => !spokenKeys.has(languageKey(language)) && !heldLanguages.has(languageKey(language)),
  );
  const languageSlots = (race.bonusLanguages ?? 0) + (background?.languages ?? 0);
  if (chosen.length > languageSlots) {
    problems.push(
      translate(locale, "{sources} give {languages} of the player's choice; {actual} were chosen ({chosen}).", { sources: background ? `${raceName} ${translate(locale, "and")} ${backgroundName}` : raceName, languages: counted(languageSlots, "language", locale), actual: chosen.length, chosen: chosen.join(", ") }),
    );
  }
  const languages = uniqueNames(
    [...spoken, ...(held?.languages ?? []), ...chosen].map((language) => fitName(language, LANGUAGE_NAME_MAX)),
  );

  return {
    problems,
    proficiencies: { saves, skills, expertise, languages, tools, armor, weapons },
  };
}
