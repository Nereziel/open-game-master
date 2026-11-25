// "What does this actually do?" for every game term a player meets.
//
// The app already held rules text in four places, all of it written for the
// DM model rather than for a person: guidance strings on FEATURE_EFFECTS and
// RESOURCE_DEFS, the rules text on authored subclass features, and the
// one-liners on custom genre-class features. This module resolves all of them
// behind one call, and srd-features.json fills the last gap (the 131 SRD
// feature names that had no text anywhere).
//
// Pure data and pure functions with no server imports, so client components
// can import it directly, exactly like src/lib/srd/features.ts.

import glossaryJson from "@/lib/help/glossary.json";
import srdFeaturesJson from "@/lib/help/srd-features.json";
import starterSpellsJson from "@/lib/help/starter-spells.json";
import skillsJson from "@/lib/srd/skills.json";
import { skillLabel } from "@/lib/srd";
import { speciesTraitName } from "@/lib/content/names";
import { damageTypeWord } from "@/lib/dm/damage-logic";
import { describeBackgroundFeature } from "@/lib/backgrounds";
import { classFeatureDescription, spellClassFor } from "@/lib/classes";
import { srdRaceFor } from "@/lib/content/race-options";
import { normalizeRulesText } from "@/lib/help/rules-text";
import { textKey } from "@/lib/language/text-logic";
import { matchResource } from "@/lib/srd/class-resources";
import { resourceGuidance } from "@/lib/srd/class-resources-fr";
import type { Locale } from "@/lib/messages-logic";
import { translate, translatePlural } from "@/lib/i18n/translate";
import { gameTermWord } from "@/lib/i18n/game-term-labels";
import { guidanceFor } from "@/lib/srd/feature-effects";
import { subclassFeatureDescription } from "@/lib/srd/features";
import { findOptionByFeatureName } from "@/lib/srd/options";
import { subclassChoicePickDescription } from "@/lib/srd/subclass-choice-picks";
import { choiceDamageTypeOf } from "@/lib/srd/chosen-element";

export type GlossaryTerm = {
  id: string;
  term: string;
  // The official French name, from Wizards of the Coast's own French SRD 5.1
  // (CC-BY-4.0); present on every entry. The explanation bodies below are
  // this fork's own translations written with that vocabulary, not WotC text.
  fr?: string;
  short: string;
  // The French of `short`, present on every entry.
  shortFr?: string;
  cs?: string;
  shortCs?: string;
  longCs?: string;
  long?: string;
  // The French of `long`, present wherever `long` is.
  longFr?: string;
};

const TERMS = (glossaryJson as { terms: GlossaryTerm[] }).terms;
const TERMS_BY_ID = new Map(TERMS.map((entry) => [entry.id, entry]));

const SRD_FEATURE_TEXT = (srdFeaturesJson as { features: Record<string, string> }).features;
const SRD_FEATURE_BY_CLASS = (
  srdFeaturesJson as { byClass: Record<string, Record<string, string>> }
).byClass;

export function glossaryTerms(): GlossaryTerm[] {
  return TERMS;
}

export function glossaryTerm(id: string): GlossaryTerm | null {
  return TERMS_BY_ID.get(id) ?? null;
}

// Adapt the existing data fields once; consumers do not branch on language.
export function localizedGlossaryTerm(entry: GlossaryTerm, locale: Locale) {
  const translations: Partial<Record<Locale, { term?: string; short?: string; long?: string }>> = {
    fr: { term: entry.fr, short: entry.shortFr, long: entry.longFr },
    cs: { term: entry.cs, short: entry.shortCs, long: entry.longCs },
  };
  const localized = translations[locale];
  return { label: localized?.term, term: localized?.term ?? entry.term, short: localized?.short ?? entry.short, long: localized?.long ?? entry.long };
}

// Numbered SRD variants ("Indomitable (2 uses)", "Extra Attack (2)") are
// listed in full where the count changes the meaning, and fall back to the
// bare name where it does not.
function baseName(name: string): string {
  const paren = name.indexOf(" (");
  return paren === -1 ? name : name.slice(0, paren);
}

// An entry written for this exact feature name. Checked before the resource
// and effect tables, which read a bracket note away: "Indomitable (2 uses)"
// there is Indomitable, here it is the use count the note gives.
function exactSrdText(classId: string, name: string): string | null {
  const byClass = SRD_FEATURE_BY_CLASS[classId.trim().toLowerCase()];
  return byClass?.[name] ?? SRD_FEATURE_TEXT[name] ?? null;
}

function looseSrdText(classId: string, name: string): string | null {
  const byClass = SRD_FEATURE_BY_CLASS[classId.trim().toLowerCase()];
  return byClass?.[baseName(name)] ?? SRD_FEATURE_TEXT[baseName(name)] ?? null;
}

