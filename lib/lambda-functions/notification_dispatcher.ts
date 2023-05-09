import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {
	getDBClient,
	getLastNotifiedExpiration,
	getUsersToBeNotified,
	getUserSubscriptions,
	trySendNotification,
	updateLastNotifiedExpiration,
} from "../database_utils";
import {
	fetchAPIRawGearData,
	fetchCachedRawGearData,
	getNewGearItems,
	rawGearDataToGearList,
	updateCachedRawGearData,
} from "../gear_loader";
import { Gear } from "../gear";
import { BASE_SPLATNET_URL, BASE_WEBSITE_URL, configureWebPush } from "../backend_utils";
import { mapGetWithDefault } from "../shared_utils";
import { FE_USER_CODE_URL, GEAR_ABILITIES } from "../../constants";
import { Pool } from "pg";
import { GEAR_NAMES, GEAR_NAME_TO_DATA, GEAR_NAME_TO_IMAGE } from "../geardata";

const MILLISECONDS_PER_SECOND = 1000.0;

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

function isValidGear(gear: Gear) {
  // Check that gear name is included in scraped wiki data.
  if (GEAR_NAMES.includes(gear.name)) {
    let gearData = mapGetWithDefault(GEAR_NAME_TO_DATA, gear.name, new Gear());
    // Check that the brand and gear type match the expected values for the item
    return gearData.brand === gear.brand && gear.type === gear.type && GEAR_ABILITIES.includes(gear.ability);
  }
  return false;
}

/**
 * Returns a list of gear items where invalid gear is removed, and image URLs
 * are replaced with links to scraped wiki images. Also trims whitespace on gear
 * names.
 */
function sanitizeGearInput(gearItems: Gear[]): Gear[] {
  let retGear: Gear[] = [];

  for (let gear of gearItems) {  // Check that this is valid
    gear.name = gear.name.trim();
    if (isValidGear(gear)) {
      // Replace URL from Splatoon3.ink with internal URL scraped from the wiki
      // for data safety/sanitization reasons!
      gear.image = mapGetWithDefault(GEAR_NAME_TO_IMAGE, gear.name, null);
      if (!gear.image) {
        console.warn(`Could not find internal image URL for '${gear.name}'. No image will be shown.`);
      }
      retGear.push(gear);
    } else {  // Gear is unrecognized.
      console.error(`Gear item '${gear.name}' is not recognized. `
      + `Notifications for it will be skipped. `
      + `(Ability: ${gear.ability}, Brand: ${gear.brand}, Type: ${gear.type}, Image: ${gear.image})`);
      // TODO: Send a notification about the error to developer email?
    }
  }
  return retGear;
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
    promises.push(new Promise<void>((resolve, reject) => {
      try {
        return getUsersToBeNotified(client, gear).then((value: Map<number, string>) => {
          gearToUserMap.set(gear, value);
          resolve();
        });
        
      } catch (e) {
        console.error("The following error occurred while trying to get users for gear '" + gear.name + "'. Skipping...")
        console.error(e);
        reject();
      }
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
function generateNotificationOptions(gear: Gear): any {
  // Calculate timeout-- should be from now until gear's expiration date.
  let timeDiffMilliseconds = gear.expiration - Date.now();
  let timeDiffSeconds = Math.floor(timeDiffMilliseconds / MILLISECONDS_PER_SECOND);

  return {
    TTL: timeDiffSeconds  // Time (in seconds) that notification is retained
  }
}

function generateNotificationPayload(userCode: string, gear: Gear): any {
	let title,
		body = "",
		image = "";
  
  let loginURL = `${BASE_WEBSITE_URL}/login?${FE_USER_CODE_URL}=${userCode}`;
  let gearID = gear.id;
  title = "Now on SplatNet!";
  body = gear.name + ": " + gear.ability;
  // image = gear.image;

  // When updating this, remember to make changes in serviceworker.js!
	return {
		title: title,
		body: body,
		image: image,
    // Use gear image as the icon.
    iconURL: gear.image,  // TODO: Generate icon for notifications
    loginURL: loginURL,  // used to log in to the website
    siteURL: BASE_WEBSITE_URL,
    shopURL: BASE_SPLATNET_URL,
    gearID: gearID,
    userCode: userCode,
    tag: gear.id,  // tag for this notification, to prevent duplicates
    expiration: gear.expiration
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
export const lambdaHandler = async (
	event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
	// Validate input

	try {
		let client = getDBClient();

		// 1. Check for new/expired gear items.
		let cachedRawGearData = await fetchCachedRawGearData(client);
		let cachedGear: Gear[];
		if (cachedRawGearData == null) {
			// store a default value in case no cache
			cachedGear = [];
		} else {
			cachedGear = sanitizeGearInput(rawGearDataToGearList(cachedRawGearData));
		}

		// Check if gear has expired (or if we have no stored gear data)
		// Note that gear is sorted in order of expiration, ascending
		if (cachedGear.length > 0 && Date.now() < cachedGear[0].expiration) {
			// Cache has not expired, so do not notify users.
      return {
        statusCode: 200,
        body: "Too early"
      };
		}

		// Retrieve the new gear data from the API.
		let fetchedRawGearData = await fetchAPIRawGearData();
		let fetchedGear = sanitizeGearInput(rawGearDataToGearList(fetchedRawGearData));

		// 2. Get list of new gear items.
		let newGear = getNewGearItems(cachedGear, fetchedGear);
    // Log new gear items to console
    let newGearNames = [];
    for (let gear of newGear) {
      newGearNames.push(gear.name);
    }
    console.log(`Found ${newGear.length} new items: '${newGearNames.join("', '")}'`);

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
    let notificationsSucceeded = 0;
    let notificationsFailed = 0;

		let promises = [];
		for (let [userID, userCode] of allUserMap) {
			// Set up the notification *this* user should receive.
      let notifications: [notification: string, options: any][] = [];
      let userGear = getUserGear(gearToUserMap, userID);

      for (let gear of userGear) {  // generate a unique notification per item
        let notification = JSON.stringify(generateNotificationPayload(userCode, gear));
        let options = generateNotificationOptions(gear);
        notifications.push([notification, options]);
      }
      // Assumption: usually all items have the same expiration because they are
      // uploaded to the shop at the same time.
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
        // Send one notification for every item to this subscription endpoint
        for (let [notification, options] of notifications) {
          notificationPromises.push(
            trySendNotification(client, subscription, notification, options).then(
              (result) => {
                if (!result) {
                  notificationsFailed++;
                  console.log("Failed to send a notification to " + subscription.keys.auth.substring(0, 4) + " (" + notificationsFailed + " failures): " + notification);
                } else {
                  notificationsSucceeded++;
                }
              }
            )
          );
        }
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
		console.log(`Notifications attempted: ${devicesNotified} devices (${notificationsSucceeded} successful notifications, ${notificationsFailed} failures)`);

		return {
      statusCode: 200,
      body: "ok"
    }
	} catch (err) {
		console.log(err);
    return {
      statusCode: 500,
      body: "Error"
    }
	}
}
