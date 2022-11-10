import { Pool, PoolClient, QueryResult } from "pg";
import { Gear } from "./gear_loader";
import { v4 as uuidv4 , validate } from "uuid";
import {
	GEAR_BRANDS,
	GEAR_TYPES,
	GEAR_ABILITIES,
} from "../constants";
import {
  DB_GEAR_NAME,
  DB_GEAR_RARITY,
  DB_GEAR_TYPE_WILDCARD,
  DB_GEAR_ABILITY_WILDCARD,
  DB_GEAR_BRAND_WILDCARD,
  DB_TABLE_FILTERS,
  DB_FILTER_ID,
  DB_LAST_NOTIFIED_EXPIRATION,
  DB_PAIR_ID,
  DB_TABLE_USERS,
  DB_TABLE_USERS_TO_FILTERS,
  DB_USER_ID,
  DB_USER_CODE,
  DB_LAST_MODIFIED,
  DB_TABLE_SUBSCRIPTIONS,
  DB_ENDPOINT,
  DB_EXPIRATION,
  DB_AUTH_KEY,
  DB_P256DH_KEY,
  DB_SUBSCRIPTION_ID,
  DB_TABLE_GEAR_CACHE
} from "../constants/db";
import Filter from "./filter";
import {
	NotYetImplementedError,
	NoSuchUserError,
	NoSuchFilterError,
	mapGetWithDefault,
  IllegalArgumentError,
} from "./utils";
import Subscription from "./subscription";

// ==============
// HELPER METHODS
// ==============
// #region

/**Removes whitespace and other SQL-sensitive characters from column names.*/
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

async function queryAndLog(
	client: Pool | PoolClient,
	query: string
): Promise<void | QueryResult> {
	try {
		const result = await client.query(query);
		return result;
	} catch (err) {
		console.log("ENCOUNTERED ERROR:");
		console.log(query);
		console.log(err);
	}
	return;
}

/**
 * @returns the given filter represented as a dictionary, where keys are column names for
 * storage in a database table with their corresponding values.
 * Can be iterated over to generate SQL queries.
 */
function filterToTableData(filter: Filter): { [id: string]: any } {
	let data: { [key: string]: any } = {
		[DB_GEAR_NAME]: `'${filter.gearName}'`,
		[DB_GEAR_RARITY]: filter.minimumRarity,
		[DB_GEAR_TYPE_WILDCARD]: arrayEqual(filter.gearTypes, []),
		[DB_GEAR_ABILITY_WILDCARD]: arrayEqual(filter.gearAbilities, []),
		[DB_GEAR_BRAND_WILDCARD]: arrayEqual(filter.gearBrands, []),
	};

	for (var ability of GEAR_ABILITIES) {
		data[formatCol(ability)] = filter.gearAbilities.includes(ability);
	}
	for (var brand of GEAR_BRANDS) {
		data[formatCol(brand)] = filter.gearBrands.includes(brand);
	}
	for (var type of GEAR_TYPES) {
		data[formatCol(type)] = filter.gearTypes.includes(type);
	}
	return data;
}

/**
 * Makes a mapping from the formatted column names to their unformatted counterparts.
 */
function mapFromColumnName(unformattedColumns: string[]): Map<string, string> {
	let map = new Map<string, string>();
	for (var col of unformattedColumns) {
		map.set(formatCol(col), col);
	}
	return map;
}

