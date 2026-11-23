// Install the Czech gettext catalog on the server, like fr-catalog.ts.
import csCatalog from "./cs.json";
import { installCatalog } from "./translate.ts";
import { installCsTables } from "./cs-tables.ts";
import { CS_NAMES_BY_TABLE } from "../content/names-cs.ts";

installCsTables({ names: CS_NAMES_BY_TABLE });
installCatalog("cs", csCatalog);
