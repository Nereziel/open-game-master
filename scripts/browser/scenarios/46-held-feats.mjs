// PR 381 follow-up: the save does not judge again a feat the stored
// character already held, and the builder's pickers now agree. Sable's
// Dexterity is 8 and both her feats want 13: taken off its card, each can be
// put back from the search and from "Browse every feat", the race's feat on
// the Ancestry step and the improvement's on Ability scores, and the
// edit saves. A feat she never held is still refused while she falls short.
import { check, eventually } from "../lib.mjs";

const visible = (page, root, text) =>
  page.locator(`${root}a, ${root}button`).filter({ hasText: text }).locator("visible=true");

export default {
  name: "held-feats",
  viewports: ["desktop"],
  async run(t) {
    const { page, root, ids, api, base } = t;
    const english = {
      locale: "en", edit: "Edit build", ancestry: "Ancestry", abilities: "Abilities",
      search: "Search feats (e.g. alert, tough)", browse: "Browse every feat",
      narrow: "Narrow the browsed list", all: "All feats", remove: "Remove", save: "Save changes",
      skulker: "Skulker", skulkerQuery: "Skulk", duelist: "Defensive Duelist", duelistQuery: "Defensive",
      leader: "Inspiring Leader", leaderQuery: "Inspiring",
    };
    const czech = {
      locale: "cs", edit: "Upravit postavu", ancestry: "Původ", abilities: "Vlastnosti",
      search: "Hledat odbornosti (např. Bdělý, Houževnatý)", browse: "Procházet všechny odbornosti",
      narrow: "Zúžit procházený seznam", all: "Všechny odbornosti", remove: "Odebrat", save: "Uložit změny",
      skulker: "Mistr v plížení", skulkerQuery: "mistr v plizeni", duelist: "Obranný šermíř", duelistQuery: "obranny sermir",
      leader: "Inspirující vůdce", leaderQuery: "inspirujici vudce",
    };
    // Keep the upstream English regression on both clients. The website
    // additionally exercises Czech labels and diacritic-free localized search.
    for (const words of t.app ? [english] : [english, czech]) {
      if (words.locale === "cs") {
        await t.open("/settings");
        const button = page.locator(`${root}button[aria-pressed]`).filter({ hasText: "Čeština" }).first();
        await eventually(() => button.isVisible(), { label: "the Czech language setting" });
        await t.tap(button);
        await eventually(() => page.evaluate(() => document.documentElement.lang === "cs-CZ"), { label: "Czech catalog loaded" });
      }
      await exercise(words);
    }

    async function exercise(words) {
      await t.open(`/characters/${ids.heldFeats}`);
      if (words.locale === "cs") {
        await eventually(() => page.evaluate(() => document.documentElement.lang === "cs-CZ"), { label: "the character editor retains Czech" });
      }
      await t.tap(await eventually(async () => {
        const edit = visible(page, root, new RegExp("^\\s*" + words.edit + "\\s*$"));
        return (await edit.count()) ? edit.first() : null;
      }, { label: "the Edit build button" }));
      await page.locator(`${root}[data-finish-summary]`).locator("visible=true").first().waitFor({ state: "visible", timeout: 30_000 });

      const goTo = async (label) => {
        const diamond = page.locator(`${root}button[aria-label$=": ${label}"]`).locator("visible=true").first();
        await eventually(() => diamond.count(), { label: `the ${label} step's diamond` });
        await t.tap(diamond);
        const current = page.locator(`${root}button[aria-current="step"]`).locator("visible=true").first();
        await eventually(async () => (await current.getAttribute("aria-label"))?.endsWith(`: ${label}`), { label: `on the ${label} step` });
      };
      const searched = async (scope, query, name) => {
        await scope.getByPlaceholder(words.search).fill(query);
        const row = scope.locator("li button").filter({ hasText: name }).locator("visible=true").first();
        await eventually(() => row.count(), { label: `${name} in the search` });
        return row;
      };
      const browsed = async (scope, query, name) => {
        await t.tap(scope.getByRole("button", { name: words.browse }).first());
        await scope.getByLabel(words.narrow).fill(query);
        // The list's one section opens when pressed, as its other rows do.
        const section = scope.getByRole("button", { name: words.all }).locator("visible=true").first();
        await eventually(() => section.count(), { label: "the All feats section" });
        if ((await section.getAttribute("aria-expanded")) !== "true") await t.tap(section);
        const row = scope.locator("li button").filter({ hasText: name }).locator("visible=true").first();
        await eventually(() => row.count(), { label: `${name} in the browsed list` });
        return row;
      };
      // Off its card (where a feat never held is still refused), back from
      // the search, off again, back from the list.
      const putBack = async (scope, name, query, never, neverQuery) => {
        const remove = scope.getByRole("button", { name: `${words.remove} ${name}` });
        await eventually(() => remove.count(), { label: `${name} on its card` });
        await t.tap(remove.first());
        await refused(scope, never, neverQuery);
        const fromSearch = await searched(scope, query, name);
        check((await fromSearch.getAttribute("aria-disabled")) === null, `${name}, held, is offered again in the search`);
        await t.tap(fromSearch);
        await eventually(() => remove.count(), { label: `${name} back on its card from the search` });
        await t.tap(remove.first());
        const fromList = await browsed(scope, query, name);
        check((await fromList.getAttribute("aria-disabled")) === null, `${name}, held, is offered again in the browsed list`);
        await t.tap(fromList);
        await eventually(() => remove.count(), { label: `${name} back on its card from the list` });
      };
      const refused = async (scope, name, query) => {
        const row = await searched(scope, query, name);
        check((await row.getAttribute("aria-disabled")) === "true", `${name}, never held, is still refused`);
        await scope.getByPlaceholder(words.search).fill("");
      };

      // The race's feat.
      await goTo(words.ancestry);
      const racial = page.locator(`${root}[data-builder-target="racialFeat"]`).locator("visible=true").first();
      await racial.scrollIntoViewIfNeeded();
      await putBack(racial, words.skulker, words.skulkerQuery, words.leader, words.leaderQuery);
      await t.shot("racial-feat-" + words.locale);

      // The improvement's feat.
      await goTo(words.abilities);
      const improvement = page.locator(root ? root.trim() : "body").first();
      await putBack(improvement, words.duelist, words.duelistQuery, words.leader, words.leaderQuery);
      await t.shot("improvement-feat-" + words.locale);

      if (words.locale === "cs") {
        const info = improvement.getByRole("button", { name: "Co je Obranný šermíř?" }).locator("visible=true").first();
        await eventually(() => info.isVisible(), { label: "the localized feat info button" });
        await t.tap(info);
        const dialog = page.getByRole("dialog").filter({ hasText: words.duelist }).first();
        await eventually(() => dialog.getByText(/Předpoklad: Obratnost 13 nebo vyšší/).count(), { label: "the Czech feat prerequisite" });
        await eventually(() => dialog.getByText(/zdatnostní bonus k TZ/).count(), { label: "the Czech feat rules" });
        await page.keyboard.press("Escape");
        await eventually(async () => !(await dialog.isVisible()), { label: "the feat detail closes" });
      }

      // The edit saves, both feats kept and the scores as they were.
      const save = visible(page, root, new RegExp("^" + words.save + "$"));
      await eventually(async () => (await save.count()) > 0 && (await save.first().isEnabled()), { label: "Save changes" });
      await t.tap(save.first());
      await eventually(async () => {
        const response = await api.get(`${base}/api/characters/${ids.heldFeats}`);
        const sheet = (await response.json()).character?.sheet;
        return sheet && sheet.feats.includes("Skulker") && sheet.feats.includes("Defensive Duelist") && sheet.abilities.dex === 8 && (await t.url()).pathname.includes(`/characters/${ids.heldFeats}`) && !(await page.url()).includes("/edit");
      }, { timeoutMs: 30_000, label: words.locale + " edit saved with both canonical feats" });
    }
  },
};
