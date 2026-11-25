// New campaigns default to the server's table language, independently of
// the reader's interface language. Check the same picker in EN, FR and CS.
import { check, eventually, untilStill } from "../lib.mjs";

export default {
  name: "server-language-creator",
  viewports: ["desktop"],
  // The stand-in host answer is a browser-level route, which the app's
  // patched fetch bypasses.
  app: false,
  async run(t) {
    const { page, root, api, base } = t;
    await api.delete(`${base}/api/profile/campaign-defaults`);
    const capabilities = /\/api\/capabilities(\?|$)/;
    let language = "english";
    await page.route(capabilities, async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      await route.fulfill({ response, json: { ...body, language } });
    });
    try {
      for (const [server, native] of [["english", "English"], ["french", "Français"], ["czech", "Čeština"]]) {
        language = server;
        await t.open("/");
        const tile = page.locator(`${root}[data-tour="tile-new-campaign"], [data-tour="tile-new-campaign"]`).locator("visible=true").first();
        await eventually(() => tile.count(), { timeoutMs: 30_000, label: "the New campaign tile" });
        await t.tap(tile);
        const dialog = page.getByRole("dialog").filter({ has: page.locator(".cc-shell, .wizard-continue") }).first();
        await eventually(() => dialog.locator("button.wizard-continue").count(), { timeoutMs: 30_000, label: "the creator" });
        // The interface may follow the server too. The picker has its own
        // translated accessible name, while the selected language is native.
        const world = dialog.locator('[data-group="world"]');
        const toggle = world.locator("button.cc-group-toggle");
        await eventually(() => toggle.isVisible(), { label: "the World and story group" });
        if ((await toggle.getAttribute("aria-expanded")) !== "true") await t.tap(toggle);
        const picker = world.getByRole("button", { name: /^(Table language|Langue de la table|Jazyk kampaně)$/i }).first();
        await eventually(async () => (await picker.count()) > 0 && (await picker.innerText()).includes(native), { label: "the new campaign starts in " + native });
        check(await picker.locator('svg[viewBox="0 0 30 20"] > *').count() > 0, "the Table language picker shows a drawn flag");
        await picker.scrollIntoViewIfNeeded();
        await untilStill(page);
        await t.shot("creator-" + server);
      }
    } finally {
      await page.unroute(capabilities);
    }
  },
};
