// Planning an import from a workshop into a campaign. The interesting part
// is not the copying, it is what a copy is CALLED when the target already
// has something by that name: locations carry a UNIQUE (campaign_id, name
// COLLATE NOCASE) constraint, so a collision there fails the transaction
// rather than looking untidy. See docs/workshop-plan.md phase 3.
import assert from "node:assert/strict";
import { register } from "node:module";

register("./lib/register-alias.mjs", import.meta.url);

const {
  IMPORT_KINDS,
  IMPORT_KIND_LABELS,
  SINGULAR_KINDS,
  dedupeName,
  emptyExisting,
  emptySource,
  keepsOverworldAnchors,
  planImport,
  planSummary,
} = await import("../src/lib/workshop/import.ts");
const { textKey } = await import("../src/lib/language/text-logic.ts");

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
}

const named = (...names) => names.map((name, index) => ({ id: `id-${index}`, name }));

function scenario({ selection, source = {}, existing = {}, targetHasHouseRules = false }) {
  return planImport({
    selection,
    source: { ...emptySource(), ...source },
    existing: { ...emptyExisting(), ...existing },
    targetHasHouseRules,
  });
}

// ---- every kind has somewhere to land ----

test("every import kind has a label", () => {
  // The plan's own rule: a kind is only allowed if it already has a
  // campaign-side row to become, and a person has to be able to read it.
  for (const kind of IMPORT_KINDS) {
    assert.ok(IMPORT_KIND_LABELS[kind], `${kind} has no label`);
  }
});

test("the singular kinds are the ones that replace rather than add", () => {
  assert.ok(SINGULAR_KINDS.has("overworld"));
  assert.ok(SINGULAR_KINDS.has("houseRules"));
  assert.ok(!SINGULAR_KINDS.has("lore"));
});

// ---- name collisions ----

test("a free name is taken as-is", () => {
  const taken = new Set();
  assert.equal(dedupeName("Rusted Anchor Inn", taken), "Rusted Anchor Inn");
});

test("a colliding name is numbered, not rejected", () => {
  const taken = new Set(["rusted anchor inn"]);
  assert.equal(dedupeName("Rusted Anchor Inn", taken), "Rusted Anchor Inn (2)");
});

test("numbering keeps climbing past an existing numbered copy", () => {
  const taken = new Set(["Inn", "Inn (2)"].map(textKey));
  assert.equal(dedupeName("Inn", taken), "Inn (3)");
});

test("collisions are case-insensitive, because the constraint is", () => {
  // "rusted anchor inn" and "Rusted Anchor Inn" cannot both live in
  // locations, so the planner must not think they are different.
  const taken = new Set(["rusted anchor inn"]);
  assert.equal(dedupeName("RUSTED ANCHOR INN", taken), "RUSTED ANCHOR INN (2)");
});

test("two workshop rows differing only in case cannot both land", () => {
  const taken = new Set();
  assert.equal(dedupeName("Inn", taken), "Inn");
  assert.equal(dedupeName("inn", taken), "inn (2)");
});

test("a blank name becomes Untitled rather than an empty row", () => {
  const taken = new Set();
  assert.equal(dedupeName("   ", taken), "Untitled");
  assert.equal(dedupeName("", taken), "Untitled (2)");
});

test("names are trimmed before comparison", () => {
  const taken = new Set(["inn"]);
  assert.equal(dedupeName("  Inn  ", taken), "Inn (2)");
});

// ---- planning ----

test("selecting nothing plans nothing", () => {
  const plan = scenario({ selection: [] });
  assert.equal(plan.empty, true);
  assert.deepEqual(plan.items, []);
});

test("selecting a kind the workshop has none of plans nothing for it", () => {
  const plan = scenario({ selection: ["lore"], source: { lore: [] } });
  assert.equal(plan.empty, true);
  assert.equal(plan.counts.lore, 0);
});

test("an unselected kind is not copied even when the workshop has it", () => {
  const plan = scenario({
    selection: ["lore"],
    source: { lore: named("The Sundering"), tables: named("Rumours") },
  });
  assert.equal(plan.counts.tables, 0);
  assert.ok(plan.items.every((item) => item.kind === "lore"));
});

test("a clean import renames nothing and warns about nothing", () => {
  const plan = scenario({
    selection: ["lore", "tables"],
    source: { lore: named("The Sundering"), tables: named("Rumours") },
  });
  assert.equal(plan.items.length, 2);
  assert.ok(plan.items.every((item) => !item.renamed));
  assert.deepEqual(plan.warnings, []);
});

