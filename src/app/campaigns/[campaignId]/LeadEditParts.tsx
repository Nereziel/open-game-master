"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useLocale, useT } from "@/lib/locale";
import { contentName } from "@/lib/content/names";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { KitButton } from "./PanelKit";
import { casterViewsOf, withCasterViews } from "@/lib/srd/spell-prep";
import type { CharacterSheet, EquipmentItem } from "@/lib/schemas/sheet";
import { textKey } from "@/lib/language/text-logic";

export {
  editedSpellSlots,
  equipmentFrom,
  highestStoredSlot,
  itemRowsOf,
  spellListOf,
  type ItemRow,
} from "./lead-edit-logic";

// The pieces the lead's Adjust dialog (LeadEditDialog.tsx) is built from,
// split out so the dialog stays about the correction it sends.

// What the row holds besides its name, as small chips: the state the save
// now keeps.
export function ItemFlags({ item }: { item: EquipmentItem }) {
  const t = useT();
  const flags = [
    item.equipped ? (item.layered ? t("worn beside another, on the GM's say") : t("worn")) : null,
    item.attuned ? t("attuned") : item.attuning ? t("attunes at the next rest") : null,
    item.identified === false ? t("unidentified") : null,
    item.charges !== undefined ? t("{count} charges", { count: item.charges }) : null,
  ].filter((flag): flag is string => Boolean(flag));
  if (!flags.length) {
    return null;
  }
  return (
    <span className="stagger-pop flex flex-wrap gap-1 pl-8">
      {flags.map((flag) => (
        <span key={flag} className="pk-chip px-1.5 py-0 text-[10px] text-stone-400">
          {flag}
        </span>
      ))}
    </span>
  );
}

// Existing inventory names are canonical English IDs. Show their translated
// display names until a user edits the field, then expose the original value
// so editing never accidentally saves a translated ID.
export function LocalizedItemNameInput({
  name,
  onChange,
  className,
  placeholder,
}: {
  name: string;
  onChange: (name: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const locale = useLocale();
  const displayed = focused ? name : contentName("items", name, locale);
  return (
    <input
      value={displayed}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(event) => onChange(event.target.value)}
      aria-label={placeholder}
      title={focused ? name : displayed}
      placeholder={placeholder}
      className={className}
    />
  );
}

// Removable name chips backing the spell and feat lists; adding goes
// through the searchable multi-select pickers below each list.
export function ChipList({ values, onRemove, kind = "spells" }: { values: string[]; onRemove: (value: string) => void; kind?: "spells" | "feats" }) {
  const locale = useLocale();
  const t = useT();
  if (!values.length) {
    return null;
  }
  return (
    <div className="stagger-pop flex flex-wrap gap-1.5">
      {values.map((value) => (
        <span key={value} className={cn("pk-chip gap-0.5 py-0 pl-2 pr-0.5 text-xs text-stone-200")}>
          {contentName(kind, value, locale)}
          <KitButton tone="iconDanger" always onClick={() => onRemove(value)} aria-label={t("Remove {name}", { name: contentName(kind, value, locale) })} className="p-1">
            <X className="size-3" />
          </KitButton>
        </span>
      ))}
    </div>
  );
}

// Carries a lead's edit of the top-level spell lists into the per-class
// lists: whatever was removed leaves every class, whatever was added joins
// the class that holds that kind of list (the first one, failing that).
export function syncCasterLists(
  before: NonNullable<CharacterSheet["spellcasting"]>,
  after: NonNullable<CharacterSheet["spellcasting"]>,
  sheet: CharacterSheet,
): NonNullable<CharacterSheet["spellcasting"]> {
  const lower = (list: string[] = []) => new Set(list.map((name) => textKey(name)));
  const keys = ["known", "prepared", "cantrips", "pending", "spellbook"] as const;
  const views = casterViewsOf(sheet);
  for (const key of keys) {
    const was = lower(before[key]);
    const now = lower(after[key]);
    const removed = (before[key] ?? []).filter((name) => !now.has(textKey(name)));
    const added = (after[key] ?? []).filter((name) => !was.has(textKey(name)));
    for (const view of views) {
      view[key] = view[key].filter((name) => !removed.some((gone) => textKey(gone) === textKey(name)));
    }
    if (added.length && views.length) {
      const home =
        views.find((view) =>
          key === "known"
            ? view.style === "known"
            : key === "spellbook"
              ? view.style === "spellbook"
              : key === "cantrips"
                ? true
                : view.style !== "known",
        ) ?? views[0];
      home[key] = [...home[key], ...added];
    }
  }
  return withCasterViews(after, views);
}

export function levelMeta(entry: { level?: number }): string {
  return entry.level !== undefined ? (entry.level === 0 ? "cantrip" : `level ${entry.level}`) : "";
}

export type SlotEdits = Record<string, { max: string; used: string }>;

// Used and maximum for each slot level the sheet stores, and the pact slots
// under the key "pact" when the sheet has them.
export function SlotSteppers({
  levels,
  slots,
  onChange,
}: {
  levels: string[];
  slots: SlotEdits;
  onChange: (update: (previous: SlotEdits) => SlotEdits) => void;
}) {
  const locale = useLocale();
  const t = useT();
  const set = (level: string, key: "max" | "used", value: number) =>
    onChange((previous) => ({
      ...previous,
      [level]: { max: previous[level]?.max ?? "0", used: previous[level]?.used ?? "0", [key]: String(value) },
    }));
  return (
    <div className="stagger-pop flex flex-wrap gap-2">
      {levels.map((level) => {
        const title = level === "pact" ? (locale === "cs" ? "Paktové pozice" : t("Pact")) : (locale === "cs" ? `${level}. úroveň` : `L${level}`);
        const named = level === "pact" ? (locale === "cs" ? "Paktové pozice" : t("Pact")) : (locale === "cs" ? `Pozice ${level}. úrovně` : t("Level {level}", { level }));
        return (
          <div key={level} className="space-y-1">
            <span className="text-stone-400">{title} · {locale === "cs" ? "spotřebováno / celkem" : "used / max"}</span>
            <div className="flex items-center gap-1">
              <NumberStepper size="sm" min={0} value={Number(slots[level]?.used ?? "0") || 0} label={locale === "cs" ? `${named}: spotřebováno` : `${named} slots used`} onChange={(next) => set(level, "used", next)} />
              <span className="text-stone-500">/</span>
              <NumberStepper size="sm" min={0} value={Number(slots[level]?.max ?? "0") || 0} label={locale === "cs" ? `${named}: celkem` : `${named} slots max`} onChange={(next) => set(level, "max", next)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
