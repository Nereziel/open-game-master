"use client";

import { scopeQuery, useContentCampaign } from "@/lib/content-scope";
import { Info, Loader2 } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { GameIcon } from "@/components/ui/GameIcon";
import type { IconRef } from "@/lib/icons";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useLocale, useT } from "@/lib/locale";
import { itemDescriptionCs, itemDetailCs, itemRangeCs, itemWeightCs } from "@/lib/help/item-detail-cs";
import { Dialog } from "@/components/ui/Dialog";
import type { ItemSheet } from "@/lib/help/item-sheet";
import { firstSentence, parseRulesBlocks, parseRulesTable } from "@/lib/help/rules-text";
import { textKey } from "@/lib/language/text-logic";
import { officialCzechSpellPageId } from "@/lib/help/official-cs-reference";
import { thirdPartyItemSummaryCs } from "@/lib/help/third-party-item-summary-cs";
import { sameContentDocument } from "@/lib/help/content-ref-match";
import { localizedThirdPartySpellDescription } from "@/lib/help/third-party-spell-summary-cs";
import { thirdPartyFeatDescriptionCs } from "@/lib/help/third-party-feat-description-cs";
import { thirdPartyFullRulesCs } from "@/lib/help/third-party-full-rules-cs";

// The "what does this do?" affordance, used everywhere a game term appears.
//
// Built on the shared Dialog rather than a popover on purpose: Radix tooltips
// never open on a touch tap, and the session layout is used on phones. A
// dialog behaves identically with a mouse, a finger and a keyboard.
//
// Text can be passed directly (features, glossary terms) or fetched lazily
// from the content pack by {kind, slug} for spells, feats and items, which is
// what /api/content/[kind]/[slug] was built for.

// `name` lets the lookup recover when a row's slug is not the plain
// slugified name (third-party documents pick their own), by falling back to
// a search.
export type ContentRef = { kind: string; slug: string; name?: string; source?: string; documentSlug?: string; rulebook?: string };

