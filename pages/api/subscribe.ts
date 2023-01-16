import type { NextApiRequest, NextApiResponse } from "next";
import {
	API_SUBSCRIPTION,
	API_USER_CODE,
	API_SEND_TEST_NOTIFICATION,
  FE_USER_CODE_URL,
} from "../../constants";
import {
	getDBClient,
	getUserIDFromCode,
	addUserPushSubscription,
	trySendNotification,
  updateLastNotifiedExpiration,
} from "../../lib/database_utils";
import { Subscription } from "../../lib/notifications";
import { BASE_WEBSITE_URL, configureWebPush } from "../../lib/backend_utils";

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

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
    let userCode = req.query[API_USER_CODE];
		let userID = await getUserIDFromCode(client, userCode);
		if (userID == -1) {
			// no matching user
			res.status(404).json({
				err: `Could not find user with code '${userCode}'.`,
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
        siteURL: BASE_WEBSITE_URL,
        loginURL: `${BASE_WEBSITE_URL}/login?${FE_USER_CODE_URL}=${userCode}`,
			};
			configureWebPush();
			await trySendNotification(client, subscription, JSON.stringify(notification));
		}

    // Update the next expiration time to be 24 hours from now. This is because
    // gear items last for 24 hours, and only items that are introduced AFTER
    // the user subscribes should be valid for sending messages.
    await updateLastNotifiedExpiration(client, userID, Date.now() + MILLISECONDS_PER_DAY);

		res.status(200);
		return res.end();
	} catch (err) {
		console.log(err);
		return res.status(500).end(); // internal server error
	}
}
