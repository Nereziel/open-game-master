// Complete, independently authored Czech equivalents of the exact Open5e v1
// OGL rules entries listed below. Source document and category are part of
// the lookup key: never serve a translation to a different book or homebrew.
// Entries not listed here MUST retain their original text and be counted as
// incomplete in localization reports.
import { textKey } from "@/lib/language/text-logic";
import type { Locale } from "@/lib/i18n/translate";

const TOME_SPELLS: Readonly<Record<string, string>> = {
  "Lance": "**Kouzlo 2. úrovně, vyvolávání**\n**Vyvolání:** 1 akce\n**Dosah:** 30 stop\n**Složky:** V, P\n**Trvání:** Ihned\n\nVytvoříš třpytivé kopí tvořené magickou silou a vrhneš je na tvora, kterého vidíš v dosahu. Proveď kouzelný útok na dálku proti cíli. Při zásahu utrpí cíl 5k6 silového zranění a kopí jej znehybní do konce jeho příštího tahu.",
  "Feint": "**Kouzlo 1. úrovně, iluze**\n**Vyvolání:** 1 bonusová akce\n**Dosah:** 30 stop\n**Složky:** V\n**Trvání:** 1 kolo\n\nPrávě když útočíš na tvora, vytvoříš na okamžik mihotavého dvojníka sebe sama. Iluze cíl rozptýlí, takže máš výhodu k příštímu hodu na útok proti tomuto cíli, který provedeš před koncem svého příštího tahu.",
  "Sneer": "**Kouzlo 1. úrovně, zaklínání**\n**Vyvolání:** 1 bonusová akce\n**Dosah:** 30 stop\n**Složky:** P\n**Trvání:** Ihned\n\nPohrdavě se ušklíbneš na tvora, kterého vidíš v dosahu. Cíl musí uspět v záchranném hodu na Charisma, jinak utrpí psychické zranění ve výši 2k4 + tvá oprava sesílací vlastnosti.",
  "Spite": "**Kouzlo 2. úrovně, ochrana**\n**Vyvolání:** 1 akce\n**Dosah:** Sesilatel\n**Složky:** P\n**Trvání:** 1 hodina\n\nPíchneš se do prstu a vlastní krví si pomažeš čelo, čímž utrpíš 1 bodné zranění a ochráníš se proti nepřátelským útokům. První tvor, který tě během trvání kouzla zasáhne útokem, utrpí 3k6 psychického zranění. Poté kouzlo skončí.\n\n**Na vyšších úrovních.** Sešleš-li toto kouzlo s použitím pozice 3. nebo vyšší úrovně, zranění se zvýší o 1k6 za každou úroveň pozice nad druhou.",
  "Misdirection": "**Kouzlo 1. úrovně, iluze**\n**Vyvolání:** 1 reakce, kterou provedeš, když vidíš tvora do 30 stop od sebe provádět útok\n**Dosah:** 30 stop\n**Složky:** P\n**Trvání:** Ihned\n\nVytvoříš krátký záblesk světla, hlasitý zvuk nebo jiné rozptýlení, které naruší útok tvora. Když tvor, kterého vidíš v dosahu, provádí útok, můžeš mu způsobit nevýhodu k jeho hodu na útok.",
  "Oversized Paws": "**Kouzlo 2. úrovně, proměny**\n**Vyvolání:** 1 akce\n**Dosah:** 30 stop\n**Složky:** V, P, S\n**Trvání:** Soustředění, až 1 minuta\n\nRuce a nohy jednoho ochotného tvora v dosahu se zvětší a zesílí. Po dobu trvání kouzla přičítá tento tvor 1k4 ke zranění, které způsobuje neozbrojenými údery.\n\n**Na vyšších úrovních.** Při seslání s použitím pozice 3. nebo vyšší úrovně můžeš cílit na jednoho dalšího tvora za každou úroveň pozice nad druhou.",
  "Sightburst": "**Kouzlo 2. úrovně, věštění**\n**Vyvolání:** 1 akce\n**Dosah:** Sesilatel (poloměr 100 stop)\n**Složky:** V, P\n**Trvání:** 1 kolo\n\nVyšleš ze sebe vlnu odrážejícího se zvuku. Do začátku svého příštího tahu získáš slepozrak do vzdálenosti 100 stop a znáš polohu všech přirozených nebezpečí v této oblasti. K záchranným hodům proti nebezpečím odhaleným tímto kouzlem máš výhodu.\n\n**Na vyšších úrovních.** Sešleš-li kouzlo s použitím pozice 3. nebo vyšší úrovně, trvání je soustředění, až 1 minuta. Při použití pozice 5. nebo vyšší úrovně je trvání soustředění, až 10 minut. Při použití pozice 7. nebo vyšší úrovně je trvání soustředění, až 1 hodina.",
  "Stone Aegis": "**Kouzlo 1. úrovně, proměny**\n**Vyvolání:** 1 reakce, kterou provedeš, když tě zasáhne útok\n**Dosah:** Sesilatel\n**Složky:** V, P\n**Trvání:** Až 1 minuta\n\nTvé tělo pokryje ochranná vrstva kamene. Do začátku tvého příštího tahu získáš 5 dočasných životů a bonus +2 ke třídě zbroje, a to i proti útoku, který vyvolal tuto reakci.\n\nNa začátku každého svého dalšího tahu můžeš bonusovou akcí prodloužit trvání bonusu ke třídě zbroje do začátku svého následujícího tahu. Takto jej můžeš udržovat nejvýše 1 minutu.",
  "Less Fool, I": "**Kouzlo 1. úrovně, věštění**\n**Vyvolání:** 1 akce\n**Dosah:** Dotyk\n**Složky:** V, P\n**Trvání:** Soustředění, až 10 minut\n\nTvor, kterého se dotkneš, se stane méně náchylným ke lžím a magickému ovlivňování. Po dobu trvání kouzla mají ostatní tvorové nevýhodu k ověřením Charismatu, jimiž se snaží chráněného tvora ovlivnit, a chráněný tvor má výhodu k záchranným hodům proti kouzlům, která by ho okouzlila nebo vystrašila.\n\n**Na vyšších úrovních.** Při použití pozice 3. nebo vyšší úrovně je trvání soustředění, až 1 hodina. Při použití pozice 5. nebo vyšší úrovně trvá kouzlo 8 hodin; při pozici 7. nebo vyšší úrovně 24 hodin; při použití pozice 9. úrovně 1 rok. Při seslání z pozice 5. nebo vyšší úrovně již není potřeba soustředění.",
  "Retribution": "**Kouzlo 1. úrovně, ochrana**\n**Vyvolání:** 1 akce\n**Dosah:** Sesilatel\n**Složky:** V\n**Trvání:** 1 hodina\n\nZahalíš se třpytivou éterickou zbrojí. Příští tvor, který tě zasáhne útokem na blízko, utrpí silové zranění rovné polovině zranění, které ti právě způsobil, a musí provést záchranný hod na Sílu. Při neúspěchu je odstrčen až 5 stop od tebe. Poté kouzlo skončí.",
  "Sacrifice Pawn": "**Kouzlo 4. úrovně, nekromancie**\n**Vyvolání:** 1 reakce, kterou provedeš, když přátelský tvor do 60 stop klesne na 0 životů\n**Dosah:** 60 stop\n**Složky:** V\n**Trvání:** Ihned\n\nNěkdy musí jeden padnout, aby jiní mohli povstat. Když přátelský tvor, kterého vidíš v dosahu, klesne na 0 životů, využiješ jeho unikající životní energii k vlastnímu léčení. Obnovíš si počet životů rovný úrovni padlého tvora (nebo jeho nebezpečnosti, pokud nemá úroveň) + tvá oprava sesílací vlastnosti.",
  "Sacrificial Healing": "**Kouzlo 4. úrovně, nekromancie**\n**Vyvolání:** 1 akce\n**Dosah:** Dotyk\n**Složky:** V, P, S\n**Trvání:** Ihned\n\nVyléčíš zranění jiného tvora tím, že je převezmeš na sebe nebo je přeneseš na jiného ochotného tvora v dosahu. Hoď 4k8. Cíl si obnoví tolik životů, kolik padlo, a ty utrpíš stejné množství zranění. Pokud sis místo sebe zvolil jiného ochotného tvora v dosahu, utrpí toto zranění on, zatímco rány léčeného cíle se uzavřou a odpovídající zranění se objeví na těle tvora, který je převzal.",
  "Crown of Thorns": "**Kouzlo 4. úrovně, očarování**\n**Vyvolání:** 1 akce\n**Dosah:** 30 stop\n**Složky:** V, P, S\n**Trvání:** Soustředění, až 1 minuta\n\nVytvoříš psychická pouta kolem mysli tvora v dosahu. Dokud kouzlo trvá, musí tvor při každém pokusu o seslání kouzla provést záchranný hod na Charisma. Při neúspěchu utrpí 2k6 psychického zranění a jeho kouzlo se nepodaří seslat. Pozici kouzla při neúspěšném seslání nevyčerpá.",
  "Convey Inner Peace": "**Kouzlo 5. úrovně, proměny**\n**Vyvolání:** 1 akce\n**Dosah:** 30 stop\n**Složky:** V, P, S\n**Trvání:** 24 hodin\n\nSobě a až pěti ochotným tvorům v dosahu propůjčíš schopnost vstoupit do meditačního transu podobného elfímu. Každý ovlivněný tvor může jednou před skončením kouzla dokončit dlouhý odpočinek během 4 hodin meditace, stejně jako elf v transu. Po takovém odpočinku získá stejné výhody, jaké by běžně získal po 8 hodinách odpočinku."
};