function rowDataToFilter(rowData: { [key: string]: any }): Filter {
	let types: string[] = [];
	let abilities: string[] = [];
	let brands: string[] = [];
	let rarity = rowData[DB_GEAR_RARITY];
	let name = rowData[DB_GEAR_NAME];

	// The property names of columns have been formatted-- for example, 'Last-Ditch Effort' becomes
	// 'lastditcheffort'. However, they need to be stored in the filter properties as unconverted
	// names, so we make a mapping from their converted to their unconverted names. This also
	// lets us programmatically get all the filter data for gear types, abilities, and brands.
	if (!rowData[DB_GEAR_TYPE_WILDCARD]) {
		let typesMap = mapFromColumnName(GEAR_TYPES);
		for (var type of typesMap.keys()) {
			if (rowData[type]) {
				types.push(mapGetWithDefault(typesMap, type, ""));
			}
		}
	}
	if (!rowData[DB_GEAR_ABILITY_WILDCARD]) {
		let abilitiesMap = mapFromColumnName(GEAR_ABILITIES);
		for (var ability of abilitiesMap.keys()) {
			if (rowData[ability]) {
				abilities.push(mapGetWithDefault(abilitiesMap, ability, ""));
			}
		}
	}
	if (!rowData[DB_GEAR_BRAND_WILDCARD]) {
		let brandsMap = mapFromColumnName(GEAR_BRANDS);
		for (var brand of brandsMap.keys()) {
			if (rowData[brand]) {
				brands.push(mapGetWithDefault(brandsMap, brand, ""));
			}
		}
	}

	return new Filter(name, rarity, types, brands, abilities);
}

/** Returns the current time as a timestamp, wrapped in quotes for inserting
 * into an SQL query.
 */
function getTimestamp(): string {
  return `'${new Date(Date.now()).toISOString()}'`;
}

//#endregion

// ==============
// DATABASE SETUP
// ==============
// #region

/**
 * @effects Initial setup the database and its tables.
 */
export function setupDatabaseTables(client: Pool | PoolClient) {
  // Create data cache table
  client.query(
    `CREATE TABLE IF NOT EXISTS ${DB_TABLE_GEAR_CACHE} (
      
    )`
  )

  // Create users table
	client.query(
		`CREATE TABLE IF NOT EXISTS ${DB_TABLE_USERS} (
            ${DB_USER_ID} SERIAL,
            ${DB_USER_CODE} varchar(255),
            ${DB_LAST_NOTIFIED_EXPIRATION} varchar(30),
            ${DB_LAST_MODIFIED} varchar(30),
            PRIMARY KEY (${DB_USER_ID})
        );`
	);

  // Create user subscriptions table.
  client.query(
    `CREATE TABLE IF NOT EXISTS ${DB_TABLE_SUBSCRIPTIONS} (
          ${DB_SUBSCRIPTION_ID} SERIAL,
          ${DB_USER_ID} int4,
          ${DB_ENDPOINT} varchar(400),
          ${DB_EXPIRATION} varchar(255),
          ${DB_AUTH_KEY} varchar(255),
          ${DB_P256DH_KEY} varchar(255),
          ${DB_LAST_MODIFIED} varchar(30),
          PRIMARY KEY (${DB_SUBSCRIPTION_ID}),
          CONSTRAINT fk_userid
            FOREIGN KEY (${DB_USER_ID})
              REFERENCES ${DB_TABLE_USERS}(${DB_USER_ID})
    );`
  )

  // Create pairing table, which pairs users with their selected filters.
	client.query(`
    CREATE TABLE IF NOT EXISTS ${DB_TABLE_USERS_TO_FILTERS} (
        ${DB_PAIR_ID} SERIAL,
        ${DB_USER_ID} int4,
        ${DB_FILTER_ID} int4,
        ${DB_LAST_MODIFIED} varchar(30),
        PRIMARY KEY (${DB_PAIR_ID}),
        CONSTRAINT fk_userid
          FOREIGN KEY (${DB_USER_ID})
            REFERENCES ${DB_TABLE_USERS}(${DB_USER_ID}),
        CONSTRAINT fk_filterid
          FOREIGN KEY (${DB_FILTER_ID})
            REFERENCES ${DB_TABLE_FILTERS}(${DB_FILTER_ID})
    );`);

	// Auto-generate filter table.
	// Auto-generates boolean columns for gear types, abilities, and brands.
	let joinedFilterColumnNames =
		GEAR_TYPES.concat(GEAR_ABILITIES).concat(GEAR_BRANDS);
	for (let i = 0; i < joinedFilterColumnNames.length; i++) {
		joinedFilterColumnNames[i] = formatCol(joinedFilterColumnNames[i]);
	}
	let filterColumnQuery = joinedFilterColumnNames.join(" BOOL,\n\t") + " BOOL";

	client.query(`CREATE TABLE IF NOT EXISTS ${DB_TABLE_FILTERS} (
        ${DB_FILTER_ID} SERIAL,
        ${DB_GEAR_NAME} varchar(255),
        ${DB_GEAR_RARITY} int2,
        ${DB_GEAR_TYPE_WILDCARD} BOOL,
        ${DB_GEAR_BRAND_WILDCARD} BOOL,
        ${DB_GEAR_ABILITY_WILDCARD} BOOL,
        ${filterColumnQuery}
    );`);
}