// Content-pack descriptions are markdown-ish: headings, bold, italics, tables.
// The block structure comes from src/lib/help/rules-text.ts, which knows the
// pack's quirks; this only turns each block into elements. Valid Markdown
// tables render as horizontally scrollable, accessible HTML tables.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|(?<![\w])_[^_\n]+_(?![\w]))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      out.push(text.slice(last, match.index));
    }
    const token = match[0];
    const key = `${keyPrefix}-${index}`;
    index += 1;
    if (token.startsWith("**")) {
      out.push(
        <strong key={key} className="font-medium text-stone-200">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      out.push(
        <em key={key} className="text-stone-300">
          {token.slice(1, -1)}
        </em>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) {
    out.push(text.slice(last));
  }
  return out;
}

export function renderRules(text: string): ReactNode {
  return parseRulesBlocks(text).map((block, blockIndex) => {
    switch (block.kind) {
      case "table": {
        const table = parseRulesTable(block.rows);
        if (!table) {
          // A nonstandard rules entry must remain readable without dropping
          // columns or silently interpreting arbitrary pipe-delimited text.
          return (
            <pre key={blockIndex} className="overflow-x-auto rounded-md bg-stone-900/60 p-2 text-[11px] leading-relaxed text-stone-400">
              {block.rows.join("\n")}
            </pre>
          );
        }
        return (
          <div key={blockIndex} className="max-w-full overflow-x-auto rounded-md border border-stone-700/70">
            <table className="w-full min-w-max border-collapse text-left text-xs leading-relaxed">
              <thead className="bg-stone-900/70 text-amber-100">
                <tr>
                  {table.head.map((cell, cellIndex) => (
                    <th
                      key={cellIndex}
                      scope="col"
                      className="whitespace-nowrap border-b border-stone-700 px-3 py-2 font-semibold"
                      style={{ textAlign: table.align[cellIndex] ?? undefined }}
                    >
                      {renderInline(cell, `${blockIndex}-head-${cellIndex}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-stone-800/70 last:border-0 odd:bg-stone-900/20">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-3 py-2 align-top text-stone-300"
                        style={{ textAlign: table.align[cellIndex] ?? undefined }}
                      >
                        {renderInline(cell, `${blockIndex}-${rowIndex}-${cellIndex}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      case "list":
        return (
          <ul key={blockIndex} className="list-disc space-y-1 pl-4">
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderInline(item, `${blockIndex}-${itemIndex}`)}</li>
            ))}
          </ul>
        );
      case "heading":
        // A heading line becomes a small label rather than showing its hashes.
        return (
          <p key={blockIndex} className="reveal mb-1 text-xs font-medium uppercase tracking-wide text-amber-200/80">
            {block.text}
          </p>
        );
      default:
        return <p key={blockIndex}>{renderInline(block.text, String(blockIndex))}</p>;
    }
  });
}

// Loads a content-pack entry's description on first open, so opening a sheet
// with forty spells on it costs nothing until one is actually inspected.
function ContentBody({ reference }: { reference: ContentRef }) {
  // The table the dialog opened at reads its DMs' homebrew.
  const campaignId = useContentCampaign();
  const t = useT();
  const locale = useLocale();
  const [state, setState] = useState<{ text: string | null; loading: boolean }>({
    text: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { describeContentEntry } = await import("@/lib/help");
        const { needsNote } = await import("@/lib/content/levelup-logic");
        const fullSpellRules = thirdPartyFullRulesCs(reference, locale);
        if (fullSpellRules) {
          if (!cancelled) setState({ text: fullSpellRules, loading: false });
          return;
        }
        const licensedFeatTranslation = thirdPartyFeatDescriptionCs(reference, locale);
        if (licensedFeatTranslation) {
          if (!cancelled) setState({ text: licensedFeatTranslation, loading: false });
          return;
        }
        const builtinFeat = locale === "cs" && reference.kind === "feats"
          && (reference.documentSlug === "odm-expanded" || reference.documentSlug === "wotc-srd"
            || reference.source === "srd" || reference.source === "bundled");
        if (builtinFeat) {
          const { builtinFeatSummaryCs } = await import("@/lib/help/feat-summary-cs");
          const summary = builtinFeatSummaryCs(reference.name ?? "");
          if (summary) {
            if (!cancelled) setState({ text: `**Stručný přehled:** ${summary}`, loading: false });
            return;
          }
        }
        const srdSpellPage = locale === "cs" ? officialCzechSpellPageId(reference) : null;
        if (srdSpellPage) {
          const pageResponse = await fetch(`/api/rulebook/pages/${encodeURIComponent(srdSpellPage)}`, { headers: { "X-Odm-Locale": "cs" } });
          const page = pageResponse.ok ? (await pageResponse.json())?.page : null;
          if (page?.kind === "spell" && typeof page.md === "string" && page.md.trim()) {
            if (!cancelled) setState({ text: page.md, loading: false });
            return;
          }
        }
        // An entry built on rules this game does not play, or played from
        // mechanics the app read and nobody checked, says so first (issue
        // #570). The note is the reader's words — the keyed "best effort"
        // line, whose English is reading-logic's constant.
        const withNote = (entry: { needs?: Parameters<typeof needsNote>[0]; bestEffort?: boolean } | undefined, text: string | null) => {
          const notes = [needsNote(entry?.needs ?? []), entry?.bestEffort ? t("Best effort: the app read this entry's rules from its text, and nobody has checked that reading yet. If it plays differently from what the text says, the text and the GM win, and a workshop copy can fix it for your table.") : null].filter(Boolean);
          return text && notes.length ? `${notes.join("\n\n")}\n\n${text}` : text;
        };
        const response = await fetch(
          `/api/content/${reference.kind}/${encodeURIComponent(reference.slug)}${scopeQuery(campaignId)}`,
        );
        if (response.ok) {
          const data = await response.json();
          // A background's feature asked by name opens that feature.
          const entry = sameContentDocument(reference, data?.entry) ? data.entry : undefined;
          const text = withNote(entry, describeContentEntry(entry?.data, reference.kind === "backgrounds" ? reference.name : undefined));
          if (text) {
            if (!cancelled) {
              setState({ text: localizedThirdPartySpellDescription(reference, locale, text), loading: false });
            }
            return;
          }
        }
        // The slug guessed from the name missed, or the row it found carries
        // no text. Search by name and take an exact match.
        const wanted = textKey(reference.name ?? reference.slug);
        const search = await fetch(
          `/api/content/${reference.kind}?q=${encodeURIComponent(wanted)}&limit=20&mechanics=1${scopeQuery(campaignId, "&")}`,
        );
        const results = search.ok ? ((await search.json()).results ?? []) : [];
        const hit = results.find(
          (entry: { name: string; source?: string; documentSlug?: string }) => textKey(entry.name) === wanted && sameContentDocument(reference, entry),
        );
        if (!cancelled) {
          setState({ text: localizedThirdPartySpellDescription(reference, locale, withNote(hit, describeContentEntry(hit?.data))), loading: false });
        }
      } catch {
        if (!cancelled) {
          setState({ text: null, loading: false });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [reference.kind, reference.slug, reference.name, reference.source, reference.documentSlug, reference.rulebook, campaignId, t, locale]);

  if (state.loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-stone-500">
        <Loader2 className="size-4 animate-spin" /> {t("Looking it up...")}
      </p>
    );
  }
  if (!state.text) {
    return (
      <p className="text-sm text-stone-500">
        {t("No details available. The content pack may not be installed, or this item was added by hand.")}
      </p>
    );
  }
  return <>{renderRules(state.text)}</>;
}

function StatTile({ label, value, note }: { label: string; value: string | null; note?: string | null }) {
  return (
    <div className="rounded-md border border-stone-800 bg-stone-900/60 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wider text-stone-500">{label}</p>
      <p className={cn("font-display text-base leading-tight", value ? "text-amber-100" : "text-stone-600")}>
        {value ?? "—"}
      </p>
      {note ? <p className="text-[11px] leading-tight text-stone-400">{note}</p> : null}
    </div>
  );
}

function ItemSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-200/80">{title}</p>
      {children}
    </section>
  );
}

function RuleList({ rows }: { rows: Array<{ label: string; text: string | null }> }) {
  return (
    <dl className="space-y-1.5">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
          <dt className="shrink-0 font-medium text-stone-200 sm:w-32">{row.label}</dt>
          <dd className="text-stone-400">{row.text ?? ""}</dd>
        </div>
      ))}
    </dl>
  );
}