const VAULT_ITEMS: Readonly<Record<string, string>> = {
  "Candied Axe": "Tato válečná sekera má zlatavou hlavici z krystalizovaného medu a dřevěnou násadu zdobenou řezbami včel. Při útocích a hodech na zranění touto magickou zbraní získáváš bonus +2.",
  "Corpsehunter's Medallion": "Tento amulet je vyroben z lebek hřbitovních krys nebo z vyřezávaných kostí mrtvých. Dokud ho nosíš, máš odolnost proti nekrotickému zranění.",
  "Deserter's Boots": "Dokud tyto boty nosíš, zvyšuje se tvá rychlost chůze o 10 stop a získáváš bonus +1 k záchranným hodům na Obratnost.",
  "Crook of the Flock": "Tato jednoduchá pastýřská berla je z hladkého, opotřebeného lotosového dřeva a na dotek hřeje.",
  "Crocodile Armor": "Dokud nosíš tuto zbroj z krokodýlí kůže, získáváš bonus +1 ke třídě zbroje. Navíc dokážeš zadržet dech na 15 minut a tvá rychlost plavání se rovná rychlosti chůze.",
  "Amulet of Sustaining Health": "Dokud nosíš tento amulet, stačí ti jíst a pít jednou za 7 dní. Navíc máš výhodu k záchranným hodům proti účinkům, které by ti způsobily stupeň vyčerpání.",
  "Amulet of the Oracle": "Když dokončíš dlouhý odpočinek s tímto amuletem na krku, můžeš si vybrat jeden trik ze seznamu kouzel klerika. Tento trik můžeš z amuletu libovolně sesílat. Tvou sesílací vlastností pro něj je Moudrost.",
  "Animated Abacus": "Pokud do vzdálenosti 5 stop od tohoto počitadla vyslovíš matematickou rovnici, počitadlo ji vypočte a ukáže výsledek. Pokud se počitadla dotýkáš, vypočítává pouze rovnice, které vyslovíš ty, a ostatní ignoruje.",
  "Brazen Bulwark": "Tento obdélníkový štít je pokryt leštěnou mosazí a připomíná věž s cimbuřím. Dokud jej používáš, získáváš bonus +1 ke třídě zbroje. Tento bonus se přičítá navíc k obvyklému bonusu štítu.",
  "Breathing Reed": "Tento drobný kousek říčního rákosu je na dotek chladný. Pokud jej žvýkáš pod vodou, poskytuje ti dostatek vzduchu k dýchání až na 10 minut. Po uplynutí této doby ztratí magii a můžeš jej bezpečně spolknout nebo vyplivnout.",
  "Broom of Sweeping": "Akcí můžeš vyslovit příkazové slovo koštěte a dát mu několik krátkých pokynů, například „zameť podlahu“ nebo „opraš skříně“. Koště vyčistí až 5 krychlových stop prostoru za minutu a pokračuje v úklidu, dokud ho další akcí nevypneš. Nedokáže překonat překážku vyšší než 5 stop ani otevřít dveře.",
  "Bow of Accuracy": "Běžný dostřel tohoto luku je dvojnásobný, jeho dlouhý dostřel však zůstává beze změny.",
  "Case of Preservation": "Tento předmět vypadá jako obyčejné pouzdro na mapy či svitky z dobře promazané kůže. Můžeš do něj uložit až 10 svinutých listů papíru nebo 5 svinutých listů pergamenu. Dokud jsou uvnitř, jsou chráněny před poškozením ohněm, vodou, stářím a škůdci.",
  "Boots of the Swift Striker": "Dokud tyto boty nosíš, zvyšuje se tvá rychlost chůze o 10 stop. Navíc můžeš při provedení akce Běh na konci svého pohybu provést jeden útok zbraní. Po tomto útoku již nesmíš pokračovat v pohybu.",
  "Companion's Broth": "Tento jednoduchý vývar, vytvořený kouzelníky se zálibou ve vaření, hojí rány zvířecích společníků a familiárů. Když ho vypije zvíře nebo familiár, obnoví si 2k4 + 2 životů. Místo toho můžeš do vývaru přimíchat okvětní lístek; v tom případě zvíře nebo familiár získá 2k4 dočasných životů na 8 hodin."
};

const TOME_SPELL_INDEX = Object.fromEntries(
  Object.entries(TOME_SPELLS).map(([name, text]) => [textKey(name), text]),
);
const VAULT_ITEM_INDEX = Object.fromEntries(
  Object.entries(VAULT_ITEMS).map(([name, text]) => [textKey(name), text]),
);

export function thirdPartyFullRulesCs(
  reference: { kind: string; name?: string; source?: string; documentSlug?: string },
  locale: Locale,
): string | null {
  if (locale !== "cs" || reference.source !== "open5e") return null;
  const key = textKey(reference.name ?? "");
  if (reference.kind === "spells" && reference.documentSlug === "toh")
    return TOME_SPELL_INDEX[key] ?? null;
  if (reference.kind === "items" && reference.documentSlug === "vom")
    return VAULT_ITEM_INDEX[key] ?? null;
  return null;
}

export const THIRD_PARTY_FULL_RULES_CS_COUNTS = {
  tomeSpells: Object.keys(TOME_SPELLS).length,
  vaultItems: Object.keys(VAULT_ITEMS).length,
} as const;
