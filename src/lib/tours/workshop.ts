// The workshop tours: the shelf, the hub of a workshop, and one per tool.
// Anchors are data-tour values on the workshop pages and the prep panels;
// prepare names are broadcast by the page (src/lib/tours/prepare.ts) and
// answered by the panel that owns the editor or card in question. Lazy
// steps point at things inside those editors, which do not exist until the
// prepare runs. No "@/" imports here: scripts/test-tours.mjs loads this
// straight from disk.
import { WORLD_TOUR_STEPS } from "./worldforge-tour.ts";
import type { TourStep } from "./logic";

export const SHELF_TOUR_ID = "workshop-shelf";
export const HUB_TOUR_ID = "workshop-hub";

export function systemTourId(system: string): string {
  return `workshop-${system}`;
}

export const SHELF_TOUR: TourStep[] = [
  {
    id: "welcome",
    title: "The workshop shelf",
    body: "A workshop is a prep space with no players and no story running: maps, people, monsters, fights, tables and rules built on your own time, then brought into a campaign when the table sits down. Each one on this shelf stands alone.",
    translations: { fr: { title: "L’étagère de l’atelier", body: "Un atelier est un espace de préparation sans joueurs et sans histoire en cours : des cartes, des gens, des monstres, des combats, des tables et des règles bâtis à ton rythme, puis amenés dans une campagne quand la table s’assoit. Chacun, sur cette étagère, se suffit à lui-même." } },
    anchors: [],
  },
  {
    id: "new",
    title: "Start a workshop",
    body: "Name it and say what party it is built for. Every encounter budget and odds preview inside measures against that party, so difficulty readouts mean something before real characters exist.",
    translations: { fr: { title: "Créer un atelier", body: "Donne-lui un nom et dis pour quel groupe il est préparé. Chaque budget de rencontre et chaque aperçu de probabilités à l’intérieur se mesure à ce groupe, pour que les lectures de difficulté aient un sens avant même que de vrais personnages existent." } },
    anchors: ["shelf-new"],
  },
  {
    id: "import",
    title: "Import a bundle",
    body: "A bundle is a whole workshop as one file, exported from the Share tool here or on another server. A world exported from WorldForge opens the same way, whole: its entries become the Cast, places, factions and lore, and the rest lands in the workshop's WorldForge tool. Importing makes a new workshop of your own; nothing is written into a campaign.",
    translations: { fr: { title: "Importer un paquet", body: "Un paquet est un atelier entier en un seul fichier, exporté depuis l’outil Partage ici ou sur un autre serveur. Un monde exporté de WorldForge s’ouvre de la même façon, en entier : ses entrées deviennent le Cast, les lieux, les factions et le lore, et le reste atterrit dans l’outil WorldForge de l’atelier. Importer crée un nouvel atelier à toi ; rien n’est écrit dans une campagne." } },
    anchors: ["shelf-import"],
  },
  {
    id: "list",
    title: "Your workshops",
    body: "Tap one to open it. Duplicate copies everything in it, board included, for a second version of the same region without risking the first.",
    translations: { fr: { title: "Tes ateliers", body: "Touche l’un pour l’ouvrir. « Dupliquer » copie tout ce qu’il contient, storyboard compris, pour une seconde version de la même région sans risquer la première." } },
    anchors: ["shelf-list"],
  },
  {
    id: "help",
    title: "Help and tours",
    body: "Every tool inside a workshop has a written guide and a tour of its own. Open them from this button, or from the same button inside any tool.",
    translations: { fr: { title: "Aide et visites", body: "Chaque outil d’un atelier a un guide écrit et une visite à lui. Ouvre-les depuis ce bouton, ou depuis le même bouton dans n’importe quel outil." } },
    anchors: ["shelf-help"],
  },
];

