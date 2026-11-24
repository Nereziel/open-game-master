import { IMPORT_KIND_LABELS, type ImportKind, type ImportWarning, type WorldRecordFacts } from "./import-kinds.ts";

type T = (key: string, vars?: Record<string, string | number>) => string;

export function importKindLabel(kind: ImportKind, t: T): string {
  return t(IMPORT_KIND_LABELS[kind], { context: "workshop.import.kind" });
}

function lossLabels(facts: WorldRecordFacts, t: T): string {
  const keys = [
    ["entries", "World entries: {count}"],
    ["links", "Links: {count}"],
    ["pins", "Map pins: {count}"],
    ["secrets", "Secret subjects or knowers: {count}"],
    ["events", "Timeline mentions: {count}"],
  ] as const;
  return keys.filter(([field]) => facts[field] > 0)
    .map(([field, key]) => t(key, { count: facts[field] }))
    .join(", ") || t("Nothing more");
}

function cardLabels(cards: readonly string[], t: T): string {
  if (!cards.length) return "";
  const shown = cards.slice(0, 4).map((title) => `"${title}"`).join(", ");
  return ": " + shown + (cards.length > 4 ? t(" and {count} more", { count: cards.length - 4 }) : "");
}

// The planner still emits its original English message for other consumers.
// Only the display layer interpolates local labels, counts and source names.
export function importWarningText(warning: ImportWarning, t: T, locale: string): string {
  const display = warning.display;
  if (!display || locale === "en") return warning.message;
  const vars: Record<string, string | number> = { ...display.vars };
  for (const [key, kinds] of Object.entries(display.kinds ?? {})) {
    vars[key] = kinds.map((kind) => importKindLabel(kind, t)).join(", ");
  }
  if (display.facts) vars.losses = lossLabels(display.facts, t);
  if (display.cards) vars.cards = cardLabels(display.cards, t);
  return t(display.key, { ...vars, context: "workshop.import.plan" });
}