test("a roster naming a homebrew slug earns exactly one warning", () => {
  const plan = scenario({
    selection: ["encounters"],
    source: {
      encounters: [
        { id: "e1", name: "Ambush", monsters: ["homebrew:abc", "goblin"] },
        { id: "e2", name: "Patrol", monsters: ["goblin", "wolf"] },
      ],
    },
  });
  const homebrewWarnings = plan.warnings.filter((warning) => /hand-built/i.test(warning.message));
  assert.equal(homebrewWarnings.length, 1);
  assert.equal(homebrewWarnings[0].kind, "encounters");
  assert.match(homebrewWarnings[0].message, /1 prepared encounter names/);
});

test("SRD-only rosters and rows without monster refs warn about nothing", () => {
  const srdOnly = scenario({
    selection: ["encounters"],
    source: { encounters: [{ id: "e1", name: "Patrol", monsters: ["goblin"] }] },
  });
  assert.deepEqual(srdOnly.warnings, []);
  const noRefs = scenario({
    selection: ["encounters"],
    source: { encounters: named("Patrol") },
  });
  assert.deepEqual(noRefs.warnings, []);
});

test("colliding rows are renamed and the collision is reported once per kind", () => {
  const plan = scenario({
    selection: ["locations"],
    source: { locations: named("Saltmarch", "Deepfen") },
    existing: { locations: ["Saltmarch"] },
  });
  const saltmarch = plan.items.find((item) => item.name === "Saltmarch");
  assert.equal(saltmarch.finalName, "Saltmarch (2)");
  assert.equal(saltmarch.renamed, true);
  const deepfen = plan.items.find((item) => item.name === "Deepfen");
  assert.equal(deepfen.renamed, false);
  assert.equal(plan.warnings.filter((warning) => warning.kind === "locations").length, 1);
  assert.match(plan.warnings[0].message, /1 places entry already exist/i);
});

test("collisions within one import are resolved against each other too", () => {
  const plan = scenario({
    selection: ["locations"],
    source: { locations: named("Inn", "Inn", "Inn") },
  });
  assert.deepEqual(
    plan.items.map((item) => item.finalName),
    ["Inn", "Inn (2)", "Inn (3)"],
  );
});

test("each kind has its own namespace, so a lore title never bumps a place", () => {
  const plan = scenario({
    selection: ["lore", "locations"],
    source: { lore: named("Saltmarch"), locations: named("Saltmarch") },
    existing: { lore: ["Saltmarch"] },
  });
  const lore = plan.items.find((item) => item.kind === "lore");
  const place = plan.items.find((item) => item.kind === "locations");
  assert.equal(lore.finalName, "Saltmarch (2)");
  assert.equal(place.finalName, "Saltmarch");
});

// ---- the singular kinds ----

test("importing a region map onto a campaign that has one warns that it replaces", () => {
  const plan = scenario({
    selection: ["overworld"],
    source: { overworld: named("Region map") },
    existing: { overworld: ["Region map"] },
  });
  assert.equal(plan.counts.overworld, 1);
  assert.match(plan.warnings[0].message, /replaces it/i);
});

test("importing a region map onto a campaign without one is silent", () => {
  const plan = scenario({
    selection: ["overworld"],
    source: { overworld: named("Region map") },
  });
  assert.deepEqual(plan.warnings, []);
});

test("house rules over existing house rules warns before it overwrites", () => {
  const plan = scenario({
    selection: ["houseRules"],
    source: { houseRules: named("House rules") },
    targetHasHouseRules: true,
  });
  assert.match(plan.warnings[0].message, /already has house rules/i);
});

test("house rules into an empty campaign is silent", () => {
  const plan = scenario({
    selection: ["houseRules"],
    source: { houseRules: named("House rules") },
    targetHasHouseRules: false,
  });
  assert.deepEqual(plan.warnings, []);
});

// ---- the region map and its anchors ----

test("a region map without its places warns that the markers are dropped", () => {
  const plan = scenario({
    selection: ["overworld"],
    source: { overworld: named("Region map"), locations: named("Saltmarch") },
  });
  assert.ok(
    plan.warnings.some((warning) => /without its markers/i.test(warning.message)),
    "no warning about dropped anchors",
  );
});

test("a region map with its places keeps the anchors", () => {
  assert.equal(keepsOverworldAnchors(["overworld", "locations"]), true);
  const plan = scenario({
    selection: ["overworld", "locations"],
    source: { overworld: named("Region map"), locations: named("Saltmarch") },
  });
  assert.ok(!plan.warnings.some((warning) => /without its markers/i.test(warning.message)));
});

