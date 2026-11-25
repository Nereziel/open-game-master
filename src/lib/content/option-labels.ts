import { classFeatureName, contentName } from "./names";
import { fightingStyleFeatureName, type FightingStyleId } from "@/lib/srd/feature-effects";
import { translate, type Locale } from "@/lib/messages-logic";
import { optionFeatureName, optionPicksSpells, optionSourceClassId, optionsOfKind, type OptionDef, type OptionReqIssue } from "@/lib/srd/options";

// Only for published option rows. The stored feature's prefix and the
// originating class disambiguate identical bare names across pick lists.
export function optionDisplayName(option: Pick<OptionDef, "k" | "n">, locale: Locale): string {
  if (optionPicksSpells(option.k)) return contentName("spells", option.n, locale);
  const feature = optionFeatureName(option.k, option.n);
  const named = classFeatureName(optionSourceClassId(option.k), feature, locale);
  if (named !== feature) return named;
  const translated = translate(locale, feature);
  return translated === feature ? option.n : translated;
}

// Presentation only. The shared prerequisite checker supplies the reason;
// never derive a rule decision from a translated name or sentence.
export function optionReqDisplay(option: Pick<OptionDef, "k" | "n">, issue: OptionReqIssue, locale: Locale): string {
  const label = optionDisplayName(option, locale);
  switch (issue.kind) {
    case "level":
      return translate(locale, "{option} requires level {level} in {className}.", { option: label, level: issue.level, className: contentName("classes", issue.classId, locale) });
    case "pact":
      return translate(locale, "{option} requires {pact}.", { option: label, pact: optionDisplayName({ k: "pact_boon", n: issue.name }, locale) });
    case "cantrip":
      return translate(locale, "{option} requires the {spell} cantrip.", { option: label, spell: contentName("spells", issue.name, locale) });
  }
}

// Only an offer from a published kind identifies the bare choice. Do not
// guess a name from a custom offer or from a previously swapped spell.
export function optionOfferName(offer: Pick<import("@/lib/srd/level-up-changes").ChangeOffer, "shown" | "optionKind">, name: string, locale: Locale): string {
  const raw = offer.shown[name] ?? name;
  if (!offer.optionKind) return raw;
  const option = optionsOfKind(offer.optionKind).find((entry) => entry.n === raw);
  return option ? optionDisplayName(option, locale) : raw;
}

// All six published fighting styles share the fighter's canonical names;
// the paladin and ranger maps use the same labels. Keep the pick id intact.
export function fightingStyleDisplayName(style: { id: FightingStyleId; name: string }, locale: Locale): string {
  const feature = fightingStyleFeatureName(style.id);
  const label = classFeatureName("fighter", feature, locale);
  return label === feature ? style.name : label;
}
