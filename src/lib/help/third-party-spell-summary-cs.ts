// Independently written Czech quick guides to verified Tome of Heroes
// effects. They are explanatory summaries, not full translations of the
// published rules. The complete source text remains available underneath.
// No invented save DCs, ranges, durations, costs or dice values.
import { textKey } from "@/lib/language/text-logic";
import type { Locale } from "@/lib/i18n/translate";

const TOME_OF_HEROES_SPELL_NOTES: Readonly<Record<string, string>> = {
  "Fuse Armor": "Způsobí, že pohyblivé kovové části srostou a přestanou pracovat. Může znehybnit klouby zbroje i další kovové mechanismy, například naviják nebo součásti konstruktu. Konkrétní záchrany, trvání a omezení určuje původní popis kouzla.",
  "Secret Blind": "Vytvoří ochrannou sféru, která brání pohledu dovnitř a maskuje chráněný prostor iluzí. Slouží jako nenápadný úkryt; podrobnosti o vstupu a odhalení sféry jsou v původních pravidlech.",
  "Pincer": "Vyvolá hromový útok z protilehlých stran, takže zasáhne prostor sevřený mezi dvěma výsečemi. Přesnou oblast a způsob vyhodnocení zranění určuje původní popis.",
  "Lightless Torch": "Vytvoří prostor, v němž temnovid umožňuje vnímat okolí jako za jasného světla, aniž by kouzlo samo vydávalo světlo. Z běžného osvětlení tím nevzniká skutečné světlo.",
  "Long Game": "Uloží skrytý psychický účinek, který může sesilatel spustit později. Podmínky spuštění, časové omezení a způsob odolání určuje původní text kouzla.",
  "Heart to Heart": "Propojí dvě bytosti, takže se mohou podělit o účinky obnovy životů a pomáhat si při stabilizaci. Pro přesné podmínky propojení a léčení platí původní pravidla.",
  "Clear The Board": "Teleportací oddělí spojence od protivníků a přesune obě skupiny na opačné strany bojiště. Podrobnosti o cílech, vzdálenosti a možném odolání uvádí původní kouzlo.",
  "Instant Snare": "Vyvolá magickou smyčku, která zachytí cíl, vytáhne ho a omezí jeho pohyb. Způsob vysvobození a pravidlový stav jsou popsány v původním textu.",
  "Mud": "Promění oblast ve vazké bahno, které ztěžuje pohyb a může tvory zadržet. Rozsah, trvání a případné záchranné hody se řídí původními pravidly.",
};

const INDEX = Object.fromEntries(
  Object.entries(TOME_OF_HEROES_SPELL_NOTES)
    .map(([name, description]) => [textKey(name), description]),
);

export function thirdPartySpellSummaryCs(
  reference: { name?: string; source?: string; documentSlug?: string; kind: string },
  locale: Locale,
): string | null {
  if (locale !== "cs" || reference.kind !== "spells"
    || reference.source !== "open5e" || reference.documentSlug !== "toh") return null;
  return INDEX[textKey(reference.name ?? "")] ?? null;
}

export function localizedThirdPartySpellDescription(
  reference: { name?: string; source?: string; documentSlug?: string; kind: string },
  locale: Locale,
  original: string | null,
): string | null {
  const summary = thirdPartySpellSummaryCs(reference, locale);
  if (!summary) return original;
  return `**Stručný český přehled:** ${summary}${original
    ? `\n\n**Úplný pravidlový popis (anglicky):**\n\n${original}`
    : ""}`;
}
