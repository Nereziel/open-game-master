// Shared reverse lookup for canonical item rows. Import/provenance checks
// and the choice of eligible source rows belong to the caller, not here.
// Once a normalized name is ambiguous it must stay rejected, including
// when another language repeats one of the competing English targets.
export function collectItemAliases({
  tables, englishOf, englishByKey, textKey,
  aliases = new Map(), sameTarget = (a, b) => textKey(a) === textKey(b),
}) {
  const left = [];
  for (const [table, resolveEnglish] of Object.entries(englishOf)) {
    for (const [key, localized] of Object.entries(tables[table] ?? {})) {
      const english = resolveEnglish(key);
      if (!english) {
        left.push(`${table} ${key}: no English item row`);
        continue;
      }
      const localizedKey = textKey(localized);
      if (localizedKey === textKey(english)) continue;
      const clash = englishByKey.get(localizedKey);
      if (clash && textKey(clash) !== textKey(english)) {
        left.push(`${table} ${key}: "${localized}" is the English "${clash}"`);
        continue;
      }
      if (aliases.has(localizedKey)) {
        const previous = aliases.get(localizedKey);
        if (previous === null || !sameTarget(previous, english)) {
          left.push(`${table} ${key}: "${localized}" also names "${previous}"`);
          aliases.set(localizedKey, null);
        }
        continue;
      }
      aliases.set(localizedKey, english);
    }
  }
  return { aliases, left };
}

export function sortedItemAliases(aliases) {
  return Object.fromEntries([...aliases].filter(([, english]) => english).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
}
