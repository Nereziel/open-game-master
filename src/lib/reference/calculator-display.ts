// Player-facing localization for the calculator's generated sentences.
// Calculations, units and the English source results remain unchanged.
// Only templates with a known, stable numeric shape are translated.
export type CalculatorTranslator = (key: string, vars?: Record<string, string | number>) => string;

type Pattern = readonly [RegExp, string, readonly string[]];

// Every pattern is anchored to avoid translating player-authored prose or
// accidentally consuming fragments of longer, unrecognized formulas.
const TEMPLATES: ReadonlyArray<Pattern> = [
  [/^([\d.,]+) x ([\d.,]+) XP for CR ([\d./]+)$/, "{monsters} x {xp} XP for CR {cr}", ["monsters", "xp", "cr"]],
  [/^(\d+) monsters? against (\d+) players?$/, "{monsters} monsters against {players} players", ["monsters", "players"]],
  [/^easy, medium, hard, deadly for (\d+) at level (\d+)$/, "easy, medium, hard, deadly for {players} at level {level}", ["players", "level"]],
  [/^([\d.,]+) gp on average$/, "{amount} gp on average", ["amount"]],
  [/^Tier (\d+)$/, "Tier {tier}", ["tier"]],
  [/^(\d+d\d+) x ([\d.,]+) gp$/, "{dice} x {amount} gp", ["dice", "amount"]],
  [/^([\d.,]+) to ([\d.,]+) gp$/, "{low} to {high} gp", ["low", "high"]],
  [/^([\d.,]+) miles in 8 hours, then ([\d.,]+) miles an hour for (\d+) more$/, "{normal} miles in 8 hours, then {speed} miles an hour for {extra} more", ["normal", "speed", "extra"]],
  [/^([\d.,]+) miles in a full 8-hour day$/, "{distance} miles in a full 8-hour day", ["distance"]],
  [/^(\d+) hours at ([\d.,]+) miles an hour$/, "{hours} hours at {speed} miles an hour", ["hours", "speed"]],
  [/^([\d.,]+) miles an hour$/, "{speed} miles an hour", ["speed"]],
  [/^([\d.,]+) feet a minute$/, "{speed} feet a minute", ["speed"]],
  [/^([\d.,]+) miles$/, "{distance} miles", ["distance"]],
  [/^passive Perception ([+-]?\d+)$/, "passive Perception {modifier}", ["modifier"]],
  [/^(\d+) extra hours?$/, "{count} extra hours", ["count"]],
  [/^A Constitution save each hour, DC (\d+) rising to DC (\d+), or a level of exhaustion$/, "A Constitution save each hour, DC {start} rising to DC {end}, or a level of exhaustion", ["start", "end"]],
  [/^A normal day is (\d+) hours\. Past that every hour is a forced march\.$/, "A normal day is {hours} hours. Past that every hour is a forced march.", ["hours"]],
  [/^a score of (\d+)$/, "a score of {score}", ["score"]],
  [/^level (\d+)$/, "level {level}", ["level"]],
  [/^([\d.,]+) coins at (\d+) to the pound$/, "{coins} coins at {perPound} to the pound", ["coins", "perPound"]],
  [/^A (\w+) body carries x([\d.]+) what a Medium one does\.$/, "A {size} body carries x{factor} what a Medium one does.", ["size", "factor"]],
  [/^CR ([\d./]+)$/, "CR {cr}", ["cr"]],
];

export function calculatorDisplayText(text: string, t: CalculatorTranslator): string {
  // Exact strings (including difficulty verdicts and the original notes)
  // always take precedence over the dynamic templates.
  const direct = t(text);
  if (direct !== text) return direct;

  const days = /^(\d+) days?$/.exec(text);
  if (days) {
    const count = Number(days[1]);
    const key = count === 1 ? "{count} day" : count >= 2 && count <= 4 ? "{count} days (few)" : "{count} days";
    return t(key, { count });
  }
  for (const [pattern, key, fields] of TEMPLATES) {
    const matched = pattern.exec(text);
    if (!matched) continue;
    const vars: Record<string, string | number> = {};
    fields.forEach((field, index) => { vars[field] = matched[index + 1]; });
    return t(key, vars);
  }
  // Unknown content-pack phrases are not guessed at or mutated.
  return text;
}
