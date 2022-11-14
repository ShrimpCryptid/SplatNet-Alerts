import type { NextApiRequest, NextApiResponse } from "next";
import { deletePushSubscription, getDBClient, getLastNotifiedExpiration, getUserIDsToBeNotified, getUserSubscriptions, trySendNotification, updateLastNotifiedExpiration } from '../../lib/database_utils';
import { fetchAPIRawGearData, fetchCachedRawGearData, Gear, getNewGearItems, rawGearDataToGearList, updateCachedRawGearData } from "../../lib/gear_loader";
import { configureWebPush } from "../../lib/server_utils";

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
 * @return A response with one of the following response codes:
 *  - 200 once all operations have completed.
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

    // Check if gear has expired (or if we have no stored gear data)
    // Note that gear is sorted in order of expiration, ascending
    if (cachedGear.length > 0 && Date.now() < cachedGear[0].expiration) {
      // Cache has not expired, so do not notify users.
      return res.status(425).end();  // 425 means 'Too Early'
    }

    // Retrieve the new gear data from the API.
    let fetchedRawGearData = await fetchAPIRawGearData();
    let fetchedGear = rawGearDataToGearList(fetchedRawGearData);

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
    configureWebPush();

    // 5. Send each user notifications to their subscribed devices.
    let startTime = Date.now();
    let numSkipped = 0;
    let devicesNotified = 0;
    let devicesFailed = 0;

    let promises = [];
    for (let userID of allUserIDs) {
      // Set up the notification *this* user should receive.
      let userGear = getUserGear(gearToUserIDs, userID);
      let notification = JSON.stringify(generateNotificationPayload(userGear));
      let latestExpiration = userGear[userGear.length - 1].expiration;``

      // Check that we haven't already notified this user
      if (latestExpiration <= await getLastNotifiedExpiration(client, userID)) {
        // We've already notified this user about these items, so we skip them.
        numSkipped++;
        continue;
      }
      
      // Send notification to all of the user's subscribed devices
      let notificationPromises = [];
      let userSubscriptions = await getUserSubscriptions(client, userID);
      if (userSubscriptions.length == 0) { // user has no subscribed devices
        numSkipped++;
        continue;
      }

      for (let subscription of userSubscriptions) {
        devicesNotified++;
        notificationPromises.push(
          trySendNotification(client, subscription, notification).then(
            (result) => {
              if (!result) { devicesFailed++ }
            }
          )
        );
      }
      promises.push(Promise.all(notificationPromises).then(() => {
        // Update user entry once all devices have been notified.
        updateLastNotifiedExpiration(client, userID, latestExpiration);
      }));
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
    console.log(`Users notified: ${allUserIDs.size} users (${numSkipped} skipped)`);
    console.log(`Devices notified: ${devicesNotified - devicesFailed} devices (${devicesFailed} failures)`);

    return res.status(200).end();  // ok
  } catch (err) {
    console.log(err);
    return res.status(500).end();  // internal server error
  }
}