// The guidance strings were written to be read in a tool result, where naming
// the feature first is useful. In a dialog already titled with that name it
// just stutters, so a leading "Feature name:" is trimmed off.
function stripLeadingLabel(text: string | null, name: string): string | null {
  if (!text) {
    return text;
  }
  const prefix = `${name.trim()}:`;
  return text.trim().toLowerCase().startsWith(prefix.toLowerCase())
    ? text.trim().slice(prefix.length).trim()
    : text;
}

// One line explaining a feature on a sheet. Resolution runs most specific
// first: a Life Domain cleric's Divine Strike says "radiant", a Nature
// Domain one says "cold", and only a feature with no subclass-specific
// meaning falls through to the shared SRD text. `locale` reads a matched
// resource's line in the reader's words (class-resources-fr.ts); the stored
// English def stays what the engine and the DM's tools read.
export function describeFeature(classId: string, subclass: string, name: string, locale: Locale = "en"): string | null {
  // An option pick ("Invocation: Agonizing Blast") explains itself from the
  // option list, before any of the feature tables are consulted.
  const option = findOptionByFeatureName(name);
  if (option) {
    const description = translate(locale, option.d);
    return option.req ? `${description} (${translate(locale, "Requires {req}", { req: translate(locale, option.req) })}.)` : description;
  }
  // A workshop subclass's pick ("Bloodline (Storm)") from the subclasses the
  // page registered (issue #833).
  const pick = subclassChoicePickDescription(name);
  if (pick) {
    return translate(locale, pick);
  }
  // The element's display sentence uses the common catalog. The stored
  // choice name and damage type are not changed.
  const element = choiceDamageTypeOf(name);
  if (element) {
    const message = "The element of the {label} chosen: {type}. Elemental Affinity, where the subclass has it, adds to spells of this damage type and resists it.";
    const displayLocale = translate(locale, message) === message ? "en" : locale;
    return translate(displayLocale, message, {
      label: translate(displayLocale, element.label),
      type: damageTypeWord(element.type, displayLocale),
    });
  }
  const resource = matchResource(name);
  const classText = classFeatureDescription(classId, name);
  const found =
    subclassFeatureDescription(classId, subclass, name) ??
    classText ??
    exactSrdText(classId, name) ??
    // The background's feature sits on the sheet as "Shelter of the
    // Faithful (Acolyte)"; the bare name finds its text.
    describeBackgroundFeature(baseName(name), locale) ??
    (resource ? resourceGuidance(resource.id, locale) ?? resource.guidance : null) ??
    guidanceFor({ class: classId, features: [], feature: name }) ??
    looseSrdText(classId, name);
  // Localize the text chosen by the original resolution order, not a less
  // specific description that happens to have a translation.
  const localized = found ? translate(locale, found) : found;
  return stripLeadingLabel(localized, name);
}

// Where a sheet's feature chip finds text the bundled tables do not hold: a
// content-pack background's feature ("Servant's Invisibility (Court
// Servant)") is written on the pack's background row, so the chip opens that
// row, which shows the background and its feature. Null when the bundled
// text answers, or the feature is not the background's.
export function backgroundFeatureReference(
  feature: { name: string; source?: string },
  background: string | null | undefined,
  classId = "",
  subclass = "",
): { kind: "backgrounds"; slug: string; name: string; exactSlug: true } | null {
  const slug = (background ?? "").trim();
  if (feature.source !== "background" || !slug || describeFeature(classId, subclass, feature.name)) {
    return null;
  }
  return { kind: "backgrounds", slug, name: baseName(feature.name), exactSlug: true };
}

// The bundled lineage lines. Racial traits are written to describe themselves
// ("Darkvision 60 ft", "Powerful Build (count as one size larger for
// carrying)"), so the trait list IS the description. A pack slug or the
// pack's "odm-" copy of a bundled race resolves to the same entry.
export function describeRace(raceId: string, locale: Locale = "en"): string | null {
  const race = srdRaceFor(raceId);
  return race ? race.traits.map((trait) => speciesTraitName(raceId, trait, locale)).join(". ") + "." : null;
}

// The sheet stores the canonical trait line; use the same reader-facing map
// as its title rather than looking up a class feature with the same name.
export function describeRaceTrait(raceId: string, name: string, locale: Locale): string | null {
  const localized = speciesTraitName(raceId, name, locale);
  return localized !== name ? localized : null;
}

const SKILLS = (skillsJson as { skills: Array<{ id: string; name: string; fr?: string; ability: string }> })
  .skills;

