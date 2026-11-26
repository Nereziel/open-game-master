"use client";

import { Check, ListOrdered, Loader2, Minus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SectionHead } from "@/components/ui/SectionHead";
import { PanelError, kitButtonClass, panelField } from "./PanelKit";
import { SequenceEditor } from "./SequenceEditor";
import {
  PLAN_MAX_CHARS,
  orderKey,
  placeWords,
  sequenceOf,
  unconfirmedOrder,
  waitingOn,
  type CoordinationEntry,
  type CoordinationPhase,
  type PlanSequence,
} from "@/lib/dm/coordination-logic";
import { useT } from "@/lib/locale";

// The plan the party is coordinating (issue 254), above the composer for
// every seat. Each player drafts a line per character they control, changes
// it until they mark it Ready, or passes; anyone in the plan may ask a
// companion for something; the lead can resolve it early (the missing pass)
// or set it aside. What each character means to do is shown to the whole
// party, so they can fit their moves together. Nothing reaches the DM until
// the plan resolves (src/lib/dm/coordination.ts). When the lead puts the
// plan in order (issue 292) every seat sees it as numbered steps, and a
// player whose Ready the new order took back is told where they stand now.

export function CoordinationPanel({
  campaignId,
  phase,
  meUserId,
  steersStory,
}: {
  campaignId: string;
  phase: CoordinationPhase;
  meUserId: string;
  steersStory: boolean;
}) {
  const t = useT();
  const stateWord: Record<CoordinationEntry["state"], string> = {
    waiting: t("Waiting"), drafting: t("Drafting"), ready: t("Ready"), pass: t("Passed"),
  };
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // The lead's order being edited, before it is saved for everyone.
  const [ordering, setOrdering] = useState<PlanSequence | null>(null);
  const waiting = waitingOn(phase);
  const mine = phase.entries.some((entry) => !entry.companion && entry.userId === meUserId);
  const sequence = sequenceOf(phase);
  const unconfirmed = unconfirmedOrder(phase);
  const byId = new Map(phase.entries.map((entry) => [entry.characterId, entry]));

  async function send(body: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/coordination`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? t("The plan did not change."));
        return false;
      }
      return true;
    } catch {
      setError(t("Could not reach the table."));
      return false;
    } finally {
      setBusy(false);
    }
  }

  const draftOf = (entry: CoordinationEntry) => drafts[entry.characterId] ?? entry.text;
  const setDraft = (entry: CoordinationEntry, text: string) =>
    setDrafts((current) => ({ ...current, [entry.characterId]: text.slice(0, PLAN_MAX_CHARS) }));
  const settle = async (entry: CoordinationEntry, state: "drafting" | "ready" | "pass") => {
    if (await send({ action: "plan", characterId: entry.characterId, text: draftOf(entry), state, orderSeen: orderKey(phase) })) {
      setDrafts((current) => {
        const next = { ...current };
        delete next[entry.characterId];
        return next;
      });
    }
  };

  const saveOrder = async (next: PlanSequence | null) => {
    if (await send({ action: "order", sequence: next })) {
      setOrdering(null);
    }
  };

  // Each character's line in the plan.
  const entryRow = (entry: CoordinationEntry): ReactNode => {
    const own = !entry.companion && entry.userId === meUserId;
    const settled = entry.state === "ready" || entry.state === "pass";
    return (
      <li
        key={entry.characterId}
        data-coordination-entry={entry.characterId}
        data-state={entry.state}
        data-order-changed={entry.orderChanged ? "" : undefined}
        className={cn(
          "rounded-md border px-2.5 py-2 transition-colors duration-200",
          entry.state === "ready"
            ? "border-emerald-700/50 bg-emerald-950/15"
            : entry.orderChanged
              ? "border-amber-500/60 bg-amber-950/20"
              : "border-stone-800 bg-stone-950/40",
        )}
      >
        <div className="flex items-center gap-1.5 text-xs">
          {entry.state === "ready" ? (
            <Check className="motion-pop size-3.5 text-emerald-400" aria-hidden="true" />
          ) : entry.state === "pass" ? (
            <Minus className="size-3.5 text-stone-500" aria-hidden="true" />
          ) : (
            <span className="inline-block size-3.5 text-center text-[10px] leading-3 text-amber-300" aria-hidden="true">
              ...
            </span>
          )}
          <span className="font-medium text-stone-200">{entry.name}</span>
          <span className="text-[11px] text-stone-500">
            {entry.companion
              ? entry.text
                ? entry.requestedBy
                  ? t("AI companion · asked by {name}", { name: entry.requestedBy })
                  : t("AI companion · asked by the party")
                : t("AI companion · acts as they see fit")
              : entry.orderChanged
                ? t("Checking the new order")
                : stateWord[entry.state]}
          </span>
        </div>

        {own && entry.orderChanged ? (
          <p role="status" className="motion-pop mt-1.5 rounded border border-amber-500/40 bg-amber-950/30 px-2 py-1 text-[11px] text-amber-100" data-order-notice>
            {t("The lead changed the order after you were ready: {place}. Check your part still fits, then mark it Ready again.", {
              place: sequence
                ? t("{name} is now {place}", { name: entry.name, place: placeWords(t, phase, entry.characterId) })
                : t("everyone now acts at once"),
            })}
          </p>
        ) : null}

        {own && !settled ? (
          <div className="mt-1.5 space-y-1.5">
            <textarea
              value={draftOf(entry)}
              onChange={(event) => setDraft(entry, event.target.value)}
              rows={2}
              maxLength={PLAN_MAX_CHARS}
              placeholder={
                sequence
                  ? t("What does {name} do at this step?", { name: entry.name })
                  : t("What does {name} do? (\"While Brann talks to the guard, I slip past to the gate.\")", { name: entry.name })
              }
              aria-label={t("{name}'s part in the plan", { name: entry.name })}
              className={cn(panelField, "w-full resize-y text-xs")}
            />
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                disabled={busy || !draftOf(entry).trim()}
                onClick={() => void settle(entry, "ready")}
                className={kitButtonClass("primary")}
                data-coordination-ready
              >
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
                {t("Ready")}
              </button>
              <button
                type="button"
                disabled={busy || draftOf(entry) === entry.text}
                onClick={() => void settle(entry, "drafting")}
                className={kitButtonClass("small")}
              >
                {t("Share draft")}
              </button>
              <button type="button" disabled={busy} onClick={() => void settle(entry, "pass")} className={kitButtonClass("small")} data-coordination-pass>
                {t("Pass")}
              </button>
            </div>
          </div>
        ) : entry.text ? (
          <p className="mt-1 whitespace-pre-wrap text-xs text-stone-300" data-coordination-text>
            {entry.text}
          </p>
        ) : null}

        {own && settled ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void send({ action: "plan", characterId: entry.characterId, state: "drafting" })}
            className={cn(kitButtonClass("small"), "mt-1.5")}
            data-coordination-change
          >
            {t("Change")}
          </button>
        ) : null}

        {entry.companion && mine ? (
          <div className="mt-1.5 flex gap-1.5">
            <input
              value={draftOf(entry)}
              onChange={(event) => setDraft(entry, event.target.value)}
              maxLength={PLAN_MAX_CHARS}
              placeholder={t("Ask {name} to... (optional)", { name: entry.name })}
              aria-label={t("Ask {name} to", { name: entry.name })}
              className={cn(panelField, "w-auto min-w-0 flex-1 text-xs")}
            />
            <button
              type="button"
              disabled={busy || draftOf(entry) === entry.text}
              onClick={async () => {
                if (await send({ action: "request", characterId: entry.characterId, text: draftOf(entry) })) {
                  setDrafts((current) => {
                    const next = { ...current };
                    delete next[entry.characterId];
                    return next;
                  });
                }
              }}
              className={kitButtonClass("small", "shrink-0")}
              data-coordination-request
            >
              {draftOf(entry).trim() ? t("Ask") : t("Withdraw")}
            </button>
          </div>
        ) : null}
      </li>
    );
  };

  return (
    <section className="panel ornate reveal mb-2 rounded-lg border-amber-500/40 p-3" data-coordination={phase.id} data-ordered={sequence ? "" : undefined} aria-label={t("Coordinated plan")}>
      <SectionHead
        title={t("The party acts together")}
        glyph="tab-party"
        level="h3"
        aside={waiting.length ? t("waiting on {count}", { count: waiting.length }) : t("all ready")}
      />
      <p className="mb-2 text-xs text-stone-400">
        {phase.prompt ? <span className="mr-1 font-serif italic text-amber-200/80">{phase.prompt}</span> : null}
        {sequence
          ? t("The lead has set the order: each step happens after the one before it, and characters in one step act at the same time. Write what your character does at their step. Nothing happens until every player is ready; then the GM resolves the plan as one scene, step by step.")
          : t("Say what each character does in the same moment, with any \"while\", \"after\" or \"if\". Nothing happens until every player is ready; then the GM resolves the plan as one moment.")}
      </p>
      {sequence ? (
        <ol className="stagger space-y-2" aria-label={t("The plan's order")}>
          {sequence.map((ids, index) => {
            const members = ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : []));
            const passedBefore = sequence
              .slice(0, index)
              .flat()
              .flatMap((id) => (byId.get(id)?.state === "pass" ? [byId.get(id)!.name] : []));
            return (
              <li key={`step-${index}-${ids.join("+")}`} data-coordination-step={index + 1} className="reveal">
                <p className="mb-1 flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-wide text-amber-200/80">
                  <span className="rounded-full border border-amber-500/40 px-1.5 font-medium tabular-nums">{index + 1}</span>
                  {index === 0 ? t("First") : t("After step {step}", { step: index })}
                  {members.length > 1 ? <span className="normal-case tracking-normal text-stone-400">{t("· at the same time")}</span> : null}
                </p>
                {passedBefore.length ? (
                  <p className="mb-1 text-[11px] text-amber-300/80" data-step-pass-note>
                    {passedBefore.length === 1 ? t("{names} passed before this step; the GM will not count on it.", { names: passedBefore.join(", ") }) : t("{names} passed before this step; the GM will not count on them.", { names: passedBefore.join(", ") })}
                  </p>
                ) : null}
                <ul className="space-y-2">{members.map(entryRow)}</ul>
              </li>
            );
          })}
        </ol>
      ) : (
        <ul className="stagger space-y-2">{phase.entries.map(entryRow)}</ul>
      )}

      {steersStory && ordering ? (
        <div className="reveal mt-2 rounded-md border border-amber-500/30 bg-stone-950/50 p-2" data-coordination-ordering>
          <p className="mb-1.5 text-[11px] text-stone-400">
            {t("Put the characters in the order they act. Drag a name onto a step to act with it, or between steps for a step of its own; the arrows do the same. A player who is already Ready and whose place changes is asked to look again.")}
          </p>
          <SequenceEditor
            items={phase.entries.map((entry) => ({ id: entry.characterId, name: entry.name, companion: entry.companion }))}
            sequence={ordering}
            onChange={setOrdering}
            disabled={busy}
            label={t("The order the characters act in")}
          />
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => void saveOrder(ordering.length > 1 ? ordering : null)}
              className={kitButtonClass("primary")}
              data-coordination-save-order
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
              {ordering.length > 1 ? t("Save the order") : t("Save: all at once")}
            </button>
            {sequence ? (
              <button type="button" disabled={busy} onClick={() => void saveOrder(null)} className={kitButtonClass("small")} data-coordination-clear-order>
                {t("All at once")}
              </button>
            ) : null}
            <button type="button" disabled={busy} onClick={() => setOrdering(null)} className={kitButtonClass("small")}>
              {t("Cancel")}
            </button>
          </div>
        </div>
      ) : null}

      {steersStory ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {!ordering ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => setOrdering(sequence ?? phase.entries.map((entry) => [entry.characterId]))}
              className={kitButtonClass("small")}
              data-coordination-order
            >
              <ListOrdered className="size-3.5" />
              {sequence ? t("Change the order") : t("Set an order")}
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy || unconfirmed.length > 0}
            onClick={() => void send({ action: "resolve" })}
            className={kitButtonClass("small")}
            title={
              unconfirmed.length
                ? (unconfirmed.length === 1
                    ? t("The order changed after {names} was ready; they mark it Ready again first", { names: unconfirmed.join(", ") })
                    : t("The order changed after {names} were ready; they mark it Ready again first", { names: unconfirmed.join(", ") }))
                : waiting.length
                  ? t("{names} will pass", { names: waiting.join(", ") })
                  : t("Hand the plan to the GM now")
            }
            data-coordination-resolve
          >
            {waiting.length ? t("Resolve now ({names} pass)", { names: waiting.join(", ") }) : t("Resolve now")}
          </button>
          <button type="button" disabled={busy} onClick={() => void send({ action: "cancel" })} className={kitButtonClass("small")} data-coordination-cancel>
            {t("Set aside")}
          </button>
        </div>
      ) : null}
      {steersStory && unconfirmed.length ? (
        <p className="motion-pop mt-1.5 text-[11px] text-amber-300" role="status" data-order-waiting>
          {t("Waiting for {names} to look at the new order and mark it Ready again.", { names: unconfirmed.join(", ") })}
        </p>
      ) : null}
      {error ? <PanelError className="mt-1.5">{error}</PanelError> : null}
    </section>
  );
}
