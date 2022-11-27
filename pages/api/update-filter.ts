import type { NextApiRequest, NextApiResponse } from "next";
import {
	API_FILTER_JSON,
	API_PREVIOUS_FILTER_JSON,
	API_USER_CODE,
} from "../../constants";
import {
	getDBClient,
	getUserIDFromCode,
	tryAddFilter,
	addFilterToUser,
	getMatchingFilterID,
	removeUserFilter,
} from "../../lib/database_utils";
import Filter from "../../lib/filter";

/**
 * Updates a user's previously created filter.
 *
 * @param req http request. Requires the following parameters, as defined in
 *  `/constants`:
 *  - `API_USER_CODE` string
 *  - `API_FILTER_JSON` string: serialized JSON data for new filter.
 *  - `API_PREVIOUS_FILTER_JSON` string: serialized JSON data for old filter.
 *
 * @return A response with one of the following response codes:
 *  - 200 if filter was successfully updated.
 *  - 400 if one or more arguments was missing.
 *  - 404 if no matching user was found.
 *  - 500 if any other errors encountered.
 */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Validate input
	if (
		!(
			req.query[API_USER_CODE] &&
			typeof req.query[API_USER_CODE] === "string" &&
			req.query[API_FILTER_JSON] &&
			typeof req.query[API_FILTER_JSON] === "string" &&
			req.query[API_PREVIOUS_FILTER_JSON] &&
			typeof req.query[API_PREVIOUS_FILTER_JSON] === "string"
		)
	) {
		return res
			.status(400)
			.json({ err: "Missing one or more required arguments." });
	}

	try {
		let client = getDBClient();

		// Validate user
		let userID = await getUserIDFromCode(client, req.query[API_USER_CODE]);
		console.log(`'${req.query[API_USER_CODE]}'`);
		if (userID == -1) {
			// no matching user
			return res.status(404).json({
				err: `Could not find user with code '${req.query[API_USER_CODE]}'.`,
			});
		}

		// Find or create matching filter and subscriber user to it.
		let filter = Filter.deserialize(req.query[API_FILTER_JSON]);
		let prevFilter = Filter.deserialize(req.query[API_PREVIOUS_FILTER_JSON]);

		// Check if filters are different.
		let prevFilterID = await getMatchingFilterID(client, prevFilter);
		let filterID = await tryAddFilter(client, filter);

		if (filterID !== prevFilterID) {
			// Unsubscribe user from previous filter, and subscribe to new one.
			removeUserFilter(client, userID, prevFilterID);
			addFilterToUser(client, userID, filterID);
		} // else, filters are the same and no action is needed

		res.status(200).end(); // ok
	} catch (err) {
		console.log(err);
		return res.status(500).end(); // internal server error
	}
}
