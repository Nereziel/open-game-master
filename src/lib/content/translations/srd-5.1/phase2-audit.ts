// Mechanical cross-check of the Czech companion against the *same* English
// SRD 5.1 pages. Presence of a translation is not proof that its rules are
// correct; dice differences are surfaced for human review, never auto-fixed.
import type { RulebookPage } from "@/lib/rulebook/types";
import {
  czechSrdItemMeta,
  czechSrdMonsterMeta,
  czechSrdSpellGroup,
  czechSrdSpellMeta,
} from "@/lib/rulebook/czech-terms";

export type SrdPhase2MetadataIssue = Readonly<{
  id: string;
  kind: RulebookPage["kind"];
  field: "identity" | "meta" | "sourceMeta" | "spellLevel" | "group" | "family";
  english: string;
  czech: string;
}>;

export type SrdPhase2DiceReview = Readonly<{
  id: string;
  kind: RulebookPage["kind"];
  missingFromCzech: readonly string[];
  unexpectedInCzech: readonly string[];
}>;

export type SrdPhase2SpellHeaderReview = Readonly<{
  id: string;
  field: "castingTime" | "range" | "components" | "duration";
  english: string;
  czech: string;
  reason: string;
}>;

export type SrdPhase2Audit = Readonly<{
  checkedPages: number;
  metadataIssues: readonly SrdPhase2MetadataIssue[];
  diceReview: readonly SrdPhase2DiceReview[];
  spellHeaderReview: readonly SrdPhase2SpellHeaderReview[];
  fullTextPages: number;
}>;

const FULL_CZECH_HEADING = "## Úplné znění pravidel v češtině";

// The companion appends the unchanged English page after the Czech text.
// Never scan that suffix or a short Czech overview when comparing rules.
export function fullCzechRulesOnly(source: RulebookPage, localized: RulebookPage): string | null {
  if (!localized.md.endsWith(source.md)) return null;
  const text = localized.md.slice(0, -source.md.length);
  const position = text.indexOf(FULL_CZECH_HEADING);
  if (position === -1) return null;
  return text.slice(position + FULL_CZECH_HEADING.length)
    .replace(/\n*---\s*\*\*Úplné původní znění SRD 5\.1 v angličtině:\*\*\s*$/, "")
    .trim();
}

// Dice sides and dice counts are mechanically fixed even if Czech uses
// "k" instead of English "d". This deliberately does NOT treat 30 feet
// versus 9 metres or number words as discrepancies: those are conversions.
export function diceSignatures(text: string): readonly string[] {
  const found = new Set<string>();
  // "d4" / "k4" is an implicit 1d4, common in SRD bonuses.
  // Die marker and sides must be adjacent: Czech "k 12" means "to twelve",
  // not a d12 die, and otherwise produces false mechanical-review alarms.
  for (const match of text.matchAll(/\b(?:(\d+)\s*)?[dk](4|6|8|10|12|20|100)\b/gi)) {
    found.add(`${Number(match[1] ?? "1")}d${Number(match[2])}`);
  }
  return [...found].sort();
}

