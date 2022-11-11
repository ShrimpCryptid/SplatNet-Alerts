import type { NextApiRequest, NextApiResponse } from "next";
import { VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY } from "../../constants";
import { getDBClient, getUserIDFromCode, getUserIDsToBeNotified, getUserSubscriptions } from '../../lib/database_utils';
import Filter from "../../lib/filter";
import webpush from 'web-push';
import { fetchAPIRawGearData, fetchCachedRawGearData, Gear, getNewGearItems, rawGearDataToGearList, updateCachedRawGearData } from "../../lib/gear_loader";

function getUserGear(gearToUsers: Map<Gear, Set<number>>, userID: number): Gear[] {
  let gearList = [];
  for (let [gear, userSet] of gearToUsers.entries()) {
    if (userSet.has(userID)) {
      gearList.push(gear);
    }
  }
  return gearList;
}

function generateNotificationPayload(gearList: Gear[]): any {
  let title, body = "", image = "";
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
    image: image
  };
}

/**
 * Checks for new changes to the Splatnet shop, via the Splatoon3.ink API and a
 * local cache. If changes are found, notifies all users that have filters for
 * those new items.
 * 
 * @param req http request. Requires the following parameters, as defined in
 *  `/constants`:
 *  - `API_USER_CODE` string
 *  - `API_FILTER_JSON` string: serialized JSON data for new filter.
 * 
 * @return A response with one of the following response codes:
 *  - 200 if filter was successfully updated.
 *  - 400 if one or more arguments was missing.
 *  - 404 if no matching user was found.
 *  - 500 if any other errors encountered.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate input

  try {
    const client = getDBClient();

    // 1. Check for new/expired gear items.
    let cachedRawGearData = await fetchCachedRawGearData(client);
    let cachedGear: Gear[];
    if (cachedRawGearData == null) {  // store a default value in case no cache
      cachedGear = [];
    } else {
      cachedGear = rawGearDataToGearList(cachedRawGearData)
    }
    console.log(cachedGear);

    // Check if gear has expired (or if we have no stored gear data)
    // Note that gear is sorted in order of expiration, ascending
    if (cachedGear.length > 0 && Date.now() < cachedGear[0].expiration) {
      // Cache has not expired, so do not notify users.
      return res.status(425).end();  // 425 means 'Too Early'
    }

    // Retrieve the new gear data from the API.
    let fetchedRawGearData = await fetchAPIRawGearData();
    let fetchedGear = rawGearDataToGearList(fetchedRawGearData);
    console.log(fetchedGear);

    // 2. Get list of new gear items.
    let newGear = getNewGearItems(cachedGear, fetchedGear);
    
    // 3. Get lists of users to notify.
    let gearToUserIDs = new Map<Gear, Set<number>>();
    let allUserIDs = new Set<number>();
    for (let gear of newGear) {
      let userIDs = await getUserIDsToBeNotified(client, gear);
      gearToUserIDs.set(gear, userIDs);
      allUserIDs = new Set([...allUserIDs, ...userIDs]);
    }
    console.log("Notifying " + allUserIDs.size + " users.");

    // 4. Configure webpush
    webpush.setVapidDetails(
      'mailto:shrimpcryptid@gmail.com',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    // 5. Send each user notifications to their subscribed devices.
    let promises = [];
    for (let userID of allUserIDs) {
      // Set up the notification *this* user should receive.
      let userGear = getUserGear(gearToUserIDs, userID);
      let notification = JSON.stringify(generateNotificationPayload(userGear));
      
      // Send notification to all of the user's subscribed devices
      let notificationPromises = [];
      let userSubscriptions = await getUserSubscriptions(client, userID);
      for (let subscription of userSubscriptions) {
        // TODO: Check that users haven't already been notified
        notificationPromises.push(
          webpush.sendNotification(
              subscription,
              notification,
              // {timeout: 5}
            ).then(({statusCode}) => {
            // TODO: Handle push error codes (https://blog.pushpad.xyz/2022/04/web-push-errors-explained-with-http-status-codes/)
          })
        );
      }
      promises.push(Promise.all(notificationPromises).then(() => {
        // Update user entry once all devices have been notified.
      }));
    }

    // Wait for all notifications to finish.
    await Promise.all(promises);

    // Store the new cached gear data for the future.
    // We only do this AFTER all users have been notified in case the 
    await updateCachedRawGearData(client, fetchedRawGearData);

    return res.status(200).end();  // ok
  } catch (err) {
    console.log(err);
    return res.status(500).end();  // internal server error
  }
}