export const HUB_TOUR: TourStep[] = [
  {
    id: "welcome",
    title: "Inside a workshop",
    body: "Prep for a game, made before the table sits down. Whatever you make here lands in one tool, which says where it lives and what you can do with it, and reaches a table when a campaign brings the workshop in. Nothing has to be filled in before you play. Each tool opens with a short tour of its own the first time.",
    translations: { fr: { title: "Dans un atelier", body: "La préparation d’une partie, faite avant que la table ne s’assoit. Ce que tu crées ici atterrit dans un outil, qui dit où ça vit et ce que tu peux en faire, et atteint une table quand une campagne amène l’atelier. Rien n’a à être rempli avant de jouer. Chaque outil s’ouvre avec une courte visite à lui, la première fois." } },
    anchors: [],
  },
  {
    id: "create",
    title: "Start from what you want",
    body: "Create asks what you want to end up with (a fight, a battle map, an NPC, a monster, an item or a whole world), says where it will live, and opens the tool that makes it. Make it by hand or copy one that exists; with a text model on the server, Draft with AI and Draft a world from an idea are offered too.",
    translations: { fr: { title: "Partir de ce que tu veux obtenir", body: "Créer demande ce que tu veux obtenir (un combat, une carte de combat, un PNJ, un monstre, un objet ou un monde entier), dit où il vivra, et ouvre l’outil qui le fabrique. Fais-le à la main ou copie-en un qui existe ; avec un modèle de texte sur le serveur, « Ébaucher avec l’IA » et « Bâtir un monde depuis une idée » sont proposés aussi." } },
    anchors: ["workshop-create"],
  },
  {
    id: "party",
    title: "Who it is built for",
    body: "The stand-in party. Change the size or level and every fight in Encounters is rebudgeted against it. It stays pinned inside every tool.",
    translations: { fr: { title: "Pour qui c’est préparé", body: "Le groupe fictif. Change la taille ou le niveau et chaque combat dans Rencontres est rebudgété sur lui. Il reste épinglé dans chaque outil." } },
    anchors: ["hub-party"],
  },
  {
    id: "systems",
    title: "The tools",
    body: "WorldForge is the world's wiki: its people, places, factions and lore are the same records Cast, Region, Factions and Lore edit, and an entry can link to the stat block, item, battle map or fight it is about. Storyboard plans the arc. Party, Battle maps, Encounters, Bestiary, Homebrew and Tables each build one kind of thing the table plays with. Rules holds the house and variant rules. Plugin turns the workshop into a world pack; Share packs it all up as a bundle.",
    translations: { fr: { title: "Les outils", body: "WorldForge est le wiki du monde : ses gens, lieux, factions et lore sont les mêmes fiches que Cast, Région, Factions et Lore éditent, et une entrée peut pointer vers le statblock, l’objet, la carte de combat ou le combat dont elle parle. Storyboard planifie l’arc. Groupe, Cartes de combat, Rencontres, Bestiaire, Homebrew et Tables construisent chacun un type de chose que la table fait jouer. Règles garde les règles de maison et les variantes. Plugin transforme l’atelier en pack de monde ; Partage range le tout en un paquet." } },
    anchors: ["hub-systems"],
  },
  {
    id: "to-table",
    title: "How it reaches a table",
    body: "A campaign brings a workshop in when it is created, from its lobby, or later from the table's Settings. You tick what comes, and the review says what each pick brings along: WorldForge brings the records it describes, and the hand-built monsters and items your prep uses are copied into that table's Bestiary and Homebrew. The campaign gets its own copy; the workshop keeps its own.",
    translations: { fr: { title: "Comment ça parvient à une table", body: "Une campagne amène un atelier à sa création, depuis son salon, ou plus tard depuis les réglages de la table. Tu coches ce qui vient, et la revue dit ce que chaque choix amène avec lui : WorldForge amène les fiches qu’il décrit, et les monstres et objets façonnés à la main que ta préparation utilise sont copiés dans le Bestiaire et le Homebrew de cette table. La campagne reçoit sa propre copie ; l’atelier garde la sienne." } },
    anchors: [],
  },
  {
    id: "actions",
    title: "Rename, copy, delete",
    body: "The pencil renames the workshop in place. The copy button duplicates it with everything inside. Delete is final for the workshop, though anything already imported into a campaign stays there.",
    translations: { fr: { title: "Renommer, copier, supprimer", body: "Le crayon renomme l’atelier sur place. Le bouton copier le duplique avec tout son contenu. « Supprimer » est définitif pour l’atelier, mais ce qui a déjà été importé dans une campagne y reste." } },
    anchors: ["hub-actions"],
  },
  {
    id: "import",
    title: "Import a bundle",
    body: "Reads a bundle file from another workshop or server into a new workshop of its own.",
    translations: { fr: { title: "Importer un paquet", body: "Lit un fichier paquet venu d’un autre atelier ou serveur dans un nouvel atelier à part." } },
    anchors: ["hub-import"],
  },
  {
    id: "help",
    title: "Guides and tours",
    body: "The help button opens a guide for every tool and replays any tour. It is on this page and inside each tool.",
    translations: { fr: { title: "Guides et visites", body: "Le bouton d’aide ouvre le guide de chaque outil et rejoue n’importe quelle visite. Il est sur cette page et dans chaque outil." } },
    anchors: ["hub-help"],
  },
];

// Every tool's tour opens on the rail so the person knows how to leave it,
// and ends on the help button. Between those, its own controls in the order
// a first session uses them.
const RAIL_STEP: TourStep = {
  id: "rail",
  title: "Hop between tools",
  body: "The rail switches tools without going back to the hub. The back link above it returns to the cards.",
  translations: { fr: { title: "Passer d’un outil à l’autre", body: "Le rail change d’outil sans repasser par le centre. Le lien retour au-dessus de lui ramène aux tuiles." } },
  anchors: ["system-rail"],
};

