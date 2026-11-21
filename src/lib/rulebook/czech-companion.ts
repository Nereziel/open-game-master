// Original Czech companion notes for the 2014 SRD 5.1.
// This is NOT a copy of the community DnD 5e translation on d20.cz.
// The source SRD 5.1 is CC BY 4.0; untranslated original passages stay in English.
// All page ids and original English headings stay intact for deep links.
import type { RulebookData } from "./types";
import { CZECH_RULE_NOTES } from "./czech-rule-extensions";
import { CZECH_SPELL_NOTES } from "./czech-spell-notes";
import { CZECH_SPELL_NOTES_2 } from "./czech-spell-notes-2";
import { CZECH_SPELL_NOTES_3 } from "./czech-spell-notes-3";
import { CZECH_SPELL_NOTES_4 } from "./czech-spell-notes-4";
import { CZECH_SPELL_NOTES_5 } from "./czech-spell-notes-5";
import { CZECH_SPELL_NOTES_6 } from "./czech-spell-notes-6";
import { CZECH_SPELL_NOTES_6A } from "./czech-spell-notes-6a";
import { CZECH_SPELL_NOTES_6B } from "./czech-spell-notes-6b";
import { CZECH_SPELL_NOTES_7A } from "./czech-spell-notes-7a";
import { CZECH_SPELL_NOTES_7B } from "./czech-spell-notes-7b";
import { CZECH_SPELL_NOTES_7C } from "./czech-spell-notes-7c";
import { CZECH_SPELL_NOTES_7D } from "./czech-spell-notes-7d";
import { CZECH_MONSTER_NOTES, CZECH_ITEM_NOTES } from "./czech-bestiary-items";
import { CZECH_MONSTER_NOTES_2, CZECH_ITEM_NOTES_2 } from "./czech-bestiary-items-2";
import { CZECH_MONSTER_NOTES_3, CZECH_ITEM_NOTES_3 } from "./czech-bestiary-items-3";
import { CZECH_MONSTER_NOTES_4 } from "./czech-monster-notes-4";
import { CZECH_MONSTER_NOTES_5 } from "./czech-monster-notes-5";
import { CZECH_MONSTER_NOTES_6, CZECH_ITEM_NOTES_4 } from "./czech-bestiary-items-4";
import { CZECH_CLASS_NOTES, CZECH_RACE_NOTES } from "./czech-character-notes";
import { CZECH_ABILITIES, CZECH_CLASSES, CZECH_SKILLS, czechSrdItemMeta, czechSrdMonsterMeta, czechSrdSpellGroup, czechSrdSpellMeta, czechSrdTitle } from "./czech-terms";

 // Preserve existing note precedence while accepting the SRD's differing
 // capitalization (e.g. "Meld Into Stone" vs. "Meld into Stone").
const CZECH_SPELL_NOTE_MAP: ReadonlyMap<string, string> = (() => {
  const notes = new Map<string, string>();
  for (const batch of [
    CZECH_SPELL_NOTES, CZECH_SPELL_NOTES_2, CZECH_SPELL_NOTES_3,
    CZECH_SPELL_NOTES_4, CZECH_SPELL_NOTES_5, CZECH_SPELL_NOTES_6,
    CZECH_SPELL_NOTES_6A, CZECH_SPELL_NOTES_6B,
    CZECH_SPELL_NOTES_7A, CZECH_SPELL_NOTES_7B,
    CZECH_SPELL_NOTES_7C, CZECH_SPELL_NOTES_7D,
  ]) {
    for (const [name, note] of Object.entries(batch)) {
      const key = name.toLowerCase();
      if (!notes.has(key)) notes.set(key, note);
    }
  }
  return notes;
})();


const CHAPTERS: Record<string, string> = {
  races: "Rasy",
  classes: "Povolání",
  "beyond-1st-level": "Postup na vyšší úrovně",
  "personality-and-background": "Osobnost a zázemí",
  equipment: "Vybavení",
  feats: "Odbornosti",
  "using-ability-scores": "Používání vlastností",
  adventuring: "Dobrodružství",
  combat: "Boj",
  spellcasting: "Sesílání kouzel",
  spells: "Kouzla",
  "running-the-game": "Vedení hry",
  "magic-items": "Kouzelné předměty",
  monsters: "Nestvůry",
  creatures: "Tvorové",
  npcs: "Nehráčské postavy",
  appendix: "Dodatky",
};

