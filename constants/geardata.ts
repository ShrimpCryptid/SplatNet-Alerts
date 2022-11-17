import fs from "fs";
import { Gear } from "../lib/gear";
import rawGearData from "../public/data/geardata.json";

// Import and parse the raw gear data into gear objects
const gearNameToJSONData = new Map(Object.entries(rawGearData));
let gearNameToParsedData: Map<string, Gear> = new Map();
for (let [gearName, data] of gearNameToJSONData.entries()) {
	gearNameToParsedData.set(gearName, Gear.deserialize(data));
}

export const GEAR_NAME_TO_DATA: Map<string, Gear> = gearNameToParsedData;

export const GEAR_NAMES_SET = new Set(GEAR_NAME_TO_DATA.keys());
export const GEAR_NAMES = [...GEAR_NAME_TO_DATA.keys()];

export const GEAR_NAME_TO_IMAGE: Map<string, string | undefined> = new Map(
	GEAR_NAMES.map((name) => {
		return [name, GEAR_NAME_TO_DATA.get(name)?.image];
	})
);

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
export const IGNORED_GEAR_BRANDS = ["GrizzCo", "Cuttlegear", "amiibo"];
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
export const IGNORED_GEAR_ABILITIES = ["Ability Doubler"];
