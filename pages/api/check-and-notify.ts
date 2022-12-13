import type { NextApiRequest, NextApiResponse } from "next";
import {
	getDBClient,
	getLastNotifiedExpiration,
	getUsersToBeNotified,
	getUserSubscriptions,
	trySendNotification,
	updateLastNotifiedExpiration,
} from "../../lib/database_utils";
import {
	fetchAPIRawGearData,
	fetchCachedRawGearData,
	getNewGearItems,
	rawGearDataToGearList,
	updateCachedRawGearData,
} from "../../lib/gear_loader";
import { Gear } from "../../lib/gear";
import { configureWebPush } from "../../lib/backend_utils";
import { getEnvWithDefault, mapGetWithDefault } from "../../lib/shared_utils";
import { ENV_KEY_ACTION_SECRET } from "../../constants/env";
import { FE_USER_CODE_URL } from "../../constants";
import { Pool } from "pg";

const MILLISECONDS_PER_SECOND = 1000.0;
const BASE_SPLATNET_URL = "https://s.nintendo.com/av5ja-lp1/znca/game/4834290508791808?p=gesotown/";
const BASE_LOGIN_URL = "https://splatnet-alerts.netlify.com/login?";

function getUserGear(
	gearToUsers: Map<Gear, Map<number, string>>,
	userID: number
): Gear[] {
	let gearList = [];
	for (let [gear, userMap] of gearToUsers.entries()) {
		if (userMap.has(userID)) {
			gearList.push(gear);
		}
	}
	return gearList;
}

function aggregateUsers(gearToUserMap: Map<Gear, Map<number, string>>) {
  let allUserMap = new Map<number, string>();
  for (let userMap of gearToUserMap.values()) {
    allUserMap = new Map([...allUserMap, ...userMap]);
  }
  return allUserMap;
}

async function getUsersToNotify(client: Pool, newGear: Gear[]) {
  let promises: Promise<any>[] = [];
  let gearToUserMap = new Map<Gear, Map<number, string>>();
  // Parallelize requests for user data due to network
  for (let gear of newGear) {
    promises.push(getUsersToBeNotified(client, gear).then((value: Map<number, string>) => {
      gearToUserMap.set(gear, value);
    }));
  }
  await Promise.all(promises);
  return gearToUserMap;
}

/**
 * Generates an options object for the web push notifications. Currently just
 * generates the TTL (time to life) parameter so that the notification expires
 * if any gear items also expire.
 */
function generateNotificationOptions(gearList: Gear[]): any {
  // Calculate timeout-- should be from now until gear's expiration date.
  let lastGear = gearList.sort(Gear.expirationComparator)[gearList.length - 1];
  let timeDiffMilliseconds = lastGear.expiration - Date.now();
  let timeDiffSeconds = Math.floor(timeDiffMilliseconds / MILLISECONDS_PER_SECOND);

  return {
    TTL: timeDiffSeconds  // Time (in seconds) that notification is retained
  }
}

function generateNotificationPayload(userCode: string, gearList: Gear[]): any {
	let title,
		body = "",
		image = "";
  
	if (gearList.length == 1) {
		title = "A new item you were looking for is available on SplatNet.";
		body = gearList[0].name + "(" + gearList[0].ability + ")";
		image = gearList[0].image;
	} else if (gearList.length > 1) {
		title = "One or more items you're interested in are available on SplatNet!";
		for (let gear of gearList) {
			body += gear.name + " (" + gear.ability + ") / ";
		}
	}

	return {
		title: title,
		body: body,
		image: image,
	};
}

/**
 * Checks for new changes to the Splatnet shop, via the Splatoon3.ink API and a
 * local cache. If changes are found, notifies all users that have filters for
 * those new items.
 *
 * @return A response with one of the following response codes:
 *  - 200 once all operations have completed.
 *  - 500 if any other errors encountered.
 */
