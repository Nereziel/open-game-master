// Úplné vlastní české překlady druhé skupiny 80 magických předmětů SRD 5.1 (CC BY 4.0).
// IDs odpovídají data.pages.filter(kind === "item").map(id).sort().slice(80, 160).
// Pouze samostatný export; integraci do společné čtečky řeší nadřazený integrátor.
import { CZECH_FULL_ITEMS_02_01 } from "./czech-full-items-02-01";
import { CZECH_FULL_ITEMS_02_02 } from "./czech-full-items-02-02";
import { CZECH_FULL_ITEMS_02_03 } from "./czech-full-items-02-03";
import { CZECH_FULL_ITEMS_02_04 } from "./czech-full-items-02-04";
import { CZECH_FULL_ITEMS_02_05 } from "./czech-full-items-02-05";
import { CZECH_FULL_ITEMS_02_06 } from "./czech-full-items-02-06";
import { CZECH_FULL_ITEMS_02_07 } from "./czech-full-items-02-07";
import { CZECH_FULL_ITEMS_02_08 } from "./czech-full-items-02-08";

export const CZECH_FULL_ITEMS_02: Readonly<Record<string, string>> = {
  ...CZECH_FULL_ITEMS_02_01,
  ...CZECH_FULL_ITEMS_02_02,
  ...CZECH_FULL_ITEMS_02_03,
  ...CZECH_FULL_ITEMS_02_04,
  ...CZECH_FULL_ITEMS_02_05,
  ...CZECH_FULL_ITEMS_02_06,
  ...CZECH_FULL_ITEMS_02_07,
  ...CZECH_FULL_ITEMS_02_08,
};
