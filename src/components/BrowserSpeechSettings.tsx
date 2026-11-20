"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { cn } from "@/lib/cn";
import { useLocale, useT } from "@/lib/locale";
import { ui } from "@/lib/ui";
import { preferredBrowserVoice } from "@/lib/browser-speech-logic";
import {
  useBrowserNarrationMode,
  useBrowserSpeechRate,
  useBrowserSpeechVoice,
  writeBrowserNarrationMode,
  writeBrowserSpeechRate,
  writeBrowserSpeechVoice,
  type BrowserNarrationMode,
} from "@/lib/browser-speech-prefs";

// Availability is a stable browser capability, not state to set synchronously
// from an effect. The server snapshot is false to keep hydration consistent.
const subscribeSpeechSupport = () => () => {};
const browserSpeechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

// The voice list is browser/OS specific and may arrive asynchronously. Do
// not ask the Open Game Master server for voices in this mode.
export function BrowserSpeechSettings() {
  const t = useT();
  const locale = useLocale();
  const mode = useBrowserNarrationMode();
  const savedVoice = useBrowserSpeechVoice();
  const rate = useBrowserSpeechRate();
  const supported = useSyncExternalStore(subscribeSpeechSupport, browserSpeechSupported, () => false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [previewing, setPreviewing] = useState(false);
  const language = locale === "cs" ? "cs-CZ" : locale === "fr" ? "fr-FR" : "en-US";

  useEffect(() => {
    if (!supported) return;
    const engine = window.speechSynthesis;
    const refresh = () => setVoices(engine.getVoices());
    // Avoid synchronous React state writes during effect setup.
    const frame = window.requestAnimationFrame(refresh);
    engine.addEventListener("voiceschanged", refresh);
    return () => {
      window.cancelAnimationFrame(frame);
      engine.removeEventListener("voiceschanged", refresh);
    };
  }, [supported]);

  // The same browser speech engine plays live GM narration. Closing the
  // settings dialog must not cancel a passage that another component started.

  const voiceOptions: SelectOption<string>[] = [
    { value: "", label: t("Automatic voice (match language)") },
    ...voices.map((voice) => ({
      value: voice.voiceURI,
      label: `${voice.name} (${voice.lang})`,
    })),
  ];
  if (savedVoice && !voices.some((voice) => voice.voiceURI === savedVoice)) {
    voiceOptions.push({ value: savedVoice, label: t("Saved voice is not installed on this device") });
  }
  const nativeVoice = preferredBrowserVoice(voices, "", language);
  const modeOptions: SelectOption<BrowserNarrationMode>[] = [
    { value: "server", label: t("Server speech"), hint: t("Use the campaign's existing narration audio") },
    { value: "browser", label: t("This browser (Web Speech API)"), hint: t("No server speech model or API key needed"), disabled: !supported },
  ];

  function preview() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(t("This is a sample of the browser narrator's voice."));
    const voice = preferredBrowserVoice(voices, savedVoice, language);
    utterance.lang = voice?.lang || language;
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.volume = 0.8;
    utterance.onend = () => setPreviewing(false);
    utterance.onerror = () => setPreviewing(false);
    setPreviewing(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="space-y-2 border-t border-stone-700/40 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-stone-400">{t("Narration playback")}</span>
        <Select
          value={mode}
          onChange={writeBrowserNarrationMode}
          label={t("Narration playback")}
          options={modeOptions}
          size="sm"
          align="end"
        />
      </div>
      {mode === "browser" ? (
        <>
          <p className="text-xs text-stone-500">
            {t("New GM passages are spoken on this device. Playback uses the browser's speech engine, not the game's TTS server. Available voices and whether they work offline depend on your browser and operating system.")}
          </p>
          {!supported ? (
            <p role="alert" className="text-xs text-red-300">{t("Web Speech is unavailable in this browser.")}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-stone-400">{t("Browser voice")}</span>
                <Select
                  value={savedVoice}
                  onChange={writeBrowserSpeechVoice}
                  label={t("Browser voice")}
                  options={voiceOptions}
                  size="sm"
                  className="max-w-full"
                  align="end"
                />
              </div>
              {!nativeVoice && voices.length ? (
                <p className="text-xs text-amber-200">
                  {t("No voice for the current interface language was found. Install a matching voice in your device settings or pick another voice.")}
                </p>
              ) : null}
              <Slider
                label={t("Reading speed")}
                value={rate}
                min={0.7}
                max={1.4}
                step={0.1}
                onChange={writeBrowserSpeechRate}
              />
              <button type="button" onClick={preview} className={cn(ui.btnSmall, "min-h-10")} aria-label={t("Test browser voice")}>
                {previewing ? t("Play sample again") : t("Test browser voice")}
              </button>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
