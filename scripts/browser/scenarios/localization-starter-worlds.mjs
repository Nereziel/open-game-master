// HTTP regression through the browser runner's authenticated API session.
// No storyteller call is made: creation stays in the lobby, using a closed
// loopback port for the configured model. Restore settings and remove fixtures.
import assert from "node:assert/strict";
import { eventually } from "../lib.mjs";

export default {
  name: "starter-world-language",
  viewports: ["desktop"],
  app: false,
  async run(t) {
    const { api, base, page } = t;
    const json = async (method, path, options = {}, expected = 200) => {
      const response = await api[method](base + path, options);
      const body = await response.json();
      assert.equal(response.status(), expected, method + " " + path + ": " + JSON.stringify(body).slice(0, 500));
      return body;
    };
    const headersFor = (locale) => ({ "x-odm-locale": locale, "accept-language": "en-US" });
    const expected = {
      en: ["The Silent Bell of Marrow's Crossing", "english", "Raised in the high passes"],
      fr: ["La cloche silencieuse de Gué-Marais", "french", "Né dans les hauts cols"],
      cs: ["Umlklý zvon v Marrowově Brodě", "czech", "Brakk vyrůstal ve vysokohorských průsmycích"],
    };
    const settings = (await json("get", "/api/admin/settings")).config.text;
    const original = { provider: settings.provider, customBaseUrl: settings.customBaseUrl, customModel: settings.customModel };
    const campaignIds = [];
    const characterIds = [];
    try {
      await json("patch", "/api/admin/settings", { data: { text: { provider: "custom", customBaseUrl: "http://127.0.0.1:9/v1", customModel: "starter-test" } } });
      const seeds = [];
      const sheets = [];
      for (const [locale, [title, language, backstory]] of Object.entries(expected)) {
        const headers = headersFor(locale);
        const seed = await json("get", "/api/starter", { headers });
        assert.equal(seed.oneShot.id, "silent-bell");
        assert.equal(seed.oneShot.title, title);
        assert.ok(!("outline" in seed.oneShot), "GET must not expose the secret outline");
        assert.deepEqual(seed.pregens.map((hero) => hero.id), ["brakk", "kara", "vex", "sera"]);
        assert.ok(seed.pregens.every((hero) => !("sheet" in hero)));
        seeds.push(seed);
        const { campaign } = await json("post", "/api/starter", { headers, data: { solo: true } }, 201);
        campaignIds.push(campaign.id);
        assert.equal(campaign.title, seed.oneShot.title);
        assert.equal(campaign.description, seed.oneShot.description);
        assert.equal(campaign.gameSettings.tableLanguage, language);
        assert.equal(campaign.startingLevel, 1);
        assert.equal(campaign.maxPlayers, 1);
        assert.ok(!("dmOutline" in campaign), "POST must not expose the secret outline");
        const path = "/api/campaigns/" + campaign.id;
        // Reading a campaign in another UI language must never rewrite it.
        const stored = (await json("get", path, { headers: headersFor(locale === "en" ? "cs" : "en") })).campaign;
        assert.equal(stored.title, title);
        assert.equal(stored.description, seed.oneShot.description);
        assert.equal(stored.gameSettings.tableLanguage, language);
        const { sheet } = await json("post", path + "/sheet/pregen", { headers, data: { id: "brakk" } }, 201);
        if (sheet.libraryCharacterId) characterIds.push(sheet.libraryCharacterId);
        assert.equal(sheet.name, "Brakk");
        assert.equal(sheet.race, "human");
        assert.equal(sheet.class, "barbarian");
        assert.ok(sheet.backstory.startsWith(backstory), locale + " backstory: " + sheet.backstory);
        sheets.push({ abilities: sheet.abilities, race: sheet.race, class: sheet.class, background: sheet.background, maxHp: sheet.maxHp, ac: sheet.ac });
      }
      assert.equal(new Set(seeds.map((seed) => seed.oneShot.description)).size, 3);
      assert.equal(new Set(seeds.map((seed) => seed.pregens[0].tagline)).size, 3);
      assert.deepEqual(sheets[1], sheets[0]);
      assert.deepEqual(sheets[2], sheets[0]);

      // Reopen the same mounted StarterDialog without navigating away.
      // Changing the saved preference directly keeps this component alive
      // (the Settings page would unmount it and hide a stale-cache bug).
      // Opening the dialog renders its useT subscription against that choice.
      await t.open("/");
      const tile = page.locator('[data-tour="tile-quick-start"]').first();
      await eventually(() => tile.isVisible(), { timeoutMs: 30_000, label: "Quick start tile" });
      const originalLocale = await page.evaluate(() => localStorage.getItem("odm.locale"));
      try {
        for (const locale of ["en", "cs", "fr", "en"]) {
          const seed = seeds[Object.keys(expected).indexOf(locale)];
          await page.evaluate((choice) => localStorage.setItem("odm.locale", choice), locale);
          await t.tap(tile);
          const dialog = page.getByRole("dialog").filter({ has: page.getByText(seed.oneShot.title, { exact: true }) });
          await eventually(() => dialog.isVisible(), { timeoutMs: 30_000, label: locale + " quick-start preview" });
          assert.ok(await dialog.getByText(seed.oneShot.description, { exact: true }).isVisible(), locale + " description");
          for (const hero of seed.pregens) {
            assert.ok(await dialog.getByText(hero.tagline, { exact: true }).isVisible(), locale + " hero " + hero.id);
          }
          await t.tap(dialog.getByRole("button", { name: "Close", exact: true }));
          await eventually(async () => !(await dialog.isVisible()), { label: "closed quick start" });
        }
      } finally {
        await page.evaluate((choice) => {
          if (choice === null) localStorage.removeItem("odm.locale");
          else localStorage.setItem("odm.locale", choice);
        }, originalLocale);
      }

      // Pack-owned texts are not gettext keys. Listing and detail must
      // preserve the manifest exactly when the reader changes language.
      const packs = (await json("get", "/api/worlds", { headers: headersFor("en") })).packs;
      assert.ok(packs.some((pack) => pack.source === "bundled"), "expected bundled world fixtures");
      for (const locale of ["fr", "cs"]) {
        assert.deepEqual((await json("get", "/api/worlds", { headers: headersFor(locale) })).packs, packs);
      }
      for (const summary of packs.filter((pack) => pack.source === "bundled")) {
        const path = "/api/worlds/" + encodeURIComponent(summary.id);
        const { pack } = await json("get", path, { headers: headersFor("en") });
        for (const key of ["id", "name", "blurb", "theme", "premise", "baseGenre"]) assert.equal(pack[key], summary[key]);
        for (const locale of ["fr", "cs"]) assert.deepEqual((await json("get", path, { headers: headersFor(locale) })).pack, pack);
      }
    } finally {
      // Campaign removal comes first, so library characters are no longer seated.
      try {
        for (const id of campaignIds) await json("delete", "/api/campaigns/" + id);
        for (const id of characterIds) await json("delete", "/api/characters/" + id);
      } finally {
        await json("patch", "/api/admin/settings", { data: { text: original } });
      }
    }
  },
};
