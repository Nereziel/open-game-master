"use client";

import { PageSection } from "@/components/PageShell";
import { GameIcon } from "@/components/ui/GameIcon";
import { LOCALE_METADATA } from "@/lib/i18n/locale";
import { useLocaleChoice, useT, writeLocaleChoice, type LocaleChoice } from "@/lib/locale";

// Language, beside Appearance and on the same contract: the reader's own
// choice, "auto" following a supported non-English server language, else
// the browser. The language
// names stay in their own tongue ("Français", never "French") so someone
// facing a language they cannot read can still find their own.
const CHOICES: Array<{ id: LocaleChoice; label: string; glyph: string }> = [
  { id: "auto", label: "auto", glyph: "sense-darkvision" },
  { id: "en", label: LOCALE_METADATA.en.nativeName, glyph: "daypart-dusk" },
  { id: "fr", label: LOCALE_METADATA.fr.nativeName, glyph: "daypart-night" },
  { id: "cs", label: LOCALE_METADATA.cs.nativeName, glyph: "daypart-dusk" },
];

export function LanguageSection() {
  const choice = useLocaleChoice();
  const t = useT();
  return (
    <PageSection
      heading={t("Language")}
      glyph="system-lore"
      intro={t("The language of the menus and screens. Automatic uses the server language when a matching non-English interface is available, otherwise the browser language. The Game Master narrates in the table's own language.")}
    >
      <div data-pill-group="" role="group" aria-label={t("Language")} className="flex flex-wrap gap-2">
        {CHOICES.map((entry) => {
          const label = entry.id === "auto" ? t("Automatic") : entry.label;
          return (
            <button
              data-on={choice === entry.id ? "" : undefined}
              key={entry.id}
              type="button"
              aria-pressed={choice === entry.id}
              onClick={() => writeLocaleChoice(entry.id)}
              className="theme-card motion-press"
            >
              <GameIcon icon={{ kind: "glyph", key: entry.glyph }} size="size-8" /> {label}
            </button>
          );
        })}
      </div>
    </PageSection>
  );
}
