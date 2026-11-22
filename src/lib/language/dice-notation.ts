// Normalize only dice notation in displayed rules text. The English rule
// engine, dice parser and stored data keep their canonical representation.
// A standalone "2k6" is a roll; "2k" (thousands) and ordinary words are not.
export function displayDiceNotation(text: string): string {
  return text.replace(/(^|[^\p{L}\p{N}_])(\d+)[kK](4|6|8|10|12|20|100)(?![\p{L}\p{N}_])/gu, (_match, before: string, count: string, faces: string) =>
    `${before}${count}d${faces}`);
}
