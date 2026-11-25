"use client";

// One held choice a level-up may change (src/lib/srd/level-up-changes.ts):
// Storm Aura's environment, an invocation given up for another, or a
// sorcerer origin's own spell replaced (src/lib/dm/ar-ws-origin-swap.ts). Keeping
// what is held is the default; nothing is sent until a new option is picked.

import { cn } from "@/lib/cn";
import { optionOfferName } from "@/lib/content/option-labels";
import { classFeatureName, contentName } from "@/lib/content/names";
import { useT } from "@/lib/locale";
import type { ChangeOffer, LevelUpChange } from "@/lib/srd/level-up-changes";

const CHIP = "min-h-10 rounded-full border px-3 py-1 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400";

function Chip({ picked, label, onClick }: { picked: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={picked}
      onClick={onClick}
      className={cn(CHIP, picked ? "border-amber-600 bg-amber-950/50 text-amber-100" : "border-stone-700 text-stone-300 hover:border-amber-800 hover:bg-stone-900")}
    >
      {label}
    </button>
  );
}

export function LevelUpChangePick({ offer, change, onChange, bundledOrigin = false }: { offer: ChangeOffer; change: LevelUpChange | null; onChange: (next: LevelUpChange | null) => void; bundledOrigin?: boolean }) {
  const t = useT();
  const from = offer.kind === "choice" ? offer.from : change?.from ?? "";
  const shown = (name: string, candidate = false) => bundledOrigin && candidate ? contentName("spells", name, t.locale) : optionOfferName(offer, name, t.locale);
  const label = bundledOrigin ? t(classFeatureName("sorcerer", offer.label, t.locale)) : t(offer.label);
  const options = offer.kind === "replace" && change ? (offer.optionsFor?.[change.from] ?? offer.options) : offer.options;
  return (
    <div role="group" aria-label={t("Change {label}", { label })} className="reveal mt-3">
      <p className="mb-1 text-xs uppercase tracking-wide text-amber-200/80">
        {offer.kind === "choice" ? t("{label}: keep {name}, or change it with this level", { label, name: shown(offer.from) }) : offer.froms.length === 1 ? t("{label}: keep {name}, or give it up for another", { label, name: shown(offer.froms[0]) }) : t("{label}: keep them all, or give one up for another", { label })}
      </p>
      {offer.kind === "replace" && offer.note ? <p className="mb-1 text-xs text-stone-400">{bundledOrigin ? t(offer.note) : offer.note}</p> : null}
      {offer.kind === "replace" ? (
        <div className="stagger-pop mb-1.5 flex flex-wrap gap-1.5">
          <Chip picked={!change} label={offer.froms.length === 1 ? t("Keep {name}", { name: shown(offer.froms[0]) }) : t("Keep all")} onClick={() => onChange(null)} />
          {offer.froms.map((name) => (
            <Chip key={name} picked={change?.from === name} label={t("Give up {name}", { name: shown(name) })} onClick={() => onChange(change?.from === name ? null : { from: name, to: "" })} />
          ))}
        </div>
      ) : null}
      {offer.kind === "choice" || change ? (
        <div className="stagger-pop flex max-h-56 flex-wrap gap-1.5 overflow-y-auto pr-1">
          {offer.kind === "choice" ? <Chip picked={!change} label={t("Keep {name}", { name: shown(offer.from) })} onClick={() => onChange(null)} /> : null}
          {options.map((name) => (
            <Chip key={name} picked={change?.to === name} label={shown(name, true)} onClick={() => onChange({ from, to: name })} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
