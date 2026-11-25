"use client";

import { PageSection } from "@/components/PageShell";
import { LanguageSelect } from "@/components/LanguageSelect";
import { Field } from "@/app/admin/AdminSettingsFields";
import { useT } from "@/lib/locale";
import type { TableLanguage } from "@/lib/schemas/game-settings-options";

// What the GM's memory reads with now (GET/PATCH /api/admin/settings
// `embedding`): the model, and whether the language or .env.server chose it.
export type EmbeddingStatus = { model: string; source: "env" | "language" };

// The server's language (src/lib/language/server-language.ts): new campaigns
// start in it, and it picks the model the GM's memory search reads the story
// with. Saved with the rest of the page; a change of model re-embeds the
// stored story in the background.
export function AdminLanguageSection({
  value,
  onChange,
  embedding,
  changed,
}: {
  value: TableLanguage;
  onChange: (language: TableLanguage) => void;
  embedding: EmbeddingStatus | null;
  // The picked language differs from the saved one.
  changed: boolean;
}) {
  const t = useT();
  return (
    <PageSection id="admin-language" heading={t("Language")} glyph="tab-story">
      <Field
        label={t("The language your tables play in")}
        hint={t("New campaigns start in it, and the Game Master's memory reads the story in it. Each campaign can still pick its own under Table language. The buttons and menus follow each reader's browser, or the language they pick under Settings > Language.")}
      >
        <LanguageSelect value={value} onChange={onChange} label={t("Server language")} className="w-full sm:max-w-xs" />
      </Field>
      <p className="mt-2 text-xs text-stone-500" aria-live="polite">
        {embedding?.source === "env"
          ? t("Memory search reads with {model}, set by EMBEDDING_MODEL in .env.server. Remove that line to let the language choose.", { model: embedding.model })
          : changed
            ? value === "english"
              ? t("Saving switches memory search to the English model and re-reads every campaign's story in the background.")
              : t("Saving switches memory search to a model that reads every language and re-reads every campaign's story in the background. It is downloaded once (about 120 MB); until it is ready, the Game Master finds things by their words.")
            : embedding
              ? value === "english"
                ? t("Memory search reads with {model}, which reads English.", { model: embedding.model })
                : t("Memory search reads with {model}, which reads every table language.", { model: embedding.model })
              : null}
      </p>
    </PageSection>
  );
}
