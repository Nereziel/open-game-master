"use client";

import { Loader2, Play, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { ui } from "@/lib/ui";
import { odmLocaleHeaders, useLocale, useT } from "@/lib/locale";
import { Dialog } from "@/components/ui/Dialog";

type Starter = {
  oneShot: { id: string; title: string; tagline: string; description: string };
  pregens: Array<{ id: string; name: string; tagline: string; blurb: string }>;
};

// The quick start: one evening's adventure with ready-made heroes, for a
// table that wants to play in ten minutes (src/lib/starter/one-shot.ts).
// One click makes the table; the lobby offers the heroes.
export function StarterDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (campaignId: string) => void;
}) {
  const t = useT();
  const locale = useLocale();
  const [starter, setStarter] = useState<Starter | null>(null);
  const [loadedLocale, setLoadedLocale] = useState<string | null>(null);
  const [busy, setBusy] = useState<"" | "solo" | "friends">("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || (starter && loadedLocale === locale)) return;
    let active = true;
    // A player can change UI language without leaving the home screen.
    // Do not retain the previous language's adventure between openings.
    fetch("/api/starter", { headers: odmLocaleHeaders() })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Starter | null) => {
        if (active && data) {
          setStarter(data);
          setLoadedLocale(locale);
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [open, starter, loadedLocale, locale]);

  async function start(solo: boolean) {
    setBusy(solo ? "solo" : "friends");
    setError("");
    try {
      const response = await fetch("/api/starter", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...odmLocaleHeaders() },
        body: JSON.stringify({ solo }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || t("Could not start the adventure."));
        return;
      }
      onOpenChange(false);
      onCreated(data.campaign.id);
    } finally {
      setBusy("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t("Quick start")} icon={<Play className="size-4 text-amber-300" />}>
      <div className="space-y-4">
        <div>
          <p className="font-display text-lg tracking-wide text-amber-50">{(loadedLocale === locale ? starter?.oneShot.title : null) ?? t("A one-evening adventure")}</p>
          <p className="mt-1 text-sm leading-6 text-stone-400">
            {(loadedLocale === locale ? starter?.oneShot.description : null) ?? t("Loading the adventure...")}
          </p>
        </div>
        <div>
          <p className="mb-1.5 text-xs uppercase tracking-wide text-stone-500">{t("Ready-made heroes, picked in the lobby")}</p>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {(loadedLocale === locale ? starter?.pregens ?? [] : []).map((hero) => (
              <li key={hero.id} className="rounded-lg border border-stone-800 bg-stone-950/50 px-3 py-2">
                <p className="text-sm text-stone-100">{hero.tagline}</p>
                <p className="text-xs text-stone-500">{hero.blurb}</p>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-stone-500">
          {t("Level 1, three beats, one sitting. The AI narrates; you steer from the lobby's settings if you like. Friends join with the room code the lobby shows.")}
        </p>
        {error ? <p className="motion-shake text-sm text-red-400">{error}</p> : null}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => start(true)} className={ui.btnSmall} disabled={busy !== ""} aria-busy={busy === "solo"}>
            {busy === "solo" ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            {t("Play solo")}
          </button>
          <button type="button" onClick={() => start(false)} className={ui.btnPrimary} disabled={busy !== ""} aria-busy={busy === "friends"}>
            {busy === "friends" ? <Loader2 className="size-4 animate-spin" /> : <Users className="size-4" />}
            {t("Host for friends")}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
