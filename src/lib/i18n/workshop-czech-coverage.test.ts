import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import catalog from "./cs.json";

// This covers literal keys used by workshop components and the twelve DM
// panels reused inside the workshop. Dynamic keys need separate tests.
const reusedPanels = [
  "DmBestiaryPanel",
  "DmEncounterPrepPanel",
  "DmMapLibraryPanel",
  "DmNpcForgePanel",
  "DmSharePanel",
  "DmStoryboardPanel",
  "DmTablesPanel",
  "FactionsPanel",
  "LorePanel",
  "MarketPanel",
  "OverworldPanel",
  "RulesPanel",
] as const;

function filesBelow(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? filesBelow(path) : /\.tsx$/.test(entry.name) ? [path] : [];
  });
}

function literalTranslationKeys(source: string): string[] {
  const matches = source.matchAll(/\bt\(\s*"((?:\\.|[^"\\])*)"/g);
  return [...matches].map((match) => JSON.parse(`"${match[1]}"`) as string);
}

describe("Czech workshop literal translation keys", () => {
  it("covers all literal keys used by the workshop and reused DM panels", () => {
    const paths = [
      ...filesBelow(join(process.cwd(), "src/app/workshop")),
      ...reusedPanels.map((panel) => join(process.cwd(), "src/app/campaigns/[campaignId]", `${panel}.tsx`)),
    ];
    const messages = catalog.messages as Record<string, string>;
    const contexts = catalog.contexts as Record<string, Record<string, string>>;
    const missing = paths.flatMap((path) => {
      const keys = literalTranslationKeys(readFileSync(path, "utf8"));
      return keys
        .filter((key) => !messages[key]?.trim() && !Object.values(contexts[key] ?? {}).some(Boolean))
        .map((key) => `${path.replace(process.cwd() + "/", "")}: ${key}`);
    });
    expect(missing).toEqual([]);
  });
});
