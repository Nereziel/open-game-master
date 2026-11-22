import { describe, expect, it } from "vitest";
import { calculatorDisplayText } from "../reference/calculator-display";
import { mathPartLabel, formatMathParts } from "../srd";
import { APPEARANCE_THEMES } from "../appearance-themes";
import { SHELF_TOUR, HUB_TOUR, SYSTEM_TOURS } from "../tours/workshop";
import { PLAYER_TOUR, FIRST_TURN_TOUR, DM_TOUR } from "../tours/table";
import { CZECH_WORKSHOP_GUIDE_SUMMARIES, WORKSHOP_GUIDES } from "../tours/workshop-guide";
import catalog from "./cs.json";
import { installCatalog, translate, translatePlural } from "./translate";
import { localeFromAcceptLanguage, localeOfServerLanguage, parseLocale, resolveLocale } from "./locale";
import { localeTag, pluralCategory } from "../messages-logic";
import { CS_NAMES_BY_TABLE } from "../content/names-cs";
import { RESOURCE_CS_GUIDANCE } from "../srd/class-resources-cs-data";
import { RESOURCE_CS_EXTRA_GUIDANCE } from "../srd/resource-guidance-cs-extra";
import { RESOURCE_CS_AUTHORED_GUIDANCE } from "../srd/resource-guidance-cs-authored";
import { describeFeature } from "../help";
import { BUNDLED_PERSONA, GENERAL_PERSONA } from "../backgrounds/persona-data";
import { SRD_BACKGROUNDS, skillLabel } from "../srd";
import { STANDARD_LANGUAGES } from "../content/mechanics";
import { languageLabel } from "../content/languages-cs";
import { backgroundInfoText, classInfoText } from "../../app/characters/builder/usePickerGroups";
import { CZECH_BUILDER_CLASS_RULES } from "../../app/characters/builder/classRulesCs";
import { GENRE_CLASS_CS } from "../classes/genre-class-cs";
import { GENRE_CLASS_FEATURES_CS, genreFeatureCs, genreSubclassNameCs, genreSubclassDescriptionCs } from "../classes/feature-help-cs";
import genreFeatureNames from "../classes/feature-names.json";
import { FIGHTING_STYLES_CS } from "../srd/fighting-style-cs";
import { FIGHTING_STYLES } from "../srd/feature-effects";
import { SRD_SKILLS } from "../srd";
import { knownSoFarRows } from "../../app/characters/builder/buildMath";
import { CUSTOM_BACKGROUNDS, describeBackgroundFeature } from "../backgrounds";
import { resourceDisplayName, resourceGuidance } from "../srd/class-resources-fr";
import { resourceName } from "../srd/class-resources";
import { RESOURCE_CS_EXTRA_NAMES } from "../srd/resource-names-cs-extra";
import { RESOURCE_CS_FEATURE_NAME_LOOKUP } from "../srd/resource-feature-names-cs";
import authoredResources from "../srd/authored-resources.json";
import genreResources from "../classes/resources.json";
import { FR_NAMES_BY_TABLE } from "../content/names-fr";
import { installCsTables } from "./cs-tables";
import { contentName, classFeatureName, speciesTraitName, subclassName, backgroundFeatureName, backgroundFeatureLabel } from "../content/names";
import { damageTypeWord, damageWords } from "../dm/damage-logic";
import { deviceSpeechLanguage, whisperLanguageCode } from "../stt-logic";


installCatalog("cs", catalog);
installCsTables({ names: CS_NAMES_BY_TABLE, guidance: RESOURCE_CS_GUIDANCE });

