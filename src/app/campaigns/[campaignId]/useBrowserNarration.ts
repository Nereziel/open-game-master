"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CampaignMessage } from "@/lib/db/messages";
import { liveBrowserPassages } from "@/lib/browser-speech-logic";
import type { TableLanguage } from "@/lib/schemas/game-settings-options";
import { browserSpeechChunks, browserSpeechLanguage, preferredBrowserVoice } from "@/lib/browser-speech-logic";
import { readBrowserSpeechRate, readBrowserSpeechVoice } from "@/lib/browser-speech-prefs";

type Passage = { messageId: string; text: string };

export function browserSpeechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

// A listener's own alternative to server TTS. New *completed* GM messages
// are spoken, never the backlog loaded when the table opens. No fetch, audio
// upload, API route or paid model is involved in this playback path.
export function useBrowserNarration({
  messages,
  loading,
  onBreak,
  enabled,
  muted,
  volume,
  language,
}: {
  messages: CampaignMessage[];
  loading: boolean;
  onBreak: boolean;
  enabled: boolean;
  muted: boolean;
  volume: number;
  language: TableLanguage;
}) {
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [playbackFailure, setPlaybackFailure] = useState<string | null>(null);
  const [held, setHeld] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const activeRef = useRef<Passage | null>(null);
  const queueRef = useRef<Passage[]>([]);
  const pendingRef = useRef<Passage[]>([]);
  const seqRef = useRef<number | null>(null);
  const unlockedRef = useRef(false);
  // A canceled utterance may still fire onend/onerror on some browsers.
  const generationRef = useRef(0);
  const optionsRef = useRef({ enabled, muted, volume, language, onBreak });
  optionsRef.current = { enabled, muted, volume, language, onBreak };

  const cancelCurrent = useCallback(() => {
    generationRef.current += 1;
    activeRef.current = null;
    setPlayingMessageId(null);
    if (browserSpeechAvailable()) window.speechSynthesis.cancel();
  }, []);

  const start = useCallback(function startPassage(passage: Passage): boolean {
    const options = optionsRef.current;
    if (!browserSpeechAvailable() || !options.enabled || options.muted || options.onBreak) return false;
    const chunks = browserSpeechChunks(passage.text);
    if (!chunks.length) return false;
    // Invalidate all previous callbacks before cancel() sends its events.
    const generation = ++generationRef.current;
    window.speechSynthesis.cancel();
    activeRef.current = passage;
    setPlayingMessageId(passage.messageId);
    setPlaybackFailure((current) => current === passage.messageId ? null : current);
    const lang = browserSpeechLanguage(options.language);
    const voice = preferredBrowserVoice(window.speechSynthesis.getVoices(), readBrowserSpeechVoice(), lang);
    const rate = readBrowserSpeechRate();
    let index = 0;
    const advance = () => {
      if (generationRef.current !== generation) return;
      if (index >= chunks.length) {
        activeRef.current = null;
        setPlayingMessageId(null);
        if (!optionsRef.current.onBreak && !optionsRef.current.muted) {
          const next = queueRef.current.shift();
          if (next) startPassage(next);
        }
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index++]);
      utterance.lang = voice?.lang || lang;
      if (voice) utterance.voice = voice;
      utterance.rate = rate;
      utterance.volume = Math.max(0, Math.min(1, optionsRef.current.volume));
      utterance.onend = advance;
      // A missing or blocked browser voice must not loop forever, or leave
      // queued narration permanently stuck behind the failed utterance.
      utterance.onerror = (event) => {
        if (generationRef.current !== generation) return;
        if (event.error === "not-allowed") {
          // Voice autoplay can be rejected just like an audio element. A
          // later click can retry this passage instead of losing it.
          generationRef.current += 1;
          activeRef.current = null;
          setPlayingMessageId(null);
          unlockedRef.current = false;
          setUnlocked(false);
          pendingRef.current.push(passage);
          setHeld(pendingRef.current.length);
          return;
        }
        setPlaybackFailure(passage.messageId);
        index = chunks.length;
        advance();
      };
      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        setPlaybackFailure(passage.messageId);
        index = chunks.length;
        advance();
      }
    };
    advance();
    return true;
  }, []);

  // A deliberate replay interrupts live narration. Browser speech always
  // uses the message's *current text*, so an edited/rerolled passage is read
  // exactly as shown and never triggers the /narrate server endpoint.
  const speak = useCallback((messageId: string, text: string): boolean => {
    if (!browserSpeechAvailable()) return false;
    unlockedRef.current = true;
    setUnlocked(true);
    queueRef.current = [];
    pendingRef.current = [];
    setHeld(0);
    cancelCurrent();
    return start({ messageId, text });
  }, [cancelCurrent, start]);

  const unlock = useCallback(() => {
    if (!browserSpeechAvailable()) return;
    unlockedRef.current = true;
    setUnlocked(true);
    // As with server narration, hearing hours of old passages after one
    // click would bury the current scene. Keep only the newest waiting one.
    const newest = pendingRef.current[pendingRef.current.length - 1];
    pendingRef.current = [];
    setHeld(0);
    if (!newest || optionsRef.current.muted || !optionsRef.current.enabled) return;
    if (activeRef.current || optionsRef.current.onBreak) {
      queueRef.current.push(newest);
    } else {
      start(newest);
    }
  }, [start]);

  useEffect(() => {
    if (!enabled) return;
    const onGesture = () => {
      if (!unlockedRef.current) unlock();
    };
    window.addEventListener("click", onGesture);
    window.addEventListener("keydown", onGesture);
    return () => {
      window.removeEventListener("click", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, [enabled, unlock]);

  // A session starts after its snapshot has loaded. On switches back from
  // server mode the baseline keeps advancing, so previous turns do not replay.
  useEffect(() => {
    if (loading) return;
    const newestSeq = messages.reduce((max, message) => Math.max(max, message.seq), 0);
    if (seqRef.current === null) {
      seqRef.current = newestSeq;
      return;
    }
    const fresh = liveBrowserPassages(messages, seqRef.current);
    seqRef.current = Math.max(seqRef.current, newestSeq);
    if (!enabled || muted || !browserSpeechAvailable()) return;
    for (const message of fresh) {
      const passage = { messageId: message.id, text: message.content };
      if (!unlockedRef.current) {
        pendingRef.current.push(passage);
        setHeld(pendingRef.current.length);
      } else if (activeRef.current || optionsRef.current.onBreak) {
        queueRef.current.push(passage);
      } else {
        start(passage);
      }
    }
  }, [messages, loading, enabled, muted, start]);

  useEffect(() => {
    if (!enabled || muted) {
      cancelCurrent();
      queueRef.current = [];
      pendingRef.current = [];
      setHeld(0);
    }
  }, [enabled, muted, cancelCurrent]);

  useEffect(() => {
    if (!enabled) return;
    if (onBreak) {
      const current = activeRef.current;
      if (current) {
        cancelCurrent();
        queueRef.current.unshift(current);
      }
    } else if (unlockedRef.current && !muted && !activeRef.current) {
      const next = queueRef.current.shift();
      if (next) start(next);
    }
  }, [enabled, onBreak, muted, cancelCurrent, start]);

  useEffect(() => () => {
    generationRef.current += 1;
    if (browserSpeechAvailable()) window.speechSynthesis.cancel();
  }, []);

  return { playingMessageId, playbackFailure, held, unlocked, unlock, speak };
}
