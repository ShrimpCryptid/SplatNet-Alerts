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
const pg_1 = require("pg");
// TODO: Move to a shared global definitions file for backend/frontend
// TODO: Separate headgear, clothing, and shoes gear name lists?
const DATABASE_NAME = "SplatnetShopAlerts";
const FILTER_ID = "FilterID";
const USER_ID = "UserID";
const GEAR_NAME = "Name";
// TODO: Get complete list of gear from Splatoon Wiki.
const GEAR_NAMES = [""];
const GEAR_TYPE_WILDCARD = "TypeWildcard";
const GEAR_BRAND_WILDCARD = "BrandWildcard";
const GEAR_ABILITY_WILDCARD = "AbilityWildcard";
const EXPIRATION = "Expiration";
// The expiration time of the last item this user was notified about.
const LAST_NOTIFIED_EXPIRATION = "LastNotifiedExpiration";
const GEAR_TYPES = ["HeadGear", "ClothingGear", "ShoesGear"];
const GEAR_BRANDS = [
    "amiibo",
    "Annaki",
    "Barazushi",
    "Cuttlegear",
    "Emberz",
    "Enperry",
    "Firefin",
    "Forge",
    "Grizzco",
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
    "Zink"
];
const RARITY = "Rarity";
const MAX_RARITY = 3;
const MIN_RARITY = 1;
const GEAR_ABILITIES = [
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
    "Ability Doubler",
    "Stealth Jump",
    "Object Shredder",
    "Drop Roller"
];
const USERS_TABLE = "Users";
const USERS_TO_FILTERS_TABLE = "UsersToFilters";
const FILTERS_TABLE = "Filters";
// TODO: Move to separate definitions file?
class IllegalArgumentError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
class Filter {
    /**
    * @param {string} gearName string name of gear. If empty, any gear may match.
    * @param {string[]} gearTypes string names of gear types (Clothing, Shoes, Headgear). If empty, any gear may match.
    * @param {string[]} gearBrands string names of accepted brands. If empty, any brand is accepted.
    * @param {int} minimumRarity minimum required rarity, as int (1, 2, 3).
    * @param {string[]} gearAbilities string names of accepted abilities. If empty, any ability may match.
     */
    constructor(gearName = "", minimumRarity = 0, gearTypes = [], gearBrands = [], gearAbilities = []) {
        // Validate parameters
        if (gearName !== "" && GEAR_NAMES.indexOf(gearName) === -1) {
            throw new IllegalArgumentError(`No known gear '${gearName}'.`);
        }
        for (var brand in gearBrands) {
            if (GEAR_BRANDS.indexOf(brand) === -1) {
                throw new IllegalArgumentError(`Gear brand '${brand}' is not recognized.`);
            }
        }
        for (var type in gearTypes) {
            if (GEAR_TYPES.indexOf(type) === -1) {
                throw new IllegalArgumentError(`Gear type '${type}' is not recognized.`);
            }
        }
        if (minimumRarity < MIN_RARITY || minimumRarity > MAX_RARITY) {
            throw new IllegalArgumentError(`Gear rarity must be between ${MIN_RARITY} and ${MAX_RARITY} (provided '${minimumRarity}')`);
        }
        for (var ability in gearAbilities) {
            if (GEAR_ABILITIES.indexOf(ability) === -1) {
                throw new IllegalArgumentError(`Gear ability '${ability}' is not recognized.`);
            }
        }
        this.gearName = gearName;
        this.gearTypes = gearTypes;
        this.gearBrands = gearBrands;
        this.minimumRarity = minimumRarity;
        this.gearAbilities = gearAbilities;
    }
}
/**Removes whitespace from column names.*/
function formatCol(input) {
    return input.replace(" ", "");
}
function arrayEqual(arr1, arr2) {
    if (arr1.length === arr2.length) {
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    }
    return false;
}
/**
 *
 * @returns the given filter represented as a dictionary, where keys are column names for
 * storage in a database table with their corresponding values.
 * Can be iterated over to generate SQL queries.
 */
function filterToTableData(filter) {
    let data = {
        [GEAR_NAME]: filter.gearName,
        [RARITY]: filter.minimumRarity,
        [GEAR_TYPE_WILDCARD]: arrayEqual(filter.gearTypes, []),
        [GEAR_ABILITY_WILDCARD]: arrayEqual(filter.gearAbilities, []),
        [GEAR_BRAND_WILDCARD]: arrayEqual(filter.gearBrands, []),
    };
    for (var ability in GEAR_ABILITIES) {
        data[formatCol(ability)] = (ability in filter.gearAbilities);
    }
    for (var brand in GEAR_BRANDS) {
        data[formatCol(brand)] = (brand in filter.gearBrands);
    }
    for (var type in GEAR_TYPES) {
        data[formatCol(type)] = (type in filter.gearTypes);
    }
    return data;
}
/**
 * @effects Initial setup the database and its tables.
 */