describe("Czech localization", () => {
  it("translates all 234 bundled and general personality suggestions without changing saved English strings", () => {
    const sets = [...Object.values(BUNDLED_PERSONA), GENERAL_PERSONA];
    const lines = sets.flatMap((set) => [...set.trait, ...set.ideal, ...set.bond, ...set.flaw]);
    expect(lines).toHaveLength(234);
    for (const english of lines) {
      const czech = translate("cs", english);
      expect(czech, `Missing Czech personality suggestion: ${english}`).not.toBe(english);
      expect(czech.trim().length).toBeGreaterThan(8);
      expect(czech.length).toBeLessThanOrEqual(300);
      expect(translate("en", english)).toBe(english);
    }
  });

  it("localizes all 54 bundled background feature names, descriptions and blurbs", () => {
    const rows = [...SRD_BACKGROUNDS, ...CUSTOM_BACKGROUNDS];
    expect(SRD_BACKGROUNDS).toHaveLength(18);
    expect(CUSTOM_BACKGROUNDS).toHaveLength(36);
    for (const row of rows) {
      if (!row.featureDesc || !row.blurb) {
        throw new Error(`Missing bundled background feature description or blurb: ${row.id}`);
      }
      expect(translate("cs", row.feature), `Untranslated feature name: ${row.id}`).not.toBe(row.feature);
      expect(translate("cs", row.featureDesc), `Untranslated feature rule: ${row.id}`).not.toBe(row.featureDesc);
      expect(translate("cs", row.blurb), `Untranslated background blurb: ${row.id}`).not.toBe(row.blurb);
      expect(describeBackgroundFeature(row.feature, "cs")).toBe(translate("cs", row.featureDesc));
      expect(describeBackgroundFeature(row.feature, "en")).toBe(row.featureDesc);
      expect(backgroundFeatureLabel(row.name, row.feature, "cs")).not.toBe(row.feature);
      expect(backgroundFeatureName(`${row.feature} (${row.name})`, "cs")).not.toContain(row.feature + " (");
    }
    const soldier = SRD_BACKGROUNDS.find((row) => row.id === "soldier");
    if (!soldier?.featureDesc) {
      throw new Error("Missing bundled Soldier background feature description");
    }
    expect(backgroundFeatureName("Military Rank (Soldier)", "cs")).toBe("Vojenská hodnost (Voják)");
    expect(describeFeature("fighter", "", "Military Rank (Soldier)", "cs")).toBe(translate("cs", soldier.featureDesc));
    expect(describeFeature("fighter", "", "Military Rank (Soldier)", "en")).toBe(soldier.featureDesc);
    expect(contentName("backgrounds", "Corpo Dropout", "cs")).toBe("Odpadlík korporace");
  });


  it("localizes all 18 skills and all six fighting styles without changing their stored IDs", () => {
    expect(SRD_SKILLS).toHaveLength(18);
    for (const skill of SRD_SKILLS) {
      expect(skillLabel(skill.id, "cs"), skill.id).not.toBe(skill.name);
      expect(skillLabel(skill.id, "en")).toBe(skill.name);
    }
    expect(FIGHTING_STYLES).toHaveLength(6);
    expect(Object.keys(FIGHTING_STYLES_CS)).toHaveLength(6);
    for (const style of FIGHTING_STYLES) {
      const czech = FIGHTING_STYLES_CS[style.id];
      expect(czech?.name, style.id).toBeTruthy();
      expect(czech?.name).not.toBe(style.name);
      expect(czech?.description).not.toBe(style.description);
    }
  });

  it("translates all 733 authored genre-class features and all 36 subclasses without changing English keys", () => {
    const catalog = genreFeatureNames as { classes: Record<string, {
      levels: Record<string, string[]>;
      subclass: { name: string; levels: Record<string, string[]> };
    }> };
    expect(Object.keys(catalog.classes)).toHaveLength(36);
    expect(Object.keys(GENRE_CLASS_FEATURES_CS)).toHaveLength(36);
    let count = 0;
    for (const [classId, entry] of Object.entries(catalog.classes)) {
      const sourceNames = [
        ...Object.values(entry.levels).flat(),
        ...Object.values(entry.subclass.levels).flat(),
      ];
      const translated = GENRE_CLASS_FEATURES_CS[classId];
      expect(translated, classId).toBeTruthy();
      expect(Object.keys(translated), classId).toHaveLength(sourceNames.length);
      const subclassNameCs = genreSubclassNameCs(classId, entry.subclass.name);
      expect(subclassNameCs, classId).toBeTruthy();
      expect(subclassName(classId, entry.subclass.name, "cs")).toBe(subclassNameCs);
      expect(subclassName(classId, entry.subclass.name, "en")).toBe(entry.subclass.name);
      const subclassRules = genreSubclassDescriptionCs(classId, entry.subclass.name);
      expect(subclassRules, classId).toContain("Úroveň");
      for (const english of sourceNames) {
        count++;
        const cs = genreFeatureCs(classId, english);
        expect(cs?.name, `${classId} / ${english}`).toBeTruthy();
        expect(cs?.description, `${classId} / ${english}`).toBeTruthy();
        expect(cs?.name, `${classId} / ${english}`).not.toBe(english);
        expect(classFeatureName(classId, english, "cs")).toBe(cs?.name);
        expect(classFeatureName(classId, english, "en")).toBe(english);
        expect(describeFeature(classId, entry.subclass.name, english, "cs")).toBe(cs?.description);
        expect(genreFeatureCs(classId, english)?.description).not.toMatch(/^(?:Bonus action|Reaction|When you|You can|Casts |1\/long rest)/);
      }
    }
    expect(count).toBe(733);
    expect(genreFeatureCs("grave_knight", "Deathly Pact Blade")?.name).toBe("Čepel smrtelné úmluvy");
    expect(genreFeatureCs("grave_knight", "Grave Grip")?.description).toContain("15 stop");
    expect(genreSubclassNameCs("grave_knight", "Court of the Wilted Rose")).toBe("Dvůr zvadlé růže");
    expect(genreFeatureCs("unknown_homebrew", "Rage")).toBeNull();
  });

  it("translates names and descriptions for all 36 original genre classes", () => {
    expect(Object.keys(GENRE_CLASS_CS)).toHaveLength(36);
    const grave = {
      id: "grave_knight",
      name: "Grave Knight",
      blurb: "Sworn to a power in the earth, they carry a blade that answers their call and an aura of the tomb.",
    };
    expect(contentName("classes", grave.name, "cs")).toBe("Hrobový rytíř");
    const czech = classInfoText(grave, (key) => translate("cs", key), "cs");
    expect(czech).toContain("Rytíř přísahající moci");
    expect(czech).not.toContain(grave.blurb);
    expect(classInfoText(grave, (key) => translate("en", key), "en")).toBe(grave.blurb);
    for (const [id, item] of Object.entries(GENRE_CLASS_CS)) {
      expect(item.name.length, id).toBeGreaterThan(2);
      expect(item.blurb.length, id).toBeGreaterThan(30);
    }
  });

  it("shows complete Czech class descriptions and localized known-pick sources in character details", () => {
    expect(Object.keys(CZECH_BUILDER_CLASS_RULES)).toHaveLength(12);
    const barbarian = {
      id: "barbarian",
      name: "Barbarian",
      blurb: "A fierce warrior who rages into battle, shrugging off blows that would fell anyone else.",
      desc: "In battle, you fight with primal ferocity.",
    };
    const czech = classInfoText(barbarian, (key) => translate("cs", key), "cs");
    expect(czech).toContain("Zuřivost");
    expect(czech).toContain("####");
    expect(czech).not.toContain(barbarian.desc);
    expect(classInfoText(barbarian, (key) => translate("en", key), "en")).toContain(barbarian.desc);
    const rows = knownSoFarRows({
      level: 1,
      klass: { name: "Barbarian", hitDie: 12, saves: ["str", "con"] },
      race: undefined,
      racialBonus: {},
      proficientSkills: [],
      t: (key, vars) => translate("cs", key, vars),
      locale: "cs",
    });
    expect(rows.find((row) => row.id === "hit-die")?.working).toBe("Barbar");
    expect(rows.find((row) => row.id === "save-proficiencies")?.value).toBe("Síla, Odolnost");
    expect(rows.find((row) => row.id === "save-proficiencies")?.working).toBe("Barbar");
  });

  it("shows localized bundled background details and skill labels", () => {
    const acolyte = SRD_BACKGROUNDS.find((row) => row.id === "acolyte");
    expect(acolyte?.featureDesc).toBeTruthy();
    expect(acolyte?.blurb).toBeTruthy();
    if (!acolyte?.featureDesc || !acolyte.blurb) throw new Error("Missing Acolyte source descriptions");
    const shown = backgroundInfoText(acolyte, "cs", (text: string) => translate("cs", text));
    expect(shown).toContain("Útočiště věrných");
    expect(shown).toContain("Schopnost:");
    expect(shown).not.toContain("Feature:");
    expect(shown).not.toContain(acolyte.blurb);
    expect(shown).not.toContain(acolyte.featureDesc);
    expect(skillLabel("insight", "cs")).toBe("Vhled");
    expect(skillLabel("religion", "cs")).toBe("Náboženství");
    expect(skillLabel("insight", "en")).toBe("Insight");
  });

  it("uses established Czech names for every standard D&D language without changing saved values", () => {
    expect(STANDARD_LANGUAGES).toHaveLength(20);
    for (const english of STANDARD_LANGUAGES) {
      expect(languageLabel(english, "cs"), english).not.toBe(english);
      expect(languageLabel(english, "en")).toBe(english);
      expect(languageLabel(english, "fr")).toBe(english);
    }
    expect(languageLabel("Abyssal", "cs")).toBe("Démonština");
    expect(languageLabel("Infernal", "cs")).toBe("Ďábelština");
    expect(languageLabel("Draconic", "cs")).toBe("Dračí řeč");
    expect(languageLabel("Undercommon", "cs")).toBe("Temnobecná řeč");
    expect(languageLabel("Custom Language", "cs")).toBe("Custom Language");
  });

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

  it("translates 236 thematic and 40 authored resource descriptions without altering English rules", () => {
    expect(Object.keys(RESOURCE_CS_EXTRA_GUIDANCE)).toHaveLength(236);
    expect(Object.keys(RESOURCE_CS_AUTHORED_GUIDANCE)).toHaveLength(40);
    for (const resource of genreResources.resources) {
      const shown = resourceGuidance(resource.id, "cs");
      expect(shown?.trim(), `Missing Czech help: ${resource.id}`).toBeTruthy();
      expect(shown, `Untranslated Czech help: ${resource.id}`).not.toBe(resource.guidance);
      expect(resourceGuidance(resource.id, "en")).toBeNull();
    }
    for (const resource of authoredResources.resources.slice(0, 40)) {
      expect(resourceGuidance(resource.id, "cs"), `Missing authored Czech help: ${resource.id}`).toBeTruthy();
    }
    expect(resourceGuidance("cyberpunk_bullet_time", "cs")).toContain("+3 k OČ");
    expect(resourceGuidance("sub_psionic_energy", "cs")).toContain("k6");
    expect(resourceGuidance("lay_on_hands", "cs")).toContain("životů");
    expect(resourceGuidance("sub_psionic_energy", "en")).toBeNull();
    expect(resourceGuidance("unknown_resource", "cs")).toBeNull();
    expect(describeFeature("street_samurai", "", "Bullet Time", "cs"))
      .toBe(resourceGuidance("cyberpunk_bullet_time", "cs"));
    expect(describeFeature("street_samurai", "", "Bullet Time", "en"))
      .not.toBe(resourceGuidance("cyberpunk_bullet_time", "cs"));
    expect(describeFeature("homebrew:unknown", "", "Bullet Time", "cs"))
      .not.toBe(resourceGuidance("cyberpunk_bullet_time", "cs"));
  });

  it("selects Czech in settings and HTTP requests", () => {
    expect(parseLocale("cs")).toBe("cs");
    expect(localeOfServerLanguage("czech")).toBe("cs");
    expect(localeFromAcceptLanguage("cs-CZ,fr;q=0.9,en;q=0.5")).toBe("cs");
    expect(resolveLocale({ cookieHeader: "odm_locale=cs" })).toBe("cs");
    expect(localeTag("cs")).toBe("cs-CZ");
  });

  it("uses natural Czech D&D 5e ability modifiers and consistent proficiency bonus labels", () => {
    const t = (key: string, vars?: Record<string, string | number>) => translate("cs", key, vars);
    const expected = {
      STR: "Oprava Síly",
      DEX: "Oprava Obratnosti",
      CON: "Oprava Odolnosti",
      INT: "Oprava Inteligence",
      WIS: "Oprava Moudrosti",
      CHA: "Oprava Charismatu",
    };
    for (const [abbr, label] of Object.entries(expected)) {
      expect(mathPartLabel(t, `${abbr} modifier`)).toBe(label);
    }
    expect(mathPartLabel(t, "proficiency")).toBe("zdatnostní bonus");
    expect(formatMathParts(t, [
      { label: "WIS modifier", value: 0 },
      { label: "proficiency", value: 2 },
    ], "cs")).toBe("Oprava Moudrosti: +0, zdatnostní bonus: +2");
    expect(translate("cs", "Proficiency")).toBe("Zdatnostní bonus");
    expect(translate("cs", "Proficiency bonus")).toBe("Zdatnostní bonus");
    expect(translate("cs", "proficiency bonus")).toBe("zdatnostní bonus");
    expect(translate("cs", "half proficiency")).toBe("polovina zdatnostního bonusu");
    for (const help of [
      ...Object.values(RESOURCE_CS_EXTRA_GUIDANCE),
      ...Object.values(RESOURCE_CS_AUTHORED_GUIDANCE),
    ]) {
      expect(help).not.toMatch(/odpovídá opravy|bonus za zdatnost|modifikátor/);
    }
    expect(translate("cs", "{ability} modifier", { ability: "Moudrost" })).toBe("Oprava vlastnosti: Moudrost");
    expect(translatePlural("cs", "One skill proficiency", "{count} skill proficiencies", { count: 1 })).toBe("Jedna zdatnost v dovednosti");
    expect(translatePlural("cs", "One skill proficiency", "{count} skill proficiencies", { count: 2 })).toBe("2 zdatnosti v dovednostech");
    expect(formatMathParts((key, vars) => translate("en", key, vars), [
      { label: "WIS modifier", value: 0 },
      { label: "proficiency", value: 2 },
    ], "en")).toBe("+0 WIS modifier, +2 proficiency bonus");
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

  it("provides Czech titles and summaries for every workshop help tool", () => {
    expect(WORKSHOP_GUIDES).toHaveLength(15);
    expect(Object.keys(CZECH_WORKSHOP_GUIDE_SUMMARIES)).toHaveLength(WORKSHOP_GUIDES.length);
    for (const guide of WORKSHOP_GUIDES) {
      const localized = CZECH_WORKSHOP_GUIDE_SUMMARIES[guide.id];
      expect(localized, `Missing Czech workshop help: ${guide.id}`).toBeDefined();
      expect(localized.title.trim().length).toBeGreaterThan(2);
      expect(localized.purpose.trim().length).toBeGreaterThan(20);
      expect(localized.purpose, `Untranslated workshop purpose: ${guide.id}`).not.toBe(guide.purpose);
    }
    expect(CZECH_WORKSHOP_GUIDE_SUMMARIES.storyboard.purpose).toContain("Plán dobrodružství");
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
    expect(classFeatureName("paladin", "Divine Sense", "cs")).toBe("Božský smysl");
    expect(classFeatureName("paladin", "Lay on Hands", "cs")).toBe("Vkládání rukou");
    expect(classFeatureName("paladin", "Divine Sense", "en")).toBe("Divine Sense");
    expect(classFeatureName("paladin", "Lay on Hands", "en")).toBe("Lay on Hands");
    expect(subclassName("cleric", "Life Domain", "cs")).toBe("Doména života");
    expect(contentName("spells", "Unknown Spell", "cs")).toBe("Unknown Spell");
  });
});
