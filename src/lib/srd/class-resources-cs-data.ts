import { RESOURCE_CS_EXTRA_GUIDANCE } from "@/lib/srd/resource-guidance-cs-extra";
import { RESOURCE_CS_AUTHORED_GUIDANCE } from "@/lib/srd/resource-guidance-cs-authored";

// Czech player-facing help for resource counters. The English rules and
// resource ids remain unchanged for the engine and AI tool matching.
export const RESOURCE_CS_GUIDANCE: Record<string, string> = {
  ...RESOURCE_CS_EXTRA_GUIDANCE,
  ...RESOURCE_CS_AUTHORED_GUIDANCE,
  lay_on_hands:
    "Dotykem obnoví paladin tolik životů, kolik bodů utratí ze své zásoby. Místo léčení může utratit 5 bodů a vyléčit jednu nemoc nebo zneutralizovat jeden jed.",
  divine_sense:
    "Do konce svého příštího tahu paladin vycítí polohu nebešťanů, běsů a nemrtvých do 60 stop, pokud nejsou za úplným krytem. Vycítí také posvěcenou či znesvěcenou půdu.",
  race_healing_hands:
    "Akce: tvor, kterého se aasimar dotkne, si obnoví tolik k4 životů, kolik činí aasimarův bonus za zdatnost. Lze použít jednou za dlouhý odpočinek.",
};
