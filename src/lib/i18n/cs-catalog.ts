// Install the Czech interface catalog and content names on the server.
// Client components load the same data on demand through catalog-loader.ts.
import csCatalog from "./cs.json";
import { CS_NAMES_BY_TABLE } from "../content/names-cs.ts";
import { RESOURCE_CS_GUIDANCE } from "../srd/class-resources-cs-data.ts";
import { installCsTables } from "./cs-tables.ts";
import { installCatalog } from "./translate.ts";

installCatalog("cs", csCatalog);
installCsTables({ names: CS_NAMES_BY_TABLE, guidance: RESOURCE_CS_GUIDANCE });
