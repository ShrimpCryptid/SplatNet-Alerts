
// TODO: Move to a shared global definitions file for backend/frontend
// TODO: Separate headgear, clothing, and shoes gear name lists?
const FILTER_UUID = "uuid";
const USER_ID = "User ID";
const GEAR_NAMES = [""];
const GEAR_TYPE_WILDCARD = "Type Wildcard";
const GEAR_BRAND_WILDCARD = "Brand Wildcard";
const GEAR_ABILITY_WILDCARD = "Ability Wildcard";
const EXPIRATION = "Expiration"
const GEAR_TYPES = ["Headgear", "Clothing", "Shoes"];
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
const RARITY = "rarity";
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

// TODO: Move to separate definitions file?
class IllegalArgumentError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}



class Filter {
    /**
    * @param {uuid} uuid unique identifier for this filter.
    * @param {*} user userID
    * @param {string} gearName string name of gear. If empty, any gear may match. 
    * @param {string[]} gearTypes string names of gear types (Clothing, Shoes, Headgear). If empty, any gear may match.
    * @param {string[]} gearBrands string names of accepted brands. If empty, any brand is accepted.
    * @param {int} minimumRarity minimum required rarity, as int (1, 2, 3).
    * @param {string[]} gearAbilities string names of accepted abilities. If empty, any ability may match.
    * @param {string} expirationTimestamp timestamp of filter expiration.
     */
    constructor(uuid, userID, gearName, gearTypes, gearBrands, minimumRarity, gearAbilities, expirationTimestamp) {
        // Validate parameters
        if (gearName !== "" && GEAR_NAMES.indexOf(gearName) === -1) {
            throw new IllegalArgumentError(`No known gear '${gearName}'.`);
        }
        for (brand in gearBrands) {
            if (GEAR_BRANDS.indexOf(brand) === -1) {
                throw new IllegalArgumentError(`Gear brand '${brand}' is not recognized.`);
            }
        }
        for (type in gearTypes) {
            if (GEAR_TYPES.indexOf(type) === -1) {
                throw new IllegalArgumentError(`Gear type '${type}' is not recognized.`);
            }
        }
        if (minimumRarity < MIN_RARITY || minimumRarity > MAX_RARITY) {
            throw new IllegalArgumentError(`Gear rarity must be between ${MIN_RARITY} and ${MAX_RARITY} (provided '${minimumRarity}')`);
        }
        for (ability in gearAbilities) {
            if (GEAR_ABILITIES.indexOf(ability) === -1) {
                throw new IllegalArgumentError(`Gear ability '${ability}' is not recognized.`);
            }
        }

        this.uuid = uuid;
        this.userID = userID;
        this.gearName = gearName;
        this.gearTypes = gearTypes;
        this.gearBrands = gearBrands;
        this.minimumRarity = parseInt(minimumRarity);
        this.gearAbilities = gearAbilities;
        this.expirationTimestamp = expirationTimestamp;
    }
}

/**
 * 
 * @param {Filter} filter 
 */
function tryAddFilter(filter){
    // INSERT INTO [table_name] ([col1], [col2], [col3]) VALUES ([val1], [val2], [val3])

    let columns = [FILTER_UUID, USER_ID, RARITY, EXPIRATION];
    let values = [filter.uuid, filter.userID, filter.minimumRarity, filter.expirationTimestamp];


    if (filter.gearAbilities === []) {
        columns.push(GEAR_ABILITY_WILDCARD);
        values.push(1);
    } else {
        for (ability in GEAR_ABILITIES) {
            columns.push(ability);
            values.push(abilities in filter.gearAbilities ? 1 : 0);
        }
    }

}

/**
 * Adds or updates a filter to the database for matching with gear.
 * @param {Filter} filter
 * @return 
 */
function tryUpdateFilter(filter) {
}

/**
 * Attempts to remove a filter specified by its uuid.
 * @param {uuid} filterUUID 
 * @return {boolean} whether the operation was successfully completed.
 */
function tryRemoveFilter(filterUUID) {

}

/**
 * Gets a list of all filters created by a designated user.
 * @param {*} user 
 */
function getUserFilters(user) {

}

function getFilter(filterUUID) {

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

