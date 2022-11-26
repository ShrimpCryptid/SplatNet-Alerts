/**
 * Constants for interacting with the database.
 */
export const DATABASE_NAME = "SplatnetShopAlerts";

// GearCache table data
export const DB_TABLE_SERVER_CACHE = "ServerCache";
/** Raw gear data JSON, as retrieved from Splatoon3.ink. */
export const DB_CACHE_KEY = "cachekey";
export const DB_CACHE_DATA = "cachedata";

export const DB_CACHE_KEY_GEAR_DATA = "geardata";

// UsersToFilters table data
export const DB_TABLE_USERS_TO_FILTERS = "UsersToFilters";
/** Unique identifier for every pairing between a user and a filter. */
export const DB_PAIR_ID = "pairid";

// User table data
/** User's unique internal integer index in the database. */
export const DB_USER_ID = "userid";  // also used in UserToFilter, Subscriptions
export const DB_TABLE_USERS = "Users";
/** User's unique user code, as a uuid string. */
export const DB_USER_CODE = "usercode";
/** An optional, non-unique user display name. */
export const DB_NICKNAME = "nickname";
/** The expiration time of the last item this user was notified about.*/
export const DB_LAST_NOTIFIED_EXPIRATION = "lastnotifiedexpiration";
export const DB_LAST_MODIFIED = "lastmodified";

// Subscription table data
export const DB_TABLE_SUBSCRIPTIONS = "Subscriptions";
export const DB_SUBSCRIPTION_ID = "subscriptionid";
export const DB_ENDPOINT = "endpoint";
export const DB_EXPIRATION = "expiration";
export const DB_AUTH_KEY = "auth";
export const DB_P256DH_KEY = "p256dh";

// Filter table data
export const DB_TABLE_FILTERS = "Filters";
export const DB_FILTER_ID = "filterid"; // Used in Filters, UsersToFilters
export const DB_GEAR_NAME = "name";
export const DB_GEAR_RARITY = "rarity";
export const DB_GEAR_TYPE_WILDCARD = "typewildcard";
export const DB_GEAR_BRAND_WILDCARD = "brandwildcard";
export const DB_GEAR_ABILITY_WILDCARD = "abilitywildcard";