// #endregion

// ==============
// DATABASE ACCESS
// ==============
// #region
/**
 * Searches and returns the ID of the first matching filter.
 * @param filter filter to search for
 * @returns The Filter ID of the first matching filter, if one exists. Otherwise, returns -1.
 */
export async function getMatchingFilterID(
	client: PoolClient | Pool,
	filter: Filter
): Promise<number> {
	// format filter parameters
	let filterData = filterToTableData(filter);
	let queryArgs: string[] = [];
	for (var key in filterData) {
		queryArgs.push(`${key} = ${filterData[key]}`); // 'key = value'
	}

	// parse arguments into a SQL query
	// syntax: SELECT * FROM [TableName]
	// WHERE c1=v1 AND c2=v2 AND c3=v3 AND ...;
	let results = await queryAndLog(
		client,
		`SELECT ${DB_FILTER_ID} FROM ${DB_TABLE_FILTERS} 
     WHERE ${queryArgs.join(" AND ")};`
	);

	if (results) {
		if (results.rowCount > 0) {
			return results.rows[0][DB_FILTER_ID]; // get first matching filter ID
		}
	}
	return -1;
}

/** Returns whether this filter ID exists in the database. */
async function hasFilterID(
	client: PoolClient | Pool,
	filterID: number
): Promise<boolean> {
	let result = await queryAndLog(
		client,
		`SELECT FROM ${DB_TABLE_FILTERS} WHERE ${DB_FILTER_ID} = ${filterID}`
	);
	// Check where there are any rows in the results.
	return result ? result.rowCount > 0 : false;
}

/**
 * Attempts to add a given filter to the table, if it does not already exist.
 * @return {number} Returns the ID of newly created filter, or a matching existing filter.
 */
export async function tryAddFilter(
	client: PoolClient | Pool,
	filter: Filter
): Promise<number> {
	let filterID = await getMatchingFilterID(client, filter);

	if (filterID === -1) {
		let filterData = filterToTableData(filter);

		// INSERT INTO [table_name] ([col1], [col2], ...) VALUES ([val1], [val2], ...)
		// RETURNING clause gets the specified columns of any created/modified rows.
		let result = await client.query(`
            INSERT INTO ${DB_TABLE_FILTERS} (${Object.keys(filterData).join(
			", "
		)})
            VALUES (${Object.values(filterData).join(
							", "
						)}) RETURNING ${DB_FILTER_ID};`);
		filterID = result.rows[0][DB_FILTER_ID];
	}
	// Return new filter ID
	return filterID;
}

/**
 * Attempts to remove a filter specified by its id.
 * @param {number} filterID
 * @return {boolean} whether the operation was successfully completed.
 */
async function removeFilter(
	client: PoolClient | Pool,
	filterID: number
): Promise<boolean> {
	// TODO: Only allow deletion if the filter has no paired users?
	// Note: can use returning to get deleted rows
	let result = await client.query(`
        DELETE FROM ${DB_TABLE_FILTERS}
        WHERE ${DB_FILTER_ID}=${filterID} RETURNING *;`);

	// TODO: Change return type based on result?
	return false;
}

