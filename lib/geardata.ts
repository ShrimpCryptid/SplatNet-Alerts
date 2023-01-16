import { Gear } from "./gear";
import rawGearData from "../public/data/geardata.json";

// TODO: Move to lib because this is not a constants file.

// Import and parse the raw gear data into gear objects
const gearNameToJSONData = new Map(Object.entries(rawGearData));
let gearNameToParsedData: Map<string, Gear> = new Map();
for (let [gearName, data] of gearNameToJSONData.entries()) {
	gearNameToParsedData.set(gearName, Gear.deserializeCompact(gearName, data));
}

export const GEAR_NAME_TO_DATA: Map<string, Gear> = gearNameToParsedData;

export const GEAR_NAMES_SET = new Set(GEAR_NAME_TO_DATA.keys());
export const GEAR_NAMES = [...GEAR_NAME_TO_DATA.keys()];

export const GEAR_NAME_TO_IMAGE: Map<string, string> = new Map(
	GEAR_NAMES.map((name) => {
    let image = GEAR_NAME_TO_DATA.get(name)?.image;
    return [name, image !== undefined ? image : ""];
	})
);