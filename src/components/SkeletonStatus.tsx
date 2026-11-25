"use client";

import { useT } from "@/lib/locale";

// Keep the skeleton layout usable on the server; only its spoken label
// needs the reader's current locale.
export function SkeletonStatus({ table = false }: { table?: boolean }) {
  const t = useT();
  return <span className="sr-only">{table ? t("Loading the table") : t("Loading")}</span>;
}
