// Czech translation pack for tome-of-heroes; canonical item IDs come from actual
// catalog rows. This never changes saved engine identifiers or source rules.
import { buildSupplementCzechPack, type SupplementCatalogRow } from "../supplements/build-pack";
import { TOME_OF_HEROES_CS } from "./cs-data";

export function tomeOfHeroesCsPack(rows: readonly SupplementCatalogRow[]) {
  return buildSupplementCzechPack("tome-of-heroes", rows, TOME_OF_HEROES_CS);
}
