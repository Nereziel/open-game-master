// Czech presentation-only fighting style names and complete 2014 mechanics.
// The English style IDs and feature names remain unchanged in saved sheets.
export const FIGHTING_STYLES_CS: Readonly<Record<string, { name: string; description: string }>> = {
  archery: { name: "Lukostřelba", description: "Získáš +2 k hodům na útok zbraněmi na dálku." },
  defense: { name: "Obrana", description: "Dokud nosíš zbroj, máš +1 k OČ." },
  dueling: { name: "Souboj", description: "Když držíš v jedné ruce zbraň na blízko a žádnou jinou zbraň, způsobíš jí o 2 body zranění více." },
  great_weapon_fighting: { name: "Boj velkou zbraní", description: "Při hodu na zranění obouruční nebo všestrannou zbraní na blízko drženou oběma rukama můžeš přehodit kostku, na níž padla 1 nebo 2." },
  protection: { name: "Ochrana", description: "Reakcí se štítem uložíš nevýhodu jednomu útoku proti spojenci do 5 stop." },
  two_weapon_fighting: { name: "Boj dvěma zbraněmi", description: "Ke zranění útoku zbraní ve druhé ruce přičítáš opravu příslušné vlastnosti." },
};

export function fightingStyleCs(id: string): {name: string;description:string} | null {
  return FIGHTING_STYLES_CS[id] ?? null;
}