test("anchors are dropped whenever places are not travelling", () => {
  assert.equal(keepsOverworldAnchors(["overworld"]), false);
  assert.equal(keepsOverworldAnchors(["locations"]), false);
  assert.equal(keepsOverworldAnchors([]), false);
});

test("a workshop with no places at all does not warn about markers", () => {
  // There is nothing to lose, so the warning would be noise.
  const plan = scenario({
    selection: ["overworld"],
    source: { overworld: named("Region map"), locations: [] },
  });
  assert.deepEqual(plan.warnings, []);
});

// ---- the summary a person reads ----

test("the summary counts the plural kinds and names the singular ones", () => {
  const plan = scenario({
    selection: ["lore", "overworld"],
    source: { lore: named("A", "B"), overworld: named("Region map") },
  });
  const summary = planSummary(plan);
  assert.match(summary, /2 world lore/);
  assert.match(summary, /region map/);
  assert.ok(!/1 region map/.test(summary), "a singular kind should not be counted");
});

test("an empty plan says nothing rather than rendering blank", () => {
  assert.equal(planSummary(scenario({ selection: [] })), "nothing");
});


const { importKindLabel, importWarningText, referenceImportNote, importResultNotesText } = await import("../src/lib/workshop/import-display.ts");
const { translate, installCatalog } = await import("../src/lib/i18n/translate.ts");
const fs = await import("node:fs");
const { checkProse, proseWarningParts, proseWarningLine } = await import("../src/lib/workshop/prose-check.ts");
const { summarizeCompile } = await import("../src/lib/workshop/board-compile.ts");
const importCatalogs = Object.fromEntries(["cs", "fr"].map((locale) => {
  const catalog = JSON.parse(fs.readFileSync(new URL(`../src/lib/i18n/${locale}.json`, import.meta.url), "utf8"));
  installCatalog(locale, catalog);
  return [locale, catalog];
}));

test("localized import previews preserve plan data and authored names", () => {
  const input = {
    selection: ["world", "shops", "tables", "houseRules", "overworld"],
    exclude: ["locations"],
    source: {
      ...emptySource(),
      world: named("WorldForge"), locations: named("Rusted Anchor Inn"),
      lore: named("Old legend"), npcs: named("Captain"), factions: named("Guild"),
      maps: named("Map"), encounters: named("Fight"),
      shops: [{ id: "shop", name: "Shop", placeId: "id-0", keeperId: "missing", lines: 3 }],
      tables: named("Table"), houseRules: named("House rules"), overworld: named("Region map"),
    },
    existing: { ...emptyExisting(), shops: ["Shop"], overworld: ["Region map"] },
    targetHasHouseRules: true,
    worldFacts: { locations: { entries: 1, links: 2, pins: 3, secrets: 4, events: 5 } },
    worldBound: { maps: 2, encounters: 3 },
    foreignItems: ["Rusted Anchor", "Rusted Anchor"],
    foreignMonsters: ["Frost Wyrm"],
    tableRowsLeft: 2,
  };
  const prose = "The door opens.The captain waits.The room is dark.";
  const warnings = checkProse(prose);
  const board = {
    links: { npcs: ["missing"], maps: ["id-0"], encounters: ["id-0"], locations: ["id-0"] },
    common: null, beats: ["A", "B"], moments: 3,
    arcProblem: "",
    beatTitles: ["A", "B"], momentTitles: ["Custom scene A", "Custom scene B", "Custom scene C"],
    proseNotes: [{ title: "Original title", message: proseWarningLine(warnings), parts: proseWarningParts(warnings, prose) }],
  };
  const plans = [
    planImport(input),
    planImport({ ...input, selection: ["storyboard"], source: { ...input.source, storyboard: named("Board") }, board,
      targetArc: { beats: ["A"], acts: 1, room: 1, actRoom: true, eventRoom: 0 }, arcMode: "append" }),
    planImport({ ...input, selection: ["storyboard"], source: { ...input.source, storyboard: named("Board") },
      board: { ...board, arcProblem: "Original refusal", arcProblemDisplay: { key: "An arc needs at least {min} things that happen; the board has {count}.", vars: { min: 2, count: 1 } } } }),
    planImport({ ...input, selection: ["shops"], alreadyHere: { shops: ["shop"] }, again: "skip" }),
    planImport({ ...input, selection: ["shops"], alreadyHere: { shops: ["shop"] }, again: "copy" }),
  ];
  for (const plan of plans) {
    const snapshot = structuredClone(plan);
    for (const warning of [...plan.warnings, ...plan.notes]) {
      assert.ok(warning.display, warning.message);
      assert.equal(importWarningText(warning, (key, vars) => translate("en", key, vars), "en"), warning.message);
      for (const locale of ["cs", "fr"]) {
        assert.ok(importCatalogs[locale].contexts[warning.display.key]?.["workshop.import.plan"], warning.display.key);
        const t = (key, vars) => translate(locale, key, vars);
        const text = importWarningText(warning, t, locale);
        assert.notEqual(text, warning.message, warning.display.key);
        assert.doesNotMatch(text, /\{(?:count|kind|kinds|losses|cards|detail|names|room|limit|total|act|previous|lines|title|copied|reused)\}/);
      }
    }
    assert.deepEqual(plan, snapshot);
  }
  const cs = (key, vars) => translate("cs", key, vars);
  const messages = plans.flatMap((plan) => [...plan.warnings, ...plan.notes]).map((warning) => importWarningText(warning, cs, "cs"));
  assert.ok(messages.some((line) => line.includes("Rusted Anchor")));
  assert.ok(messages.some((line) => line.includes("Frost Wyrm")));
  assert.ok(messages.some((line) => line.includes("Original title") && line.includes("mezera po větě")));
  assert.ok(messages.some((line) => line.includes("Custom scene A")));
  assert.ok(messages.some((line) => line.includes("scénář jich má 1")));
  assert.ok(messages.some((line) => line.includes("Mapové značky: 3")));
  for (const kind of IMPORT_KINDS) {
    assert.ok(importCatalogs.cs.contexts[IMPORT_KIND_LABELS[kind]]?.["workshop.import.kind"]);
    assert.ok(importCatalogs.fr.contexts[IMPORT_KIND_LABELS[kind]]?.["workshop.import.kind"]);
    assert.equal(importKindLabel(kind, cs), importCatalogs.cs.contexts[IMPORT_KIND_LABELS[kind]]["workshop.import.kind"]);
  }
  const legacy = { kind: "world", message: "Unknown original message" };
  assert.equal(importWarningText(legacy, cs, "cs"), legacy.message);
  assert.equal(importWarningText({ ...legacy, display: { key: "Unregistered message" } }, cs, "cs"), legacy.message);
});

