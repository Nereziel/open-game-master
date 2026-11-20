import type { Campaign } from "@/lib/db/campaigns";
import { requestUtilityMessage } from "@/lib/dm/model";
import { IMAGE_ENGLISH_SYSTEM, parseImageEnglish } from "@/lib/image-english-logic";
import { arcTextTimeoutMs } from "@/lib/model-client";
import { stripReasoningArtifacts } from "@/lib/story-prompt";

// Story text headed for an image model is ideally rewritten into English.
// If a utility model returns story narration instead of JSON, retry once
// with stricter instructions. Never fail an otherwise valid image job just
// because this optional translation step was unreadable. The original
// user-approved story prompt is a last-resort fallback (possibly less
// accurate for English-only image backends). No story text enters logs.
export async function toEnglishForImage<K extends string>(
  campaign: Pick<Campaign, "settings" | "gameSettings">,
  fields: Record<K, string>,
): Promise<Record<K, string>> {
  if (campaign.gameSettings.tableLanguage === "english") return fields;
  const keys = (Object.keys(fields) as K[]).filter((key) => fields[key].trim());
  if (!keys.length) return fields;

  const payload = JSON.stringify(Object.fromEntries(keys.map((key) => [key, fields[key]])));
  const call = (strict: boolean) => requestUtilityMessage(
    campaign.settings,
    [
      {
        role: "system",
        content: strict
          ? `${IMAGE_ENGLISH_SYSTEM}\n\nThis is a TRANSLATION task, not an RPG turn. Do not narrate, describe a scene as yourself, call tools, or explain. Output only a valid JSON object, one string value per input key, and nothing else.`
          : IMAGE_ENGLISH_SYSTEM,
      },
      { role: "user", content: strict ? `Translate this JSON into English and return JSON only:\n${payload}` : payload },
    ],
    { meta: { task: strict ? "image_english_retry" : "image_english" }, timeoutMs: arcTextTimeoutMs(), thinking: false },
  );

  const first = await call(false);
  if (!first.error) {
    const english = parseImageEnglish(stripReasoningArtifacts(String(first.message?.content ?? "")), keys);
    if (english) return { ...fields, ...english };
    console.warn("[image-english] Unreadable translation response; retrying with strict JSON instructions.");
    const again = await call(true);
    if (!again.error) {
      const corrected = parseImageEnglish(stripReasoningArtifacts(String(again.message?.content ?? "")), keys);
      if (corrected) return { ...fields, ...corrected };
    }
  }
  // Do not fail map/portrait generation because a separate text model could
  // not translate the prompt. Images may be less precise on such backends.
  console.warn("[image-english] Could not translate image prompt; using the original story text as fallback.");
  return fields;
}
