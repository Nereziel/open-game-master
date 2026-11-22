"use client";

import { useState } from "react";
import { InfoDialog } from "@/components/ui/InfoDialog";
import { useLocale } from "@/lib/locale";
import { skillLabel } from "@/lib/srd";
import { skillHelpText } from "@/lib/srd/skill-help-cs";

// Matches the dotted, clickable term used for Initiative and other rules
// glossary terms. Works with keyboard and touch, not only hover.
export function SkillHelpTerm({ id, ability }: { id: string; ability: string }) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const name = skillLabel(id, locale);
  return (
    <>
      <button
        type="button"
        className="min-w-0 truncate cursor-help underline decoration-stone-600 decoration-dotted underline-offset-2 transition-colors hover:text-amber-200 hover:decoration-amber-500/60"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        aria-label={locale === "cs" ? `Co znamená dovednost ${name}?` : `What does ${name} mean?`}
      >
        {name}
      </button>
      <InfoDialog open={open} onOpenChange={setOpen} title={name} text={skillHelpText(id, ability, locale)} />
    </>
  );
}
