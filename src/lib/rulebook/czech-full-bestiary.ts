// Complete, independently translated Czech SRD 5.1 monster and item pages.
// This file combines the seven non-overlapping translation batches.
// English source content and canonical page IDs remain in srd-5.1.json.
import { CZECH_FULL_MONSTERS_01 } from "./czech-full-monsters-01";
import { CZECH_FULL_MONSTERS_02 } from "./czech-full-monsters-02";
import { CZECH_FULL_MONSTERS_03 } from "./czech-full-monsters-03";
import { CZECH_FULL_MONSTERS_04 } from "./czech-full-monsters-04";
import { CZECH_FULL_ITEMS_01 } from "./czech-full-items-01";
import { CZECH_FULL_ITEMS_02 } from "./czech-full-items-02";
import { CZECH_FULL_ITEMS_03 } from "./czech-full-items-03";

export const CZECH_FULL_MONSTER_BATCHES: ReadonlyArray<Readonly<Record<string, string>>> = [
  CZECH_FULL_MONSTERS_01,
  CZECH_FULL_MONSTERS_02,
  CZECH_FULL_MONSTERS_03,
  CZECH_FULL_MONSTERS_04,
];

export const CZECH_FULL_ITEM_BATCHES: ReadonlyArray<Readonly<Record<string, string>>> = [
  CZECH_FULL_ITEMS_01,
  CZECH_FULL_ITEMS_02,
  CZECH_FULL_ITEMS_03,
];

export const CZECH_FULL_MONSTERS: Readonly<Record<string, string>> = Object.freeze(
  Object.assign({}, ...CZECH_FULL_MONSTER_BATCHES),
);
export const CZECH_FULL_ITEMS: Readonly<Record<string, string>> = Object.freeze(
  Object.assign({}, ...CZECH_FULL_ITEM_BATCHES),
);
