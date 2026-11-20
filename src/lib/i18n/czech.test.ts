import { describe, expect, it } from "vitest";
import { calculatorDisplayText } from "../reference/calculator-display";
import { APPEARANCE_THEMES } from "../appearance-themes";
import { SHELF_TOUR, HUB_TOUR, SYSTEM_TOURS } from "../tours/workshop";
import { PLAYER_TOUR, FIRST_TURN_TOUR, DM_TOUR } from "../tours/table";
import catalog from "./cs.json";
import { installCatalog, translate, translatePlural } from "./translate";
import { localeFromAcceptLanguage, localeOfServerLanguage, parseLocale, resolveLocale } from "./locale";
import { localeTag, pluralCategory } from "../messages-logic";
import { CS_NAMES_BY_TABLE } from "../content/names-cs";
import { RESOURCE_CS_GUIDANCE } from "../srd/class-resources-cs-data";
import { resourceDisplayName, resourceGuidance } from "../srd/class-resources-fr";
import { resourceName } from "../srd/class-resources";
import { RESOURCE_CS_EXTRA_NAMES } from "../srd/resource-names-cs-extra";
import { RESOURCE_CS_FEATURE_NAME_LOOKUP } from "../srd/resource-feature-names-cs";
import authoredResources from "../srd/authored-resources.json";
import genreResources from "../classes/resources.json";
import { FR_NAMES_BY_TABLE } from "../content/names-fr";
import { installCsTables } from "./cs-tables";
import { contentName, classFeatureName, speciesTraitName, subclassName } from "../content/names";
import { damageTypeWord, damageWords } from "../dm/damage-logic";
import { deviceSpeechLanguage, whisperLanguageCode } from "../stt-logic";


installCatalog("cs", catalog);
installCsTables({ names: CS_NAMES_BY_TABLE, guidance: RESOURCE_CS_GUIDANCE });

