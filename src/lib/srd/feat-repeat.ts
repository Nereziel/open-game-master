// A feat is taken once, except the one whose text says otherwise: Elemental
// Adept, "You can take this feat more than once, choosing a different type
// each time." The level-up (src/lib/srd/level-up.ts) asks here whether a feat
// the character already holds may be taken again with the picks sent.
//
// Pure.
import { textKey } from "@/lib/language/text-logic";
import { ELEMENTAL_ADEPT_TYPES, elementalAdeptTypes } from "@/lib/srd/feat-combat";
import { holdsFeat } from "@/lib/srd/feat-effects";
import { translate, type Locale } from "@/lib/messages-logic";

type Holder = { name?: string; feats?: string[]; features?: Array<{ name: string }> };

// Why this feat cannot be taken a second time, or null when it can.
export function featRepeatRefusal(sheet: Holder, feat: string, picks: { damageType?: string } | null | undefined, locale: Locale = "en"): string | null {
  const who = sheet.name ?? translate(locale, "This character");
  if (!holdsFeat({ feats: [feat], features: [] }, "Elemental Adept")) {
    return translate(locale, "{name} already has {feat}; a feat is taken once.", { name: who, feat });
  }
  const picked = textKey(picks?.damageType ?? "");
  const held = elementalAdeptTypes(sheet);
  if (!ELEMENTAL_ADEPT_TYPES.includes(picked)) {
    return translate(locale, "{name} already has {feat}; taking it again means choosing another damage type ({types}).", { name: who, feat, types: ELEMENTAL_ADEPT_TYPES.filter((type) => !held.includes(type)).join(", ") });
  }
  if (held.includes(picked)) {
    return translate(locale, "{name}'s {feat} already covers {type}; each time the feat is taken it names a different damage type.", { name: who, feat, type: picked });
  }
  return null;
}
