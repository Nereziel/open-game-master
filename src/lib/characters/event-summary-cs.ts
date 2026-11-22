import { contentName } from "@/lib/content/names";
import type { Locale } from "@/lib/i18n/translate";

// Old character milestones store short, English system-generated summaries.
// Translate only recognized event templates, never arbitrary player or DM prose.
// The original stored summary remains untouched for language switching.
export function characterEventSummary(summary: string, kind: string, locale: Locale): string {
  if (locale !== "cs" || kind !== "item") return summary;
  const acquired = /^Acquired\s+(.+?)(\.)?$/i.exec(summary.trim());
  if (!acquired) return summary;
  const item = acquired[1].trim();
  if (!item) return summary;
  return `Získaný předmět: ${contentName("items", item, locale)}.`;
}