const BLURBS: Record<string, string> = {
  races: "Rasy a jejich vlastnosti pro tvorbu postavy.",
  classes: "Povolání, schopnosti a postup na vyšší úrovně.",
  "beyond-1st-level": "Zkušenosti, postup na úroveň a kombinování povolání.",
  "personality-and-background": "Osobnost, přesvědčení, inspirace a zázemí postavy.",
  equipment: "Zbraně, zbroje, výbava, ceny a hmotnost.",
  feats: "Volitelné odbornosti a jejich předpoklady.",
  "using-ability-scores": "Ověření vlastností, výhoda, nevýhoda a záchranné hody.",
  adventuring: "Pohyb, cestování, světlo, odpočinek a prostředí.",
  combat: "Iniciativa, akce, útoky, zranění a umírání.",
  spellcasting: "Sesílání kouzel, pozice, složky a soustředění.",
  spells: "Seznam kouzel a jejich přesné účinky.",
  "running-the-game": "Pokyny pro Pána jeskyně a zvláštní situace.",
  "magic-items": "Kouzelné předměty, jejich schopnosti a omezení.",
  monsters: "Nestvůry pro boj a dobrodružství.",
  creatures: "Další tvorové a pomocné statistiky.",
  npcs: "Statistiky nehráčských postav.",
  appendix: "Doplňující informace a licence.",
};

const PAGES: Record<string, string> = {
  "racial-traits": "Rasové vlastnosti",
  "beyond-1st-level": "Postup na vyšší úrovně",
  multiclassing: "Kombinování povolání",
  alignment: "Přesvědčení",
  languages: "Jazyky",
  inspiration: "Inspirace",
  backgrounds: "Zázemí",
  coinage: "Měna",
  "selling-treasure": "Prodej pokladů",
  armor: "Zbroje",
  weapons: "Zbraně",
  "adventuring-gear": "Dobrodružné vybavení",
  tools: "Nástroje",
  "mounts-and-vehicles": "Jízdní zvířata a dopravní prostředky",
  "trade-goods": "Obchodní zboží",
  expenses: "Výdaje",
  feats: "Odbornosti",
  "using-ability-scores": "Používání vlastností",
  adventuring: "Dobrodružství",
  combat: "Boj",
  spellcasting: "Sesílání kouzel",
  "spell-lists": "Seznamy kouzel",
  traps: "Pasti",
  diseases: "Nemoci",
  madness: "Šílenství",
  objects: "Objekty",
  poisons: "Jedy",
  "magic-items": "Kouzelné předměty",
  "sentient-magic-items": "Inteligentní kouzelné předměty",
  artifacts: "Artefakty",
  "monster-statistics": "Statistiky nestvůr",
  "nonplayer-characters": "Nehráčské postavy",
  conditions: "Stavy",
};

