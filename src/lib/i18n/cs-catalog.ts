// Install the Czech gettext catalog on the server, like fr-catalog.ts.
import csCatalog from "./cs.json";
import { installCatalog } from "./translate.ts";
import { installCsTables } from "./cs-tables.ts";
import { CS_NAMES_BY_TABLE } from "../content/names-cs.ts";
import { RESOURCE_CS_GUIDANCE } from "../srd/class-resources-cs-data.ts";

installCsTables({ names: CS_NAMES_BY_TABLE, guidance: RESOURCE_CS_GUIDANCE });
installCatalog("cs", csCatalog);
