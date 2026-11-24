// The French rulebook (#959) reaches the reader by the request's
// Accept-Language, on the website and through the apps' fetch to their host
// (the client's runtime.ts adds the bearer token and keeps the page's own
// headers): a reader asking in French gets « Boule de feu », one asking in
// English gets Fireball, and the answer says it varies by that header.
import { check } from "../lib.mjs";

export default {
  name: "rulebook-language",
  viewports: ["desktop"],
  async run(t) {
    const { page } = t;
    await t.open("/rulebook");
    const asked = await page.evaluate(async () => {
      const ask = async (language, choice) => {
        const response = await fetch("/api/rulebook/pages/fireball", { headers: { "accept-language": language, ...(choice ? { "x-odm-locale": choice } : {}) }, cache: "no-store" });
        const body = await response.json().catch(() => null);
        return { status: response.status, title: body?.page?.title ?? null, id: body?.page?.id ?? null, md: body?.page?.md ?? "", vary: response.headers.get("vary") };
      };
      const cs = await ask("cs-CZ,cs;q=0.9");
      const forcedCs = await ask("en-US", "cs");
      const response = await fetch("/api/rulebook/search?q=" + encodeURIComponent("Ohnivá koule"), { headers: { "x-odm-locale": "cs" }, cache: "no-store" });
      const results = await response.json();
      const details = async (locale, slug = "srd%3Afireball") => {
        const r = await fetch("/api/content/spells/" + slug, { headers: { "x-odm-locale": locale }, cache: "no-store" });
        return { status: r.status, entry: (await r.json()).entry };
      };
      return { fr: await ask("fr-FR,fr;q=0.9"), en: await ask("en-US,en;q=0.9"), cs, forcedCs,
        search: { status: response.status, found: results.hits?.some((hit) => hit.page === "fireball") ?? false },
        csDetail: await details("cs"), enDetail: await details("en"),
        canonical: await Promise.all(["en", "fr", "cs"].map((locale) => details(locale, "fireball"))) };
    });
    check(asked.fr.status === 200 && asked.fr.title === "Boule de feu", `the French ask reads the French book (${JSON.stringify(asked.fr)})`);
    check(asked.en.status === 200 && asked.en.title === "Fireball", "the English ask reads the English book");
    check(asked.cs.status === 200 && asked.cs.id === "fireball" && asked.cs.title === "Ohnivá koule", "the Czech ask reads the same canonical page in Czech");
    check(asked.cs.md.includes("Úplné znění pravidel v češtině"), "the Czech page includes its full localized text");
    check(asked.forcedCs.status === 200 && asked.forcedCs.title === asked.cs.title, "the explicit locale overrides the browser language");
    check(/accept-language/i.test(asked.cs.vary ?? "") && /x-odm-locale/i.test(asked.cs.vary ?? ""), "the localized page varies by both language headers");
    check(asked.search.status === 200 && asked.search.found, "Czech text search finds the canonical fireball page");
    check(asked.canonical.every((detail) => detail.status === 200 && detail.entry?.slug === asked.canonical[0].entry?.slug), "canonical spell detail resolves the same identity for EN, FR and CS");
    const { csDetail, enDetail } = asked;
    check(csDetail.status === 200 && enDetail.status === 200, "the bundled spell detail works in both locales");
    const { localized_desc, ...original } = csDetail.entry.data;
    check(typeof localized_desc === "string" && localized_desc.length > 0, "the Czech spell detail has localized prose");
    check(csDetail.entry.slug === enDetail.entry.slug && JSON.stringify(original) === JSON.stringify(enDetail.entry.data), "the localized spell detail preserves the English mechanical fields and identity");
  },
};
