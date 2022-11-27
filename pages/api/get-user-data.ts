import type { NextApiRequest, NextApiResponse } from "next";
import {
	API_NICKNAME,
	API_RESPONSE_FILTER_LIST,
	API_USER_CODE,
} from "../../constants";
import {
	getDBClient,
	getUserIDFromCode,
	getUserFilters,
	getUserData,
} from "../../lib/database_utils";
import { IllegalArgumentError } from "../../lib/shared_utils";

/**
 * Retrieves the data for the given users, including the list of filters and
 * nickname data.
 *
 * @param req http request. Requires the following parameters, as defined in
 *  `/constants`.
 *  - {@link API_USER_CODE} string
 *
 * @return A response with one of the following response codes:
 *  - 200 if data was successfully retrieved.
 *  - 400 if one or more arguments was missing.
 *  - 404 if no matching user was found.
 *  - 500 if any other errors encountered.
 *
 */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Set up cache
	res.setHeader("Cache-Control", "max-age=10");

	// Validate input
	if (
		!(req.query[API_USER_CODE] && typeof req.query[API_USER_CODE] === "string")
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

		// Get list of filters owned by user, reverse so most recent is first
		let filters = await (await getUserFilters(client, userID)).reverse();
		let userData = await getUserData(client, userID);

		// Extract properties and save them to a return object with defined keys.
		// TODO: Also pass the last modified and last notified items?
		let returnedData: { [key: string]: any } = {};
		returnedData[API_NICKNAME] = userData?.nickname;
		returnedData[API_RESPONSE_FILTER_LIST] = filters;

		res.status(200).json(returnedData);
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
