// Czech data installer, symmetric with the upstream French installer.
import { installLocalizedTables, type LocalizedTables } from "./localized-tables.ts";

type CsTables = Required<Pick<LocalizedTables, "names" | "guidance">> & Pick<LocalizedTables, "expansionNames">;
export function installCsTables(tables: CsTables): void {
  installLocalizedTables("cs", tables);
}
