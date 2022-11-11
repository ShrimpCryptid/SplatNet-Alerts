// Utilities for getting the current gear rotation.
import json_data from "./gear_example";
import fetch from "node-fetch";
import { getCachedData, setCachedData } from "./database_utils";
import { DB_CACHE_KEY_GEAR_DATA } from "../constants/db";
import { Pool, PoolClient } from "pg";

const VERSION = "1.0.0";

interface GearJSON {
	[key: string]: any;
}

/**
 * Data class for gear items
 */
export class Gear {
	id: string;
	price: number;
	brand: string;
	type: string;
	name: string;
	ability: string;
	/**The number of rarity stars, ranging from 0-2 (or the number sub ability slots - 1).*/
	rarity: number;
	/**Expiration timestamp, as parsed by Date.parse()*/
	expiration: number;
  image: string;

	constructor(
		id = "",
		price = 0,
		brand = "",
		type = "",
		name = "",
		ability = "",
		rarity = 0,
		expiration = 0,
    image = "",
	) {
		this.id = id;
		this.price = price;
		this.brand = brand;
		this.type = type;
		this.name = name;
		this.ability = ability;
		this.rarity = rarity;
		this.expiration = expiration;
    this.image = image;
	}
}

const sortGearByExpiration = (a: Gear, b: Gear) => {
  return a.expiration - b.expiration;
}

/**
 * Formats raw gear data as a single array of Gear items, sorted by expiration (ascending).
 */
 export function rawGearDataToGearList(gearData: { [key: string]: any }): Gear[] {
	// combine the 'pickupBrand' (daily drop) and normal items into one array of JSON objects
	let jsonGearList: GearJSON[] = gearData.data.gesotown.limitedGears;
	jsonGearList = jsonGearList.concat(
		gearData.data.gesotown.pickupBrand.brandGears
	);

	// Parse into gear data objects
	let parsedGearList: Gear[] = [];
	for (let gearJSON of jsonGearList) {
    parsedGearList.push(parseJSONToGear(gearJSON));
	}

	// Sort by expiration date/time, ascending.
	parsedGearList.sort(sortGearByExpiration);
	return parsedGearList;
}

function parseJSONToGear(gearJSON: GearJSON): Gear {
  let newGear = new Gear();

  newGear.id = gearJSON["id"];
  newGear.ability = gearJSON["gear"]["primaryGearPower"]["name"];
  newGear.brand = gearJSON["gear"]["brand"]["name"];
  newGear.expiration = Date.parse(gearJSON["saleEndTime"]);
  newGear.name = gearJSON["gear"]["name"];
  // rarity is defined by number of additional slots - 1
  newGear.rarity = gearJSON["gear"]["additionalGearPowers"].length - 1;
  newGear.price = gearJSON["price"];
  newGear.type = gearJSON["gear"]["__typename"];
  newGear.image = gearJSON["gear"]["image"]["url"];

  return newGear;
}

// Storage and retrieval of gear data

/**
 * Gets the most recent shop gear data from splatoon3.ink (https://github.com/misenhower/splatoon3.ink)
 * @returns JSON gear data. See `gear_example.json` for example structure.
 */
export async function fetchAPIRawGearData(): Promise<any> {
	const response = await fetch("https://splatoon3.ink/data/gear.json", {
		method: "GET",
		headers: {
			"User-Agent": `Splatnet Shop Alerts Prototype/${VERSION} https://twitter.com/ShrimpCryptid`,
		},
	});
	const data = await response.json();
	return data;
}

export async function fetchCachedRawGearData(client: Pool | PoolClient): Promise<any> {
  return await getCachedData(client, DB_CACHE_KEY_GEAR_DATA);
}

export async function updateCachedRawGearData(client: Pool | PoolClient, rawGearData: any) {
  return await setCachedData(client, DB_CACHE_KEY_GEAR_DATA, rawGearData);
}

/**
 * Returns a list of new gear items that weren't in the old gear list, sorted by
 * expiration in ascending order.
 */
export function getNewGearItems(oldGear: Gear[], newGear: Gear[]): Gear[] {
  // Make copies of the original arrays and sort by expiration
  oldGear = [...oldGear];
  newGear = [...newGear];
  oldGear.sort(sortGearByExpiration);
  newGear.sort(sortGearByExpiration);

  let newGearItems = [];
  // Find the expiration date of the last item in the old gear list.
  if (oldGear.length > 0) {
    let formerNewestExpiration = oldGear[oldGear.length - 1].expiration;

    // All items with newer expirations are newer, because expiration length
    // is fixed.
    for (let gear of newGear) {
      if (gear.expiration > formerNewestExpiration) {
        newGearItems.push(gear);
      }
    }
  } else {
    newGearItems = newGear;
  }
  return newGearItems;
}