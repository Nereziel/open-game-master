import { contentName } from "@/lib/content/names";
import type { Locale } from "@/lib/i18n/translate";
import { findClass } from "@/lib/srd";
import { describePrereqT, MULTICLASS_CAP, type MulticlassCheck } from "./multiclass";

type Translator = (key: string, vars?: Record<string, string | number>) => string;

// The engine keeps its original English error text for APIs and rules tools.
// The level-up UI renders the typed reason instead of parsing that prose.
export function multiclassRefusalLabel(
  t: Translator, check: MulticlassCheck, classId: string, locale: Locale,
): string | null {
  if (check.ok) return null;
  const shownClass = (id: string) => contentName("classes", findClass(id)?.name ?? id, locale);
  switch (check.reason) {
    case "unknown":
      return t('Unknown class "{name}".', { name: classId });
    case "already":
      return t("This character already has levels in {class}.", { class: shownClass(classId) });
    case "limit":
      return t("A character holds at most {count} classes here.", { count: MULTICLASS_CAP });
    case "new_prereq":
      return t("To take {class}, prerequisites: {prereq}.", {
        class: shownClass(classId), prereq: describePrereqT(t, classId),
      });
    case "held_prereq":
      return t("To multiclass, the existing {class} also requires {prereq}.", {
        class: shownClass(check.relatedClassId ?? classId),
        prereq: describePrereqT(t, check.relatedClassId ?? classId),
      });
    default:
      // A different game's refusal may have custom words. Preserve exactly.
      return check.error ?? null;
  }
}