export async function makeNewUser(client: PoolClient | Pool): Promise<string> {
	let newUserCode = await generateUserCode(client);
	// TODO: add creation timestamp
	let result = await queryAndLog(
		client,
		`INSERT INTO ${DB_TABLE_USERS}
      (${DB_USER_CODE}, ${DB_LAST_MODIFIED})
      VALUES ('${newUserCode}', ${getTimestamp()});`
	);
	return newUserCode;
}

async function generateUserCode(client: PoolClient | Pool): Promise<string> {
	// generate number
	let userCode = "";
	// repeat until there is no user with this existing user code.
	do {
		userCode = uuidv4();
	} while ((await getUserIDFromCode(client, userCode)) !== -1);
	return userCode;
}

/** Stores a new PushSubscription associated with a user. */
export async function addUserPushSubscription(
	client: PoolClient | Pool,
	userID: number,
  subscription: Subscription
) {
  if (!(await hasUser(client, userID))) {
    throw new NoSuchUserError(userID);
  }
  // Check if user has already subscribed this device
  let result = await queryAndLog(client,
    `SELECT ${DB_SUBSCRIPTION_ID} FROM ${DB_TABLE_SUBSCRIPTIONS}
      WHERE ${DB_USER_ID} = ${userID}
        AND ${DB_ENDPOINT} = '${subscription.endpoint}';`);
  
  // Check whether we need to update the entry or make a new one.
  if (result && result.rowCount > 0) {
    // Already has this entry, so we update it
    let subscriptionID = result.rows[0][DB_SUBSCRIPTION_ID];
    queryAndLog(client,
      `UPDATE ${DB_TABLE_SUBSCRIPTIONS}
        SET ${DB_ENDPOINT} = '${subscription.endpoint}',
            ${DB_EXPIRATION} = ${subscription.expirationTime},
            ${DB_AUTH_KEY} = '${subscription.keys.auth}',
            ${DB_P256DH_KEY} = '${subscription.keys.p256dh}',
            ${DB_LAST_MODIFIED} = ${getTimestamp()}
        WHERE ${DB_SUBSCRIPTION_ID} = ${subscriptionID};`);
  } else if (result) {
    // Create a new entry for new subscription
    queryAndLog(client,
      `INSERT INTO ${DB_TABLE_SUBSCRIPTIONS}
        ( ${DB_USER_ID},
          ${DB_ENDPOINT},
          ${DB_EXPIRATION},
          ${DB_AUTH_KEY},
          ${DB_P256DH_KEY},
          ${DB_LAST_MODIFIED}
        )
        VALUES (
          ${userID},
          '${subscription.endpoint}',
          ${subscription.expirationTime},
          '${subscription.keys.auth}',
          '${subscription.keys.p256dh}',
          ${getTimestamp()}
        );`);
  }
}

/** Removes the given push subscription for a user, if it exists. Ignores
 *  repeat subscriptions for the device associated with other users.
 */
export async function removeUserPushSubscription(
  client: PoolClient | Pool,
	userID: number,
  subscription: Subscription
) {
  throw new NotYetImplementedError("");
}

/** Deletes all subscriptions for the given device across all users. */
export async function deletePushSubscription(
  client: PoolClient | Pool,
  subscription: Subscription
) {
  throw new NotYetImplementedError("");
}

/**
 * Returns an array of subscription data for the given user. Returns an empty
 * array if no subscription could be found.
 */
