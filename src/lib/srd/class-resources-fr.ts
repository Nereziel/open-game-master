// Display-only resource names and guidance in any reader language.
// Keep the upstream module path so existing consumers need no rewiring.
import { localizedTables } from "@/lib/i18n/localized-tables";
import type { Locale } from "@/lib/i18n/translate";

export function resourceDisplayName(id: string, locale: Locale): string | null {
  const tables = localizedTables(locale);
  return tables?.resources?.[id]?.name ?? tables?.names.resources?.[id] ?? tables?.dynamicResource?.(id)?.name ?? null;
}

export function resourceGuidance(id: string, locale: Locale): string | null {
  const tables = localizedTables(locale);
  return tables?.resources?.[id]?.guidance ?? tables?.guidance?.[id] ?? tables?.dynamicResource?.(id)?.guidance ?? null;
}