// Spell headers are the highest-value numeric text outside the metadata:
// components, casting time, range and duration must not be silently changed.
// Czech translations keep imperial-foot values; the secondary sáh value is
// explanatory and must not replace the official number of feet.
function header(text: string, label: string): string {
  const escaped = label.replace(/[.*+?^$\{\}()|[\]\\]/g, "\\function expectedMetadata(source: RulebookPage): string | undefined {");
  return new RegExp(`^\\*\\*${escaped}:\\*\\*\\s*(.+)// Mechanical cross-check of the Czech companion against the *same* English
// SRD 5.1 pages. Presence of a translation is not proof that its rules are
// correct; dice differences are surfaced for human review, never auto-fixed.
import type { RulebookPage } from "@/lib/rulebook/types";
import {
  czechSrdItemMeta,
  czechSrdMonsterMeta,
  czechSrdSpellGroup,
  czechSrdSpellMeta,
} from "@/lib/rulebook/czech-terms";

export type SrdPhase2MetadataIssue = Readonly<{
  id: string;
  kind: RulebookPage["kind"];
  field: "identity" | "meta" | "sourceMeta" | "spellLevel" | "group" | "family";
  english: string;
  czech: string;
}>;

export type SrdPhase2DiceReview = Readonly<{
  id: string;
  kind: RulebookPage["kind"];
  missingFromCzech: readonly string[];
  unexpectedInCzech: readonly string[];
}>;

export type SrdPhase2SpellHeaderReview = Readonly<{
  id: string;
  field: "castingTime" | "range" | "components" | "duration";
  english: string;
  czech: string;
  reason: string;
}>;

export type SrdPhase2Audit = Readonly<{
  checkedPages: number;
  metadataIssues: readonly SrdPhase2MetadataIssue[];
  diceReview: readonly SrdPhase2DiceReview[];
  spellHeaderReview: readonly SrdPhase2SpellHeaderReview[];
  fullTextPages: number;
}>;

const FULL_CZECH_HEADING = "## Úplné znění pravidel v češtině";

// The companion appends the unchanged English page after the Czech text.
// Never scan that suffix or a short Czech overview when comparing rules.
export function fullCzechRulesOnly(source: RulebookPage, localized: RulebookPage): string | null {
  if (!localized.md.endsWith(source.md)) return null;
  const text = localized.md.slice(0, -source.md.length);
  const position = text.indexOf(FULL_CZECH_HEADING);
  if (position === -1) return null;
  return text.slice(position + FULL_CZECH_HEADING.length)
    .replace(/\n*---\s*\*\*Úplné původní znění SRD 5\.1 v angličtině:\*\*\s*$/, "")
    .trim();
}

// Dice sides and dice counts are mechanically fixed even if Czech uses
// "k" instead of English "d". This deliberately does NOT treat 30 feet
// versus 9 metres or number words as discrepancies: those are conversions.
export function diceSignatures(text: string): readonly string[] {
  const found = new Set<string>();
  // "d4" / "k4" is an implicit 1d4, common in SRD bonuses.
  // Die marker and sides must be adjacent: Czech "k 12" means "to twelve",
  // not a d12 die, and otherwise produces false mechanical-review alarms.
  for (const match of text.matchAll(/\b(?:(\d+)\s*)?[dk](4|6|8|10|12|20|100)\b/gi)) {
    found.add(`${Number(match[1] ?? "1")}d${Number(match[2])}`);
  }
  return [...found].sort();
}

, "im").exec(text)?.[1]?.trim() ?? "";
}

function firstNumber(value: string): string | null {
  return /\d+/.exec(value)?.[0] ?? null;
}

function feetIn(value: string, czech: boolean): string | null {
  const match = czech
    ? /\b(\d+)\s+(?:stop|stopy|stopa)\b/i.exec(value)
    : /\b(\d+)(?:-|\s*)(?:foot|feet)\b/i.exec(value);
  return match?.[1] ?? null;
}

function componentLetters(value: string): string {
  return (value.split("(")[0].match(/\b[VSM]\b/g) ?? []).sort().join(",");
}

function compareSpellHeaders(source: RulebookPage, fullCzech: string): SrdPhase2SpellHeaderReview[] {
  const fields = [
    ["castingTime", "Casting Time", "Doba sesílání"],
    ["range", "Range", "Dosah"],
    ["components", "Components", "Složky"],
    ["duration", "Duration", "Trvání"],
  ] as const;
  const issues: SrdPhase2SpellHeaderReview[] = [];
  for (const [field, enLabel, csLabel] of fields) {
    const english = header(source.md, enLabel);
    if (!english) continue;
    const czech = header(fullCzech, csLabel);
    let reason: string | null = null;
    if (!czech) reason = "missing Czech spell field";
    else if (field === "components" && componentLetters(english) !== componentLetters(czech)) {
      reason = "V/S/M components differ";
    } else if ((field === "castingTime" || field === "duration") && firstNumber(english) !== firstNumber(czech)) {
      reason = "numeric time differs";
    } else if (field === "range" && feetIn(english, false) !== null && feetIn(english, false) !== feetIn(czech, true)) {
      reason = "range in feet differs";
    } else if (field === "duration" && /\bconcentration\b/i.test(english) !== /\bsoustředění\b/i.test(czech)) {
      reason = "concentration flag differs";
    }
    if (reason) issues.push({ id: source.id, field, english, czech, reason });
  }
  return issues;
}

function expectedMetadata(source: RulebookPage): string | undefined {
  const meta = source.meta;
  if (!meta) return undefined;
  switch (source.kind) {
    case "spell": return czechSrdSpellMeta(meta);
    case "item": return czechSrdItemMeta(meta);
    case "monster": return czechSrdMonsterMeta(meta);
    default: return meta;
  }
}

function numericSpellLevel(meta: string): number | null {
  const english = /\b(\d+)(?:st|nd|rd|th)-level\b/i.exec(meta);
  // JavaScript word boundaries are ASCII-based; the final Czech "ě" is not a word character.
  const czech = /\b(\d+)\.\s*úrovně(?=\s|$|[.,;)])/i.exec(meta);
  if (english || czech) return Number((english ?? czech)![1]);
  return /\b(?:cantrip|trik)\b/i.test(meta) ? 0 : null;
}

export function auditSrdPhase2(
  englishPages: readonly RulebookPage[],
  czechPages: readonly RulebookPage[],
): SrdPhase2Audit {
  const english = new Map(englishPages.map((page) => [page.id, page]));
  const czech = new Map(czechPages.map((page) => [page.id, page]));
  const metadataIssues: SrdPhase2MetadataIssue[] = [];
  const diceReview: SrdPhase2DiceReview[] = [];
  const spellHeaderReview: SrdPhase2SpellHeaderReview[] = [];
  let fullTextPages = 0;
  const issue = (page: RulebookPage, field: SrdPhase2MetadataIssue["field"], en: string | undefined, cs: string | undefined) => {
    metadataIssues.push({ id: page.id, kind: page.kind, field, english: en ?? "", czech: cs ?? "" });
  };

  for (const source of englishPages) {
    const translated = czech.get(source.id);
    if (!translated) {
      issue(source, "identity", source.id, "MISSING");
      continue;
    }
    if (translated.kind !== source.kind || translated.chapter !== source.chapter) {
      issue(source, "identity", `${source.kind}/${source.chapter}`, `${translated.kind}/${translated.chapter}`);
    }
    const expected = expectedMetadata(source);
    if (translated.meta !== expected) issue(source, "meta", expected, translated.meta);
    // originalMeta is a provenance guard, not a translated UI field.
    const originalMeta = expected !== source.meta ? source.meta : undefined;
    if (translated.originalMeta !== originalMeta) issue(source, "sourceMeta", originalMeta, translated.originalMeta);
    if (source.kind === "spell" && source.meta && translated.meta) {
      const before = numericSpellLevel(source.meta);
      const after = numericSpellLevel(translated.meta);
      if (before !== after) issue(source, "spellLevel", String(before), String(after));
    }
    const expectedGroup = source.kind === "spell" && source.group
      ? czechSrdSpellGroup(source.group) : source.group;
    if (translated.group !== expectedGroup) issue(source, "group", expectedGroup, translated.group);
    if (translated.family !== source.family) issue(source, "family", source.family, translated.family);

    const fullCzech = fullCzechRulesOnly(source, translated);
    if (!fullCzech) continue;
    fullTextPages++;
    if (source.kind === "spell") spellHeaderReview.push(...compareSpellHeaders(source, fullCzech));
    const sourceDice = diceSignatures(source.md);
    const czechDice = diceSignatures(fullCzech);
    const fromSource = new Set(sourceDice);
    const fromCzech = new Set(czechDice);
    const missingFromCzech = sourceDice.filter((value) => !fromCzech.has(value));
    const unexpectedInCzech = czechDice.filter((value) => !fromSource.has(value));
    if (missingFromCzech.length || unexpectedInCzech.length) {
      diceReview.push({ id: source.id, kind: source.kind, missingFromCzech, unexpectedInCzech });
    }
  }
  for (const translated of czechPages) {
    if (!english.has(translated.id)) issue(translated, "identity", "UNKNOWN", translated.id);
  }
  return { checkedPages: englishPages.length, metadataIssues, diceReview, spellHeaderReview, fullTextPages };
}