export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// Validate input

	try {
		let client = getDBClient();

		// 0. Check authentication on the request-- must match stored API key.
		// Note: providing an empty string for the secret key will skip checks.
		let secretKey = getEnvWithDefault(ENV_KEY_ACTION_SECRET, null);
		let providedKey = req.headers.authorization;
		if (!secretKey) {
			// Secret key is undefined-- assume that this is an error.
			console.warn("Secret key 'ACTION_SECRET' is not defined. This is okay ONLY in testing environments.");
		} else if (secretKey === providedKey) {
			console.log("Secret key matches. Request authenticated.");
		} else {
			console.error("Unauthorized request: keys do not match.");
			return res.status(401).end();
		}

		// 1. Check for new/expired gear items.
		let cachedRawGearData = await fetchCachedRawGearData(client);
		let cachedGear: Gear[];
		if (cachedRawGearData == null) {
			// store a default value in case no cache
			cachedGear = [];
		} else {
			cachedGear = rawGearDataToGearList(cachedRawGearData);
		}

		// Check if gear has expired (or if we have no stored gear data)
		// Note that gear is sorted in order of expiration, ascending
		if (cachedGear.length > 0 && Date.now() < cachedGear[0].expiration) {
			// Cache has not expired, so do not notify users.
			return res.status(425).end(); // 425 means 'Too Early'
		}

		// Retrieve the new gear data from the API.
		let fetchedRawGearData = await fetchAPIRawGearData();
		let fetchedGear = rawGearDataToGearList(fetchedRawGearData);

		// 2. Get list of new gear items.
		let newGear = getNewGearItems(cachedGear, fetchedGear);

		// 3. Get lists of users to notify.
		let gearToUserMap = await getUsersToNotify(client, newGear);
    let allUserMap = aggregateUsers(gearToUserMap);

		console.log("Notifying " + allUserMap.size + " users.");

		// 4. Configure webpush
		configureWebPush();

		// 5. Send each user notifications to their subscribed devices.
		// TODO: Refactor into a separate method.
    let startTime = Date.now();
		let numAlreadyNotified = 0;
		let numNoSubscriber = 0;
		let devicesNotified = 0;
		let devicesFailed = 0;

		let promises = [];
		for (let [userID, userCode] of allUserMap) {
			// Set up the notification *this* user should receive.
			let userGear = getUserGear(gearToUserMap, userID);
			let notification = JSON.stringify(generateNotificationPayload(userCode, userGear));
      let options = generateNotificationOptions(userGear);
			let latestExpiration = userGear[userGear.length - 1].expiration;

			// Check that we haven't already notified this user
			if (
				latestExpiration <= (await getLastNotifiedExpiration(client, userID))
			) {
				// We've already notified this user about these items, so we skip them.
				numAlreadyNotified++;
				continue;
			}

			// Send notification to all of the user's subscribed devices
			let notificationPromises = [];
			let userSubscriptions = await getUserSubscriptions(client, userID);
			if (userSubscriptions.length == 0) {
				// user has no subscribed devices
				numNoSubscriber++;
				continue;
			}

			for (let subscription of userSubscriptions) {
				devicesNotified++;
				notificationPromises.push(
					trySendNotification(client, subscription, notification, options).then(
						(result) => {
							if (!result) {
								devicesFailed++;
							}
						}
					)
				);
			}
			// TODO: Skip if user was not actually notified?
			promises.push(
				Promise.all(notificationPromises).then(() => {
					// Update user entry once all devices have been notified.
					updateLastNotifiedExpiration(client, userID, latestExpiration);
				})
			);
		}

		// 6. Wait for all notifications to finish.
		await Promise.all(promises);

		// 7. Store the new cached gear data for the future.
		// We only do this AFTER all users have been notified in case of server
		// crashes-- if this happens, the server will pick up where it left off.
		await updateCachedRawGearData(client, fetchedRawGearData);

		// 8. Logging
		let timeElapsedSeconds = (Date.now() - startTime) / 1000.0;
		console.log(`Notifications done. (Finished in ${timeElapsedSeconds.toFixed(2)} seconds)`);
		let usersNotified = allUserMap.size - numAlreadyNotified - numNoSubscriber;
		console.log(`Users notified: ${usersNotified} users (${numAlreadyNotified} already notified, ${numNoSubscriber} with no devices)`);
		console.log(`Devices notified: ${devicesNotified - devicesFailed} devices (${devicesFailed} failures)`);

		return res.status(200).end(); // ok
	} catch (err) {
		console.log(err);
		return res.status(500).end(); // internal server error
	}
}
