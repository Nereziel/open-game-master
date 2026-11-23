// Czech translation pack for deep-magic; canonical item IDs come from actual
// catalog rows. This never changes saved engine identifiers or source rules.
import { buildSupplementCzechPack, type SupplementCatalogRow } from "../supplements/build-pack";
import { DEEP_MAGIC_CS } from "./cs-data";

export function deepMagicCsPack(rows: readonly SupplementCatalogRow[]) {
  return buildSupplementCzechPack("deep-magic", rows, DEEP_MAGIC_CS);
}