// The item card: what it is, weight and value always on show, then the
// armour or weapon stats, then the long text when there is any. The facts
// come from every row that shares the name plus the bundled SRD tables
// (src/lib/help/item-sheet.ts), so a v1 table row with no prose, a v2 gear
// row with no stats and a genre item the pack lacks all get a full card.
function ItemBody({ reference }: { reference: ContentRef }) {
  const campaignId = useContentCampaign();
  const locale = useLocale();
  const detail = (value: string | null | undefined) => itemDetailCs(value, locale);
  const t = useT();
  const [state, setState] = useState<{ sheet: ItemSheet | null; loading: boolean }>({
    sheet: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const name = (reference.name ?? reference.slug).trim();
      const wanted = textKey(name);
      const readJson = async (response: Response) => (response.ok ? response.json() : null);
      try {
        const [{ buildItemSheet }, direct, search] = await Promise.all([
          import("@/lib/help/item-sheet"),
          fetch(`/api/content/items/${encodeURIComponent(reference.slug)}${scopeQuery(campaignId)}`).then(readJson).catch(() => null),
          fetch(`/api/content/items?q=${encodeURIComponent(wanted)}&limit=20${scopeQuery(campaignId, "&")}`).then(readJson).catch(() => null),
        ]);
        const hits = ((search?.results ?? []) as Array<{ name: string; source?: string; documentSlug?: string; data?: Record<string, unknown> }>)
          .filter((entry) => textKey(entry.name) === wanted && sameContentDocument(reference, entry))
          .map((entry) => entry.data);
        const directData = sameContentDocument(reference, direct?.entry) ? direct.entry.data : undefined;
        const sheet = buildItemSheet(name, [directData, ...hits]);
        if (!cancelled) {
          setState({ sheet, loading: false });
        }
      } catch {
        if (!cancelled) {
          setState({ sheet: null, loading: false });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [reference.slug, reference.name, reference.source, reference.documentSlug, campaignId]);

  if (state.loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-stone-500">
        <Loader2 className="size-4 animate-spin" /> {t("Looking it up...")}
      </p>
    );
  }
  const sheet = state.sheet;
  if (!sheet) {
    const fallback = itemDescriptionCs(reference.name ?? reference.slug, null, locale, reference.slug);
    if (fallback) return <div className="space-y-2 text-sm text-stone-300">{renderRules(fallback)}</div>;
    return (
      <p className="text-sm text-stone-500">
        {t("No details available. The content pack may not be installed, or this item was added by hand.")}
      </p>
    );
  }

  const tags = [
    sheet.rarity,
    sheet.attunement ? "Requires attunement" : null,
    sheet.bonus ? `+${sheet.bonus} magic` : null,
  ].filter((tag): tag is string => Boolean(tag)).map(detail);
  const tiles: Array<{ label: string; value: string | null; note?: string | null }> = [
    { label: detail("Weight"), value: itemWeightCs(sheet.weight, locale) },
    { label: detail("Value"), value: sheet.cost },
  ];
  if (sheet.armor) {
    tiles.push({ label: detail(sheet.armor.shield ? "AC bonus" : "Armor class"), value: sheet.armor.ac });
  }
  if (sheet.weapon) {
    tiles.push({
      label: detail("Damage"),
      value: sheet.weapon.damage ?? detail("None"),
      note: detail(sheet.weapon.damageType ? capitalize(sheet.weapon.damageType) : null),
    });
    if (sheet.weapon.range) {
      tiles.push({ label: detail("Range"), value: itemRangeCs(sheet.weapon.range, locale) });
    }
  }

  const armorRows: Array<{ label: string; text: string | null }> = [];
  if (sheet.armor) {
    if (sheet.armor.shield) {
      armorRows.push({ label: "Shield", text: "Carried in one hand; only one shield counts at a time." });
    }
    if (sheet.armor.dex) {
      armorRows.push({ label: "Dexterity", text: sheet.armor.dex });
    }
    armorRows.push({
      label: "Strength",
      text: sheet.armor.strength
        ? `Needs ${sheet.armor.strength}; below that, your speed drops by 10 feet while wearing it.`
        : "No minimum.",
    });
    armorRows.push({
      label: "Stealth",
      text: sheet.armor.stealthDisadvantage
        ? "Disadvantage on Dexterity (Stealth) checks while wearing it."
        : "No penalty.",
    });
  }
  const weaponRows: Array<{ label: string; text: string | null }> = [];
  if (sheet.weapon) {
    if (sheet.bonus) {
      weaponRows.push({ label: `+${sheet.bonus} weapon`, text: `Adds ${sheet.bonus} to attack and damage rolls.` });
    }
    for (const property of sheet.weapon.properties) {
      weaponRows.push({ label: property.name, text: property.blurb });
    }
    if (sheet.weapon.damageType && sheet.weapon.damageBlurb) {
      weaponRows.push({ label: `${capitalize(sheet.weapon.damageType)}`, text: sheet.weapon.damageBlurb });
    }
    if (!sheet.weapon.damage) {
      weaponRows.push({ label: "No damage", text: "It does not hurt on its own; its special rules say what it does." });
    }
  }

  const localizedArmorRows = armorRows.map(({ label, text }) => ({ label: detail(label), text: text ? detail(text) : null }));
  const localizedWeaponRows = weaponRows.map(({ label, text }) => ({ label: detail(label), text: text ? detail(text) : null }));
  // A supplement may reuse an SRD item name but assign it different rules.
  // Never substitute the SRD's Czech description for that separate entry.
  const shownDescription = reference.source === "open5e"
    && reference.documentSlug && reference.documentSlug !== "wotc-srd"
    ? sheet.description
    : itemDescriptionCs(reference.name ?? reference.slug, sheet.description, locale, reference.slug);

  const fullCzechItemRules = thirdPartyFullRulesCs(reference, locale);
  const supplementSummary = fullCzechItemRules ? null : thirdPartyItemSummaryCs(reference, locale);
  const displayedDescription = fullCzechItemRules ?? (supplementSummary
    ? `**Stručný český přehled:** ${supplementSummary}${shownDescription ? `\n\n**Úplný pravidlový popis (anglicky):**\n\n${shownDescription}` : ""}`
    : shownDescription);

  return (
    <div className="space-y-4">
      {sheet.type || tags.length ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {sheet.type ? <span className="text-sm font-medium text-stone-200">{detail(sheet.type)}</span> : null}
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-amber-200/20 bg-amber-200/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-200/80"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(6.5rem,1fr))]">
        {tiles.map((tile) => (
          <StatTile key={tile.label} {...tile} />
        ))}
      </div>
      {armorRows.length ? (
        <ItemSection title={detail("Armor")}>
          <RuleList rows={localizedArmorRows} />
        </ItemSection>
      ) : null}
      {weaponRows.length ? (
        <ItemSection title={detail("Weapon")}>
          <RuleList rows={localizedWeaponRows} />
        </ItemSection>
      ) : null}
      {displayedDescription ? (
        <ItemSection title={detail("Description")}>
          <div className="space-y-2 border-t border-stone-800 pt-2">{renderRules(displayedDescription)}</div>
        </ItemSection>
      ) : null}
    </div>
  );
}

function capitalize(text: string): string {
  return text ? text[0].toUpperCase() + text.slice(1) : text;
}

// The ⓘ button plus its dialog. `label` names the thing; `text` is its
// description, or omit it and pass `reference` to fetch one.
export function InfoButton({
  label,
  text,
  reference,
  meta,
  note,
  className,
  size = "sm",
}: {
  label: string;
  text?: string | null;
  reference?: ContentRef;
  // A short line under the title: spell level and school, feature level, and
  // so on.
  meta?: string;
  // A rules line read before the entry itself, whichever way the entry
  // loads: how much of a spell the server settles (src/lib/srd/spell-support.ts).
  note?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const t = useT();
  // Nothing to say and nothing to look up: render no control at all rather
  // than a button that opens an empty box.
  if (!text?.trim() && !reference) {
    return null;
  }
  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        aria-label={t("What is {label}?", { label })}
        // tap-reach: the glyph stays small in its line, a finger gets 40 px
        // round it (audit WA-08).
        className={cn(
          "tap-reach inline-flex shrink-0 items-center justify-center rounded-full text-stone-500 transition-colors hover:text-amber-200",
          className,
        )}
      >
        <Info className={size === "md" ? "size-4" : "size-3.5"} />
      </button>
      <InfoDialog
        open={open}
        onOpenChange={setOpen}
        title={label}
        meta={meta}
        note={note}
        text={text}
        reference={reference}
      />
    </>
  );
}

// A list of named things, each with its own ⓘ. Replaces the comma-joined
// strings the sheets used to print for features, feats and spells.
export function InfoChipList({
  items,
  emptyText,
}: {
  items: Array<{
    name: string;
    text?: string | null;
    meta?: string;
    reference?: ContentRef;
    // Rendered after the name, e.g. "(story)" for a feature the DM granted.
    note?: string;
    // The painted icon that leads the chip, when the thing has one.
    icon?: IconRef;
    // What leads the chip in the painting's place, when the painting cannot
    // be read at the chip's size (a carried item: src/lib/srd/
    // item-category-logic.ts). The painting stays in the hover, where it has
    // room, and the label is said for the picture.
    // Its tone names the kind on the chip (data-tone) and its style tints it
    // (src/lib/srd/item-category-logic.ts itemToneStyle).
    lead?: { icon: IconRef; label: string; tone?: string; style?: CSSProperties };
    // The thing's own name on the chip (data-chip), for a list whose chips
    // are picked up: the shown name is translated and carries a count.
    id?: string;
    // The chip can be dragged somewhere (the sheet's paperdoll), so a mouse
    // shows the open hand over it.
    grab?: boolean;
  }>;
  emptyText?: string;
}) {
  const t = useT();
  if (!items.length) {
    return emptyText ? <p className="text-xs text-stone-500">{emptyText}</p> : null;
  }
  return (
    <div className="stagger-pop flex flex-wrap gap-1.5">
      {items.map((item) => {
        const line = firstLine(item.text);
        return (
          <span
            key={item.name}
            className={cn("info-chip", item.grab && "cursor-grab select-none")}
            data-chip={item.id}
            data-grab={item.grab ? "" : undefined}
            data-tone={item.lead?.tone}
            style={item.lead?.style}
          >
            <Tooltip
              content={
                <span className="flex items-start gap-2.5">
                  {/* A Hand card's painting is twice as wide as it is tall. */}
                  {item.icon ? <GameIcon icon={item.icon} size={item.icon.kind === "action" ? "h-12 w-24" : "size-12"} className="shrink-0" /> : null}
                  <span className="min-w-0">
                    <span className="block font-display text-[13px] tracking-wide text-amber-100">{item.name}</span>
                    {(item.meta ?? item.lead?.label) ? <span className="block text-[10px] uppercase tracking-wider text-stone-500">{item.meta ?? (item.lead?.label ? t(item.lead.label) : null)}</span> : null}
                    <span className="mt-0.5 block text-stone-300">{line ?? t("Select the mark beside it for the full entry.")}</span>
                  </span>
                </span>
              }
            >
              <span className="flex min-w-0 items-center gap-1.5" tabIndex={-1}>
                {item.lead ? (
                  <>
                    <GameIcon icon={item.lead.icon} size="size-8" className="tone-rim" />
                    <span className="sr-only">{t(item.lead.label)}:</span>
                  </>
                ) : item.icon ? (
                  <GameIcon icon={item.icon} size="size-8" />
                ) : null}
                <span className="truncate">{item.name}</span>
                {item.note ? <span className="text-stone-500">{item.note}</span> : null}
              </span>
            </Tooltip>
            <InfoButton
              label={item.name}
              meta={item.meta}
              text={item.text}
              reference={item.reference}
            />
          </span>
        );
      })}
    </div>
  );
}

// The first sentence of a write-up, for the hover preview, markdown removed.
function firstLine(text: string | null | undefined): string | null {
  return firstSentence(text);
}

export function InfoDialog({
  open,
  onOpenChange,
  title,
  meta,
  note,
  text,
  reference,
  icon,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  meta?: string;
  note?: string;
  text?: string | null;
  reference?: ContentRef;
  // The thing's painting. An action card's rectangular painting (from
  // cardArtwork, src/lib/battlemap/card-art.ts) spans the top at its own
  // 256x128; a round icon sits beside the meta line.
  icon?: IconRef;
  children?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} width="w-[min(92vw,32rem)]">
      <InfoBody meta={meta} note={note} text={text} reference={reference} icon={icon}>
        {children}
      </InfoBody>
    </Dialog>
  );
}

// What the info dialog shows under its title, for the places that show the
// same write-up without a dialog (the builder's picks beside its steps).
export function InfoBody({
  meta,
  note,
  text,
  reference,
  icon,
  children,
  large,
}: {
  meta?: string;
  note?: string;
  text?: string | null;
  reference?: ContentRef;
  icon?: IconRef;
  children?: ReactNode;
  // The text at 1rem, where it is read beside the picks rather than in a
  // dialog opened to read it.
  large?: boolean;
}) {
  const metaLine = meta ? <p className="reveal text-xs uppercase tracking-wide text-amber-200/70">{meta}</p> : null;
  return (
    <>
      {icon?.kind === "action" ? (
        <div className="mb-3 space-y-2">
          <GameIcon icon={icon} size="mx-auto flex h-32 w-64 max-w-full" />
          {metaLine}
        </div>
      ) : icon ? (
        <div className="mb-3 flex items-center gap-3">
          <GameIcon icon={icon} size="size-16" />
          {metaLine}
        </div>
      ) : metaLine ? (
        <div className="mb-3">{metaLine}</div>
      ) : null}
      <div className={cn("space-y-2 leading-relaxed text-stone-400", large ? "text-base" : "text-sm")}>
        {note ? <div className="rounded border border-amber-300/20 bg-amber-300/5 px-2.5 py-1.5 text-stone-300">{renderRules(note)}</div> : null}
        {text?.trim() ? (
          renderRules(text)
        ) : reference?.kind === "items" ? (
          <ItemBody reference={reference} />
        ) : reference ? (
          <ContentBody reference={reference} />
        ) : null}
        {children}
      </div>
    </>
  );
}
