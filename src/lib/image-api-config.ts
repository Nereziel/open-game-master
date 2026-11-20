import type { StorySettings } from "@/lib/types";

// Resolve a campaign's optional image endpoint separately from its narrator.
// A server key must NEVER be forwarded to a campaign-specific URL. A model
// override alone, on the other hand, may use the configured server endpoint.
export type CampaignImageApi = Pick<StorySettings, "imageApiBaseUrl" | "imageApiModel" | "imageApiKey">;
export type ImageApiConnection = { baseUrl: string; model: string; apiKey: string };

export function resolveImageApiConnection(
  server: ImageApiConnection,
  campaign?: Partial<CampaignImageApi>,
): ImageApiConnection {
  const customUrl = campaign?.imageApiBaseUrl?.trim() ?? "";
  return {
    baseUrl: (customUrl || server.baseUrl).replace(/\/+$/, ""),
    model: campaign?.imageApiModel?.trim() || server.model,
    apiKey: customUrl
      ? (campaign?.imageApiKey?.trim() ?? "")
      : (campaign?.imageApiKey?.trim() || server.apiKey),
  };
}

// API base URL, not a full request URL. Validate before saving to prevent
// malformed requests, URL credentials and unexpected query/fragment suffixes.
export function validImageApiBaseUrl(value: string): boolean {
  if (!value.trim()) return true; // Inherit the server's endpoint.
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") &&
      !!url.hostname && !url.username && !url.password && !url.search && !url.hash;
  } catch {
    return false;
  }
}
