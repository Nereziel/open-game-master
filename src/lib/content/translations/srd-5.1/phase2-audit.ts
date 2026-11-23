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

export type SrdPhase2Audit = Readonly<{
  checkedPages: number;
  metadataIssues: readonly SrdPhase2MetadataIssue[];
  diceReview: readonly SrdPhase2DiceReview[];
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
  for (const match of text.matchAll(/\b(?:(\d+)\s*)?[dk]\s*(4|6|8|10|12|20|100)\b/gi)) {
    found.add(`${Number(match[1] ?? "1")}d${Number(match[2])}`);
  }
  return [...found].sort();
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
  return { checkedPages: englishPages.length, metadataIssues, diceReview, fullTextPages };
}
