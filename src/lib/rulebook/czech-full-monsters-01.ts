/**
 * Úplné české překlady prvních 80 záznamů nestvůr SRD 5.1.
 * Zdroj pravidel: System Reference Document 5.1, CC BY 4.0.
 * Klíče jsou přesná kanonická page.id; propojení s čtečkou je samostatný krok.
 */
import { CZECH_FULL_MONSTERS_01_DRAGONS_ADULT } from "./czech-full-monsters-01-dragons-adult";
import { CZECH_FULL_MONSTERS_01_DRAGONS_ANCIENT } from "./czech-full-monsters-01-dragons-ancient";
import { CZECH_FULL_MONSTERS_01_MISC_01 } from "./czech-full-monsters-01-misc-01";
import { CZECH_FULL_MONSTERS_01_MISC_02 } from "./czech-full-monsters-01-misc-02";
import { CZECH_FULL_MONSTERS_01_MISC_03 } from "./czech-full-monsters-01-misc-03";
import { CZECH_FULL_MONSTERS_01_MISC_04 } from "./czech-full-monsters-01-misc-04";
import { CZECH_FULL_MONSTERS_01_MISC_05 } from "./czech-full-monsters-01-misc-05";
import { CZECH_FULL_MONSTERS_01_MISC_06 } from "./czech-full-monsters-01-misc-06";
import { CZECH_FULL_MONSTERS_01_MISC_07 } from "./czech-full-monsters-01-misc-07";

export const CZECH_FULL_MONSTERS_01: Readonly<Record<string, string>> = Object.freeze({
  ...CZECH_FULL_MONSTERS_01_DRAGONS_ADULT,
  ...CZECH_FULL_MONSTERS_01_DRAGONS_ANCIENT,
  ...CZECH_FULL_MONSTERS_01_MISC_01,
  ...CZECH_FULL_MONSTERS_01_MISC_02,
  ...CZECH_FULL_MONSTERS_01_MISC_03,
  ...CZECH_FULL_MONSTERS_01_MISC_04,
  ...CZECH_FULL_MONSTERS_01_MISC_05,
  ...CZECH_FULL_MONSTERS_01_MISC_06,
  ...CZECH_FULL_MONSTERS_01_MISC_07,
});
