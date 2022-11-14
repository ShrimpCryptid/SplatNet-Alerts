import { DB_FILTER_ID, DB_USER_ID } from "./db";

export const VERSION = "1.0.0";

export const API_USER_CODE = "usercode";
export const API_FILTER_JSON = "filter";
export const API_PREVIOUS_FILTER_JSON = "prev-filter";
export const API_FILTER_ID = DB_FILTER_ID;
export const API_SUBSCRIPTION = "subscription";
export const API_SEND_TEST_NOTIFICATION = "sendtestnotif";

export const API_RESPONSE_FILTER_LIST = "filters";
/** The maximum number of subscribed devices/browsers a user can have. */
export const API_MAX_SUBSCRIPTIONS = 5;

// TODO: Get complete list of gear from Splatoon Wiki.
export enum GEAR_PROPERTY {
	TYPE = "type",
	ABILITY = "ability",
	BRAND = "brand",
	RARITY = "rarity",
	NAME = "name",
}
export const GEAR_EXPIRATION = "expiration";
export const GEAR_PRICE = "price";
export const GEAR_NAMES = ["Fresh Fish Head", "Annaki Flannel Hoodie"];
export const GEAR_TYPES = ["HeadGear", "ClothingGear", "ShoesGear"];

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
	"Zink",
];
export const IGNORED_GEAR_BRANDS = [
  "GrizzCo",
  "Cuttlegear",
  "amiibo"
]
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
export const IGNORED_GEAR_ABILITIES = ["Ability Doubler"]

export const FE_WILDCARD = "Any";
export const FE_LOCAL_USER_CODE = DB_USER_ID;

export const FE_ERROR_404_MSG = "The server could not find your user ID. Please check your ID or make a new account.";
export const FE_ERROR_500_MSG = "The server returned an error (500). Please report if you keep seeing this message.";
