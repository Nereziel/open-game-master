import { defaultTypes, LINK_LABELS, type FieldDef, type WorldType } from "./model.ts";
import type { TranslateVars } from "@/lib/i18n/translate";

type T = (key: string, vars?: TranslateVars) => string;
const defaults = new Map(defaultTypes().map((type) => [type.id, type]));
const links = new Set<string>(LINK_LABELS);

// Stored link words are the protocol, even if they are shown in another
// language. Custom words outside that vocabulary remain the author's.
export function worldLinkLabel(t: T, label: string): string {
  return links.has(label) ? t(label, { context: "world.link" }) : label;
}

function defaultType(type: WorldType): WorldType | undefined {
  const original = defaults.get(type.id);
  return original?.shelf === type.shelf ? original : undefined;
}

export function worldTypeLabel(t: T, type: WorldType): string {
  return defaultType(type)?.name === type.name ? t(type.name) : type.name;
}

function defaultField(type: WorldType, field: FieldDef): FieldDef | undefined {
  return defaultType(type)?.fields.find((original) => original.id === field.id && original.name === field.name && original.kind === field.kind);
}

export function worldFieldLabel(t: T, type: WorldType, field: FieldDef): string {
  return defaultField(type, field) ? t(field.name) : field.name;
}

export function worldFieldOption(t: T, type: WorldType, field: FieldDef, value: string): string {
  return defaultField(type, field)?.options.includes(value) ? t(value, { context: "world.field.option" }) : value;
}
