import { currentUser, unauthorized } from "@/lib/auth";
import { getEntryDetail } from "@/lib/content";
import { withBestEffort } from "@/lib/content/entry-labels";
import { withSupplementCzechDisplay } from "@/lib/content/translations/supplements/server-display";
import { matchesRequestedCatalogDocument } from "@/lib/content/translations/supplements/display";
import { bundledItemRows, bundledSpellRows } from "@/lib/rulebook/catalog-rows";
import { bundledGearRow } from "@/lib/workshop/bundled-gear-rows";
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
  const requestedDocument = new URL(request.url).searchParams.get("documentSlug");
  const asEntry = (entry: { id: string; name: string; data: Record<string, unknown> }) =>
    Response.json({
      entry: { slug: `homebrew:${entry.id}`, name: entry.name, source: "homebrew", documentSlug: "homebrew", data: entry.data },
    });

  const decoded = decodeURIComponent(slug);
  if (decoded.startsWith("homebrew:")) {
    if (requestedDocument) return Response.json({ error: "Not found in this source document." }, { status: 404 });
    const entry = getAuthorsHomebrew(scope.userIds, decoded.slice("homebrew:".length));
    if (!entry || (homebrewKind && entry.kind !== homebrewKind)) {
      return Response.json({ error: "Not found." }, { status: 404 });
    }
    return asEntry(entry);
  }

  const entry = getEntryDetail(kind as Parameters<typeof getEntryDetail>[0], decoded);
  if (entry && !matchesRequestedCatalogDocument(entry, requestedDocument)) {
    // A legacy slug-only lookup may resolve a different book. Never return
    // that book when the picker explicitly selected another document.
    return Response.json({ error: "The selected entry is not from this source document." }, { status: 404 });
  }
  if (entry) {
    return Response.json({ entry: withSupplementCzechDisplay(kind, withBestEffort(kind, entry, { classSlug: String(entry.data.class_slug ?? "") || undefined }), true) });
  }
  if (requestedDocument) {
    return Response.json({ error: "Not found in this source document." }, { status: 404 });
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
    return Response.json({ entry: bundled });
  }
  const brewed = homebrewKind ? findHomebrewBySlug(scope.userIds, homebrewKind, decoded) : null;
  return brewed ? asEntry(brewed) : Response.json({ error: "Not found." }, { status: 404 });
}
