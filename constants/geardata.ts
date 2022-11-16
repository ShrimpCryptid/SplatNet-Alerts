import fs from 'fs';
import { Gear } from "../lib/Gear";
import rawGearData from '../public/data/geardata.json';

// Import and parse the raw gear data into gear objects
const gearNameToJSONData = new Map(Object.entries(rawGearData));
let gearNameToParsedData: Map<string, Gear> = new Map();
for (let [gearName, data] of gearNameToJSONData.entries()) {
  gearNameToParsedData.set(gearName, Gear.deserialize(data));
}

export const gearNameToData: Map<string, Gear> = gearNameToParsedData;
export const validGearNames = new Set(gearNameToData.keys());

export const gearNameToImageURL: Map<string, string | undefined> = new Map(
  [...validGearNames].map((name) => {
    return [name, gearNameToData.get(name)?.image];
  }));;
