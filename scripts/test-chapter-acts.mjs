// Issue #31: chapters carry the act they belong to, and the story export
// groups them under act headings with the recap the table heard.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { register } from "node:module";
import { removeTempDir } from "./lib/remove-temp-dir.mjs";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "odm-chapter-acts-"));
process.env.SQLITE_DB_PATH = path.join(dir, "test.sqlite");
process.env.DB_ENCRYPTION_KEY = randomBytes(32).toString("hex");

register("./lib/register-alias.mjs", import.meta.url);

const { createUser } = await import("../src/lib/db/users.ts");
const { createCampaign, setStoryArc, allocateSeq } = await import("../src/lib/db/campaigns.ts");
const { closeChapterRow, ensureOpenChapter, getChapter, listChapters, setChapterAct } = await import(
  "../src/lib/db/chapters.ts"
);
const { insertCampaignMessage } = await import("../src/lib/db/messages.ts");
const { normalizeStoryArc, recordActRecap } = await import("../src/lib/dm/arc-logic.ts");
const { buildStoryDocument } = await import("../src/lib/export/story-document.ts");
const { renderStoryHtml } = await import("../src/lib/export/html.ts");
const { homeGlanceFor } = await import("../src/lib/db/home-glance.ts");

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`ok: ${name}`);
}

const dm = createUser("dm", "x");
const campaign = createCampaign(dm.id, {
  title: "The Sunken Crown",
  description: "",
  theme: "",
  maxPlayers: 4,
  startingLevel: 1,
  difficulty: "normal",
});

function say(content) {
  const seq = allocateSeq(campaign.id);
  insertCampaignMessage({ campaignId: campaign.id, seq, authorType: "dm", content });
  return seq;
}

