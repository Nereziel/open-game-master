// The ⓘ item card folds every row sharing an item's name, plus the bundled
// SRD tables, into one sheet (src/lib/help/item-sheet.ts). Guards that
// weight and value surface, that armour and weapons get their stats, that
// genre gear the pack lacks still gets a card, and that prose rides along.
import assert from "node:assert/strict";
import { register } from "node:module";

register("./lib/register-alias.mjs", import.meta.url);

const { buildItemSheet } = await import("../src/lib/help/item-sheet.ts");

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

// Rows as the Open5e pack stores them.
const longsword = {
  name: "Longsword",
  category: "Martial Melee Weapons",
  cost: "15 gp",
  damage_dice: "1d8",
  damage_type: "slashing",
  weight: "3 lb.",
  properties: ["versatile (1d10)"],
};
const plate = {
  name: "Plate",
  category: "Heavy Armor",
  base_ac: 18,
  plus_dex_mod: false,
  plus_max: 0,
  plus_flat_mod: 0,
  ac_string: "18",
  strength_requirement: 15,
  cost: "1500 gp",
  weight: "",
  stealth_disadvantage: true,
};
const shieldV1 = {
  name: "Shield",
  category: "Shield",
  base_ac: 0,
  plus_dex_mod: false,
  plus_flat_mod: 2,
  ac_string: "0 +2",
  strength_requirement: null,
  cost: "10 gp",
  weight: "",
  stealth_disadvantage: false,
};
const shieldV2 = {
  name: "Shield",
  desc: "A shield is made from wood or metal and is carried in one hand.",
  category: { name: "Shield", key: "shield" },
  weapon: null,
  armor: null,
  weight: "6.000",
  weight_unit: "lb",
  cost: "10.00",
};

test("a weapon row shows weight, value, damage and explained properties", () => {
  const sheet = buildItemSheet("Longsword", [longsword]);
  assert.equal(sheet.type, "Martial melee weapon");
  assert.equal(sheet.weight, "3 lb.");
  assert.equal(sheet.cost, "15 gp");
  assert.equal(sheet.weapon.damage, "1d8");
  assert.equal(sheet.weapon.damageType, "slashing");
  assert.equal(sheet.weapon.properties[0].name, "Versatile (1d10)");
  assert.match(sheet.weapon.properties[0].blurb, /one hand or two/);
  assert.equal(sheet.armor, null);
  assert.equal(sheet.description, null);
});

test("a pack armour row borrows its weight from the bundled table", () => {
  const sheet = buildItemSheet("Plate", [plate]);
  assert.equal(sheet.type, "Heavy armor");
  assert.equal(sheet.armor.ac, "18");
  assert.equal(sheet.armor.strength, 15);
  assert.equal(sheet.armor.stealthDisadvantage, true);
  assert.equal(sheet.weight, "65 lb.");
  assert.equal(sheet.cost, "1500 gp");
});

test("genre armour the pack lacks comes from the bundled table", () => {
  const sheet = buildItemSheet("Kevlar Vest", [undefined]);
  assert.equal(sheet.type, "Medium armor");
  assert.equal(sheet.armor.ac, "13 + Dex (max 2)");
  assert.match(sheet.armor.dex, /up to \+2/);
  assert.equal(sheet.weight, "15 lb.");
  assert.equal(sheet.cost, null);
});

test("a shield merges its stat row with the prose row", () => {
  const sheet = buildItemSheet("Shield", [shieldV1, shieldV2]);
  assert.equal(sheet.armor.ac, "+2");
  assert.equal(sheet.armor.shield, true);
  assert.equal(sheet.weight, "6 lb.");
  assert.equal(sheet.cost, "10 gp");
  assert.match(sheet.description, /carried in one hand/);
});

test("a +1 weapon with no row of its own reads the SRD weapon and the bonus", () => {
  const sheet = buildItemSheet("+1 Longsword", []);
  assert.equal(sheet.bonus, 1);
  assert.equal(sheet.weapon.damage, "1d8 + 1");
  assert.equal(sheet.type, "Martial melee weapon");
});

test("a name that only contains a weapon is not read as that weapon", () => {
  assert.equal(buildItemSheet("Pistol Holster", []), null);
});

test("a net deals no damage and says so", () => {
  const sheet = buildItemSheet("Net", [
    { category: "Martial Ranged Weapons", damage_dice: "0", damage_type: "", properties: ["special", "thrown (range 5/15)"] },
  ]);
  assert.equal(sheet.weapon.damage, null);
  assert.equal(sheet.weapon.range, "5/15 ft.");
});

