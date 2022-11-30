import type { NextApiRequest, NextApiResponse } from "next";
import {
	API_USER_CODE,
  API_NICKNAME,
} from "../../constants";
import {
	getDBClient,
	getUserIDFromCode,
  updateUserNickname,
} from "../../lib/database_utils";
import { sanitizeNickname } from "../../lib/shared_utils";

/**
 * Updates the user's nickname. Sanitizes all incoming nicknames
 *
 * @param req http request.
 *  - {@link API_USER_CODE}
 *  - {@link API_NICKNAME} A PushSubscription object.
 * 
 * @return A response with one of the following response codes:
 *  - 200 if the nickname was updated successfully.
 *  - 400 if the arguments are missing or malformed.
 *  - 404 if the user was not found.
 *  - 500 if any other errors encountered.
 *  
 * Additionally, returns the nickname sanitizes and as stored in the
 *    database via JSON.
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
			req.query[API_NICKNAME] &&
			typeof req.query[API_NICKNAME] === "string"
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

		// Parse subscription parameter
		let nickname = decodeURI(req.query[API_NICKNAME]);
    let sanitizedNickname = sanitizeNickname(nickname);

		// Update user subscriptions
    updateUserNickname(client, userID, sanitizedNickname);

    // Send sanitized nickname back to user.
    res.json(sanitizedNickname);
		return res.status(200).end();
	} catch (err) {
		console.log(err);
		return res.status(500).end(); // internal server error
	}
}