try {
  test("a chapter closes with the act it was in, and the next opens unstamped", () => {
    ensureOpenChapter(campaign.id);
    say("The marsh stretches before you.");
    const seqEnd = say("The ferryman waits.");
    const result = closeChapterRow(ensureOpenChapter(campaign.id).id, {
      title: "The Ferryman",
      summary: "You crossed the marsh.",
      highlights: ["You crossed the marsh."],
      seqEnd,
      act: 1,
      saga: 1,
    });
    assert.equal(result.closed.act, 1);
    assert.equal(result.closed.saga, 1);
    assert.equal(result.opened.act, null);
  });

  test("the open chapter is stamped once the arc says which act it starts", () => {
    const open = ensureOpenChapter(campaign.id);
    const stamped = setChapterAct(open.id, 2, 1);
    assert.equal(stamped.act, 2);
    assert.equal(getChapter(open.id).saga, 1);
  });

  test("chapters closed before acts were tracked read back as null", () => {
    say("A second chapter.");
    const seqEnd = say("It ends.");
    const result = closeChapterRow(ensureOpenChapter(campaign.id).id, {
      title: "Old Ways",
      summary: "",
      highlights: [],
      seqEnd,
    });
    assert.equal(result.closed.act, null);
    assert.equal(result.closed.saga, null);
  });

  test("the story export heads each act once, with the recap the table heard", () => {
    // A third chapter in act 2 and a fourth one after it, same act: one
    // heading for the pair.
    say("Beneath the reliquary.");
    let seqEnd = say("The tomb opens.");
    closeChapterRow(ensureOpenChapter(campaign.id).id, {
      title: "The Tomb",
      summary: "You found the tomb.",
      highlights: [],
      seqEnd,
      act: 2,
      saga: 1,
    });
    say("Deeper still.");
    seqEnd = say("The heart beats.");
    closeChapterRow(ensureOpenChapter(campaign.id).id, {
      title: "The Heart",
      summary: "You heard it beat.",
      highlights: [],
      seqEnd,
      act: 2,
      saga: 1,
    });
    // Re-stamp the first chapter so the document has two acts to head.
    const first = listChapters(campaign.id)[0];
    setChapterAct(first.id, 1, 1);
    const arc = recordActRecap(
      normalizeStoryArc({
        premise: "The heart wakes.",
        beats: [
          { text: "a", status: "done", act: 1 },
          { text: "b", status: "active", act: 2 },
        ],
        saga: {
          title: "The Sunken Crown",
          plannedActs: 2,
          sketches: [
            { act: 1, milestone: "Reach the drowned city.", status: "detailed", title: "The Drowned Road" },
            { act: 2, milestone: "Find the tomb.", status: "detailed", title: "Beneath the Reliquary" },
          ],
          finaleBoss: null,
          sagaIndex: 1,
          priorSagas: [],
        },
      }),
      { act: 1, sagaIndex: 1, title: "The Drowned Road", recap: "You crossed the marsh and paid the ferryman." },
    );
    setStoryArc(campaign.id, arc);
    const doc = buildStoryDocument(campaign.id);
    const headings = doc.chapters.map((chapter) => chapter.actHeading ?? "");
    assert.deepEqual(headings, ["Act I: The Drowned Road", "", "Act II: Beneath the Reliquary", "", ""]);
    assert.equal(doc.chapters[0].actRecap, "You crossed the marsh and paid the ferryman.");
    assert.equal(doc.chapters[2].actRecap, undefined);
    const html = renderStoryHtml(doc);
    assert.ok(html.includes("Act I: The Drowned Road"));
    assert.ok(html.includes("paid the ferryman"));
    // The DM's milestones never reach the document.
    assert.ok(!html.includes("drowned city"));
    assert.ok(!html.includes("Find the tomb"));
  });

  test("the title screen's glance names the act the open chapter is in", () => {
    // The open chapter is unstamped, so the act comes from the arc.
    const glance = homeGlanceFor(campaign.id, []);
    assert.equal(glance.chapter.act, 2);
    assert.equal(glance.chapter.actTitle, "Beneath the Reliquary");
    assert.ok(!JSON.stringify(glance).includes("Find the tomb"));
  });

  const { renderStoryDocx } = await import("../src/lib/export/docx.ts");
  const { renderStoryOdt } = await import("../src/lib/export/odt.ts");
  const { exportFilename, storyPresentation } = await import("../src/lib/export/story-document.ts");
  const { questLogForExport } = await import("../src/lib/dm/quest-logic.ts");
  const { installCatalog, translate } = await import("../src/lib/i18n/translate.ts");
  const { localeTag } = await import("../src/lib/i18n/locale.ts");
  const { default: JSZip } = await import("jszip");
  for (const locale of ["cs", "fr"]) {
    installCatalog(locale, JSON.parse(fs.readFileSync(new URL(`../src/lib/i18n/${locale}.json`, import.meta.url), "utf8")));
  }
  say("Příběh & <most> — À bientôt.");
  const english = buildStoryDocument(campaign.id);
  const quests = [
    { title: "Úkol {title} & Étoile", status: "done", visibility: "party" },
    { title: "Failed quest", status: "failed", visibility: "party" },
    { title: "Active quest", status: "active", visibility: "party" },
    { title: "SECRET hidden quest", status: "hidden", visibility: "party" },
    { title: "SECRET GM quest", status: "active", visibility: "dm" },
  ];
  for (const locale of ["en", "cs", "fr"]) {
    const t = (key, vars) => translate(locale, key, vars);
    const doc = buildStoryDocument(campaign.id, locale);
    assert.equal(doc.locale, locale);
    assert.equal(doc.storyLanguage, "en", "UI locale does not change the table language");
    assert.equal(doc.chapters[0].actHeading, t("Act {act}: {title}", { act: "I", title: "The Drowned Road" }));
    assert.equal(doc.chapters[0].heading, t("Chapter {index}: {title}", { index: 1, title: "The Ferryman" }));
    assert.equal(doc.chapters.at(-1).heading, t("Chapter {index} (in progress)", { index: doc.chapters.at(-1).index }));
    assert.equal(doc.chapters[0].transcript[0].speaker, t("Game Master"));
    assert.deepEqual(doc.chapters.map((ch) => ch.transcript.map((line) => line.text)), english.chapters.map((ch) => ch.transcript.map((line) => line.text)));
    assert.deepEqual(doc.chapters.map((ch) => [ch.actRecap, ch.summary, ch.highlights]), english.chapters.map((ch) => [ch.actRecap, ch.summary, ch.highlights]));
    doc.questLog = questLogForExport(quests, t);
    assert.deepEqual(doc.questLog, [t("{title} (done)", { title: quests[0].title }), t("{title} (failed)", { title: quests[1].title }), quests[2].title]);
    doc.meta.exportedAt = "2026-01-02T03:04:05.000Z";
    doc.storyLanguage = "cs"; // test prose language independent of the UI
    const view = storyPresentation(doc);
    assert.equal(view.footer, t("Exported from Open Game Master on {date}.", { date: new Date(doc.meta.exportedAt).toLocaleString(localeTag(locale)) }));
    assert.equal(exportFilename(doc, "html"), exportFilename(english, "html"));
    const html = renderStoryHtml(doc);
    assert.ok(html.includes(`<html lang="${locale}">`));
    assert.ok(html.includes('<span lang="cs">Příběh &amp; &lt;most&gt; — À bientôt.</span>'));
    assert.ok(html.includes(view.footer));
    const word = await JSZip.loadAsync(await renderStoryDocx(doc));
    const odt = await JSZip.loadAsync(await renderStoryOdt(doc));
    const wordBody = await word.file("word/document.xml").async("string");
    const wordMeta = await word.file("docProps/core.xml").async("string");
    const odtBody = await odt.file("content.xml").async("string");
    const odtMeta = await odt.file("meta.xml").async("string");
    for (const output of [html, wordBody, odtBody]) {
      for (const label of [view.contents, view.questLog, view.transcript, view.metaBits[1], doc.chapters[0].actHeading, doc.chapters[0].heading, t("Game Master")]) {
        assert.ok(output.includes(label), `${locale}: missing ${label}`);
      }
      assert.ok(output.includes("Příběh &amp; &lt;most"), "authored unicode and XML escaping");
      assert.ok(output.includes("À bientôt."));
      assert.ok(!output.includes("SECRET hidden quest"));
      assert.ok(!output.includes("SECRET GM quest"));
      assert.ok(!output.includes("Find the tomb"));
      assert.ok(!output.includes("drowned city"));
    }
    assert.ok(wordMeta.includes(view.title));
    assert.ok(odtMeta.includes(view.title));
    assert.ok(odtMeta.includes("<dc:language>cs</dc:language>"));
    passed += 1;
    console.log(`ok: localized HTML, DOCX and ODT (${locale})`);
  }
} finally {
  removeTempDir(dir);
}

console.log(`test-chapter-acts: ${passed} tests passed`);
