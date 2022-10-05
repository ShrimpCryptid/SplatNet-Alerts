import pg from 'pg';
// TODO: Singleton for pool?
const pool = new pg.Pool();

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
const GEAR_TYPES = ["Headgear", "Clothing", "Shoes"];
// TODO: Some SQL requests may fail if gear brands + abilities have spaces in them.
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
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

class Filter {
    gearName: string;
    minimumRarity: number;
    gearTypes: string[];
    gearBrands: string[];
    gearAbilities: string[];

    /**
    * @param {string} gearName string name of gear. If empty, any gear may match. 
    * @param {string[]} gearTypes string names of gear types (Clothing, Shoes, Headgear). If empty, any gear may match.
    * @param {string[]} gearBrands string names of accepted brands. If empty, any brand is accepted.
    * @param {int} minimumRarity minimum required rarity, as int (1, 2, 3).
    * @param {string[]} gearAbilities string names of accepted abilities. If empty, any ability may match.
     */
    constructor(gearName: string = "", minimumRarity: number = 0, gearTypes: string[] = [], gearBrands: string[] = [], gearAbilities: string[] = []) {
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

/**
 * 
 * @returns the given filter represented as a dictionary, where keys are column names for
 * storage in a database table with their corresponding values.
 * Can be iterated over to generate SQL queries.
 */
 function filterToTableData(filter: Filter): {[id: string] : any;} {
    let data = {
        [GEAR_NAME]: filter.gearName,
        [RARITY]: filter.minimumRarity,
        [GEAR_TYPE_WILDCARD]: filter.gearTypes === [] ? 1 : 0, //required bc nonzero values are true
        [GEAR_ABILITY_WILDCARD]: filter.gearAbilities === [] ? 1 : 0,
        [GEAR_BRAND_WILDCARD]: filter.gearBrands === [] ? 1 : 0,
    };

    for (var ability in GEAR_ABILITIES) {
        data[ability] = (ability in filter.gearAbilities) ? 1 : 0;
    }
    for (var brand in GEAR_BRANDS) {
        data[brand] = (brand in filter.gearBrands) ? 1 : 0;
    }
    for (var type in GEAR_TYPES) {
        data[type] = (type in filter.gearTypes) ? 1 : 0;
    }
    return data;
}

/**
 * @effects Initial setup the database and its tables.
 */
function setupDatabaseTables() {
    pool.query(`CREATE DATABASE ${DATABASE_NAME}`);
    pool.query(
        `CREATE TABLE ${USERS_TABLE} (
            ${USER_ID} int NOT NULL AUTO_INCREMENT,
            Email varchar(255),
            LastNotified varchar(255),
            PRIMARY KEY (${USER_ID})
        );`
    );

    // TODO: Add additional user data columns
    pool.query(`
    CREATE TABLE ${USERS_TO_FILTERS_TABLE} (
        PairID int NOT NULL AUTO_INCREMENT,
        ${USER_ID} int(255),
        ${FILTER_ID} int(255),
        PRIMARY KEY (PairID)
    );`);

    // Generate filter table
    // Auto-generates boolean columns for gear types, abilities, and brands.
    let joinedFilterColumnNames = GEAR_TYPES.concat(GEAR_ABILITIES).concat(GEAR_BRANDS);
    let filterColumnQuery = joinedFilterColumnNames.join(" BOOL,\n") + " BOOL";

    pool.query(
        `CREATE TABLE ${FILTERS_TABLE} (
            ${FILTER_ID} int NOT NULL AUTO_INCREMENT,
            ${GEAR_NAME} varchar(255),
            ${RARITY} tinyint(255),
            ${GEAR_TYPE_WILDCARD} BOOL,
            ${GEAR_BRAND_WILDCARD} BOOL,
            ${GEAR_ABILITY_WILDCARD} BOOL,
            ${filterColumnQuery}
        );`
    );


}

/**
 * Searches and returns the ID of the first matching filter.
 * @param filter filter to search 
 * @returns 
 */
async function getMatchingFilterID(filter: Filter): Promise<number> {
    // Gets the given filter from the table

    // SELECT * FROM [TableName]
    // WHERE c1=v1 AND c2=v2 AND c3=v3 AND ...;

    let filterData = filterToTableData(filter);
    let queryArgs: string[] = [];

    for (var key in filterData) {
        //key=value
        queryArgs.push(`${key}=${filterData[key]}`);
    }

    let results = await pool.query(`
        SELECT ${FILTER_ID} FROM ${FILTERS_TABLE}
        WHERE ${queryArgs.join(" AND ")};
    `);
    

    return -1;
}

/**
 * Attempts to add a given filter to the table, if it does not already exist.
 * @return {number} Returns the ID of the filter.
 */
function tryAddFilter(filter: Filter): number{
    // INSERT INTO [table_name] ([col1], [col2], [col3]) VALUES ([val1], [val2], [val3])
    
    let filterData = filterToTableData(filter);

    // Return new filter ID
    return -1;
}

/**
 * Attempts to remove a filter specified by its uuid.
 * @param {number} filterID 
 * @return {boolean} whether the operation was successfully completed.
 */
 function removeFilter(filterID: number) {

}

function subscribeUserToFilter() {

}

function unsubscribeUserToFilter() {

}

/**
 * Gets a list of all filters subscribed to by a designated user.
 * @param {*} user 
 */
function getUserSubscriptions(user) {

}

/**
 * 
 * @param {*} gearData 
 */
function getUsersWithMatchingFilters(gearData) {

}

function tryUpdateGearRegistry(gearData) {
    // Gear registry contains all seen gear items
    // Name, Type, Brand, Image link

}

