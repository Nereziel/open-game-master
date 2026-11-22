import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { externalItemKey, externalItemSource } from "@/lib/content/external-item-cs-logic";

// Local, server-owned translation cache created by scripts/translate-content-items-cs.mjs.
// Never ship the SQLite content pack or API credentials to browsers.
type CachedTranslation = { hash: string; cs: string };
let cache: { mtime: number; path: string; entries: Record<string, CachedTranslation> } | null = null;

function translations(): Record<string, CachedTranslation> {
  const filename = process.env.CONTENT_ITEMS_CS_PATH ||
    path.join(process.cwd(), "data", "content", "items-cs.json");
  let mtime: number;
  try { mtime = statSync(filename).mtimeMs; } catch { return {}; }
  if (cache?.path === filename && cache.mtime === mtime) return cache.entries;
  try {
    const parsed: unknown = JSON.parse(readFileSync(filename, "utf8"));
    if (!parsed || typeof parsed !== "object") return {};
    const entries = (parsed as { entries?: unknown }).entries;
    if (!entries || typeof entries !== "object" || Array.isArray(entries)) return {};
    cache = { path: filename, mtime, entries: entries as Record<string, CachedTranslation> };
    return cache.entries;
  } catch { return {}; }
}

export function externalItemTranslationCs(entry: {
  source: string; documentSlug: string; slug: string; data: Record<string, unknown>;
}): string | null {
  if (entry.source !== "open5e") return null;
  const original = externalItemSource(entry.data);
  if (!original) return null;
  const matched = translations()[externalItemKey(entry.documentSlug, entry.slug)];
  if (!matched || typeof matched.cs !== "string" || !matched.cs.trim()) return null;
  const hash = createHash("sha256").update(original).digest("hex");
  return matched.hash === hash ? matched.cs : null;
}