// These original short explanations make core rules accessible immediately.
// They do not replace the full rules, which follow each note in English.
const NOTES: Record<string, string> = {
  "racial-traits": `Rasa určuje základní rysy postavy: například velikost, rychlost, jazyky a jedinečné schopnosti. Tyto výhody se kombinují s povoláním a zázemím. Přesné číselné hodnoty a volby vždy určuje konkrétní rasa.`,

  "beyond-1st-level": `Za překonané výzvy postavy získávají zkušenosti (XP). Na vyšších úrovních přibývají životy a schopnosti povolání.

**Bonus zdatnosti** závisí na celkové úrovni: +2 na úrovních 1–4, +3 na 5–8, +4 na 9–12, +5 na 13–16 a +6 na 17–20. Běžné zvýšení hodnot vlastností přidává +2 k jedné vlastnosti nebo +1 ke dvěma různým, zpravidla nejvýše na 20.`,

  multiclassing: `Kombinování povolání je volitelné pravidlo. Při postupu na úroveň může postava získat úroveň dalšího povolání, pokud splňuje předepsané hodnoty vlastností původního i nového povolání. Schopnosti se získávají podle úrovní v jednotlivých povoláních; bonus zdatnosti se řídí celkovou úrovní. Pro sesílání kouzel platí zvláštní tabulka.`,

  inspiration: `Inspiraci uděluje Pán jeskyně za hraní charakteru a rozhodnutí postavy. Postava může mít pouze jednu inspiraci najednou. Její spotřebování poskytne **výhodu** k jednomu hodu na útok, ověření vlastnosti nebo záchrannému hodu. Inspiraci lze také předat jiné postavě.`,

  armor: `**Obranné číslo (OČ, anglicky AC)** určuje, jak náročné je postavu zasáhnout útokem. Lehká zbroj započítává opravu Obratnosti; střední zbroj zpravidla nejvýše +2 a těžká zbroj bonus Obratnosti nezapočítává. Štít běžně zvyšuje OČ o 2.

Zbroj, se kterou postava není zdatná, omezuje hody založené na Síle a Obratnosti a znemožňuje sesílání kouzel. Některá těžká zbroj při nedostatečné Síle snižuje rychlost. Konkrétní hodnoty najdete v původní tabulce.`,

  weapons: `Zbraně jsou jednoduché nebo válečné a slouží k boji na blízko nebo na dálku. Zdatná postava přičítá k hodu na útok svůj bonus zdatnosti.

Útok zbraní na blízko obvykle používá Sílu, útok zbraní na dálku Obratnost. Obratná zbraň dovoluje použít Sílu nebo Obratnost. Kostky zranění a vlastnosti jako dosah, těžká, dvouruční či vrhací určuje konkrétní zbraň.`,

  feats: `Odbornosti jsou volitelnou alternativou k některým zvýšením hodnot vlastností. Postava musí splnit předpoklady dané odbornosti. Účinky se řídí textem konkrétní odbornosti; odbornosti zpravidla nelze získávat opakovaně, pokud to výslovně neumožňují.`,

  "using-ability-scores": `Pro **ověření vlastnosti** hoďte k20 a přičtěte opravu příslušné vlastnosti. Pokud má postava odpovídající zdatnost, přičte také bonus zdatnosti. Pán jeskyně stanovuje obtížnost (DC); hod musí dosáhnout této hodnoty nebo ji překročit.

**Výhoda** znamená hodit dvěma k20 a použít vyšší výsledek; **nevýhoda** znamená použít nižší. Více výhod se nesčítá a výhoda s nevýhodou se navzájem ruší.

**Záchranné hody** používají k20, opravu vlastnosti a případnou zdatnost v záchranném hodu. **Pasivní ověření** má základ 10 plus příslušné opravy.`,

  adventuring: `Při cestování se sleduje čas, vzdálenost, tempo a podmínky prostředí. Pro vidění je důležité jasné světlo, šero a tma.

**Krátký odpočinek** trvá nejméně hodinu a umožňuje využít kostky životů k léčení. **Dlouhý odpočinek** trvá nejméně osm hodin a obvykle obnoví všechny životy, část utracených kostek životů a zdroje, které se obnovují dlouhým odpočinkem. Podrobnosti o přerušení odpočinku a výjimkách určuje původní SRD.`,

  combat: `## Základy boje

Na začátku boje se určí **iniciativa** hodem k20 s opravou Obratnosti. Postavy a nestvůry jednají v pořadí iniciativy. Jedno kolo představuje přibližně šest sekund herního času.

V každém tahu se můžete **pohnout** až do své rychlosti a obvykle provést **jednu akci**. Některé schopnosti umožňují bonusovou akci nebo reakci.

## Útoky a zranění

Útok zpravidla znamená hod k20 s opravou vlastnosti a případným bonusem zdatnosti proti **obrannému číslu (AC)** cíle. Při úspěchu se hodí zranění. Přirozená 20 zasáhne kriticky: házejí se dvakrát kostky zranění útoku. Přirozená 1 při útoku vždy mine.

## Ztráta vědomí a smrt

Při poklesu na 0 životů postava obvykle upadne do bezvědomí. Na začátku svého tahu hází záchranný hod proti smrti: 10 a více je úspěch, 9 a méně neúspěch. Tři úspěchy znamenají stabilizaci, tři neúspěchy smrt. Další poškození nebo léčení mohou stav změnit.`,

  spellcasting: `## Sesílání kouzel

Kouzlo má úroveň, dobu seslání, dosah, složky a trvání. Sesilatel musí splňovat požadavky kouzla. **Pozice kouzla** se při běžném seslání spotřebuje; kouzla 0. úrovně (triky) ji nepotřebují. Některá kouzla získávají silnější účinek při seslání z vyšší pozice.

**Soustředění** lze udržovat jen na jednom kouzlu najednou. Při utrpění zranění sesilatel obvykle hází záchranný hod na Odolnost proti obtížnosti 10 nebo polovině utrpěného zranění (podle toho, která hodnota je vyšší). Ztráta soustředění ukončí odpovídající kouzlo.

Kouzla s označením **rituál** lze za příslušných podmínek seslat o deset minut déle bez spotřeby pozice kouzla.`,

  conditions: `## Přehled stavů

Stavy mění, co může tvor dělat a jaké hody provádí. Patří mezi ně například **oslepený, okouzlený, ohlušený, vystrašený, uchvácený, neschopný, neviditelný, ochromený, zkamenělý, otrávený, sražený, zadržený, omráčený a v bezvědomí**.

Jednotlivé stavy mají různé mechanické účinky. Například tvor **sražený na zem** se pohybuje plazením, jeho vlastní útoky mají nevýhodu a útoky vedené proti němu z bezprostřední blízkosti mají výhodu. Přesné účinky a výjimky jsou v anglických pravidlech níže.`,
};

