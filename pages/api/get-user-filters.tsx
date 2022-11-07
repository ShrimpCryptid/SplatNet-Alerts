import type { NextApiRequest, NextApiResponse } from "next";
import { API_FILTER_JSON, API_USER_CODE } from "../../constants";
import {
	getDBClient,
	getUserIDFromCode,
	tryAddFilter,
	subscribeUserToFilter,
	getUserSubscriptions,
} from "../../lib/database_utils";
import Filter from "../../lib/filter";

/**
 * Retrieves the list of filters that the user is subscribed to.
 *
 * @param req http request. Requires the following parameters, as defined in
 *  `/constants`:
 *  - `API_USER_CODE` string
 *
 * @return A response with one of the following response codes:
 *  - 200 if filter was successfully updated.
 *  - 400 if one or more arguments was missing.
 *  - 404 if no matching user was found.
 *  - 500 if any other errors encountered.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	// Validate input
	if (!(req.query[API_USER_CODE] && typeof req.query[API_USER_CODE] === "string")) {
		return res.status(400).json({ err: "Missing one or more required arguments." });
	}

	try {
		const client = getDBClient();

		// Validate user
		let userID = await getUserIDFromCode(client, req.query[API_USER_CODE]);
		if (userID == -1) {
			// no matching user
			return res
				.status(404)
				.json({ err: `Could not find user with code '${req.query[API_USER_CODE]}'.` });
		}

		// Get list of filters owned by user
		let filters = await getUserSubscriptions(client, userID);

		res.status(200);
		res.json(filters);
		res.end();
	} catch (err) {
    console.log(err);
		res.status(500);
		res.end(); // internal server error
	}
}
