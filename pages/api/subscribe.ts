import type { NextApiRequest, NextApiResponse } from "next";
import {
	API_SUBSCRIPTION,
	API_USER_CODE,
	API_SEND_TEST_NOTIFICATION,
} from "../../constants";
import {
	getDBClient,
	getUserIDFromCode,
	makeNewUser,
	addUserPushSubscription,
	trySendNotification,
} from "../../lib/database_utils";
import { Subscription } from "../../lib/notifications";
import { configureWebPush } from "../../lib/backend_utils";

/**
 * Updates the user's notification subscription.
 *
 * @param req http request.
 *  - {@link API_USER_CODE}
 *  - {@link API_SUBSCRIPTION} A PushSubscription object.
 *  - {@link API_SEND_TEST_NOTIFICATION} Flag, indicates whether the server
 *    should send a test notification to the given device on subscribe.
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
		let subscriptionJSON = JSON.parse(req.query[API_SUBSCRIPTION]);
		let subscription = Subscription.deserialize(subscriptionJSON);

		// Update user subscriptions
		addUserPushSubscription(client, userID, subscription);

		// Send user a notification.
		if (req.query[API_SEND_TEST_NOTIFICATION] !== undefined) {
			let notification = {
				title: "Hello!",
				body: "Welcome to the Splatnet Shop Alerts service!",
			};
			configureWebPush();
			await trySendNotification(client, subscription, JSON.stringify(notification));
		}

		res.status(200);
		return res.end();
	} catch (err) {
		console.log(err);
		return res.status(500).end(); // internal server error
	}
}
