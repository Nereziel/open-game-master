// Samostatný český úplný překlad 78 nestvůr SRD 5.1 (2014, CC BY 4.0).
// Kanonické page.id: seřazené monster ID v intervalu [240, 318).
// Tento soubor nesahá na sdílenou integraci; import provede samostatný agent.
import { CZECH_FULL_MONSTERS_04_01 } from "./czech-full-monsters-04-01";
import { CZECH_FULL_MONSTERS_04_02 } from "./czech-full-monsters-04-02";
import { CZECH_FULL_MONSTERS_04_03 } from "./czech-full-monsters-04-03";
import { CZECH_FULL_MONSTERS_04_04 } from "./czech-full-monsters-04-04";
import { CZECH_FULL_MONSTERS_04_05 } from "./czech-full-monsters-04-05";
import { CZECH_FULL_MONSTERS_04_06A } from "./czech-full-monsters-04-06a";
import { CZECH_FULL_MONSTERS_04_06B } from "./czech-full-monsters-04-06b";
import { CZECH_FULL_MONSTERS_04_07 } from "./czech-full-monsters-04-07";
import { CZECH_FULL_MONSTERS_04_08 } from "./czech-full-monsters-04-08";

export const CZECH_FULL_MONSTERS_04: Readonly<Record<string, string>> = {
  ...CZECH_FULL_MONSTERS_04_01,
  ...CZECH_FULL_MONSTERS_04_02,
  ...CZECH_FULL_MONSTERS_04_03,
  ...CZECH_FULL_MONSTERS_04_04,
  ...CZECH_FULL_MONSTERS_04_05,
  ...CZECH_FULL_MONSTERS_04_06A,
  ...CZECH_FULL_MONSTERS_04_06B,
  ...CZECH_FULL_MONSTERS_04_07,
  ...CZECH_FULL_MONSTERS_04_08,
};
