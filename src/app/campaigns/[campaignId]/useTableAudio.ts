"use client";

import { useEffect, useMemo, useRef } from "react";
import { useNarrationAudio } from "@/app/campaigns/[campaignId]/useNarrationAudio";
import { useBrowserNarration } from "@/app/campaigns/[campaignId]/useBrowserNarration";
import { useBrowserNarrationMode } from "@/lib/browser-speech-prefs";
import { useAmbienceAudio } from "@/app/campaigns/[campaignId]/useAmbienceAudio";
import type { CampaignState } from "@/app/campaigns/[campaignId]/useCampaignStream";

// The table's two audio channels and how they meet. Narration is the DM's
// voice; ambience is the room. The room drops behind the voice while a
// passage is being read and comes back when it stops. Nothing else in the
// app knows how to do this, which is why the two hooks are joined here
// rather than inside either one.
export function useTableAudio(state: CampaignState) {
  // A table break holds the DM's voice until Resume (useNarrationAudio.ts).
  // The room keeps its bed: a quiet table under a break is no worse for it.
  const mode = useBrowserNarrationMode();
  const serverNarration = useNarrationAudio(state.tableBreak !== null, mode === "server");
  const browser = useBrowserNarration({
    messages: state.messages,
    loading: state.loading,
    onBreak: state.tableBreak !== null,
    enabled: mode === "browser",
    muted: serverNarration.muted,
    volume: serverNarration.volume,
    language: state.campaign?.gameSettings?.tableLanguage ?? "english",
  });
  const { playingMessageId, playbackFailure, held, unlocked, unlock, speak } = browser;
  const narration = useMemo(
    () => ({
      ...serverNarration,
      mode,
      speak,
      playingMessageId: mode === "browser" ? playingMessageId : serverNarration.playingMessageId,
      playbackFailure: mode === "browser" ? playbackFailure : serverNarration.playbackFailure,
      held: mode === "browser" ? held : serverNarration.held,
      unlocked: mode === "browser" ? unlocked : serverNarration.unlocked,
      unlock: mode === "browser" ? unlock : serverNarration.unlock,
    }),
    [serverNarration, mode, speak, playingMessageId, playbackFailure, held, unlocked, unlock],
  );
  const ambience = useAmbienceAudio(
    state.ambience,
    state.ambienceSting,
    Boolean(state.campaign?.gameSettings?.ambienceEnabled),
  );
  const duckAmbience = ambience.setDucked;
  useEffect(() => {
    duckAmbience(Boolean(narration.playingMessageId));
  }, [duckAmbience, narration.playingMessageId]);

  // Only tts_ready events newer than the seq present when the snapshot first
  // loaded autoplay; the backlog stays silent (replay buttons cover history).
  // Each narration is handed over exactly once: unrelated events (new chat
  // messages) must never re-trigger and restart playback.
  const mountSeqRef = useRef<number | null>(null);
  const handedTtsRef = useRef<string | null>(null);
  const { latestTts, loading, lastSeq } = state;
  const { onTtsReady } = serverNarration;
  useEffect(() => {
    if (mountSeqRef.current === null) {
      if (!loading) {
        mountSeqRef.current = lastSeq;
      }
      return;
    }
    if (latestTts && latestTts.messageId !== handedTtsRef.current) {
      handedTtsRef.current = latestTts.messageId;
      // A stream is only ever offered live; a finished file is live when it
      // is newer than the snapshot.
      onTtsReady(latestTts.messageId, latestTts.url, Boolean(latestTts.live) || latestTts.seq > mountSeqRef.current);
    }
  }, [latestTts, onTtsReady, loading, lastSeq]);

  return { narration, ambience };
}