test("a magic item carries type, rarity, attunement and prose", () => {
  const sheet = buildItemSheet("Flame Tongue", [
    {
      name: "Flame Tongue",
      type: "Weapon (any sword)",
      desc: "You can use a bonus action to speak this magic sword's command word.",
      rarity: "rare",
      requires_attunement: "requires attunement",
    },
  ]);
  assert.equal(sheet.type, "Weapon (any sword)");
  assert.equal(sheet.rarity, "Rare");
  assert.equal(sheet.attunement, true);
  assert.match(sheet.description, /command word/);
});

test("v2 gear gets its category, weight and a small price in silver", () => {
  const sheet = buildItemSheet("Torch", [
    { name: "Torch", desc: "A torch burns for 1 hour.", category: { name: "Adventuring Gear" }, weight: "1.000", cost: "0.01" },
  ]);
  assert.equal(sheet.type, "Adventuring gear");
  assert.equal(sheet.weight, "1 lb.");
  assert.equal(sheet.cost, "1 cp");
});

// The card's Value wrote prices with a formatter of its own: 0.15 gp as
// "15 cp", 1.5 gp as "1.5 gp", and a v1 row's "0.05 gp" as the pack prints
// it, where the receipt and the market say "1 sp 5 cp", "1 gp 5 sp", "5 cp".
test("an item's value reads in gold, silver and copper, as every price does", () => {
  const value = (cost) => buildItemSheet("Trinket", [{ name: "Trinket", desc: "A small thing.", category: { name: "Adventuring Gear" }, cost }]).cost;
  assert.equal(value("0.15"), "1 sp 5 cp");
  assert.equal(value("1.5"), "1 gp 5 sp");
  assert.equal(value("0.05 gp"), "5 cp");
  assert.equal(value("0.4 gp"), "4 sp");
  assert.equal(value("2,000 gp"), "2,000 gp");
  assert.equal(value("0 gp"), null);
  assert.equal(value("varies"), "varies");
});

test("homebrew armour reads its own block", () => {
  const sheet = buildItemSheet("Dragonhide Coat", [
    {
      itemKind: "armor",
      desc: "Stitched from a wyrmling's hide.",
      cost: "400 gp",
      weight: 12,
      armor: { name: "Dragonhide Coat", category: "light", baseAc: 12, weightLb: 12 },
    },
  ]);
  assert.equal(sheet.armor.ac, "12 + Dex");
  assert.equal(sheet.weight, "12 lb.");
  assert.equal(sheet.cost, "400 gp");
  assert.match(sheet.description, /wyrmling/);
});

await import("../src/lib/i18n/server-catalogs.ts");

test("item cards localize presentation without modifying source rows or numeric stats", () => {
  const original = structuredClone(longsword);
  const row = { ...longsword, cost: "1.55", desc: "Original item prose.", localized_desc: "Localized display prose." };
  for (const [locale, price] of [["en", "1 gp 5 sp 5 cp"], ["fr", "1 po 5 pa 5 pc"], ["cs", "1 zl 5 st 5 md"]]) {
    const sheet = buildItemSheet("Longsword +2", [row], { locale });
    assert.equal(sheet.cost, price);
    assert.equal(sheet.bonus, 2);
    assert.equal(sheet.weapon.damage, "1d8 + 2");
    assert.equal(sheet.description, "Localized display prose.");
    assert.equal(buildItemSheet("Plate", [plate], { locale }).armor.ac, "18");
  }
  assert.deepEqual(longsword, original);
  assert.equal(row.cost, "1.55");
  assert.equal(row.desc, "Original item prose.");
});

test("item cards use the shared weight reader across source formats and locales", () => {
  const weight = (fields, locale) => buildItemSheet("Example gear", [{ ...longsword, ...fields }], { locale, allowBundledFallback: false }).weight;
  for (const locale of ["en", "fr", "cs"]) {
    assert.equal(weight({ weight: "1/4 lb." }, locale), weight({ weight: 0.25 }, locale));
    assert.equal(weight({ weight: "0.075 lb." }, locale), weight({ weight: "0.075", weight_unit: "lb" }, locale));
    assert.equal(weight({ weight: "2", weight_unit: "kg" }, locale), weight({ weight: 4.4092 }, locale));
    assert.equal(weight({ weight: "4 oz" }, locale), weight({ weight: 0.25 }, locale));
    assert.equal(weight({ weight: "0 lb." }, locale), null);
    assert.equal(weight({ weight: "—" }, locale), null);
    assert.equal(weight({ weight: "2", weight_unit: "stones" }, locale), "2 stones");
    assert.equal(weight({ weight: "2 stones", weight_unit: "stones" }, locale), "2 stones");
  }
  assert.equal(weight({ weight: "0.075 lb." }, "en"), "0.075 lb.");
  assert.equal(weight({ weight: "2", weight_unit: "kg" }, "en"), "4.4092 lb.");
  const row = { weight: "1/4", weight_unit: "lb" };
  weight(row, "cs");
  assert.deepEqual(row, { weight: "1/4", weight_unit: "lb" });
});

