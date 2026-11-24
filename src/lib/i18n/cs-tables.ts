// Czech SRD display names, installed alongside the Czech catalog.
import type { ExpansionIndex } from "../content/expansion-identity";
export type CsTables = {
  names: Record<string, Record<string, string>>;
  guidance: Record<string, string>;
  expansionNames?: ExpansionIndex<{ englishName: string; name: string }>;
};
const STORE = "__odmCsTables";
export function installCsTables(tables: CsTables): void {
  (globalThis as typeof globalThis & { [STORE]?: CsTables })[STORE] = tables;
}
export function csTables(): CsTables | null {
  return (globalThis as typeof globalThis & { [STORE]?: CsTables })[STORE] ?? null;
}