function setupDatabaseTables(client) {
    client.query(`CREATE TABLE ${USERS_TABLE} (
            ${USER_ID} SERIAL,
            Email varchar(255),
            LastNotified varchar(255),
            PRIMARY KEY (${USER_ID})
        );`);
    // TODO: Add additional user data columns
    client.query(`
    CREATE TABLE ${USERS_TO_FILTERS_TABLE} (
        PairID SERIAL,
        ${USER_ID} int(255),
        ${FILTER_ID} int(255),
        ${LAST_NOTIFIED_EXPIRATION} varchar(255),
        PRIMARY KEY (PairID)
    );`);
    // Generate filter table
    // Auto-generates boolean columns for gear types, abilities, and brands.
    let joinedFilterColumnNames = GEAR_TYPES.concat(GEAR_ABILITIES).concat(GEAR_BRANDS);
    joinedFilterColumnNames.forEach(formatCol);
    let filterColumnQuery = joinedFilterColumnNames.join(" BOOL,\n") + " BOOL";
    client.query(`CREATE TABLE ${FILTERS_TABLE} (
            ${FILTER_ID} SERIAL,
            ${GEAR_NAME} varchar(255),
            ${RARITY} tinyint(255),
            ${GEAR_TYPE_WILDCARD} BOOL,
            ${GEAR_BRAND_WILDCARD} BOOL,
            ${GEAR_ABILITY_WILDCARD} BOOL,
            ${filterColumnQuery}
        );`);
}
/**
 * Searches and returns the ID of the first matching filter.
 * @param filter filter to search for
 * @returns The Filter ID of the first matching filter, if one exists. Otherwise, returns -1.
 */
function getMatchingFilterID(client, filter) {
    return __awaiter(this, void 0, void 0, function* () {
        // Gets the given filter from the table
        let filterData = filterToTableData(filter);
        let queryArgs = [];
        for (var key in filterData) {
            // 'key=value'
            queryArgs.push(`${key}=${filterData[key]}`);
        }
        // syntax: SELECT * FROM [TableName]
        // WHERE c1=v1 AND c2=v2 AND c3=v3 AND ...;
        let results = yield client.query(`
        SELECT ${FILTER_ID} FROM ${FILTERS_TABLE}
        WHERE ${queryArgs.join(" AND ")};
    `);
        if (results.rowCount > 0) {
            return results[0][FILTER_ID];
        }
        return -1;
    });
}
/**
 * Attempts to add a given filter to the table, if it does not already exist.
 * @return {number} Returns the ID of newly created filter, or a matching existing filter.
 */
function tryAddFilter(client, filter) {
    return __awaiter(this, void 0, void 0, function* () {
        let filterID = yield getMatchingFilterID(client, filter);
        if (filterID === -1) {
            let filterData = filterToTableData(filter);
            // INSERT INTO [table_name] ([col1], [col2], ...) VALUES ([val1], [val2], ...)
            // RETURNING clause gets the specified columns of any created/modified rows.
            let result = yield client.query(`
            INSERT INTO ${FILTERS_TABLE} (${filterData.keys.join(", ")})
            VALUES (${filterData.values.join(", ")}) RETURNING ${FILTER_ID};`);
            filterID = result.rows[0][FILTER_ID];
        }
        // Return new filter ID
        return filterID;
    });
}
/**
 * Attempts to remove a filter specified by its id.
 * @param {number} filterID
 * @return {boolean} whether the operation was successfully completed.
 */
function removeFilter(client, filterID) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield client.query(`DELETE FROM ${FILTERS_TABLE} WHERE ${FILTER_ID}=${filterID}`);
        // TODO: Change return type based on result?
        return false;
    });
}
function isUserSubscribedToFilter(client, userID, filterID) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield client.query(`
        SELECT * FROM ${USERS_TO_FILTERS_TABLE}
        WHERE ${FILTER_ID} = ${filterID} AND ${USER_ID} = ${userID};`);
        return result.rowCount > 0;
    });
}
function subscribeUserToFilter(client, userID, filterID) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
function unsubscribeUserToFilter(client, userID, filterID) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
/**
 * Gets a list of all filters the user is subscribed to.
 * @param {*} user
 */
function getUserSubscriptions(userID) {
}
/**
 * Gets a list of all the IDs of filters who match the current gear item.
 * @param {*} gearData
 */
function getMatchingFilters(client, gear) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield client.query(`SELECT ${FILTER_ID} FROM ${FILTERS_TABLE}
    WHERE ${RARITY} <= ${gear.rarity}
    AND (${GEAR_NAME} = '' OR ${GEAR_NAME} = ${gear.name})
    AND (${GEAR_ABILITY_WILDCARD} OR ${formatCol(gear.ability)})
    AND (${GEAR_TYPE_WILDCARD} OR ${formatCol(gear.type)})
    AND (${GEAR_BRAND_WILDCARD} OR ${formatCol(gear.brand)})
    `);
        let filterList = [];
        for (var i = 0; i < result.rowCount; i++) {
            filterList.push(result.rows[i][FILTER_ID]);
        }
        return filterList;
    });
}
// TODO: Singleton for pool?
const pool = new pg_1.Pool({
    host: 'localhost:5433',
    user: 'postgres',
});
pool.query("SELECT * FROM TestTable;");
