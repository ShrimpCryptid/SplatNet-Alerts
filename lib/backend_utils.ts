import webpush from 'web-push';
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, DEV_EMAIL } from '../config';
import fetch from "node-fetch";
import { VERSION } from "../constants";

export function configureWebPush() {
  webpush.setVapidDetails(
    `mailto:${DEV_EMAIL}`,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

/**
 * Calls fetch on the given request.
 */
 export async function fetchWithBotHeader(url: string) {
  return fetch(url, {
		method: "GET",
		headers: {
			"User-Agent": `Splatnet Shop Alerts Prototype/${VERSION} ${DEV_EMAIL}`,
		}
  });
}