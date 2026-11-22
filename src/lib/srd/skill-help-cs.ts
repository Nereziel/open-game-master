// Player-facing explanations of the eighteen SRD skills. Only display text;
// skill IDs, governing abilities and roll modifiers remain unchanged.
import { skillLabel } from "@/lib/srd";
import { abilityShortLabel } from "@/lib/srd/ability-short-label";
import type { Locale } from "@/lib/i18n/translate";

const CS_SKILL_USES: Record<string, string> = {
  acrobatics: "Udržení rovnováhy na úzké nebo kluzké ploše, kotouly a dopady při pádu.",
  animal_handling: "Uklidnění zvířete, ovládání jízdního zvířete a odhad jeho chování.",
  arcana: "Znalosti magie, kouzel, magických předmětů, symbolů a magických tradic.",
  athletics: "Šplhání, plavání, skoky a jiné fyzické překonávání překážek.",
  deception: "Lhaní, blafování a skrývání pravých úmyslů.",
  history: "Znalosti dějin, válek, království, dávných událostí a významných osobností.",
  insight: "Odhadování úmyslů, nálady a pravdomluvnosti jiných tvorů.",
  intimidation: "Zastrašování ostatních hrozbami, vystupováním nebo nátlakem.",
  investigation: "Hledání stop, vyvozování závěrů a odhalování skrytých souvislostí.",
  medicine: "Poskytování první pomoci, stabilizace umírajících a rozpoznávání nemocí.",
  nature: "Znalosti rostlin, zvířat, počasí, terénu a přírodních zákonitostí.",
  perception: "Všímání si zvuků, pohybu, ukrytých předmětů a blížícího se nebezpečí.",
  performance: "Zpěv, tanec, herectví, vyprávění a jiné vystupování před publikem.",
  persuasion: "Přesvědčování ostatních pomocí argumentů, diplomacie a dobrého dojmu.",
  religion: "Znalosti bohů, náboženských obřadů, symbolů a svatých tradic.",
  sleight_of_hand: "Nenápadné pohyby rukou, triky, kapsářství a ukrývání drobných předmětů.",
  stealth: "Tiché plížení, schovávání a nepozorovaný pohyb.",
  survival: "Sledování stop, orientace v divočině, hledání potravy a přežití v přírodě.",
};

const CS_ABILITIES: Record<string, string> = {
  str: "Síly", dex: "Obratnosti", con: "Odolnosti",
  int: "Inteligence", wis: "Moudrosti", cha: "Charismatu",
};

export function skillHelpText(
  skillId: string,
  ability: string,
  locale: Locale,
): string {
  const name = skillLabel(skillId, locale);
  if (locale !== "cs") {
    return `${name} uses ${abilityShortLabel(ability, locale)}. The result of a skill check includes the ability modifier and, if proficient, the proficiency bonus.`;
  }
  const use = CS_SKILL_USES[skillId] ?? "Ověření toho, co se postava pokouší udělat.";
  const governing = CS_ABILITIES[ability] ?? ability;
  return `${use}\n\nBonus z ${governing} se přičítá k hodu d20. Pokud máš v dovednosti zdatnost, přičte se také zdatnostní bonus. Záporný bonus hod snižuje.`;
}
