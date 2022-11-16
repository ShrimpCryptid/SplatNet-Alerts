import type { NextApiRequest, NextApiResponse } from "next";
import { VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY } from "../../constants";
import { getDBClient, getUserIDFromCode, getUserIDsToBeNotified, getUserSubscriptions } from '../../lib/database_utils';
import Filter from "../../lib/filter";
import webpush from 'web-push';
import { Gear } from "../../lib/Gear";


/**
 * Saves a new user-created filter.
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

    let gear = new Gear("someid", 0, "Annaki", "HeadGear", "Fresh Fish Head", "Run Speed Up", 0, 0);

    let userIDs = await getUserIDsToBeNotified(client, gear);
    console.log(userIDs);

    let notification = { title: "Test push notification", body: "Test body", image: "https://i.kym-cdn.com/photos/images/newsfeed/000/641/298/448.jpg"};
    webpush.setVapidDetails(
      'mailto:shrimpcryptid@gmail.com',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    let promises = [];
    for (let userID of userIDs) {
      let userSubscriptions = await getUserSubscriptions(client, userID);
      for (let subscription of userSubscriptions) {
        promises.push(webpush.sendNotification(subscription, JSON.stringify(notification)));
      }
    }

    await Promise.all(promises);

    return res.status(200).end();  // ok
  } catch (err) {
    console.log(err);
    return res.status(500).end();  // internal server error
  }
}