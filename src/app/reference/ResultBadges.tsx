"use client";

import { needsLabel, offeredInPlay } from "@/lib/content/levelup-logic";
import type { Need } from "@/lib/content/needs-logic";
import { GameIcon } from "@/components/ui/GameIcon";
import { translate } from "@/lib/messages-logic";
import { useT } from "@/lib/locale";
import { priceText } from "@/lib/srd/currency";
import { gameTermWord } from "@/lib/i18n/game-term-labels";
import type { Locale, TranslateVars } from "@/lib/messages-logic";

type T = ((key: string, vars?: TranslateVars) => string) & { locale?: Locale };
const enT: T = (key, vars) => translate("en", key, vars);

// What a reference result is, at a glance: its kind, its level or rarity or
// challenge, and where it came from, as chips. A chip wears a painted family
// icon where one exists (a spell's school, an item's kind); GameIcon draws
// nothing when the painting is missing, so a chip never shows a broken image.

export type BadgeRow = {
  source: string;
  documentSlug?: string;
  // Rules the entry uses that this game does not play, and whether the
  // engine plays mechanics it read from the text that nobody checked (issue
  // #570).
  needs?: Need[];
  bestEffort?: boolean;
  data: Record<string, unknown>;
  level?: number;
  school?: string;
  ritual?: boolean;
  concentration?: boolean;
  kind?: string;
  rarity?: string;
  cost?: string;
};

type Tone = "neutral" | "gold" | "green" | "blue" | "violet" | "orange" | "red";

type Badge = { key: string; text: string; tone: Tone; family?: string };

const ITEM_KIND_LABEL: Record<string, string> = {
  weapon: "Weapon",
  armor: "Armor",
  gear: "Gear",
  magic_item: "Magic item",
};

const RARITY_LABELS: Record<string, string> = {
  mundane: "mundane", common: "common", uncommon: "uncommon",
  rare: "rare", "very rare": "very rare", legendary: "legendary", artifact: "artifact",
};

function rarityLabel(rarity: string, t: T): string {
  const key = rarity.toLowerCase();
  return RARITY_LABELS[key] ? t(RARITY_LABELS[key], { context: "content.rarity" }) : key;
}

function rarityTone(rarity: string): Tone {
  const value = rarity.toLowerCase();
  if (value.includes("artifact")) return "red";
  if (value.includes("legendary")) return "orange";
  if (value.includes("very rare")) return "violet";
  if (value.includes("rare")) return "blue";
  if (value.includes("uncommon")) return "green";
  return "neutral";
}

function text(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

export function badgesFor(category: string, row: BadgeRow, t: T = enT): Badge[] {
  const badges: Badge[] = [];
  if (category === "spells") {
    if (typeof row.level === "number") {
      badges.push({ key: "level", text: row.level === 0 ? t("cantrip") : t("level {level}", { level: row.level }), tone: "gold" });
    }
    const school = text(row.school);
    if (school) {
      badges.push({ key: "school", text: gameTermWord("spellSchool", school.toLowerCase(), t.locale ?? "en").toLowerCase(), tone: "violet", family: `spell-${school}` });
    }
    if (row.ritual) badges.push({ key: "ritual", text: t("ritual"), tone: "neutral" });
    if (row.concentration) badges.push({ key: "conc", text: t("concentration"), tone: "neutral" });
  } else if (category === "items") {
    const kind = text(row.kind);
    if (kind) {
      badges.push({ key: "kind", text: ITEM_KIND_LABEL[kind] ? t(ITEM_KIND_LABEL[kind]) : kind, tone: "neutral", family: `item-${kind}` });
    }
    const rarity = text(row.rarity);
    if (rarity) badges.push({ key: "rarity", text: rarityLabel(rarity, t), tone: rarityTone(rarity) });
    // In the notation every price takes: the pack prints "0.05 gp".
    const cost = priceText(text(row.cost));
    if (cost) badges.push({ key: "cost", text: cost, tone: "gold" });
  } else if (category === "monsters") {
    const cr = text(row.data.challenge_rating ?? row.data.cr);
    // The challenge badge reads the reader's words: the French SRD's own
    // abbreviation is « FP » (facteur de puissance), as the FR dictionary's
    // bestiary chips print it.
    if (cr) badges.push({ key: "cr", text: t("CR {cr}", { cr }), tone: "red" });
    const type = text(row.data.type);
    if (type) badges.push({ key: "type", text: gameTermWord("creatureType", type.toLowerCase(), t.locale ?? "en").toLowerCase(), tone: "neutral" });
  }
  const needs = needsLabel(row.needs ?? [], t);
  if (needs) {
    // Orange where it is not offered for play, neutral where the GM plays
    // the part this game lacks (src/lib/content/levelup-logic.ts).
    badges.push({ key: "needs", text: needs, tone: offeredInPlay(row.needs ?? []) ? "neutral" : "orange" });
  }
  if (row.bestEffort) {
    // The keyed chip, the reader's words (English identical to
    // reading-logic's constant).
    badges.push({ key: "best-effort", text: t("best effort"), tone: "blue" });
  }
  if (row.source === "homebrew") {
    badges.push({ key: "source", text: t("homebrew"), tone: "gold" });
  } else if (row.documentSlug) {
    badges.push({ key: "source", text: row.documentSlug, tone: "neutral" });
  }
  return badges;
}

export function ResultBadges({ category, row }: { category: string; row: BadgeRow }) {
  const t = useT();
  const badges = badgesFor(category, row, t);
  if (!badges.length) {
    return null;
  }
  return (
    <span className="flex shrink-0 flex-wrap items-center justify-end gap-1">
      {badges.map((badge) => (
        <span key={badge.key} className="ref-badge" data-tone={badge.tone}>
          {badge.family ? <GameIcon icon={{ kind: "family", key: badge.family }} size="size-4" /> : null}
          {badge.text}
        </span>
      ))}
    </span>
  );
}
