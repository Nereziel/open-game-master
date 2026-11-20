import { describe, expect, it } from "vitest";
import {
  antigravityAgentFile,
  antigravitySettings,
  antigravityToolAllowed,
} from "./antigravity";

describe("Antigravity MCP-only configuration", () => {
  it("writes an exact MCP allowlist and keeps the per-session permission denies", () => {
    const frontmatter = antigravityAgentFile({
      system: "Narrate only through the game engine.",
      mcp: { url: "http://127.0.0.1:3005/api/mcp", token: "test-token" },
      toolNames: ["odm_roll", "odm_move", "odm_roll"],
    });
    expect(frontmatter).toContain('excludeDefaultComponents: true');
    expect(frontmatter).toContain('inheritCustomizations: false');
    expect(frontmatter).toContain('inheritMcp: false');
    expect(frontmatter).toContain('tools: ["mcp_odm_odm_roll","mcp_odm_odm_move"]');
    expect(frontmatter).toContain('"name":"odm"');
    expect(frontmatter).not.toContain("ask_permission");
    expect(frontmatter).not.toContain("browser_click_element");
    expect(antigravitySettings()).toMatchObject({
      permissions: {
        allow: ["mcp(odm/*)"],
        deny: expect.arrayContaining([
          "command(*)",
          "read_file(*)",
          "write_file(*)",
          "read_url(*)",
          "execute_url(*)",
        ]),
      },
    });
  });

  it("allows only the tools granted in this run, not all ODM-prefixed names", () => {
    const allowed = new Set(["odm_roll"]);
    expect(antigravityToolAllowed("mcp_odm_odm_roll", allowed)).toBe(true);
    expect(antigravityToolAllowed("call_mcp_tool", allowed)).toBe(true);
    expect(antigravityToolAllowed("call_mcp_tool", new Set())).toBe(false);
    for (const name of [
      "mcp_odm_odm_delete_campaign",
      "mcp_odm_roll",
      "mcp_untrusted_odm_roll",
      "ask_custom_permission",
      "ask_permission",
      "ask_question",
      "browser_click_element",
      "manage_task",
      "run_command",
    ]) {
      expect(antigravityToolAllowed(name, allowed), name).toBe(false);
    }
  });

  it("never grants any tools in a plain completion without a game MCP", () => {
    const file = antigravityAgentFile({
      system: "Answer without tools.",
      mcp: null,
      toolNames: ["odm_roll"],
    });
    expect(file).toContain("tools: []");
    expect(file).not.toContain("mcpServers:");
  });
});
