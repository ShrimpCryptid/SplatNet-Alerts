import type { NextApiRequest, NextApiResponse } from "next";
import {
	API_USER_CODE,
} from "../../constants";
import {
	getDBClient,
	getUserIDFromCode,
	getUserSubscriptions,
	removeUserPushSubscription,
} from "../../lib/database_utils";

/**
 * Removes all push subscriptions for the given user.
 *
 * @param req http request.
 *  - {@link API_USER_CODE}
 *
 * @return A response with one of the following response codes:
 *  - 200 if the subscriptions were removed successfully.
 *  - 400 if one or more arguments are missing.
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
			typeof req.query[API_USER_CODE] === "string"
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

    // Remove all subscriptions
    let subscriptions = await getUserSubscriptions(client, userID);
    let promises: Promise<any>[] = [];
    for (let subscription of subscriptions) {
      promises.push(removeUserPushSubscription(client, userID, subscription));
    }
    await Promise.all(promises);  // wait for all operations to resolve

    // Verify that the user has no subscriptions left
    subscriptions = await getUserSubscriptions(client, userID);

    if (subscriptions.length === 0) {
      res.status(200);
      return res.end();
    } else {
      res.status(500);
      res.json({err: "Some subscriptions were not deleted."});
      return res.end();
    }
	} catch (err) {
		console.log(err);
		return res.status(500).end(); // internal server error
	}
}
