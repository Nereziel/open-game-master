// The campaign model note uses the reader's locale, not the server's or
// table's language. A catalog-only lookup never contacts a model backend.
import { check } from "../lib.mjs";

export default {
  name: "model-verdict-language",
  viewports: ["desktop"],
  async run(t) {
    const { page } = t;
    await t.open("/");
    const result = await page.evaluate(async () => {
      const params = new URLSearchParams({ role: "image", model: "odm-regression-unlisted-xyz" });
      const ask = async (locale) => {
        const response = await fetch("/api/models?" + params, {
          headers: { "X-Odm-Locale": locale, "Accept-Language": "en-US" },
          cache: "no-store",
        });
        return { status: response.status, vary: response.headers.get("vary"), cache: response.headers.get("cache-control"), body: await response.json() };
      };
      // Sequential requests deliberately switch the language for the same URL.
      const en = await ask("en");
      const fr = await ask("fr");
      const cs = await ask("cs");
      return { en, fr, cs, again: await ask("en") };
    });
    const { en, fr, cs, again } = result;
    for (const item of [en, fr, cs, again]) {
      check(item.status === 200, "model lookup succeeds");
      check(item.body.catalog === null && item.body.model === en.body.model, "unknown catalog identity is unchanged");
      check(item.body.verdict.fit === en.body.verdict.fit && item.body.verdict.warnings.length === en.body.verdict.warnings.length, "fit and warning count do not depend on locale");
      check(/x-odm-locale/i.test(item.vary ?? "") && /no-store/i.test(item.cache ?? ""), "localized verdict is not shared across readers");
    }
    check(en.body.verdict.summary === "Not in the model catalog.", "English source summary");
    check(fr.body.verdict.summary === "Absent du catalogue de modèles.", "French summary");
    check(cs.body.verdict.summary === "Není v katalogu modelů.", "Czech summary");
    check(en.body.verdict.warnings.length > 0 && fr.body.verdict.warnings[0] !== en.body.verdict.warnings[0] && cs.body.verdict.warnings[0] !== en.body.verdict.warnings[0], "localized model warning");
    check(JSON.stringify(again.body) === JSON.stringify(en.body), "switching back returns English");
  },
};
