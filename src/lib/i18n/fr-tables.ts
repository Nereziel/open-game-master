// Compatibility installer for the upstream French datasets. All readers use
// the shared locale-keyed registry; this module owns no separate state.
import { installLocalizedTables, type LocalizedTables } from "./localized-tables.ts";

type FrTables = Required<Pick<LocalizedTables, "names" | "translated" | "resources">>;
export function installFrTables(tables: FrTables): void {
  installLocalizedTables("fr", {
    ...tables,
    traitText: {
      poisonAdvantage: "avant. c/ poison",
      feet: "pi",
      lightMediumArmor: "armures légères et intermédiaires",
      weaponNames: {
        battleaxe: "hache d’armes", handaxe: "hachette", "light hammer": "marteau léger",
        warhammer: "marteau de guerre", longsword: "épée longue", shortsword: "épée courte",
        longbow: "arc long", shortbow: "arc court", rapier: "rapière",
      },
    },
  });
}
