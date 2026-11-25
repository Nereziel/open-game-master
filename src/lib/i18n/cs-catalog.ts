// Install the Czech gettext catalog on the server, like fr-catalog.ts.
import csCatalog from "./cs-catalog-data.ts";
import workshopGuides from "./workshop-guides-cs.json";
import expansionNames from "../content/expansion-names-cs.json";
import { installCatalog } from "./translate.ts";
import { installCsTables } from "./cs-tables.ts";
import { CS_NAMES_BY_TABLE } from "../content/names-cs.ts";
import { RESOURCE_CS_GUIDANCE, czechDynamicResourceDisplay } from "../srd/class-resources-cs-data.ts";

installCsTables({ names: CS_NAMES_BY_TABLE, guidance: RESOURCE_CS_GUIDANCE, dynamicResource: czechDynamicResourceDisplay, expansionNames, workshopGuides });
installCatalog("cs", csCatalog);