const HELP_STEP: TourStep = {
  id: "help",
  title: "The guide",
  body: "Help opens the written guide for this tool and replays this tour.",
  translations: { fr: { title: "Le guide", body: "L’aide ouvre le guide écrit de cet outil et rejoue cette visite." } },
  anchors: ["system-help"],
};

function tool(steps: TourStep[]): TourStep[] {
  return [RAIL_STEP, ...steps, HELP_STEP];
}

export const SYSTEM_TOURS: Record<string, TourStep[]> = {
  world: tool(WORLD_TOUR_STEPS),
  storyboard: tool([
    {
      id: "add",
      title: "Add a card",
      body: "Pick what kind of thing it is (a scene, a fight, a place, a person, a payoff) and give it a title. Cards are the plan of the adventure.",
      translations: { fr: { title: "Ajouter une carte", body: "Choisis le type de chose (une scène, un combat, un lieu, une personne, un dénouement) et donne un titre. Les cartes sont le plan de l’aventure." } },
      anchors: ["storyboard-add"],
    },
    {
      id: "board",
      title: "The board",
      body: "Tap a card to write it up and link it to the material in the other tools: which NPC, which map, which prepared fight, which place. Linking is by dropdown, so a card never points at something that is not there.",
      translations: { fr: { title: "Le tableau", body: "Touche une carte pour la rédiger et la lier à la matière des autres outils : quel PNJ, quelle carte, quel combat préparé, quel lieu. Le lien se fait par menu déroulant, donc une carte ne pointe jamais vers quelque chose qui n’existe pas." } },
      anchors: ["storyboard-board"],
    },
    {
      id: "missing",
      title: "What the board is missing",
      body: "Counted, not guessed: a fight with no map, a payoff with no scene before it. Each line has a button that adds the card.",
      translations: { fr: { title: "Ce qui manque au tableau", body: "Compté, pas deviné : un combat sans carte, un dénouement sans scène avant lui. Chaque ligne a un bouton qui ajoute la carte." } },
      anchors: ["storyboard-missing"],
    },
    {
      id: "compile",
      title: "What it becomes",
      body: "The preview of what the board turns into when imported into a campaign: lore, quests, prepared fights, GM notes and the story arc.",
      translations: { fr: { title: "Ce que cela devient", body: "L’aperçu de ce en quoi le tableau se transforme une fois importé dans une campagne : lore, quêtes, combats préparés, notes de MJ et arc de l’histoire." } },
      anchors: ["storyboard-compile"],
    },
  ]),
  party: tool([
    {
      id: "roster",
      title: "The pregens",
      body: "Sheets ready for anyone who sits down without a character. A level that differs from the stand-in party is flagged so the budgets stay honest.",
      translations: { fr: { title: "Les pré-tirés", body: "Des fiches prêtes pour quiconque s’assoit sans personnage. Un niveau différent du groupe fictif est signalé, pour que les budgets restent honnêtes." } },
      anchors: ["party-roster"],
    },
    {
      id: "draft",
      title: "Let the AI GM draft them",
      body: "No time to build? The AI GM reads this adventure and proposes a hero for each seat of the party set above, and the builder's own rules make every sheet at that party's level. Drafts arrive unoffered, marked as drafted until you edit them: look them over, then tick the ones players may take.",
      translations: { fr: { title: "Laisser le MJ IA les ébaucher", body: "Pas le temps de les construire ? Le MJ IA lit cette aventure et propose un héros pour chaque siège du groupe fixé ci-dessus, et les règles du créateur de personnage font chaque fiche au niveau de ce groupe. Les ébauches arrivent sans être proposées, marquées comme ébauchées tant que tu ne les as pas éditées : relis-les, puis coche celles que les joueurs peuvent prendre." } },
      anchors: ["party-draft"],
    },
    {
      id: "add",
      title: "Add to the roster",
      body: "Pick a character from your library, or build a new one and come back. Pregens travel inside the bundle when you share the workshop.",
      translations: { fr: { title: "Ajouter à la liste", body: "Choisis un personnage de ta bibliothèque, ou construis-en un nouveau et reviens. Les pré-tirés voyagent dans le paquet quand tu partages l’atelier." } },
      anchors: ["party-add"],
    },
  ]),
  maps: tool([
    {
      id: "new",
      title: "A new map",
      body: "Open this to make one. Name it first; nothing here reaches a table until you put it there.",
      translations: { fr: { title: "Une nouvelle carte", body: "Ouvre ceci pour en faire une. Nomme-la d’abord ; rien ici n’atteint une table tant que tu ne l’y as pas mise." } },
      anchors: ["maps-new"],
    },
    {
      id: "create",
      title: "Roll, draw or import",
      body: "Roll one generates a layout from the size and a hint. Blank rock and Blank ground start empty for painting. Import reads a Universal VTT file from Dungeondraft and its neighbours.",
      translations: { fr: { title: "Tirer, dessiner ou importer", body: "« En tirer une » génère un plan à partir de la taille et d’un indice. « Rocher vierge » et « Terrain vierge » partent vides, prêts à peindre. « Importer .dd2vtt » lit un fichier Universal VTT venu de Dungeondraft et ses voisins." } },
      anchors: ["maps-create"],
      prepare: "open-map-create",
      lazy: true,
    },
    {
      id: "gallery",
      title: "The drawer",
      body: "Every prepared map. Tap one to open the editor: paint terrain, stamp props, place lights, doors, labels and bystanders, hang a backdrop picture, and set the sound the map makes.",
      translations: { fr: { title: "Le tiroir", body: "Chaque carte préparée. Touche l’une pour ouvrir l’éditeur : peins le terrain, tamponne des éléments, place des lumières, des portes, des étiquettes et des passants, accroche une image de fond, et règle le son de la carte." } },
      anchors: ["maps-gallery"],
    },
  ]),
  region: tool([
    {
      id: "canvas",
      title: "The overworld",
      body: "Drag to pan, scroll or pinch to zoom. Places appear to the party as they discover them; you see all of them.",
      translations: { fr: { title: "La carte du monde", body: "Glisse pour déplacer, molette ou pincement pour zoomer. Les lieux apparaissent au groupe au fil de leurs découvertes ; toi, tu les vois tous." } },
      anchors: ["region-canvas"],
    },
    {
      id: "modes",
      title: "The modes",
      body: "Add a pin, place the party, move a place, paint terrain, draw a road, river or border, write a label, or erase. Pick a mode, then tap the map.",
      translations: { fr: { title: "Les modes", body: "Ajouter un point, placer le groupe, déplacer un lieu, peindre le terrain, tracer une route, une rivière ou une frontière, écrire une étiquette, ou effacer. Choisis un mode, puis touche la carte." } },
      anchors: ["region-modes"],
    },
    {
      id: "files",
      title: "Pictures and files",
      body: "Hang a picture in place of the tiles, read in a map from Azgaar's Fantasy Map Generator, or save the region as a PNG. A WorldForge Atlas map can be the backdrop too: use it from the Atlas, then place the places pinned on it here; each then moves with its pin.",
      translations: { fr: { title: "Images et fichiers", body: "Accroche une image à la place des tuiles, lis une carte venue d’Azgaar’s Fantasy Map Generator, ou enregistre la région en PNG. Une carte de l’Atlas WorldForge peut servir de fond aussi : sers-t’en depuis l’Atlas, puis place ici les lieux épinglés dessus ; chacun bouge alors avec son épingle." } },
      anchors: ["region-files"],
    },
    {
      id: "shape",
      title: "Shape the region",
      body: "Describe the land in a sentence and let it set the dials, roll a fresh world, or add named places by hand.",
      translations: { fr: { title: "Façonner la région", body: "Décris le terrain en une phrase et laisse ça régler les curseurs, tire un monde tout neuf, ou ajoute des lieux nommés à la main." } },
      anchors: ["region-shape"],
    },
  ]),
  encounters: tool([
    {
      id: "workbench",
      title: "How hard is this?",
      body: "Weigh a roster before saving it. The readout is the same maths the engine enforces at the table, and every number shows its parts.",
      translations: { fr: { title: "Quelle difficulté ?", body: "Pèse une liste avant de l’enregistrer. La lecture est le même calcul que celui que le moteur fait respecter à la table, et chaque nombre montre ses composantes." } },
      anchors: ["encounters-workbench"],
    },
    {
      id: "workbench-roster",
      title: "Pick the monsters",
      body: "Search what this world holds, the catalogue and your own bestiary, and the pick lands in the roster. Typing works too: one per line, optional x4.",
      translations: { fr: { title: "Choisir les monstres", body: "Cherche dans ce que ce monde contient, dans le catalogue et dans ton propre bestiaire, et le choix atterrit dans la liste. La saisie marche aussi : un par ligne, x4 en option." } },
      anchors: ["encounters-workbench-roster"],
      prepare: "open-workbench",
      lazy: true,
    },
    {
      id: "list",
      title: "Prepared fights",
      body: "Each card carries its difficulty against the stand-in party and the map it opens on. Test fight plays it on a table only you can see, with the stand-ins or characters you pick.",
      translations: { fr: { title: "Les combats préparés", body: "Chaque carte porte sa difficulté face au groupe fictif et la carte sur laquelle elle s’ouvre. « Combat d’essai » la joue sur une table que toi seul vois, avec les personnages fictifs ou les personnages que tu choisis." } },
      anchors: ["encounters-list"],
    },
    {
      id: "new",
      title: "A new encounter",
      body: "Opens the editor for a fight.",
      translations: { fr: { title: "Une nouvelle rencontre", body: "Ouvre l’éditeur d’un combat." } },
      anchors: ["encounters-new"],
    },
    {
      id: "picker",
      title: "The roster",
      body: "Search and pick monsters here; each pick is appended below, where you can still change the counts by hand.",
      translations: { fr: { title: "La liste", body: "Cherche et choisis les monstres ici ; chaque choix s’ajoute en dessous, où tu peux encore changer les nombres à la main." } },
      anchors: ["encounters-picker"],
      prepare: "open-encounter-editor",
      lazy: true,
    },
    {
      id: "map",
      title: "On which map",
      body: "A prepared map from the drawer, or the generator's choice. With a map chosen you can place each creature and the party's entrance on it below.",
      translations: { fr: { title: "Sur quelle carte", body: "Une carte préparée du tiroir, ou le choix du générateur. Avec une carte choisie, tu peux y placer chaque créature et l’entrée du groupe en dessous." } },
      anchors: ["encounters-map"],
      prepare: "open-encounter-editor",
      lazy: true,
    },
    {
      id: "save",
      title: "Prepare it",
      body: "Saves the fight. It is one button at the table from then on.",
      translations: { fr: { title: "Le préparer", body: "Enregistre le combat. C’est ensuite un seul bouton à la table." } },
      anchors: ["encounters-save"],
      prepare: "open-encounter-editor",
      lazy: true,
    },
  ]),
  cast: tool([
    {
      id: "search",
      title: "Find a person",
      body: "By name or alias. The list also fills itself in as the party meets people at the table.",
      translations: { fr: { title: "Trouver une personne", body: "Par nom ou par alias. La liste se remplit aussi toute seule au fil des rencontres du groupe à la table." } },
      anchors: ["cast-search"],
    },
    {
      id: "new",
      title: "Someone new",
      body: "Opens the editor for a person.",
      translations: { fr: { title: "Quelqu’un de nouveau", body: "Ouvre l’éditeur d’une personne." } },
      anchors: ["cast-new"],
    },
    {
      id: "fields",
      title: "Who they are",
      body: "Name, role, attitude to the party and where they are found; the role and the place are dropdowns you can also type into. Below that, their personality, what they want, and how they feel about everyone else.",
      translations: { fr: { title: "Qui c’est", body: "Nom, rôle, attitude envers le groupe et où on le trouve ; le rôle et le lieu sont des menus déroulants dans lesquels tu peux aussi écrire. En dessous, sa personnalité, ce qu’il veut, et ce qu’il pense de chacun des autres." } },
      anchors: ["cast-fields"],
      prepare: "open-npc-editor",
      lazy: true,
    },
    {
      id: "save",
      title: "Save them",
      body: "Keeps the person. Once saved you can add a face, set them aside, or duplicate them.",
      translations: { fr: { title: "L’enregistrer", body: "Garde la personne. Une fois enregistrée, tu peux lui ajouter un visage, la mettre de côté, ou la dupliquer." } },
      anchors: ["cast-save"],
      prepare: "open-npc-editor",
      lazy: true,
    },
  ]),
  factions: tool([
    {
      id: "add",
      title: "Name a power",
      body: "A faction is who it is to the table and what it wants. What the table knows of them is for everyone; what they want is kept from players, though the AI GM is told it, and in a campaign it moves on in the background as chapters close.",
      translations: { fr: { title: "Nommer une puissance", body: "Une faction, c’est ce qu’elle est pour la table et ce qu’elle veut. Ce que la table sait d’elle est pour tout le monde ; ce qu’elle veut est caché aux joueurs, mais le MJ IA le sait, et dans une campagne ça avance en arrière-plan à chaque chapitre clos." } },
      anchors: ["factions-add"],
    },
    {
      id: "list",
      title: "Where the party stands",
      body: "The pips set how the party stands with each faction. Each one is also an entry in WorldForge, where its members, seat and ties are written: edit a faction and World entry opens it.",
      translations: { fr: { title: "Où en est le groupe", body: "Les pastilles règlent où le groupe en est avec chaque faction. Chacune est aussi une entrée dans WorldForge, où ses membres, son siège et ses liens sont écrits : édite une faction et la « Fiche de Monde » s’ouvre." } },
      anchors: ["factions-list"],
    },
  ]),
  bestiary: tool([
    {
      id: "build",
      title: "Build a monster",
      body: "Open this to start one.",
      translations: { fr: { title: "Bâtir un monstre", body: "Ouvre ceci pour en commencer un." } },
      anchors: ["bestiary-build"],
    },
    {
      id: "controls",
      title: "From a baseline or from the books",
      body: "Name it and pick a challenge rating for a baseline block, or search for a catalogue monster to start from and change what you like.",
      translations: { fr: { title: "D’une base ou des livres", body: "Nomme-le et choisis un degré de défi pour un bloc de base, ou cherche un monstre du catalogue comme point de départ et change ce que tu veux." } },
      anchors: ["bestiary-build-controls"],
      prepare: "open-monster-build",
      lazy: true,
    },
    {
      id: "list",
      title: "Your monsters",
      body: "Tap one to open the full stat block: abilities, attacks, traits, senses, spells, and a kit that assembles it from ancestry, class and gear. The rating is derived for you and shows its working. Give it a World entry to tie it to your setting, and add it to a fight in Encounters. Monsters belong to your account and follow you into every workshop; a campaign that brings in prep using one gets its own copy, and the workshop's bundle carries it to other servers.",
      translations: { fr: { title: "Tes monstres", body: "Touche l’un pour ouvrir le statblock complet : caractéristiques, attaques, traits, sens, sorts, et un kit qui l’assemble à partir d’une lignée, d’une classe et d’un équipement. Le degré est calculé pour toi et montre son raisonnement. Donne-lui une fiche de Monde pour le lier à ton univers, et ajoute-le à un combat dans Rencontres. Les monstres appartiennent à ton compte et te suivent dans chaque atelier ; une campagne qui importe une préparation qui en utilise un en reçoit sa propre copie, et le paquet de l’atelier l’emporte vers d’autres serveurs." } },
      anchors: ["bestiary-list"],
    },
  ]),
  homebrew: tool([
    {
      id: "kinds",
      title: "What kind",
      body: "Items, spells, feats, backgrounds, species, classes, subclasses and hazards. Each kind writes the fields the character builder and the engine already read.",
      translations: { fr: { title: "Quel genre", body: "Objets, sorts, dons, historiques, espèces, classes, sous-classes et dangers. Chaque genre remplit les champs que le créateur de personnage et le moteur lisent déjà." } },
      anchors: ["homebrew-kinds"],
    },
    {
      id: "search",
      title: "Find one of yours",
      body: "By name, within the kind you have open.",
      translations: { fr: { title: "Retrouver l’un des tiens", body: "Par nom, dans le genre que tu as ouvert." } },
      anchors: ["homebrew-search"],
    },
    {
      id: "new",
      title: "Make one",
      body: "Opens the editor for that kind.",
      translations: { fr: { title: "En fabriquer un", body: "Ouvre l’éditeur de ce genre." } },
      anchors: ["homebrew-new"],
    },
    {
      id: "start",
      title: "Start from the books",
      body: "Search the content pack and copy a row in, then change one number instead of retyping nine fields. Everything is checked against the ruleset as you type.",
      translations: { fr: { title: "Partir des livres", body: "Cherche dans le pack de contenu et copie une ligne dedans, puis change un chiffre au lieu de retaper neuf champs. Tout est vérifié contre le jeu de règles pendant que tu écris." } },
      anchors: ["homebrew-start"],
      prepare: "open-homebrew-editor",
      lazy: true,
    },
    {
      id: "save",
      title: "Keep it",
      body: "Saves the piece. A finding marked as an error blocks saving until it is fixed. An item can then be given a World entry; one a World entry links to is copied into a campaign that brings that world in, and the workshop's bundle can carry your whole shelf.",
      translations: { fr: { title: "Le garder", body: "Enregistre la pièce. Un constat marqué comme erreur bloque l’enregistrement tant qu’il n’est pas corrigé. Un objet peut ensuite recevoir une fiche de Monde ; un objet vers lequel une fiche de Monde pointe est copié dans une campagne qui importe ce monde, et le paquet de l’atelier peut emporter toute ton étagère." } },
      anchors: ["homebrew-save"],
      prepare: "open-homebrew-editor",
      lazy: true,
    },
  ]),
  lore: tool([
    {
      id: "search",
      title: "Search the lore",
      body: "By title, body or tag.",
      translations: { fr: { title: "Chercher dans le lore", body: "Par titre, par corps ou par étiquette." } },
      anchors: ["lore-search"],
    },
    {
      id: "new",
      title: "A new entry",
      body: "Opens the editor.",
      translations: { fr: { title: "Une nouvelle fiche", body: "Ouvre l’éditeur." } },
      anchors: ["lore-new"],
    },
    {
      id: "title",
      title: "Category and title",
      body: "Geography, factions, history and the rest. The category is what the search tool at the table filters by.",
      translations: { fr: { title: "Catégorie et titre", body: "Géographie, factions, histoire et le reste. La catégorie est ce que l’outil de recherche à la table filtre." } },
      anchors: ["lore-title"],
      prepare: "open-lore-editor",
      lazy: true,
    },
    {
      id: "body",
      title: "The entry",
      body: "Markdown is fine. Pinned entries reach the narrator every turn; the rest are retrieved when relevant.",
      translations: { fr: { title: "L’entrée", body: "Le Markdown passe très bien. Les entrées épinglées atteignent le narrateur à chaque tour ; les autres sont retrouvées quand c’est pertinent." } },
      anchors: ["lore-body"],
      prepare: "open-lore-editor",
      lazy: true,
    },
    {
      id: "link",
      title: "Link another entry",
      body: "Pick an entry and a [[link]] to it lands where the cursor is. Links open the other entry when read.",
      translations: { fr: { title: "Lier une autre entrée", body: "Choisis une entrée et un [[lien]] vers elle atterrit là où se trouve le curseur. Les liens ouvrent l’autre entrée quand on les lit." } },
      anchors: ["lore-link"],
      prepare: "open-lore-editor",
      lazy: true,
    },
    {
      id: "save",
      title: "Add it",
      body: "Saves the entry. Choose whether the table reads it or only you do, and attach a picture to make it a handout.",
      translations: { fr: { title: "L’ajouter", body: "Enregistre l’entrée. Choisis si la table la lit ou si c’est toi seul, et joins une image pour en faire un document à montrer." } },
      anchors: ["lore-save"],
      prepare: "open-lore-editor",
      lazy: true,
    },
    {
      id: "market",
      title: "Shops",
      body: "Below the entries is the Market. Open a shop, say where it stands and who keeps it, and stock its shelf from the content pack or line by line. A campaign that brings this workshop in gets the shops with their shelves.",
      translations: { fr: { title: "Les boutiques", body: "Sous les entrées se trouve le Marché. Ouvre une boutique, dis où elle se trouve et qui la tient, et remplis son étagère depuis le pack de contenu ou ligne par ligne. Une campagne qui importe cet atelier reçoit les boutiques avec leurs étagères." } },
      anchors: ["market-open"],
    },
  ]),
  tables: tool([
    {
      id: "search",
      title: "Your tables",
      body: "Each card shows what die it rolls on and whether every number is covered. Roll writes an ordinary roll everyone sees; what the row says comes back to you alone.",
      translations: { fr: { title: "Tes tables", body: "Chaque carte montre quel dé elle lance et si chaque nombre est couvert. « Tirer » écrit un lancer ordinaire que tout le monde voit ; ce que dit la rangée ne revient qu’à toi." } },
      anchors: ["tables-search"],
    },
    {
      id: "new",
      title: "A new table",
      body: "Opens the editor.",
      translations: { fr: { title: "Une nouvelle table", body: "Ouvre l’éditeur." } },
      anchors: ["tables-new"],
    },
    {
      id: "lookup",
      title: "Look up a monster",
      body: "A stat block from the catalogue, for reference while you write.",
      translations: { fr: { title: "Chercher un monstre", body: "Un statblock du catalogue, pour référence pendant que tu écris." } },
      anchors: ["tables-lookup"],
    },
    {
      id: "body",
      title: "The rows",
      body: "One row per line, with a range or a weight. Paste a table straight out of a book. The line under the box reports gaps and overlaps as you type.",
      translations: { fr: { title: "Les rangées", body: "Une rangée par ligne, avec une plage ou un poids. Colle une table directement sortie d’un livre. La ligne sous la zone signale trous et chevauchements pendant que tu écris." } },
      anchors: ["tables-body"],
      prepare: "open-table-editor",
      lazy: true,
    },
    {
      id: "ref",
      title: "A row that is a thing",
      body: "Pick what kind of thing (another table, a monster, an item, a person, a lore entry) and then the thing itself from what this workshop holds. The row is written for you.",
      translations: { fr: { title: "Une rangée qui est une chose", body: "Choisis le type de chose (une autre table, un monstre, un objet, une personne, une entrée de lore) puis la chose elle-même dans ce que cet atelier contient. La rangée s’écrit pour toi." } },
      anchors: ["tables-ref"],
      prepare: "open-table-editor",
      lazy: true,
    },
    {
      id: "save",
      title: "Save table",
      body: "Draw without replacement turns it into a deck: a rumour heard once is not heard again.",
      translations: { fr: { title: "Sauvegarder la table", body: "« Tirer sans remise » en fait un jeu de cartes : une rumeur entendue une fois n’est pas entendue une deuxième fois." } },
      anchors: ["tables-save"],
      prepare: "open-table-editor",
      lazy: true,
    },
  ]),
  rules: tool([
    {
      id: "library",
      title: "Saved rulesets",
      body: "A ruleset is variant rules and house rulings kept as one thing, reusable across campaigns. Open one to see what applying it here would change.",
      translations: { fr: { title: "Les jeux de règles enregistrés", body: "Un jeu de règles est un ensemble de règles variantes et de décisions de maison gardé d’un bloc, réutilisable d’une campagne à l’autre. Ouvre l’un pour voir ce que l’appliquer ici changerait." } },
      anchors: ["rules-library"],
    },
    {
      id: "save-as",
      title: "Save these rules",
      body: "Keeps the rules below as a ruleset you can apply anywhere.",
      translations: { fr: { title: "Enregistrer ces règles", body: "Garde les règles en dessous comme un jeu de règles applicable où tu veux." } },
      anchors: ["rules-save-as"],
    },
    {
      id: "variants",
      title: "Variant rules",
      body: "Switches the engine honours: flanking, rest lengths and the rest.",
      translations: { fr: { title: "Règles variantes", body: "Des interrupteurs que le moteur respecte : les attaques de flanc, la longueur des repos et le reste." } },
      anchors: ["rules-variants"],
    },
    {
      id: "house",
      title: "House rules",
      body: "Written rules, grouped by heading. The narrator retrieves only the relevant sections each turn; pin one to include it always.",
      translations: { fr: { title: "Règles de maison", body: "Des règles écrites, regroupées par titre. Le narrateur ne retrouve que les sections pertinentes à chaque tour ; épingle-en une pour qu’elle soit toujours incluse." } },
      anchors: ["rules-house"],
    },
  ]),
  plugin: tool([
    {
      id: "sections",
      title: "The parts of a world pack",
      body: "A pack is a name mapping over the rules: the world's own races, classes, spells, gear and monsters, plus its factions, places, hooks and pictures. Each part is a tab here.",
      translations: { fr: { title: "Les parties d’un pack de monde", body: "Un pack est un nom posé sur les règles : les races, classes, sorts, équipements et monstres propres au monde, plus ses factions, lieux, accroches et images. Chaque partie est un onglet ici." } },
      anchors: ["plugin-sections"],
    },
    {
      id: "guided",
      title: "Guided setup",
      body: "Walks through the identity of the world one question at a time: what it is called, whose setting it stands on, its genre and how the narrator should sound. Come back to it any time.",
      translations: { fr: { title: "Réglage guidé", body: "Parcourt l’identité du monde une question à la fois : comment il s’appelle, sur l’univers de qui il se tient, son genre et comment le narrateur doit sonner. Reviens-y quand tu veux." } },
      anchors: ["plugin-guided"],
    },
    {
      id: "pull",
      title: "Pull from this workshop",
      body: "Reads the lore, places, hook cards and cast you already built here into the pack's setting lists. It adds; it never overwrites what you wrote by hand.",
      translations: { fr: { title: "Tirer de cet atelier", body: "Lit le lore, les lieux, les cartes d’accroche et le cast déjà bâtis ici dans les listes de réglage du pack. Ça ajoute ; ça n’écrase jamais ce que tu as écrit à la main." } },
      anchors: ["plugin-pull"],
    },
    {
      id: "publish",
      title: "Check, download, install",
      body: "The Publish tab lists what is missing, then hands you the pack as one file. An admin can install it straight onto this server.",
      translations: { fr: { title: "Vérifier, télécharger, installer", body: "L’onglet « Publish » liste ce qui manque, puis te remet le pack en un fichier. Un admin peut l’installer directement sur ce serveur." } },
      anchors: ["plugin-publish"],
    },
  ]),
  share: tool([
    {
      id: "manifest",
      title: "Name the bundle",
      body: "Name, a line about it, author and version. The rights holder line turns the notice into a proper non-affiliation disclaimer when the world is built on somebody else's setting.",
      translations: { fr: { title: "Nommer le paquet", body: "Nom, une ligne à son sujet, auteur et version. La ligne du détenteur des droits transforme la mention en vraie clause de non-affiliation quand le monde est bâti sur l’univers de quelqu’un d’autre." } },
      anchors: ["share-manifest"],
    },
    {
      id: "export",
      title: "Download or compile",
      body: "Download bundle writes everything here as one file another server can import: every tool's records, the WorldForge world, pictures within the size caps, and your hand-built monsters and homebrew (all of your shelf, or only what this workshop uses). Compile a world pack builds a draft pack and lists what a pack leaves out that the bundle carries.",
      translations: { fr: { title: "Télécharger ou compiler", body: "« Télécharger le paquet » écrit tout ce qui est ici en un fichier qu’un autre serveur peut importer : les fiches de chaque outil, le monde WorldForge, les images sous les limites de taille, et tes monstres et homebrew façonnés à la main (toute ton étagère, ou seulement ce que cet atelier utilise). « Compiler un pack de monde » bâtit un brouillon de pack et liste ce qu’un pack laisse de côté alors que le paquet l’emporte." } },
      anchors: ["share-export"],
    },
  ]),
};

// Every anchor any workshop tour can point at, for the tests and for a
// glance at what the pages must carry.
export function workshopTourAnchors(): string[] {
  const all = [
    ...SHELF_TOUR,
    ...HUB_TOUR,
    ...Object.values(SYSTEM_TOURS).flat(),
  ];
  return [...new Set(all.flatMap((step) => step.anchors))];
}
