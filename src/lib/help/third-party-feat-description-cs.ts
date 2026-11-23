// Original Czech rendering of the Open Game Content rules for the thirteen
// feats listed in the Open5e Tome of Heroes dataset. This module does not
// copy the publisher's non-rules story/flavor text. Source: Kobold Press,
// Tome of Heroes (2022), Open Game License 1.0a. Full attribution remains
// attached to the content pack and its source document.
import { textKey } from "@/lib/language/text-logic";
import type { Locale } from "@/lib/i18n/translate";

const TOME_OF_HEROES_FEATS_CS: Readonly<Record<string, string>> = {
  "Boundless Reserves": `*Požadavky: Moudrost 13 nebo vyšší a schopnost Ki.*

- Zvýšíš Moudrost o 1, nejvýše na 20.
- Pokud na začátku svého tahu nemáš žádné body ki, můžeš reakcí utratit jednu kostku životů. Hoď jí a přičti opravu Odolnosti. Obnovíš si počet utracených bodů ki až do poloviny výsledku (nejméně 1), nikdy však nad svůj obvyklý maximální počet.
- Kostku životů takto utracenou nelze použít k léčení při krátkém odpočinku. Obnovuje se běžným způsobem.`,
  "Diehard": `*Požadavky: Odolnost 13 nebo vyšší.*

- Zvýšíš Odolnost o 1, nejvýše na 20.
- Máš výhodu k záchranným hodům proti účinkům, které by ti udělily stupeň vyčerpání.
- Máš výhodu k záchranným hodům proti smrti.`,
  "Floriographer": `*Požadavky: Zdatnost alespoň v jedné dovednosti: Mystika, Historie nebo Příroda.*

- Zvýšíš Inteligenci nebo Moudrost o 1, nejvýše na 20.
- Naučíš se květomluvu, tajný jazyk založený na druzích, barvách a uspořádání květin v kyticích i vyobrazeních. Můžeš jím předávat nenápadné vzkazy.
- Máš výhodu k ověřením Inteligence (Pátrání) a Moudrosti (Vhledu), když odhaluješ a vykládáš skrytá vizuální sdělení, například značky magických pastí nebo tajné posunky.`,
  "Forest Denizen": `- Zvýšíš Moudrost o 1, nejvýše na 20.
- Dokážeš rozeznat rostliny a houby vhodné k jídlu.
- Umíš mluvit sylvánsky, číst a psát v tomto jazyce.
- Máš výhodu k ověřením Síly (Atletika) a Obratnosti (Akrobacie) při úniku z uchopení nebo znehybnění způsobeného nemagickou vegetací či jednáním zvířete, například obří žábou nebo pavučinou.`,
  "Friend of the Forest": `- Naučíš se trik *Treeheal* a dva další druidské triky podle svého výběru.
- Naučíš se kouzlo *Mluv se zvířaty*. Jednou je můžeš seslat bez utracení pozice kouzla; tuto možnost obnovíš po krátkém nebo dlouhém odpočinku.
- Sesílací vlastností těchto kouzel je Moudrost.`,
  "Giant Foe": `*Požadavky: Rasa velikosti Malý nebo menší.*

- Zvýšíš Sílu o 1, nejvýše na 20.
- Při používání zbraní s vlastností Těžká nemáš nevýhodu k hodům na útok jen kvůli své velikosti.
- Když tě obr zasáhne kriticky, počítá se jeho zásah jako běžný.
- Při ověřeních Inteligence (Historie) o kultuře nebo původu obrů se považuješ za zdatného a místo běžného zdatnostního bonusu přičteš dvojnásobek.`,
  "Harrier": `*Požadavky: Schopnost Shadow Traveler stínových víl nebo možnost sesílat kouzlo Mlžný krok.*

- Zvýšíš Sílu nebo Obratnost o 1, nejvýše na 20.
- Po použití schopnosti Shadow Traveler nebo seslání Mlžného kroku získáš výhodu k příštímu útoku, který provedeš do konce svého tahu.`,
  "Inner Resilience": `*Požadavky: Moudrost 13 nebo vyšší.*

- Zvýšíš Moudrost o 1, nejvýše na 20.
- Získáš tři body ki, které můžeš používat na mnišské schopnosti Trpělivá obrana a Krok větru. Utracené body obnovíš po krátkém či dlouhém odpočinku, během něhož musíš alespoň 30 minut meditovat.
- Pokud již body ki vlastníš, místo toho se tvé maximum zvýší o 3.`,
  "Part of the Pack": `*Požadavky: Zdatnost v Zacházení se zvířaty.*

- Pomocí vrčení, štěkání a posunků předáváš jednoduchá sdělení psovitým šelmám (zvířatům podobným psům nebo vlkům). Dokážeš přibližně rozumět jejich stavu a jednoduchým odpovědím.
- Akcí můžeš zavytím přivolat vlka. Přijde za 1k4 kola a zůstane ve vzdálenosti do 50 stop od tebe nejvýše hodinu, nebo do smrti. Nemůžeš ho přímo ovládat; jedná ve své iniciativě, neútočí na tebe ani družinu a napadá protivníky, kteří na vás útočí.
- Od 5. úrovně přivoláš místo jednoho vlka počet vlků rovný zdatnostnímu bonusu. Při přivolání více vlků je 50% šance, že jednoho nahradí lítý vlk; nanejvýš jeden vlk může být lítý.
- Dokud je s tebou alespoň jeden přivolaný vlk, máš výhodu k ověřením Moudrosti (Přežití) při hledání potravy či úkrytu.
- PJ může přivolání omezit, pokud se nacházíš v budově nebo oblasti bez místních vlků. Další přivolání je možné až po dlouhém odpočinku.`,
  "Rimecaster": `*Požadavky: Rasa nebo zázemí z chladného podnebí a schopnost seslat alespoň jedno kouzlo.*

- Když sešleš kouzlo způsobující zranění, můžeš reakcí změnit druh jeho zranění na chladné.
- Když sešleš kouzlo způsobující chladné zranění, získáš do začátku dalšího tahu odolnost vůči chladnému zranění. Pokud již tuto odolnost máš, místo ní získáš na stejnou dobu imunitu.`,
  "Sorcerous Vigor": `*Požadavky: Charisma 13 nebo vyšší a schopnost Body magie.*

- Zvýšíš Charisma o 1, nejvýše na 20.
- Pokud na začátku tahu nemáš žádné body magie, můžeš reakcí utratit jednu kostku životů. Hoď jí a přičti opravu Odolnosti. Obnovíš si počet utracených bodů magie až do poloviny výsledku (nejméně 1), nikdy ne nad své obvyklé maximum.
- Kostku životů takto utracenou nelze použít k léčení při krátkém odpočinku; obnovuje se běžným způsobem.`,
  "Stalker": `- Získáš zdatnost v Nenápadnosti a Přežití.
- Máš výhodu k ověřením Moudrosti (Přežití), když sleduješ stopy tvora, kterého jsi viděl během posledních 24 hodin.`,
  "Stunning Sniper": `*Požadavky: Zdatnost alespoň s jednou zbraní na dálku.*

- Když dosáhneš kritického zásahu útokem na dálku, můžeš se vzdát zdvojení kostek zranění. Místo toho cíl omráčíš do začátku svého příštího tahu.`,
};

const INDEX = Object.fromEntries(
  Object.entries(TOME_OF_HEROES_FEATS_CS).map(([name, text]) => [textKey(name), text]),
);

export function thirdPartyFeatDescriptionCs(
  reference: { kind: string; name?: string; source?: string; documentSlug?: string },
  locale: Locale,
): string | null {
  if (locale !== "cs" || reference.kind !== "feats"
    || reference.source !== "open5e" || reference.documentSlug !== "toh") return null;
  return INDEX[textKey(reference.name ?? "")] ?? null;
}
