// The interface's language (PR #1016): Settings > Language to French fetches
// the French catalog as its own chunk (src/lib/i18n/catalog-loader.ts, kept
// out of every page's first load) and the page switches over; a reload is
// rendered in French by the server from the cookie and hydrates without React
// throwing the French HTML away (locale.tsx CatalogGate); Automatic
// brings English back. In the apps the shell applies the device's choice.
import { check, eventually } from "../lib.mjs";

export default {
  name: "interface-language",
  viewports: ["desktop"],
  async run(t) {
    const { page, root } = t;
    const errors = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(String(error)));
    await t.open("/settings");
    const french = page.locator(`${root}button[aria-pressed]`).filter({ hasText: "Français" }).first();
    await eventually(() => french.count(), { timeoutMs: 30_000, label: "the Language section" });
    check(/en/.test(await page.evaluate(() => document.documentElement.lang)), "English to start");
    await t.tap(french);
    await eventually(async () => (await page.evaluate(() => document.documentElement.lang)) === "fr-FR", { timeoutMs: 20_000, label: "html lang turns fr-FR once the catalog is in" });
    await eventually(async () => /Langue/.test(await page.locator(root || "body").first().innerText()), { timeoutMs: 20_000, label: "the section heading reads Langue" });
    await t.shot("french-live");
    if (!t.app) {
      await page.reload();
      await eventually(async () => /Langue/.test(await page.locator("body").innerText()), { timeoutMs: 20_000, label: "French after a reload" });
      const ssr = await (await page.request.get(page.url())).text();
      check(/lang="fr-FR"/.test(ssr), "the server renders <html lang=fr-FR> from the cookie");
      await t.shot("french-reload");
    }
    const czech = page.locator(`${root}button[aria-pressed]`).filter({ hasText: "Čeština" }).first();
    await t.tap(czech);
    await eventually(async () => (await page.evaluate(() => document.documentElement.lang)) === "cs-CZ", { timeoutMs: 20_000, label: "html lang turns cs-CZ" });
    await eventually(async () => /Jazyk/.test(await page.locator(root || "body").first().innerText()), { timeoutMs: 20_000, label: "the section heading reads Jazyk" });
    check(await page.evaluate(() => localStorage.getItem("odm.locale") === "cs"), "the Czech choice is stored on the device");
    await t.shot("czech-live");
    if (!t.app) {
      check(await page.evaluate(() => document.cookie.split(";").some((part) => part.trim() === "odm_locale=cs")), "the Czech choice is stored in the SSR cookie");
      await page.reload();
      await eventually(async () => /Jazyk/.test(await page.locator("body").innerText()), { timeoutMs: 20_000, label: "Czech after a reload" });
      const ssr = await (await page.request.get(page.url())).text();
      check(/lang="cs-CZ"/.test(ssr), "the server renders <html lang=cs-CZ> from the cookie");
      await t.shot("czech-reload");
    }
    const hydration = errors.filter((text) => /hydrat|did not match|Minified React error #4(18|19|23|25)/i.test(text));
    check(hydration.length === 0, `no hydration error: ${hydration.join(" | ")}`);
    const auto = page.locator(`${root}button[aria-pressed]`).filter({ hasText: /Automatique|Automatic|Automaticky/ }).first();
    await t.tap(auto);
    await eventually(async () => /^en/.test(await page.evaluate(() => document.documentElement.lang)), { timeoutMs: 20_000, label: "English back on Automatic" });
  },
};
