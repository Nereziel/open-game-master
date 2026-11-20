"use client";

import { useSyncExternalStore } from "react";

// Unlike the server audio preferences, the Web Speech engine and voice are
// local to this browser: the same voice URI may not exist on another device.
export type BrowserNarrationMode = "server" | "browser";
const MODE_KEY = "odm.browserSpeech.mode";
const VOICE_KEY = "odm.browserSpeech.voice";
const RATE_KEY = "odm.browserSpeech.rate";
const CHANGE_EVENT = "odm-browser-speech-prefs";

function subscribe(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function get(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function set(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The current tab still receives a change event in restricted browsers.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function readBrowserNarrationMode(): BrowserNarrationMode {
  return get(MODE_KEY) === "browser" ? "browser" : "server";
}
export function useBrowserNarrationMode(): BrowserNarrationMode {
  return useSyncExternalStore(subscribe, readBrowserNarrationMode, () => "server");
}
export function writeBrowserNarrationMode(mode: BrowserNarrationMode) {
  set(MODE_KEY, mode);
}

export function readBrowserSpeechVoice(): string {
  return get(VOICE_KEY) ?? "";
}
export function useBrowserSpeechVoice(): string {
  return useSyncExternalStore(subscribe, readBrowserSpeechVoice, () => "");
}
export function writeBrowserSpeechVoice(voiceURI: string) {
  set(VOICE_KEY, voiceURI);
}

export function readBrowserSpeechRate(): number {
  const value = Number(get(RATE_KEY) ?? "1");
  return Number.isFinite(value) ? Math.max(0.7, Math.min(1.4, value)) : 1;
}
export function useBrowserSpeechRate(): number {
  return useSyncExternalStore(subscribe, readBrowserSpeechRate, () => 1);
}
export function writeBrowserSpeechRate(rate: number) {
  set(RATE_KEY, String(Math.max(0.7, Math.min(1.4, rate))));
}