// Short terminology index; no copied third-party descriptions.
const SKILLS_REFERENCE = [
  "## Vlastnosti",
  ...Object.entries(CZECH_ABILITIES).map(([en, cs]) => `- ${cs} (${en})`),
  "",
  "## Dovednosti",
  ...Object.entries(CZECH_SKILLS).map(([en, cs]) => `- ${cs} (${en})`),
].join("\n");

const CLASSES_REFERENCE = [
  "## Povolání",
  ...Object.entries(CZECH_CLASSES).map(([en, cs]) => `- ${cs} (${en})`),
].join("\n");

export function czechCompanionBook(english: RulebookData): RulebookData {
  return {
    source: english.source,
    parts: english.parts.map((part) => ({
      ...part,
      title: part.id === "players" ? "Hráči" : part.id === "dungeon-master" ? "Pán jeskyně" : part.id === "monsters" ? "Nestvůry" : part.title,
      blurb: part.id === "players" ? "Tvorba a hraní postav, vlastnosti, boj a kouzla." : part.id === "dungeon-master" ? "Vedení hry a kouzelné předměty." : part.id === "monsters" ? "Nestvůry a další protivníci." : part.blurb,
    })),
    chapters: english.chapters.map((chapter) => ({
      ...chapter,
      title: CHAPTERS[chapter.id] ?? chapter.title,
      blurb: BLURBS[chapter.id] ?? chapter.blurb,
    })),
    pages: english.pages.map((page) => {
      const kindNote = page.kind === "spell"
        ? CZECH_SPELL_NOTE_MAP.get(page.title.toLowerCase())
        : page.kind === "monster"
          ? CZECH_MONSTER_NOTES[page.title] ?? CZECH_MONSTER_NOTES_2[page.title] ?? CZECH_MONSTER_NOTES_3[page.title] ?? CZECH_MONSTER_NOTES_4[page.title] ?? CZECH_MONSTER_NOTES_5[page.title] ?? CZECH_MONSTER_NOTES_6[page.title] ?? (page.title === "Animated Armor (Animated Object)" ? CZECH_MONSTER_NOTES["Animated Armor"] : undefined)
          : page.kind === "item"
            ? CZECH_ITEM_NOTES[page.title] ?? CZECH_ITEM_NOTES_2[page.title] ?? CZECH_ITEM_NOTES_3[page.title] ?? CZECH_ITEM_NOTES_4[page.title]
            : page.kind === "class" ? CZECH_CLASS_NOTES[page.title]
            : page.kind === "race" ? CZECH_RACE_NOTES[page.title]
            : undefined;
      const note = page.id === "using-ability-scores"
        ? `${NOTES[page.id]}\n\n${SKILLS_REFERENCE}`
        : page.id === "beyond-1st-level"
          ? `${NOTES[page.id]}\n\n${CLASSES_REFERENCE}`
          : kindNote ?? NOTES[page.id] ?? CZECH_RULE_NOTES[page.id];
      const title = PAGES[page.id] ?? czechSrdTitle(page.title, page.kind);
      const meta = page.meta && page.kind === "spell" ? czechSrdSpellMeta(page.meta)
        : page.meta && page.kind === "monster" ? czechSrdMonsterMeta(page.meta)
        : page.meta && page.kind === "item" ? czechSrdItemMeta(page.meta)
        : page.meta;
      return {
        ...page,
        title,
        ...(meta && meta !== page.meta ? { meta, originalMeta: page.meta } : {}),
        ...(page.kind === "spell" && page.group ? { group: czechSrdSpellGroup(page.group) } : {}),
        ...(note
          ? {
              md: `## ${page.kind === "spell" ? "Český popis kouzla" : page.kind === "monster" ? "Český přehled nestvůry" : page.kind === "item" ? "Český přehled předmětu" : page.kind === "class" ? "Český přehled povolání" : page.kind === "race" ? "Český přehled rasy" : "Český přehled pravidel"}

${note}

---

**Úplné původní znění SRD 5.1 v angličtině:**

${page.md}`,
            }
          : {}),
      };
    }),
  };
}
