import type { NextApiRequest, NextApiResponse } from "next";
import { API_FILTER_JSON, API_USER_CODE } from "../../constants";
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
 * Removes a filter from the user's list.
 *
 * @param req http request. Requires the following parameters, as defined in
 *  `/constants`:
 *  - `API_USER_CODE` string
 *  - `API_FILTER_JSON` string: serialized JSON data for the filter to be removed.
 *
 * @return A response with one of the following response codes:
 *  - 200 if filter was successfully removed.
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
			typeof req.query[API_FILTER_JSON] === "string"
		)
	) {
		res.status(400).json({ err: "Missing one or more required arguments." });
		return res.end();
	}

	try {
		let client = getDBClient();

		// Validate user
		let userID = await getUserIDFromCode(client, req.query[API_USER_CODE]);
		if (userID == -1) {
			// no matching user
			res.status(404).json({
				err: `Could not find user with code '${req.query[API_USER_CODE]}'.`,
			});
			return res.end();
		}

		// Find the matching filter and unsubscribe the user from it.
		let filter = Filter.deserialize(req.query[API_FILTER_JSON]);
		let filterID = await getMatchingFilterID(client, filter);
		await removeUserFilter(client, userID, filterID);

		return res.status(200).end(); // ok
	} catch (err) {
		return res.status(500).end(); // internal server error
	}
}
