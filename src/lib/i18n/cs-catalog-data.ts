// Exact source-text translations for authored subclass prose. Keep the
// generated gettext catalog intact; load both in the same Czech chunk.
import catalog from "./cs.json";
import authoredSubclassText from "./authored-subclass-text-cs.json";

const combinedCatalog = {
  ...catalog,
  messages: { ...authoredSubclassText, ...catalog.messages },
};

export default combinedCatalog;
