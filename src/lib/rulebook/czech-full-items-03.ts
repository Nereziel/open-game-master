// Úplné české pravidlové texty posledních 79 magických předmětů SRD 5.1.
// Jednotlivé podmnožiny jsou oddělené kvůli paralelní práci na ostatních ID.
// Zdroj: D&D 5e SRD 5.1 (2014), Wizards of the Coast, CC BY 4.0.
import { CZECH_FULL_ITEMS_03_A } from "./czech-full-items-03-a";
import { CZECH_FULL_ITEMS_03_B } from "./czech-full-items-03-b";
import { CZECH_FULL_ITEMS_03_C } from "./czech-full-items-03-c";
import { CZECH_FULL_ITEMS_03_D } from "./czech-full-items-03-d";
import { CZECH_FULL_ITEMS_03_E } from "./czech-full-items-03-e";
import { CZECH_FULL_ITEMS_03_F } from "./czech-full-items-03-f";
import { CZECH_FULL_ITEMS_03_G } from "./czech-full-items-03-g";
import { CZECH_FULL_ITEMS_03_H } from "./czech-full-items-03-h";

export const CZECH_FULL_ITEMS_03: Readonly<Record<string, string>> = Object.freeze({
  ...CZECH_FULL_ITEMS_03_A,
  ...CZECH_FULL_ITEMS_03_B,
  ...CZECH_FULL_ITEMS_03_C,
  ...CZECH_FULL_ITEMS_03_D,
  ...CZECH_FULL_ITEMS_03_E,
  ...CZECH_FULL_ITEMS_03_F,
  ...CZECH_FULL_ITEMS_03_G,
  ...CZECH_FULL_ITEMS_03_H,
});
