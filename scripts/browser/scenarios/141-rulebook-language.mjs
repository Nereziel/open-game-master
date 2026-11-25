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
      const compareList = async (kind, name, locale) => {
        const params = new URLSearchParams({ q: name, mechanics: "1", book: "1", limit: "50" });
        const response = await fetch("/api/content/" + kind + "?" + params, { headers: { "x-odm-locale": locale }, cache: "no-store" });
        const body = await response.json();
        const row = body.results?.find((row) => row.name === name && row.documentSlug === "wotc-srd");
        if (!row) return { status: response.status, row: null };
        const detail = await fetch("/api/content/" + kind + "/" + encodeURIComponent(row.slug), { headers: { "x-odm-locale": locale }, cache: "no-store" });
        return { status: response.status, row, vary: response.headers.get("vary"), detailStatus: detail.status, detail: (await detail.json()).entry };
      };
      const lists = await Promise.all([["spells", "Fireball"], ["items", "Cloak of Protection"]].map(async ([kind, name]) => ({
        kind, rows: await Promise.all(["en", "fr", "cs"].map((locale) => compareList(kind, name, locale))),
      })));
      const authoredFeats = await Promise.all(["en", "fr", "cs"].map(async (locale) => {
        const headers = { "x-odm-locale": locale };
        const response = await fetch("/api/content/feats?q=Alert&limit=100", { headers, cache: "no-store" });
        const body = await response.json();
        const row = body.results?.find((entry) => entry.name === "Alert" && entry.documentSlug === "odm-expanded");
        if (!row) return { locale, packInstalled: body.packInstalled, status: response.status, row: null };
        const detail = await fetch("/api/content/feats/" + encodeURIComponent(row.slug), { headers, cache: "no-store" });
        return { locale, packInstalled: body.packInstalled, status: response.status, row, detailStatus: detail.status, entry: (await detail.json()).entry };
      }));
      const bundledDetails = await Promise.all(["races", "backgrounds", "classes", "archetypes"].map(async (kind) => {
        const params = new URLSearchParams({ mechanics: "1", limit: "100", ...(kind === "archetypes" ? { class: "fighter" } : {}) });
        const headers = { "x-odm-locale": "cs" };
        const response = await fetch("/api/content/" + kind + "?" + params, { headers, cache: "no-store" });
        const body = await response.json();
        const row = body.results?.find((entry) => entry.source === "bundled");
        if (!row) return { kind, packInstalled: body.packInstalled, row: null };
        const detail = await fetch("/api/content/" + kind + "/" + encodeURIComponent(row.slug), { headers, cache: "no-store" });
        return { kind, packInstalled: body.packInstalled, row, status: detail.status, entry: (await detail.json()).entry };
      }));
      const archetypePicker = await Promise.all(["en", "fr", "cs"].map(async (locale) => {
        const headers = { "x-odm-locale": locale };
        const response = await fetch("/api/content/archetypes?class=fighter&limit=100&bundled=1", { headers, cache: "no-store" });
        const body = await response.json();
        return { locale, status: response.status, packInstalled: body.packInstalled, row: body.results?.find((row) => row.name === "Champion" && row.source === "bundled") };
      }));
      // Exercise an authored archetype, not only the core Champion.
      // The importer may give a published row precedence over ODM's own;
      // only the actual authored source is entitled to its reviewed prose.
      const authoredArchetypes = await Promise.all(["en", "fr", "cs"].map(async (locale) => {
        const headers = { "x-odm-locale": locale };
        const read = async (mechanics) => {
          const params = new URLSearchParams({ class: "fighter", q: "Echo Knight", limit: "100", bundled: "1", ...(mechanics ? { mechanics: "1" } : {}) });
          const response = await fetch("/api/content/archetypes?" + params, { headers, cache: "no-store" });
          const body = await response.json();
          const matches = body.results?.filter((row) => row.name === "Echo Knight") ?? [];
          const row = matches.find((entry) => body.packInstalled
            ? entry.source === "open5e" && entry.documentSlug === "odm-expanded"
            : entry.source === "bundled" && entry.documentSlug === "wotc-srd");
          if (!row) return { status: response.status, packInstalled: body.packInstalled, sources: matches.map((entry) => entry.documentSlug), row: null };
          const detail = await fetch("/api/content/archetypes/" + encodeURIComponent(row.slug), { headers, cache: "no-store" });
          return { status: response.status, packInstalled: body.packInstalled, row, detailStatus: detail.status, entry: (await detail.json()).entry };
        };
        return { locale, picker: await read(false), workshop: await read(true) };
      }));
      const localizedSearch = await Promise.all([["cs", "ohniva koule"], ["fr", "boule de feu"]].map(async ([locale, q]) => {
        const params = new URLSearchParams({ q, mechanics: "1", book: "1", limit: "50", class: "wizard", level: "3", exact: "1" });
        const response = await fetch("/api/content/spells?" + params, { headers: { "x-odm-locale": locale }, cache: "no-store" });
        const body = await response.json();
        return { locale, status: response.status, found: body.results?.some((row) => row.name === "Fireball" && row.level === 3) ?? false };
      }));
      return { lists, authoredFeats, bundledDetails, archetypePicker, authoredArchetypes, localizedSearch, fr: await ask("fr-FR,fr;q=0.9"), en: await ask("en-US,en;q=0.9"), cs, forcedCs,
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
    for (const result of asked.localizedSearch) check(result.status === 200 && result.found, result.locale + " localized search finds canonical Fireball");
    for (const { kind, rows } of asked.lists) {
      const [en, ...localized] = rows;
      check(en.status === 200 && en.detailStatus === 200 && Boolean(en.row), kind + " has a canonical list and detail");
      for (const result of localized) {
        check(result.status === 200 && result.detailStatus === 200 && Boolean(result.row), kind + " has a localized list and detail");
        const { localized_desc: display, ...original } = result.row.data;
        const { localized_desc: detailDisplay, ...detailOriginal } = result.detail.data;
        check(typeof display === "string" && display.length > 0 && display === detailDisplay, kind + " has the same localized description in list and detail");
        check(JSON.stringify({ ...result.row, data: original }) === JSON.stringify(en.row), kind + " list preserves all canonical and mechanical fields");
        check(JSON.stringify({ ...result.detail, data: detailOriginal }) === JSON.stringify(en.detail), kind + " detail preserves all canonical fields");
        check(/accept-language/i.test(result.vary ?? "") && /x-odm-locale/i.test(result.vary ?? ""), kind + " list varies by the requested language");
      }
    }
    for (const result of asked.bundledDetails) {
      if (result.packInstalled) continue; // published entries retain precedence
      check(Boolean(result.row) && result.status === 200, result.kind + " bundled list entry has a detail");
      check(result.entry?.slug === result.row.slug && result.entry?.name === result.row.name, result.kind + " bundled detail preserves identity");
      check(result.entry?.data?.localized_desc === result.row.data?.localized_desc, result.kind + " bundled list and detail agree on display prose");
    }
    for (const result of asked.archetypePicker) {
      if (result.packInstalled) continue;
      check(result.status === 200 && Boolean(result.row), result.locale + " character picker receives bundled Champion without mechanics=1");
      check(!("table" in result.row), "picker display rows do not expose workshop mechanics");
      if (result.locale === "cs") check(result.row.data?.localized_desc?.includes("Šampion"), "Czech picker receives reviewed Champion prose");
      if (result.locale === "en") check(!("localized_desc" in result.row.data), "English picker retains canonical prose");
    }
    for (const result of asked.authoredFeats) {
      if (result.packInstalled && !result.row) continue; // another published feat may own the name
      check(result.status === 200 && result.detailStatus === 200 && Boolean(result.row), result.locale + " authored feat list and detail");
      check(result.entry?.slug === result.row.slug && result.entry?.data?.desc === result.row.data?.desc, "authored feat preserves identity and rules");
      if (result.locale === "cs") {
        check(result.row.data?.localized_desc?.includes("iniciativu"), "Czech authored Alert has localized rules");
        check(result.entry?.data?.localized_desc === result.row.data?.localized_desc, "Czech authored feat list and detail agree");
      } else check(!("localized_desc" in result.row.data), result.locale + " authored feat retains original rules");
    }
    // A pack is optional in CI. With a pack, a different published row may
    // own the name; report that case instead of claiming authored coverage.
    const [english, ...translated] = asked.authoredArchetypes;
    for (const { locale, picker, workshop } of asked.authoredArchetypes) {
      for (const result of [picker, workshop]) {
        check(result.status === 200, locale + " authored archetype list answers");
        if (!result.row && result.packInstalled && result.sources?.some((source) => source !== "odm-expanded")) {
          console.log(locale + " Echo Knight authored source not selected: " + result.sources.join(", "));
          continue;
        }
        check(Boolean(result.row) && result.detailStatus === 200, locale + " authored archetype list and detail");
        check(result.entry?.slug === result.row.slug && result.entry?.name === result.row.name, locale + " authored archetype detail preserves identity");
        check(result.entry?.data?.localized_desc === result.row.data?.localized_desc, locale + " authored archetype list and detail agree on display prose");
        if (locale === "cs") {
          check(result.row.data?.localized_desc?.includes("Zhmotnění ozvěny"), "Czech authored archetype includes the reviewed feature heading");
          check(result.row.data?.localized_desc?.includes("TZ 14 + tvůj zdatnostní bonus"), "Czech authored archetype includes reviewed feature rules");
        }
      }
      if (picker.row && workshop.row) {
        check(!("table" in picker.row), locale + " authored picker omits workshop mechanics");
        check(Boolean(workshop.row.table?.levels), locale + " authored workshop carries canonical mechanics");
        check(picker.row.data?.localized_desc === workshop.row.data?.localized_desc, locale + " authored picker and workshop agree on display prose");
      }
    }
    const canonicalRow = (row) => {
      const { localized_desc: _display, ...data } = row.data;
      return { ...row, data };
    };
    for (const { locale, picker, workshop } of translated) {
      for (const [base, localized] of [[english.picker, picker], [english.workshop, workshop]]) {
        if (!base.row || !localized.row) continue;
        check(JSON.stringify(canonicalRow(localized.row)) === JSON.stringify(canonicalRow(base.row)), locale + " authored archetype list preserves all canonical fields");
        check(JSON.stringify(canonicalRow(localized.entry)) === JSON.stringify(canonicalRow(base.entry)), locale + " authored archetype detail preserves all canonical fields");
      }
    }
    const { csDetail, enDetail } = asked;
    check(csDetail.status === 200 && enDetail.status === 200, "the bundled spell detail works in both locales");
    const { localized_desc, ...original } = csDetail.entry.data;
    check(typeof localized_desc === "string" && localized_desc.length > 0, "the Czech spell detail has localized prose");
    check(csDetail.entry.slug === enDetail.entry.slug && JSON.stringify(original) === JSON.stringify(enDetail.entry.data), "the localized spell detail preserves the English mechanical fields and identity");
  },
};
