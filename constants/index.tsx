export const DATABASE_NAME = "SplatnetShopAlerts";


export const DB_TABLE_USERS = "Users";
export const DB_TABLE_USERS_TO_FILTERS = "UsersToFilters";
export const DB_TABLE_FILTERS = "Filters";

export const DB_FILTER_ID = "filterid";
export const DB_USER_ID = "userid";
export const DB_PAIR_ID = "pairid";

export const DB_GEAR_NAME = "name";

export const DB_GEAR_TYPE_WILDCARD = "typewildcard";
export const DB_GEAR_BRAND_WILDCARD = "brandwildcard";
export const DB_GEAR_ABILITY_WILDCARD = "abilitywildcard";
// The expiration time of the last item this user was notified about.
export const DB_LAST_NOTIFIED_EXPIRATION = "lastnotifiedexpiration";

// TODO: Get complete list of gear from Splatoon Wiki.
export enum GEAR_PROPERTY {
  TYPE = "type",
  ABILITY = "ability",
  BRAND = "brand",
  RARITY = "rarity",
  NAME = "name"
}
export const GEAR_EXPIRATION = "expiration";
export const GEAR_PRICE = "price";
export const GEAR_NAMES = ["Fresh Fish Head", "Annaki Flannel Hoodie"];
export const GEAR_TYPES = ["HeadGear", "ClothingGear", "ShoesGear"];

// GrizzCo, Cuttlegear, and Amiibo brands removed.
export const GEAR_BRANDS = [
    "Annaki",
    "Barazushi",
    "Emberz",
    "Enperry",
    "Firefin",
    "Forge",
    "Inkline",
    "Krak-On",
    "Rockenberg",
    "Skalop",
    "Splash Mob",
    "SquidForce",
    "Takoroka",
    "Tentatek",
    "Toni Kensa",
    "Zekko",
    "Zink"
];
export const GEAR_RARITY = "Rarity";
export const GEAR_RARITY_MAX = 2;
export const GEAR_RARITY_MIN = 0;

// Ability Doubler removed.
export const GEAR_ABILITIES = [
    "Ink Saver (Main)",
    "Ink Saver (Sub)",
    "Ink Recovery Up",
    "Run Speed Up",
    "Swim Speed Up",
    "Special Charge Up",
    "Special Saver",
    "Special Power Up",
    "Quick Respawn",
    "Quick Super Jump",
    "Sub Power Up",
    "Ink Resistance Up",
    "Sub Resistance Up",
    "Intensify Action",
    "Opening Gambit",
    "Last-Ditch Effort",
    "Tenacity",
    "Comeback",
    "Ninja Squid",
    "Haunt",
    "Thermal Ink",
    "Respawn Punisher",
    "Stealth Jump",
    "Object Shredder",
    "Drop Roller"
];

export const FE_WILDCARD = "Any";