test("Czech weapon properties use the weapon glossary context", () => {
  const row = { category: "Simple Ranged Weapons", damage_dice: "1d8", damage_type: "piercing", properties: ["light", "loading", "heavy", "ammunition (range 20/60)", "custom property"] };
  const original = structuredClone(row);
  const sheet = buildItemSheet("Test weapon", [row], { locale: "cs" });
  assert.deepEqual(sheet.weapon.properties.map((property) => property.name), [
    "Lehká", "Nabíjecí", "Těžká", "Střelná (dosah 20/60)", "Custom property",
  ]);
  assert.deepEqual(row, original);
  assert.equal(buildItemSheet("Test weapon", [row], { locale: "en" }).weapon.properties[0].name, "Light");
});

const { pickerMeta } = await import("../src/lib/content/picker-display.ts");
const { leadItemMeta } = await import("../src/app/campaigns/[campaignId]/lead-edit-display.ts");

test("Czech rarity is consistent across item cards and pickers", () => {
  const cases = [
    ["common", "běžný"],
    ["UNCOMMON", "neobvyklý"],
    ["very rare", "velmi vzácný"],
    ["uncommon (+1), rare (+2), or very rare (+3)", "neobvyklý (+1), vzácný (+2) nebo velmi vzácný (+3)"],
    ["rare (+1), very rare (+2), or legendary (+3)", "vzácný (+1), velmi vzácný (+2) nebo legendární (+3)"],
    ["Very rare or legendary", "velmi vzácný nebo legendární"],
    ["rare (silver or brass), very rare (bronze), or legendary (iron)", "vzácný (stříbro nebo mosaz), velmi vzácný (bronz) nebo legendární (železo)"],
  ];
  for (const [rarity, expected] of cases) {
    const row = { rarity, desc: "Original rules." };
    assert.equal(pickerMeta(row, "cs"), expected);
    assert.equal(leadItemMeta(row, "cs"), expected);
    assert.equal(buildItemSheet("Example", [row], { locale: "cs" }).rarity, expected.charAt(0).toUpperCase() + expected.slice(1));
    assert.equal(pickerMeta(row, "en"), rarity);
    assert.equal(row.rarity, rarity);
  }
  assert.equal(pickerMeta({ rarity: "custom rare grade" }, "cs"), "custom rare grade");
  assert.equal(pickerMeta({ kind: "gear" }, "cs"), "výbava");
  assert.equal(pickerMeta({ level: 2, rarity: "rare" }, "en"), "Level 2");
});

test("Czech compound magic item categories and rarity preserve all qualifiers", () => {
  const row = { type: "Weapon (any ammunition)", rarity: "uncommon (+1), rare (+2), or very rare (+3)", desc: "Original prose." };
  const sheet = buildItemSheet("Example ammunition", [row], { locale: "cs" });
  assert.equal(sheet.type, "Zbraň (libovolná munice)");
  assert.equal(sheet.rarity, "Neobvyklý (+1), vzácný (+2) nebo velmi vzácný (+3)");
  assert.equal(sheet.description, row.desc);
  assert.equal(buildItemSheet("Example ammunition", [row], { locale: "en" }).type, row.type);
});

const { bundledItemRows } = await import("../src/lib/rulebook/catalog-rows.ts");
test("every bundled magic item category and recorded rarity has Czech display text", () => {
  const rows = bundledItemRows();
  assert.ok(rows.length >= 239);
  for (const row of rows) {
    // Test the item's declared metadata, not any coincidentally named
    // mundane weapon or armor that would override it in the card.
    const en = buildItemSheet("Example magic item", [row.data], { locale: "en" });
    const cs = buildItemSheet("Example magic item", [row.data], { locale: "cs" });
    assert.ok(cs.type, row.name + ": type must be visible");
    assert.notEqual(cs.type, en.type ?? row.data.type, row.name + ": type");
    if (en.rarity) assert.notEqual(cs.rarity, en.rarity, row.name + ": rarity");
  }
});

test("nothing known is null", () => {
  assert.equal(buildItemSheet("Mysterious Trinket", [undefined, null]), null);
});

console.log(`\n${passed} item-sheet tests passed.`);
