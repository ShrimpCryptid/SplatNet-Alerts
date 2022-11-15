import type { NextApiRequest, NextApiResponse } from "next";
import { API_USER_CODE } from "../../constants";
import {
	getDBClient,
	getUserIDFromCode,
	getUserFilters,
} from "../../lib/database_utils";
import Filter from "../../lib/filter";
import { IllegalArgumentError } from "../../lib/utils";

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
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Validate input
	if (
		!(req.query[API_USER_CODE] && typeof req.query[API_USER_CODE] === "string")
	) {
		res.status(400).json({ err: "Missing one or more required arguments." });
		return res.end();
	}

	try {
		const client = getDBClient();

		// Validate user
    let userID = await getUserIDFromCode(client, req.query[API_USER_CODE]);
		if (userID == -1) {  // no matching user
			res.status(404).json({
					err: `Could not find user with code '${req.query[API_USER_CODE]}'.`,
				});
      return res.end();
		}

		// Get list of filters owned by user
		let filters = await getUserFilters(client, userID);

		res.status(200).json(filters);
		return res.end();
	} catch (err) {
    if (err instanceof IllegalArgumentError) {
      return res.status(404).end();
    } else {
      console.log(err);
      return res.status(500).end(); // internal server error
    }
	}
}
