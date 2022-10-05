// Utilities for getting the current gear rotation.
import json_data from './gear_example.js';
import fetch from 'node-fetch';

const VERSION = '1.0.0'
var cachedGearJSON = json_data;

/**
 * Gets the most recent shop gear data from splatoon3.ink (https://github.com/misenhower/splatoon3.ink)
 * @returns JSON gear data. See `gear_example.json` for example structure.
 */
async function requestGearJSON() {
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
async function getGearJSON() {
    // Check if oldest item has expired.
    let gearList = getGearList(cachedGearJSON);
    if (Date.now() > Date.parse(gearList[0].saleEndTime)) {
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
function getGearList(gearJSON) {
    let ret = gearJSON.data.gesotown.limitedGears;
    ret = ret.concat(gearJSON.data.gesotown.pickupBrand.brandGears);

    // Sort by expiration date/time, ascending.
    ret.sort((a, b) => {
        return Date.parse(a.saleEndTime) - Date.parse(b.saleEndTime)
    });
    
    return ret;
}

let sortedGearList = getGearList(await getGearJSON())
