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
    assert.ok(rulebookSearch("Proměna", 10, "cs").hits.some((hit) => hit.page === spell.id), "Czech search resolves Polymorph");
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
    assert.ok(planes.includes("*Pravé vidění*"));
    assert.ok(madness.includes("*Mocné navrácení*"));
  });

  await test("complete Czech multiclassing and background rules remain source-faithful", async () => {
    const { CZECH_FULL_RULES_9 } = await import("../src/lib/rulebook/czech-full-rules-9.ts");
    const { CZECH_FULL_RULES_10 } = await import("../src/lib/rulebook/czech-full-rules-10.ts");
    assert.deepEqual(Object.keys(CZECH_FULL_RULES_9), ["multiclassing"]);
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
    const wizard = CZECH_FULL_CLASSES_12.wizard;
    assert.ok(wizard.includes("### Škola zaklínání"));
    assert.ok(wizard.includes("**Za každou úroveň kouzla to stojí 2 hodiny a 50 zl**"));
    assert.ok(wizard.includes("**1 hodinu a 10 zl za každou úroveň kouzla**"));
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
