// Czech translation pack for vault-of-magic; canonical item IDs come from actual
// catalog rows. This never changes saved engine identifiers or source rules.
import { buildSupplementCzechPack, type SupplementCatalogRow } from "../supplements/build-pack";
import { VAULT_OF_MAGIC_CS } from "./cs-data";

export function vaultOfMagicCsPack(rows: readonly SupplementCatalogRow[]) {
  return buildSupplementCzechPack("vault-of-magic", rows, VAULT_OF_MAGIC_CS);
}
