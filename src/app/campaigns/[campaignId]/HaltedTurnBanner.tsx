"use client";

import { Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/lib/locale";
import { cn } from "@/lib/cn";
import { offerCorrectionReason } from "@/lib/correction-offer";
import { ui } from "@/lib/ui";
import { SectionHead } from "@/components/ui/SectionHead";
import { haltedTurnPrefix } from "@/lib/campaign-types";

// A DM turn that threw. Everything the turn had (its conversation, tool calls
// and tool results) is still on the dm_turns row, so the lead can send the DM
// back in where it stopped instead of retyping the action, which would leave
// the same action in the transcript twice.
//
// The retry itself is durable server state: the moment it is claimed the
// notice loses its dmTurnId and this banner disappears for every client via
// message_updated. Local state here only covers the request in flight.
export function HaltedTurnBanner({
  campaignId,
  turnId,
  content,
  canRetry,
}: {
  campaignId: string;
  turnId: string;
  content: string;
  canRetry: boolean;
}) {
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");
  const czech = useLocale() === "cs";
  const copy = czech
    ? {
        heading: "PJ přerušen, kontext zachován",
        retryHint: "Znovu spustit tah se vším dosavadním kontextem",
        retrying: "Obnovuji tah...",
        retry: "Zkusit tah znovu",
        leadOnly: "Vedoucí družiny může odsud nechat PJ pokračovat.",
        restartError: "Tah se nepodařilo znovu spustit.",
        connectionError: "Nelze se spojit se serverem.",
      }
    : {
        heading: "GM halted, context preserved",
        retryHint: "Send the GM back into this turn with everything it already had",
        retrying: "Picking the thread back up...",
        retry: "Retry the turn",
        leadOnly: "The party lead can send the GM back in from here.",
        restartError: "Could not restart that turn.",
        connectionError: "Could not reach the server.",
      };
  // The reason follows "The DM ran into a problem: " in the transcript, so
  // some start lower case; standing alone here it starts a sentence.
  const stated = content.slice(haltedTurnPrefix(content).length);
  const reason = czech && stated === "The server restarted while the Game Master was working on this turn."
    ? "Server se restartoval, zatímco Pán jeskyně zpracovával tento tah."
    : stated.charAt(0).toUpperCase() + stated.slice(1);

  async function retry() {
    if (retrying) {
      return;
    }
    setRetrying(true);
    setError("");
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/dm-turn/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnId }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error || copy.restartError);
      } else {
        offerCorrectionReason(campaignId, await response.json().catch(() => null));
      }
      // On success nothing else is done here: the banner goes away when the
      // message_updated event lands, and the narration streams in as usual.
    } catch {
      setError(copy.connectionError);
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="panel ornate session-banner-card reveal-banner rounded-xl">
      <SectionHead title={copy.heading} glyph="cue-bell" level="h4" className="mb-1.5" />
      <p className="text-sm text-stone-400">{reason}</p>
      {canRetry ? (
        <button
          type="button"
          onClick={retry}
          disabled={retrying}
          title={copy.retryHint}
          className={cn(ui.btnSmall, "mt-2.5")}
        >
          {retrying ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RotateCcw className="size-3.5" />
          )}
          {retrying ? copy.retrying : copy.retry}
        </button>
      ) : (
        <p className="mt-1 text-xs text-stone-500">
          {copy.leadOnly}
        </p>
      )}
      {error ? <p className="motion-shake mt-1 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
