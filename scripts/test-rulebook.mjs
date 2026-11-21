// The rulebook (/rulebook): the SRD 5.1 bound as pages, its markdown, its
// search, and the three routes that serve it.
//
// The book's claims worth guarding: it is the whole reference document (every
// chapter, every spell, monster and magic item, the legal notice); every
// page parses into blocks that leave no markdown behind; the quick links a
// table reaches for land on anchors that exist; search puts the rule itself
// first; and the routes are closed to anyone not signed in.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import { register } from "node:module";
import os from "node:os";
import path from "node:path";
import { removeTempDir } from "./lib/remove-temp-dir.mjs";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "odm-rulebook-"));
process.env.SQLITE_DB_PATH = path.join(dir, "test.sqlite");
process.env.DB_ENCRYPTION_KEY = randomBytes(32).toString("hex");
register("./lib/register-routes.mjs", import.meta.url);

const { rulebookContents, rulebookPage, rulebookPages, rulebookSearch, localeFromAcceptLanguage, QUICK_LINKS } = await import(
  "../src/lib/rulebook/book.ts"
);
const { crosswalkFor } = await import("../src/lib/rulebook/crosswalk.ts");
const { CZECH_SKILLS, CZECH_ITEMS, CZECH_MONSTERS, CZECH_SPELLS, czechSrdTitle, czechSrdSpellGroup, czechSrdSpellMeta, czechSrdMonsterMeta, czechSrdItemMeta } =
  await import("../src/lib/rulebook/czech-terms.ts");
const { CZECH_SPELL_NOTES } = await import("../src/lib/rulebook/czech-spell-notes.ts");
const { CZECH_SPELL_NOTES_2 } = await import("../src/lib/rulebook/czech-spell-notes-2.ts");
const { CZECH_SPELL_NOTES_3 } = await import("../src/lib/rulebook/czech-spell-notes-3.ts");
const { CZECH_SPELL_NOTES_4 } = await import("../src/lib/rulebook/czech-spell-notes-4.ts");
const { CZECH_SPELL_NOTES_5 } = await import("../src/lib/rulebook/czech-spell-notes-5.ts");
const { CZECH_SPELL_NOTES_6 } = await import("../src/lib/rulebook/czech-spell-notes-6.ts");
const { CZECH_SPELL_NOTES_6A } = await import("../src/lib/rulebook/czech-spell-notes-6a.ts");
const { CZECH_SPELL_NOTES_6B } = await import("../src/lib/rulebook/czech-spell-notes-6b.ts");
const { CZECH_SPELL_NOTES_7A } = await import("../src/lib/rulebook/czech-spell-notes-7a.ts");
const { CZECH_SPELL_NOTES_7B } = await import("../src/lib/rulebook/czech-spell-notes-7b.ts");
const { CZECH_SPELL_NOTES_7C } = await import("../src/lib/rulebook/czech-spell-notes-7c.ts");
const { CZECH_SPELL_NOTES_7D } = await import("../src/lib/rulebook/czech-spell-notes-7d.ts");
const { CZECH_MONSTER_NOTES, CZECH_ITEM_NOTES } = await import("../src/lib/rulebook/czech-bestiary-items.ts");
const { CZECH_MONSTER_NOTES_2, CZECH_ITEM_NOTES_2 } = await import("../src/lib/rulebook/czech-bestiary-items-2.ts");
const { CZECH_MONSTER_NOTES_3, CZECH_ITEM_NOTES_3 } = await import("../src/lib/rulebook/czech-bestiary-items-3.ts");
const { CZECH_MONSTER_NOTES_4 } = await import("../src/lib/rulebook/czech-monster-notes-4.ts");
const { CZECH_MONSTER_NOTES_5 } = await import("../src/lib/rulebook/czech-monster-notes-5.ts");
const { CZECH_CLASS_NOTES, CZECH_RACE_NOTES } = await import("../src/lib/rulebook/czech-character-notes.ts");
const { anchorSlug, blockText, inlineText, parseBook, parseInline, stripInline } = await import(
  "../src/lib/rulebook/markdown.ts"
);
const { queryTerms, snippetFor, stem } = await import("../src/lib/rulebook/search.ts");

let passed = 0;
async function test(name, fn) {
  await fn();
  passed += 1;
  console.log(`ok - ${name}`);
}

function anchorsOf(blocks, out = []) {
  for (const block of blocks) {
    if (block.anchor) out.push(block.anchor);
    if (block.blocks) anchorsOf(block.blocks, out);
  }
  return out;
}