export async function getUserSubscriptions(client: PoolClient | Pool,
	  userID: number): Promise<Subscription[]> {
  // Get all subscriptions that match this user
  let result = await queryAndLog(client,
    `SELECT * FROM ${DB_TABLE_SUBSCRIPTIONS}
      WHERE ${DB_USER_ID} = ${userID}`);

  if (result && result.rowCount > 0) {
    // Parse each row into its own subscription object.
    let subscriptions = [];
    for (let row of result.rows) {
      subscriptions.push(new Subscription(
        row[DB_ENDPOINT],
        row[DB_EXPIRATION],
        {
          "auth": row[DB_AUTH_KEY],
          "p256dh": row[DB_P256DH_KEY]
        }
      ));
    }
    return subscriptions;
  }
  return [];
}

/**
 *
 */
async function removeUser(client: PoolClient | Pool, userID: number) {
	// Check if user exists
	// Remove all filters user is subscribed to
  // Remove all subscriptions the user has
	// Finally remove user
	if (!(await hasUser(client, userID))) {
		throw new NoSuchUserError(userID);
	}

	throw new NotYetImplementedError("");
}

async function hasUser(
	client: PoolClient | Pool,
	userID: number
): Promise<boolean> {
	let result = await queryAndLog(
		client,
		`SELECT FROM ${DB_TABLE_USERS} WHERE ${DB_USER_ID} = ${userID}`
	);
	return result ? result.rowCount > 0 : false;
}

/**
 * Returns the user's internal ID from their public-facing, string user ID code.
 * @param userCode
 * @return the user's internal ID (as an int) if found. Otherwise, returns -1.
 */
export async function getUserIDFromCode(
	client: PoolClient | Pool,
	userCode: string
): Promise<number> {
  // TODO: Add extra manual regex check here for other illegal characters
  if (!validate(userCode)) {
    throw new IllegalArgumentError(userCode + " is not a valid uuid.");
  }
	let result = await client.query(
		`SELECT ${DB_USER_ID} FROM ${DB_TABLE_USERS}
      WHERE ${DB_USER_CODE} = '${userCode}'`
	);
	if (result.rowCount == 0) {
		return -1;
	} else {
		return result.rows[0][DB_USER_ID];
	}
}

async function doesUserHaveFilter(
	client: PoolClient | Pool,
	userID: number,
	filterID: number
): Promise<boolean> {
	let result = await queryAndLog(
		client,
		`SELECT FROM ${DB_TABLE_USERS_TO_FILTERS}
      WHERE ${DB_FILTER_ID} = ${filterID} AND ${DB_USER_ID} = ${userID};`
	);
	if (result) {
		return result.rowCount > 0;
	} else {
		return false;
	}
}

/**
 * Subscribes the user to the given filter, if they are not already subscribed.
 * @throws {NoSuchFilterError} if the filter does not exist.
 * @throws {NoSuchUserError} if the user does not exist.
 */
export async function addFilterToUser(
	client: PoolClient | Pool,
	userID: number,
	filterID: number
) {
	if (!(await hasUser(client, userID))) {
		throw new NoSuchUserError(userID);
	}
	if (!(await hasFilterID(client, filterID))) {
		throw new NoSuchFilterError(filterID);
	}

	if (!(await doesUserHaveFilter(client, userID, filterID))) {
    // Make the new filter
		await queryAndLog(
			client,
			`INSERT INTO ${DB_TABLE_USERS_TO_FILTERS}
        (${DB_USER_ID}, ${DB_FILTER_ID}, ${DB_LAST_MODIFIED})
        VALUES (${userID}, ${filterID}, ${getTimestamp()});`
		);
	}
}

/**
 * Unsubscribe user from a filter, if they are currently subscribed to it.
 */
export async function removeUserFilter(
	client: PoolClient | Pool,
	userID: number,
	filterID: number
) {
	if (await doesUserHaveFilter(client, userID, filterID)) {
		await queryAndLog(
			client,
			`DELETE FROM ${DB_TABLE_USERS_TO_FILTERS}
            WHERE ${DB_USER_ID} = ${userID} AND ${DB_FILTER_ID} = ${filterID};`
		);
	}
	// TODO: Check if filter should be deleted if no other users reference it?
}