// A skill's line: which ability it uses, plus the glossary note on skills.
// The translator comes from the caller (home/types.ts agoLabel pattern), so
// the sentence and the names it weaves follow the reader's language; the
// glossary note itself stays English this pass.
export function describeSkill(
  t: (key: string, vars?: Record<string, string | number>) => string,
  skillId: string,
  locale: Locale = "en",
): string | null {
  const skill = SKILLS.find((entry) => entry.id === skillId.trim().toLowerCase());
  if (!skill) {
    return null;
  }
  const ability = glossaryTerm(skill.ability);
  const skillName = skillLabel(skill.id, locale);
  const localized = ability ? localizedGlossaryTerm(ability, locale) : undefined;
  const abilityName = localized?.term ?? skill.ability.toUpperCase();
  return `${t("{skill} uses {ability}.", { skill: skillName, ability: abilityName })} ${
    localized?.short ?? ""
  }`.trim();
}

function textOf(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") {
          return entry;
        }
        const trait = entry as { name?: unknown; desc?: unknown } | null;
        const desc = typeof trait?.desc === "string" ? trait.desc : "";
        const name = typeof trait?.name === "string" ? trait.name : "";
        return name && desc ? `**${name}.** ${desc}` : desc;
      })
      .filter(Boolean)
      .join("\n\n");
  }
  return "";
}

// The description carried on a content-pack or homebrew row. Pack rows keep
// the source's own field names, which differ between v1, v2 and the authored
// layer, so every spelling is tried, and the pieces some sources keep apart
// (a feat's benefits, a background's feature, a 2024 species' trait list)
// are put back together. Null when there is nothing to show.
// `focus` names the part asked about: a background's feature chip on a sheet
// opens the feature alone, not three paragraphs of the background's story
// with the feature at their foot.
export function describeContentEntry(data: Record<string, unknown> | undefined, focus?: string, locale: Locale = "en"): string | null {
  if (!data) {
    return null;
  }
  if (!focus && typeof data.localized_desc === "string" && data.localized_desc.trim()) {
    return normalizeRulesText(data.localized_desc) || null;
  }
  const focusFeature = typeof data.feature === "string" ? data.feature.trim() : "";
  const focusText = textOf(data.feature_desc).trim();
  if (focus && focusFeature && textKey(focus) === textKey(focusFeature) && typeof data.localized_desc === "string" && data.localized_desc.trim()) {
    // Reviewed expansion backgrounds carry one complete translated display
    // description, not separately aligned paragraphs. Prefer it to an
    // English-only feature excerpt; never fabricate a translated excerpt.
    return normalizeRulesText(data.localized_desc) || null;
  }
  if (focus && focusFeature && focusText && textKey(focus) === textKey(focusFeature)) {
    return normalizeRulesText(`**${translate(locale, "Feature")}: ${focusFeature}.** ${focusText}`) || null;
  }
  const parts: string[] = [];
  for (const key of ["desc", "description", "traits", "benefits"]) {
    const text = textOf(data[key]);
    if (text.trim()) {
      parts.push(text);
      break;
    }
  }
  // A Level Up feat keeps its flavor line in desc and its rules in
  // effects_desc, one benefit per entry.
  const effects = textOf(data.effects_desc);
  if (effects.trim()) {
    const prerequisite = typeof data.prerequisite === "string" && data.prerequisite.trim()
      ? `*${translate(locale, "Requires {prereq}", { prereq: data.prerequisite.trim() })}*\n\n`
      : "";
    parts.push(
      `${prerequisite}${effects
        .split("\n\n")
        .map((line) => `- ${line}`)
        .join("\n")}`,
    );
  }
  // A background's feature is a field of its own.
  const feature = typeof data.feature === "string" ? data.feature.trim() : "";
  const featureText = textOf(data.feature_desc).trim();
  if (feature && featureText) {
    parts.push(`**${translate(locale, "Feature")}: ${feature}.** ${featureText}`);
  } else if (feature) {
    parts.push(`**${translate(locale, "Feature")}: ${feature}.**`);
  }
  const joined = normalizeRulesText(parts.join("\n\n"));
  return joined ? joined : null;
}

// A source-backed reference is not a request to find another book's
// same-named entry. Legacy references may have only a guessed slug.
export type ContentInfoIdentity = { slug: string; source?: string; documentSlug?: string; exactSlug?: boolean };

// A stored slug may follow a deliberate server redirect, but a failed lookup
// is not permission to find another record by its display name.
export function contentInfoAllowsNameFallback(reference?: ContentInfoIdentity): boolean {
  return !reference?.exactSlug && !reference?.source && !reference?.documentSlug;
}

