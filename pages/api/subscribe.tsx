import type { NextApiRequest, NextApiResponse } from "next";
import { API_SUBSCRIPTION, API_USER_CODE } from "../../constants";
import { getDBClient, getUserIDFromCode, makeNewUser, updateUserSubscription } from "../../lib/database_utils";

/**
 * Updates the user's notification subscription.
 *
 * @param req http request.
 *  - `API_USER_CODE`
 *  - `API_SUBSCRIPTION ` A PushSubscription object.
 *
 * @return A response with one of the following response codes:
 *  - 200 if the subscription was updated successfully.
 *  - 404 if the user was not found.
 *  - 500 if any other errors encountered.
 */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
  // Input Validation
	if (
		!(
			req.query[API_USER_CODE] &&
			typeof req.query[API_USER_CODE] === "string" &&
			req.query[API_SUBSCRIPTION] &&
			typeof req.query[API_SUBSCRIPTION] === "string"
		)
	) {
		res.status(400).json({ err: "Missing one or more required arguments." });
		return res.end();
	}

	try {
		const client = getDBClient();
    
		// Validate user
		let userID = await getUserIDFromCode(client, req.query[API_USER_CODE]);
		if (userID == -1) {
			// no matching user
			res.status(404)
				.json({
					err: `Could not find user with code '${req.query[API_USER_CODE]}'.`,
				});
      return res.end();
		}

    // Validate API subscription data

    // Update user subscription
    let result = updateUserSubscription(client, userID, req.query[API_SUBSCRIPTION]);
    console.log(req.query[API_SUBSCRIPTION]);
		res.status(200);
		return res.end();
	} catch (err) {
		console.log(err);
		return res.status(500).end(); // internal server error
	}
}
