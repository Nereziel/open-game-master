// Úplné české popisy prvních 80 magických předmětů SRD 5.1 (CC BY 4.0).
// Klíče odpovídají kanonickému page.id; původní SRD soubor zůstává beze změn.
// Tento modul se záměrně nezapojuje do czech-companion.ts: integraci provede samostatný merge.
import { CZECH_FULL_ITEMS_01A } from "./czech-full-items-01a";
import { CZECH_FULL_ITEMS_01B } from "./czech-full-items-01b";
import { CZECH_FULL_ITEMS_01C } from "./czech-full-items-01c";
import { CZECH_FULL_ITEMS_01D } from "./czech-full-items-01d";
import { CZECH_FULL_ITEMS_01E } from "./czech-full-items-01e";
import { CZECH_FULL_ITEMS_01F } from "./czech-full-items-01f";
import { CZECH_FULL_ITEMS_01G } from "./czech-full-items-01g";
import { CZECH_FULL_ITEMS_01H } from "./czech-full-items-01h";
import { CZECH_FULL_ITEMS_01I } from "./czech-full-items-01i";

export const CZECH_FULL_ITEMS_01: Readonly<Record<string, string>> = Object.freeze({
  ...CZECH_FULL_ITEMS_01A,
  ...CZECH_FULL_ITEMS_01B,
  ...CZECH_FULL_ITEMS_01C,
  ...CZECH_FULL_ITEMS_01D,
  ...CZECH_FULL_ITEMS_01E,
  ...CZECH_FULL_ITEMS_01F,
  ...CZECH_FULL_ITEMS_01G,
  ...CZECH_FULL_ITEMS_01H,
  ...CZECH_FULL_ITEMS_01I,
});