export function contentInfoDirectMatches(entry: ContentInfoIdentity, reference: ContentInfoIdentity): boolean {
  if (!reference.source && !reference.documentSlug) return true;
  return entry.slug === reference.slug
    && (!reference.source || entry.source === reference.source)
    && (!reference.documentSlug || entry.documentSlug === reference.documentSlug);
}

// A missing legacy slug can be recovered from an exact whole-name search
// only if it returned one unambiguous hit. Do not take the first of a
// truncated page or use a different document to fill an empty description.
export function uniqueContentInfoMatch<T extends { name: string }>(results: readonly T[], wanted: string, limit: number): T | undefined {
  if (results.length >= limit || !wanted) return undefined;
  const hits = results.filter((entry) => textKey(entry.name) === wanted);
  const [only] = hits;
  return hits.length === 1 ? only : undefined;
}

export type StarterSpells = {
  why: string;
  cantrips: Array<{ n: string; d: string }>;
  spells: Array<{ n: string; d: string }>;
};

const STARTERS = (starterSpellsJson as { classes: Record<string, StarterSpells> }).classes;

// Opening spell suggestions for a class. A new player who does not know 5e
// cannot search for a spell whose name they have never heard, so the builder
// offers these as one-tap picks next to the full list. Custom genre casters
// borrow the list of whichever SRD class they cast from.
export function starterSpellsFor(classId: string): StarterSpells | null {
  return STARTERS[spellClassFor(classId)] ?? STARTERS[classId] ?? null;
}

// Sheets store spells, feats and items by name, not by slug. This is the same
// transform scripts/lib/open5e-normalize.mjs uses, so most names resolve
// straight to their pack row; InfoDialog falls back to a search by name when
// a row uses a slug of its own.
export function contentSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// A pack row spells its flags "yes" and "no" (both truthy); a homebrew row
// keeps booleans.
const flagged = (value: unknown) =>
  value === true || value === 1 || (typeof value === "string" && /^(yes|true)$/i.test(value.trim()));

// Whether a spell's row says it takes concentration (a pack's "yes", a
// homebrew row's true): the spell tiles mark it (issue 252).
export function spellRowConcentrates(data: Record<string, unknown> | undefined): boolean {
  return Boolean(data && flagged(data.concentration));
}

// Translate only complete recognized metadata values, never parse a
// conditional reaction or a custom range as if it were a simpler rule.
function spellCastingTimeLabel(value: unknown, locale: Locale): string {
  const raw = String(value ?? "");
  if (locale === "en") return raw;
  const clean = raw.trim().toLowerCase();
  if (["1 action", "1 bonus action", "1 reaction"].includes(clean)) return translate(locale, clean);
  const time = /^(\d+)\s+(minute|hour)s?$/.exec(clean);
  if (time) {
    const count = Number(time[1]);
    return time[2] === "minute"
      ? translatePlural(locale, "{count} minute", "{count} minutes", { count })
      : translatePlural(locale, "{count} hour", "{count} hours", { count });
  }
  return locale === "cs" ? translate(locale, raw.trim()) : raw;
}

function spellRangeLabel(value: unknown, locale: Locale): string {
  const raw = String(value ?? "");
  if (locale === "en") return raw;
  const clean = raw.trim().toLowerCase();
  const labels: Record<string, string> = { self: "Self", touch: "Touch", sight: "Sight", unlimited: "Unlimited", special: "Special" };
  if (Object.hasOwn(labels, clean)) return translate(locale, labels[clean]);
  const distance = /^(\d+)\s+(?:feet|ft\.?|foot)$/.exec(clean);
  if (distance) return translate(locale, "{feet} ft", { feet: Number(distance[1]) });
  return locale === "cs" ? translate(locale, raw.trim()) : raw;
}

// The one-line summary shown under a spell's name in a picker: level, school
// and the flags that change how it is cast.
export function spellSummary(data: Record<string, unknown> | undefined, locale: Locale = "en"): string {
  if (!data) {
    return "";
  }
  const level = Number(data.level_int ?? data.level ?? 0);
  const school = String(
    (data.school as { name?: string })?.name ?? data.school ?? "",
  ).toLowerCase();
  const schoolWord = gameTermWord("spellSchool", school, locale).toLowerCase();
  const parts = [
    level === 0
      ? (schoolWord ? translate(locale, "{school} cantrip", { school: schoolWord }) : translate(locale, "cantrip"))
      : (schoolWord ? translate(locale, "level {level} {school}", { level, school: schoolWord }) : translate(locale, "level {level}", { level })),
    spellCastingTimeLabel(data.casting_time, locale),
    spellRangeLabel(data.range, locale),
    flagged(data.concentration) ? translate(locale, "concentration") : "",
    flagged(data.ritual) ? translate(locale, "ritual") : "",
  ].filter(Boolean);
  return parts.join(" · ");
}
