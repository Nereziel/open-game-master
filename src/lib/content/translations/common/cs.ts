// Shared D&D 5e (2014) terminology only. Source-specific names and rule text
// belong to individual books, not this dictionary.
// Established Czech naming: https://dnd5esrd.d20.cz/prirucka-hrace/7-kapitola.html
export const CS_ABILITIES = {
  Strength: "Síla",
  Dexterity: "Obratnost",
  Constitution: "Odolnost",
  Intelligence: "Inteligence",
  Wisdom: "Moudrost",
  Charisma: "Charisma",
} as const;

export const CS_SKILLS = {
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
} as const;

export const CS_RARITIES = {
  Common: "Běžný",
  Uncommon: "Neobvyklý",
  Rare: "Vzácný",
  "Very Rare": "Velmi vzácný",
  Legendary: "Legendární",
  Artifact: "Artefakt",
} as const;

export const CS_DAMAGE_TYPES = {
  Acid: "Kyselinové",
  Bludgeoning: "Drtivé",
  Cold: "Chladné",
  Fire: "Ohnivé",
  Force: "Silové",
  Lightning: "Bleskové",
  Necrotic: "Nekrotické",
  Piercing: "Bodné",
  Poison: "Jedové",
  Psychic: "Psychické",
  Radiant: "Zářivé",
  Slashing: "Sečné",
  Thunder: "Hromové",
} as const;

export const CS_MAGIC_SCHOOLS = {
  Abjuration: "Vymítání",
  Conjuration: "Vyvolávání",
  Divination: "Věštění",
  Enchantment: "Očarování",
  Evocation: "Zaklínání",
  Illusion: "Iluze",
  Necromancy: "Nekromancie",
  Transmutation: "Transmutace",
} as const;

export const CS_ITEM_CATEGORIES = {
  "Wondrous item": "Divotvorný předmět",
  Weapon: "Zbraň",
  Armor: "Zbroj",
  Potion: "Lektvar",
  Ring: "Prsten",
  Rod: "Žezlo",
  Staff: "Berla",
  Wand: "Hůlka",
  Scroll: "Svitek",
} as const;
