# Browser narration with Web Speech API

Each player can read the GM's narration in their own browser without using the Open Game Master speech service.

## Use

1. Open **Settings → Playback → Narration playback**.
2. Choose **This browser (Web Speech API)**.
3. Optionally pick an installed browser/OS voice, change reading speed, and press **Test browser voice**.
4. Return to the campaign. New GM story messages will be read aloud after a user interaction. Use the speaker icon to mute or change volume, or **Read aloud** on a message to replay it.

The setting stays in this browser. The default is **Server speech**, preserving existing campaigns.

Browser narration also works when the campaign's server narration switch is off. The automatic reader ignores history on first load, out-of-character GM replies, system notices and player messages. A table break holds speech; resume continues with the interrupted passage. When the browser blocks autoplay, the latest passage waits for another gesture instead of silently disappearing.

## Cost and privacy

The application's browser narration path calls `window.speechSynthesis` and does **not** call `/api/tts`, `/narrate`, or an external paid API. No TTS API key, model or server speech engine is required for this mode.

**Web Speech API does not guarantee offline speech.** The browser or operating system provides the actual voices; some may synthesize through a vendor's online service. Use a local voice provided by the operating system if strict offline operation is required. The game cannot promise that a third-party browser/OS voice never contacts a service.

If the campaign's server narration switch remains enabled, the **server may still generate its own audio for other players**. Turn that switch off if you also want to avoid server-side TTS generation for the table.

## Manual verification

- With server TTS disabled, select browser narration, pick a Czech campaign and confirm a new GM story message is spoken in a Czech voice where installed.
- Confirm opening a table with older messages does not read the backlog; explicit **Read aloud** uses the browser and makes no speech API request.
- Test switching back to server narration while a browser passage is speaking; verify it stops without double playback.
- Test mute, volume, table break/resume, rerolled/edited passage replay, unsupported browsers, and a browser without a Czech voice.
- Test on a phone with the narration controls under the table menu as well as the desktop header.
