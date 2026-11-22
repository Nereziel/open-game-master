import { describe, expect, it } from "vitest";
import { installCsTables } from "@/lib/i18n/cs-tables";
import catalog from "@/lib/i18n/cs.json";
import { installCatalog } from "@/lib/i18n/translate";
import { CS_NAMES_BY_TABLE } from "@/lib/content/names-cs";
import { characterEventSummary } from "./event-summary-cs";

installCsTables({ names: CS_NAMES_BY_TABLE });
installCatalog("cs", catalog);

describe("Character history milestones in Czech", () => {
  it("localizes stored English acquired entries, including already-translated item names", () => {
    expect(characterEventSummary("Acquired Lucerna.", "item", "cs"))
      .toBe("Získaný předmět: Lucerna.");
    expect(characterEventSummary("Acquired Scale Mail.", "item", "cs"))
      .toBe("Získaný předmět: Šupinová zbroj.");
    expect(characterEventSummary("Acquired Longsword", "item", "cs"))
      .toBe("Získaný předmět: Dlouhý meč.");
  });

  it("does not rewrite other languages, unrelated stories, or user-authored prose", () => {
    expect(characterEventSummary("Acquired Scale Mail.", "item", "en"))
      .toBe("Acquired Scale Mail.");
    expect(characterEventSummary("Acquired a friend.", "relationship", "cs"))
      .toBe("Acquired a friend.");
    expect(characterEventSummary("Hrdina si koupil lucernu.", "item", "cs"))
      .toBe("Hrdina si koupil lucernu.");
  });
});
