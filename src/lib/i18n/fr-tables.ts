// Compatibility installer for the upstream French datasets. All readers use
// the shared locale-keyed registry; this module owns no separate state.
import { installLocalizedTables, type LocalizedTables } from "./localized-tables.ts";

type FrTables = Required<Pick<LocalizedTables, "names" | "translated" | "resources">>;
export function installFrTables(tables: FrTables): void {
  installLocalizedTables("fr", tables);
}
