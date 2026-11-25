// Generate the small browser name index from the server-only reviewed prose.
import { readFileSync, writeFileSync } from "node:fs";
const source = JSON.parse(readFileSync(new URL("../src/lib/content/expansion-descriptions-cs.json", import.meta.url), "utf8"));
const target = new URL("../src/lib/content/expansion-names-cs.json", import.meta.url);
const names = Object.fromEntries(Object.entries(source).map(([doc, tables]) => [
  doc, Object.fromEntries(Object.entries(tables).map(([table, rows]) => [
    table, Object.fromEntries(Object.entries(rows).map(([slug, row]) => [
      slug, { englishName: row.englishName, name: row.name },
    ])),
  ])),
]));
const output = JSON.stringify(names, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(target, "utf8") !== output) {
    console.error("Expansion names are out of date; run node scripts/build-expansion-names-cs.mjs");
    process.exitCode = 1;
  }
} else {
  writeFileSync(target, output);
}
