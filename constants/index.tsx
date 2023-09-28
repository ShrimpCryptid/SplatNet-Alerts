import { DB_FILTER_ID, DB_USER_ID } from "./db";

export const VERSION = "1.0.0";

export const API_NICKNAME = "nickname";
export const API_NICKNAME_MAX_LENGTH = 30;
export const API_NICKNAME_ALLOWED_CHARS = /^[a-zA-Z0-9- .]*$/;

export const API_USER_CODE = "usercode";
export const API_FILTER_JSON = "filter";
export const API_PREVIOUS_FILTER_JSON = "prev-filter";
export const API_FILTER_ID = DB_FILTER_ID;
export const API_SUBSCRIPTION = "subscription";
export const API_SEND_TEST_NOTIFICATION = "sendtestnotif";
export const API_SUBSCRIPTION_REMOVE_ALL = "removeall";
export const API_RESPONSE_FILTER_LIST = "filters";
export const API_RESPONSE_USER_NICKNAME = API_NICKNAME;

// TODO: Implement limits on user subscribed devices and filters.
/** The maximum number of subscribed devices/browsers a user can have. */
export const API_MAX_SUBSCRIPTIONS = 5;
/** The maximum number of filters allowed per user. */
export const API_MAX_FILTERS = 100;

export const FETCH_BACKOFF_MS = [1, 10, 100, 1000];

export const FE_WILDCARD = "All";
export const FE_LOCAL_USER_CODE = DB_USER_ID;
export const FE_LOCAL_SUBSCRIPTION_INFO = "subscription_info";
export const FE_USER_CODE_URL = "user";

export const FE_ERROR_404_MSG =
	"The server could not find that user ID. Please check your ID or make a new account.";
export const FE_ERROR_500_MSG =
	"The server returned an error (500). Please report this if you keep seeing this message.";
export const FE_ERROR_INVALID_USERCODE =
	"Sorry, that usercode doesn't look right. Please check it and try again.";
export const FE_UNKNOWN_MSG =
	"Sorry, something went wrong. Please try again in a few seconds or refresh the page.";

export const FE_HAS_SHOWN_IOS_WARNING = "has_shown_ios_version_warning";

export enum GEAR_PROPERTY {
	TYPE = "type",
	ABILITY = "ability",
	BRAND = "brand",
	RARITY = "rarity",
	NAME = "name",
}

export const GEAR_EXPIRATION = "expiration";
export const GEAR_PRICE = "price";
export const GEAR_TYPES = ["HeadGear", "ClothingGear", "ShoesGear"];

export const GEAR_BRANDS = [
	"Annaki",
	"Barazushi",
	"Cuttlegear",
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
	"Zink",
	"Z+F",
];
export const IGNORED_GEAR_BRANDS = ["Grizzco", "amiibo"];
export const GEAR_RARITY_MAX = 2;
export const GEAR_RARITY_MIN = 0;

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
	"Drop Roller",
];

let typeExclusiveAbilities: Map<string, string[]> = new Map();
typeExclusiveAbilities.set("HeadGear", [
	"Opening Gambit",
	"Last-Ditch Effort",
	"Tenacity",
	"Comeback",
]);
typeExclusiveAbilities.set("ClothingGear", [
	"Ninja Squid",
	"Haunt",
	"Thermal Ink",
	"Respawn Punisher",
]);
typeExclusiveAbilities.set("ShoesGear", [
	"Stealth Jump",
	"Object Shredder",
	"Drop Roller",
]);
export const TYPE_EXCLUSIVE_ABILITIES = typeExclusiveAbilities;

export const IGNORED_GEAR_ABILITIES = ["Ability Doubler"];
export const GEAR_NAMES_ALLOWED_REGEXP = new RegExp(
	/^[A-Za-z0-9-+()&', \\/]*$/
);