test("storyboard refusal retains the original English and supplies structured detail", () => {
  const compiled = { lore: [], quests: [], encounters: [], notes: [], moments: [], arcBeats: ["One"], premise: "World" };
  const summary = summarizeCompile(compiled, false);
  assert.equal(summary.arcRefusal, "An arc needs at least 2 things that happen; the board has 1.");
  assert.deepEqual(summary.arcRefusalDisplay, { key: "An arc needs at least {min} things that happen; the board has {count}.", vars: { min: 2, count: 1 } });
});


test("post-import references preserve the old messages and localize all six outcomes", () => {
  const table = "Table {name} (2)";
  const name = "Original {table} – Dům";
  const notes = [];
  for (const [kind, noun] of [["tables", "table"], ["npcs", "NPC"], ["lore", "lore entry"]]) {
    for (const matched of [true, false]) {
      const note = referenceImportNote(kind, table, name, matched);
      assert.equal(note.message, matched
        ? `${table}: its row for the ${noun} ${name} now names this campaign's own ${name}, since the source's stayed behind.`
        : `${table}: its row for the ${noun} ${name} names nothing here, since that ${noun} stayed behind.`);
      notes.push(note);
      for (const locale of ["cs", "fr"]) {
        assert.ok(importCatalogs[locale].contexts[note.key]?.["workshop.import.result"]);
        const [localized] = importResultNotesText([note.message], [note], (key, vars) => translate(locale, key, vars));
        assert.notEqual(localized, note.message);
        assert.ok(localized.includes(table));
        assert.equal(localized.split(name).length - 1, matched ? 2 : 1);
      }
    }
  }
  const messages = [...notes.map((note) => note.message), "Legacy message"];
  const snapshot = structuredClone(notes);
  assert.deepEqual(importResultNotesText(messages, notes, (key, vars) => translate("en", key, vars)), messages);
  for (const locale of ["cs", "fr"]) {
    const t = (key, vars) => translate(locale, key, vars);
    assert.deepEqual(importResultNotesText(messages, [], t), messages);
    assert.equal(importResultNotesText(messages, notes, t).at(-1), "Legacy message");
    const spellKey = "Spells copied into this table's Homebrew: {list}.";
    assert.ok(importCatalogs[locale].messages[spellKey]);
    assert.ok(t(spellKey, { list: name }).includes(name));
    assert.notEqual(t(spellKey, { list: name }), translate("en", spellKey, { list: name }));
  }
  assert.deepEqual(notes, snapshot);
});

console.log(`workshop import: ${passed} assertions passed.`);
