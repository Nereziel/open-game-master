import { contentName } from "@/lib/content/names";
import { translate, type Locale } from "@/lib/i18n/translate";

// Old character milestones store short, English system-generated summaries.
// Translate only recognized event templates, never arbitrary player or DM prose.
// The original stored summary remains untouched for language switching.
export function characterEventSummary(summary: string, kind: string, locale: Locale): string {
  if (locale !== "cs" || kind !== "item") return summary;
  // Historical item events are single-line templates. Do not mistake multiline prose for one.
  const acquired = /^Acquired[ \t]+([^\r\n]+)$/i.exec(summary.trim());
  if (!acquired) return summary;
  const item = acquired[1].trim().replace(/\.$/, "");
  if (!item) return summary;
  return translate(locale, "Acquired item: {name}.", { name: contentName("items", item, locale) });
}
