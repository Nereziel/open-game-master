// Kompletní české Markdownové stránky nestvůr SRD 5.1, kanonická ID 160–239.
// Originální statbloky: Wizards of the Coast, SRD 5.1, CC BY 4.0.
// Překlad: samostatně vytvořený český text, bez převzetí cizích popisů.
import { CZECH_FULL_MONSTERS_03_01 } from "./czech-full-monsters-03-01";
import { CZECH_FULL_MONSTERS_03_02 } from "./czech-full-monsters-03-02";
import { CZECH_FULL_MONSTERS_03_03 } from "./czech-full-monsters-03-03";
import { CZECH_FULL_MONSTERS_03_04 } from "./czech-full-monsters-03-04";
import { CZECH_FULL_MONSTERS_03_05 } from "./czech-full-monsters-03-05";
import { CZECH_FULL_MONSTERS_03_06 } from "./czech-full-monsters-03-06";
import { CZECH_FULL_MONSTERS_03_07 } from "./czech-full-monsters-03-07";
import { CZECH_FULL_MONSTERS_03_08 } from "./czech-full-monsters-03-08";

export const CZECH_FULL_MONSTERS_03: Readonly<Record<string, string>> = Object.freeze({
  ...CZECH_FULL_MONSTERS_03_01,
  ...CZECH_FULL_MONSTERS_03_02,
  ...CZECH_FULL_MONSTERS_03_03,
  ...CZECH_FULL_MONSTERS_03_04,
  ...CZECH_FULL_MONSTERS_03_05,
  ...CZECH_FULL_MONSTERS_03_06,
  ...CZECH_FULL_MONSTERS_03_07,
  ...CZECH_FULL_MONSTERS_03_08,
});