try {
  // ---- the book ----
  await test("the book holds every chapter of the SRD in order", () => {
    const { chapters, pageCount } = rulebookContents();
    assert.deepEqual(
      chapters.map((chapter) => chapter.title),
      [
        "Races",
        "Classes",
        "Beyond 1st Level",
        "Personality and Background",
        "Equipment",
        "Feats",
        "Using Ability Scores",
        "Adventuring",
        "Combat",
        "Spellcasting",
        "Spells",
        "Running the Game",
        "Magic Items",
        "Monsters",
        "Creatures",
        "Nonplayer Characters",
        "Appendices",
      ],
    );
    assert.equal(pageCount, rulebookPages().length);
    const count = (id) => chapters.find((chapter) => chapter.id === id).entries.length;
    assert.equal(count("classes"), 12);
    assert.equal(count("races"), 10, "racial traits and the nine SRD races");
    assert.equal(count("spells"), 319, "every SRD 5.1 spell");
    assert.ok(count("magic-items") >= 240);
    assert.ok(count("monsters") + count("creatures") + count("npcs") >= 318);
  });

  await test("the contents bind the chapters as the players', the Game Master's and the monsters' books", () => {
    const { parts, chapters } = rulebookContents();
    assert.deepEqual(
      parts.map((part) => [part.numeral, part.title, part.chapters]),
      [
        ["I", "Players", chapters.slice(0, 11).map((chapter) => chapter.id)],
        ["II", "The Game Master", ["running-the-game", "magic-items"]],
        ["III", "Monsters", ["monsters", "creatures", "npcs"]],
      ],
    );
    const claimed = parts.flatMap((part) => part.chapters);
    assert.equal(new Set(claimed).size, claimed.length, "no chapter is in two books");
    assert.deepEqual(
      chapters.map((chapter) => chapter.id).filter((id) => !claimed.includes(id)),
      ["appendix"],
      "only the appendices stand outside the three books",
    );
    for (const part of parts) assert.match(part.blurb, /Player's Handbook|Dungeon Master's Guide|Monster Manual/);
  });

  await test("folios count every page once, from 1", () => {
    const folios = rulebookContents().chapters.flatMap((chapter) => chapter.entries.map((entry) => entry.folio));
    assert.deepEqual(folios, folios.map((_, index) => index + 1));
  });

  await test("page ids are unique and safe for an address", () => {
    const ids = rulebookPages().map((page) => page.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) assert.match(id, /^[a-z0-9-]{1,96}$/);
  });

  await test("spells are grouped by level, cantrips first", () => {
    const spells = rulebookContents().chapters.find((chapter) => chapter.id === "spells").entries;
    assert.equal(spells[0].group, "Cantrips");
    assert.equal(spells.at(-1).group, "9th Level");
    const fireball = spells.find((entry) => entry.title === "Fireball");
    assert.equal(fireball.group, "3rd Level");
    assert.equal(fireball.meta, "3rd-level evocation");
  });

  await test("a monster keeps its family beside a plain name", () => {
    const page = rulebookPage("adult-red-dragon-chromatic").page;
    assert.equal(page.title, "Adult Red Dragon");
    assert.equal(page.family, "Chromatic");
    assert.equal(page.meta, "Huge dragon, chaotic evil");
    assert.equal(rulebookPage("druid-npc").page.title, "Druid");
    assert.equal(rulebookPage("druid").page.kind, "class");
  });

  await test("a page knows its chapter and the pages either side", () => {
    const combat = rulebookPage("combat");
    assert.equal(combat.chapter.numeral, "IX");
    assert.equal(combat.prev.id, "adventuring");
    assert.equal(combat.next.id, "spellcasting");
    assert.equal(rulebookPage("racial-traits").prev, null);
    assert.equal(rulebookPage("legal-information").next, null);
    assert.equal(rulebookPage("no-such-page"), null);
  });

  await test("the legal notice carries the CC-BY-4.0 attribution", () => {
    const legal = rulebookPage("legal-information").page.md;
    assert.match(legal, /System Reference Document 5\.1/);
    assert.match(legal, /Creative Commons Attribution 4\.0/);
    assert.equal(rulebookContents().source.license, "CC-BY-4.0");
  });

  await test("every quick link lands on an anchor that exists", () => {
    assert.ok(QUICK_LINKS.length >= 10);
    for (const link of QUICK_LINKS) {
      const found = rulebookPage(link.page);
      assert.ok(found, `${link.label}: no page ${link.page}`);
      if (link.at) assert.ok(anchorsOf(parseBook(found.page.md)).includes(link.at), `${link.label}: no #${link.at}`);
    }
  });

  await test("links between pages point at pages that exist", () => {
    for (const page of rulebookPages()) {
      for (const match of page.md.matchAll(/\]\(page:([^)]+)\)/g)) {
        assert.ok(rulebookPage(match[1]), `${page.id} links to a missing page ${match[1]}`);
      }
    }
  });

  // A hyphen the PDF broke across a line kept its space ("self- destructive")
  // and a few came through as soft or Unicode hyphens: the import mends them
  // (scripts/import-srd-rulebook.mjs). A suspended hyphen ("a 5- to 20-foot
  // cone"), the conversion's "Table- X" captions and the blink dog's line,
  // which the SRD does not print, are left as they are.
  await test("no word is split at a hyphen the PDF broke across a line", () => {
    for (const page of rulebookPages()) {
      assert.ok(!/[­‐‑]/.test(page.md), `${page.id} keeps a soft or Unicode hyphen`);
      for (const match of page.md.matchAll(/(\w+)- (?!to\b|or\b|and\b)([a-z]+)/g)) {
        if (match[1] === "Table" || (page.id === "blink-dog" && match[0] === "long- standing")) continue;
        assert.fail(`${page.id} splits "${match[0]}"`);
      }
    }
  });

  // ---- the markdown ----
  await test("every page parses with no markdown left in its text", () => {
    for (const page of rulebookPages()) {
      const text = parseBook(page.md).map(blockText).join(" ");
      assert.ok(!/\*\*|__|\]\(/.test(text), `${page.id} leaves markdown behind`);
      assert.ok(!/(^|\s)#{1,6}\s/.test(text), `${page.id} leaves a heading mark behind`);
    }
  });

  await test("headings, tables, captions, lists and sidebars parse", () => {
    const blocks = parseBook(
      [
        "Some **bold** words.",
        "",
        "## Grappling",
        "",
        "**Table- The Barbarian**",
        "",
        "| Level | Rages |",
        "|:-----:|------:|",
        "| 1st   | 2     |",
        "|       |       |",
        "",
        "- one",
        "  carried on",
        "- two",
        "",
        "># Combat Step by Step",
        ">",
        ">1. **Determine surprise.** The GM decides.",
        "",
        "## Grappling",
      ].join("\n"),
    );
    assert.deepEqual(
      blocks.map((block) => block.kind),
      ["paragraph", "heading", "table", "list", "sidebar", "heading"],
    );
    const table = blocks[2];
    assert.equal(table.caption, "The Barbarian");
    assert.deepEqual(table.align, ["center", "right"]);
    assert.deepEqual(table.rows, [["1st", "2"]], "the empty trailing row is dropped");
    assert.deepEqual(blocks[3].items, ["one carried on", "two"]);
    assert.equal(blocks[4].title, "Combat Step by Step");
    assert.equal(blocks[4].anchor, "combat-step-by-step");
    assert.equal(blocks[4].blocks[0].kind, "list");
    assert.equal(blocks[1].anchor, "grappling");
    assert.equal(blocks[5].anchor, "grappling-2", "a repeated heading gets its own anchor");
  });

  await test("inline runs: bold italic, italic, links, and stray asterisks", () => {
    const nodes = parseInline("***Bite***. *Melee Weapon Attack:* +14 to hit, see [Nightmare](page:nightmare).");
    assert.equal(nodes[0].bold && nodes[0].italic, true);
    assert.equal(inlineText(nodes), "Bite. Melee Weapon Attack: +14 to hit, see Nightmare.");
    const link = nodes.find((node) => typeof node !== "string" && node.page);
    assert.equal(link.page, "nightmare");
    assert.equal(stripInline("*If you lose your book"), "If you lose your book", "an unclosed opener is dropped");
    assert.equal(stripInline("2 * 3 = 6"), "2 * 3 = 6", "a spaced asterisk is kept");
    assert.equal(stripInline("[a site](https://example.com)"), "a site", "outside links become plain text");
    assert.equal(anchorSlug("Two-Weapon Fighting"), "two-weapon-fighting");
  });

  // ---- search ----
  await test("stems join the forms of a word", () => {
    assert.equal(stem("grappling"), stem("grapple"));
    assert.equal(stem("grappled"), stem("grapple"));
    assert.equal(stem("attacks"), stem("attack"));
    assert.equal(stem("abilities"), stem("ability"));
    assert.deepEqual(queryTerms("the rules of hiding"), [stem("rules"), stem("hiding")]);
    assert.deepEqual(queryTerms("the"), ["the"], "a query of only stop words still searches");
  });

  const top = (query) => rulebookSearch(query).hits[0];
  await test("search puts the rule itself first", () => {
    assert.deepEqual([top("grapple").page, top("grapple").at], ["combat", "grappling"]);
    assert.deepEqual([top("opportunity attack").page, top("opportunity attack").at], ["combat", "opportunity-attacks"]);
    assert.deepEqual([top("concentration").page, top("concentration").at], ["spellcasting", "concentration"]);
    assert.deepEqual([top("long rest").page, top("long rest").at], ["adventuring", "long-rest"]);
    assert.deepEqual([top("exhaustion").page, top("exhaustion").at], ["conditions", "exhaustion"]);
    assert.deepEqual([top("sneak attack").page, top("sneak attack").at], ["rogue", "sneak-attack"]);
  });

  await test("search finds an entry by its name", () => {
    assert.equal(top("fireball").page, "fireball");
    assert.equal(top("Bag of Holding").page, "bag-of-holding");
    assert.equal(top("adult red dragon").page, "adult-red-dragon-chromatic");
  });

  await test("search reads a half-typed last word", () => {
    const pages = rulebookSearch("grapp").hits.map((hit) => hit.page);
    assert.ok(pages.includes("combat"));
    assert.ok(rulebookSearch("zzzzqx").hits.length === 0);
    assert.deepEqual(rulebookSearch("   ").hits, []);
  });

  await test("a hit carries the page's matched words, as written, for the reader to mark", () => {
    const [hit] = rulebookSearch("grappling").hits;
    assert.ok(hit.words.includes("grappling"), hit.words.join(","));
    assert.ok(hit.words.some((word) => word.startsWith("grappl") && word !== "grappling"), hit.words.join(","));
    assert.ok(hit.words.every((word) => word === word.toLowerCase()));
    assert.ok(!hit.words.includes("the"));
    // A half-typed last word marks the words it starts.
    assert.ok(rulebookSearch("grapp").hits[0].words.every((word) => word.startsWith("grapp")));
  });

  await test("search keeps at most three passages a page and forty in all", () => {
    const { hits } = rulebookSearch("attack");
    assert.ok(hits.length <= 40);
    const perPage = new Map();
    for (const hit of hits) perPage.set(hit.page, (perPage.get(hit.page) ?? 0) + 1);
    assert.ok([...perPage.values()].every((count) => count <= 3));
  });

  await test("a snippet opens near the first word that matched", () => {
    const text = `${"Filler words. ".repeat(40)}The grappled creature is held fast.`;
    const snippet = snippetFor(text, [stem("grapple")]);
    assert.match(snippet, /grappled/);
    assert.ok(snippet.length < 240);
    assert.equal(snippetFor("Short text.", ["x"]), "Short text.");
  });

  // ---- Czech SRD companion ----
  await test("Czech shares the exact SRD 5.1 bindings and preserves the English text", () => {
    const en = rulebookPages("en");
    const cs = rulebookPages("cs");
    assert.deepEqual(cs.map((page) => page.id), en.map((page) => page.id));
    assert.deepEqual(cs.map((page) => page.chapter), en.map((page) => page.chapter));
    assert.equal(rulebookPage("combat", "cs").page.title, "Boj");
    assert.equal(rulebookPage("fireball", "cs").page.title, "Ohnivá koule");
    assert.equal(rulebookPage("dwarf", "cs").page.title, "Trpaslík");
    assert.equal(rulebookPage("halfling", "cs").page.title, "Hobit");
    assert.match(rulebookPage("combat", "cs").page.md, /Český přehled pravidel/);
    assert.ok(rulebookPage("combat", "cs").page.md.endsWith(rulebookPage("combat", "en").page.md));
    assert.match(rulebookPage("fireball", "cs").page.md, /Český popis kouzla/);
    assert.ok(rulebookPage("fireball", "cs").page.md.endsWith(rulebookPage("fireball", "en").page.md));
    assert.equal(rulebookPage("legal-information", "cs").page.md, rulebookPage("legal-information", "en").page.md);
    assert.equal(rulebookContents("cs").pageCount, rulebookContents("en").pageCount);
    assert.equal(rulebookContents("cs").source.license, "CC-BY-4.0");
    assert.equal(rulebookContents("cs").chapters.find((chapter) => chapter.id === "combat").title, "Boj");
  });

  await test("Czech quick links keep their original anchors and search stems Czech", () => {
    for (const link of QUICK_LINKS) {
      const page = rulebookPage(link.page, "cs");
      assert.ok(page, `Missing Czech fallback for ${link.page}`);
      if (link.at) assert.ok(anchorsOf(parseBook(page.page.md)).includes(link.at), `Missing Czech anchor ${link.at}`);
    }
    const hits = rulebookSearch("soustředění", undefined, "cs").hits;
    assert.ok(hits.some((hit) => hit.page === "spellcasting"), "Czech rules find the original Czech concentration note");
    assert.equal(localeFromAcceptLanguage("cs-CZ,fr;q=0.5"), "cs");
    assert.equal(localeFromAcceptLanguage("en;q=0.9,cs;q=0.3"), "en");
    assert.equal(localeFromAcceptLanguage("cs;q=0"), "en");
    assert.equal(crosswalkFor(rulebookPage("fireball", "cs").page, "cs").editor, "spell");
    assert.equal(crosswalkFor(rulebookPage("armor", "cs").page, "cs").support, "engine");
    assert.equal(crosswalkFor(rulebookPage("fireball", "cs").page, "cs").support, crosswalkFor(rulebookPage("fireball", "en").page).support);
  });

  await test("Czech titles, magic school subtitles, and spell groups are translated without changing SRD IDs", () => {
    assert.equal(Object.keys(CZECH_SKILLS).length, 18, "the full 5e skill list");
    assert.ok(Object.keys(CZECH_MONSTERS).length >= 120, "the expanded monster dictionary");
    assert.ok(Object.keys(CZECH_SPELLS).length >= 60, "the expanded spell dictionary");
    assert.ok(Object.keys(CZECH_ITEMS).length >= 50, "the expanded magic-item dictionary");
    assert.equal(czechSrdTitle("Wolf", "monster"), "Vlk");
    assert.equal(czechSrdTitle("Fire Bolt", "spell"), "Ohnivá střela");
    assert.equal(czechSrdTitle("Amulet of Health", "item"), "Amulet zdraví");
    assert.equal(czechSrdTitle("Druid", "class"), "Druid");
    assert.equal(czechSrdSpellGroup("Cantrips"), "Triky");
    assert.equal(czechSrdSpellGroup("3rd Level"), "3. úroveň");
    assert.equal(czechSrdSpellMeta("3rd-level evocation"), "Zaklínání 3. úrovně");
    assert.equal(czechSrdSpellMeta("1st-level divination (ritual)"), "Věštění 1. úrovně (rituál)");
    assert.equal(czechSrdSpellMeta("unknown metadata"), "unknown metadata");
    const spell = rulebookPage("fireball", "cs").page;
    assert.equal(spell.meta, "Zaklínání 3. úrovně");
    assert.equal(spell.originalMeta, rulebookPage("fireball", "en").page.meta);
    assert.equal(spell.group, "3. úroveň");
    assert.equal(rulebookPage("fireball", "en").page.title, "Fireball");
    assert.equal(rulebookPage("fireball", "fr").page.title, "Boule de feu");
  });

  await test("Czech spell explanations cover common SRD spells with canonical English fallback", () => {
    const english = rulebookPages("en");
    const spellsByName = new Map(english.filter((page) => page.kind === "spell").map((page) => [page.title, page]));
    assert.equal(Object.keys(CZECH_SPELL_NOTES).length, 44, "new Czech spell explanations");
    for (const [name, note] of Object.entries(CZECH_SPELL_NOTES)) {
      const spell = spellsByName.get(name);
      assert.ok(spell, `Spell note is not a canonical SRD 5.1 spell: ${name}`);
      assert.ok(note.length > 120, `Spell note is unexpectedly short: ${name}`);
      const czech = rulebookPage(spell.id, "cs").page;
      assert.match(czech.md, /Český popis kouzla/);
      assert.ok(czech.md.includes(note));
      assert.ok(czech.md.endsWith(spell.md), `Original SRD lost in ${name}`);
      assert.ok(CZECH_SPELLS[name], `Czech title missing for ${name}`);
    }
    const fireball = rulebookSearch("Ohnivá koule", 5, "cs").hits;
    assert.ok(fireball.some((hit) => hit.page === "fireball"), "Czech spell search finds canonical fireball id");
  });

  await test("Czech bestiary and magic item guides preserve all original English stat blocks", () => {
    const english = rulebookPages("en");
    assert.equal(Object.keys(CZECH_MONSTER_NOTES).length, 27);
    assert.equal(Object.keys(CZECH_ITEM_NOTES).length, 20);
    for (const [kind, mapping, heading] of [
      ["monster", CZECH_MONSTER_NOTES, "Český přehled nestvůry"],
      ["item", CZECH_ITEM_NOTES, "Český přehled předmětu"],
    ]) {
      const originals = new Map(english.filter((page) => page.kind === kind).map((page) => [page.title, page]));
      for (const [name, note] of Object.entries(mapping)) {
        const original = originals.get(name);
        assert.ok(original, `Missing English SRD ${kind}: ${name}`);
        assert.ok(CZECH_ITEMS[name] || CZECH_MONSTERS[name], `Missing Czech title for ${name}`);
        const czech = rulebookPage(original.id, "cs").page;
        assert.ok(czech.md.includes(heading), `Missing Czech heading for ${name}`);
        assert.ok(czech.md.includes(note), `Missing Czech note for ${name}`);
        assert.ok(czech.md.endsWith(original.md), `English stat block lost for ${name}`);
      }
    }
  });

  await test("second Czech batch: 42 spells, 26 monsters and 20 items resolve to unchanged canonical SRD pages", () => {
    const originals = rulebookPages("en");
    const check = (kind, mapping, expectedCount, heading, titles) => {
      assert.equal(Object.keys(mapping).length, expectedCount, `${kind} new translation count`);
      const byTitle = new Map(originals.filter((page) => page.kind === kind).map((page) => [page.title, page]));
      for (const [englishName, summary] of Object.entries(mapping)) {
        const source = byTitle.get(englishName);
        // The character-builder catalogue also contains non-SRD PHB spells.
        // Such notes do not create pages in the CC BY 4.0 SRD rulebook.
        if (kind === "spell" && !source) {
          assert.ok(titles[englishName], `Czech PHB spell name missing for ${englishName}`);
          continue;
        }
        assert.ok(source, `${kind} missing from canonical English 2014 SRD: ${englishName}`);
        assert.ok(titles[englishName], `Missing Czech title for ${englishName}`);
        assert.ok(summary.length >= 100, `Unexpectedly short summary for ${englishName}`);
        const localized = rulebookPage(source.id, "cs").page;
        assert.ok(localized.md.includes(heading), `Missing heading for ${englishName}`);
        assert.ok(localized.md.includes(summary), `Missing Czech text for ${englishName}`);
        assert.ok(localized.md.endsWith(source.md), `English canonical source was modified for ${englishName}`);
        assert.equal(localized.id, source.id, `Page binding drift for ${englishName}`);
      }
    };
    check("spell", CZECH_SPELL_NOTES_2, 42, "Český popis kouzla", CZECH_SPELLS);
    check("monster", CZECH_MONSTER_NOTES_2, 26, "Český přehled nestvůry", CZECH_MONSTERS);
    check("item", CZECH_ITEM_NOTES_2, 20, "Český přehled předmětu", CZECH_ITEMS);
    for (const name of Object.keys(CZECH_SPELL_NOTES_2)) {
      assert.ok(!Object.hasOwn(CZECH_SPELL_NOTES, name), `Duplicate spell summary in both batches: ${name}`);
    }
    for (const name of Object.keys(CZECH_MONSTER_NOTES_2)) {
      assert.ok(!Object.hasOwn(CZECH_MONSTER_NOTES, name), `Duplicate creature in both batches: ${name}`);
    }
    for (const name of Object.keys(CZECH_ITEM_NOTES_2)) {
      assert.ok(!Object.hasOwn(CZECH_ITEM_NOTES, name), `Duplicate item in both batches: ${name}`);
    }
    const huntersMark = originals.find((page) => page.kind === "spell" && page.title === "Hunter\'s Mark");
    assert.ok(huntersMark, "Hunter\'s Mark exists in the SRD");
    assert.ok(rulebookSearch("Lovcova marka", 10, "cs").hits.some((hit) => hit.page === huntersMark.id), "Czech hunter mark lookup");
  });

  await test("third Czech batch preserves 69 canonical SRD entries and does not duplicate the earlier notes", () => {
    const english = rulebookPages("en");
    const grouped = {
      spell: [CZECH_SPELL_NOTES, CZECH_SPELL_NOTES_2, CZECH_SPELL_NOTES_3],
      monster: [CZECH_MONSTER_NOTES, CZECH_MONSTER_NOTES_2, CZECH_MONSTER_NOTES_3],
      item: [CZECH_ITEM_NOTES, CZECH_ITEM_NOTES_2, CZECH_ITEM_NOTES_3],
    };
    const titles = { spell: CZECH_SPELLS, monster: CZECH_MONSTERS, item: CZECH_ITEMS };
    const headings = {
      spell: "Český popis kouzla",
      monster: "Český přehled nestvůry",
      item: "Český přehled předmětu",
    };
    assert.equal(Object.keys(CZECH_SPELL_NOTES_3).length, 30);
    assert.equal(Object.keys(CZECH_MONSTER_NOTES_3).length, 22);
    assert.equal(Object.keys(CZECH_ITEM_NOTES_3).length, 17);
    for (const kind of ["spell", "monster", "item"]) {
      const [first, second, third] = grouped[kind];
      const everyName = [...Object.keys(first), ...Object.keys(second), ...Object.keys(third)];
      assert.equal(new Set(everyName).size, everyName.length, `No duplicate ${kind} notes across batches`);
      const byEnglishTitle = new Map(english.filter((entry) => entry.kind === kind).map((entry) => [entry.title, entry]));
      for (const [name, note] of Object.entries(third)) {
        const original = byEnglishTitle.get(name);
        assert.ok(original, `Missing original SRD ${kind}: ${name}`);
        assert.ok(titles[kind][name], `Missing Czech title for ${name}`);
        assert.ok(note.length >= 120, `Unexpectedly short note for ${name}`);
        const translated = rulebookPage(original.id, "cs").page;
        assert.equal(translated.id, original.id);
        assert.ok(translated.md.includes(headings[kind]), `Missing Czech heading for ${name}`);
        assert.ok(translated.md.includes(note), `Missing Czech description for ${name}`);
        assert.ok(translated.md.endsWith(original.md), `Original English text not preserved for ${name}`);
      }
    }
    const spell = english.find((page) => page.kind === "spell" && page.title === "Polymorph");
    assert.ok(spell, "Polymorph exists in SRD 5.1");
    assert.ok(rulebookSearch("Proměň tvora", 10, "cs").hits.some((hit) => hit.page === spell.id), "Czech search resolves Polymorph");
    assert.equal(rulebookPage("polymorph", "en").page.title, "Polymorph");
  });

  await test("fourth Czech translation batch keeps 31 spells, 26 monsters and 21 character guides on canonical SRD pages", () => {
    const english = rulebookPages("en");
    const byKind = {
      spell: { batch: CZECH_SPELL_NOTES_4, all: [CZECH_SPELL_NOTES, CZECH_SPELL_NOTES_2, CZECH_SPELL_NOTES_3, CZECH_SPELL_NOTES_4], heading: "Český popis kouzla", expected: 31 },
      monster: { batch: CZECH_MONSTER_NOTES_4, all: [CZECH_MONSTER_NOTES, CZECH_MONSTER_NOTES_2, CZECH_MONSTER_NOTES_3, CZECH_MONSTER_NOTES_4], heading: "Český přehled nestvůry", expected: 26 },
      class: { batch: CZECH_CLASS_NOTES, all: [CZECH_CLASS_NOTES], heading: "Český přehled povolání", expected: 12 },
      race: { batch: CZECH_RACE_NOTES, all: [CZECH_RACE_NOTES], heading: "Český přehled rasy", expected: 9 },
    };
    const uniqueTitles = { spell: CZECH_SPELLS, monster: CZECH_MONSTERS };
    for (const [kind, config] of Object.entries(byKind)) {
      assert.equal(Object.keys(config.batch).length, config.expected, `Wrong Czech ${kind} batch size`);
      const names = config.all.flatMap((mapping) => Object.keys(mapping));
      assert.equal(new Set(names).size, names.length, `Duplicate ${kind} translation across batches`);
      const byTitle = new Map(english.filter((page) => page.kind === kind).map((page) => [page.title, page]));
      for (const [title, description] of Object.entries(config.batch)) {
        const original = byTitle.get(title);
        assert.ok(original, `Missing canonical SRD ${kind}: ${title}`);
        assert.ok(description.length >= 150, `Unexpectedly short Czech summary: ${title}`);
        if (uniqueTitles[kind]) {
          assert.ok(uniqueTitles[kind][title], `Missing Czech glossary title: ${title}`);
        }
        const translated = rulebookPage(original.id, "cs").page;
        assert.equal(translated.id, original.id);
        assert.ok(translated.md.includes(config.heading), `Missing Czech heading: ${title}`);
        assert.ok(translated.md.includes(description), `Czech summary not attached: ${title}`);
        assert.ok(translated.md.endsWith(original.md), `Original English SRD modified: ${title}`);
      }
    }
    assert.equal(rulebookPage("fighter", "cs").page.title, "Bojovník");
    assert.equal(rulebookPage("half-orc", "cs").page.title, "Půlork");
    const spiritGuardians = english.find((page) => page.kind === "spell" && page.title === "Spirit Guardians");
    assert.ok(spiritGuardians);
    assert.ok(rulebookSearch("Přízrační strážci", 15, "cs").hits.some((hit) => hit.page === spiritGuardians.id));
  });

  await test("fifth Czech batch binds 48 spells and 37 creatures to canonical 2014 SRD pages", () => {
    const original = rulebookPages("en");
    const groups = {
      spell: {
        newNotes: CZECH_SPELL_NOTES_5,
        priorNotes: [CZECH_SPELL_NOTES, CZECH_SPELL_NOTES_2, CZECH_SPELL_NOTES_3, CZECH_SPELL_NOTES_4],
        names: CZECH_SPELLS,
        heading: "Český popis kouzla",
        expected: 48,
      },
      monster: {
        newNotes: CZECH_MONSTER_NOTES_5,
        priorNotes: [CZECH_MONSTER_NOTES, CZECH_MONSTER_NOTES_2, CZECH_MONSTER_NOTES_3, CZECH_MONSTER_NOTES_4],
        names: CZECH_MONSTERS,
        heading: "Český přehled nestvůry",
        expected: 37,
      },
    };
    for (const [kind, group] of Object.entries(groups)) {
      assert.equal(Object.keys(group.newNotes).length, group.expected);
      const priorKeys = new Set(group.priorNotes.flatMap((mapping) => Object.keys(mapping)));
      const sourceByTitle = new Map(original.filter((page) => page.kind === kind).map((page) => [page.title, page]));
      for (const [name, note] of Object.entries(group.newNotes)) {
        assert.ok(!priorKeys.has(name), `Duplicate ${kind} note: ${name}`);
        assert.ok(group.names[name], `Missing Czech ${kind} title: ${name}`);
        assert.ok(note.length >= 120, `Unexpectedly short Czech ${kind} note: ${name}`);
        const source = sourceByTitle.get(name);
        if (kind === "spell" && !source) continue; // PHB-only spell notes, not SRD pages
        assert.ok(source, `Missing canonical SRD ${kind} entry: ${name}`);
        const translated = rulebookPage(source.id, "cs").page;
        assert.equal(translated.id, source.id, `Changed canonical SRD identifier for ${name}`);
        assert.ok(translated.md.includes(group.heading), `Missing Czech heading for ${name}`);
        assert.ok(translated.md.includes(note), `Missing Czech note for ${name}`);
        assert.ok(translated.md.endsWith(source.md), `English SRD text modified for ${name}`);
      }
    }
    assert.ok(Object.keys(CZECH_SPELLS).length >= 207, "Czech dictionary includes the new spell names");
    assert.ok(Object.keys(CZECH_MONSTERS).length >= 138, "Monster glossary retains every existing name");
    const spell = original.find((page) => page.kind === "spell" && page.title === "Vicious Mockery");
    assert.ok(spell, "Vicious Mockery exists in SRD");
    assert.ok(rulebookSearch("Zlomyslný výsměch", 10, "cs").hits.some((hit) => hit.page === spell.id));
  });

  await test("sixth Czech batch keeps 32 spell IDs, English text and distinct Czech notes", () => {
    const original = rulebookPages("en").filter((page) => page.kind === "spell");
    const originals = new Map(original.map((page) => [page.title, page]));
    const prior = [CZECH_SPELL_NOTES, CZECH_SPELL_NOTES_2, CZECH_SPELL_NOTES_3, CZECH_SPELL_NOTES_4, CZECH_SPELL_NOTES_5];
    const batch = { ...CZECH_SPELL_NOTES_6A, ...CZECH_SPELL_NOTES_6B };
    assert.equal(Object.keys(CZECH_SPELL_NOTES_6A).length, 18, "Third-level summaries");
    assert.equal(Object.keys(CZECH_SPELL_NOTES_6B).length, 14, "Fourth-level summaries");
    assert.equal(Object.keys(batch).length, 32, "No duplicates within sixth batch");
    assert.ok(Object.keys(CZECH_SPELLS).length >= 239, "Expanded Czech title dictionary");
    const earlierNames = new Set(prior.flatMap((notes) => Object.keys(notes)));
    for (const [englishName, note] of Object.entries(batch)) {
      assert.ok(!earlierNames.has(englishName), `Duplicate translated spell: ${englishName}`);
      assert.ok(CZECH_SPELLS[englishName], `Missing Czech spell name: ${englishName}`);
      assert.ok(note.length >= 160, `Suspiciously short Czech spell description: ${englishName}`);
      const source = originals.get(englishName);
      if (!source) continue; // Core PHB spell absent from the licensed SRD 5.1
      assert.ok(source, `No canonical 2014 SRD spell: ${englishName}`);
      const translated = rulebookPage(source.id, "cs").page;
      assert.equal(translated.id, source.id, `Page ID changed for ${englishName}`);
      assert.equal(translated.title, CZECH_SPELLS[englishName], `Czech title not used for ${englishName}`);
      assert.ok(translated.md.includes("Český popis kouzla"), `No Czech heading for ${englishName}`);
      assert.ok(translated.md.includes(note), `Missing sixth-batch note for ${englishName}`);
      assert.ok(translated.md.endsWith(source.md), `Original full English source changed for ${englishName}`);
    }
    for (const [query, englishName] of [
      ["Mihotání", "Blink"],
      ["Větrná zeď", "Wind Wall"],
      ["Páchnoucí oblak", "Stinking Cloud"],
    ]) {
      const originalPage = originals.get(englishName);
      assert.ok(originalPage);
      assert.ok(rulebookSearch(query, 20, "cs").hits.some((hit) => hit.page === originalPage.id),
        `Czech lookup did not resolve ${query}`);
    }
  });

  await test("Additional 20 level-five Czech spell notes preserve every canonical SRD page", () => {
    const english = rulebookPages("en").filter((entry) => entry.kind === "spell");
    const byTitle = new Map(english.map((entry) => [entry.title, entry]));
    const keys = Object.keys(CZECH_SPELL_NOTES_6);
    assert.equal(keys.length, 20, "New fifth-level spell batch count");
    const previous = new Set([
      ...Object.keys(CZECH_SPELL_NOTES), ...Object.keys(CZECH_SPELL_NOTES_2),
      ...Object.keys(CZECH_SPELL_NOTES_3), ...Object.keys(CZECH_SPELL_NOTES_4),
      ...Object.keys(CZECH_SPELL_NOTES_5),
      ...Object.keys(CZECH_SPELL_NOTES_6A), ...Object.keys(CZECH_SPELL_NOTES_6B),
    ]);
    for (const [englishName, summary] of Object.entries(CZECH_SPELL_NOTES_6)) {
      assert.ok(!previous.has(englishName), `Duplicated Czech spell notes: ${englishName}`);
      assert.ok(CZECH_SPELLS[englishName], `Missing canonical Czech spell title: ${englishName}`);
      const original = byTitle.get(englishName);
      if (!original) continue; // Non-SRD spells remain valid builder-only reference names
      assert.ok(original, `Missing English SRD spell: ${englishName}`);
      assert.ok(summary.length >= 140, `Empty Czech spell description: ${englishName}`);
      const localized = rulebookPage(original.id, "cs").page;
      assert.equal(localized.id, original.id);
      assert.ok(localized.md.includes(summary), `Czech summary not shown: ${englishName}`);
      assert.ok(localized.md.endsWith(original.md), `Changed English SRD mechanics: ${englishName}`);
    }
    assert.ok(Object.keys(CZECH_SPELLS).length >= 259);
  });

  await test("every one of the 319 SRD 5.1 spell pages has a canonical Czech title and summary", () => {
    const spellPages = rulebookPages("en").filter((page) => page.kind === "spell");
    assert.equal(spellPages.length, 319, "Expected full 2014 CC BY 4.0 SRD spellbook");
    const batches = [
      CZECH_SPELL_NOTES, CZECH_SPELL_NOTES_2, CZECH_SPELL_NOTES_3,
      CZECH_SPELL_NOTES_4, CZECH_SPELL_NOTES_5, CZECH_SPELL_NOTES_6,
      CZECH_SPELL_NOTES_6A, CZECH_SPELL_NOTES_6B,
      CZECH_SPELL_NOTES_7A, CZECH_SPELL_NOTES_7B,
      CZECH_SPELL_NOTES_7C, CZECH_SPELL_NOTES_7D,
    ];
    assert.equal(Object.keys(CZECH_SPELL_NOTES_7A).length, 22);
    assert.equal(Object.keys(CZECH_SPELL_NOTES_7B).length, 26);
    assert.equal(Object.keys(CZECH_SPELL_NOTES_7C).length, 25);
    assert.equal(Object.keys(CZECH_SPELL_NOTES_7D).length, 35);
    const notes = new Map();
    for (const batch of batches) {
      for (const [name, note] of Object.entries(batch)) {
        if (!notes.has(name.toLowerCase())) notes.set(name.toLowerCase(), note);
      }
    }
    const byName = new Set();
    for (const page of spellPages) {
      assert.ok(!byName.has(page.title), `Duplicate SRD spell page title: ${page.title}`);
      byName.add(page.title);
      const note = notes.get(page.title.toLowerCase());
      const title = CZECH_SPELLS[page.title];
      assert.ok(note && note.length >= 100, `Missing Czech summary for SRD spell: ${page.title}`);
      assert.ok(title, `Missing Czech display name for SRD spell: ${page.title}`);
      const translated = rulebookPage(page.id, "cs").page;
      assert.equal(translated.id, page.id, `Changed canonical SRD identifier: ${page.title}`);
      assert.equal(translated.title, title, `Czech spell title mismatch: ${page.title}`);
      assert.ok(translated.md.includes("Český popis kouzla"), `Missing Czech heading: ${page.title}`);
      assert.ok(translated.md.includes(note), `Missing Czech summary in page: ${page.title}`);
      assert.ok(translated.md.endsWith(page.md), `Original English spell rules modified: ${page.title}`);
    }
    for (const [query, title] of [
      ["Melfův kyselinový šíp", "Acid Arrow"],
      ["Bigbyho ruka", "Arcane Hand"],
      ["Meteorický roj", "Meteor Swarm"],
      ["Přání", "Wish"],
    ]) {
      const original = spellPages.find((page) => page.title === title);
      assert.ok(original, `Missing reference spell: ${title}`);
      assert.ok(rulebookSearch(query, 15, "cs").hits.some((hit) => hit.page === original.id),
        `Czech lookup failed: ${query}`);
    }
  });

  await test("Czech magic item and monster metadata are display-only and retain original metadata", () => {
    assert.equal(czechSrdMonsterMeta("Huge dragon, chaotic evil"), "Obrovský drak, chaoticky zlý");
    assert.equal(czechSrdMonsterMeta("Medium humanoid (goblinoid), neutral evil"), "Střední humanoid (goblinoid), neutrálně zlý");
    assert.equal(czechSrdItemMeta("Wondrous item, uncommon (requires attunement)"), "Divotvorný předmět, neobvyklý (vyžaduje sladění)");
    assert.equal(czechSrdItemMeta("Unknown item, rare"), "Unknown item, rare");
    assert.equal(czechSrdMonsterMeta("unknown metadata"), "unknown metadata");
    const originalDrake = rulebookPages("en").find((page) => page.kind === "monster" && page.title === "Adult Red Dragon");
    assert.ok(originalDrake, "Adult Red Dragon exists in SRD");
    const drake = rulebookPage(originalDrake.id, "cs").page;
    assert.equal(drake.meta, czechSrdMonsterMeta(originalDrake.meta));
    assert.equal(drake.originalMeta, originalDrake.meta);
  });

  await test("Czech companion adds original rules summaries while preserving each full English page", () => {
    for (const id of ["coinage", "backgrounds", "magic-items", "nonplayer-characters", "traps"]) {
      const english = rulebookPage(id, "en").page.md;
      const czech = rulebookPage(id, "cs").page.md;
      assert.match(czech, /Český přehled pravidel/, `missing Czech notes for ${id}`);
      assert.ok(czech.endsWith(english), `English SRD content modified in ${id}`);
    }
    assert.ok(!rulebookPage("legal-information", "cs").page.md.includes("Český přehled pravidel"));
  });

  // ---- the French book ----
  // The same binding in the official French print (srd-5.1-fr.json, built by
  // scripts/import-srd-rulebook-fr.mjs): identical page ids in the identical
  // order, the print's titles and text, and the three pages no wave covers
  // falling back to their English page. The English assertions above stay
  // bound to the default locale.
  await test("the French book binds the same pages under the same ids", () => {
    const enPages = rulebookPages();
    const frPages = rulebookPages("fr");
    assert.equal(frPages.length, enPages.length);
    assert.deepEqual(frPages.map((page) => page.id), enPages.map((page) => page.id));
    const frContents = rulebookContents("fr");
    assert.equal(frContents.pageCount, rulebookContents().pageCount);
    assert.deepEqual(
      frContents.chapters.map((chapter) => [chapter.id, chapter.numeral, chapter.pages]),
      rulebookContents().chapters.map((chapter) => [chapter.id, chapter.numeral, chapter.pages]),
    );
    // The folios a bookmark keeps hold in both books.
    assert.deepEqual(
      frContents.chapters.flatMap((chapter) => chapter.entries.map((entry) => [entry.id, entry.folio])),
      rulebookContents().chapters.flatMap((chapter) => chapter.entries.map((entry) => [entry.id, entry.folio])),
    );
  });

  await test("the French book reads the print's titles and words", () => {
    const frContents = rulebookContents("fr");
    assert.deepEqual(
      frContents.chapters.map((chapter) => chapter.title),
      [
        "Races",
        "Classes",
        "Au-delà du niveau 1",
        "Personnalité et historique",
        "Équipement",
        "Dons",
        "Utiliser les valeurs de caractéristique",
        "Aventure",
        "Combat",
        "Sorts",
        "Description des sorts",
        "Conduite du jeu",
        "Objets magiques",
        "Monstres",
        "Créatures diverses",
        "Personnages non-joueurs",
        "Annexes",
      ],
    );
    assert.deepEqual(frContents.parts.map((part) => part.title), ["Joueurs", "Le maître du jeu", "Monstres"]);
    assert.equal(frContents.source.title, "Document de Référence du Système 5.1");
    const goblin = rulebookPage("goblin", "fr").page;
    assert.equal(goblin.title, "Gobelin");
    assert.equal(goblin.meta, "Humanoïde (gobelin) de taille P, neutre mauvais");
    assert.match(goblin.md, /Classe d’armure/);
    const fireball = rulebookPage("fireball", "fr").page;
    assert.equal(fireball.title, "Boule de feu");
    assert.equal(fireball.meta, "Évocation du 3e niveau");
    assert.equal(fireball.group, "Niveau 3", "the spells chapter groups by the French level names");
    assert.equal(rulebookPage("mage-hand", "fr").page.group, "Sorts mineurs");
    // The chapter blurbs are the English book's (the FR print prints none);
    // the parts carry the French the reader shows.
    assert.equal(frContents.chapters[0].blurb, rulebookContents().chapters[0].blurb);
    assert.match(frContents.parts[0].blurb, /Manuel des joueurs/);
    assert.match(frContents.parts[0].blurb, /créer un héros/);
  });

  await test("the French book ends with the print's whole legal notice", () => {
    // CC-BY-4.0 asks every work to carry Wizards' attribution statement; the
    // French book's last page is where its readers find it, so the statement
    // must be there in full (the wave once lost its first words).
    const legal = rulebookPage("legal-information", "fr").page;
    assert.equal(legal.title, "Informations juridiques");
    assert.ok(legal.md.startsWith("Le Document de Référence du Système 5.1 vous est fourni à titre gratuit"), legal.md.slice(0, 80));
    assert.match(
      legal.md,
      /Ce travail comprend la documentation tirée du Document de Référence du Système 5\.1 \(« SRD 5\.1 »\) par Wizards of the Coast LLC et disponible à l'adresse https:\/\/dnd\.wizards\.com\/fr\/resources\/systems-reference-document\. Le SRD 5\.1 est distribué en vertu de la licence Creative Commons Attribution 4\.0 International disponible à l'adresse https:\/\/creativecommons\.org\/licenses\/by\/4\.0\/legalcode\.fr\./,
    );
    assert.equal(rulebookContents("fr").source.licenseUrl, "https://creativecommons.org/licenses/by/4.0/legalcode.fr");
  });

  await test("the crosswalk speaks the reader's language but reads the English book's names", () => {
    const walk = crosswalkFor(rulebookPage("fireball", "fr").page, "fr");
    assert.equal(walk.support, "engine", "Boule de feu stays an engine spell");
    assert.match(walk.where, /Les outils d’incantation gèrent ses jets/);
    const magicItems = crosswalkFor(rulebookPage("magic-items", "fr").page, "fr");
    assert.match(magicItems.where, /Atelier : Objets \(harmonisation, effets, propriétés additionnelles, charges, sorts\)/);
    const enFireball = crosswalkFor(rulebookPage("fireball").page, "en");
    assert.equal(enFireball.support, "engine");
    assert.match(enFireball.where, /The cast tools roll it/);
  });

  await test("the magic-items chapter's rules pages read French, binding unchanged", () => {
    const enArtifacts = rulebookPage("artifacts").page;
    const frArtifacts = rulebookPage("artifacts", "fr").page;
    assert.equal(frArtifacts.title, "Les artefacts");
    assert.match(frArtifacts.md, /L’orbe des dragons/);
    assert.match(rulebookPage("magic-items", "fr").page.md, /Harmonisation/);
    assert.equal(rulebookPage("sentient-magic-items", "fr").page.title, "Les objets magiques intelligents");
    // The binding never moves: same neighbours as the English book.
    assert.equal(rulebookPage("artifacts", "fr").next?.id, "adamantine-armor");
    assert.equal(rulebookPage("artifacts", "fr").prev?.id, "sentient-magic-items");
    const frFireball = rulebookPage("fireball", "fr");
    assert.equal(frFireball.prev.id, rulebookPage("fireball").prev.id);
    assert.equal(frFireball.next.id, rulebookPage("fireball").next.id);
  });

  const topFr = (query) => rulebookSearch(query, undefined, "fr").hits[0];
  await test("the French book's search stems French and finds the French words", () => {
    assert.equal(topFr("boule de feu").page, "fireball");
    assert.deepEqual([topFr("lutte").page, topFr("lutte").at], ["combat", "lutte"]);
    assert.equal(topFr("dragon noir adulte").page, "adult-black-dragon-chromatic");
    assert.equal(topFr("sac contenant").page, "adventuring-gear");
    // The English query reads the English book by default, and vice versa.
    assert.equal(rulebookSearch("boule de feu").hits.length, 0, "no French words in the English book's index");
    assert.equal(topFr("grapple"), undefined, "no English words in the French book's index");
    // A French hit carries the French words the reader marks.
    const [hit] = rulebookSearch("lutte", undefined, "fr").hits;
    assert.ok(hit.words.includes("lutte"), hit.words.join(","));
    // The snippet finds the matching word by the book's stems too: the
    // English stem of « travaux » is not a prefix of the French one, so an
    // English-stemmed snippet opened at the passage's first words instead.
    const work = rulebookSearch("travaux", undefined, "fr").hits.find((item) => item.at === "tests-de-constitution");
    assert.match(work.snippet, /travaux/, work.snippet);
  });

  await test("the request's Accept-Language picks the book", () => {
    assert.equal(localeFromAcceptLanguage(null), "en");
    assert.equal(localeFromAcceptLanguage("fr"), "fr");
    assert.equal(localeFromAcceptLanguage("fr-CA"), "fr");
    assert.equal(localeFromAcceptLanguage("en"), "en");
    assert.equal(localeFromAcceptLanguage("en-GB,en;q=0.9,fr;q=0.8"), "en", "the first language the app speaks wins");
    assert.equal(localeFromAcceptLanguage("de-DE,fr;q=0.9"), "fr", "an app language after an unknown one still wins");
    assert.equal(localeFromAcceptLanguage("de"), "en");
    assert.equal(localeFromAcceptLanguage("en;q=0.2,fr;q=0.9"), "fr", "the higher weight wins, not the earlier tag");
    assert.equal(localeFromAcceptLanguage("fr;q=0,en"), "en", "a language weighted q=0 is refused");
    assert.equal(localeFromAcceptLanguage("fr;q=0"), "en");
  });

  // Newly covered canonical SRD pages must have Czech titles and short
  // summaries while retaining the original English rule blocks and IDs.
  await test("new Czech monster and magic-item notes bind to exact SRD pages", async () => {
    const {
      CZECH_MONSTER_NOTES_6, CZECH_ITEM_NOTES_4,
      CZECH_MONSTER_TITLES_6, CZECH_ITEM_TITLES_4,
    } = await import("../src/lib/rulebook/czech-bestiary-items-4.ts");
    assert.equal(Object.keys(CZECH_MONSTER_NOTES_6).length, 41);
    assert.equal(Object.keys(CZECH_ITEM_NOTES_4).length, 45);
    for (const [kind, notes, titles, heading] of [
      ["monster", CZECH_MONSTER_NOTES_6, CZECH_MONSTER_TITLES_6, "Český přehled nestvůry"],
      ["item", CZECH_ITEM_NOTES_4, CZECH_ITEM_TITLES_4, "Český přehled předmětu"],
    ]) {
      const sourceByTitle = new Map(rulebookPages("en").filter((page) => page.kind === kind).map((page) => [page.title, page]));
      assert.deepEqual(Object.keys(notes).sort(), Object.keys(titles).sort());
      for (const [name, note] of Object.entries(notes)) {
        const original = sourceByTitle.get(name);
        assert.ok(original, `Missing canonical SRD ${kind}: ${name}`);
        const translated = rulebookPage(original.id, "cs")?.page;
        assert.ok(translated, `Missing Czech SRD page: ${name}`);
        assert.equal(translated.id, original.id);
        assert.equal(translated.title, titles[name], `Missing Czech title: ${name}`);
        assert.ok(translated.md.includes(heading) && translated.md.includes(note), `Missing Czech summary: ${name}`);
        assert.ok(translated.md.endsWith(original.md), `English rules must stay intact: ${name}`);
      }
    }
    const armor = rulebookPages("en").find((page) => page.title === "Animated Armor (Animated Object)");
    assert.ok(armor);
    const localizedArmor = rulebookPage(armor.id, "cs").page;
    assert.equal(localizedArmor.title, "Oživlá zbroj");
    assert.ok(localizedArmor.md.includes("Český přehled nestvůry"));
    assert.ok(localizedArmor.md.endsWith(armor.md));
  });

  await test("previous Czech summary batch had 643 canonical SRD pages", () => {
    const all = rulebookPages("cs");
    assert.equal(all.length, 933);
    const counts = Object.fromEntries(["rules", "race", "class", "spell", "item", "monster"].map((kind) => [
      kind, all.filter((page) => page.kind === kind && page.md.startsWith("## Český ")).length,
    ]));
    assert.ok(counts.rules >= 35 && counts.race === 9 && counts.class === 12 && counts.spell === 319);
    assert.ok(counts.item >= 96 && counts.monster >= 172);
    assert.ok(Object.values(counts).reduce((sum, count) => sum + count, 0) >= 643);
  });

  await test("batch 7 Czech monster and batch 5 magic-item notes bind to canonical SRD pages", async () => {
    const { CZECH_MONSTER_NOTES_7, CZECH_MONSTER_TITLES_7 } = await import("../src/lib/rulebook/czech-monster-notes-7.ts");
    const { CZECH_ITEM_NOTES_5, CZECH_ITEM_TITLES_5 } = await import("../src/lib/rulebook/czech-item-notes-5.ts");
    assert.equal(Object.keys(CZECH_MONSTER_NOTES_7).length, 70);
    assert.equal(Object.keys(CZECH_ITEM_NOTES_5).length, 70);
    for (const [kind, notes, titles, heading] of [
      ["monster", CZECH_MONSTER_NOTES_7, CZECH_MONSTER_TITLES_7, "Český přehled nestvůry"],
      ["item", CZECH_ITEM_NOTES_5, CZECH_ITEM_TITLES_5, "Český přehled předmětu"],
    ]) {
      const sourceByName = new Map(rulebookPages("en").filter((page) => page.kind === kind).map((page) => [page.title, page]));
      assert.deepEqual(Object.keys(notes).sort(), Object.keys(titles).sort());
      for (const [name, note] of Object.entries(notes)) {
        const original = sourceByName.get(name);
        assert.ok(original, `Unknown canonical SRD ${kind}: ${name}`);
        const localized = rulebookPage(original.id, "cs")?.page;
        assert.ok(localized, `Missing Czech page: ${name}`);
        assert.equal(localized.id, original.id);
        assert.equal(localized.title, titles[name]);
        assert.ok(localized.md.includes(heading) && localized.md.includes(note), `Unlinked Czech note: ${name}`);
        assert.ok(localized.md.endsWith(original.md), `Canonical English rules changed: ${name}`);
      }
    }
  });

  await test("the earlier Czech translation coverage was at least 783 canonical SRD pages", () => {
    const all = rulebookPages("cs");
    assert.equal(all.length, 933);
    const counts = Object.fromEntries(["rules", "race", "class", "spell", "item", "monster"].map((kind) => [
      kind, all.filter((page) => page.kind === kind && page.md.startsWith("## Český ")).length,
    ]));
    assert.equal(counts.rules, 35);
    assert.equal(counts.race, 9);
    assert.equal(counts.class, 12);
    assert.equal(counts.spell, 319);
    assert.ok(counts.item >= 166);
    assert.ok(counts.monster >= 242);
    assert.ok(Object.values(counts).reduce((sum, count) => sum + count, 0) >= 783);
  });

  await test("established Czech monster and magic-item names remain stable", () => {
    for (const [kind, english, czech] of [
      ["monster", "Gelatinous Cube", "Rosolová krychle"],
      ["monster", "Gibbering Mouther", "Blekotající tlamáč"],
      ["monster", "Grick", "Gryk"],
      ["monster", "Roc", "Noh"],
      ["monster", "Tarrasque", "Tarask"],
      ["monster", "Rakshasa", "Rakšáza"],
      ["monster", "Shield Guardian", "Štítový strážce"],
      ["monster", "Animated Armor (Animated Object)", "Oživlá zbroj"],
      ["item", "Bag of Holding", "Pytel beztíže"],
      ["item", "Flame Tongue", "Plamenec"],
      ["item", "Holy Avenger", "Posvěcený mstitel"],
      ["item", "Feather Token", "Quaalův péřový žeton"],
      ["item", "Portable Hole", "Přenosný otvor"],
    ]) {
      const original = rulebookPages("en").find((page) => page.kind === kind && page.title === english);
      assert.ok(original, `Not in SRD: ${english}`);
      assert.equal(rulebookPage(original.id, "cs").page.title, czech);
      assert.equal(czechSrdTitle(english, kind), czech);
    }
  });

  await test("all 76 remaining SRD monster and NPC pages have Czech titles and notes", async () => {
    const { CZECH_MONSTER_NOTES_8, CZECH_MONSTER_TITLES_8 } =
      await import("../src/lib/rulebook/czech-monster-notes-8.ts");
    assert.equal(Object.keys(CZECH_MONSTER_NOTES_8).length, 76);
    assert.deepEqual(Object.keys(CZECH_MONSTER_NOTES_8).sort(), Object.keys(CZECH_MONSTER_TITLES_8).sort());
    const originals = new Map(rulebookPages("en").filter((page) => page.kind === "monster").map((page) => [page.title, page]));
    for (const [name, note] of Object.entries(CZECH_MONSTER_NOTES_8)) {
      const source = originals.get(name);
      assert.ok(source, `Monster must belong to the canonical SRD: ${name}`);
      const localized = rulebookPage(source.id, "cs")?.page;
      assert.ok(localized, `Unlinked Czech monster: ${name}`);
      assert.equal(localized.id, source.id);
      assert.equal(localized.title, CZECH_MONSTER_TITLES_8[name]);
      assert.ok(localized.md.startsWith("## Český přehled nestvůry"));
      assert.ok(localized.md.includes(note));
      assert.ok(localized.md.endsWith(source.md), `Original English mechanics changed: ${name}`);
    }
  });

  await test("all 73 remaining canonical magic items have Czech titles and notes", async () => {
    const { CZECH_ITEM_NOTES_6, CZECH_ITEM_TITLES_6 } =
      await import("../src/lib/rulebook/czech-item-notes-6.ts");
    assert.equal(Object.keys(CZECH_ITEM_NOTES_6).length, 73);
    assert.deepEqual(Object.keys(CZECH_ITEM_NOTES_6).sort(), Object.keys(CZECH_ITEM_TITLES_6).sort());
    const originals = new Map(rulebookPages("en").filter((page) => page.kind === "item").map((page) => [page.title, page]));
    for (const [name, note] of Object.entries(CZECH_ITEM_NOTES_6)) {
      const source = originals.get(name);
      assert.ok(source, `Item must belong to canonical SRD: ${name}`);
      const localized = rulebookPage(source.id, "cs")?.page;
      assert.ok(localized, `Unlinked Czech item: ${name}`);
      assert.equal(localized.id, source.id);
      assert.equal(localized.title, CZECH_ITEM_TITLES_6[name]);
      assert.ok(localized.md.startsWith("## Český přehled předmětu"));
      assert.ok(localized.md.includes(note));
      assert.ok(localized.md.endsWith(source.md), `Original English item mechanics changed: ${name}`);
    }
  });

  await test("Czech companion summaries cover 932 of 933 SRD pages; English CC BY notice stays identical", () => {
    const original = rulebookPages("en");
    const localized = rulebookPages("cs");
    assert.equal(original.length, 933);
    assert.equal(localized.length, 933);
    const covered = localized.filter((page) => page.md.startsWith("## Český "));
    assert.equal(covered.length, 932);
    const byKind = Object.fromEntries(["rules", "race", "class", "spell", "monster", "item"].map((kind) => [
      kind, covered.filter((page) => page.kind === kind).length,
    ]));
    assert.deepEqual(byKind, { rules: 35, race: 9, class: 12, spell: 319, monster: 318, item: 239 });
    const sourceById = new Map(original.map((page) => [page.id, page]));
    for (const page of localized) {
      const source = sourceById.get(page.id);
      assert.ok(source, `Czech page without original ID: ${page.id}`);
      assert.equal(page.chapter, source.chapter);
      assert.ok(page.md.endsWith(source.md), `Canonical SRD changed: ${page.id}`);
    }
    const legalOriginal = rulebookPage("legal-information", "en")?.page;
    const legalCzech = rulebookPage("legal-information", "cs")?.page;
    assert.ok(legalOriginal && legalCzech);
    assert.equal(legalCzech.md, legalOriginal.md);
    assert.equal(legalCzech.title, "Licenční informace");
    assert.ok(!legalCzech.md.startsWith("## Český "));
  });

  await test("first 10 original full Czech SRD translations preserve IDs and source rules", async () => {
    const { CZECH_FULL_RULES_1 } = await import("../src/lib/rulebook/czech-full-rules-1.ts");
    const { CZECH_FULL_RULES_2 } = await import("../src/lib/rulebook/czech-full-rules-2.ts");
    const batch1 = Object.keys(CZECH_FULL_RULES_1);
    const batch2 = Object.keys(CZECH_FULL_RULES_2);
    assert.equal(batch1.length, 8);
    assert.equal(batch2.length, 2);
    assert.equal(new Set([...batch1, ...batch2]).size, 10);
    for (const [id, translation] of Object.entries({ ...CZECH_FULL_RULES_1, ...CZECH_FULL_RULES_2 })) {
      const source = rulebookPage(id, "en")?.page;
      const localized = rulebookPage(id, "cs")?.page;
      assert.ok(source && localized, `Unknown full SRD rule: ${id}`);
      assert.equal(source.id, localized.id);
      assert.equal(localized.title !== source.title || id === "beyond-1st-level", true);
      assert.ok(translation.length >= 400, `Unusually brief full translation: ${id}`);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(translation));
      assert.ok(localized.md.endsWith(source.md), `Original English rule altered: ${id}`);
      assert.ok(localized.md.startsWith("## Český přehled pravidel"));
    }
    const source = rulebookPage("legal-information", "en")?.page;
    const legal = rulebookPage("legal-information", "cs")?.page;
    assert.equal(legal.md, source.md);
    assert.equal(legal.title, "Licenční informace");
  });

  await test("Czech complete rules translations retain full numbered tables and mechanical details", async () => {
    const { CZECH_FULL_RULES_1 } = await import("../src/lib/rulebook/czech-full-rules-1.ts");
    const { CZECH_FULL_RULES_2 } = await import("../src/lib/rulebook/czech-full-rules-2.ts");
    assert.equal((CZECH_FULL_RULES_2["beyond-1st-level"].match(/\| \d[\d ]* \| \d+ \| \+\d \|/g) ?? []).length, 20);
    assert.match(CZECH_FULL_RULES_1.coinage, /1 000/);
    assert.match(CZECH_FULL_RULES_1.languages, /Podzemní obecná/);
    assert.match(CZECH_FULL_RULES_1.feats, /Zápasník/);
    assert.match(CZECH_FULL_RULES_1["trade-goods"], /500 zl/);
  });

  await test("four additional complete Czech SRD rule chapters retain their English source", async () => {
    const { CZECH_FULL_RULES_3 } = await import("../src/lib/rulebook/czech-full-rules-3.ts");
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_3).sort(), ["artifacts", "conditions", "diseases", "objects"]);
    const sourceById = new Map(rulebookPages("en").map((page) => [page.id, page]));
    for (const [id, translated] of Object.entries(CZECH_FULL_RULES_3)) {
      const original = sourceById.get(id);
      const localized = rulebookPage(id, "cs")?.page;
      assert.ok(original && localized, `Unknown SRD rules page: ${id}`);
      assert.equal(localized.id, original.id);
      assert.equal(localized.kind, original.kind);
      assert.ok(localized.md.startsWith("## Český přehled pravidel"), `Missing Czech overview: ${id}`);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(translated));
      assert.ok(translated.length > 2500, `Incomplete rule chapter: ${id}`);
      assert.ok(localized.md.endsWith(original.md), `English original changed: ${id}`);
    }
    assert.deepEqual(
      [...new Set([...Object.keys((await import("../src/lib/rulebook/czech-full-rules-1.ts")).CZECH_FULL_RULES_1),
        ...Object.keys((await import("../src/lib/rulebook/czech-full-rules-2.ts")).CZECH_FULL_RULES_2),
        ...Object.keys(CZECH_FULL_RULES_3)])].length,
      14,
    );
  });

  await test("Czech conditions, diseases and objects retain their full numerical SRD rules", async () => {
    const { CZECH_FULL_RULES_3 } = await import("../src/lib/rulebook/czech-full-rules-3.ts");
    for (const name of ["Oslepený", "Okouzlený", "Ohlušený", "Vyčerpání", "Vystrašený",
      "Uchvácený", "Neschopný", "Neviditelný", "Ochromený", "Zkamenělý",
      "Otrávený", "Sražený", "Zadržený", "Omráčený", "V bezvědomí"]) {
      assert.ok(CZECH_FULL_RULES_3.conditions.includes(`## ${name}`), name);
    }
    for (const n of ["| 1 |", "| 2 |", "| 3 |", "| 4 |", "| 5 |", "| 6 |"]) {
      assert.ok(CZECH_FULL_RULES_3.conditions.includes(n));
    }
    for (const n of ["Záchvaty smíchu", "Stoková nákaza", "Hniloba zraku"]) {
      assert.ok(CZECH_FULL_RULES_3.diseases.includes(n));
    }
    assert.match(CZECH_FULL_RULES_3.diseases, /SO 13/);
    assert.match(CZECH_FULL_RULES_3.diseases, /SO 11/);
    assert.match(CZECH_FULL_RULES_3.diseases, /SO 15/);
    assert.match(CZECH_FULL_RULES_3.objects, /Práh zranění/);
    assert.match(CZECH_FULL_RULES_3.objects, /\| Adamantin \| 23 \|/);
    assert.match(CZECH_FULL_RULES_3.artifacts, /40 mil/);
    assert.match(CZECH_FULL_RULES_3.artifacts, /1k4 \+ 3/);
    assert.match(CZECH_FULL_RULES_3.artifacts, /Sledování/);
  });

  await test("five more SRD rule pages render complete Czech translations without altering original rules", async () => {
    const { CZECH_FULL_RULES_4 } = await import("../src/lib/rulebook/czech-full-rules-4.ts");
    const { CZECH_FULL_RULES_5 } = await import("../src/lib/rulebook/czech-full-rules-5.ts");
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_4).sort(), ["magic-items", "mounts-and-vehicles", "tools"]);
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_5).sort(), ["poisons", "sentient-magic-items"]);
    for (const [id, translation] of Object.entries({ ...CZECH_FULL_RULES_4, ...CZECH_FULL_RULES_5 })) {
      const original = rulebookPage(id, "en")?.page;
      const localized = rulebookPage(id, "cs")?.page;
      assert.ok(original && localized, `Missing canonical rules page: ${id}`);
      assert.equal(original.id, localized.id);
      assert.equal(original.kind, "rules");
      assert.ok(translation.length > 3200, `Suspiciously short translation: ${id}`);
      assert.ok(localized.md.startsWith("## Český přehled pravidel"), `Missing Czech summary: ${id}`);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(translation), `Translation not wired into reader: ${id}`);
      assert.ok(localized.md.endsWith(original.md), `Changed original English rules: ${id}`);
    }
    const { CZECH_FULL_RULES_1 } = await import("../src/lib/rulebook/czech-full-rules-1.ts");
    const { CZECH_FULL_RULES_2 } = await import("../src/lib/rulebook/czech-full-rules-2.ts");
    const { CZECH_FULL_RULES_3 } = await import("../src/lib/rulebook/czech-full-rules-3.ts");
    const ids = [CZECH_FULL_RULES_1, CZECH_FULL_RULES_2, CZECH_FULL_RULES_3,
      CZECH_FULL_RULES_4, CZECH_FULL_RULES_5].flatMap((batch) => Object.keys(batch));
    assert.equal(ids.length, 19);
    assert.equal(new Set(ids).size, 19, "Duplicated full Czech rule page");
  });

  await test("translated poison mechanics and magic item limits match canonical numbers", async () => {
    const { CZECH_FULL_RULES_4 } = await import("../src/lib/rulebook/czech-full-rules-4.ts");
    const { CZECH_FULL_RULES_5 } = await import("../src/lib/rulebook/czech-full-rules-5.ts");
    const mounts = CZECH_FULL_RULES_4["mounts-and-vehicles"];
    for (const name of ["Velbloud", "Osel nebo mezek", "Slon", "Tažný kůň",
      "Jezdecký kůň", "Doga", "Poník", "Válečný kůň"]) {
      assert.ok(mounts.includes(`| ${name} |`), `Missing mount table row: ${name}`);
    }
    assert.match(mounts, /pětinásobku své základní nosnosti/);
    assert.match(mounts, /\| Galéra \| 30 000 zl \| 4 míle\/h \|/);
    assert.match(CZECH_FULL_RULES_4.tools, /\| Zlodějské náčiní \| 25 zl \| 1 libra \|/);
    assert.match(CZECH_FULL_RULES_4.tools, /zdatnost/i);
    assert.match(CZECH_FULL_RULES_4["magic-items"], /nejvýše se třemi kouzelnými předměty/);
    assert.match(CZECH_FULL_RULES_4["magic-items"], /více než 100 stop/);
    assert.match(CZECH_FULL_RULES_4["magic-items"], /24 hodin/);
    assert.match(CZECH_FULL_RULES_4["magic-items"], /nespotřebuje žádnou pozici kouzla uživatele/);
    const poisons = CZECH_FULL_RULES_5.poisons;
    for (const name of ["Vrahova krev", "Výpary spáleného othuru", "Hlen plíživce",
      "Drowský jed", "Éterická esence", "Zlovůle", "Půlnoční slzy",
      "Taggitův olej", "Bledá tinktura", "Jed purpurového červa",
      "Hadí jed", "Malátnost", "Sérum pravdy", "Jed wyverny"]) {
      assert.ok(poisons.includes(`***${name} (`), `Poison effect not translated: ${name}`);
    }
    for (const n of ["SO 10", "SO 11", "SO 13", "SO 15", "SO 16", "SO 17", "SO 19"]) {
      assert.ok(poisons.includes(n), `Missing poison saving throw: ${n}`);
    }
    const sentient = CZECH_FULL_RULES_5["sentient-magic-items"];
    assert.match(sentient, /4k6/);
    assert.match(sentient, /1k12 hodin/);
    assert.match(sentient, /SO 12 \+ oprava Charismatu předmětu/);
    for (const n of ["| 01–15 |", "| 97–100 |", "| 10 | **Hledač tvůrce"]) {
      assert.ok(sentient.includes(n), `Missing sentient-item table row: ${n}`);
    }
  });

  await test("three complete Czech SRD translations cover armor, madness and planes", async () => {
    const { CZECH_FULL_RULES_6 } = await import("../src/lib/rulebook/czech-full-rules-6.ts");
    const { CZECH_FULL_RULES_7 } = await import("../src/lib/rulebook/czech-full-rules-7.ts");
    const { CZECH_FULL_RULES_8 } = await import("../src/lib/rulebook/czech-full-rules-8.ts");
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_6), ["armor"]);
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_7), ["madness"]);
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_8), ["the-planes-of-existence"]);
    for (const [id, translated] of Object.entries({
      ...CZECH_FULL_RULES_6, ...CZECH_FULL_RULES_7, ...CZECH_FULL_RULES_8,
    })) {
      const original = rulebookPage(id, "en")?.page;
      const localized = rulebookPage(id, "cs")?.page;
      assert.ok(original && localized, `Missing source or Czech rules page: ${id}`);
      assert.equal(localized.id, original.id);
      assert.equal(localized.kind, "rules");
      assert.ok(translated.length > 5000, `Unexpectedly short Czech rules page: ${id}`);
      assert.ok(localized.md.startsWith("## Český přehled pravidel"));
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(translated), `Full Czech rules not connected: ${id}`);
      assert.ok(localized.md.endsWith(original.md), `English canonical SRD changed: ${id}`);
    }
    const modules = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8]
      .map((batch) => import(`../src/lib/rulebook/czech-full-rules-${batch}.ts`)));
    const ids = modules.flatMap((module, idx) => Object.keys(module[`CZECH_FULL_RULES_${idx + 1}`]));
    assert.equal(ids.length, 22);
    assert.equal(new Set(ids).size, 22, "Duplicated full Czech rules translation");
  });

  await test("Czech armor and madness tables preserve the 2014 SRD mechanical values", async () => {
    const { CZECH_FULL_RULES_6: batch6 } = await import("../src/lib/rulebook/czech-full-rules-6.ts");
    const { CZECH_FULL_RULES_7: batch7 } = await import("../src/lib/rulebook/czech-full-rules-7.ts");
    const { CZECH_FULL_RULES_8: batch8 } = await import("../src/lib/rulebook/czech-full-rules-8.ts");
    const armor = batch6.armor;
    for (const row of [
      "| Vycpávaná | 5 zl | 11 + oprava Obr |",
      "| Kožená | 10 zl | 11 + oprava Obr |",
      "| Pobíjená kožená | 45 zl | 12 + oprava Obr |",
      "| Kožešinová | 10 zl | 12 + oprava Obr (max. +2) |",
      "| Kroužková košile | 50 zl | 13 + oprava Obr (max. +2) |",
      "| Šupinová | 50 zl | 14 + oprava Obr (max. +2) |",
      "| Kyrys | 400 zl | 14 + oprava Obr (max. +2) |",
      "| Poloviční plátová | 750 zl | 15 + oprava Obr (max. +2) |",
      "| Kroužková | 30 zl | 14 |",
      "| Kroužková brň | 75 zl | 16 | Sil 13 |",
      "| Pásová | 200 zl | 17 | Sil 15 |",
      "| Plátová | 1 500 zl | 18 | Sil 15 |",
      "| Štít | 10 zl | +2 |",
      "| Lehká zbroj | 1 minuta | 1 minuta |",
      "| Střední zbroj | 5 minut | 1 minuta |",
      "| Těžká zbroj | 10 minut | 5 minut |",
      "| Štít | 1 akce | 1 akce |",
    ]) {
      assert.ok(armor.includes(row), `Missing armor rule/table row: ${row}`);
    }
    assert.ok(armor.includes("rychlost o 10 stop"));
    assert.ok(armor.includes("S pomocí dalšího tvora se zkrátí na polovinu"));
    const madness = batch7.madness;
    assert.ok(madness.includes("1k10 minut"));
    assert.ok(madness.includes("*Mluva sfér*"), "Madness rules must use established Czech spell title");
    assert.ok(madness.includes("1k10 × 10 hodin"));
    for (const range of [
      "01–20", "21–30", "31–40", "41–50", "51–60", "61–70",
      "71–75", "76–80", "81–90", "91–100",
      "01–10", "11–20", "41–45", "46–55", "56–65",
      "66–75", "76–85", "86–90", "91–95", "96–100",
      "01–15", "16–25", "26–30", "31–35", "36–45", "46–50",
      "51–55", "56–70", "71–80", "81–85", "86–95",
    ]) {
      assert.ok(madness.includes(`| ${range} |`), `Missing madness range: ${range}`);
    }
    assert.ok(madness.includes("SO 15"));
    const planes = batch8["the-planes-of-existence"];
    for (const term of [
      "Materiální sféra", "Éterická sféra", "Astrální sféra",
      "Vnitřní sféry", "Vnější sféry", "Horní sféry",
      "Dolní sféry", "Živelný chaos", "Polosféry",
    ]) {
      assert.ok(planes.includes(term), `Missing cosmology section: ${term}`);
    }
    assert.ok(planes.includes("šestnácti sfér"));
    assert.ok(planes.includes("*Spatři neviditelné*"));
    assert.ok(planes.includes("*Pravdivé vidění*"));
    assert.ok(madness.includes("*Mocné navrácení*"));
  });

  await test("complete Czech multiclassing and background rules remain source-faithful", async () => {
    const { CZECH_FULL_RULES_9 } = await import("../src/lib/rulebook/czech-full-rules-9.ts");
    const { CZECH_FULL_RULES_10 } = await import("../src/lib/rulebook/czech-full-rules-10.ts");
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_9), ["multiclassing"]);
    assert.equal(rulebookPage("multiclassing", "cs")?.page?.title, "Multipovolání");
    assert.ok(CZECH_FULL_RULES_9.multiclassing.startsWith("Multipovolání umožňuje"));
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_10), ["backgrounds"]);
    const translated = { ...CZECH_FULL_RULES_9, ...CZECH_FULL_RULES_10 };
    for (const [id, content] of Object.entries(translated)) {
      const en = rulebookPage(id, "en")?.page;
      const cs = rulebookPage(id, "cs")?.page;
      assert.ok(en && cs, `Canonical page missing: ${id}`);
      assert.equal(en.id, cs.id);
      assert.equal(en.kind, "rules");
      assert.ok(content.length > 6000, `Incomplete Czech translation: ${id}`);
      assert.ok(cs.md.startsWith("## Český přehled pravidel"));
      assert.ok(cs.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(cs.md.includes(content));
      assert.ok(cs.md.endsWith(en.md), `Original English rule altered: ${id}`);
    }
    const batches = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
      async (n) => {
        const module = await import(`../src/lib/rulebook/czech-full-rules-${n}.ts`);
        return module[`CZECH_FULL_RULES_${n}`];
      },
    ));
    const ids = batches.flatMap((batch) => Object.keys(batch));
    assert.equal(ids.length, 24);
    assert.equal(new Set(ids).size, 24, "Duplicate page ID in full Czech rules dictionaries");
  });

  await test("Czech multiclassing and acolyte preserve every numeric table and rule", async () => {
    const { CZECH_FULL_RULES_9 } = await import("../src/lib/rulebook/czech-full-rules-9.ts");
    const { CZECH_FULL_RULES_10 } = await import("../src/lib/rulebook/czech-full-rules-10.ts");
    const multi = CZECH_FULL_RULES_9.multiclassing;
    const backgrounds = CZECH_FULL_RULES_10.backgrounds;
    for (const klass of ["Barbar", "Bard", "Klerik", "Druid", "Bojovník",
      "Mnich", "Paladin", "Hraničář", "Tulák", "Čaroděj",
      "Černokněžník", "Kouzelník"]) {
      assert.ok(multi.includes(`| ${klass} |`), `Missing multiclass prerequisite: ${klass}`);
    }
    for (let level = 1; level <= 20; level++) {
      assert.ok(multi.includes(`| ${level} |`), `Multiclass spell slot table missing level ${level}`);
    }
    assert.ok(multi.includes("| 20 | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 1 |"));
    assert.ok(multi.includes("polovinu úrovní paladina a hraničáře, zaokrouhlenou dolů"));
    assert.ok(multi.includes("Usměrnění božské energie"));
    assert.ok(multi.includes("Paktová magie"));
    assert.ok(backgrounds.includes("**Zdatnosti v dovednostech:** Vhled, Náboženství"));
    assert.ok(backgrounds.includes("**15 zlatými**"));
    assert.ok(backgrounds.includes("### Schopnost: Útočiště věřících"));
    assert.ok(backgrounds.includes("## Akolyta"));
    for (let n = 1; n <= 8; n++) {
      assert.ok(backgrounds.includes(`| ${n} |`), `Missing akolyte personality trait ${n}`);
    }
    for (const table of ["| k6 | Ideál |", "| k6 | Pouto |", "| k6 | Vada |"]) {
      assert.ok(backgrounds.includes(table), `Missing background characteristic table: ${table}`);
    }
  });

  await test("complete Czech weapons and expenses retain every canonical SRD rule and ID", async () => {
    const { CZECH_FULL_RULES_11 } = await import("../src/lib/rulebook/czech-full-rules-11.ts");
    const { CZECH_FULL_RULES_12 } = await import("../src/lib/rulebook/czech-full-rules-12.ts");
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_11), ["weapons"]);
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_12), ["expenses"]);
    for (const [id, translated] of Object.entries({ ...CZECH_FULL_RULES_11, ...CZECH_FULL_RULES_12 })) {
      const en = rulebookPage(id, "en")?.page;
      const cs = rulebookPage(id, "cs")?.page;
      assert.ok(en && cs, `Missing canonical translated page: ${id}`);
      assert.equal(en.id, cs.id);
      assert.equal(en.kind, "rules");
      assert.ok(translated.length > 7000, `Unexpectedly short Czech page: ${id}`);
      assert.ok(cs.md.startsWith("## Český přehled pravidel"), `Missing Czech summary: ${id}`);
      assert.ok(cs.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(cs.md.includes(translated), `Missing complete Czech text: ${id}`);
      assert.ok(cs.md.endsWith(en.md), `Canonical English SRD changed: ${id}`);
    }
    const batches = await Promise.all(Array.from({ length: 12 }, (_, i) => import(
      `../src/lib/rulebook/czech-full-rules-${i + 1}.ts`,
    )));
    const ids = batches.flatMap((mod, i) => Object.keys(mod[`CZECH_FULL_RULES_${i + 1}`]));
    assert.equal(ids.length, 26, "Expected 26 complete Czech rules chapters");
    assert.equal(new Set(ids).size, 26, "Duplicate canonical SRD page in full translations");
  });

  await test("Czech weapon table preserves all 37 weapons, prices, damage dice and ranges", async () => {
    const { CZECH_FULL_RULES_11 } = await import("../src/lib/rulebook/czech-full-rules-11.ts");
    const weapons = CZECH_FULL_RULES_11.weapons;
    const rows = weapons.split("\n").filter((line) => /^\| .+ \|/.test(line));
    const names = ["Kyj", "Dýka", "Velký kyj", "Ruční sekera", "Oštěp", "Lehké kladivo",
      "Palcát", "Hůl", "Srp", "Kopí", "Lehká kuše", "Šipka", "Krátký luk", "Prak",
      "Bojová sekera", "Cep", "Sudlice", "Obouruční sekera", "Obouruční meč",
      "Halapartna", "Jezdecké kopí", "Dlouhý meč", "Obouruční kladivo",
      "Jitřenka", "Píka", "Rapír", "Šavle", "Krátký meč", "Trojzubec",
      "Válečný krumpáč", "Válečné kladivo", "Bič", "Foukačka", "Ruční kuše",
      "Těžká kuše", "Dlouhý luk", "Síť"];
    assert.equal(names.length, 37);
    for (const name of names) {
      assert.ok(rows.some((line) => line.startsWith(`| ${name} |`)), `Missing weapon ${name}`);
    }
    assert.ok(weapons.includes("| **Jednoduché zbraně na blízko** |"));
    assert.ok(weapons.includes("| **Jednoduché zbraně na dálku** |"));
    assert.ok(weapons.includes("| **Válečné zbraně na blízko** |"));
    assert.ok(weapons.includes("| **Válečné zbraně na dálku** |"));
    assert.ok(weapons.includes("| Dýka | 2 zl | 1k4 bodné | 1 |"));
    assert.ok(weapons.includes("| Obouruční meč | 50 zl | 2k6 sečné | 6 |"));
    assert.ok(weapons.includes("| Dlouhý luk | 50 zl | 1k8 bodné | 2 |"));
    assert.ok(weapons.includes("dosah 150/600"));
    assert.ok(weapons.includes("5 bodů sečného zranění"));
    assert.ok(weapons.includes("100 zl"));
    assert.ok(weapons.includes("1k4 zranění"));
  });

  await test("Czech living expenses have complete lifestyle, lodging and hireling price tables", async () => {
    const { CZECH_FULL_RULES_12 } = await import("../src/lib/rulebook/czech-full-rules-12.ts");
    const expenses = CZECH_FULL_RULES_12.expenses;
    for (const [lifestyle, price] of [
      ["Bídný", "—"], ["Zanedbaný", "1 st"], ["Chudý", "2 st"], ["Skromný", "1 zl"],
      ["Pohodlný", "2 zl"], ["Bohatý", "4 zl"], ["Aristokratický", "10 zl nejméně"],
    ]) {
      assert.ok(expenses.includes(`| ${lifestyle} | ${price} |`),
        `Incorrect lifestyle expenses: ${lifestyle}`);
    }
    for (const row of [
      "| ~ Zanedbaný | 7 md |", "| ~ Chudý | 1 st |", "| ~ Skromný | 5 st |",
      "| ~ Pohodlný | 8 st |", "| ~ Bohatý | 2 zl |", "| ~ Aristokratický | 4 zl |",
      "| ~ Zdatný | 2 zl za den |", "| ~ Nekvalifikovaný | 2 st za den |",
      "| Přeprava lodí | 1 st za míli |", "| Posel | 2 md za míli |",
    ]) {
      assert.ok(expenses.includes(row), `Missing translated price: ${row}`);
    }
    assert.ok(expenses.includes("Zdatnost v Přežití"));
    assert.ok(expenses.includes("10 až 50 zlatých"));
    assert.ok(expenses.includes("**Tabulka – Jídlo, pití a ubytování**"));
  });

  await test("Czech spell lists preserve every SRD spell and its class and spell level", async () => {
    const { CZECH_FULL_RULES_13 } = await import("../src/lib/rulebook/czech-full-rules-13.ts");
    const { CZECH_SPELLS } = await import("../src/lib/rulebook/czech-terms.ts");
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_13), ["spell-lists"]);
    // Only isolated spell titles are aligned with the Czech 2014 D&D grimoire.
    const spellNames2014 = {
      Friends: "Přátelé",
      Haste: "Rychlost",
      "Hold Person": "Znehybni osobu",
      Cloudkill: "Oblak smrti",
      "Tree Stride": "Chůze stromy",
      Passwall: "Projdi zdí",
      "Insect Plague": "Hmyzí zhouba",
      "Storm of Vengeance": "Bouře odplaty",
      "Contact Other Plane": "Mluva sfér",
      "Flesh to Stone": "Zkamenění",
      "Mass Cure Wounds": "Hromadné zhojení zranění",
      "Conjure Celestial": "Vyvolej nebešťana",
      "Conjure Fey": "Vyvolej vílu",
      "Create Undead": "Stvoř nemrtvé",
      "Dispel Evil and Good": "Rozptyl zlo a dobro",
      "Power Word Kill": "Slovo moci „ZABIJ“",
      "Power Word Stun": "Slovo moci „OCHROM“",
      "Alter Self": "Změň svůj tvar",
      Polymorph: "Proměň tvora",
      Seeming: "Hromadné přestrojení",
      "Wall of Force": "Zeď síly",
      Harm: "Zraň",
      "Planar Binding": "Sférická vazba",
      "Magic Jar": "Schránka života",
      "True Seeing": "Pravdivé vidění",
      Sunburst: "Sluneční záblesk",
      "Prismatic Spray": "Spektrální sprška",
      Feeblemind: "Slabomyslnost",
      "Mind Blank": "Ukryj mysl",
    };
    for (const [englishName, czechName] of Object.entries(spellNames2014)) {
      assert.equal(CZECH_SPELLS[englishName], czechName,
        `Czech 2014 grimoire title mismatch: ${englishName}`);
    }
    const source = rulebookPage("spell-lists", "en")?.page;
    const localized = rulebookPage("spell-lists", "cs")?.page;
    assert.ok(source && localized);
    assert.equal(localized.id, source.id);
    assert.equal(localized.kind, "rules");
    const original = source.md.split("\n");
    const translated = CZECH_FULL_RULES_13["spell-lists"].split("\n");
    assert.equal(translated.length, original.length, "Missing lines in Czech spell lists");
    let items = 0, headings = 0, levels = 0;
    for (let i = 0; i < original.length; i++) {
      const line = original[i], cz = translated[i];
      if (line.startsWith("- ")) {
        const name = line.slice(2).trim();
        assert.ok(CZECH_SPELLS[name], `Unknown Czech spell name: ${name}`);
        assert.equal(cz, `- ${CZECH_SPELLS[name]}`, `Wrong class/level spell at line ${i + 1}`);
        items++;
      } else if (line.startsWith("## ")) {
        assert.ok(cz.startsWith("## Kouzla "), `Untranslated class heading: ${cz}`);
        headings++;
      } else if (line.startsWith("#### ")) {
        assert.ok(cz.startsWith("#### ") && (cz.includes("úroveň") || cz.includes("Triky")),
          `Untranslated spell level: ${cz}`);
        levels++;
      } else {
        assert.equal(cz, line, `Nonspell content changed at line ${i + 1}`);
      }
    }
    assert.equal(items, 778);
    assert.equal(headings, 8);
    assert.equal(levels, 70);
    assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
    assert.ok(localized.md.includes(CZECH_FULL_RULES_13["spell-lists"]));
    assert.ok(localized.md.endsWith(source.md), "English spell lists altered");
  });

  await test("Czech multiverse pantheons preserve all 67 canonical deities and alignments", async () => {
    const { CZECH_FULL_RULES_14 } = await import("../src/lib/rulebook/czech-full-rules-14.ts");
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_14), ["gods-of-the-multiverse"]);
    const source = rulebookPage("gods-of-the-multiverse", "en")?.page;
    const localized = rulebookPage("gods-of-the-multiverse", "cs")?.page;
    assert.ok(source && localized);
    const original = source.md.split("\n");
    const translated = CZECH_FULL_RULES_14["gods-of-the-multiverse"];
    const sourceDeities = original.filter((line) => /^\| (?:The Daghdha|[A-Za-z]+)/.test(line))
      .map((line) => line.split("|")[1].trim())
      .filter((cell) => cell.includes(", god ") || cell.includes(", goddess "));
    assert.equal(sourceDeities.length, 67);
    const translatedDeities = translated.split("\n").filter(
      (line) => /^\| (?:The Daghdha|[A-Za-z]+)/.test(line) &&
        (line.includes(", bůh ") || line.includes(", bohyně ")),
    ).map((line) => line.split("|")[1].trim());
    assert.equal(translatedDeities.length, 67);
    for (let i = 0; i < 67; i++) {
      const name = sourceDeities[i].split(",")[0];
      assert.ok(translatedDeities[i].startsWith(name + ", "), `Deity order/identity changed: ${name}`);
    }
    for (const heading of ["Keltský panteon", "Řecký panteon", "Egyptský panteon",
      "Severský panteon", "Keltská božstva", "Řecká božstva",
      "Egyptská božstva", "Severská božstva"]) {
      assert.ok(translated.includes(heading), `Missing translated pantheon: ${heading}`);
    }
    assert.ok(translated.includes("| The Daghdha, bůh počasí a úrody | ChD | Příroda, Šalba |"));
    assert.ok(translated.includes("| Re-Horakhty, bůh slunce a vládce bohů | ZD | Život, Světlo |"));
    assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
    assert.ok(localized.md.includes(translated));
    assert.ok(localized.md.endsWith(source.md), "Original English deity tables changed");
    const batches = await Promise.all(Array.from({ length: 21 }, (_, i) =>
      import(`../src/lib/rulebook/czech-full-rules-${i + 1}.ts`)));
    const ids = batches.flatMap((mod, i) => Object.keys(mod[`CZECH_FULL_RULES_${i + 1}`]));
    assert.equal(ids.length, 35);
    assert.equal(new Set(ids).size, 35, "Duplicate SRD rules page with full Czech text");
  });

  await test("Czech traps include eight fully translated mechanical and magical examples", async () => {
    const { CZECH_FULL_RULES_15 } = await import("../src/lib/rulebook/czech-full-rules-15.ts");
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_15), ["traps"]);
    const translated = CZECH_FULL_RULES_15.traps;
    const en = rulebookPage("traps", "en").page;
    const cs = rulebookPage("traps", "cs").page;
    assert.ok(translated.length > 12000, "Traps text is unexpectedly short");
    assert.equal(cs.id, en.id, "The canonical rule ID is preserved");
    assert.ok(cs.md.includes("## Úplné znění pravidel v češtině"));
    assert.ok(cs.md.includes(translated), "Czech traps are wired into the reader");
    assert.ok(cs.md.endsWith(en.md), "The original English SRD remains unchanged");
    const examples = [
      "Hroutící se strop",
      "Padající síť",
      "Socha chrlící oheň",
      "Jámy",
      "Otrávené šipky",
      "Otrávená jehla",
      "Valící se kamenná koule",
      "Sféra anihilace",
    ];
    for (const name of examples) {
      assert.ok(translated.includes("### " + name), "Missing Czech sample trap: " + name);
    }
    for (const clause of [
      "| 1.–4. | 1k10 | 2k10 | 4k10 |",
      "| 17.–20. | 10k10 | 18k10 | 24k10 |",
      "22 (4k10) ohnivého zranění",
      "55 (10k10) drtivého zranění",
      "SO 18",
      "bonus +8",
      "20 liber",
    ]) {
      assert.ok(translated.includes(clause), "Missing canonical trap mechanic: " + clause);
    }
  });

  await test("complete Czech spellcasting preserves every core 2014 SRD constraint", async () => {
    const { CZECH_FULL_RULES_16 } = await import("../src/lib/rulebook/czech-full-rules-16.ts");
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_16), ["spellcasting"]);
    const translated = CZECH_FULL_RULES_16.spellcasting;
    const original = rulebookPage("spellcasting", "en").page;
    const localized = rulebookPage("spellcasting", "cs").page;
    assert.ok(translated.length > 15000, "Spellcasting full translation is unexpectedly short");
    assert.equal(original.id, localized.id);
    assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
    assert.ok(localized.md.includes(translated), "Czech spellcasting chapter must be connected to the reader");
    assert.ok(localized.md.endsWith(original.md), "English canonical SRD must remain unchanged");
    for (const section of [
      "# Co je kouzlo?", "## Pozice kouzel", "# Triky", "# Rituály",
      "## Doba sesílání", "## Složky kouzla", "## Trvání",
      "### Soustředění", "## Cíle kouzel", "## Oblasti účinku",
      "# Záchranné hody proti kouzlům", "# Útočné hody kouzly",
      "# Kombinování magických účinků",
    ]) {
      assert.ok(translated.includes(section), "Missing Czech spellcasting section: " + section);
    }
    for (const school of [
      "Vymítání", "Vyvolávání", "Věštění", "Očarování",
      "Zaklínání", "Iluze", "Nekromancie", "Transmutace",
    ]) {
      assert.ok(translated.includes("**" + school + " ("), "Missing translated school: " + school);
    }
    for (const clause of [
      "17. úrovně postavy", "čtyři pozice 1. úrovně a dvě pozice 2. úrovně",
      "o 10 minut déle", "trik, jehož doba seslání je jedna akce",
      "SO je 10 nebo polovina utrpěného zranění",
      "samostatný záchranný hod za každý zdroj zranění",
      "SO záchranného hodu proti tvému kouzlu = 8",
      "Bonus k útoku kouzlem =", "Účinky **téhož kouzla seslaného vícekrát se však nesčítají**",
    ]) {
      assert.ok(translated.includes(clause), "Missing spellcasting rule: " + clause);
    }
  });

  await test("Czech Adventuring retains all SRD 5.1 travel, environment, rests and downtime rules", async () => {
    const { CZECH_FULL_RULES_17 } = await import("../src/lib/rulebook/czech-full-rules-17.ts");
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_17), ["adventuring"]);
    const translated = CZECH_FULL_RULES_17.adventuring;
    const source = rulebookPage("adventuring", "en").page;
    const localized = rulebookPage("adventuring", "cs").page;
    assert.ok(translated.length > 17000, "Adventuring translation unexpectedly short");
    assert.equal(localized.id, source.id);
    assert.equal(localized.kind, "rules");
    assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
    assert.ok(localized.md.includes(translated));
    assert.ok(localized.md.endsWith(source.md), "The canonical English chapter changed");
    for (const heading of [
      "# Čas", "# Pohyb", "## Rychlost", "### Cestovní tempo",
      "### Obtížný terén", "### Skákání", "# Prostředí",
      "## Pád", "## Dušení", "## Vidění a světlo",
      "### Slepozrak", "### Vidění ve tmě", "### Pravé vidění",
      "## Jídlo a voda", "### Jídlo", "### Voda",
      "## Zacházení s předměty", "# Odpočinek",
      "## Krátký odpočinek", "## Dlouhý odpočinek",
      "# Mezi dobrodružstvími", "## Činnosti v mezidobí",
      "### Výroba předmětů", "### Výkon povolání",
      "### Zotavování", "### Bádání", "### Výcvik",
    ]) {
      assert.ok(translated.includes(heading), "Missing Czech Adventuring section: " + heading);
    }
    for (const clause of [
      "| Rychlé | 400 stop | 4 míle | 30 mil |",
      "| Běžné | 300 stop | 3 míle | 24 mil |",
      "| Pomalé | 200 stop | 2 míle | 18 mil |",
      "SO 10 + 1 za každou hodinu nad osmou",
      "3 + oprava Síly", "1k6 drtivého zranění",
      "20k6", "1 + oprava Odolnosti minut",
      "3 + oprava Odolnosti", "SO 15",
      "nejméně 8 hodin", "spát alespoň 6 hodin",
      "nejvýše 2 hodiny lehkou činností",
      "jednoho dlouhého odpočinku během 24 hodin",
      "1 500 zl", "300 dní výroby", "100 dní",
      "750 zl", "250 dní",
    ]) {
      assert.ok(translated.includes(clause), "Missing canonical Adventuring mechanic: " + clause);
    }
  });

  await test("Czech Adventuring Gear preserves all 103 item prices, 13 container capacities, seven packs and special mechanics", async () => {
    const { CZECH_FULL_RULES_18 } = await import("../src/lib/rulebook/czech-full-rules-18.ts");
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_18), ["adventuring-gear"]);
    const translated = CZECH_FULL_RULES_18["adventuring-gear"];
    const en = rulebookPage("adventuring-gear", "en").page;
    const cs = rulebookPage("adventuring-gear", "cs").page;
    assert.equal(cs.id, en.id);
    assert.equal(cs.kind, "rules");
    assert.ok(translated.length > 17000, "Czech gear translation unexpectedly short");
    assert.ok(cs.md.includes("## Úplné znění pravidel v češtině"));
    assert.ok(cs.md.includes(translated), "Full gear translation must be wired to the Czech reader");
    assert.ok(cs.md.endsWith(en.md), "Original English gear chapter must be unchanged");
    for (const title of [
      "## Vybavení se zvláštními pravidly",
      "## Výbavové balíčky",
      "## Tabulka – Dobrodružné vybavení",
      "## Tabulka – Kapacita nádob",
    ]) {
      assert.ok(translated.includes(title), "Missing gear section: " + title);
    }
    for (const pack of [
      "Lupičský balíček (16 zl)",
      "Diplomatický balíček (39 zl)",
      "Jeskyňářský balíček (12 zl)",
      "Zábavní balíček (40 zl)",
      "Průzkumnický balíček (10 zl)",
      "Kněžský balíček (19 zl)",
      "Badatelský balíček (40 zl)",
    ]) {
      assert.ok(translated.includes(pack), "Missing pack: " + pack);
    }
    const lines = translated.split("\n");
    const itemStart = lines.indexOf("| Předmět | Cena | Hmotnost |");
    const itemEnd = lines.indexOf("| Brousek | 1 md | 1 lb |");
    const containerStart = lines.indexOf("| Nádoba | Kapacita |");
    const containerEnd = lines.indexOf("| Měch na vodu | 4 pinty tekutiny |");
    assert.ok(itemStart > 0 && itemEnd > itemStart);
    assert.equal(itemEnd - itemStart - 1, 103, "Every item price table row should be present");
    assert.ok(containerStart > itemEnd && containerEnd > containerStart);
    assert.equal(containerEnd - containerStart - 1, 13, "Every container capacity should be present");
    for (const clause of [
      "2k6 kyselinového zranění",
      "1k4 ohnivého zranění na začátku každého svého tahu",
      "záchranném hodu na Obratnost proti SO 15",
      "10 použití",
      "2k6 zářivého zranění",
      "1k4 bodného zranění",
      "6 hodin",
      "záchranném hodu na Odolnost proti SO 10",
      "2k4 + 2 životů",
      "bonus +4 k ověření Síly",
      "50 zl | ½ lb",
      "1 000 zl | 1 lb",
      "| Torna* | 1 krychlová stopa / 30 liber výbavy |",
    ]) {
      assert.ok(translated.includes(clause), "Missing canonical equipment mechanic: " + clause);
    }
  });

  await test("Czech ability scores preserve six attributes, 18 skills, modifiers, checks and saving throws", async () => {
    const { CZECH_FULL_RULES_19 } = await import("../src/lib/rulebook/czech-full-rules-19.ts");
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_19), ["using-ability-scores"]);
    const translated = CZECH_FULL_RULES_19["using-ability-scores"];
    const source = rulebookPage("using-ability-scores", "en").page;
    const localized = rulebookPage("using-ability-scores", "cs").page;
    assert.equal(localized.id, source.id);
    assert.equal(localized.kind, "rules");
    assert.ok(translated.length > 25000, "Full Czech ability scores translation unexpectedly short");
    assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
    assert.ok(localized.md.includes(translated), "Czech reader must include full translated rules");
    assert.ok(localized.md.endsWith(source.md), "Original English SRD source must be unchanged");
    for (const section of [
      "## Hodnoty vlastností a jejich opravy",
      "# Výhoda a nevýhoda", "# Zdatnostní bonus", "# Ověření vlastností",
      "## Konflikty", "## Dovednosti", "## Pasivní ověření",
      "## Spolupráce", "### Skupinová ověření",
      "### Síla", "### Obratnost", "### Odolnost",
      "### Inteligence", "### Moudrost", "### Charisma",
      "#### Volitelné pravidlo: Zatížení", "# Záchranné hody",
    ]) {
      assert.ok(translated.includes(section), "Missing ability rules: " + section);
    }
    for (const skill of [
      "Atletika", "Akrobacie", "Čachry", "Nenápadnost",
      "Mystika", "Historie", "Pátrání", "Příroda", "Náboženství",
      "Ovládání zvířat", "Vhled", "Lékařství", "Vnímání",
      "Přežití", "Klamání", "Zastrašování", "Umění",
      "Přesvědčování",
    ]) {
      assert.ok(translated.includes(skill), "Missing Czech skill: " + skill);
    }
    for (const rule of [
      "| 1 | −5 |", "| 10–11 | +0 |", "| 30 | +10 |",
      "| Velmi snadný | 5 |", "| Téměř nemožný | 30 |",
      "vzájemně se ruší", "házíš jen", "nejvýše jednou jej násobíš",
      "Pasivní hodnota = 10 + všechny opravy",
      "alespoň polovina skupiny", "30 × hodnota Síly",
      "větší než 5 × hodnota Síly", "větší než 10 × hodnota Síly",
      "sníží o 20 stop", "pasivní Vnímání 14",
      "Inteligence (Mystika)", "Moudrost (Ovládání zvířat)",
    ]) {
      assert.ok(translated.includes(rule), "Missing canonical ability mechanic: " + rule);
    }
  });

  await test("Czech combat includes all 2014 SRD attacks, actions, movement, damage, death and special environments", async () => {
    const { CZECH_FULL_RULES_20 } = await import("../src/lib/rulebook/czech-full-rules-20.ts");
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_20), ["combat"]);
    const translated = CZECH_FULL_RULES_20.combat;
    const en = rulebookPage("combat", "en").page;
    const cs = rulebookPage("combat", "cs").page;
    assert.equal(cs.id, en.id);
    assert.equal(cs.kind, "rules");
    assert.ok(translated.length > 36000, "Full combat rules translation unexpectedly short");
    assert.ok(cs.md.includes("## Úplné znění pravidel v češtině"));
    assert.ok(cs.md.includes(translated), "Complete Czech combat must be visible in the reader");
    assert.ok(cs.md.endsWith(en.md), "Original English combat rules must remain unchanged");
    for (const heading of [
      "## Překvapení", "## Iniciativa", "## Tvůj tah",
      "## Bonusové akce", "# Reakce", "# Pohyb a pozice",
      "## Rozdělení pohybu", "## Ležení na zemi",
      "## Velikosti tvorů", "# Akce v boji",
      "## Útok", "## Seslání kouzla", "## Sprint (Dash)",
      "## Odpoutání se (Disengage)", "## Uhýbání (Dodge)",
      "## Pomoc (Help)", "## Schování se (Hide)",
      "## Příprava (Ready)", "## Hledání (Search)",
      "## Použití předmětu (Use an Object)",
      "# Zaútočení", "## Hody na útok",
      "## Nevidění útočníci a cíle", "## Útoky na dálku",
      "## Útoky na blízko", "#### Příležitostné útoky",
      "### Boj se dvěma zbraněmi", "### Chvat",
      "### Strčení tvora", "## Kryt", "## Zranění a léčení",
      "### Kritické zásahy", "### Záchranné hody proti smrti",
      "#### Stabilizování tvora", "## Dočasné životy",
      "# Boj na jízdním zvířeti", "# Boj pod vodou",
    ]) {
      assert.ok(translated.includes(heading), "Missing translated combat section: " + heading);
    }
    for (const rule of [
      "6 sekund", "jednu akci", "pasivní Moudrostí (Vnímání)",
      "rychlost 0", "1 stopa plazení stojí 3 stopy",
      "20 × 20 stop nebo větší",
      "přirozená 20", "přirozená 1",
      "1 + oprava Síly", "o 5 stop",
      "bonus +2 k OČ", "bonus +5 k OČ",
      "2k4 místo 1k4", "25 sníží na 20",
      "poloviční zranění", "10 nebo více",
      "třetím úspěchu", "třetím neúspěchu",
      "dva neúspěchy", "SO 10", "1k4 hodinách",
      "10 nebo 12", "nikdy však **22**",
      "polovinu tvé rychlosti", "tři akce: Sprint, Odpoutání se a Uhýbání",
      "automaticky mine cíl za běžným dostřelem",
      "odolnost vůči ohnivému zranění",
    ]) {
      assert.ok(translated.includes(rule), "Missing 2014 combat mechanic: " + rule);
    }
    for (const damageType of [
      "Kyselinové", "Drtivé", "Chladné", "Ohnivé",
      "Silové", "Bleskové", "Nekrotické", "Bodné",
      "Jedové", "Psychické", "Zářivé", "Sečné", "Hromové",
    ]) {
      assert.ok(translated.includes("***" + damageType + ".***"), "Missing translated damage type: " + damageType);
    }
  });

  await test("full Czech monster-statistics chapter preserves CR mechanics, tables and legendary actions", async () => {
    const { CZECH_FULL_RULES_21 } = await import("../src/lib/rulebook/czech-full-rules-21.ts");
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_21), ["monster-statistics"]);
    const translated = CZECH_FULL_RULES_21["monster-statistics"];
    const en = rulebookPage("monster-statistics", "en").page;
    const cs = rulebookPage("monster-statistics", "cs").page;
    assert.equal(cs.id, en.id);
    assert.equal(cs.kind, "rules");
    assert.ok(translated.length > 26000, "Monster statistics full Czech translation unexpectedly short");
    assert.ok(cs.md.includes("## Úplné znění pravidel v češtině"));
    assert.ok(cs.md.includes(translated), "Czech reader must render the full monster-statistics translation");
    assert.ok(cs.md.endsWith(en.md), "Unmodified canonical English monster rules must remain below the translation");
    for (const section of [
      "## Velikost", "## Typ tvora", "### Štítky typů",
      "## Přesvědčení", "## Obranné číslo", "## Životy",
      "## Rychlost", "### Hrabání", "### Šplhání", "### Létání",
      "### Plavání", "## Hodnoty vlastností", "## Záchranné hody",
      "## Dovednosti", "## Zranitelnosti, odolnosti a imunity",
      "## Smysly", "### Slepozrak", "### Vidění ve tmě",
      "### Vnímání otřesů", "### Pravé vidění", "## Jazyky",
      "### Telepatie", "## Stupeň nebezpečnosti",
      "### Zkušenostní body", "## Zvláštní vlastnosti",
      "### Vrozené sesílání kouzel", "### Sesílání kouzel",
      "### Psionika", "## Akce", "### Útoky na blízko a na dálku",
      "### Víceútok", "### Střelivo", "## Reakce",
      "## Omezené použití", "## Vybavení",
      "# Legendární tvorové", "## Legendární akce",
      "## Doupě legendárního tvora", "### Akce doupěte",
      "### Regionální účinky",
    ]) {
      assert.ok(translated.includes(section), "Missing Czech monster statistics section: " + section);
    }
    for (const type of [
      "Zrůdy", "Zvířata", "Nebešťané", "Výtvory",
      "Draci", "Elementálové", "Víly", "Běsové",
      "Obři", "Humanoidi", "Obludy", "Slizové",
      "Rostliny", "Nemrtví",
    ]) {
      assert.ok(translated.includes("**" + type + " ("), "Missing one of the 14 monster types: " + type);
    }
    for (const rule of [
      "2k8 + 2 životů", "2k8 kostkami životů",
      "| Gigantický | k20 | 10½ |",
      "oprava příslušné vlastnosti", "zdatnostní bonus",
      "nestvůra i zdroj otřesů se dotýkají stejné země",
      "může telepatické zprávy vysílat ani přijímat",
      "čtyř dobrodruhů", "SN 21 nebo vyšší",
      "pozici kouzla vyšší úrovně",
      "jiným kouzlem stejné úrovně ze seznamu téhož povolání",
      "SO = 10 + oprava Síly (Atletika)",
      "2k4 kusů střeliva", "2k10 kusů střeliva",
      "Obnovení 5–6", "k6", "20",
      "pouze na konci tahu jiného tvora",
      "prohrává všechny shody v iniciativě",
      "regionální účinky",
    ]) {
      assert.ok(translated.includes(rule), "Missing source mechanic in Czech chapter: " + rule);
    }
    const lines = translated.split("\n");
    const between = (start, last) => {
      const begin = lines.indexOf(start);
      const end = lines.indexOf(last);
      assert.ok(begin >= 0 && end > begin, "Cannot find table range: " + start);
      return lines.slice(begin + 2, end + 1);
    };
    const sizeRows = between("| Velikost | Prostor | Příklady |", "| Gigantický | 20 × 20 stop nebo více | kraken, purpurový červ |");
    const hitDiceRows = between("| Velikost nestvůry | Kostka životů | Průměr na kostku |", "| Gigantický | k20 | 10½ |");
    const proficiencyRows = between("| Stupeň nebezpečnosti (SN) | Zdatnostní bonus |", "| 30 | +9 |");
    const experienceRows = between("| Stupeň nebezpečnosti (SN) | Zkušenostní body (ZK) |", "| 30 | 155 000 |");
    assert.equal(sizeRows.length, 6);
    assert.equal(hitDiceRows.length, 6);
    assert.equal(proficiencyRows.length, 34);
    assert.equal(experienceRows.length, 34, "Every CR from 0, 1/8, 1/4, 1/2, and 1–30 needs XP");
    for (const [cr, expectedXp] of [
      [9, "5 000"], [10, "5 900"], [11, "7 200"],
      [12, "8 400"], [13, "10 000"], [26, "90 000"],
      [27, "105 000"], [28, "120 000"], [29, "135 000"],
      [30, "155 000"],
    ]) {
      assert.ok(experienceRows.includes("| " + cr + " | " + expectedXp + " |"),
        "Missing verified 2014 XP value for CR " + cr);
    }
  });

  await test("Czech 2014 D&D glossary uses all 18 official skill names without copying rule prose", async () => {
    const { CZECH_SKILLS } = await import("../src/lib/rulebook/czech-terms.ts");
    const expected = {
      Acrobatics: "Akrobacie",
      "Animal Handling": "Ovládání zvířat",
      Arcana: "Mystika",
      Athletics: "Atletika",
      Deception: "Klamání",
      History: "Historie",
      Insight: "Vhled",
      Intimidation: "Zastrašování",
      Investigation: "Pátrání",
      Medicine: "Lékařství",
      Nature: "Příroda",
      Perception: "Vnímání",
      Performance: "Umění",
      Persuasion: "Přesvědčování",
      Religion: "Náboženství",
      "Sleight of Hand": "Čachry",
      Stealth: "Nenápadnost",
      Survival: "Přežití",
    };
    assert.deepEqual(CZECH_SKILLS, expected);
    const { CZECH_CREATURE_TYPES } = await import("../src/lib/rulebook/czech-terms.ts");
    assert.equal(CZECH_CREATURE_TYPES.aberration, "zrůda");
    assert.equal(CZECH_CREATURE_TYPES.monstrosity, "obluda");
    assert.equal(CZECH_CREATURE_TYPES.construct, "výtvor");
    assert.equal(new Set(Object.values(CZECH_CREATURE_TYPES)).size, 14,
      "Every English creature type must have a distinct Czech name");
    const { CZECH_FULL_RULES_19 } = await import("../src/lib/rulebook/czech-full-rules-19.ts");
    const abilities = CZECH_FULL_RULES_19["using-ability-scores"];
    const { CZECH_FULL_RULES_21 } = await import("../src/lib/rulebook/czech-full-rules-21.ts");
    const monsterRules = CZECH_FULL_RULES_21["monster-statistics"];
    for (const title of [
      "**Zrůdy (aberrations)**",
      "**Obludy (monstrosities)**",
      "**Výtvory (constructs)**",
    ]) {
      assert.ok(monsterRules.includes(title), "Wrong Czech monster type: " + title);
    }
    for (const term of Object.values(expected)) {
      assert.ok(abilities.includes(term), "Missing Czech PHB skill name: " + term);
    }
    for (const old of [
      "Zacházení se zvířaty", "Obratnost rukou",
      "Plížení", "Vystupování", "Moudrost (Odhad)",
      "Inteligence (Magie)",
    ]) {
      assert.ok(!abilities.includes(old), "Outdated Czech skill name: " + old);
    }
    const { CZECH_FULL_RULES_20 } = await import("../src/lib/rulebook/czech-full-rules-20.ts");
    for (const action of [
      "## Sprint (Dash)", "## Odpoutání se (Disengage)",
      "## Uhýbání (Dodge)", "## Schování se (Hide)",
      "## Příprava (Ready)", "### Chvat",
    ]) {
      assert.ok(CZECH_FULL_RULES_20.combat.includes(action), "Missing Czech PHB combat action: " + action);
    }
  });

  await test("all 24 SRD 5.1 cantrips have full independent Czech texts without changing English content", async () => {
    const { CZECH_FULL_SPELLS_1 } = await import("../src/lib/rulebook/czech-full-spells-1.ts");
    const { CZECH_FULL_SPELLS_2 } = await import("../src/lib/rulebook/czech-full-spells-2.ts");
    const translated = { ...CZECH_FULL_SPELLS_1, ...CZECH_FULL_SPELLS_2 };
    const originalTricks = rulebookPages("en").filter(
      (page) => page.kind === "spell" && page.meta?.toLowerCase().includes("cantrip"),
    );
    assert.equal(originalTricks.length, 24, "Unexpected SRD 5.1 cantrip count");
    assert.equal(Object.keys(translated).length, 24, "Incomplete cantrip translation batch");
    assert.deepEqual(Object.keys(translated), originalTricks.map((page) => page.id),
      "Canonical spell IDs or spell ordering changed");
    assert.equal(Object.keys(CZECH_FULL_SPELLS_1).length, 12);
    assert.equal(Object.keys(CZECH_FULL_SPELLS_2).length, 12);

    for (const source of originalTricks) {
      const id = source.id;
      const csText = translated[id];
      const czech = rulebookPage(id, "cs")?.page;
      const english = rulebookPage(id, "en")?.page;
      assert.ok(czech && english, "Missing canonical cantrip page: " + id);
      assert.equal(czech.kind, "spell");
      assert.equal(czech.id, source.id);
      assert.equal(czech.title, CZECH_SPELLS[source.title],
        "A translated spell must use the central Czech spell glossary: " + id);
      assert.ok(csText.length >= 200, "Missing Czech rules text for cantrip: " + id);
      assert.ok(czech.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(czech.md.includes(csText), "Complete Czech spell text not in reader: " + id);
      assert.ok(czech.md.endsWith(english.md), "English SRD spell body altered: " + id);
      assert.equal(english.md, source.md, "Original SRD spell data altered: " + id);
      assert.equal(czech.originalMeta, source.meta, "Original spell metadata not preserved: " + id);

      for (const [field, translatedField] of [
        ["Casting Time", "Doba sesílání"],
        ["Range", "Dosah"],
        ["Components", "Složky"],
        ["Duration", "Trvání"],
      ]) {
        assert.ok(source.md.includes("**" + field + ":**"));
        assert.ok(csText.includes("**" + translatedField + ":**"),
          "Missing cantrip casting field " + translatedField + ": " + id);
      }
      const englishComponents = source.md.match(/\*\*Components:\*\* ([VSM, ]+)/)?.[1]?.trim();
      const czechComponents = csText.match(/\*\*Složky:\*\* ([VSM, ]+)/)?.[1]?.trim();
      assert.equal(czechComponents, englishComponents,
        "Changed verbal, somatic or material components: " + id);
      const sourceDice = [...new Set(source.md.match(/\b(?:\d+)?d\d+\b/g) ?? [])];
      for (const die of sourceDice) {
        assert.ok(csText.includes(die.replace("d", "k")),
          "Wrong or omitted cantrip damage/bonus die " + die + " in " + id);
      }
      const bulletCount = (md) => md.split("\n").filter((line) => line.startsWith("- ")).length;
      assert.equal(bulletCount(csText), bulletCount(source.md),
        "Incomplete list of cantrip effects: " + id);
    }

    for (const [id, requirements] of Object.entries({
      "acid-splash": ["2k6", "3k6", "4k6", "záchranném hodu na Obratnost"],
      "chill-touch": ["nemůže si obnovovat životy", "nevýhodu k hodům na útok"],
      "dancing-lights": ["**čtyři vznášející se světla**", "**bonusovou akcí**", "20 stop"],
      "eldritch-blast": ["**dva na 5. úrovni**", "**tři na 11. úrovni**", "**čtyři na 17. úrovni**"],
      "fire-bolt": ["**hořlavý předmět**", "**vznítí se**"],
      guidance: ["**jednou hodit k4**", "**jednomu ověření vlastnosti"],
      light: ["**jasné světlo v okruhu 20 stop", "**záchranném hodu na Obratnost**"],
      "mage-hand": ["**10 liber**", "**nemůže útočit"],
      mending: ["**nedokáže takovému předmětu vrátit ztracenou magii**"],
      message: ["**magické ticho**", "**tenká vrstva olova**", "**3 stopy dřeva**"],
      "minor-illusion": ["**ověření Inteligence (Pátrání)**", "**matný přelud**"],
      prestidigitation: ["**nejvýše tři jeho účinky"],
      "produce-flame": ["**kouzlo okamžitě skončí**", "**30 stop (6 sáhů)**"],
      "ray-of-frost": ["**rychlost se sníží o 10 stop"],
      resistance: ["**jednomu záchrannému hodu"],
      "sacred-flame": ["**nemá žádnou výhodu z krytu**"],
      shillelagh: ["**Kostka zranění této zbraně se změní na k8.**", "**zbraň pustíš**"],
      "shocking-grasp": ["**nemůže provádět reakce"],
      "spare-the-dying": ["**0 životů**", "**nepůsobí na nemrtvé ani na výtvory**"],
      thaumaturgy: ["**nejvýše tři z jeho účinků"],
      "true-strike": ["**Ve svém dalším tahu**", "**kouzlo neskončilo**"],
      "vicious-mockery": ["**cíl slyší**", "**nevýhodu k dalšímu hodu na útok**"],
    })) {
      for (const requirement of requirements) {
        assert.ok(translated[id].includes(requirement),
          "A key SRD 5.1 cantrip limitation was omitted: " + id + " / " + requirement);
      }
    }
  });

  await test("first 21 level-one SRD 5.1 spells have complete Czech mechanics and unchanged English originals", async () => {
    const [{ CZECH_FULL_SPELLS_3 }, { CZECH_FULL_SPELLS_4 }, { CZECH_SPELLS }] = await Promise.all([
      import("../src/lib/rulebook/czech-full-spells-3.ts"),
      import("../src/lib/rulebook/czech-full-spells-4.ts"),
      import("../src/lib/rulebook/czech-terms.ts"),
    ]);
    const translated = { ...CZECH_FULL_SPELLS_3, ...CZECH_FULL_SPELLS_4 };
    const firstLevel = rulebookPages("en").filter((page) =>
      page.kind === "spell" && page.meta?.startsWith("1st-level"));
    assert.equal(firstLevel.length, 49, "Unexpected SRD 5.1 first-level spell count");
    assert.equal(Object.keys(CZECH_FULL_SPELLS_3).length, 13);
    assert.equal(Object.keys(CZECH_FULL_SPELLS_4).length, 8);
    assert.deepEqual(Object.keys(translated), firstLevel.slice(0, 21).map((p) => p.id),
      "First-level spell translations must use canonical IDs and original order");

    const fieldLabels = [
      ["Casting Time", "Doba sesílání"],
      ["Range", "Dosah"],
      ["Components", "Složky"],
      ["Duration", "Trvání"],
    ];
    const originalField = (md, name) => md.split("\n")
      .find((line) => line.startsWith("**" + name + ":** "))?.slice(("**" + name + ":** ").length);
    const expected = {
      "Casting Time": {
        "1 action": "1 akce",
        "1 bonus action": "1 bonusová akce",
        "1 minute": "1 minuta",
        "1 reaction, which you take when you or a creature within 60 feet of you falls": "1 reakce",
      },
      Range: {
        "30 feet": "30 stop",
        "60 feet": "60 stop",
        "90 feet": "90 stop",
        Self: "Sesilatel",
        "Self (15-foot cone)": "Sesilatel (kužel 15 stop",
        Touch: "Dotyk",
      },
      Duration: {
        "8 hours": "8 hodin",
        "24 hours": "24 hodin",
        "Concentration, up to 1 minute": "Soustředění, až 1 minuta",
        Instantaneous: "Ihned",
        "1 hour": "1 hodina",
        "1 round": "1 kolo",
        "Concentration, up to 10 minutes": "Soustředění, až 10 minut",
        "1 minute": "1 minuta",
      },
    };
    for (const page of firstLevel.slice(0, 21)) {
      const translation = translated[page.id];
      const localized = rulebookPage(page.id, "cs")?.page;
      const canonical = rulebookPage(page.id, "en")?.page;
      assert.ok(localized && canonical, "Missing spell page: " + page.id);
      assert.equal(localized.id, canonical.id);
      assert.equal(localized.kind, "spell");
      assert.equal(localized.title, CZECH_SPELLS[page.title],
        "Spell title must use the established Czech glossary: " + page.id);
      assert.ok(translation.length > 250, "Incomplete Czech spell: " + page.id);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(translation), "Full Czech spell not rendered: " + page.id);
      assert.ok(localized.md.endsWith(canonical.md),
        "Canonical English source was changed: " + page.id);
      assert.equal(localized.originalMeta, canonical.meta,
        "Canonical spell metadata must remain accessible: " + page.id);

      for (const [englishName, czechName] of fieldLabels) {
        const sourceValue = originalField(page.md, englishName);
        const translatedValue = originalField(translation, czechName);
        assert.ok(sourceValue && translatedValue, "Missing spell attribute: " + page.id);
        if (englishName === "Components") {
          const letters = (x) => x.match(/^[VSM, ]+/)?.[0].trim();
          assert.equal(letters(translatedValue), letters(sourceValue),
            "Spell components changed: " + page.id);
        } else {
          assert.ok(translatedValue.startsWith(expected[englishName][sourceValue]),
            "Casting time, range or duration changed: " + page.id + "/" + englishName);
        }
      }
      const englishDice = [...new Set(page.md.match(/\b\d*d\d+\b/g) ?? [])];
      for (const die of englishDice) {
        assert.ok(translation.includes(die.replace("d", "k")),
          "Damage, healing or effect dice changed: " + page.id + "/" + die);
      }
      const sections = (md) => md.split("\n").filter((line) => /^\*\*\*[^*]+\*\*\*/.test(line)).length;
      assert.equal(sections(translation), sections(page.md),
        "Missing named effect or higher-level spellcasting section: " + page.id);
      if (page.md.includes("***At Higher Levels***")) {
        assert.ok(translation.includes("***Na vyšších úrovních.***"),
          "Higher-level scaling must be translated: " + page.id);
      }
    }

    for (const [id, restrictions] of Object.entries({
      alarm: ["**1 míle**", "**10 sekund**", "**60 stop (12 sáhů)**"],
      "animal-friendship": ["**Inteligenci 4 nebo vyšší**", "**vidět i slyšet**"],
      bane: ["**záchrannému hodu na Charisma**", "**odečíst**"],
      bless: ["**k4**", "**přičíst**"],
      "burning-hands": ["**3k6 ohnivého zranění**", "**polovinu**"],
      "charm-person": ["**výhodu**", "**Po skončení kouzla ví**"],
      "color-spray": ["**6k10**", "**oslepený až do konce tvého dalšího tahu**"],
      command: ["***Přistup.***", "***Pusť.***", "***Uteč.***", "***Poklekni.***", "***Zastav.***"],
      "comprehend-languages": ["**dotýkáš povrchu**", "**jedné stránky trvá přibližně 1 minutu**"],
      "create-or-destroy-water": ["***Stvoření vody.***", "***Zničení vody.***", "**10 galonů čisté vody**"],
      "cure-wounds": ["**1k8 + opravu tvé sesílací vlastnosti životů**", "**neúčinkuje na nemrtvé ani na výtvory**"],
      "detect-evil-and-good": ["**zrůda, nebešťan, elementál, víla, běs nebo nemrtvý**"],
      "detect-magic": ["**svou akcí**", "**školu magie**"],
      "detect-poison-and-disease": ["**přítomnost a polohu jedů, jedovatých tvorů a nemocí**"],
      "disguise-self": ["**Základní stavbu těla ani uspořádání končetin však změnit nemůžeš**"],
      "divine-favor": ["**1k4 zářivého zranění**"],
      entangle: ["**obtížným terénem**", "**zadržený**", "**svou akci k ověření Síly**"],
      "expeditious-retreat": ["**bonusovou akcí provést Sprint**", "**v každém svém dalším tahu**"],
      "faerie-fire": ["**neuspěje v záchranném hodu na Obratnost**", "**nemůže těžit z neviditelnosti**"],
      "false-life": ["**1k4 + 4 dočasné životy**", "**5 dočasných životů za každou úroveň pozice nad 1.**"],
      "feather-fall": ["**pět padajících tvorů**", "**60 stop (12 sáhů) za kolo**", "**neutrpí zranění pádem**"],
    })) {
      for (const phrase of restrictions) {
        assert.ok(translated[id].includes(phrase),
          "Missing first-level spell rule: " + id + "/" + phrase);
      }
    }
  });

  await test("all 49 first-level SRD spells have full Czech descriptions and exact mechanical fields", async () => {
    const modules = await Promise.all([3, 4, 5, 6, 7].map((i) =>
      import("../src/lib/rulebook/czech-full-spells-" + i + ".ts")));
    const batches = modules.map((module, index) =>
      module["CZECH_FULL_SPELLS_" + (index + 3)]);
    assert.deepEqual(batches.map((entry) => Object.keys(entry).length),
      [13, 8, 10, 10, 8]);
    const all = Object.assign({}, ...batches);
    const originals = rulebookPages("en").filter((page) =>
      page.kind === "spell" && page.meta?.startsWith("1st-level"));
    assert.equal(originals.length, 49);
    assert.deepEqual(Object.keys(all), originals.map((page) => page.id));
    const get = (md, label) => md.split("\n")
      .find((line) => line.startsWith("**" + label + ":** "))
      ?.slice(("**" + label + ":** ").length);
    const time = {
      "1 action": "1 akce", "1 bonus action": "1 bonusová akce",
      "1 minute": "1 minuta", "1 hour": "1 hodina",
    };
    const range = {
      "10 feet": "10 stop", "30 feet": "30 stop", "60 feet": "60 stop",
      "90 feet": "90 stop", "120 feet": "120 stop", Touch: "Dotyk",
      Self: "Sesilatel",
      "Self (15-foot cone)": "Sesilatel (kužel 15 stop",
      "Self (15-foot cube)": "Sesilatel (krychle o hraně 15 stop",
    };
    const duration = {
      Instantaneous: "Ihned", "1 round": "1 kolo",
      "1 minute": "1 minuta", "10 minutes": "10 minut",
      "1 hour": "1 hodina", "8 hours": "8 hodin",
      "24 hours": "24 hodin", "10 days": "10 dní",
      "Concentration, up to 1 minute": "Soustředění, až 1 minuta",
      "Concentration, up to 10 minutes": "Soustředění, až 10 minut",
      "Concentration up to 10 minutes": "Soustředění, až 10 minut",
      "Concentration, up to 1 hour": "Soustředění, až 1 hodina",
    };
    for (const original of originals) {
      const id = original.id;
      const translated = all[id];
      const localized = rulebookPage(id, "cs")?.page;
      const english = rulebookPage(id, "en")?.page;
      assert.ok(translated && localized && english, "Missing first-level spell: " + id);
      assert.equal(localized.title, CZECH_SPELLS[original.title],
        "Canonical translated spell name mismatch: " + id);
      assert.equal(localized.id, original.id);
      assert.equal(localized.originalMeta, original.meta);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(translated),
        "Missing full Czech description in reader: " + id);
      assert.ok(localized.md.endsWith(english.md),
        "Original English SRD description modified: " + id);
      for (const [englishField, czechField, mapping] of [
        ["Casting Time", "Doba sesílání", time],
        ["Range", "Dosah", range],
        ["Duration", "Trvání", duration],
      ]) {
        const oldValue = get(original.md, englishField);
        const converted = englishField === "Casting Time" && oldValue?.startsWith("1 reaction,")
          ? "1 reakce" : mapping[oldValue];
        const newValue = get(translated, czechField);
        assert.ok(converted && newValue?.startsWith(converted),
          "Changed casting time, range or duration: " + id + "/" + englishField);
      }
      const comp = (md, label) => get(md, label)?.match(/^[VSM, ]+/)?.[0]?.trim();
      assert.equal(comp(translated, "Složky"), comp(original.md, "Components"),
        "Original V/S/M components changed: " + id);
      for (const die of new Set(original.md.match(/\b\d*d\d+\b/g) ?? [])) {
        assert.ok(translated.includes(die.replace("d", "k")),
          "Original spell dice changed: " + id + "/" + die);
      }
      const sections = (md) => (md.match(/^\*\*\*[^*\n]+\*\*\*/gm) ?? []).length;
      const bullets = (md) => (md.match(/^- /gm) ?? []).length;
      assert.equal(sections(translated), sections(original.md),
        "Missing special effects or level scaling: " + id);
      assert.equal(bullets(translated), bullets(original.md),
        "Missing spell effect list entries: " + id);
      if (original.md.includes("***At Higher Levels***")) {
        assert.ok(translated.includes("***Na vyšších úrovních.***"),
          "Missing higher-level spell slot rules: " + id);
      }
    }
    const specialRules = {
      "find-familiar": [
            "**jen jednoho přítelíčka**",
            "**svou reakci**",
            "**Nemůže útočit**"
      ],
      "floating-disk": [
            "**500 liber**",
            "**100 stop (20 sáhů)**"
      ],
      "fog-cloud": [
            "**silně zahalená**",
            "**poloměr mlhy se zvětší o 20 stop (4 sáhy)**"
      ],
      "goodberry": [
            "**10 magických bobulí**",
            "**24 hodin od seslání**"
      ],
      "grease": [
            "**obtížný terén**",
            "**do oblasti vstoupí nebo v ní ukončí svůj tah**"
      ],
      "guiding-bolt": [
            "**4k6 zářivého zranění**",
            "**následující hod na útok proti tomuto cíli má výhodu**"
      ],
      "healing-word": [
            "**1k4 + opravu tvé sesílací vlastnosti životů**"
      ],
      "hellish-rebuke": [
            "**2k10 ohnivého zranění**",
            "**polovinu**"
      ],
      "heroism": [
            "**imunitu vůči vystrašení**",
            "**na začátku každého svého tahu**"
      ],
      "hideous-laughter": [
            "**Inteligencí 4 nebo nižší**",
            "**výhodu**"
      ],
      "hunters-mark": [
            "**8 hodin**",
            "**24 hodin**"
      ],
      "identify": [
            "**sladění**",
            "**kolik má případných nabití**"
      ],
      "illusory-script": [
            "**původní text i iluze**",
            "**přečíst skryté sdělení**"
      ],
      "inflict-wounds": [
            "**3k10 nekrotického zranění**"
      ],
      "jump": [
            "**vzdálenost jeho skoků ztrojnásobí**"
      ],
      "longstrider": [
            "**rychlost se zvýší o 10 stop (2 sáhy)**"
      ],
      "mage-armor": [
            "**základní OČ se rovná 13 + jeho oprava Obratnosti**"
      ],
      "magic-missile": [
            "**tři zářící střely magické síly**",
            "**1k4 + 1 silového zranění**"
      ],
      "protection-from-evil-and-good": [
            "**nemůže být zmámený, vystrašený ani posedlý**"
      ],
      "purify-food-and-drink": [
            "**nemagické jídlo a pití**",
            "**očistí od jedů a nemocí**"
      ],
      "sanctuary": [
            "**nepůsobí proti plošným účinkům**",
            "**záchranném hodu na Moudrost**"
      ],
      "shield": [
            "**bonus +5 k OČ**",
            "**neutrpíš žádné zranění kouzlem Magická střela**"
      ],
      "shield-of-faith": [
            "**bonus +2 k OČ**"
      ],
      "silent-image": [
            "**krychle o hraně 15 stop (3 sáhy)**",
            "**vidí skrze ni**"
      ],
      "sleep": [
            "**5k8**",
            "**upadne do bezvědomí**",
            "**Nemrtví a tvorové s imunitou vůči zmámení**"
      ],
      "speak-with-animals": [
            "**během posledního dne**",
            "**drobnou laskavost**"
      ],
      "thunderwave": [
            "**2k8 hromového zranění**",
            "**ohlušující ránu slyšitelnou až do 300 stop (60 sáhů)**"
      ],
      "unseen-servant": [
            "**OČ 10**",
            "**Sílu 2**",
            "**15 stop (3 sáhy)**"
      ]
};
    for (const [id, excerpts] of Object.entries(specialRules)) {
      for (const excerpt of excerpts) {
        assert.ok(all[id]?.includes(excerpt),
          "Important first-level spell mechanic missing: " + id + "/" + excerpt);
      }
    }
  });

  await test("all nine SRD 5.1 races have full independent Czech traits with unchanged English pages", async () => {
    const { CZECH_FULL_RACES_1 } = await import("../src/lib/rulebook/czech-full-races-1.ts");
    const { CZECH_FULL_RACES_2 } = await import("../src/lib/rulebook/czech-full-races-2.ts");
    const translatedRaces = { ...CZECH_FULL_RACES_1, ...CZECH_FULL_RACES_2 };
    const englishRacePages = rulebookPages("en").filter((page) => page.kind === "race");
    const expectedIds = [
      "dwarf", "elf", "halfling", "human", "dragonborn",
      "gnome", "half-elf", "half-orc", "tiefling",
    ];
    assert.deepEqual(Object.keys(translatedRaces), expectedIds);
    assert.deepEqual(englishRacePages.map((page) => page.id).sort(), [...expectedIds].sort());

    const { CZECH_RACES } = await import("../src/lib/rulebook/czech-terms.ts");
    for (const id of expectedIds) {
      const content = translatedRaces[id];
      const english = rulebookPage(id, "en")?.page;
      const czech = rulebookPage(id, "cs")?.page;
      assert.ok(english && czech, "Missing race page: " + id);
      assert.equal(english.kind, "race");
      assert.equal(czech.kind, "race");
      assert.equal(czech.id, english.id);
      assert.equal(czech.title, CZECH_RACES[english.title]);
      assert.ok(content.length > 800, "Incomplete Czech race traits: " + id);
      assert.ok(czech.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(czech.md.includes(content), "Missing Czech race rules in reader: " + id);
      assert.ok(czech.md.endsWith(english.md), "English race source changed: " + id);

      const headingLevels = (markdown) => markdown.split("\n")
        .filter((line) => /^#{2,3} /.test(line)).map((line) => line.match(/^#+/)[0].length);
      assert.deepEqual(headingLevels(content), headingLevels(english.md),
        "Missing or extra SRD race/subrace sections: " + id);
      const traitCount = (markdown) => markdown.split("\n")
        .filter((line) => line.startsWith("***")).length;
      assert.equal(traitCount(content), traitCount(english.md),
        "Missing or extra racial traits: " + id);
      assert.ok(content.includes("***Zvýšení hodnot vlastností.***"));
      assert.ok(content.includes("***Rychlost.***"));
      assert.ok(content.includes("***Jazyky.***"));
    }

    const dwarf = translatedRaces.dwarf;
    assert.ok(dwarf.includes("## Kopcový trpaslík"));
    assert.ok(dwarf.includes("***Trpasličí nezlomnost.***"));
    assert.ok(dwarf.includes("***Trpasličí nezdolnost.***"));
    assert.ok(dwarf.includes("25 stop (5 sáhů)"));
    const elf = translatedRaces.elf;
    assert.ok(elf.includes("## Vznešený elf"));
    assert.ok(elf.includes("***Trans.***"));
    assert.ok(elf.includes("**4 hodiny hlubokou meditací**"));
    const halfling = translatedRaces.halfling;
    assert.ok(halfling.includes("## Tichošlápek"));
    assert.ok(halfling.includes("***Přirozená nenápadnost.***"));
    assert.ok(halfling.includes("**Nový výsledek musíš použít**"));
    const human = translatedRaces.human;
    assert.ok(human.includes("**Každá ze šesti tvých vlastností se zvýší o 1**"));

    const dragonborn = translatedRaces.dragonborn;
    const ancestryNames = [
      "Černý", "Modrý", "Mosazný", "Bronzový", "Měděný",
      "Zlatý", "Zelený", "Rudý", "Stříbrný", "Bílý",
    ];
    for (const name of ancestryNames) {
      assert.ok(dragonborn.includes("| " + name + " |"),
        "Missing Draconic Ancestry table entry: " + name);
    }
    assert.equal(dragonborn.split("\n").filter((line) => /^\| (Černý|Modrý|Mosazný|Bronzový|Měděný|Zlatý|Zelený|Rudý|Stříbrný|Bílý) \|/.test(line)).length, 10);
    for (const amount of ["2k6", "3k6", "4k6", "5k6"]) {
      assert.ok(dragonborn.includes(amount), "Missing Breath Weapon damage step " + amount);
    }
    assert.ok(dragonborn.includes("8 + tvá oprava Odolnosti + tvůj zdatnostní bonus"));
    const gnome = translatedRaces.gnome;
    assert.ok(gnome.includes("## Skalní gnóm"));
    for (const name of ["Mechanická hračka", "Zapalovač", "Hudební skříňka"]) {
      assert.ok(gnome.includes("***" + name + ".***"), "Missing gnome tinkering device: " + name);
    }
    for (const value of ["**10 zl**", "**24 hodin**", "**nejvýše tři**"]) {
      assert.ok(gnome.includes(value), "Missing Gnome Tinker limit: " + value);
    }
    const halfOrc = translatedRaces["half-orc"];
    assert.ok(halfOrc.includes("***Zarytá houževnatost.***"));
    assert.ok(halfOrc.includes("***Divoké útoky.***"));
    assert.ok(translatedRaces["half-elf"].includes("***Dovednostní všestrannost.***"));
    const tiefling = translatedRaces.tiefling;
    assert.ok(tiefling.includes("***Pekelné dědictví.***"));
    assert.ok(tiefling.includes("Od **3. úrovně**"));
    assert.ok(tiefling.includes("Od **5. úrovně**"));
    assert.ok(tiefling.includes("**dlouhého odpočinku**"));
  });

  await test("all twelve SRD 5.1 classes have full original Czech rules and unmodified English source", async () => {
    const classIds = [
      "fighter", "rogue", "barbarian", "bard", "cleric", "druid",
      "monk", "paladin", "ranger", "sorcerer", "warlock", "wizard",
    ];
    const modules = await Promise.all(Array.from({ length: 12 }, (_, i) =>
      import("../src/lib/rulebook/czech-full-classes-" + (i + 1) + ".ts")));
    const allIds = modules.flatMap((mod, i) => Object.keys(mod["CZECH_FULL_CLASSES_" + (i + 1)]));
    assert.deepEqual(allIds, classIds, "Every class has exactly one standalone Czech translation");

    for (let i = 0; i < classIds.length; i++) {
      const id = classIds[i];
      const translated = modules[i]["CZECH_FULL_CLASSES_" + (i + 1)][id];
      const source = rulebookPage(id, "en").page;
      const localized = rulebookPage(id, "cs").page;
      assert.equal(source.kind, "class");
      assert.equal(localized.id, id);
      assert.equal(localized.kind, "class");
      assert.ok(translated.length > 5000, "Class translation unexpectedly short: " + id);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(translated), "Complete Czech class not in reader: " + id);
      assert.ok(localized.md.endsWith(source.md), "Canonical English SRD must be intact: " + id);
      assert.ok(translated.includes("### Schopnosti povolání"), "Class introduction not localized: " + id);
      assert.ok(translated.includes("#### Zdatnosti"), "Class proficiencies not localized: " + id);
      assert.ok(translated.includes("#### Počáteční vybavení"), "Class starting equipment not localized: " + id);
      const sourceHeadings = (source.md.match(/^#{2,5} /gm) ?? []).length;
      const translatedHeadings = (translated.match(/^#{2,5} /gm) ?? []).length;
      assert.equal(translatedHeadings, sourceHeadings,
        "A class feature, subclass feature or rules section was omitted: " + id);
      assert.ok(translated.includes("### Zvýšení hodnot vlastností"), "Ability score increase missing: " + id);
      assert.ok(translated.includes("**Tabulka – "), "Class progression table missing: " + id);

      const firstTableAt = translated.indexOf("| Úroveň |");
      assert.ok(firstTableAt >= 0, "Class progression table header missing: " + id);
      const firstTable = translated.slice(firstTableAt).split("\n\n")[0];
      const localRows = firstTable.split("\n").filter((line) => /^\|\s*\d+\.\s*\|/.test(line));
      const englishRows = source.md.split("\n").filter((line) => /^\|\s*\d+(st|nd|rd|th)\s*\|/.test(line)).slice(0, 20);
      assert.equal(localRows.length, 20, "Expected full class progression 1–20: " + id);
      assert.equal(englishRows.length, 20, "Expected source class progression: " + id);
      for (let level = 1; level <= 20; level++) {
        const enCells = englishRows[level - 1].split("|").slice(1, -1).map((cell) => cell.trim());
        const csCells = localRows[level - 1].split("|").slice(1, -1).map((cell) => cell.trim());
        assert.ok(csCells[0] === level + ".", "Class levels must be in ascending order: " + id);
        assert.equal(csCells.length, enCells.length, "Progression table columns changed: " + id);
        for (let col = 1; col < enCells.length; col++) {
          if (/^(?:[+-]?\d+|[-–]|\d+d\d+|\+\d+\s*ft\.)$/.test(enCells[col])) {
            const value = enCells[col].replace(/(\d+)d(\d+)/g, "$1k$2");
            assert.equal(csCells[col], value,
              "Changed slot count, proficiency, damage die or other value in " + id +
              " level " + level + " column " + col);
          }
        }
      }
    }

    const { CZECH_FULL_CLASSES_6 } = await import("../src/lib/rulebook/czech-full-classes-6.ts");
    const druid = CZECH_FULL_CLASSES_6.druid;
    for (const region of ["Arktida", "Pobřeží", "Poušť", "Hvozd", "Pláň", "Hory", "Bažina"]) {
      assert.ok(druid.includes("**" + region + " – kouzla kruhu**"),
        "Missing a Czech Circle of Land terrain spell list: " + region);
    }
    assert.ok(druid.includes("**Tabulka – Zvířecí podoby**"));
    for (const spell of ["Rychlost", "Znehybni osobu", "Chůze stromy", "Projdi zdí", "Hmyzí zhouba"]) {
      assert.ok(druid.includes("*" + spell + "*"), "Druid circle uses wrong Czech spell name: " + spell);
    }
    for (const old of ["Zrychlení", "Zadrž osobu", "Krok stromy", "Průchod zdí", "Hmyzí pohroma"]) {
      assert.ok(!druid.includes("*" + old + "*"), "Obsolete Druid circle spell name: " + old);
    }

    const { CZECH_FULL_CLASSES_10 } = await import("../src/lib/rulebook/czech-full-classes-10.ts");
    const sorcerer = CZECH_FULL_CLASSES_10.sorcerer;
    for (const name of [
      "Opatrné kouzlo", "Vzdálené kouzlo", "Posílené kouzlo", "Prodloužené kouzlo",
      "Zostřené kouzlo", "Zrychlené kouzlo", "Záludné kouzlo", "Zdvojené kouzlo",
    ]) {
      assert.ok(sorcerer.includes("#### " + name), "Missing Metamagic option: " + name);
    }
    for (const price of [
      "| 1. | 2 |", "| 2. | 3 |", "| 3. | 5 |",
      "| 4. | 6 |", "| 5. | 7 |",
    ]) assert.ok(sorcerer.includes(price), "Missing sorcery-point slot cost: " + price);

    const { CZECH_FULL_CLASSES_11 } = await import("../src/lib/rulebook/czech-full-classes-11.ts");
    const warlock = CZECH_FULL_CLASSES_11.warlock;
    const invocations = warlock.split("### Seznam tajemných vzývání")[1].split("## Nadpozemští patroni")[0];
    assert.equal((invocations.match(/^#### /gm) ?? []).length, 32,
      "Every SRD 5.1 Eldritch Invocation needs an independently authored Czech description");
    for (const pact of ["Pakt řetězu", "Pakt čepele", "Pakt rukověti"]) {
      assert.ok(warlock.includes("#### " + pact), "Missing warlock Pact Boon: " + pact);
    }

    const { CZECH_FULL_CLASSES_12 } = await import("../src/lib/rulebook/czech-full-classes-12.ts");
    // Terminology alone follows the Czech 2014 PHB; class mechanics remain from SRD 5.1.
    const establishedClassLabels = {
      fighter: ["Mimořádný atlet", "Dokonalejší kritický zásah", "Zarputilec"],
      bard: ["Kolej znalostí", "Slovní výpad", "Nedostižná dovednost"],
      cleric: ["Ničení nemrtvých", "Doménová kouzla"],
      druid: ["Nestárnoucí tělo", "Kruhová kouzla", "Přírodní svatyně"],
      monk: ["Klid", "Smrtící dlaň"],
      paladin: ["Vnímání božství", "Přikládání rukou", "Boží úder", "Čistota duše", "Svatozář"],
      ranger: ["Rozený průzkumník", "Pravěká ostražitost", "Zvířecí smysly", "Mimořádná lovcova obrana"],
      sorcerer: ["Dračí nezlomnost", "Spřízněnost s živly", "Dračí vzhled"],
    };
    for (const [id, labels] of Object.entries(establishedClassLabels)) {
      const index = classIds.indexOf(id);
      const translated = modules[index]["CZECH_FULL_CLASSES_" + (index + 1)][id];
      for (const label of labels) {
        assert.ok(translated.includes(label), `Missing Czech 2014 class label in ${id}: ${label}`);
      }
    }
    for (const [id, outdated] of Object.entries({
      fighter: ["Pozoruhodný atlet", "Vynikající kritický zásah", "Přeživší"],
      bard: ["Kolej vědění", "Jízlivá slova"],
      druid: ["Ochrana přírody", "Útočiště přírody"],
      monk: ["Poklid", "Chvějící se dlaň"],
      paladin: ["Božský smysl", "Vkládání rukou", "Svatá záře"],
      ranger: ["Průzkumník přírody", "Divoké smysly", "Skrývání na očích"],
      sorcerer: ["Dračí odolnost", "Živelná příbuznost", "Dračí přítomnost"],
    })) {
      const index = classIds.indexOf(id);
      const translated = modules[index]["CZECH_FULL_CLASSES_" + (index + 1)][id];
      for (const label of outdated) {
        assert.ok(!translated.includes(label), `Outdated Czech class label in ${id}: ${label}`);
      }
    }
    const wizard = CZECH_FULL_CLASSES_12.wizard;
    assert.ok(wizard.includes("### Škola zaklínání"));
    assert.ok(wizard.includes("**Za každou úroveň kouzla to stojí 2 hodiny a 50 zl**"));
    assert.ok(wizard.includes("**1 hodinu a 10 zl za každou úroveň kouzla**"));
  });


  await test("first 12 second-level SRD 5.1 spells have complete independent Czech rules", async () => {
    const { CZECH_FULL_SPELLS_8 } = await import("../src/lib/rulebook/czech-full-spells-8.ts");
    const ids = ["acid-arrow","aid","alter-self","animal-messenger","arcane-lock","arcanists-magic-aura","augury","barkskin","blindness-deafness","blur","branding-smite","calm-emotions"];
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_8), ids);
    const originals = rulebookPages("en").filter((page) =>
      page.kind === "spell" && page.meta?.startsWith("2nd-level"));
    assert.deepEqual(originals.slice(0, ids.length).map((page) => page.id), ids,
      "Second-level spell batch must follow the original SRD ordering");
    for (const original of originals.slice(0, ids.length)) {
      const fullText = CZECH_FULL_SPELLS_8[original.id];
      const czPage = rulebookPage(original.id, "cs").page;
      assert.ok(fullText.length >= 220, "Missing full Czech spell: " + original.id);
      assert.equal(czPage.title, CZECH_SPELLS[original.title]);
      assert.equal(czPage.id, original.id);
      assert.equal(czPage.originalMeta, original.meta);
      assert.ok(czPage.md.includes(fullText), "Czech reader missing text: " + original.id);
      assert.ok(czPage.md.endsWith(original.md), "English SRD was changed: " + original.id);
      for (const field of ["Doba sesílání", "Dosah", "Složky", "Trvání"]) {
        assert.ok(fullText.includes("**" + field + ":**"), "Missing spell field: " + original.id + " / " + field);
      }
      const components = (text, label) => {
        const prefix = "**" + label + ":** ";
        const line = text.split("\n").find((candidate) => candidate.startsWith(prefix));
        return line?.slice(prefix.length).match(/^[VSM, ]+/)?.[0]?.trim();
      };
      const originalComponents = components(original.md, "Components");
      const czComponents = components(fullText, "Složky");
      assert.ok(originalComponents, "English components missing: " + original.id);
      assert.ok(czComponents, "Czech components missing: " + original.id);
      assert.equal(czComponents, originalComponents, "Components differ: " + original.id);
    }
    for (const [id, tokens] of Object.entries({
      "acid-arrow": ["4k4", "2k4", "1k4", "polovinu", "90 stop"],
      aid: ["maximum životů o 5", "současný počet životů o 5", "8 hodin"],
      "alter-self": ["žábry", "1k6", "bonus +1", "neozbrojené údery"],
      "animal-messenger": ["25 slov", "50 mil", "25 mil", "48 hodin"],
      "arcane-lock": ["25 zl", "1 minutu", "10 minut", "SO", "o 10"],
      "arcanists-magic-aura": ["30 po sobě jdoucích dní", "Falešná aura", "Maska"],
      augury: ["30 minut", "25 %", "dlouhým odpočinkem"],
      barkskin: ["OČ nemůže být nižší než 16"],
      "blindness-deafness": ["Odolnost", "na konci každého svého tahu", "dalšího tvora"],
      blur: ["nevýhodu", "slepozrakost", "pravého vidění"],
      "branding-smite": ["2k6", "5 stop", "neviditelným", "1k6"],
      "calm-emotions": ["20 stop", "Charisma", "zmámený", "vystrašený"],
    })) {
      for (const token of tokens) assert.ok(CZECH_FULL_SPELLS_8[id].includes(token), "Missing 2nd-level spell mechanic: " + id + "/" + token);
    }
  });


  await test("second-level SRD spells 13–25 have complete Czech descriptions", async () => {
    const { CZECH_FULL_SPELLS_9 } = await import("../src/lib/rulebook/czech-full-spells-9.ts");
    const expected = ["continual-flame","darkness","darkvision","detect-thoughts","enhance-ability","enlarge-reduce","enthrall","find-steed","find-traps","flame-blade","flaming-sphere","gentle-repose","gust-of-wind"];
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_9), expected);
    const originals = rulebookPages("en").filter((page) =>
      page.kind === "spell" && page.meta?.startsWith("2nd-level"));
    assert.deepEqual(originals.slice(12, 25).map((page) => page.id), expected);
    function componentLetters(markdown, label) {
      const prefix = "**" + label + ":** ";
      return markdown.split("\n").find((line) => line.startsWith(prefix))
        ?.slice(prefix.length).match(/^[VSM, ]+/)?.[0].trim();
    }
    for (const original of originals.slice(12, 25)) {
      const translated = CZECH_FULL_SPELLS_9[original.id];
      const displayed = rulebookPage(original.id, "cs").page;
      assert.ok(translated?.length >= 220, "Missing spell: " + original.id);
      assert.equal(displayed.id, original.id);
      assert.equal(displayed.title, CZECH_SPELLS[original.title]);
      assert.equal(displayed.originalMeta, original.meta);
      assert.ok(displayed.md.includes(translated), "Czech text not in reader: " + original.id);
      assert.ok(displayed.md.endsWith(original.md), "English source changed: " + original.id);
      for (const label of ["Doba sesílání", "Dosah", "Složky", "Trvání"])
        assert.ok(translated.includes("**" + label + ":**"), "Missing: " + label + "/" + original.id);
      const originalComponents = componentLetters(original.md, "Components");
      assert.ok(originalComponents, "Original components missing: " + original.id);
      assert.equal(componentLetters(translated, "Složky"), originalComponents);
      for (const [, count, die] of original.md.matchAll(/\b(\d+)d(\d+)\b/g))
        assert.ok(translated.includes(count + "k" + die), "Missing dice: " + original.id);
    }
    for (const [id, needles] of Object.entries({
      "continual-flame": ["50 zl", "nevytváří teplo"],
      darkness: ["15 stop", "viděním ve tmě", "2. nebo nižší"],
      darkvision: ["8 hodin", "60 stop"],
      "detect-thoughts": ["Inteligencí 3", "záchranný hod na Moudrost", "2 stopy kamene", "2 palce kovu"],
      "enhance-ability": ["Medvědí odolnost", "Býčí síla", "Kočičí ladnost", "Orlí nádhera", "Liščí vychytralost", "Soví moudrost", "2k6"],
      "enlarge-reduce": ["osminásobek", "jednu osminu", "1k4", "nejméně 1 zranění"],
      enthrall: ["imunní vůči zmámení", "Moudrosti (Vnímání)"],
      "find-steed": ["válečný kůň", "Inteligence na 6", "1 míli", "telepaticky"],
      "find-traps": ["120 stop", "Neodhalíš přesnou polohu"],
      "flame-blade": ["3k6", "4. nebo vyšší"],
      "flaming-sphere": ["2k6", "30 stop", "10 stop", "20 stop"],
      "gentle-repose": ["10 dní", "nezapočítávají"],
      "gust-of-wind": ["60 stop", "10 stop", "15 stop", "50%"],
    })) for (const needle of needles)
      assert.ok(CZECH_FULL_SPELLS_9[id].includes(needle), "Missing mechanic: " + id + "/" + needle);
  });


  await test("second-level SRD spells 26–37 have complete Czech rules with preserved source fields", async () => {
    const { CZECH_FULL_SPELLS_10 } = await import("../src/lib/rulebook/czech-full-spells-10.ts");
    const expected = ["heat-metal","hold-person","invisibility","knock","lesser-restoration","levitate","locate-animals-or-plants","locate-object","magic-mouth","magic-weapon","mirror-image","misty-step"];
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_10), expected);
    const originals = rulebookPages("en").filter((page) =>
      page.kind === "spell" && page.meta?.startsWith("2nd-level"));
    assert.deepEqual(originals.slice(25, 37).map((page) => page.id), expected,
      "Second-level spell translations must keep SRD source order");
    function getField(markdown, label) {
      const prefix = "**" + label + ":** ";
      return markdown.split("\n").find((line) => line.startsWith(prefix))?.slice(prefix.length);
    }
    const ranges = {
      "60 feet": "60 stop", "30 feet": "30 stop", "120 feet": "120 stop",
      Touch: "Dotyk", Self: "Sesilatel",
    };
    const durations = {
      "Instantaneous": "Ihned", "1 minute": "1 minuta",
      "Until dispelled": "Do rozptýlení",
      "Concentration, up to 1 minute": "Soustředění, až 1 minuta",
      "Concentration, up to 10 minutes": "Soustředění, až 10 minut",
      "Concentration, up to 1 hour": "Soustředění, až 1 hodina",
    };
    for (const original of originals.slice(25, 37)) {
      const text = CZECH_FULL_SPELLS_10[original.id];
      const localized = rulebookPage(original.id, "cs").page;
      assert.ok(text && text.length >= 200, "Full spell text missing: " + original.id);
      assert.equal(localized.id, original.id);
      assert.equal(localized.title, CZECH_SPELLS[original.title]);
      assert.equal(localized.originalMeta, original.meta);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(text), "Czech reader missing spell: " + original.id);
      assert.ok(localized.md.endsWith(original.md), "Changed original English rules: " + original.id);
      for (const [english, czech] of [
        ["Casting Time", "Doba sesílání"], ["Range", "Dosah"],
        ["Components", "Složky"], ["Duration", "Trvání"],
      ]) {
        assert.ok(getField(original.md, english), "Missing source metadata: " + original.id + "/" + english);
        assert.ok(getField(text, czech), "Missing Czech metadata: " + original.id + "/" + czech);
      }
      const originalComponents = getField(original.md, "Components").match(/^[VSM, ]+/)?.[0].trim();
      const czechComponents = getField(text, "Složky").match(/^[VSM, ]+/)?.[0].trim();
      assert.equal(czechComponents, originalComponents, "Changed spell components: " + original.id);
      const range = getField(original.md, "Range");
      if (ranges[range]) assert.ok(getField(text, "Dosah").startsWith(ranges[range]), "Wrong range: " + original.id);
      const duration = getField(original.md, "Duration");
      if (durations[duration]) assert.ok(getField(text, "Trvání").startsWith(durations[duration]), "Wrong duration: " + original.id);
      const time = getField(original.md, "Casting Time");
      if (time === "1 action") assert.equal(getField(text, "Doba sesílání"), "1 akce");
      if (time === "1 bonus action") assert.equal(getField(text, "Doba sesílání"), "1 bonusová akce");
      if (time === "1 minute") assert.equal(getField(text, "Doba sesílání"), "1 minuta");
      for (const [, number, die] of original.md.matchAll(/\b(\d+)d(\d+)\b/g)) {
        assert.ok(text.includes(number + "k" + die), "Missing original dice in " + original.id);
      }
    }
    for (const [id, expected] of Object.entries({
      "heat-metal": ["2k8", "1k8", "bonusovou akcí", "záchranném hodu na Odolnost"],
      "hold-person": ["paralyzovaný", "Moudrost", "30 stop", "dalšího humanoida"],
      invisibility: ["neviditelným", "zaútočí nebo sešle kouzlo"],
      knock: ["pouze jeden", "10 minut", "300 stop"],
      "lesser-restoration": ["oslepený", "ohlušený", "paralyzovaný", "otrávený"],
      levitate: ["500 liber", "20 stop", "Odolnost", "svou akci"],
      "locate-animals-or-plants": ["5 mil", "jako rituál"],
      "locate-object": ["1 000 stop", "30 stop", "olova"],
      "magic-mouth": ["25 slov", "10 minut", "10 zl", "30 stop", "jako rituál"],
      "magic-weapon": ["+1", "+2", "+3", "4. nebo vyšší", "6. nebo vyšší"],
      "mirror-image": ["tři iluzorní dvojníci", "6 nebo více", "8 nebo více", "11 nebo více", "10 + tvoje oprava Obratnosti"],
      "misty-step": ["1 bonusová akce", "30 stop", "neobsazené místo"],
    })) {
      for (const needle of expected) assert.ok(CZECH_FULL_SPELLS_10[id].includes(needle), "Missing detail: " + id + "/" + needle);
    }
  });


  await test("all 54 second-level SRD spells have full Czech descriptions and retained English originals", async () => {
    const [{ CZECH_FULL_SPELLS_8 }, { CZECH_FULL_SPELLS_9 }, { CZECH_FULL_SPELLS_10 }, { CZECH_FULL_SPELLS_11 }] = await Promise.all([
      import("../src/lib/rulebook/czech-full-spells-8.ts"),
      import("../src/lib/rulebook/czech-full-spells-9.ts"),
      import("../src/lib/rulebook/czech-full-spells-10.ts"),
      import("../src/lib/rulebook/czech-full-spells-11.ts"),
    ]);
    const batches = [CZECH_FULL_SPELLS_8, CZECH_FULL_SPELLS_9, CZECH_FULL_SPELLS_10, CZECH_FULL_SPELLS_11];
    assert.deepEqual(batches.map((batch) => Object.keys(batch).length), [12, 13, 12, 17]);
    const ids = batches.flatMap((batch) => Object.keys(batch));
    assert.equal(new Set(ids).size, 54, "A second-level spell was duplicated");
    const originals = rulebookPages("en").filter((page) =>
      page.kind === "spell" && page.meta?.startsWith("2nd-level"));
    assert.equal(originals.length, 54, "Unexpected 2nd-level source spell count");
    assert.deepEqual(ids, originals.map((page) => page.id), "Missing or out-of-order SRD second-level spell");
    const all = Object.assign({}, ...batches);
    function field(markdown, label) {
      const prefix = "**" + label + ":** ";
      return markdown.split("\n").find((line) => line.startsWith(prefix))?.slice(prefix.length);
    }
    const ranges = {
      Touch: "Dotyk", Self: "Sesilatel",
      "30 feet": "30 stop", "60 feet": "60 stop", "120 feet": "120 stop",
      "150 feet": "150 stop",
    };
    const times = {
      "1 action": "1 akce", "1 bonus action": "1 bonusová akce",
      "1 minute": "1 minuta", "10 minutes": "10 minut",
    };
    const durations = {
      Instantaneous: "Ihned", "1 minute": "1 minuta", "10 minutes": "10 minut",
      "1 hour": "1 hodina", "8 hours": "8 hodin",
      "Concentration, up to 1 minute": "Soustředění, až 1 minuta",
      "Concentration, up to 10 minutes": "Soustředění, až 10 minut",
      "Concentration, up to 1 hour": "Soustředění, až 1 hodina",
      "Concentration, up to 8 hours": "Soustředění, až 8 hodin",
      "Until dispelled": "Do rozptýlení",
    };
    for (const original of originals) {
      const full = all[original.id];
      const localized = rulebookPage(original.id, "cs").page;
      assert.ok(full?.length >= 190, "Full Czech spell description absent: " + original.id);
      assert.equal(localized.id, original.id);
      assert.equal(localized.title, CZECH_SPELLS[original.title], "Wrong established spell name: " + original.id);
      assert.equal(localized.originalMeta, original.meta);
      assert.ok(localized.md.includes(full), "Czech reader missing complete spell: " + original.id);
      assert.ok(localized.md.endsWith(original.md), "Canonical English spell changed: " + original.id);
      for (const label of ["Doba sesílání", "Dosah", "Složky", "Trvání"])
        assert.ok(field(full, label), "Missing Czech spell field: " + original.id + "/" + label);
      const originalComponents = field(original.md, "Components")?.match(/^[VSM, ]+/)?.[0]?.trim();
      assert.ok(originalComponents, "Original component letters unavailable: " + original.id);
      assert.equal(field(full, "Složky")?.match(/^[VSM, ]+/)?.[0]?.trim(), originalComponents,
        "Spell component letters mismatch: " + original.id);
      const time = field(original.md, "Casting Time");
      if (times[time]) assert.equal(field(full, "Doba sesílání"), times[time], "Casting time mismatch: " + original.id);
      const range = field(original.md, "Range");
      if (ranges[range]) assert.ok(field(full, "Dosah").startsWith(ranges[range]), "Range mismatch: " + original.id);
      const duration = field(original.md, "Duration")?.replace(/\.$/, "");
      if (durations[duration]) assert.ok(field(full, "Trvání").startsWith(durations[duration]), "Duration mismatch: " + original.id);
      for (const [, count, die] of original.md.matchAll(/\b(\d+)d(\d+)\b/g))
        assert.ok(full.includes(count + "k" + die), "Missing original dice: " + original.id + "/" + count + "k" + die);
      const englishRitual = /\*2nd-level [^\n]*\(ritual\)\*/.test(original.md);
      if (englishRitual) assert.ok(full.includes("(rituál)"), "Ritual not marked: " + original.id);
    }
    for (const [id, needles] of Object.entries({
      "find-steed": ["válečný kůň", "Inteligence na 6", "telepaticky", "1 míli"],
      moonbeam: ["2k10", "1k10", "40 stop", "nevýhodu", "60 stop"],
      "pass-without-trace": ["+10", "Nenápadnosti", "nelze stopovat"],
      "prayer-of-healing": ["šest tvorů", "2k8", "1k8", "10 minut"],
      "protection-from-poison": ["jeden náhodně", "výhodu", "odolnost"],
      "ray-of-enfeeblement": ["poloviční zranění", "Sílu", "Odolnost"],
      "rope-trick": ["osm tvorů", "60 stop", "Útoky ani kouzla", "1 hodina"],
      "scorching-ray": ["tři ohnivé paprsky", "2k6", "jeden další paprsek"],
      "see-invisibility": ["neviditelné tvory", "Éterické sféry"],
      shatter: ["3k8", "1k8", "anorganického", "Nemagické předměty"],
      silence: ["(rituál)", "20 stop", "verbální složku", "ohlušení"],
      "spider-climb": ["po stropech", "rychlost šplhání"],
      "spike-growth": ["150 stop", "2k4", "5 stop", "Vnímání"],
      "spiritual-weapon": ["1k8", "20 stop", "bonusovou akcí", "dvě celé úrovně"],
      suggestion: ["jedné či dvou větách", "8 hodin", "Moudrost", "zranění"],
      "warding-bond": ["50 zl", "bonus +1", "všem druhům zranění", "60 stop"],
      web: ["20 stop", "5 stop", "2k4", "zadržený", "Síly"],
      "zone-of-truth": ["15 stop", "Charisma", "odmítnout odpovídat"],
    })) {
      for (const needle of needles)
        assert.ok(all[id].includes(needle), "Missing second-level spell rule: " + id + "/" + needle);
    }
  });


  await test("first 12 third-level SRD 5.1 spells have independent Czech full descriptions", async () => {
    const { CZECH_FULL_SPELLS_12 } = await import("../src/lib/rulebook/czech-full-spells-12.ts");
    const expected = ["animate-dead","beacon-of-hope","bestow-curse","blink","call-lightning","clairvoyance","conjure-animals","counterspell","create-food-and-water","daylight","dispel-magic","fear"];
    const originals = rulebookPages("en").filter((page) =>
      page.kind === "spell" && page.meta?.startsWith("3rd-level"));
    assert.equal(originals.length, 42, "Unexpected 3rd-level English SRD spell count");
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_12), expected, "Wrong third-level translation order");
    assert.deepEqual(originals.slice(0, 12).map((page) => page.id), expected,
      "Third-level translations must match canonical SRD order");
    const field = (markdown, label) => {
      const prefix = "**" + label + ":** ";
      return markdown.split("\n").find((line) => line.startsWith(prefix))?.slice(prefix.length);
    };
    const ranges = {
      Touch: "Dotyk", Self: "Sesilatel",
      "10 feet": "10 stop", "30 feet": "30 stop", "60 feet": "60 stop",
      "120 feet": "120 stop", "1 mile": "1 míle",
    };
    const durations = {
      Instantaneous: "Ihned", "1 minute": "1 minuta", "1 hour": "1 hodina",
      "Concentration, up to 1 minute": "Soustředění, až 1 minuta",
      "Concentration, up to 10 minutes": "Soustředění, až 10 minut",
      "Concentration, up to 1 hour": "Soustředění, až 1 hodina",
    };
    for (const original of originals.slice(0, 12)) {
      const text = CZECH_FULL_SPELLS_12[original.id];
      const localized = rulebookPage(original.id, "cs").page;
      assert.ok(text?.length >= 250, "Third-level spell missing full Czech body: " + original.id);
      assert.equal(localized.title, CZECH_SPELLS[original.title]);
      assert.equal(localized.id, original.id);
      assert.equal(localized.originalMeta, original.meta);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(text), "Not integrated into Czech rulebook: " + original.id);
      assert.ok(localized.md.endsWith(original.md), "English SRD source changed: " + original.id);
      const originalTime = field(original.md, "Casting Time");
      const localizedTime = field(text, "Doba sesílání");
      assert.ok(originalTime && localizedTime, "Missing casting time: " + original.id);
      for (const [englishTime, czechTime] of [
        ["1 action", "1 akce"], ["1 minute", "1 minuta"], ["10 minutes", "10 minut"],
        ["1 reaction", "1 reakce"],
      ]) if (originalTime.startsWith(englishTime)) {
        assert.ok(localizedTime.startsWith(czechTime), "Casting time changed: " + original.id);
      }
      for (const [en, cs] of [
        ["Range", "Dosah"], ["Components", "Složky"], ["Duration", "Trvání"]
      ]) assert.ok(field(original.md, en) && field(text, cs),
        "Required SRD field missing: " + original.id + "/" + en);
      const originalComponents = field(original.md, "Components").match(/^[VSM, ]+/)?.[0]?.trim();
      const czechComponents = field(text, "Složky").match(/^[VSM, ]+/)?.[0]?.trim();
      assert.equal(czechComponents, originalComponents, "Changed spell components: " + original.id);
      const range = field(original.md, "Range");
      if (ranges[range]) assert.ok(field(text, "Dosah").startsWith(ranges[range]),
        "Incorrect spell range: " + original.id);
      const duration = field(original.md, "Duration");
      if (durations[duration]) assert.ok(field(text, "Trvání").startsWith(durations[duration]),
        "Incorrect spell duration: " + original.id);
      for (const [, count, die] of original.md.matchAll(/\b(\d+)d(\d+)\b/g))
        assert.ok(text.includes(count + "k" + die), "Missing damage dice: " + original.id);
    }
    for (const [id, needles] of Object.entries({
      "animate-dead": ["24 hodin", "čtyřmi nemrtvými", "bonusovou akcí", "60 stop", "dva nemrtvé"],
      "beacon-of-hope": ["Moudrost", "proti smrti", "nejvyšší možný počet"],
      "bestow-curse": ["1k8", "4. nebo vyšší", "5. nebo vyšší", "7. nebo vyšší", "9. úrovně", "soustředění"],
      blink: ["k20", "11 nebo více", "Éterické sféře", "10 stop", "60 stop"],
      "call-lightning": ["3k10", "1k10", "60 stop", "5 stop", "za bouřky"],
      clairvoyance: ["1 míle", "100 zl", "vidět", "slyšet", "pravého vidění"],
      "conjure-animals": ["nebezpečností", "1/2", "1/4", "Osm zvířat", "iniciativu", "dvojnásobek", "trojnásobek", "čtyřnásobek"],
      counterspell: ["1 reakce", "3. nebo nižší", "10 + úroveň", "vyšší úrovně"],
      "create-food-and-water": ["45 liber", "30 galonů", "15 humanoidům", "5 jízdním", "24 hodin"],
      daylight: ["60 stop", "neprůhlednou", "3. nebo nižší"],
      "dispel-magic": ["120 stop", "3. nebo nižší", "10 + úroveň", "samostatné ověření"],
      fear: ["30 stop", "Moudrost", "Sprint", "upustí vše", "přímo nevidí"],
    })) {
      for (const needle of needles)
        assert.ok(CZECH_FULL_SPELLS_12[id].includes(needle), "Missing rule: " + id + "/" + needle);
    }
  });


  await test("third-level SRD spells 13–24 have full independent Czech texts", async () => {
    const { CZECH_FULL_SPELLS_13 } = await import("../src/lib/rulebook/czech-full-spells-13.ts");
    const expected = ["fireball","fly","gaseous-form","glyph-of-warding","haste","hypnotic-pattern","lightning-bolt","magic-circle","major-image","mass-healing-word","meld-into-stone","nondetection"];
    const originals = rulebookPages("en").filter((page) =>
      page.kind === "spell" && page.meta?.startsWith("3rd-level"));
    assert.equal(originals.length, 42);
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_13), expected);
    assert.deepEqual(originals.slice(12, 24).map((page) => page.id), expected,
      "Third-level translations must preserve canonical SRD order");
    const field = (markdown, label) => {
      const prefix = "**" + label + ":** ";
      return markdown.split("\n").find((line) => line.startsWith(prefix))?.slice(prefix.length);
    };
    const rangeValues = {
      Touch: "Dotyk", "10 feet": "10 stop", "30 feet": "30 stop", "60 feet": "60 stop",
      "120 feet": "120 stop", "150 feet": "150 stop",
    };
    const durationValues = {
      Instantaneous: "Ihned", "1 hour": "1 hodina", "8 hours": "8 hodin",
      "Concentration, up to 1 minute": "Soustředění, až 1 minuta",
      "Concentration, up to 10 minutes": "Soustředění, až 10 minut",
      "Concentration, up to 1 hour": "Soustředění, až 1 hodina",
      "Until dispelled or triggered": "Do rozptýlení nebo spuštění",
    };
    for (const original of originals.slice(12, 24)) {
      const text = CZECH_FULL_SPELLS_13[original.id];
      const localized = rulebookPage(original.id, "cs").page;
      assert.ok(text?.length >= 225, "Missing complete Czech spell text: " + original.id);
      assert.equal(localized.id, original.id);
      assert.equal(localized.title, CZECH_SPELLS[original.title]);
      assert.equal(localized.originalMeta, original.meta);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(text));
      assert.ok(localized.md.endsWith(original.md), "Canonical English spell changed: " + original.id);
      for (const [en, cs] of [
        ["Casting Time", "Doba sesílání"], ["Range", "Dosah"],
        ["Components", "Složky"], ["Duration", "Trvání"],
      ]) assert.ok(field(original.md, en) && field(text, cs),
        "Missing metadata: " + original.id + "/" + cs);
      const sourceComponents = field(original.md, "Components")?.match(/^[VSM, ]+/)?.[0]?.trim();
      const localComponents = field(text, "Složky")?.match(/^[VSM, ]+/)?.[0]?.trim();
      assert.ok(sourceComponents, "Source spell lacks component letters: " + original.id);
      assert.equal(localComponents, sourceComponents, "Component letters differ: " + original.id);
      const duration = field(original.md, "Duration");
      if (durationValues[duration])
        assert.equal(field(text, "Trvání"), durationValues[duration], "Wrong duration: " + original.id);
      const range = field(original.md, "Range");
      if (rangeValues[range])
        assert.ok(field(text, "Dosah").startsWith(rangeValues[range]), "Wrong range: " + original.id);
      const time = field(original.md, "Casting Time");
      if (time === "1 action") assert.equal(field(text, "Doba sesílání"), "1 akce");
      if (time === "1 bonus action") assert.equal(field(text, "Doba sesílání"), "1 bonusová akce");
      if (time === "1 minute") assert.equal(field(text, "Doba sesílání"), "1 minuta");
      if (time === "1 hour") assert.equal(field(text, "Doba sesílání"), "1 hodina");
      for (const [, amount, sides] of original.md.matchAll(/\b(\d+)d(\d+)\b/g))
        assert.ok(text.includes(amount + "k" + sides), "Missing original dice: " + original.id);
      if (/^\*3rd-level [^\n]*\(ritual\)\*/m.test(original.md))
        assert.ok(text.includes("(rituál)"), "Missing ritual tag: " + original.id);
    }
    for (const [id, needles] of Object.entries({
      fireball: ["20 stop", "8k6", "1k6", "za rohy"],
      fly: ["60 stop", "spadne", "jednoho dalšího tvora"],
      "gaseous-form": ["10 stop", "nemagickému zranění", "0 životů", "Nemůže útočit ani sesílat kouzla"],
      "glyph-of-warding": ["200 zl", "10 stop", "Pátrání", "20 stop", "5k8", "1k8", "soustředění"],
      haste: ["bonus +2", "dvojnásobnou rychlost", "jeden útok zbraní", "následujícího tahu"],
      "hypnotic-pattern": ["30 stop", "Moudrost", "rychlost je 0", "zatřese"],
      "lightning-bolt": ["100 stop", "5 stop", "8k6", "1k6"],
      "magic-circle": ["100 zl", "Charisma", "obrátit", "1 hodinu"],
      "major-image": ["20 stop", "zvuky, pachy", "Pátrání", "6. nebo vyšší", "nevyžaduje soustředění"],
      "mass-healing-word": ["šest tvorů", "1k4", "nemrtvé ani na výtvory"],
      "meld-into-stone": ["(rituál)", "6k6", "50 drtivého", "ležící"],
      nondetection: ["25 zl", "8 hodin", "10 stop", "věšteckou magii"],
    })) for (const needle of needles)
      assert.ok(CZECH_FULL_SPELLS_13[id].includes(needle), "Missing rules: " + id + "/" + needle);
  });


  await test("all 42 third-level SRD spells have complete Czech pages in canonical order", async () => {
    const [{ CZECH_FULL_SPELLS_12 }, { CZECH_FULL_SPELLS_13 }, { CZECH_FULL_SPELLS_14 }] = await Promise.all([
      import("../src/lib/rulebook/czech-full-spells-12.ts"),
      import("../src/lib/rulebook/czech-full-spells-13.ts"),
      import("../src/lib/rulebook/czech-full-spells-14.ts"),
    ]);
    const batches = [CZECH_FULL_SPELLS_12, CZECH_FULL_SPELLS_13, CZECH_FULL_SPELLS_14];
    assert.deepEqual(batches.map((batch) => Object.keys(batch).length), [12, 12, 18]);
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_14), ["phantom-steed","plant-growth","protection-from-energy","remove-curse","revivify","sending","sleet-storm","slow","speak-with-dead","speak-with-plants","spirit-guardians","stinking-cloud","tiny-hut","tongues","vampiric-touch","water-breathing","water-walk","wind-wall"]);
    const ids = batches.flatMap((batch) => Object.keys(batch));
    assert.equal(new Set(ids).size, 42, "Third-level spell translation IDs must be unique");
    const originals = rulebookPages("en").filter((page) =>
      page.kind === "spell" && page.meta?.startsWith("3rd-level"));
    assert.equal(originals.length, 42);
    assert.deepEqual(ids, originals.map((page) => page.id), "Third-level SRD order / coverage mismatch");
    const all = Object.assign({}, ...batches);
    const field = (md, label) => {
      const prefix = "**" + label + ":** ";
      return md.split("\n").find((line) => line.startsWith(prefix))?.slice(prefix.length);
    };
    const timeMap = {
      "1 action": "1 akce", "1 bonus action": "1 bonusová akce",
      "1 minute": "1 minuta", "10 minutes": "10 minut",
      "1 hour": "1 hodina",
    };
    const rangeMap = {
      Touch: "Dotyk", Self: "Sesilatel", "10 feet": "10 stop",
      "30 feet": "30 stop", "60 feet": "60 stop", "90 feet": "90 stop",
      "120 feet": "120 stop", "150 feet": "150 stop", "1 mile": "1 míle",
      Unlimited: "Neomezený",
    };
    const durationMap = {
      Instantaneous: "Ihned", "1 round": "1 kolo",
      "10 minutes": "10 minut", "1 hour": "1 hodina",
      "8 hours": "8 hodin", "24 hours": "24 hodin",
      "Concentration, up to 1 minute": "Soustředění, až 1 minuta",
      "Concentration, up to 10 minutes": "Soustředění, až 10 minut",
      "Concentration, up to 1 hour": "Soustředění, až 1 hodina",
      "Until dispelled or triggered": "Do rozptýlení nebo spuštění",
    };
    for (const original of originals) {
      const full = all[original.id];
      const localized = rulebookPage(original.id, "cs").page;
      assert.ok(full?.length >= 210, "Third-level full Czech description absent: " + original.id);
      assert.equal(localized.id, original.id);
      assert.equal(localized.title, CZECH_SPELLS[original.title]);
      assert.equal(localized.originalMeta, original.meta);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(full), "Third-level spell not linked to Czech reader: " + original.id);
      assert.ok(localized.md.endsWith(original.md), "English source altered: " + original.id);
      for (const [english, czech] of [
        ["Casting Time", "Doba sesílání"], ["Range", "Dosah"],
        ["Components", "Složky"], ["Duration", "Trvání"],
      ]) {
        assert.ok(field(original.md, english), "English metadata missing: " + original.id + "/" + english);
        assert.ok(field(full, czech), "Czech metadata missing: " + original.id + "/" + czech);
      }
      const originalComponents = field(original.md, "Components").match(/^[VSM, ]+/)?.[0].trim();
      assert.ok(originalComponents);
      assert.equal(field(full, "Složky").match(/^[VSM, ]+/)?.[0].trim(), originalComponents);
      const originalTime = field(original.md, "Casting Time");
      if (timeMap[originalTime])
        assert.equal(field(full, "Doba sesílání"), timeMap[originalTime], "Casting time mismatch: " + original.id);
      const originalRange = field(original.md, "Range");
      if (rangeMap[originalRange])
        assert.ok(field(full, "Dosah").startsWith(rangeMap[originalRange]), "Spell range mismatch: " + original.id);
      const duration = field(original.md, "Duration");
      if (durationMap[duration])
        assert.ok(field(full, "Trvání").startsWith(durationMap[duration]), "Duration mismatch: " + original.id);
      if (/^\*3rd-level [^\n]*\(ritual\)\*/m.test(original.md))
        assert.ok(full.includes("(rituál)"), "Ritual tag missing: " + original.id);
      for (const [, count, die] of original.md.matchAll(/\b(\d+)d(\d+)\b/g))
        assert.ok(full.includes(count + "k" + die), "Missing source dice: " + original.id);
    }
    for (const [id, markers] of Object.entries({
      "phantom-steed": ["(rituál)", "100 stop", "10 mil", "13 mil", "10 stop", "1 minutu"],
      "plant-growth": ["1 akce nebo 8 hodin", "100 stop", "4 stopy", "půl míle", "1 rok"],
      "protection-from-energy": ["kyselinovému", "chladnému", "ohnivému", "bleskovému", "hromovému"],
      "remove-curse": ["Všechny kletby", "sladění", "předmět"],
      revivify: ["300 zl", "poslední 1 minuty", "1 životem", "stářím"],
      sending: ["25 slovech", "Inteligencí alespoň 1", "5%", "jiné sféře"],
      "sleet-storm": ["40 stop", "20 stop", "obtížným terénem", "Odolnost", "ztratí soustředění"],
      slow: ["šesti tvorů", "−2", "reakce", "k20", "11 nebo více", "Moudrost"],
      "speak-with-dead": ["pět otázek", "posledních 10 dnů", "ústa", "pravdu"],
      "speak-with-plants": ["poslední den", "obtížný terén", "Pána jeskyně", "rostlinný tvor"],
      "spirit-guardians": ["15 stop", "3k8", "1k8", "polovinu", "Moudrost"],
      "stinking-cloud": ["20 stop", "Odolnost", "po 4 kolech", "po 1 kole"],
      "tiny-hut": ["(rituál)", "devět tvorů", "8 hodin", "neprůhledná"],
      tongues: ["jakémukoli mluvenému", "alespoň jeden jazyk", "1 hodina"],
      "vampiric-touch": ["3k6", "1k6", "polovině", "svou akcí"],
      "water-breathing": ["(rituál)", "deset ochotných", "24 hodin"],
      "water-walk": ["(rituál)", "lávu", "zranění žárem", "60 stop"],
      "wind-wall": ["50 stop", "15 stop", "1 stopu", "3k8", "automaticky minou"],
    })) for (const marker of markers)
      assert.ok(all[id].includes(marker), "Missing essential spell rule: " + id + "/" + marker);
  });


  await test("first 12 fourth-level SRD 5.1 spells have full Czech descriptions and correct mechanics", async () => {
    const { CZECH_FULL_SPELLS_15 } = await import("../src/lib/rulebook/czech-full-spells-15.ts");
    const expected = ["arcane-eye","banishment","black-tentacles","blight","compulsion","confusion","conjure-minor-elementals","conjure-woodland-beings","control-water","death-ward","dimension-door","divination"];
    const originals = rulebookPages("en").filter((page) =>
      page.kind === "spell" && page.meta?.startsWith("4th-level"));
    assert.equal(originals.length, 31, "Unexpected fourth-level SRD source count");
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_15), expected);
    assert.deepEqual(originals.slice(0, 12).map((page) => page.id), expected,
      "Fourth-level spells must retain source ordering");
    const field = (markdown, label) => {
      const prefix = "**" + label + ":** ";
      return markdown.split("\n").find((line) => line.startsWith(prefix))?.slice(prefix.length);
    };
    const ranges = {
      "30 feet": "30 stop", "60 feet": "60 stop", "90 feet": "90 stop",
      "300 feet": "300 stop", "500 feet": "500 stop", Touch: "Dotyk", Self: "Sesilatel",
    };
    const durations = {
      Instantaneous: "Ihned", "8 hours": "8 hodin",
      "Concentration, up to 1 minute": "Soustředění, až 1 minuta",
      "Concentration, up to 10 minutes": "Soustředění, až 10 minut",
      "Concentration, up to 1 hour": "Soustředění, až 1 hodina",
    };
    for (const original of originals.slice(0, 12)) {
      const text = CZECH_FULL_SPELLS_15[original.id];
      const localized = rulebookPage(original.id, "cs").page;
      assert.ok(text?.length >= 230, "Missing Czech rules: " + original.id);
      assert.equal(localized.id, original.id);
      assert.equal(localized.title, CZECH_SPELLS[original.title]);
      assert.equal(localized.originalMeta, original.meta);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(text), "Czech reader missing spell: " + original.id);
      assert.ok(localized.md.endsWith(original.md), "English SRD content changed: " + original.id);
      for (const [english, czech] of [
        ["Casting Time", "Doba sesílání"], ["Range", "Dosah"],
        ["Components", "Složky"], ["Duration", "Trvání"],
      ]) assert.ok(field(original.md, english) && field(text, czech),
        "Missing field: " + original.id + "/" + czech);
      const enParts = field(original.md, "Components").match(/^[VSM, ]+/)?.[0]?.trim();
      const czParts = field(text, "Složky").match(/^[VSM, ]+/)?.[0]?.trim();
      assert.ok(enParts);
      assert.equal(czParts, enParts, "Spell components changed: " + original.id);
      const originalRange = field(original.md, "Range");
      if (ranges[originalRange]) assert.ok(field(text, "Dosah").startsWith(ranges[originalRange]),
        "Spell range changed: " + original.id);
      const duration = field(original.md, "Duration");
      if (durations[duration]) assert.equal(field(text, "Trvání"), durations[duration]);
      const casting = field(original.md, "Casting Time");
      if (casting === "1 action") assert.equal(field(text, "Doba sesílání"), "1 akce");
      if (casting === "1 minute") assert.equal(field(text, "Doba sesílání"), "1 minuta");
      if (casting === "1 hour") assert.equal(field(text, "Doba sesílání"), "1 hodina");
      if (/^\*4th-level [^\n]*\(ritual\)\*/m.test(original.md))
        assert.ok(text.includes("(rituál)"), "Ritual marker missing: " + original.id);
      for (const [, count, sides] of original.md.matchAll(/\b(\d+)d(\d+)\b/g))
        assert.ok(text.includes(count + "k" + sides), "Missing source dice: " + original.id);
    }
    for (const [id, markers] of Object.entries({
      "arcane-eye": ["30 stop", "1 palec", "jiné sféry", "všemi směry"],
      banishment: ["Charisma", "neškodné polosféry", "celou minutu", "jednoho dalšího tvora"],
      "black-tentacles": ["90 stop", "20 stop", "3k6", "Síly nebo Obratnosti", "obtížným terénem"],
      blight: ["8k8", "1k8", "nemrtvé ani na výtvory", "nejvyšší možné"],
      compulsion: ["bonusovou akcí", "Moudrost", "příležitostné útoky", "horizontální"],
      confusion: ["k10", "k8", "2–6", "7–8", "9–10", "reakce"],
      "conjure-minor-elementals": ["1/2", "1/4", "iniciativu", "6. úrovně", "8. úrovně"],
      "conjure-woodland-beings": ["cesmíny", "1/2", "1/4", "6. úrovně", "8. úrovně"],
      "control-water": ["300 stop", "100 stop", "25%", "2k8", "vír", "Přesměrování"],
      "death-ward": ["0 životů", "1 život", "okamžitě zabil"],
      "dimension-door": ["500 stop", "200 stop", "300 stop", "5 stop", "4k6"],
      divination: ["(rituál)", "25 zl", "7 dnů", "25%", "Pán jeskyně"],
    })) for (const marker of markers)
      assert.ok(CZECH_FULL_SPELLS_15[id].includes(marker),
        "Fourth-level mechanics missing: " + id + "/" + marker);
  });


  await test("all 31 fourth-level SRD 5.1 spells have complete Czech translations", async () => {
    const [{ CZECH_FULL_SPELLS_15 }, { CZECH_FULL_SPELLS_16 }, { CZECH_FULL_SPELLS_17 }] = await Promise.all([
      import("../src/lib/rulebook/czech-full-spells-15.ts"),
      import("../src/lib/rulebook/czech-full-spells-16.ts"),
      import("../src/lib/rulebook/czech-full-spells-17.ts"),
    ]);
    const batches = [CZECH_FULL_SPELLS_15, CZECH_FULL_SPELLS_16, CZECH_FULL_SPELLS_17];
    assert.deepEqual(batches.map((batch) => Object.keys(batch).length), [12, 10, 9]);
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_16), ["dominate-beast","fabricate","faithful-hound","fire-shield","freedom-of-movement","giant-insect","greater-invisibility","guardian-of-faith","hallucinatory-terrain","ice-storm"]);
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_17), ["locate-creature","phantasmal-killer","polymorph","private-sanctum","resilient-sphere","secret-chest","stone-shape","stoneskin","wall-of-fire"]);
    const ids = batches.flatMap((batch) => Object.keys(batch));
    assert.equal(new Set(ids).size, 31, "Fourth-level translation IDs must be unique");
    const originals = rulebookPages("en").filter((page) =>
      page.kind === "spell" && page.meta?.startsWith("4th-level"));
    assert.equal(originals.length, 31);
    assert.deepEqual(ids, originals.map((page) => page.id), "Canonical fourth-level SRD order mismatch");
    const fullTranslations = Object.assign({}, ...batches);
    const field = (markdown, label) => {
      const prefix = "**" + label + ":** ";
      return markdown.split("\n").find((line) => line.startsWith(prefix))?.slice(prefix.length);
    };
    const times = {
      "1 action": "1 akce", "10 minutes": "10 minut",
    };
    const ranges = {
      Touch: "Dotyk", Self: "Sesilatel",
      "30 feet": "30 stop", "60 feet": "60 stop", "90 feet": "90 stop",
      "120 feet": "120 stop", "300 feet": "300 stop", "500 feet": "500 stop",
    };
    const durations = {
      Instantaneous: "Ihned", "10 minutes": "10 minut",
      "1 hour": "1 hodina", "8 hours": "8 hodin", "24 hours": "24 hodin",
      "Concentration, up to 1 minute": "Soustředění, až 1 minuta",
      "Concentration, up to 10 minutes": "Soustředění, až 10 minut",
      "Concentration, up to 1 hour": "Soustředění, až 1 hodina",
    };
    for (const original of originals) {
      const full = fullTranslations[original.id];
      const localized = rulebookPage(original.id, "cs").page;
      assert.ok(full?.length >= 185, "Missing full fourth-level Czech spell: " + original.id);
      assert.equal(localized.id, original.id);
      assert.equal(localized.title, CZECH_SPELLS[original.title]);
      assert.equal(localized.originalMeta, original.meta);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(full), "Czech reader missing spell: " + original.id);
      assert.ok(localized.md.endsWith(original.md), "Modified original English source: " + original.id);
      for (const [en, cz] of [
        ["Casting Time", "Doba sesílání"], ["Range", "Dosah"],
        ["Components", "Složky"], ["Duration", "Trvání"]
      ]) assert.ok(field(original.md, en) && field(full, cz),
        "Missing casting field: " + original.id + "/" + cz);
      const englishComponents = field(original.md, "Components").match(/^[VSM, ]+/)?.[0]?.trim();
      const czechComponents = field(full, "Složky").match(/^[VSM, ]+/)?.[0]?.trim();
      assert.ok(englishComponents);
      assert.equal(czechComponents, englishComponents, "Component mismatch: " + original.id);
      const time = field(original.md, "Casting Time");
      if (times[time])
        assert.equal(field(full, "Doba sesílání"), times[time], "Casting time mismatch: " + original.id);
      const range = field(original.md, "Range");
      if (ranges[range])
        assert.ok(field(full, "Dosah").startsWith(ranges[range]), "Range mismatch: " + original.id);
      const duration = field(original.md, "Duration");
      if (durations[duration])
        assert.ok(field(full, "Trvání").startsWith(durations[duration]), "Duration mismatch: " + original.id);
      if (/^\*4th-level [^\n]*\(ritual\)\*/m.test(original.md))
        assert.ok(full.includes("(rituál)"), "Ritual tag missing: " + original.id);
      for (const [, count, die] of original.md.matchAll(/\b(\d+)d(\d+)\b/g))
        assert.ok(full.includes(count + "k" + die), "Missing source dice: " + original.id);
    }
    const checks = {
      "dominate-beast": ["Moudrost", "telepatické pouto", "reakci", "10 minut", "8 hodin"],
      fabricate: ["10 stop", "osmi", "5 stop", "zdatnost", "magické předměty"],
      "faithful-hound": ["100 stop", "30 stop", "4k8", "Éterické sféry"],
      "fire-shield": ["2k8", "ohnivého", "chladného", "10 stop"],
      "freedom-of-movement": ["obtížný terén", "5 stop", "Pod vodou", "paralyzovat"],
      "giant-insect": ["deset stonožek", "tři pavouky", "pět vos", "jednoho štíra", "0 životů"],
      "greater-invisibility": ["neviditelnými", "nekončí samotným útokem"],
      "guardian-of-faith": ["20 zářivého", "60 zranění", "8 hodin"],
      "hallucinatory-terrain": ["150 stop", "24 hodin", "Pátrání", "hmatové vlastnosti"],
      "ice-storm": ["2k8", "4k6", "1k8", "40 stop", "obtížný terén"],
      "locate-creature": ["1 000 stop", "30 stop", "10 stop", "tekoucí voda"],
      "phantasmal-killer": ["Moudrost", "4k10", "1k10", "psychického"],
      polymorph: ["nebezpečnost", "0 životů", "přebytečné zranění", "vybavení splyne"],
      "private-sanctum": ["100 stop", "5 stop", "teleportovat", "celý rok", "věšteckými"],
      "resilient-sphere": ["Obratnost", "dýchat", "poloviny", "Rozlož"],
      "secret-chest": ["5 000 zl", "50 zl", "60 dnů", "5%", "12 krychlových"],
      "stone-shape": ["5 stop", "dva panty", "jednu závoru"],
      stoneskin: ["100 zl", "nemagickému drtivému", "bodnému", "sečnému"],
      "wall-of-fire": ["60 stop", "20 stop", "5k8", "1k8", "10 stop"],
    };
    for (const [id, markers] of Object.entries(checks))
      for (const marker of markers)
        assert.ok(fullTranslations[id].includes(marker), "Missing fourth-level rule: " + id + "/" + marker);
  });


  await test("fifth-level SRD 5.1 spells 1–12 have full Czech descriptions, tables and preserved original pages", async () => {
    const { CZECH_FULL_SPELLS_18 } = await import("../src/lib/rulebook/czech-full-spells-18.ts");
    const expected = ["animate-objects","antilife-shell","arcane-hand","awaken","cloudkill","commune","commune-with-nature","cone-of-cold","conjure-elemental","contact-other-plane","contagion","creation"];
    const originalSpells = rulebookPages("en").filter((page) =>
      page.kind === "spell" && page.meta?.startsWith("5th-level"));
    assert.equal(originalSpells.length, 37, "Fifth-level SRD sources changed");
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_18), expected);
    assert.deepEqual(originalSpells.slice(0, 12).map((page) => page.id), expected,
      "Spell IDs must follow canonical fifth-level source ordering");

    function field(md, label) {
      const prefix = "**" + label + ":** ";
      return md.split("\n").find((line) => line.startsWith(prefix))?.slice(prefix.length);
    }
    const times = { "1 action": "1 akce", "1 minute": "1 minuta", "8 hours": "8 hodin" };
    const ranges = {
      Touch: "Dotyk", Self: "Sesilatel", "30 feet": "30 stop",
      "90 feet": "90 stop", "120 feet": "120 stop",
    };
    const durations = {
      Instantaneous: "Ihned", "1 minute": "1 minuta",
      "7 days": "7 dní", Special: "Zvláštní",
      "Concentration, up to 1 minute": "Soustředění, až 1 minuta",
      "Concentration, up to 10 minutes": "Soustředění, až 10 minut",
      "Concentration, up to 1 hour": "Soustředění, až 1 hodina",
    };
    for (const original of originalSpells.slice(0, 12)) {
      const full = CZECH_FULL_SPELLS_18[original.id];
      const page = rulebookPage(original.id, "cs").page;
      assert.ok(full?.length >= 300, "Missing full fifth-level Czech spell: " + original.id);
      assert.equal(page.id, original.id);
      assert.equal(page.title, CZECH_SPELLS[original.title]);
      assert.equal(page.originalMeta, original.meta);
      assert.ok(page.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(page.md.includes(full));
      assert.ok(page.md.endsWith(original.md), "Original English SRD content changed: " + original.id);
      for (const [en, cs] of [
        ["Casting Time", "Doba sesílání"], ["Range", "Dosah"],
        ["Duration", "Trvání"],
      ]) assert.ok(field(original.md, en) && field(full, cs),
        "Spell metadata missing: " + original.id + "/" + en);
      // The upstream Contagion file uses the singular label "**Component:**".
      const originalParts = field(original.md, "Components") ?? field(original.md, "Component");
      const englishComponents = originalParts?.match(/^[VSM, ]+/)?.[0]?.trim();
      const czechComponents = field(full, "Složky")?.match(/^[VSM, ]+/)?.[0]?.trim();
      assert.ok(englishComponents, "Original spell components absent: " + original.id);
      assert.equal(czechComponents, englishComponents, "Spell components changed: " + original.id);
      const casting = field(original.md, "Casting Time");
      if (times[casting]) assert.equal(field(full, "Doba sesílání"), times[casting]);
      const range = field(original.md, "Range");
      if (ranges[range])
        assert.ok(field(full, "Dosah").startsWith(ranges[range]), "Spell range mismatch: " + original.id);
      const duration = field(original.md, "Duration");
      if (durations[duration])
        assert.equal(field(full, "Trvání"), durations[duration], "Spell duration mismatch: " + original.id);
      if (/^\*5th-level [^\n]*\(ritual\)\*/m.test(original.md))
        assert.ok(full.includes("(rituál)"), "Ritual marker missing: " + original.id);
      for (const [, count, sides] of original.md.matchAll(/\b(\d+)d(\d+)\b/g))
        assert.ok(full.includes(count + "k" + sides), "Source dice absent: " + original.id);
    }
    for (const [id, needles] of Object.entries({
      "animate-objects": ["500 stop", "20 | 18", "25 | 16", "40 | 13", "50 | 10", "80 | 10", "1k4", "1k8", "2k6", "2k10", "2k12", "slepovidění"],
      "antilife-shell": ["10 stop", "nemrtvých a výtvorů", "střelnými zbraněmi", "kouzlo"],
      "arcane-hand": ["OČ 20", "Sílu 26", "4k8", "2k6", "2k8", "poloviční kryt", "60 stop"],
      awaken: ["1 000 zl", "Inteligenci 10", "30 dnů", "probuzený strom"],
      cloudkill: ["5k8", "1k8", "20 stop", "10 stop", "zadržují dech"],
      commune: ["(rituál)", "tři otázky", "25%", "nejasné"],
      "commune-with-nature": ["(rituál)", "3 mil", "300 stop", "tři skutečnosti", "Budovy"],
      "cone-of-cold": ["60 stop", "8k8", "1k8", "zmrzlou sochu"],
      "conjure-elemental": ["nebezpečností nejvýše 5", "1 hodinu", "ztratíš soustředění", "nepřátelským"],
      "contact-other-plane": ["(rituál)", "SO 15", "6k6", "pět otázek", "Mocné navrácení"],
      contagion: ["tři úspěchy", "tři neúspěchy", "Oslepující nemoc", "Špinavá horečka", "Hniloba masa", "Mozkový žár", "Záchvaty", "Slizký rozklad"],
      creation: ["1 den", "12 hodin", "1 hodina", "10 minut", "1 minuta", "5 stop", "materiální složka"],
    })) for (const needle of needles)
      assert.ok(CZECH_FULL_SPELLS_18[id].includes(needle),
        "Missing fifth-level rules: " + id + "/" + needle);
  });


  await test("fifth-level SRD spells 13–24 have full Czech descriptions and unchanged English originals", async () => {
    const { CZECH_FULL_SPELLS_19 } = await import("../src/lib/rulebook/czech-full-spells-19.ts");
    const expected = ["dispel-evil-and-good","dominate-person","dream","flame-strike","geas","greater-restoration","hallow","hold-monster","insect-plague","legend-lore","mass-cure-wounds","mislead"];
    const originals = rulebookPages("en").filter((page) =>
      page.kind === "spell" && page.meta?.startsWith("5th-level"));
    assert.equal(originals.length, 37);
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_19), expected);
    assert.deepEqual(originals.slice(12, 24).map((page) => page.id), expected,
      "The second fifth-level Czech batch must follow the English SRD order");
    const field = (md, label) => {
      const prefix = "**" + label + ":** ";
      return md.split("\n").find((line) => line.startsWith(prefix))?.slice(prefix.length);
    };
    const times = {
      "1 action": "1 akce", "1 minute": "1 minuta",
      "10 minutes": "10 minut", "24 hours": "24 hodin",
    };
    const range = {
      Self: "Sesilatel", Touch: "Dotyk", "60 feet": "60 stop",
      "90 feet": "90 stop", "300 feet": "300 stop",
    };
    const durations = {
      Instantaneous: "Ihned", "30 days": "30 dnů",
      "8 hours": "8 hodin", "Until dispelled": "Do rozptýlení",
      "Concentration, up to 1 minute": "Soustředění, až 1 minuta",
      "Concentration, up to 10 minutes": "Soustředění, až 10 minut",
      "Concentration, up to 1 hour": "Soustředění, až 1 hodina",
    };
    for (const original of originals.slice(12, 24)) {
      const full = CZECH_FULL_SPELLS_19[original.id];
      const page = rulebookPage(original.id, "cs").page;
      assert.ok(full?.length >= 220, "Missing complete Czech spell: " + original.id);
      assert.equal(page.id, original.id);
      assert.equal(page.title, CZECH_SPELLS[original.title]);
      assert.equal(page.originalMeta, original.meta);
      assert.ok(page.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(page.md.includes(full), "Czech reader not linked: " + original.id);
      assert.ok(page.md.endsWith(original.md), "English spell source modified: " + original.id);
      for (const [en, cs] of [
        ["Casting Time", "Doba sesílání"], ["Range", "Dosah"],
        ["Components", "Složky"], ["Duration", "Trvání"],
      ]) {
        assert.ok(field(original.md, en), "English metadata absent: " + original.id + "/" + en);
        assert.ok(field(full, cs), "Czech metadata absent: " + original.id + "/" + cs);
      }
      const englishComponents = field(original.md, "Components")?.match(/^[VSM, ]+/)?.[0]?.trim();
      const czechComponents = field(full, "Složky")?.match(/^[VSM, ]+/)?.[0]?.trim();
      assert.equal(czechComponents, englishComponents, "Component letters changed: " + original.id);
      const castTime = field(original.md, "Casting Time");
      if (times[castTime]) assert.equal(field(full, "Doba sesílání"), times[castTime]);
      const spellRange = field(original.md, "Range");
      if (range[spellRange])
        assert.ok(field(full, "Dosah").startsWith(range[spellRange]),
          "Incorrect range: " + original.id);
      const duration = field(original.md, "Duration");
      if (durations[duration])
        assert.equal(field(full, "Trvání"), durations[duration], "Duration changed: " + original.id);
      for (const [, count, sides] of original.md.matchAll(/\b(\d+)d(\d+)\b/g))
        assert.ok(full.includes(count + "k" + sides), "Missing dice: " + original.id);
    }
    for (const [id, needles] of Object.entries({
      "dispel-evil-and-good": ["Nebešťané", "elementálové", "Prolomení očarování", "Vypuzení", "Charisma", "Říše stínů"],
      "dominate-person": ["Moudrost", "telepatické pouto", "reakci", "10 minut", "1 hodinu", "8 hodin"],
      dream: ["8 hodin", "transu", "deseti slovech", "3k6", "nevýhodu", "stejné sféře"],
      "flame-strike": ["4k6", "4k6 zářivého", "10 stop", "40 stop", "1k6"],
      geas: ["30 dnů", "5k10", "nejvýše jednou za den", "1 rok", "Mocné navrácení"],
      "greater-restoration": ["100 zl", "vyčerpání o 1", "zkameněl", "maximální počet životů"],
      hallow: ["1 000 zl", "60 stop", "Charisma", "Odvaha", "Tma", "Denní světlo",
               "Ochrana před energií", "Zranitelnost vůči energii", "Věčný klid",
               "Zákaz cestování mezi sférami", "Strach", "Ticho", "Jazyky"],
      "hold-monster": ["90 stop", "Moudrost", "nemrtvé", "30 stop"],
      "insect-plague": ["300 stop", "20 stop", "4k10", "1k10", "obtížný terén"],
      "legend-lore": ["250 zl", "50 zl", "legendární význam", "pravdivé"],
      "mass-cure-wounds": ["šest tvorů", "30 stop", "3k8", "1k8", "nemrtvé"],
      mislead: ["neviditelným", "dvojník", "dvojnásobek", "Bonusovou akcí", "oslepený a ohlušený"],
    })) for (const needle of needles)
      assert.ok(CZECH_FULL_SPELLS_19[id].includes(needle), "Omitted fifth-level mechanic: " + id + "/" + needle);
  });


  await test("all 37 fifth-level SRD spells have complete Czech translations and preserved English", async () => {
    const [{ CZECH_FULL_SPELLS_18 }, { CZECH_FULL_SPELLS_19 }, { CZECH_FULL_SPELLS_20 }, { CZECH_FULL_SPELLS_21 }] = await Promise.all([
      import("../src/lib/rulebook/czech-full-spells-18.ts"),
      import("../src/lib/rulebook/czech-full-spells-19.ts"),
      import("../src/lib/rulebook/czech-full-spells-20.ts"),
      import("../src/lib/rulebook/czech-full-spells-21.ts"),
    ]);
    const batches = [CZECH_FULL_SPELLS_18, CZECH_FULL_SPELLS_19, CZECH_FULL_SPELLS_20, CZECH_FULL_SPELLS_21];
    assert.deepEqual(batches.map(batch => Object.keys(batch).length), [12, 12, 7, 6]);
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_20), ["modify-memory","passwall","planar-binding","raise-dead","reincarnate","scrying","seeming"]);
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_21), ["telekinesis","telepathic-bond","teleportation-circle","tree-stride","wall-of-force","wall-of-stone"]);
    const ids = batches.flatMap(batch => Object.keys(batch));
    assert.equal(new Set(ids).size, 37, "A fifth-level spell is missing or duplicated");
    const originals = rulebookPages("en").filter(page =>
      page.kind === "spell" && page.meta?.startsWith("5th-level"));
    assert.equal(originals.length, 37);
    assert.deepEqual(ids, originals.map(page => page.id), "Fifth-level Czech spell IDs differ from English SRD order");

    const fullTexts = Object.assign({}, ...batches);
    const field = (markdown, label) => {
      const prefix = "**" + label + ":** ";
      return markdown.split("\n").find(line => line.startsWith(prefix))?.slice(prefix.length);
    };
    const times = { "1 action": "1 akce", "1 minute": "1 minuta", "10 minutes": "10 minut", "1 hour": "1 hodina" };
    const ranges = { Touch: "Dotyk", Self: "Sesilatel", "10 feet": "10 stop", "30 feet": "30 stop", "60 feet": "60 stop", "120 feet": "120 stop" };
    const durations = {
      Instantaneous: "Ihned", "1 round": "1 kolo", "1 hour": "1 hodina",
      "8 hours": "8 hodin", "24 hours": "24 hodin",
      "Concentration, up to 1 minute": "Soustředění, až 1 minuta",
      "Concentration, up to 10 minutes": "Soustředění, až 10 minut",
    };
    for (const original of originals) {
      const full = fullTexts[original.id];
      const page = rulebookPage(original.id, "cs").page;
      assert.ok(full?.length >= 190, "Missing full Czech fifth-level spell: " + original.id);
      assert.equal(page.id, original.id);
      assert.equal(page.title, CZECH_SPELLS[original.title]);
      assert.equal(page.originalMeta, original.meta);
      assert.ok(page.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(page.md.includes(full), "The Czech reader does not contain the full text: " + original.id);
      assert.ok(page.md.endsWith(original.md), "The original English spell was modified: " + original.id);
      for (const [en, cz] of [
        ["Casting Time", "Doba sesílání"], ["Range", "Dosah"], ["Duration", "Trvání"]
      ]) assert.ok(field(original.md, en) && field(full, cz), "A spell field is missing: " + original.id + "/" + cz);
      // Contagion has the singular label '**Component:**' upstream.
      const sourceComponents = field(original.md, "Components") ?? field(original.md, "Component");
      const originalParts = sourceComponents?.match(/^[VSM, ]+/)?.[0]?.trim();
      const translatedParts = field(full, "Složky")?.match(/^[VSM, ]+/)?.[0]?.trim();
      assert.ok(originalParts, "Source spell components are absent: " + original.id);
      assert.equal(translatedParts, originalParts, "Spell components changed: " + original.id);
      const casting = field(original.md, "Casting Time");
      if (times[casting])
        assert.equal(field(full, "Doba sesílání"), times[casting], "Casting time changed: " + original.id);
      const range = field(original.md, "Range");
      if (ranges[range])
        assert.ok(field(full, "Dosah").startsWith(ranges[range]), "Range changed: " + original.id);
      const duration = field(original.md, "Duration");
      if (durations[duration])
        assert.equal(field(full, "Trvání"), durations[duration], "Duration changed: " + original.id);
      if (/^\*5th-level [^\n]*\(ritual\)\*/m.test(original.md))
        assert.ok(full.includes("(rituál)"), "Ritual marking missing: " + original.id);
      for (const [, count, die] of original.md.matchAll(/\b(\d+)d(\d+)\b/g))
        assert.ok(full.includes(count + "k" + die), "Original SRD damage dice missing: " + original.id);
    }
    const checks = {
      "modify-memory": ["24 hodin", "10 minut", "Moudrost", "Sejmi kletbu", "Mocné navrácení", "7 dny", "30 dnů", "1 rok"],
      passwall: ["5 stop", "8 stop", "20 stop", "stabilitu", "bezpečně vytlačeni"],
      "planar-binding": ["1 000 zl", "Charisma", "10 dnů", "30 dnů", "180 dnů", "rok a jeden den"],
      "raise-dead": ["10 dnů", "500 zl", "1 životem", "−4", "důkladného odpočinku", "Nemrtvého"],
      reincarnate: ["1 000 zl", "10 dnů", "01–04", "97–00", "Drakorozený", "Hobit tichošlápek", "Tiefling"],
      scrying: ["1 000 zl", "+5", "+0", "−5", "−2", "−4", "−10", "24 hodin", "10 stop"],
      seeming: ["Charisma", "1 stopu", "Inteligence (Pátrání)", "8 hodin", "uspořádání končetin"],
      telekinesis: ["1 000 liber", "454 kg", "30 stop", "Síly cíle", "zadržený", "jemnou manipulaci"],
      "telepathic-bond": ["(rituál)", "osmi ochotnými", "Inteligencí 2", "libovolnou vzdálenost"],
      "teleportation-circle": ["50 zl", "10 stop", "5 stop", "dvou cílů", "1 minutě", "jednoho roku"],
      "tree-stride": ["500 stop", "5 stop", "jednou za kolo", "mimo strom"],
      "wall-of-force": ["10 × 10 stop", "1/4 palce", "Rozptyl magii", "Rozklad", "Éterické sféry"],
      "wall-of-stone": ["6 palců", "3 palce", "OČ 15", "30 životů", "20 stop", "trvalou"],
    };
    for (const [id, markers] of Object.entries(checks))
      for (const marker of markers)
        assert.ok(fullTexts[id].includes(marker), "Missing fifth-level spell rule: " + id + "/" + marker);
  });


  await test("first 12 sixth-level SRD spells have full independent Czech texts", async () => {
    const { CZECH_FULL_SPELLS_22 } = await import("../src/lib/rulebook/czech-full-spells-22.ts");
    const expected = ["blade-barrier","chain-lightning","circle-of-death","conjure-fey","contingency","create-undead","disintegrate","eyebite","find-the-path","flesh-to-stone","forbiddance","freezing-sphere"];
    const originals = rulebookPages("en").filter(page =>
      page.kind === "spell" && page.meta?.startsWith("6th-level"));
    assert.equal(originals.length, 31, "Unexpected canonical sixth-level spell count");
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_22), expected);
    assert.deepEqual(originals.slice(0, 12).map(page => page.id), expected,
      "Sixth-level spells must follow source SRD order");
    const field = (markdown, label) => {
      const prefix = "**" + label + ":** ";
      return markdown.split("\n").find(line => line.startsWith(prefix))?.slice(prefix.length);
    };
    const ranges = { Self:"Sesilatel", Touch:"Dotyk", "10 feet":"10 stop",
      "60 feet":"60 stop", "90 feet":"90 stop", "150 feet":"150 stop",
      "300 feet":"300 stop" };
    const durations = { Instantaneous:"Ihned", "10 days":"10 dnů", "1 day":"1 den",
      "Concentration, up to 1 minute":"Soustředění, až 1 minuta",
      "Concentration, up to 10 minutes":"Soustředění, až 10 minut",
      "Concentration, up to 1 hour":"Soustředění, až 1 hodina",
      "Concentration, up to 1 day":"Soustředění, až 1 den" };
    const castingTimes = { "1 action":"1 akce", "1 minute":"1 minuta",
      "10 minutes":"10 minut" };
    for (const original of originals.slice(0, 12)) {
      const full = CZECH_FULL_SPELLS_22[original.id];
      const localized = rulebookPage(original.id, "cs").page;
      assert.ok(full?.length >= 275, "Missing complete Czech spell: " + original.id);
      assert.equal(localized.id, original.id);
      assert.equal(localized.title, CZECH_SPELLS[original.title]);
      assert.equal(localized.originalMeta, original.meta);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(full), "Reader missing Czech full text: " + original.id);
      assert.ok(localized.md.endsWith(original.md), "English source changed: " + original.id);
      for (const [en, cs] of [["Casting Time","Doba sesílání"],
        ["Range","Dosah"],["Components","Složky"],["Duration","Trvání"]]) {
        assert.ok(field(original.md,en), "Original metadata missing: " + original.id+"/"+en);
        assert.ok(field(full,cs), "Czech metadata missing: " + original.id+"/"+cs);
      }
      assert.equal(field(full,"Složky")?.match(/^[VSM, ]+/)?.[0]?.trim(),
        field(original.md,"Components")?.match(/^[VSM, ]+/)?.[0]?.trim(),
        "Components changed: "+original.id);
      const range=field(original.md,"Range"),duration=field(original.md,"Duration"),
        casting=field(original.md,"Casting Time");
      if (ranges[range]) assert.ok(field(full,"Dosah").startsWith(ranges[range]),
        "Range mismatch: "+original.id);
      if (durations[duration]) assert.equal(field(full,"Trvání"),durations[duration],
        "Duration mismatch: "+original.id);
      if (castingTimes[casting]) assert.equal(field(full,"Doba sesílání"),castingTimes[casting],
        "Casting time mismatch: "+original.id);
      if (/^\*6th-level [^\n]*\(ritual\)\*/m.test(original.md))
        assert.ok(full.includes("(rituál)"),"Ritual tag missing: "+original.id);
      for (const [,count,sides] of original.md.matchAll(/\b(\d+)d(\d+)\b/g))
        assert.ok(full.includes(count+"k"+sides),"Dice from source missing: "+original.id);
    }
    const markers={
      "blade-barrier":["100 stop","20 stop","5 stop","60 stop","6k10","tříčtvrteční kryt"],
      "chain-lightning":["150 stop","30 stop","10k8","jeden další blesk","Každý cíl"],
      "circle-of-death":["500 zl","60 stop","8k6","2k6"],
      "conjure-fey":["nebezpečností 6","ztratíš kontrolu","přesvědčení","1 hodinu"],
      contingency:["1 500 zl","obě kouzla","obě kouzla","10 dnů","pouze jedno"],
      "create-undead":["pouze v noci","tři mrtvoly","120 stop","24 hodin","7. úrovně","8. úrovně","9. úrovně"],
      disintegrate:["10k6 + 40","3k6","magické předměty","Pravé vzkříšení","10 stop"],
      eyebite:["60 stop","Spánek","Panika","Nevolnost","Moudrost"],
      "find-the-path":["100 zl","1 den","nejkratší","nejbezpečnější","jiné sféře"],
      "flesh-to-stone":["Odolnost","tři úspěchy","tři neúspěchy","zkamenělý","celou maximální dobu"],
      forbiddance:["(rituál)","40 000","30 stop","5k10","30 dnů","heslo"],
      "freezing-sphere":["300 stop","60 stop","10k6","6 palců","40 stop","1 minuty","1k6"],
    };
    for (const [id,needles] of Object.entries(markers))
      for (const needle of needles)
        assert.ok(CZECH_FULL_SPELLS_22[id].includes(needle),
          "Missing sixth-level spell rule: "+id+"/"+needle);
  });


  await test("all 31 sixth-level SRD spells have complete Czech rules in canonical order", async () => {
    const [{ CZECH_FULL_SPELLS_22 }, { CZECH_FULL_SPELLS_23 }, { CZECH_FULL_SPELLS_24 }] = await Promise.all([
      import("../src/lib/rulebook/czech-full-spells-22.ts"),
      import("../src/lib/rulebook/czech-full-spells-23.ts"),
      import("../src/lib/rulebook/czech-full-spells-24.ts"),
    ]);
    const batches = [CZECH_FULL_SPELLS_22, CZECH_FULL_SPELLS_23, CZECH_FULL_SPELLS_24];
    assert.deepEqual(batches.map(batch => Object.keys(batch).length), [12, 10, 9]);
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_23), ["globe-of-invulnerability","guards-and-wards","harm","heal","heroes-feast","instant-summons","irresistible-dance","magic-jar","mass-suggestion","move-earth"]);
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_24), ["planar-ally","programmed-illusion","sunbeam","transport-via-plants","true-seeing","wall-of-ice","wall-of-thorns","wind-walk","word-of-recall"]);
    const allIds = batches.flatMap(batch => Object.keys(batch));
    assert.equal(new Set(allIds).size, 31, "Sixth-level spell IDs must be unique");
    const originals = rulebookPages("en").filter(page => page.kind === "spell" && page.meta?.startsWith("6th-level"));
    assert.equal(originals.length, 31, "Unexpected English SRD sixth-level spell count");
    assert.deepEqual(allIds, originals.map(page => page.id), "Sixth-level ID list or SRD order differs");
    const translations = Object.assign({}, ...batches);
    const field = (md, label) => {
      const prefix = "**" + label + ":** ";
      return md.split("\n").find(line => line.startsWith(prefix))?.slice(prefix.length);
    };
    const castingTimes = {
      "1 action": "1 akce", "1 minute": "1 minuta", "10 minutes": "10 minut",
    };
    const ranges = {
      Self: "Sesilatel", Touch: "Dotyk", "5 feet": "5 stop", "10 feet": "10 stop",
      "30 feet": "30 stop", "60 feet": "60 stop", "90 feet": "90 stop",
      "120 feet": "120 stop", "150 feet": "150 stop", "300 feet": "300 stop",
    };
    const durations = {
      Instantaneous: "Ihned", "1 round": "1 kolo", "1 hour": "1 hodina",
      "8 hours": "8 hodin", "10 days": "10 dnů", "24 hours": "24 hodin",
      "Until dispelled": "Do rozptýlení",
      "Concentration, up to 1 minute": "Soustředění, až 1 minuta",
      "Concentration, up to 10 minutes": "Soustředění, až 10 minut",
      "Concentration, up to 1 hour": "Soustředění, až 1 hodina",
      "Concentration, up to 2 hours": "Soustředění, až 2 hodiny",
      "Concentration, up to 1 day": "Soustředění, až 1 den",
    };
    for (const original of originals) {
      const full = translations[original.id];
      const localized = rulebookPage(original.id, "cs").page;
      assert.ok(full?.length >= 185, "Sixth-level Czech spell is incomplete: " + original.id);
      assert.equal(localized.id, original.id);
      assert.equal(localized.title, CZECH_SPELLS[original.title]);
      assert.equal(localized.originalMeta, original.meta);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(full), "Czech reader is missing full spell rules: " + original.id);
      assert.ok(localized.md.endsWith(original.md), "English SRD text was altered: " + original.id);
      for (const [en, cz] of [
        ["Casting Time","Doba sesílání"], ["Range","Dosah"],
        ["Components","Složky"], ["Duration","Trvání"],
      ]) assert.ok(field(original.md, en) && field(full, cz),
        "English/Czech casting field missing: " + original.id + "/" + cz);
      const enComponents = field(original.md,"Components").match(/^[VSM, ]+/)?.[0]?.trim();
      const czComponents = field(full,"Složky").match(/^[VSM, ]+/)?.[0]?.trim();
      assert.ok(enComponents, "English source components absent: " + original.id);
      assert.equal(czComponents, enComponents, "Spell component letters differ: " + original.id);
      const enTime = field(original.md, "Casting Time");
      if (castingTimes[enTime])
        assert.equal(field(full,"Doba sesílání"), castingTimes[enTime], "Casting time differs: " + original.id);
      const enRange = field(original.md,"Range");
      if (ranges[enRange])
        assert.ok(field(full,"Dosah").startsWith(ranges[enRange]), "Range differs: " + original.id);
      const enDuration = field(original.md,"Duration");
      if (durations[enDuration])
        assert.equal(field(full,"Trvání"), durations[enDuration], "Duration differs: " + original.id);
      if (/^\*6th-level [^\n]*\(ritual\)\*/m.test(original.md))
        assert.ok(full.includes("(rituál)"), "Ritual marking lost: " + original.id);
      for (const [,count,sides] of original.md.matchAll(/\b(\d+)d(\d+)\b/g))
        assert.ok(full.includes(count+"k"+sides), "Source dice missing: " + original.id);
    }
    const rules = {"globe-of-invulnerability":["10 stop","5. nebo nižší","vyšší úrovně","7. nebo vyšší"],"guards-and-wards":["2 500","20 stop","50%","deset dveří","10 minut","jednu","5 × 5 stop","každý den po celý rok"],"harm":["14k6","Odolnost","pod 1","maximum životů","1 hodinu"],"heal":["70 životů","oslepení","ohluchnutí","nemrtvé","10 za každou úroveň"],"heroes-feast":["1 000 zl","1 hodinu","dvanáct tvorů","Moudrost","2k10","24 hodin"],"instant-summons":["(rituál)","1 000 zl","10 liber","6 stop","safír rozdrtit"],"irresistible-dance":["nelze zmámit","veškerý svůj pohyb","Obratnost","Moudrost"],"magic-jar":["500 zl","katatonického","100 stop","Charisma","24 hodin","Inteligence, Moudrosti a Charismatu","schránka zničí"],"mass-suggestion":["dvanáct","Moudrost","24 hodin","10 dnů","30 dnů","rok a jeden den"],"move-earth":["40 stop","20 stop","10 minut","2 hodiny","kamenné stavby"],"planar-ally":["100 zl za minutu","1 000 zl za hodinu","10 000 zl za den","10 dnů","zkušenostních bodů"],"programmed-illusion":["30 stop","5 minut","10 minut","Pátrání","viditelné nebo slyšitelné"],"sunbeam":["60 stop","5 stop","6k8","Odolnost","30 stop","sluneční světlo"],"transport-via-plants":["Velké nebo větší","stejné sféře","5 stop","vidět nebo se jí dotknout"],"true-seeing":["25 zl","120 stop","pravdivé vidění","Éterické sféry"],"wall-of-ice":["10 stop","OČ 12","30 životů","10k6","5k6","2k6","1k6"],"wall-of-thorns":["60 stop","20 stop","7k8","1k8","4 stopy","brání ve výhledu"],"wind-walk":["deset ochotných","300 stop","nemagických zbraní","1 minutu","60 stop","8 hodin"],"word-of-recall":["pět ochotných","5 stop","zasvěceném","svatyni"]};
    for (const [id,markers] of Object.entries(rules))
      for (const marker of markers)
        assert.ok(translations[id].includes(marker), "Missing sixth-level rule: " + id + "/" + marker);
  });


  await test("seventh-level SRD spells 1–12 have complete Czech text and preserve English originals", async () => {
    const { CZECH_FULL_SPELLS_25 } = await import("../src/lib/rulebook/czech-full-spells-25.ts");
    const expected = ["arcane-sword","conjure-celestial","delayed-blast-fireball","divine-word","etherealness","finger-of-death","fire-storm","forcecage","magnificent-mansion","mirage-arcane","plane-shift","prismatic-spray"];
    const originals = rulebookPages("en").filter(page =>
      page.kind === "spell" && page.meta?.startsWith("7th-level"));
    assert.equal(originals.length, 20, "Expected 20 seventh-level SRD spells");
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_25), expected);
    assert.deepEqual(originals.slice(0,12).map(page => page.id), expected,
      "Seventh-level ID order must match canonical English SRD");

    function field(md, name) {
      const prefix = "**" + name + ":** ";
      return md.split("\n").find(line => line.startsWith(prefix))?.slice(prefix.length);
    }
    const times = { "1 action":"1 akce", "1 bonus action":"1 bonusová akce",
      "1 minute":"1 minuta", "10 minutes":"10 minut" };
    const ranges = { "60 feet":"60 stop", "90 feet":"90 stop",
      "100 feet":"100 stop", "150 feet":"150 stop", "300 feet":"300 stop",
      Touch:"Dotyk", Self:"Sesilatel", Sight:"Dohled" };
    const durations = { Instantaneous:"Ihned", "1 hour":"1 hodina",
      "10 days":"10 dnů", "24 hours":"24 hodin", "Up to 8 hours":"Až 8 hodin",
      "Concentration, up to 1 minute":"Soustředění, až 1 minuta",
      "Concentration, up to 1 hour":"Soustředění, až 1 hodina" };
    for (const original of originals.slice(0,12)) {
      const full = CZECH_FULL_SPELLS_25[original.id];
      const localized = rulebookPage(original.id, "cs").page;
      assert.ok(full?.length >= 220, "Seventh-level Czech description absent: " + original.id);
      assert.equal(localized.id, original.id);
      assert.equal(localized.title, CZECH_SPELLS[original.title]);
      assert.equal(localized.originalMeta, original.meta);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(full), "Full Czech spell absent in reader: " + original.id);
      assert.ok(localized.md.endsWith(original.md), "English spell text changed: " + original.id);
      for (const [english, czech] of [
        ["Casting Time","Doba sesílání"],["Range","Dosah"],
        ["Components","Složky"],["Duration","Trvání"]
      ]) {
        assert.ok(field(original.md,english), "Missing original field: " + original.id+"/"+english);
        assert.ok(field(full,czech), "Missing Czech field: " + original.id+"/"+czech);
      }
      assert.equal(field(full,"Složky").match(/^[VSM, ]+/)?.[0]?.trim(),
        field(original.md,"Components").match(/^[VSM, ]+/)?.[0]?.trim(),
        "Component letters changed: "+original.id);
      const time = field(original.md,"Casting Time"),range = field(original.md,"Range"),
        duration = field(original.md,"Duration");
      if (times[time]) assert.equal(field(full,"Doba sesílání"),times[time],
        "Casting time changed: "+original.id);
      if (ranges[range]) assert.ok(field(full,"Dosah").startsWith(ranges[range]),
        "Range changed: "+original.id);
      if (durations[duration]) assert.equal(field(full,"Trvání"),durations[duration],
        "Duration changed: "+original.id);
      for (const [,number,sides] of original.md.matchAll(/\b(\d+)d(\d+)\b/g))
        assert.ok(full.includes(number+"k"+sides), "Damage dice from original absent: "+original.id);
    }
    const checks = {
      "arcane-sword":["250 zl","5 stop","3k10","20 stop","bonusovou akcí"],
      "conjure-celestial":["nebezpečností 4","0 životů","iniciativu","9. úrovně","nebezpečností 5"],
      "delayed-blast-fireball":["12k6","1k6","20 stop","40 stop","soustředění","Obratnost"],
      "divine-word":["bonusová akce","50 životů","40 životů","30 životů","20 životů","24 hodin","Přání"],
      etherealness:["8 hodin","60 stop","dvojnásobku","Éterické sféře","tři ochotné"],
      "finger-of-death":["7k8 + 30","Odolnost","zombie","trvale","následujícího tahu"],
      "fire-storm":["deseti krychlí","10 stop","7k10","rostliny","Obratnost"],
      forcecage:["1 500 zl","20 stop","10 stop","1/2 palce","Charisma","Éterické sféry","Rozptyl magii"],
      "magnificent-mansion":["300 stop","50 krychlí","100 osob","100 téměř","30 stop","24 hodin"],
      "mirage-arcane":["čtvereční míle","10 dnů","hmatové","pravdivým viděním","fyzicky interagovat"],
      "plane-shift":["250 zl","osm ochotných","sigilů","Charisma","náhodné místo"],
      "prismatic-spray":["k8","10k6","Indigová","Fialová","třech úspěších","třech neúspěších","dvakrát","Moudrost"],
    };
    for (const [id,markers] of Object.entries(checks))
      for (const marker of markers)
        assert.ok(CZECH_FULL_SPELLS_25[id].includes(marker),
          "Critical seventh-level mechanic missing: "+id+"/"+marker);
  });


  await test("all 20 seventh-level SRD 5.1 spells have complete Czech rules", async () => {
    const [{ CZECH_FULL_SPELLS_25 }, { CZECH_FULL_SPELLS_26 }] = await Promise.all([
      import("../src/lib/rulebook/czech-full-spells-25.ts"),
      import("../src/lib/rulebook/czech-full-spells-26.ts"),
    ]);
    const batches=[CZECH_FULL_SPELLS_25,CZECH_FULL_SPELLS_26];
    assert.deepEqual(batches.map(batch=>Object.keys(batch).length),[12,8]);
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_26),["project-image","regenerate","resurrection","reverse-gravity","sequester","simulacrum","symbol","teleport"]);
    const ids=batches.flatMap(batch=>Object.keys(batch));
    assert.equal(new Set(ids).size,20,"All 7th-level spells should have distinct canonical IDs");
    const originals=rulebookPages("en").filter(page=>
      page.kind==="spell"&&page.meta?.startsWith("7th-level"));
    assert.equal(originals.length,20);
    assert.deepEqual(ids,originals.map(page=>page.id),
      "7th-level Czech translations must preserve the exact English SRD ordering");
    const fullTexts=Object.assign({},...batches);
    const field=(md,label)=>{
      const prefix="**"+label+":** ";
      return md.split("\n").find(line=>line.startsWith(prefix))?.slice(prefix.length);
    };
    const times={"1 action":"1 akce","1 bonus action":"1 bonusová akce",
      "1 minute":"1 minuta","10 minutes":"10 minut","1 hour":"1 hodina","12 hours":"12 hodin"};
    const ranges={"500 miles":"500 mil","100 feet":"100 stop","10 feet":"10 stop",
      "30 feet":"30 stop","60 feet":"60 stop","90 feet":"90 stop",
      "150 feet":"150 stop","300 feet":"300 stop",
      Touch:"Dotyk",Self:"Sesilatel",Sight:"Dohled"};
    const durations={Instantaneous:"Ihned","1 hour":"1 hodina","10 days":"10 dnů",
      "24 hours":"24 hodin","Up to 8 hours":"Až 8 hodin","Until dispelled":"Do rozptýlení",
      "Until dispelled or triggered":"Do rozptýlení nebo spuštění",
      "Concentration, up to 1 minute":"Soustředění, až 1 minuta",
      "Concentration, up to 1 day":"Soustředění, až 1 den",
      "Concentration, up to 1 hour":"Soustředění, až 1 hodina"};
    for(const original of originals){
      const full=fullTexts[original.id];
      const localized=rulebookPage(original.id,"cs").page;
      assert.ok(full?.length>=220,"Missing Czech full spell: "+original.id);
      assert.equal(localized.id,original.id);
      assert.equal(localized.title,CZECH_SPELLS[original.title]);
      assert.equal(localized.originalMeta,original.meta);
      assert.ok(localized.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(localized.md.includes(full),"Reader missing Czech text: "+original.id);
      assert.ok(localized.md.endsWith(original.md),"Original English spell modified: "+original.id);
      for(const [en,cz] of [
        ["Casting Time","Doba sesílání"],["Range","Dosah"],
        ["Components","Složky"],["Duration","Trvání"]
      ]){
        assert.ok(field(original.md,en),"Missing English source field: "+original.id+"/"+en);
        assert.ok(field(full,cz),"Missing Czech field: "+original.id+"/"+cz);
      }
      assert.equal(field(full,"Složky").match(/^[VSM, ]+/)?.[0]?.trim(),
        field(original.md,"Components").match(/^[VSM, ]+/)?.[0]?.trim(),
        "Spell components changed: "+original.id);
      for(const [label,values,czLabel] of [
        ["Casting Time",times,"Doba sesílání"],["Range",ranges,"Dosah"],["Duration",durations,"Trvání"]
      ]){
        const originalValue=field(original.md,label);
        if(values[originalValue]){
          if(label==="Range") assert.ok(field(full,czLabel).startsWith(values[originalValue]),
            "Range changed: "+original.id);
          else assert.equal(field(full,czLabel),values[originalValue],
            "Casting field differs: "+original.id+"/"+label);
        }
      }
      if(/^\*7th-level [^\n]*\(ritual\)\*/m.test(original.md))
        assert.ok(full.includes("(rituál)"),"Ritual tag missing: "+original.id);
      for(const [,count,sides] of original.md.matchAll(/\b(\d+)d(\d+)\b/g))
        assert.ok(full.includes(count+"k"+sides),"Source dice missing: "+original.id);
    }
    const checks={"project-image":["500 mil","5 zl","dvojnásobek","Bonusovou akcí","oslepený a ohluchlý","Pátrání"],"regenerate":["4k8 + 15","1 život","10 životů","2 minutách","okamžitě"],"resurrection":["100 lety","1 000 zl","stářím","všechny chybějící části","−4","alespoň 1 rok","nemůžeš sesílat"],"reverse-gravity":["50 stop","100 stop","Obratnost","pádu","horní hranice","znovu padají dolů"],"sequester":["5 000 zl","neviditelným","věšteckých kouzel","nestárne","1 míle","1 000 letech","jakékoli zranění"],"simulacrum":["12 hodin","1 500 zl","polovinu jeho maximálních životů","výtvorem","pozice kouzel","100 zl","0 životů","znovu"],"symbol":["1 000 zl","10 stop","60 stop","10 minut","Smrt","Svár","Strach","Beznaděj","Šílenství","Bolest","Spánek","Omráčení","10k10"],"teleport":["osm ochotných","10 stop","01–100","01–05","06–13","14–24","25–100","01–33","34–43","44–53","54–100","01–43","54–73","74–100","01–50","51–100","1k10 × 1k10","3k10","šesti měsíců"]};
    for(const [id,markers] of Object.entries(checks))
      for(const marker of markers)
        assert.ok(fullTexts[id].includes(marker),"Missing 7th-level mechanics: "+id+"/"+marker);
  });


  await test("all 16 eighth-level SRD 5.1 spells have full Czech texts and preserved originals", async () => {
    const [{ CZECH_FULL_SPELLS_27 }, { CZECH_FULL_SPELLS_28 }] = await Promise.all([
      import("../src/lib/rulebook/czech-full-spells-27.ts"),
      import("../src/lib/rulebook/czech-full-spells-28.ts"),
    ]);
    const batches = [CZECH_FULL_SPELLS_27, CZECH_FULL_SPELLS_28];
    assert.deepEqual(batches.map(batch => Object.keys(batch).length), [8,8]);
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_27), ["animal-shapes","antimagic-field","antipathy-sympathy","clone","control-weather","demiplane","dominate-monster","earthquake"]);
    assert.deepEqual(Object.keys(CZECH_FULL_SPELLS_28), ["feeblemind","glibness","holy-aura","incendiary-cloud","maze","mind-blank","power-word-stun","sunburst"]);
    const ids = batches.flatMap(batch => Object.keys(batch));
    assert.equal(new Set(ids).size, 16, "Eighth-level spell IDs must be unique");
    const originals = rulebookPages("en").filter(page =>
      page.kind === "spell" && page.meta?.startsWith("8th-level"));
    assert.equal(originals.length, 16, "English 8th-level SRD spell count changed");
    assert.deepEqual(ids, originals.map(page => page.id), "Eighth-level Czech spells are not in canonical SRD order");
    const translations = Object.assign({}, ...batches);
    const field = (md, key) => {
      const prefix = "**" + key + ":** ";
      return md.split("\n").find(line => line.startsWith(prefix))?.slice(prefix.length);
    };
    const times = {"1 action":"1 akce","1 hour":"1 hodina","10 minutes":"10 minut"};
    const ranges = {"30 feet":"30 stop","60 feet":"60 stop",
      "150 feet":"150 stop","500 feet":"500 stop",Touch:"Dotyk",Self:"Sesilatel"};
    const durations = {"Instantaneous":"Ihned","1 hour":"1 hodina","10 days":"10 dnů",
      "24 hours":"24 hodin","Concentration, up to 1 minute":"Soustředění, až 1 minuta",
      "Concentration, up to 10 minutes":"Soustředění, až 10 minut",
      "Concentration, up to 1 hour":"Soustředění, až 1 hodina",
      "Concentration, up to 8 hours":"Soustředění, až 8 hodin",
      "Concentration, up to 24 hours":"Soustředění, až 24 hodin"};
    for (const original of originals) {
      const full = translations[original.id], page = rulebookPage(original.id, "cs").page;
      assert.ok(full?.length >= 170, "Missing full eighth-level Czech spell: " + original.id);
      assert.equal(page.id, original.id);
      assert.equal(page.title, CZECH_SPELLS[original.title]);
      assert.equal(page.originalMeta, original.meta);
      assert.ok(page.md.includes("## Úplné znění pravidel v češtině"));
      assert.ok(page.md.includes(full), "Czech spell reader missing text: " + original.id);
      assert.ok(page.md.endsWith(original.md), "Original English SRD content altered: " + original.id);
      for (const [en,cz] of [["Casting Time","Doba sesílání"],
        ["Range","Dosah"],["Components","Složky"],["Duration","Trvání"]])
        assert.ok(field(original.md,en) && field(full,cz), "Missing spell field: " + original.id + "/" + cz);
      const enComponents=field(original.md,"Components")?.match(/^[VSM, ]+/)?.[0]?.trim();
      const czComponents=field(full,"Složky")?.match(/^[VSM, ]+/)?.[0]?.trim();
      assert.ok(enComponents,"Missing English casting components: "+original.id);
      assert.equal(czComponents,enComponents,"Spell components altered: "+original.id);
      const cast=field(original.md,"Casting Time"),range=field(original.md,"Range"),
        duration=field(original.md,"Duration");
      if(times[cast])assert.equal(field(full,"Doba sesílání"),times[cast],"Casting time changed: "+original.id);
      if(ranges[range])assert.ok(field(full,"Dosah").startsWith(ranges[range]),"Range changed: "+original.id);
      if(durations[duration])assert.equal(field(full,"Trvání"),durations[duration],"Duration changed: "+original.id);
      for(const [,number,sides] of original.md.matchAll(/\b(\d+)d(\d+)\b/g))
        assert.ok(full.includes(number+"k"+sides),"Missing dice from English source: "+original.id);
    }
    const rules = {"animal-shapes":["24 hodin","nebezpečností nejvýše 4","Velké","0 životů","Inteligence, Moudrosti a Charismatu","přebytečné zranění","vybavení splyne"],"antimagic-field":["10 stop","artefaktem nebo božstvem","pozice se spotřebuje","Zacílené účinky","Oblasti magie","Aktivní kouzla","Magické předměty","Magické cestování","Magicky vytvoření tvorové a předměty","Rozptýlení magie"],"antipathy-sympathy":["200 stop","60 stop","10 dnů","Antipatie","Sympatie","Moudrost","24 hodin","1 minutu"],"clone":["1 000 zl","2 000 zl","120 dnech","mladší podobu","duše","vybavení"],"control-weather":["5 mil","1k4 × 10 minut","Srážky","Teplota","Vítr","Arktický mráz","Bouře","8 hodin"],"demiplane":["30 × 30 × 30 stop","dveře zmizí","uvězněni","novou polosféru","cizí polosférou"],"dominate-monster":["Moudrost","telepatické pouto","vlastní reakci","zranění","8 hodin"],"earthquake":["500 stop","100 stop","1k6 trhlin","1k10 × 10 stop","50 drtivého zranění","5k6","SO 20","Odolnost","Obratnost"],"feeblemind":["4k6","Inteligence a Charismatu","30 dnů","Mocné navrácení","Uzdrav","Přání"],"glibness":["Charismatu","15","pravdu","1 hodina"],"holy-aura":["30 stop","5 stop","výhodu ke všem záchranným hodům","nevýhodu k hodům na útok","Odolnost","oslepený"],"incendiary-cloud":["20 stop","10k8","10 stop","za rohy","16 km/h"],"maze":["SO 20","Inteligence","Minotaurus nebo goristro","nejbližším neobsazeném"],"mind-blank":["24 hodin","psychickému zranění","věšteckým kouzlům","zmámený","Přání"],"power-word-stun":["150 životů","omráčeným","Odolnost","na konci každého"],"sunburst":["12k6","60 stop","Odolnost","Nemrtví a slizy","rozptýlí veškerou tmu"]};
    for(const [id,markers] of Object.entries(rules))
      for(const marker of markers)
        assert.ok(translations[id].includes(marker),"Missing eighth-level rule: "+id+"/"+marker);
    const controlWeather = translations["control-weather"];
    for(const table of ["Srážky","Teplota","Vítr"])
      assert.ok(controlWeather.includes("**"+table+":**"),"Weather table missing: "+table);
    assert.equal((controlWeather.match(/^\| \*\*\d+\*\* \|/gm)||[]).length, 16,
      "Weather should have 5+6+5 stage rows");
  });

  // ---- the routes ----
  const { createUser } = await import("../src/lib/db/users.ts");
  const { mintSession } = await import("../src/lib/auth.ts");
  const contentsRoute = await import("../src/app/api/rulebook/route.ts");
  const pageRoute = await import("../src/app/api/rulebook/pages/[id]/route.ts");
  const searchRoute = await import("../src/app/api/rulebook/search/route.ts");
  const params = (id) => ({ params: Promise.resolve({ id }) });

  await test("the routes are closed to a caller who is not signed in", async () => {
    globalThis.__odmTestToken = "";
    assert.equal((await contentsRoute.GET(new Request("http://x/api/rulebook"))).status, 401);
    assert.equal((await pageRoute.GET(new Request("http://x/api/rulebook/pages/combat"), params("combat"))).status, 401);
    assert.equal((await searchRoute.GET(new Request("http://x/api/rulebook/search?q=cover"))).status, 401);
  });

  await test("a signed-in reader gets contents, pages and search", async () => {
    const user = createUser(`reader-${randomBytes(3).toString("hex")}`, "x");
    globalThis.__odmTestToken = mintSession(user.id).token;
    const contents = await (await contentsRoute.GET(new Request("http://x/api/rulebook"))).json();
    assert.equal(contents.chapters.length, 17);
    assert.equal(contents.chapters[0].entries[0].md, undefined, "the contents carry no page text");
    const combat = await pageRoute.GET(new Request("http://x/api/rulebook/pages/combat"), params("combat"));
    assert.equal(combat.status, 200);
    assert.match((await combat.json()).page.md, /Initiative/);
    const missing = await pageRoute.GET(new Request("http://x"), params("../etc/passwd"));
    assert.equal(missing.status, 404);
    const found = await (await searchRoute.GET(new Request("http://x/api/rulebook/search?q=cover"))).json();
    assert.equal(found.hits[0].at, "cover");
    const long = await searchRoute.GET(new Request(`http://x/api/rulebook/search?q=${"a".repeat(5000)}`));
    assert.equal(long.status, 200, "an overlong query is cut, not refused");

    // The reader's Accept-Language picks the book the routes answer with.
    const inFrench = { headers: { "Accept-Language": "fr" } };
    const frContents = await (await contentsRoute.GET(new Request("http://x/api/rulebook", inFrench))).json();
    assert.equal(frContents.chapters.find((chapter) => chapter.id === "spells").title, "Description des sorts");
    const frPage = await (await pageRoute.GET(new Request("http://x/api/rulebook/pages/fireball", inFrench), params("fireball"))).json();
    assert.equal(frPage.page.title, "Boule de feu");
    const frFound = await (await searchRoute.GET(new Request(`http://x/api/rulebook/search?q=${encodeURIComponent("boule de feu")}`, inFrench))).json();
    assert.equal(frFound.hits[0].page, "fireball");
    // A request without the header keeps reading the English book.
    const enContents = await (await contentsRoute.GET(new Request("http://x/api/rulebook"))).json();
    assert.equal(enContents.chapters.find((chapter) => chapter.id === "spells").title, "Spells");

    // The reader's own X-Odm-Locale wins over Accept-Language, so every
    // response that reads the book names both in Vary: otherwise a cache
    // keyed on Accept-Language alone could hand one reader's French book to
    // another reader's English request.
    const own = { headers: { "Accept-Language": "en", "X-Odm-Locale": "fr" } };
    const ownPage = await pageRoute.GET(new Request("http://x/api/rulebook/pages/fireball", own), params("fireball"));
    assert.equal((await ownPage.json()).page.title, "Boule de feu");
    const responses = [
      await contentsRoute.GET(new Request("http://x/api/rulebook")),
      await pageRoute.GET(new Request("http://x/api/rulebook/pages/combat"), params("combat")),
      await searchRoute.GET(new Request("http://x/api/rulebook/search?q=cover")),
    ];
    for (const response of responses) {
      const vary = (response.headers.get("vary") ?? "").toLowerCase().split(",").map((name) => name.trim());
      assert.ok(vary.includes("accept-language") && vary.includes("x-odm-locale"), `Vary: ${response.headers.get("vary")}`);
    }
  });

  console.log(`\n${passed} rulebook checks passed`);
} finally {
  globalThis.__odmTestToken = "";
  removeTempDir(dir);
}
