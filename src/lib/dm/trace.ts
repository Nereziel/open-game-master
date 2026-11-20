// Opt-in local diagnostics for model/JSON failures.
// DM_TRACE=1 writes private prompts and replies under data/dm-traces.
// Never enable on a shared server without informing the players.
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { appendFileSync, mkdirSync, readdirSync, renameSync, statSync, unlinkSync } from "node:fs";
import path from "node:path";

type TraceContext = { flowId: string; flow: string; campaignId?: string };
const contextStorage = new AsyncLocalStorage<TraceContext>();
const MAX_STRING = 100_000;
const MAX_ENTRY_BYTES = 512 * 1024;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_FILES = 12;
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_NESTING = 12;
let writes = 0;
let warned = false;

export function dmTraceEnabled(): boolean {
  return process.env.DM_TRACE === "1";
}

export function newDmTraceId(): string {
  return randomUUID();
}

export function withDmTrace<T>(
  context: { flow: string; campaignId?: string },
  work: () => Promise<T>,
): Promise<T> {
  if (!dmTraceEnabled()) return work();
  const parent = contextStorage.getStore();
  return contextStorage.run(
    { flowId: parent?.flowId ?? randomUUID(), flow: context.flow, campaignId: context.campaignId ?? parent?.campaignId },
    work,
  );
}

const SECRET_FIELD =
  /^(?:api[_-]?key|apikey|authorization|password|secret|client[_-]?secret|private[_-]?key|access[_-]?token|refresh[_-]?token|session[_-]?token|cookie|set-cookie|credentials?|provider_items)$/i;

function redactText(input: string): string {
  if (/^data:(?:image|audio)\//i.test(input)) return "[binary data URL omitted]";
  const redacted = input
    .replace(/\b(Bearer\s+)[a-z0-9._~+/-]{8,}/gi, "$1[REDACTED]")
    .replace(/\bsk-(?:proj-)?[a-z0-9_-]{12,}\b/gi, "[REDACTED_KEY]")
    .replace(/\bAIza[a-z0-9_-]{30,}\b/g, "[REDACTED_KEY]")
    .replace(/(["'](?:api[_-]?key|token|password|secret|authorization)["']\s*:\s*["'])[^"']+(["'])/gi, "$1[REDACTED]$2");
  return redacted.length > MAX_STRING
    ? redacted.slice(0, MAX_STRING) + "[TRUNCATED " + (redacted.length - MAX_STRING) + " characters]"
    : redacted;
}

// Raw credentials, image bytes and private provider continuation items never
// enter the trace. Text may still contain personal data: traces are private.
export function safeDmTraceValue(value: unknown): unknown {
  const seen = new WeakSet<object>();
  const visit = (item: unknown, depth: number, field = ""): unknown => {
    if (SECRET_FIELD.test(field)) return "[REDACTED]";
    if (item === null || typeof item === "number" || typeof item === "boolean") return item;
    if (typeof item === "string") return redactText(item);
    if (typeof item !== "object") return String(item);
    if (depth >= MAX_NESTING) return "[DEPTH LIMIT]";
    if (seen.has(item)) return "[CIRCULAR]";
    seen.add(item);
    if (Array.isArray(item)) {
      const out = item.slice(0, 150).map((entry) => visit(entry, depth + 1));
      if (item.length > 150) out.push("[TRUNCATED " + (item.length - 150) + " entries]");
      return out;
    }
    const record = item as Record<string, unknown>;
    if (record.type === "image_url" || field === "image_url") return "[image URL/bytes omitted]";
    const pairs = Object.entries(record).slice(0, 150);
    const out = Object.fromEntries(pairs.map(([key, entry]) => [key, visit(entry, depth + 1, key)]));
    if (Object.keys(record).length > pairs.length) out.__truncatedKeys = true;
    return out;
  };
  return visit(value, 0);
}

function pruneFiles(directory: string, current: string) {
  const now = Date.now();
  const files = readdirSync(directory)
    .filter((name) => /^\d{4}-\d\d-\d\d-\d+.*\.jsonl$/.test(name))
    .map((name) => {
      const file = path.join(directory, name);
      return { file, modified: statSync(file).mtimeMs };
    })
    .sort((a, b) => b.modified - a.modified);
  let kept = 0;
  for (const entry of files) {
    if (entry.file === current) {
      kept += 1;
      continue;
    }
    if (now - entry.modified > MAX_AGE_MS || kept >= MAX_FILES) {
      unlinkSync(entry.file);
    } else {
      kept += 1;
    }
  }
}

// A full disk or inaccessible directory must never interrupt gameplay.
export function recordDmTrace(event: string, payload: Record<string, unknown> = {}): void {
  if (!dmTraceEnabled()) return;
  try {
    const directory = path.join(process.cwd(), "data", "dm-traces");
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    const date = new Date().toISOString().slice(0, 10);
    const file = path.join(directory, date + "-" + process.pid + ".jsonl");
    const context = contextStorage.getStore();
    const entry = {
      at: new Date().toISOString(),
      event,
      ...(context ? { flowId: context.flowId, flow: context.flow, campaignId: context.campaignId } : {}),
      ...payload,
    };
    const safe = JSON.stringify(safeDmTraceValue(entry));
    const serialized = Buffer.byteLength(safe) > MAX_ENTRY_BYTES
      ? JSON.stringify({
          at: entry.at,
          event,
          traceId: payload.traceId,
          truncated: true,
          originalBytes: Buffer.byteLength(safe),
          partialJson: safe.slice(0, 175_000),
        })
      : safe;
    const line = serialized + "\n";
    try {
      if (statSync(file).size + Buffer.byteLength(line) > MAX_FILE_BYTES) {
        renameSync(file, path.join(directory, date + "-" + process.pid + "-" + Date.now() + "-" + randomUUID() + ".jsonl"));
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    appendFileSync(file, line, { encoding: "utf8", mode: 0o600 });
    writes += 1;
    if (writes === 1 || writes % 50 === 0) pruneFiles(directory, file);
  } catch (error) {
    if (!warned) {
      warned = true;
      console.warn("[dm-trace] Could not write private trace file:", error instanceof Error ? error.message : "unknown error");
    }
  }
}
