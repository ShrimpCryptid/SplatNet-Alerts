// Utilities for getting the current gear rotation.
import json_data from './gear_example.js';
import fetch from 'node-fetch';

const VERSION = '1.0.0'
var cachedGearJSON = json_data;

/**
 * Data class for gear items
 */
class Gear {
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
}

/**
 * Gets the most recent shop gear data from splatoon3.ink (https://github.com/misenhower/splatoon3.ink)
 * @returns JSON gear data. See `gear_example.json` for example structure.
 */
async function requestWebGearData(): Promise<any> {
    const response = await fetch('https://splatoon3.ink/data/gear.json', {
        method: "GET",
        headers: {'User-Agent': `Splatnet Shop Alerts Prototype/${VERSION} https://twitter.com/ShrimpCryptid`}
    });
    const data = await response.json();
    return data;
}

/**
 * Gets the cached shop gear data, or retrieves an updated version if any item is now expired.
 */
async function getLatestGearData(): Promise<Object> {
    // Check if oldest item has expired.
    let gearList = getGearList(cachedGearJSON);
    if (Date.now() > gearList[0].expiration) {
        // Refresh cache from Splatoon3.ink
        console.log("Cache must be refreshed");
        // TODO: Uncomment
        // cachedGearJSON = await requestGearJSON();

        // TODO: Add logic here in case Splatoon3.ink has not refreshed (retry after some time interval)
    } else {
        console.log("Cache OK");
    }
    return cachedGearJSON;
}

/**
 * Formats gear data as a single array, sorted by expiration (ascending).
 */
function getGearList(gearData): Gear[] {
    // combine the 'pickupBrand' (daily drop) and normal items into one array of JSON objects
    let jsonGearList = gearData.data.gesotown.limitedGears;
    jsonGearList = jsonGearList.concat(gearData.data.gesotown.pickupBrand.brandGears);

    // Parse into gear data objects
    let parsedGearList: Gear[] = []
    
    for (var gearJSON in jsonGearList) {
        let newGear = new Gear();

        newGear.id = gearJSON["id"];
        newGear.ability = gearJSON["gear"]["primaryGearPower"]["name"];
        newGear.brand = gearJSON["gear"]["brand"]["name"];
        newGear.expiration = Date.parse(gearJSON["saleEndTime"]);
        newGear.name = gearJSON["gear"]["name"];
        newGear.rarity = gearJSON["gear"]["additionalGearPowers"].length - 1;
        newGear.price = gearJSON["price"];
        newGear.type = gearJSON["gear"]["__typename"];

        parsedGearList.push(newGear);
    }

    // Sort by expiration date/time, ascending.
    parsedGearList.sort((a, b) => {
        return a.expiration - b.expiration;
    });
    return parsedGearList;
}


let sortedGearList = getGearList(await getLatestGearData())
