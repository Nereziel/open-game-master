// Complete, independently translated SRD 5.1 class rules already used by
// the Czech rulebook. Reuse them in character creation instead of displaying
// the content pack's English class description.
import { CZECH_FULL_CLASSES_1 } from "@/lib/rulebook/czech-full-classes-1";
import { CZECH_FULL_CLASSES_2 } from "@/lib/rulebook/czech-full-classes-2";
import { CZECH_FULL_CLASSES_3 } from "@/lib/rulebook/czech-full-classes-3";
import { CZECH_FULL_CLASSES_4 } from "@/lib/rulebook/czech-full-classes-4";
import { CZECH_FULL_CLASSES_5 } from "@/lib/rulebook/czech-full-classes-5";
import { CZECH_FULL_CLASSES_6 } from "@/lib/rulebook/czech-full-classes-6";
import { CZECH_FULL_CLASSES_7 } from "@/lib/rulebook/czech-full-classes-7";
import { CZECH_FULL_CLASSES_8 } from "@/lib/rulebook/czech-full-classes-8";
import { CZECH_FULL_CLASSES_9 } from "@/lib/rulebook/czech-full-classes-9";
import { CZECH_FULL_CLASSES_10 } from "@/lib/rulebook/czech-full-classes-10";
import { CZECH_FULL_CLASSES_11 } from "@/lib/rulebook/czech-full-classes-11";
import { CZECH_FULL_CLASSES_12 } from "@/lib/rulebook/czech-full-classes-12";

export const CZECH_BUILDER_CLASS_RULES: Readonly<Record<string, string>> = {
  ...CZECH_FULL_CLASSES_1,
  ...CZECH_FULL_CLASSES_2,
  ...CZECH_FULL_CLASSES_3,
  ...CZECH_FULL_CLASSES_4,
  ...CZECH_FULL_CLASSES_5,
  ...CZECH_FULL_CLASSES_6,
  ...CZECH_FULL_CLASSES_7,
  ...CZECH_FULL_CLASSES_8,
  ...CZECH_FULL_CLASSES_9,
  ...CZECH_FULL_CLASSES_10,
  ...CZECH_FULL_CLASSES_11,
  ...CZECH_FULL_CLASSES_12,
};
