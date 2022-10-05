import { Pool, PoolClient, Query, QueryResult} from 'pg';
import { Gear } from './gear_loader';

// TODO: Move to a shared global definitions file for backend/frontend
// TODO: Separate headgear, clothing, and shoes gear name lists?
const DATABASE_NAME = "SplatnetShopAlerts";
const FILTER_ID = "filterid";
const USER_ID = "userid";
const GEAR_NAME = "name";
// TODO: Get complete list of gear from Splatoon Wiki.
const GEAR_NAMES = ["Fresh Fish Head"];
const GEAR_TYPE_WILDCARD = "typewildcard";
const GEAR_BRAND_WILDCARD = "brandwildcard";
const GEAR_ABILITY_WILDCARD = "abilitywildcard";
const EXPIRATION = "expiration";
// The expiration time of the last item this user was notified about.
const LAST_NOTIFIED_EXPIRATION = "lastnotifiedexpiration";
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
const MAX_RARITY = 5;
const MIN_RARITY = 0;
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
        for (var brand of gearBrands) {
            if (!GEAR_BRANDS.includes(brand)) {
                throw new IllegalArgumentError(`Gear brand '${brand}' is not recognized.`);
            }
        }
        for (var type of gearTypes) {
            if (!GEAR_TYPES.includes(type)) {
                throw new IllegalArgumentError(`Gear type '${type}' is not recognized.`);
            }
        }
        if (minimumRarity < MIN_RARITY || minimumRarity > MAX_RARITY) {
            throw new IllegalArgumentError(`Gear rarity must be between ${MIN_RARITY} and ${MAX_RARITY} (provided '${minimumRarity}')`);
        }
        for (var ability of gearAbilities) {
            if (!GEAR_ABILITIES.includes(ability)) {
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
function formatCol(input: string): string {
    return input.replace(/\(| |\)|-/g, "").toLowerCase(); // Remove (, ), whitespace, and - characters.
}

function arrayEqual(arr1: any[], arr2: any[]): boolean {
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

async function queryAndLog(client: Pool | PoolClient, query: string): Promise<void | QueryResult> {
    try {
        const result = await client.query(query);
        return result;
    } catch (err) {
        console.log(query);
        console.log(err);
    }
    return;
}

/**
 * 
 * @returns the given filter represented as a dictionary, where keys are column names for
 * storage in a database table with their corresponding values.
 * Can be iterated over to generate SQL queries.
 */
function filterToTableData(filter: Filter): {[id: string] : any;} {
    let data: {[key:string]:any} = {
        [GEAR_NAME]: `'${filter.gearName}'`,
        [RARITY]: filter.minimumRarity,
        [GEAR_TYPE_WILDCARD]: arrayEqual(filter.gearTypes, []),
        [GEAR_ABILITY_WILDCARD]: arrayEqual(filter.gearAbilities, []),
        [GEAR_BRAND_WILDCARD]: arrayEqual(filter.gearBrands, []),
    };

    for (var ability of GEAR_ABILITIES) {
        data[formatCol(ability)] = (filter.gearAbilities.includes(ability));
    }
    for (var brand of GEAR_BRANDS) {
        data[formatCol(brand)] = (filter.gearBrands.includes(brand));
    }
    for (var type of GEAR_TYPES) {
        data[formatCol(type)] = (filter.gearTypes.includes(type));
    }
    return data;
}

/**
 * @effects Initial setup the database and its tables.
 */
function setupDatabaseTables(client: Pool | PoolClient) {
    client.query(
        `CREATE TABLE IF NOT EXISTS ${USERS_TABLE} (
            ${USER_ID} SERIAL,
            Email varchar(255),
            LastNotified varchar(255),
            PRIMARY KEY (${USER_ID})
        );`);

    // TODO: Add additional user data columns
    client.query(`
    CREATE TABLE IF NOT EXISTS ${USERS_TO_FILTERS_TABLE} (
        PairID SERIAL,
        ${USER_ID} int4,
        ${FILTER_ID} int4,
        ${LAST_NOTIFIED_EXPIRATION} int8,
        PRIMARY KEY (PairID)
    );`);

    // Generate filter table
    // Auto-generates boolean columns for gear types, abilities, and brands.
    let joinedFilterColumnNames = GEAR_TYPES.concat(GEAR_ABILITIES).concat(GEAR_BRANDS);
    for (let i = 0; i < joinedFilterColumnNames.length; i++) {
        joinedFilterColumnNames[i] = formatCol(joinedFilterColumnNames[i]);
    }
    let filterColumnQuery = joinedFilterColumnNames.join(" BOOL,\n\t") + " BOOL";
    
    client.query(`CREATE TABLE IF NOT EXISTS ${FILTERS_TABLE} (
        ${FILTER_ID} SERIAL,
        ${GEAR_NAME} varchar(255),
        ${RARITY} int2,
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
async function getMatchingFilterID(client: PoolClient, filter: Filter): Promise<number> {
    // Gets the given filter from the table

    let filterData = filterToTableData(filter);
    let queryArgs: string[] = [];
    for (var key in filterData) {
        // 'key=value'
        queryArgs.push(`${key} = ${filterData[key]}`);
    }

    // syntax: SELECT * FROM [TableName]
    // WHERE c1=v1 AND c2=v2 AND c3=v3 AND ...;
    let results = await queryAndLog(client, `
        SELECT ${FILTER_ID} FROM ${FILTERS_TABLE}
        WHERE ${queryArgs.join(" AND ")};
    `);
    if (results) {
        if (results.rowCount > 0) {
            return results.rows[0][FILTER_ID];
        }
    }
    return -1;
}

/**
 * Attempts to add a given filter to the table, if it does not already exist.
 * @return {number} Returns the ID of newly created filter, or a matching existing filter.
 */
async function tryAddFilter(client: PoolClient, filter: Filter): Promise<number>{
    let filterID = await getMatchingFilterID(client, filter);

    if (filterID === -1) {
        let filterData = filterToTableData(filter);
        
        // INSERT INTO [table_name] ([col1], [col2], ...) VALUES ([val1], [val2], ...)
        // RETURNING clause gets the specified columns of any created/modified rows.
        let result = await client.query(`
            INSERT INTO ${FILTERS_TABLE} (${Object.keys(filterData).join(", ")})
            VALUES (${Object.values(filterData).join(", ")}) RETURNING ${FILTER_ID};`
        )
        filterID = result.rows[0][FILTER_ID];
    } 
    // Return new filter ID
    return filterID;
}

/**
 * Attempts to remove a filter specified by its id.
 * @param {number} filterID 
 * @return {boolean} whether the operation was successfully completed.
 */
async function removeFilter(client: PoolClient, filterID: number): Promise<boolean> {
    // TODO: Only allow deletion if the filter has no paired users?
    let result = await client.query(`DELETE FROM ${FILTERS_TABLE} WHERE ${FILTER_ID}=${filterID}`);
    // TODO: Change return type based on result?
    return false;
}

async function isUserSubscribedToFilter(client: PoolClient, userID: number, filterID: number): Promise<boolean> {
    let result = await client.query(`
        SELECT * FROM ${USERS_TO_FILTERS_TABLE}
        WHERE ${FILTER_ID} = ${filterID} AND ${USER_ID} = ${userID};`
    );
    return result.rowCount > 0;
}

async function subscribeUserToFilter(client: PoolClient, userID: number, filterID: number) {

}

async function unsubscribeUserToFilter(client: PoolClient, userID: number, filterID: number) {

}

/**
 * Gets a list of all filters the user is subscribed to.
 * @param {*} user 
 */
function getUserSubscriptions(client: PoolClient, userID: number) {

}

/**
 * Gets a list of all the IDs of filters who match the current gear item.
 * @param {*} gearData 
 */
async function getMatchingFilters(client: PoolClient, gear: Gear): Promise<number[]> {
    let result = await client.query(`SELECT ${FILTER_ID} FROM ${FILTERS_TABLE}
    WHERE ${RARITY} <= ${gear.rarity}
    AND (${GEAR_NAME} = '' OR ${GEAR_NAME} = ${gear.name})
    AND (${GEAR_ABILITY_WILDCARD} OR ${formatCol(gear.ability)})
    AND (${GEAR_TYPE_WILDCARD} OR ${formatCol(gear.type)})
    AND (${GEAR_BRAND_WILDCARD} OR ${formatCol(gear.brand)})
    `);

    let filterList: number[] = [];
    for (var i = 0; i < result.rowCount; i++) {
        filterList.push(result.rows[i][FILTER_ID]);
    }

    return filterList;
}

// TODO: Singleton for pool?
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    port: 5433
});

/**
pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res)
    pool.end()
});
*/

setupDatabaseTables(pool);

let testAnyFilter = new Filter("", 2, [], ["Rockenberg"], ["Run Speed Up"]);
//let testFindGear = new Filter("Fresh Fish Head", 0, [], [], []);

pool.connect((err, client, done) => {
    if (err) throw err;
    
    removeFilter(client, 6).then((result) => {
        done();
    });
});

pool.connect((err, client, done) => {
    if (err) throw err;
    
    tryAddFilter(client, testAnyFilter).then((result) => {
        done();
    });
});