import { classFeatureName } from "./names";
import { translate, type Locale } from "@/lib/messages-logic";
import { optionFeatureName, optionSourceClassId, type OptionDef } from "@/lib/srd/options";

// Only for published option rows. The stored feature's prefix and the
// originating class disambiguate identical bare names across pick lists.
export function optionDisplayName(option: Pick<OptionDef, "k" | "n">, locale: Locale): string {
  const feature = optionFeatureName(option.k, option.n);
  const named = classFeatureName(optionSourceClassId(option.k), feature, locale);
  if (named !== feature) return named;
  const translated = translate(locale, feature);
  return translated === feature ? option.n : translated;
}
