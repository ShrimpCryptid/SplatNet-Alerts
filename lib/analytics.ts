import { ENV_KEY_GOOGLE_ANALYTICS } from "../constants/env"
import { getEnvWithDefault } from "./shared_utils"

/*
* Adapted from https://andrew-simpson-ross.medium.com/strongly-typed-google-analytics-v4-with-next-js-aad6c6a5e383
*/

export function getGoogleAnalyticsID(): string {
  return getEnvWithDefault(ENV_KEY_GOOGLE_ANALYTICS, "");
}

export const pageview = (url: URL) => {
  window.gtag('config', getGoogleAnalyticsID(), {page_path: url});
}

export const event = (
  action: Gtag.EventNames,
  {event_category, event_label, value}: Gtag.EventParams
) => {
  window.gtag('event', action, {event_category, event_label, value});
}