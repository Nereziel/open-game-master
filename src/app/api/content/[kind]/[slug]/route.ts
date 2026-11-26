import { currentUser, unauthorized } from "@/lib/auth";
import { getEntryDetail } from "@/lib/content";
import { withBestEffort } from "@/lib/content/entry-labels";
import "@/lib/i18n/server-catalogs";
import { localizeEntry } from "@/lib/content/entry-descriptions";
import { bookLocaleOf, BOOK_LOCALE_VARY } from "@/lib/rulebook/book";
import { bundledItemRows, bundledSpellRows } from "@/lib/rulebook/catalog-rows";
import { bundledGearRow } from "@/lib/workshop/bundled-gear-rows";
import { bundledArchetypeRows, bundledBackgroundRows, bundledRaceRows } from "@/lib/workshop/catalog-mechanics";
import { bundledClassRows } from "@/lib/workshop/class-catalog";
import { ALL_CLASSES } from "@/lib/srd";
import { contentScopeFor } from "@/lib/content/scope";
import { findHomebrewBySlug, getAuthorsHomebrew } from "@/lib/db/homebrew";
import type { HomebrewKind } from "@/lib/schemas/homebrew";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS: Record<string, HomebrewKind | null> = {
  spells: "spell",
  feats: "feat",
  conditions: null,
  backgrounds: "background",
  races: "race",
  classes: null,
  archetypes: "archetype",
  items: "item",
  monsters: "monster",
};

// One entry: a published one by its slug, or a homebrew one by its
// "homebrew:<id>" slug or by the slug of its name. Homebrew is read from the
// asker's own shelf, or with `campaign=<id>` from whoever runs that table
// (src/lib/content/scope.ts), the same scope as the search route. A
// published name answers as the published entry.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ kind: string; slug: string }> },
) {
  const user = await currentUser();
  if (!user) {
    return unauthorized();
  }

  const { kind, slug } = await params;
  if (!(kind in KINDS)) {
    return Response.json({ error: "Unknown content kind." }, { status: 404 });
  }
  const scope = contentScopeFor(new URL(request.url), user.id);
  if ("error" in scope) {
    return Response.json({ error: scope.error }, { status: scope.status });
  }
  const homebrewKind = KINDS[kind];
  const asEntry = (entry: { id: string; name: string; data: Record<string, unknown> }) =>
    Response.json({
      entry: { slug: `homebrew:${entry.id}`, name: entry.name, source: "homebrew", documentSlug: "homebrew", data: entry.data },
    });

  const decoded = decodeURIComponent(slug);
  if (decoded.startsWith("homebrew:")) {
    const entry = getAuthorsHomebrew(scope.userIds, decoded.slice("homebrew:".length));
    if (!entry || (homebrewKind && entry.kind !== homebrewKind)) {
      return Response.json({ error: "Not found." }, { status: 404 });
    }
    return asEntry(entry);
  }

  const locale = bookLocaleOf(request);
  const localizedResponse = (row: unknown) =>
    Response.json({ entry: localizeEntry(kind, row, locale) }, { headers: { Vary: BOOK_LOCALE_VARY } });
  const entry = getEntryDetail(kind as Parameters<typeof getEntryDetail>[0], decoded);
  if (entry) {
    const withLabel = withBestEffort(kind, entry, { classSlug: String(entry.data.class_slug ?? "") || undefined });
    return localizedResponse(withLabel);
  }
  // The bundled book's rows the search serves with no pack ("srd:web",
  // "srd-gear:longsword"), so their info reads with no pack too.
  const bundled =
    kind === "spells" && decoded.startsWith("srd:")
      ? bundledSpellRows().find((row) => row.slug === decoded)
      : kind === "items" && decoded.startsWith("srd:")
        ? bundledItemRows().find((row) => row.slug === decoded)
        : kind === "items" && decoded.startsWith("srd-gear:")
          ? bundledGearRow(decoded)
          : null;
  if (bundled) {
    return localizedResponse(bundled);
  }
  const brewed = homebrewKind ? findHomebrewBySlug(scope.userIds, homebrewKind, decoded) : null;
  if (brewed) return asEntry(brewed);
  // The info button may know the canonical ID without the bundled srd: prefix.
  if (!decoded.includes(":")) {
    const row = kind === "spells" ? bundledSpellRows().find((r) => r.slug === `srd:${decoded}`)
      : kind === "items" ? bundledItemRows().find((r) => r.slug === `srd:${decoded}`) ?? bundledGearRow(`srd-gear:${decoded}`) : undefined;
    if (row) return localizedResponse(row);
  }
  // The workshop's bundled lists also expose exact slugs for these
  // entries. Published and scoped homebrew lookups above keep precedence.
  const bundledRows = kind === "races" ? bundledRaceRows("", [])
    : kind === "backgrounds" ? bundledBackgroundRows("", [])
    : kind === "classes" ? bundledClassRows("", [])
    : kind === "archetypes" ? ALL_CLASSES
      .filter((klass) => decoded.startsWith(`${klass.id}-`))
      .flatMap((klass) => bundledArchetypeRows(klass.id, "", []))
    : [];
  const bundledDetail = bundledRows.find((row) => row.slug === decoded);
  if (bundledDetail) {
    const classSlug = kind === "archetypes"
      ? (bundledDetail.table as { classSlug?: string } | undefined)?.classSlug : undefined;
    return localizedResponse(withBestEffort(kind, bundledDetail, { classSlug }));
  }
  return Response.json({ error: "Not found." }, { status: 404 });
}
