import { describe, expect, it } from "vitest";
import { searchKey } from "@/lib/language/text-logic";
import { spellNameMatchesSearch } from "./spell-name-search";

describe("spell tile search under localized names", () => {
  const storedName = "Cure Wounds";
  const shownName = "Léčení zranění";

  it("finds the Czech display name even when accents are not typed", () => {
    expect(spellNameMatchesSearch(storedName, shownName, searchKey("leceni"))).toBe(true);
    expect(spellNameMatchesSearch(storedName, shownName, searchKey("zraneni"))).toBe(true);
    expect(spellNameMatchesSearch(storedName, shownName, searchKey("LÉČENÍ"))).toBe(true);
  });

  it("still finds the English rules name when the UI is Czech", () => {
    expect(spellNameMatchesSearch(storedName, shownName, searchKey("cure"))).toBe(true);
    expect(spellNameMatchesSearch(storedName, shownName, searchKey("wounds"))).toBe(true);
    expect(spellNameMatchesSearch(storedName, shownName, searchKey("fireball"))).toBe(false);
  });

  it("keeps homebrew labels searchable and does not modify source names", () => {
    const homebrew = "Aether Pulse";
    const reskinned = "Éterický puls";
    expect(spellNameMatchesSearch(homebrew, reskinned, searchKey("etericky"))).toBe(true);
    expect(spellNameMatchesSearch(homebrew, reskinned, searchKey("aether"))).toBe(true);
    expect(spellNameMatchesSearch(homebrew, reskinned, "")).toBe(true);
    expect(homebrew).toBe("Aether Pulse");
  });
});
