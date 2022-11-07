import type { NextApiRequest, NextApiResponse } from "next";
import { API_FILTER_JSON, API_USER_CODE, DB_TABLE_FILTERS } from "../../constants";
import { getDBClient, getUserIDFromCode, tryAddFilter, subscribeUserToFilter, setupDatabaseTables } from '../../lib/database_utils';
import Filter from "../../lib/filter";


/**
 * Saves a new user-created filter.
 * 
 * @param req http request. Requires the following parameters, as defined in
 *  `/constants`:
 *  - `API_USER_CODE` string
 *  - `API_FILTER_JSON` string: serialized JSON data for new filter.
 * 
 * @return A response with one of the following response codes:
 *  - 200 if filter was successfully updated.
 *  - 400 if one or more arguments was missing.
 *  - 404 if no matching user was found.
 *  - 500 if any other errors encountered.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate input

  try {
    const client = getDBClient();

    // Validate user
    // let result = await getUserIDFromCode(client, "potato");
    await subscribeUserToFilter(client, 1, 1);
    let filter = Filter.deserialize((new Filter()).serialize());

    return res.status(200).json({"result": filter});  // ok
  } catch (err) {
    return res.status(500);  // internal server error
  }
}