/**
 * Gets a list of all filters the user is subscribed to.
 * @throws {NoSuchUserError} is the user does not exist.
 */
export async function getUserFilters(
	client: PoolClient | Pool,
	userID: number
): Promise<Filter[]> {
	// TODO: Sort list by edited timestamp
	if (!(await hasUser(client, userID))) {
		throw new NoSuchUserError(userID);
	}
	// Get all filter IDs the user is subscribed to
	let results = await queryAndLog(
		client,
		// userFilters is a temporary table used to index into the Filters table
		`WITH userFilters(${DB_FILTER_ID}) AS 
        (SELECT ${DB_FILTER_ID} FROM ${DB_TABLE_USERS_TO_FILTERS}
        WHERE ${DB_USER_ID} = ${userID})
      SELECT * FROM ${DB_TABLE_FILTERS}, userFilters
      WHERE ${DB_TABLE_FILTERS}.${DB_FILTER_ID} = userFilters.${DB_FILTER_ID}`
	);
	// Go through each filterID and retrieve it as a Filter object.
	if (results) {
		let filters: Filter[] = [];
		for (let rowData of results.rows) {
			filters.push(rowDataToFilter(rowData));
		}
		return filters;
	}
	return [];
}

/**
 * Returns a set of all the user IDs with filters that match the gear item.
 * @param {*} gearData
 */
export async function getUserIDsToBeNotified(
	client: PoolClient | Pool,
	gear: Gear
): Promise<Set<number>> {
  // Prevent SQL injection attacks.
  // Allow only alphanumeric characters, spaces, and -, +, (, and ) chars. 
  const allowedCharsPattern = new RegExp(/^[A-Za-z0-9-+()& ]*$/);
  if (!allowedCharsPattern.test(gear.name)) {
    throw new IllegalArgumentError("Gear name '" + gear.name + "' contains special characters.");
  }
  // Match filters by properties, either by specific brand/ability/type or by
  // wildcard selectors. Then, select all users that match any of those filters.
	let result = await client.query(
		`WITH matchingFilters(${DB_FILTER_ID}) AS 
        (SELECT ${DB_FILTER_ID} FROM ${DB_TABLE_FILTERS}
          WHERE ${DB_GEAR_RARITY} <= ${gear.rarity}
          AND (${DB_GEAR_NAME} = '' OR ${DB_GEAR_NAME} = '${gear.name}')
          AND (${DB_GEAR_ABILITY_WILDCARD} OR ${formatCol(gear.ability)})
          AND (${DB_GEAR_TYPE_WILDCARD} OR ${formatCol(gear.type)})
          AND (${DB_GEAR_BRAND_WILDCARD} OR ${formatCol(gear.brand)}))
    SELECT ${DB_USER_ID} FROM ${DB_TABLE_USERS_TO_FILTERS}, matchingFilters
      WHERE ${DB_TABLE_USERS_TO_FILTERS}.${DB_FILTER_ID} = matchingFilters.${DB_FILTER_ID};`
	);

  // Get all users, adding them to a set because there may be duplicates.
	let userSet = new Set<number>();
  if (result && result.rowCount > 0) {
    for (let row of result.rows) {
      userSet.add(row[DB_USER_ID]);
    }
  }

	return userSet;
}

// #endregion

export function getDBClient(): Pool {
	// TODO: Retrieve values from an environment variable
	// I love storing passwords in plaintext in my public github repo :]
	return new Pool({
		host: "localhost",
		user: "postgres",
		password: "2Nu^4nRW7H7$",
		port: 5433,
	});
}

const pool = getDBClient();

setupDatabaseTables(pool);

let testAnyFilter = new Filter("", 2, [], ["Rockenberg"], ["Run Speed Up"]);
//let testFindGear = new Filter("Fresh Fish Head", 0, [], [], []);
