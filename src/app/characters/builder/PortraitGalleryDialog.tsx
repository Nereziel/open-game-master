"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { returnFocus } from "@/components/ui/return-focus";
import { contentName } from "@/lib/content/names";
import { type Gender, genderLabel } from "@/lib/gender";
import { blobToDataUrl } from "@/lib/image-encode";
import { useLocale, useT } from "@/lib/locale";
import { cn } from "@/lib/cn";
import { galleryPortraits, GALLERY_GENDERS, hasGalleryClass, hasGalleryRace, type GalleryOption, type GalleryPortrait } from "@/lib/portrait-gallery";
import type { SheetAttachment } from "@/lib/schemas/sheet";
import { ui } from "@/lib/ui";

const PAGE_SIZE = 36;

export function PortraitGalleryDialog({
  races,
  classes,
  raceId,
  classId,
  gender,
  onPicked,
  onClose,
}: {
  races: readonly GalleryOption[];
  classes: readonly GalleryOption[];
  raceId: string;
  classId: string;
  gender: Gender;
  onPicked: (portrait: SheetAttachment) => void;
  onClose: () => void;
}) {
  const t = useT();
  const locale = useLocale();
  const raceChoices = useMemo(() => races.filter((race) => hasGalleryRace(race.id)), [races]);
  const classChoices = useMemo(() => classes.filter((klass) => hasGalleryClass(klass.id)), [classes]);
  const [selectedRace, setSelectedRace] = useState(raceChoices.some((race) => race.id === raceId) ? raceId : "");
  const [selectedClass, setSelectedClass] = useState(classChoices.some((klass) => klass.id === classId) ? classId : "");
  const [selectedGender, setSelectedGender] = useState<Gender>(gender);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const portraits = useMemo(
    () => galleryPortraits(raceChoices, classChoices, { raceId: selectedRace, classId: selectedClass, gender: selectedGender }),
    [raceChoices, classChoices, selectedRace, selectedClass, selectedGender],
  );

  function portraitName(portrait: GalleryPortrait): string {
    return contentName(portrait.kind === "race" ? "species" : "classes", portrait.name, locale);
  }

  async function choose(portrait: GalleryPortrait) {
    if (saving) return;
    setSaving(portrait.id);
    setError("");
    try {
      // A built-in, same-origin WebP is copied through the existing upload
      // route: sheet portraits are restricted to /uploads/ for access control
      // and character export. The image backend is never contacted.
      const image = await fetch(portrait.src);
      if (!image.ok) throw new Error("gallery image unavailable");
      const dataUrl = await blobToDataUrl(new Blob([await image.blob()], { type: "image/webp" }));
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataUrl,
          name: `portrait-${portrait.kind}-${portrait.id.replaceAll(":", "-")}.webp`,
          type: "image/webp",
        }),
      });
      const uploaded: unknown = await response.json().catch(() => null);
      if (!response.ok || !uploaded || typeof uploaded !== "object") {
        throw new Error("upload failed");
      }
      const result = uploaded as Record<string, unknown>;
      if (
        typeof result.id !== "string" ||
        typeof result.url !== "string" ||
        !/^\/uploads\/[a-zA-Z0-9-]+\.webp$/.test(result.url)
      ) {
        throw new Error("invalid upload response");
      }
      onPicked({ id: result.id, url: result.url, type: "image/webp", name: String(result.name ?? "Portrait") });
      onClose();
    } catch {
      setError(t("Could not save the selected portrait. Please try again."));
    } finally {
      setSaving(null);
    }
  }

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-50 bg-[#05030d]/75 backdrop-blur-sm" />
        <Dialog.Content {...returnFocus}
          className={cn(ui.dialog, "fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[min(95vw,54rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto")}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="gold-title font-display text-lg">{t("Choose from gallery")}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-stone-400">
                {t("These are built-in portraits. Choosing one is free and does not use AI. Race and class pictures show different aspects of a character.")}
              </Dialog.Description>
            </div>
            <Dialog.Close disabled={Boolean(saving)} aria-label={t("Close")} className="rounded-md p-2 text-stone-400 hover:bg-stone-800 hover:text-stone-100 disabled:opacity-50">
              <X className="size-4" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block text-xs text-stone-400">
              {t("Race")}
              <select
                aria-label={t("Filter portraits by race")}
                className={cn(ui.input, "mt-1")}
                value={selectedRace}
                disabled={Boolean(saving)}
                onChange={(event) => { setSelectedRace(event.target.value); setVisibleCount(PAGE_SIZE); }}
              >
                <option value="">{t("All races")}</option>
                {raceChoices.map((race) => (
                  <option key={race.id} value={race.id}>{contentName("species", race.name, locale)}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-stone-400">
              {t("Class")}
              <select
                aria-label={t("Filter portraits by class")}
                className={cn(ui.input, "mt-1")}
                value={selectedClass}
                disabled={Boolean(saving)}
                onChange={(event) => { setSelectedClass(event.target.value); setVisibleCount(PAGE_SIZE); }}
              >
                <option value="">{t("All classes")}</option>
                {classChoices.map((klass) => (
                  <option key={klass.id} value={klass.id}>{contentName("classes", klass.name, locale)}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-stone-400">
              {t("Gender")}
              <select
                aria-label={t("Filter portraits by gender")}
                className={cn(ui.input, "mt-1")}
                value={selectedGender}
                disabled={Boolean(saving)}
                onChange={(event) => { setSelectedGender(event.target.value as Gender); setVisibleCount(PAGE_SIZE); }}
              >
                <option value="">{t("All genders")}</option>
                {GALLERY_GENDERS.map((choice) => (
                  <option key={choice} value={choice}>{genderLabel(choice, locale)}</option>
                ))}
              </select>
            </label>
          </div>

          <p role="status" className="mb-2 text-xs text-stone-400">
            {t("Available portraits: {count}", { count: portraits.length })}
          </p>
          {portraits.length ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {portraits.slice(0, visibleCount).map((portrait) => (
                <button
                  key={portrait.id}
                  type="button"
                  disabled={Boolean(saving)}
                  onClick={() => void choose(portrait)}
                  aria-label={t("Choose portrait of {name}", { name: `${portraitName(portrait)} – ${genderLabel(portrait.gender, locale)}` })}
                  className="motion-press group overflow-hidden rounded-lg border border-stone-700 bg-stone-950/60 text-left transition-colors hover:border-amber-400/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 disabled:opacity-60"
                >
                  <span className="relative block aspect-square overflow-hidden">
                    {/* The gallery contains packaged local images, never remote URLs. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={portrait.src} alt="" loading="lazy" className="size-full object-cover transition-transform group-hover:scale-[1.03]" />
                    {saving === portrait.id ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-stone-950/70">
                        <Loader2 className="size-6 animate-spin text-amber-200" aria-hidden="true" />
                      </span>
                    ) : null}
                  </span>
                  <span className="block px-2 py-1.5 text-xs text-stone-300">
                    <span className="block truncate">{portraitName(portrait)}</span>
                    <span className="block truncate text-stone-500">
                      {portrait.kind === "race" ? t("Race portrait") : t("Class portrait")} · {genderLabel(portrait.gender, locale)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-stone-700/70 p-5 text-center text-sm text-stone-400">
              <ImageIcon className="mx-auto mb-2 size-6" aria-hidden="true" />
              {t("No built-in portraits match these filters. Try another race or class.")}
            </div>
          )}
          {visibleCount < portraits.length ? (
            <button type="button" className={cn(ui.btnSmall, "mt-3 w-full justify-center")} disabled={Boolean(saving)} onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
              {t("Show more portraits")}
            </button>
          ) : null}
          {error ? <p role="alert" className="mt-3 text-sm text-red-300">{error}</p> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
