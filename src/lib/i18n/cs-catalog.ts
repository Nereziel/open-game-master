// Install the Czech gettext catalog on the server, like fr-catalog.ts.
import csCatalog from "./cs.json";
import { installCatalog } from "./translate.ts";

installCatalog("cs", csCatalog);
