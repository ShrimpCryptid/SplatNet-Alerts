/**
 * Constants for interacting with the database.
 */
export const DATABASE_NAME = "SplatnetShopAlerts";
// Database constants-- table and column names for accessing database values.

export const DB_TABLE_GEAR_CACHE = "GearCache";
// Shared column names across multiple tables

export const DB_FILTER_ID = "filterid"; // Used in Filters, UsersToFilters

/** User's unique internal integer index in the database. */
export const DB_USER_ID = "userid";
// UsersToFilters table data

export const DB_TABLE_USERS_TO_FILTERS = "UsersToFilters";
/** Unique identifier for every pairing between a user and a filter. */
export const DB_PAIR_ID = "pairid";
// User table data

export const DB_TABLE_USERS = "Users";
/** User's unique user code. */
export const DB_USER_CODE = "usercode";
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
export const DB_GEAR_NAME = "name";
export const DB_GEAR_RARITY = "rarity";
export const DB_GEAR_TYPE_WILDCARD = "typewildcard";
export const DB_GEAR_BRAND_WILDCARD = "brandwildcard";
export const DB_GEAR_ABILITY_WILDCARD = "abilitywildcard";
