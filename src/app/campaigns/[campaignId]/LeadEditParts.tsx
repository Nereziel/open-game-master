"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale, useT } from "@/lib/locale";
import { contentName, type NamedRow } from "@/lib/content/names";
import { scopeQuery } from "@/lib/content-scope";
import { leadItemFlags, needsLeadItemReference } from "./lead-edit-display";
import type { Locale } from "@/lib/i18n/translate";
import { contentSlug } from "@/lib/help";
import { InfoButton } from "@/components/ui/InfoDialog";
import { cn } from "@/lib/cn";
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

// Resolve only distinct pack slugs, using the same campaign scope as the
// picker. The returned map is presentation state, never part of the edit.
// No pack or failed lookup leaves the canonical name visible.
export function useLeadItemReferences(campaignId: string, items: readonly EquipmentItem[], locale: Locale) {
  const slugKey = JSON.stringify([...new Set(items.filter(needsLeadItemReference).flatMap((item) => item.slug ? [item.slug] : []))].sort());
  const [resolved, setResolved] = useState<{ campaignId: string; rows: Map<string, NamedRow> } | null>(null);
  const localized = locale !== "en";
  useEffect(() => {
    if (!localized) return;
    const slugs = JSON.parse(slugKey) as string[];
    if (!slugs.length) return;
    const controller = new AbortController();
    void Promise.all(slugs.map(async (slug): Promise<[string, NamedRow] | null> => {
      try {
        const response = await fetch(`/api/content/items/${encodeURIComponent(slug)}${scopeQuery(campaignId)}`, {
          signal: controller.signal,
        });
        if (!response.ok) return null;
        const { entry } = (await response.json()) as { entry?: NamedRow };
        return entry?.slug && entry.slug === slug ? [slug, entry] : null;
      } catch {
        return null;
      }
    })).then((entries) => {
      if (!controller.signal.aborted) {
        setResolved({ campaignId, rows: new Map(entries.filter((entry): entry is [string, NamedRow] => entry !== null)) });
      }
    });
    return () => controller.abort();
  }, [campaignId, localized, slugKey]);
  return resolved?.campaignId === campaignId ? resolved.rows : undefined;
}

// What the row holds besides its name, as small chips: the state the save
// now keeps.
export function ItemFlags({ item }: { item: EquipmentItem }) {
  const flags = leadItemFlags(item, useLocale());
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

// Removable name chips backing the spell and feat lists; adding goes
// through the searchable multi-select pickers below each list.
export function ChipList({ values, onRemove, kind }: { values: string[]; onRemove: (value: string) => void; kind?: "spells" | "feats" }) {
  const locale = useLocale();
  const t = useT();
  const label = (value: string) => kind ? contentName(kind, value, locale) : value;
  if (!values.length) {
    return null;
  }
  return (
    <div className="stagger-pop flex flex-wrap gap-1.5">
      {values.map((value) => (
        <span key={value} className={cn("pk-chip gap-0.5 py-0 pl-2 pr-0.5 text-xs text-stone-200")}>
          {label(value)}
          {kind ? <InfoButton label={label(value)} reference={{ kind, slug: contentSlug(value), name: value }} /> : null}
          <KitButton tone="iconDanger" always onClick={() => onRemove(value)} aria-label={t("Remove {name}", { name: label(value) })} className="p-1">
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
  const t = useT();
  const set = (level: string, key: "max" | "used", value: number) =>
    onChange((previous) => ({
      ...previous,
      [level]: { max: previous[level]?.max ?? "0", used: previous[level]?.used ?? "0", [key]: String(value) },
    }));
  return (
    <div className="stagger-pop flex flex-wrap gap-2">
      {levels.map((level) => {
        const title = level === "pact" ? t("Pact") : `L${level}`;
        const named = level === "pact" ? t("Pact") : t("Level {level}", { level });
        return (
          <div key={level} className="space-y-1">
            <span className="text-stone-400">{t("{name} used/max", { name: title })}</span>
            <div className="flex items-center gap-1">
              <NumberStepper size="sm" min={0} value={Number(slots[level]?.used ?? "0") || 0} label={t("{name} slots used", { name: named })} onChange={(next) => set(level, "used", next)} />
              <span className="text-stone-500">/</span>
              <NumberStepper size="sm" min={0} value={Number(slots[level]?.max ?? "0") || 0} label={t("{name} slots max", { name: named })} onChange={(next) => set(level, "max", next)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
