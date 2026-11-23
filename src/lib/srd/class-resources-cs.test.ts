import { describe, expect, it } from "vitest";
import { installCsTables } from "../i18n/cs-tables";
import { CS_NAMES_BY_TABLE } from "../content/names-cs";
import { RESOURCE_CS_GUIDANCE } from "./class-resources-cs-data";
import { resourceDisplayName, resourceGuidance } from "./class-resources-fr";

installCsTables({ names: CS_NAMES_BY_TABLE, guidance: RESOURCE_CS_GUIDANCE });

describe("Czech class resource display alongside French", () => {
  it("shows a Czech resource name without touching the English identity", () => {
    const id = "rage";
    expect(resourceDisplayName(id, "cs")).toBe("Zuřivost");
    expect(resourceDisplayName(id, "en")).toBeNull();
  });

  it("uses Czech player-facing guidance and preserves missing-entry fallback", () => {
    expect(resourceGuidance("lay_on_hands", "cs")).toContain("Dotykem obnoví paladin");
    expect(resourceGuidance("does_not_exist", "cs")).toBeNull();
    expect(resourceGuidance("lay_on_hands", "en")).toBeNull();
  });
});
