// Czech translations for visible SRD names. Never change stored English IDs.
type CsTables = {
  names: Record<string, Record<string, string>>;
  guidance?: Record<string, string>;
};
const STORE = "__odmCsTables";

export function installCsTables(tables: CsTables): void {
  (globalThis as typeof globalThis & { [STORE]?: CsTables })[STORE] = tables;
}

export function csTables(): CsTables | null {
  return (globalThis as typeof globalThis & { [STORE]?: CsTables })[STORE] ?? null;
}
