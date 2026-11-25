import { IMPORT_KIND_LABELS, type ImportKind, type ImportMessagePart, type ImportWarning, type WorldRecordFacts } from "./import-kinds.ts";

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
  if (!display || locale === "en" || t(display.key, { context: "workshop.import.plan" }) === display.key) return warning.message;
  const vars: Record<string, string | number> = { ...display.vars };
  for (const [key, kinds] of Object.entries(display.kinds ?? {})) {
    vars[key] = kinds.map((kind) => importKindLabel(kind, t)).join(", ");
  }
  for (const [key, parts] of Object.entries(display.details ?? {})) {
    vars[key] = parts.map((part) => t(part.key, part.vars)).join(" ");
  }
  if (display.facts) vars.losses = lossLabels(display.facts, t);
  if (display.cards) vars.cards = cardLabels(display.cards, t);
  return t(display.key, { ...vars, context: "workshop.import.plan" });
}

type ReferenceKind = "tables" | "npcs" | "lore";

const REFERENCE_KEYS: Record<ReferenceKind, readonly [string, string]> = {
  tables: [
    "{table}: its row for the table {name} now names this campaign's own {name}, since the source's stayed behind.",
    "{table}: its row for the table {name} names nothing here, since that table stayed behind.",
  ],
  npcs: [
    "{table}: its row for the NPC {name} now names this campaign's own {name}, since the source's stayed behind.",
    "{table}: its row for the NPC {name} names nothing here, since that NPC stayed behind.",
  ],
  lore: [
    "{table}: its row for the lore entry {name} now names this campaign's own {name}, since the source's stayed behind.",
    "{table}: its row for the lore entry {name} names nothing here, since that lore entry stayed behind.",
  ],
};

export type ImportResultNote = {
  message: string;
  key: string;
  vars: Record<string, string | number>;
  parts?: Record<string, ImportMessagePart>;
};

export function makeImportResultNote(key: string, vars: Record<string, string | number>, parts?: ImportResultNote["parts"]): ImportResultNote {
  const message = key.replace(/\{(\w+)\}/g, (slot, name: string) => Object.hasOwn(vars, name) ? String(vars[name]) : slot);
  return { message, key, vars, ...(parts ? { parts } : {}) };
}

// Construct the same English message and its translation template at the
// point where the reference's kind and outcome are known, not by parsing names.
export function referenceImportNote(kind: ReferenceKind, table: string, name: string, matched: boolean): ImportResultNote {
  const key = REFERENCE_KEYS[kind][matched ? 0 : 1];
  return makeImportResultNote(key, { table, name });
}

// Keep legacy messages and their order even when display data is missing.
export function importResultNotesText(messages: readonly string[], displays: readonly ImportResultNote[], t: T): string[] {
  const byMessage = new Map(displays.map((note) => [note.message, note]));
  return messages.map((message) => {
    const note = byMessage.get(message);
    if (!note || t(note.key, { context: "workshop.import.result" }) === note.key) return message;
    const vars = { ...note.vars };
    for (const [name, part] of Object.entries(note.parts ?? {})) {
      vars[name] = t(part.key, { ...part.vars, context: "workshop.import.result" });
    }
    return t(note.key, { ...vars, context: "workshop.import.result" });
  });
}
