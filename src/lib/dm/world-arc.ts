import { withLanguage } from "@/lib/dm/table-language-logic";
import { recordDmTrace, withDmTrace } from "@/lib/dm/trace";
import { getCampaignById } from "@/lib/db/campaigns";
import { listChapters } from "@/lib/db/chapters";
import { arcTextTimeoutMs } from "@/lib/model-client";
import { requestUtilityMessage } from "@/lib/dm/model";
import { trackUtilityCall } from "@/lib/dm/call-tracker";
import { type StoryArc } from "@/lib/dm/arc-logic";
import { parseWorldArcsJson, worldArcPlanningContext, type WorldArc } from "@/lib/dm/world-arc-logic";

// World-arc generation: the one model call the world-simulation engine ever
// makes. It runs when a campaign has no unresolved world arcs (at arc
// generation, and again after the party resolves the clocks in play), so it
// fires at most once per act in practice. Every rung is authored here, up
// front; advancing them later is pure dice (world-tick-logic.ts).

const GENERATE_SYSTEM = `You are planning the OFF-SCREEN side of an AI GM's secret story arc for a D&D 5e campaign: 1 or 2 world arcs, storylines that advance on their own whether or not the party engages (a cult's summoning nearing completion, a warlord's march, a plague's spread, a rival expedition closing in). Keep it brief and answer quickly.

Reply with ONLY a strict JSON array (the outermost value MUST start with [ and end with ]), no code fences, shaped exactly: [{"name": string, "driver": string, "rungs": string[]}]. This is NOT the main campaign story plan. Do NOT return a JSON object with premise, acts, beats, finale, or storyArc, even if those appear in the input. The input is story BACKGROUND, not an output template.

name: the arc's short name. driver: who or what pushes it forward (a faction or figure, not the party). rungs: 5 to 7 ordered escalation stages, each ONE sentence describing a world change observable in play (rumors, prices, refugees, omens, troop movements), from first whisper to full catastrophe or triumph. The last rung is what happens if nobody ever stops it.

Rules: grow the arcs out of the campaign's own antagonist, factions, and unfinished threads rather than inventing an unrelated world; at most one arc may belong to the main antagonist. Do not include the party in any rung; these are what the WORLD does. Every string under 220 characters. Players never see this.\n\nJSON SHAPE EXAMPLE (replace every placeholder with your own text): [{"name":"...","driver":"...","rungs":["...","...","...","...","..."]}].`;

