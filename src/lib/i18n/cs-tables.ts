// Czech data installer, symmetric with the upstream French installer.
import { installLocalizedTables, type LocalizedTables } from "./localized-tables.ts";

type CsTables = Required<Pick<LocalizedTables, "names" | "guidance">> & Pick<LocalizedTables, "expansionNames" | "workshopGuides">;
export function installCsTables(tables: CsTables): void {
  installLocalizedTables("cs", {
    ...tables,
    traitText: {
      poisonAdvantage: "výhoda proti jedu",
      feet: "stop",
      lightMediumArmor: "lehká a střední zbroj",
      hpPerLevel: "život za úroveň",
      localizeNotedHead: true,
    },
  });
}
