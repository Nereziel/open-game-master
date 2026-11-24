// Load only the selected locale's catalog and name tables in the browser.
import { localizedTables } from "./localized-tables.ts";
import { installCsTables } from "./cs-tables.ts";
import { installFrTables } from "./fr-tables.ts";
import { catalogInstalled, installCatalog, type Locale } from "./translate.ts";

const loaders: Record<Exclude<Locale, "en">, () => Promise<void>> = {
  cs: async () => {
    const [catalog, names, resources, expansions, guides] = await Promise.all([
      import("./cs-catalog-data.ts"), import("../content/names-cs.ts"), import("../srd/class-resources-cs-data.ts"), import("../content/expansion-names-cs.json"), import("./workshop-guides-cs.json"),
    ]);
    installCsTables({ names: names.CS_NAMES_BY_TABLE, guidance: resources.RESOURCE_CS_GUIDANCE, expansionNames: expansions.default ?? expansions, workshopGuides: guides.default ?? guides });
    installCatalog("cs", catalog.default ?? catalog);
  },
  fr: async () => {
    const [catalog, names, translated, resources] = await Promise.all([
      import("./fr.json"), import("../content/names-fr.ts"),
      import("../content/names-fr-translated.ts"), import("../srd/class-resources-fr-data.ts"),
    ]);
    installFrTables({ names: names.FR_NAMES_BY_TABLE, translated: translated.FR_TRANSLATED_NAMES_BY_TABLE, resources: resources.RESOURCE_FR });
    installCatalog("fr", (catalog as { default?: unknown }).default ?? catalog);
  },
};

const loading = new Map<Locale, Promise<void>>();
const failed = new Set<Locale>();

export function catalogReady(locale: Locale): boolean {
  return locale === "en" || (catalogInstalled(locale) && localizedTables(locale) !== null);
}

// Retry only on an explicit language choice or a changed server preference.
// Render snapshots must not restart a failed chunk in a tight loop.
export function retryCatalog(locale: Locale): void {
  if (failed.delete(locale)) loading.delete(locale);
}

export function loadCatalog(locale: Locale): Promise<void> {
  let pending = loading.get(locale);
  if (pending) return pending;
  if (locale === "en" || catalogReady(locale)) {
    pending = Promise.resolve();
  } else {
    pending = loaders[locale]().catch((error) => {
      // Keep the settled promise stable for React Suspense and snapshots.
      // A later explicit choice can reset this failed attempt.
      failed.add(locale);
      console.error(`[i18n] the ${locale} catalog did not load`, error);
    });
  }
  loading.set(locale, pending);
  return pending;
}
