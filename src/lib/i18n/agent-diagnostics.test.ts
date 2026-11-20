import { describe, expect, it } from "vitest";
import catalog from "./cs.json";
import { installCatalog, translate } from "./translate";
import { localizeAgentDiagnostic } from "./agent-diagnostics";

installCatalog("cs", catalog);
const t = (english: string, vars?: Record<string, string | number>) => translate("cs", english, vars);

describe("agent diagnostics in the Czech interface", () => {
  it("translates the harness lockdown prefix while preserving the tool identifiers", () => {
    const source = "The server's agent program could not be locked down, so the turn was refused. (Antigravity started with its own tools still on (ask_custom_permission, ask_permission), so the turn was stopped.)";
    const translated = localizeAgentDiagnostic(source, t);
    expect(translated).toContain("program AI na serveru se nepodařilo".replace("program", "Program"));
    expect(translated).toContain("Antigravity bylo spuštěno");
    expect(translated).toContain("ask_custom_permission, ask_permission");
    expect(translated).not.toContain("could not be locked down");
  });

  it("translates a forbidden per-turn tool without touching its name", () => {
    const message = "Antigravity attempted a tool outside this turn's game permissions (browser_click_element), so the turn was stopped.";
    expect(localizeAgentDiagnostic(message, t)).toContain("(browser_click_element)");
    expect(localizeAgentDiagnostic(message, t)).toContain("mimo oprávnění");
  });

  it("keeps unknown technical errors readable for troubleshooting", () => {
    const message = "Binary exited with code 118: unsupported flag";
    expect(localizeAgentDiagnostic(message, t)).toBe(message);
  });

  it("can translate a static agent error alone", () => {
    expect(localizeAgentDiagnostic("The program did not answer.", t)).toBe("Program neodpověděl.");
  });
});