describe("Czech localization", () => {
  it("translates resource counter names and help without changing the rule engine's English ids", () => {
    expect(resourceName("lay_on_hands")).toBe("Lay on Hands (HP pool)");
    expect(resourceName("divine_sense")).toBe("Divine Sense");
    expect(resourceName("race_healing_hands")).toBe("Healing Hands");

    expect(resourceDisplayName("lay_on_hands", "cs")).toBe("Vkládání rukou (zásoba životů)");
    expect(resourceDisplayName("divine_sense", "cs")).toBe("Božský smysl");
    expect(resourceDisplayName("race_healing_hands", "cs")).toBe("Léčivé ruce");
    expect(resourceGuidance("race_healing_hands", "cs")).toContain("aasimar");
    expect(resourceGuidance("lay_on_hands", "cs")).toContain("životů");
    expect(resourceDisplayName("lay_on_hands", "en")).toBeNull();
    expect(resourceGuidance("race_healing_hands", "en")).toBeNull();
    expect(resourceDisplayName("unknown_resource", "cs")).toBeNull();
    expect(Object.keys(CS_NAMES_BY_TABLE.resources).length).toBeGreaterThanOrEqual(35);
  });

  it("translates every authored and thematic ability counter, with known-class feature name fallback", () => {
    const all = [...authoredResources.resources, ...genreResources.resources];
    expect(all).toHaveLength(418);
    expect(Object.keys(RESOURCE_CS_EXTRA_NAMES)).toHaveLength(418);
    for (const resource of all) {
      const shown = resourceDisplayName(resource.id, "cs");
      expect(shown, `Missing Czech resource name: ${resource.id}`).toBeTruthy();
      expect(shown, `Untranslated resource name: ${resource.id}`).not.toBe(resource.displayName);
    }
    expect(Object.keys(RESOURCE_CS_FEATURE_NAME_LOOKUP).length).toBe(417);
    expect(classFeatureName("street_samurai", "Bullet Time", "cs")).toBe("Zpomalený čas");
    expect(classFeatureName("warlock", "Healing Light", "cs")).toBe("Léčivé světlo");
    expect(speciesTraitName("aasimar", "Healing Hands", "cs")).toBe("Léčivé ruce");
    expect(speciesTraitName("homebrew-custom", "Healing Hands", "cs")).toBe("Healing Hands");
    expect(classFeatureName("homebrew:my-class", "Bullet Time", "cs")).toBe("Bullet Time");
    expect(classFeatureName("street_samurai", "Bullet Time", "en")).toBe("Bullet Time");
  });

  it("selects Czech in settings and HTTP requests", () => {
    expect(parseLocale("cs")).toBe("cs");
    expect(localeOfServerLanguage("czech")).toBe("cs");
    expect(localeFromAcceptLanguage("cs-CZ,fr;q=0.9,en;q=0.5")).toBe("cs");
    expect(resolveLocale({ cookieHeader: "odm_locale=cs" })).toBe("cs");
    expect(localeTag("cs")).toBe("cs-CZ");
  });

  it("translates text with variables and preserves English fallback", () => {
    expect(translate("cs", "Log in")).toBe("Přihlásit se");
    expect(translate("cs", "Signed in as {name}", { name: "Jana" })).toBe("Přihlášen(a) jako Jana");
    expect(translate("cs", "Unknown source phrase")).toBe("Unknown source phrase");
    expect(translate("fr", "Unknown source phrase")).toBe("Unknown source phrase");
  });

  it("translates server-language administration and accessible loading labels", () => {
    expect(translate("cs", "The language your tables play in")).toContain("Jazyk");
    expect(translate("cs", "Loading the table")).toBe("Načítání herního stolu");
    expect(translate("cs", "Turn on these settings to continue.")).toBe("Zapni tato nastavení a pokračuj.");
    expect(
      translate("cs", "Memory search reads with {model}, which reads every table language.", { model: "e5" }),
    ).toBe("Vyhledávání v paměti používá model e5, který rozumí všem jazykům herních stolů.");
  });

  it("translates appearance themes and About status without changing the stored source names", () => {
    for (const theme of APPEARANCE_THEMES) {
      expect(translate("cs", theme.name, { context: "appearance.theme" })).not.toBe(theme.name);
      expect(translate("cs", theme.description)).not.toBe(theme.description);
      expect(translate("en", theme.name)).toBe(theme.name);
    }
    expect(translate("cs", "Light", { context: "appearance.brightness" })).toBe("Světlý");
    expect(translate("cs", "Dark", { context: "appearance.brightness" })).toBe("Tmavý");
    expect(translate("cs", "Dark")).toBe("Tma");
    expect(translate("cs", "Using {theme} · {choice}.", { theme: "Prastarý hvozd", choice: "vlastní volba" }))
      .toBe("Používá se motiv Prastarý hvozd · vlastní volba.");
    expect(translate("cs", "Could not reach GitHub to look for a newer release.")).toContain("GitHubem");
    expect(translate("cs", "Changes since the {tag} release: {count}.", { tag: "v1", count: 4 }))
      .toBe("Počet změn od vydání v1: 4.");
  });

  it("localizes computed calculator results without altering the rule engine's English output", () => {
    const cs = (key: string, vars?: Record<string, string | number>) => translate("cs", key, vars);
    const en = (key: string, vars?: Record<string, string | number>) => translate("en", key, vars);
    expect(calculatorDisplayText("2 monsters against 4 players", cs))
      .toBe("Nestvůry: 2, hráči: 4");
    expect(calculatorDisplayText("300 gp on average", cs)).toBe("Průměrně 300 zl.");
    expect(calculatorDisplayText("1 day", cs)).toBe("1 den");
    expect(calculatorDisplayText("3 days", cs)).toBe("3 dny");
    expect(calculatorDisplayText("5 days", cs)).toBe("5 dnů");
    expect(calculatorDisplayText("19 miles in a full 8-hour day", cs))
      .toBe("Za celý osmihodinový den 19 mil");
    expect(calculatorDisplayText("CR 3", cs)).toBe("NB 3");
    expect(calculatorDisplayText("A large body carries x2 what a Medium one does.", cs))
      .toBe("Postava velikosti velká unese 2× tolik co středně velká postava.");
    expect(calculatorDisplayText("An unfamiliar pack-specific result", cs))
      .toBe("An unfamiliar pack-specific result");
    expect(calculatorDisplayText("2 monsters against 4 players", en))
      .toBe("2 monsters against 4 players");
  });

  it("localizes the campaign editor and the complete workshop shelf and hub tours", () => {
    expect(translate("cs", "Edit campaign")).toBe("Upravit kampaň");
    expect(translate("cs", "The story")).toBe("Příběh");
    expect(translate("cs", "The table", { context: "campaign.edit.table" })).toBe("Herní stůl");
    expect(translate("cs", "Paint one", { context: "campaign.cover.paint" })).toBe("Vytvořit obrázek");
    for (const step of [...SHELF_TOUR, ...HUB_TOUR]) {
      expect(translate("cs", step.title), step.title).not.toBe(step.title);
      expect(translate("cs", step.body), step.id).not.toBe(step.body);
      expect(translate("en", step.title)).toBe(step.title);
    }
    expect(translate("cs", "The workshop shelf")).toBe("Polička dílny");
  });

  it("covers all 88 table tour headings and explanations in Czech", () => {
    const entries = [...PLAYER_TOUR, ...FIRST_TURN_TOUR, ...DM_TOUR]
      .flatMap((step) => [step.title, step.body]);
    expect(entries).toHaveLength(88);
    expect(entries.filter((entry) => translate("cs", entry) !== entry)).toHaveLength(88);
    expect(translate("cs", "Welcome to the table")).toBe("Vítej u herního stolu");
    expect(translate("cs", "Take your turn")).toBe("Odehraj svůj tah");
    expect(translate("cs", "Write down what happened")).toBe("Zaznamenej, co se stalo");
    expect(translate("en", "Welcome to the table")).toBe("Welcome to the table");
  });

  it("localizes all workshop tool tour headings and explanations", () => {
    for (const step of Object.values(SYSTEM_TOURS).flat()) {
      expect(translate("cs", step.title), step.title).not.toBe(step.title);
      expect(translate("cs", step.body), step.id).not.toBe(step.body);
      expect(translate("en", step.title)).toBe(step.title);
      expect(translate("en", step.body)).toBe(step.body);
    }
    expect(translate("cs", "The world's history")).toBe("Historie světa");
    expect(translate("cs", "What the board is missing")).toBe("Co v plánu chybí");
    expect(translate("cs", "The pregens")).toBe("Předpřipravené postavy");
    expect(translate("cs", "Saved rulesets")).toBe("Uložené sady pravidel");
    expect(translate("cs", "Download or compile")).toBe("Stáhnout nebo sestavit");
  });

  it("uses three Czech plural forms", () => {
    const singular = "{count} player";
    const plural = "{count} players";
    expect(translatePlural("cs", singular, plural, { count: 1 })).toBe("1 hráč");
    expect(translatePlural("cs", singular, plural, { count: 3 })).toBe("3 hráči");
    expect(translatePlural("cs", singular, plural, { count: 5 })).toBe("5 hráčů");
    expect(translatePlural("cs", singular, plural, { count: 0 })).toBe("0 hráčů");
    expect(pluralCategory("cs", 4)).toBe("few");
  });
  it("supports Czech speech recognition language hints", () => {
    expect(whisperLanguageCode("czech")).toBe("cs");
    expect(deviceSpeechLanguage("czech")).toBe("cs");
    expect(whisperLanguageCode("english")).toBe("en");
  });

  it("translates display-only damage words without changing English or French", () => {
    expect(damageTypeWord("fire", "cs")).toBe("Ohnivé");
    expect(damageTypeWord("slashing", "cs")).toBe("Sečné");
    expect(damageWords("1d6 fire + 2d8 slashing", "cs")).toBe("1d6 ohnivé + 2d8 sečné");
    expect(damageWords("1d6 fire", "en")).toBe("1d6 fire");
    expect(damageTypeWord("fire", "fr")).toBe("Feu");
  });

  it("covers every reference SRD name without changing stored source IDs", () => {
    for (const [category, names] of Object.entries(FR_NAMES_BY_TABLE)) {
      const czech = CS_NAMES_BY_TABLE[category] ?? {};
      const missing = Object.keys(names).filter((key) => !czech[key]?.trim());
      expect(missing, "Missing Czech names in " + category).toEqual([]);
    }
    expect(contentName("spells", { slug: "fireball", name: "Fireball" }, "cs")).toBe("Ohnivá koule");
    expect(contentName("monsters", { slug: "goblin", name: "Goblin" }, "cs")).toBe("Goblin");
    expect(classFeatureName("fighter", "Second Wind", "cs")).toBe("Druhý dech");
    expect(subclassName("cleric", "Life Domain", "cs")).toBe("Doména života");
    expect(contentName("spells", "Unknown Spell", "cs")).toBe("Unknown Spell");
  });
});
