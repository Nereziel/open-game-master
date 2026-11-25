"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { ui } from "@/lib/ui";
import { InfoButton } from "@/components/ui/InfoDialog";
import { FieldLabel } from "@/app/workshop/kit";
import { heldTraitNames, withTrait } from "@/lib/workshop/species-traits";
import { publishedTraitChoices, publishedTraitMatches, type PublishedSpeciesRow } from "@/lib/workshop/species-trait-display";
import { textKey } from "@/lib/language/text-logic";
import { useT } from "@/lib/locale";

// "Add a published trait": a search over every trait the catalog's species
// print (the content pack's, or with none the bundled SRD's, and the DM's
// own). A pick lands in the Traits text in the book's words, where it stays
// editable; named as published, the engine runs it at the table.

type Row = { slug?: string; source?: string; documentSlug?: string; name?: string; data?: { traits?: unknown }; table?: { traits?: unknown } };

export function SpeciesTraitPicker({ traits, onChange }: { traits: string; onChange: (traits: string) => void }) {
  const [catalog, setCatalog] = useState<PublishedSpeciesRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (container.current && !container.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Cache only canonical rules and source identity; display labels are
  // derived again when the reader changes language.
  function load() {
    setOpen(true);
    if (catalog || loading) return;
    setLoading(true);
    setFailed(false);
    fetch("/api/content/races?mechanics=1&limit=500", { headers: { "X-Odm-Locale": "en" } })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data: { results?: Row[] }) =>
        setCatalog(
          (data.results ?? []).map((row) => ({
            slug: row.slug,
            source: row.source,
            documentSlug: row.documentSlug,
            name: String(row.name ?? ""),
            traits: String(row.table?.traits ?? row.data?.traits ?? ""),
          })),
        ),
      )
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }

  const held = new Set(heldTraitNames(traits).map(textKey));
  const t = useT();
  const choices = useMemo(() => publishedTraitChoices(catalog ?? [], t.locale), [catalog, t.locale]);
  const shown = choices.filter((choice) => publishedTraitMatches(choice, query));

  return (
    <div ref={container} className="space-y-1" data-species-trait-picker>
      <FieldLabel>{t("Published traits")}</FieldLabel>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            load();
          }}
          onFocus={load}
          placeholder={t("Add a published trait: Draconic Ancestry, Darkvision, Lucky...")}
          aria-label={t("Search the published species traits")}
          className={cn(ui.input, "pl-9")}
        />
        {loading ? <Loader2 className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-stone-500" /> : null}
      </div>
      {failed ? (
        <p className="live-in text-xs text-amber-300">{t("The published traits could not be read just now. Click the search again to retry.")}</p>
      ) : open && catalog && !shown.length ? (
        <p className="live-in text-xs text-stone-500">{t("No published trait matched \"{query}\".", { query: query.trim() })}</p>
      ) : null}
      {/* In the flow, like "Start from": the editor scrolls, and an overlay
          would cover the Traits text it writes into. */}
      {open && shown.length ? (
        <ul className="reveal max-h-64 overflow-y-auto panel panel-smoke rounded-lg text-sm">
          {shown.slice(0, 60).map(({ trait, label, fromLabels }) => {
            const has = held.has(textKey(trait.name));
            return (
              <li key={trait.name} className="flex items-center gap-1 pr-2 hover:bg-stone-800">
                <button
                  type="button"
                  disabled={has}
                  onClick={() => onChange(withTrait(traits, trait))}
                  className={cn(ui.btnSmall, "min-h-10 grow justify-between gap-2 border-transparent bg-transparent text-left shadow-none disabled:opacity-60")}
                >
                  <span className="truncate">{label}</span>
                  <span className="shrink-0 text-[11px] text-stone-500">
                    {has ? t("Already here") : `${fromLabels.slice(0, 2).join(", ")}${trait.from.length > 2 ? ` +${trait.from.length - 2}` : ""}`}
                  </span>
                </button>
                <InfoButton label={label} text={trait.text || t("{name}, as {from} has it.", { name: label, from: fromLabels[0] })} />
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
