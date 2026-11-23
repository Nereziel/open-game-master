// Server-side persisted-sheet validation. Keep this separate from the
// browser-safe source reference helper to avoid loading Zod in pickers.
import { z } from "zod";

export const storedContentReferenceSchema = z.object({
  sourceId: z.string().trim().min(1).max(100),
  contentType: z.enum([
    "rules", "classes", "species", "spells", "monsters", "items", "feats",
    "backgrounds", "subclasses", "features", "conditions",
  ]),
  // Original catalog slug, not a translated label or Markdown page ID.
  contentId: z.string().trim().min(1).max(200),
  documentSlug: z.string().trim().max(100).optional(),
});
