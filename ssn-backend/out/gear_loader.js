"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gear = void 0;
// Utilities for getting the current gear rotation.
const gear_example_js_1 = require("./gear_example.js");
const node_fetch_1 = require("node-fetch");
const VERSION = '1.0.0';
var cachedGearJSON = gear_example_js_1.default;
/**
 * Data class for gear items
 */
class Gear {
    constructor() {
        this.id = "";
        this.price = 0;
        this.brand = "";
        this.type = "";
        this.name = "";
        this.ability = "";
        /**The number of rarity stars, ranging from 0-2 (or the number sub ability slots - 1).*/
        this.rarity = 0;
        /**Expiration timestamp, as parsed by Date.parse()*/
        this.expiration = 0;
    }
}
exports.Gear = Gear;
/**
 * Gets the most recent shop gear data from splatoon3.ink (https://github.com/misenhower/splatoon3.ink)
 * @returns JSON gear data. See `gear_example.json` for example structure.
 */
function requestWebGearData() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield (0, node_fetch_1.default)('https://splatoon3.ink/data/gear.json', {
            method: "GET",
            headers: { 'User-Agent': `Splatnet Shop Alerts Prototype/${VERSION} https://twitter.com/ShrimpCryptid` }
        });
        const data = yield response.json();
        return data;
    });
}
/**
 * Gets the cached shop gear data, or retrieves an updated version if any item is now expired.
 */
function getLatestGearData() {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if oldest item has expired.
        let gearList = getGearList(cachedGearJSON);
        if (Date.now() > gearList[0].expiration) {
            // Refresh cache from Splatoon3.ink
            console.log("Cache must be refreshed");
            // TODO: Uncomment
            // cachedGearJSON = await requestGearJSON();
            // TODO: Add logic here in case Splatoon3.ink has not refreshed (retry after some time interval)
        }
        else {
            console.log("Cache OK");
        }
        return cachedGearJSON;
    });
}
/**
 * Formats gear data as a single array, sorted by expiration (ascending).
 */
function getGearList(gearData) {
    // combine the 'pickupBrand' (daily drop) and normal items into one array of JSON objects
    let jsonGearList = gearData.data.gesotown.limitedGears;
    jsonGearList = jsonGearList.concat(gearData.data.gesotown.pickupBrand.brandGears);
    // Parse into gear data objects
    let parsedGearList = [];
    for (var i = 0; i < jsonGearList.length; i++) {
        let gearJSON = jsonGearList[i];
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
        parsedGearList.push(newGear);
    }
    // Sort by expiration date/time, ascending.
    parsedGearList.sort((a, b) => {
        return a.expiration - b.expiration;
    });
    return parsedGearList;
}
