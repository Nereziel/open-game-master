import type { Locale } from "@/lib/i18n/translate";
import { abilityShortLabel } from "@/lib/srd/ability-short-label";
import { SRD_SKILLS, skillLabel } from "@/lib/srd";

// All game-rule terminology comes from the same helpers as the character UI.
// PDF-only captions remain in this small dictionary.
const ABILITY_CODES = new Set(["STR", "DEX", "CON", "INT", "WIS", "CHA"]);
const SKILL_IDS = new Map(SRD_SKILLS.map((skill) => [skill.name, skill.id]));


// PDF field captions are not part of the DOM, so they must be localized when
// drawing each page. English remains the source and default for existing users.
const LABELS: Record<string, { cs: string; fr: string }> = {
  "Character Name": { cs: "Jméno postavy", fr: "Nom du personnage" },
  "Class & Level": { cs: "Třída a úroveň", fr: "Classe et niveau" },
  "Race": { cs: "Rasa", fr: "Espèce" },
  "Background": { cs: "Zázemí", fr: "Historique" },
  "Alignment": { cs: "Přesvědčení", fr: "Alignement" },
  "Experience": { cs: "Zkušenosti", fr: "Expérience" },
  "Subclass": { cs: "Podtřída", fr: "Sous-classe" },
  "Appearance": { cs: "Vzhled", fr: "Apparence" },
  "Inspir.": { cs: "Inspirace", fr: "Inspiration" },
  "Prof Bonus": { cs: "Bonus zdatn.", fr: "Bonus maîtrise" },
  "Saving Throws": { cs: "Záchranné hody", fr: "Jets de sauvegarde" },
  "Skills": { cs: "Dovednosti", fr: "Compétences" },
  "Passive Perception": { cs: "Pasivní vnímání", fr: "Perception passive" },
  "Armor Class": { cs: "Třída zbroje", fr: "Classe d'armure" },
  "Initiative": { cs: "Iniciativa", fr: "Initiative" },
  "Speed": { cs: "Rychlost", fr: "Vitesse" },
  "Max HP": { cs: "Max. ŽB", fr: "PV max." },
  "Current HP": { cs: "Aktuální ŽB", fr: "PV actuels" },
  "Temp HP": { cs: "Dočasné ŽB", fr: "PV tempor." },
  "Hit Dice": { cs: "Kostky životů", fr: "Dés de vie" },
  "Successes": { cs: "Úspěchy", fr: "Réussites" },
  "Failures": { cs: "Neúspěchy", fr: "Échecs" },
  "Death Saves": { cs: "Záchrany před smrtí", fr: "Jets contre la mort" },
  "Attacks & Spellcasting": { cs: "Útoky a kouzla", fr: "Attaques et sorts" },
  "Name": { cs: "Název", fr: "Nom" },
  "Atk": { cs: "Útok", fr: "Att." },
  "Damage / Type": { cs: "Zran. / typ", fr: "Dégâts / type" },
  "Equipment": { cs: "Vybavení", fr: "Équipement" },
  "Coin": { cs: "Mince", fr: "Monnaie" },
  "Features & Traits": { cs: "Schopnosti a rysy", fr: "Aptitudes et traits" },
  "Feat": { cs: "Odbornost", fr: "Don" },
  "Armor": { cs: "Zbroje", fr: "Armures" },
  "Weapons": { cs: "Zbraně", fr: "Armes" },
  "Tools": { cs: "Nástroje", fr: "Outils" },
  "Languages": { cs: "Jazyky", fr: "Langues" },
  "Other Proficiencies & Languages": { cs: "Další zdatnosti a jazyky", fr: "Autres maîtrises et langues" },
  "Backstory & Notes": { cs: "Příběh a poznámky", fr: "Histoire et notes" },
  "Personality": { cs: "Osobnost", fr: "Personnalité" },
  "Spellcasting": { cs: "Sesílání kouzel", fr: "Incantation" },
  "Ability": { cs: "Vlastnost", fr: "Caractéristique" },
  "Spell Save DC": { cs: "SO záchrany", fr: "DD des sorts" },
  "Spell Atk": { cs: "Útok kouzlem", fr: "Att. sort" },
  "Spell Slots": { cs: "Pozice kouzel", fr: "Emplacements de sorts" },
  "used": { cs: "použito", fr: "utilisés" },
  "Pact": { cs: "Pakt", fr: "Pacte" },
  "Cantrips": { cs: "Triky", fr: "Tours de magie" },
  "Prepared": { cs: "Připravená", fr: "Préparés" },
  "Known": { cs: "Známá", fr: "Connus" },
  "Prepared after the next long rest": { cs: "Připraví se po dalším dlouhém odpočinku", fr: "Préparés après le prochain repos long" },
  "Spellbook": { cs: "Kniha kouzel", fr: "Grimoire" },
  "Spells": { cs: "Kouzla", fr: "Sorts" },
};

export function pdfLabel(locale: Locale, english: string): string {
  if (ABILITY_CODES.has(english)) {
    return abilityShortLabel(english, locale);
  }
  const skillId = SKILL_IDS.get(english);
  if (skillId) {
    return skillLabel(skillId, locale);
  }
  return locale === "en" ? english : LABELS[english]?.[locale] ?? english;
}
