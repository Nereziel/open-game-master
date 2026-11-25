"use client";

import { useId, useState } from "react";
import { useT } from "@/lib/locale";
import { canonicalRuleTerm, ruleTermLabel, ruleTermOptions } from "@/lib/i18n/rule-term-input";

// A free-text mechanical field, not a closed enum. The localized datalist
// values are accepted only via an exact vocabulary match; the draft always
// receives the canonical key, while the active editor keeps the typed text
// so completing a longer custom word cannot replace a prefix mid-keystroke.
export function RuleTermInput({ value, known, onChange, placeholder, label, className }: {
  value: string;
  known: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}) {
  const t = useT();
  const id = useId();
  const [editing, setEditing] = useState<string | null>(null);
  const options = ruleTermOptions(known, t);
  const display = ruleTermLabel(value, options);
  return (
    <>
      <input
        list={id}
        value={editing ?? display}
        aria-label={label}
        placeholder={placeholder ? ruleTermLabel(placeholder, options) : undefined}
        onFocus={() => setEditing(display)}
        onChange={(event) => {
          const input = event.target.value;
          setEditing(input);
          onChange(canonicalRuleTerm(input, options));
        }}
        onBlur={() => setEditing(null)}
        className={className}
      />
      <datalist id={id}>
        {options.map((option) => (
          <option key={option.value} value={canonicalRuleTerm(option.label, options) === option.value ? option.label : option.value} />
        ))}
      </datalist>
    </>
  );
}
