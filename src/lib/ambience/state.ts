// Shared wire state and empty snapshot; no runtime sound-catalog dependency.
import type { AmbienceLayer } from "@/lib/ambience/catalog";

export type AmbienceState = {
  // Cue ids, or null for silence on that layer.
  bed: string | null;
  music: string | null;
  // Layers the table pinned. Automatic scene tracking leaves these alone
  // until somebody names another cue outright or unpins them.
  held: AmbienceLayer[];
  updatedAt: string;
};

export const EMPTY_AMBIENCE: AmbienceState = {
  bed: null,
  music: null,
  held: [],
  updatedAt: "",
};
