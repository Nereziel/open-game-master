// Czech display only. The engine's generated counters keep their English
// definitions; this module is installed with the Czech locale chunk.
import { classFeatureName, contentName } from "@/lib/content/names";
import { resourceName } from "@/lib/srd/class-resources";
import { freeCastResourceId, freeCastRestOf, freeCastSpellOf, isFreeCastResource } from "@/lib/srd/feat-spells";
import { invocationOfCounter, INVOCATION_COUNTER_PREFIX } from "@/lib/srd/granted-casts";
import { racialCounterRest, racialCounterSpell, racialSpellCounterId, RACIAL_COUNTER_PREFIX } from "@/lib/srd/racial-grants";

const restPhrase = (rest: "short" | "long") => rest === "short" ? "po krátkém odpočinku" : "po dlouhém odpočinku";

export function czechDynamicResourceDisplay(id: string): { name?: string; guidance?: string } | null {
  if (isFreeCastResource(id)) {
    const rest = freeCastRestOf(id);
    const spell = freeCastSpellOf(id);
    // At-will grants do not have a spent counter. Reject malformed IDs
    // instead of inventing a rule for them.
    if (!spell || rest === "at will" || freeCastResourceId(spell, rest) !== id) return null;
    // The ID only carries a normalized name, not a spell source. Keep the
    // same spelling as the canonical counter and translate its own suffix.
    const title = resourceName(id).slice(0, -" (free cast)".length);
    return {
      name: `${title} (seslání bez pozice)`,
      guidance: `Kouzlo „${title}“ můžeš seslat jednou bez utracení pozice kouzla na jeho vlastní úrovni. Další použití se obnoví ${restPhrase(rest)}. Server použití utratí automaticky při seslání. S pozicí kouzla příslušné nebo vyšší úrovně je můžeš seslat také obvyklým způsobem.`,
    };
  }
  if (id.startsWith(RACIAL_COUNTER_PREFIX)) {
    const rest = racialCounterRest(id);
    const spell = racialCounterSpell(id);
    if (!spell || racialSpellCounterId(spell, rest) !== id) return null;
    // The spell name itself is source-ambiguous, including workshop species.
    return {
      guidance: `Kouzlo „${resourceName(id)}“ můžeš díky svému původu seslat bez utracení pozice kouzla na jeho vlastní úrovni (nebo na úrovni určené rysem). Použití se obnovují ${restPhrase(rest)}. Server jedno použití utratí automaticky při seslání.`,
    };
  }
  if (id.startsWith(INVOCATION_COUNTER_PREFIX)) {
    const row = invocationOfCounter(id);
    if (!row || row.slot !== "slot") return null;
    // Unlike free/racial IDs, this exact invocation definition supplies a
    // fixed SRD spell and a known class feature, not a guessed name match.
    const spell = contentName("spells", { name: row.spell, source: "srd", documentSlug: "wotc-srd" }, "cs");
    const invocation = classFeatureName("warlock", `Invocation: ${row.invocation}`, "cs");
    return {
      name: `${spell} (${invocation})`,
      guidance: `Kouzlo „${spell}“ můžeš díky invokaci „${invocation}“ seslat jednou a utratíš přitom pozici kouzla černokněžníka. Další použití se obnoví po dlouhém odpočinku. Server je utratí automaticky při seslání.`,
    };
  }
  return null;
}