export async function generateWorldArcs(
  campaignId: string,
  arc: StoryArc,
): Promise<WorldArc[]> {
  return withDmTrace({ flow: "world_arc_generation", campaignId }, async () => {
  recordDmTrace("flow_start", { stage: "world_arc_generation" });
  const campaign = getCampaignById(campaignId);
  if (!campaign) {
    return [];
  }
  const chapters = listChapters(campaignId)
    .filter((chapter) => chapter.status === "closed")
    .slice(-4)
    .map((chapter) => `${chapter.index}. "${chapter.title}"`)
    .join("\n");
  const storyFacts = worldArcPlanningContext(arc);
  const worldClockRequest = [
    "Create 1 or 2 independent, OFF-SCREEN world-clock storylines from these campaign facts. These advance without the party. Do NOT rewrite the main story arc.",
    storyFacts,
    chapters ? `Chapters played so far:\n${chapters}` : "",
    "Return ONLY the JSON ARRAY [{\"name\":\"...\",\"driver\":\"...\",\"rungs\":[\"...\",\"...\",\"...\",\"...\",\"...\"]}]. No premise, acts, beats or finale keys.",
  ].filter(Boolean).join("\n\n");
  recordDmTrace("world_arc_prompt", { sourceChars: storyFacts.length, chapterCount: chapters ? chapters.split("\n").length : 0 });
  const { message, error } = await trackUtilityCall(campaignId, "world", () =>
    requestUtilityMessage(
      campaign.settings,
      [
        { role: "system", content: withLanguage(GENERATE_SYSTEM, campaign.gameSettings.tableLanguage) },
        {
          role: "user",
          content: worldClockRequest,
        },
      ],
      { meta: { task: "world_arc_generate" }, timeoutMs: arcTextTimeoutMs(), thinking: false, temperature: 0 },
    ),
  );
  if (error) {
    if (process.env.DM_DEBUG) {
      console.log("[dm-debug] world arc generation: model call failed");
    }
    return [];
  }
  let arcs = parseWorldArcsJson(typeof message?.content === "string" ? message.content : "");
  recordDmTrace("json_validation", {
    stage: "world_arcs", attempt: "first", accepted: arcs.length > 0,
    arcCount: arcs.length, responseChars: String(message?.content ?? "").length,
    ...(!arcs.length ? { reason: "expected-array-of-world-arcs" } : {}),
  });
  if (!arcs.length) {
    // An agent CLI serving utility tasks sometimes continues the GM's scene
    // instead of returning world-clock JSON. Retry once as a fresh, strict
    // data completion; never store that prose as a world arc.
    if (process.env.DM_DEBUG) {
      console.debug("[dm-debug] world arc generation: unreadable JSON; retrying strict utility completion");
    }
    const recovery = await trackUtilityCall(campaignId, "world", () =>
      requestUtilityMessage(
        campaign.settings,
        [
          {
            role: "system",
            content: withLanguage(
              `${GENERATE_SYSTEM}\n\nFORMAT RECOVERY: The previous reply was NOT a world-clock array (it may have copied the main story with premise, acts, beats and finale). Discard that format. This is a DATA PLANNING task, not an RPG turn. Do not narrate or address players. Output ONLY a JSON array of 1 or 2 objects with name, driver and rungs (5 to 7 short strings each). Begin with [ and end with ]. No fences, commentary or extra text.`,
              campaign.gameSettings.tableLanguage,
            ),
          },
          {
            role: "user",
            content: `${worldClockRequest}\n\nThe prior model reply had the wrong JSON shape. Generate new OFF-SCREEN escalation clocks; never return the main plot again. RETURN THE JSON ARRAY ONLY.`,
          },
        ],
        { meta: { task: "world_arc_json_recovery" }, timeoutMs: arcTextTimeoutMs(), thinking: false, temperature: 0 },
      ),
    );
    if (!recovery.error) {
      arcs = parseWorldArcsJson(typeof recovery.message?.content === "string" ? recovery.message.content : "");
      recordDmTrace("json_validation", {
        stage: "world_arcs", attempt: "format_recovery", accepted: arcs.length > 0,
        arcCount: arcs.length, responseChars: String(recovery.message?.content ?? "").length,
        ...(!arcs.length ? { reason: "expected-array-of-world-arcs" } : {}),
      });
    }
    if (!arcs.length && process.env.DM_DEBUG) {
      console.debug("[dm-debug] world arc generation: no readable JSON after recovery");
    }
  }
  recordDmTrace("world_arcs_result", { arcCount: arcs.length });
  return arcs;
  });
}

// Tops up a story arc that has no live off-screen clocks. Failure returns
// the arc unchanged; generation simply retries at the next chapter close.
export async function ensureWorldArcs(campaignId: string, arc: StoryArc): Promise<StoryArc> {
  const campaign = getCampaignById(campaignId);
  if (!campaign?.gameSettings.worldSimulation) {
    return arc;
  }
  if (arc.worldArcs.some((worldArc) => worldArc.status !== "resolved")) {
    return arc;
  }
  try {
    const generated = await generateWorldArcs(campaignId, arc);
    if (!generated.length) {
      return arc;
    }
    // Resolved clocks stay on record (their consequences are history);
    // fresh ones join alongside under non-colliding ids.
    const kept = arc.worldArcs.filter((worldArc) => worldArc.status === "resolved");
    const merged = [...kept];
    for (const worldArc of generated) {
      let index = merged.length + 1;
      while (merged.some((existing) => existing.id === `wa${index}`)) {
        index += 1;
      }
      merged.push({ ...worldArc, id: `wa${index}` });
    }
    return { ...arc, worldArcs: merged.slice(0, 3) };
  } catch (error) {
    if (process.env.DM_DEBUG) {
      console.log("[dm-debug] world arc generation threw:", error);
    }
    return arc;
  }
}
