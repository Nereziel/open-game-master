// Install only packs for books actually present in the caller's catalog.
// One registry can resolve all supplemental entries without ever conflating
// their canonical IDs with SRD, homebrew or each other.
import { TranslationRegistry } from "../registry";
import { tomeOfHeroesCsPack } from "../tome-of-heroes";
import { deepMagicCsPack } from "../deep-magic";
import { vaultOfMagicCsPack } from "../vault-of-magic";
import type { SupplementCatalogRow, SupplementPackReport } from "./build-pack";

export function supplementCzechRegistry(rows: readonly SupplementCatalogRow[]): {
  registry: TranslationRegistry;
  reports: readonly SupplementPackReport[];
} {
  const registry = new TranslationRegistry();
  const reports: SupplementPackReport[] = [];
  for (const build of [tomeOfHeroesCsPack, deepMagicCsPack, vaultOfMagicCsPack]) {
    const result = build(rows);
    registry.register(result.pack);
    reports.push(result.report);
  }
  return { registry, reports };
}
