import { ENV_KEY_GOOGLE_ANALYTICS } from "../constants/env"
import { getEnvWithDefault } from "./shared_utils"

/*
* Adapted from https://andrew-simpson-ross.medium.com/strongly-typed-google-analytics-v4-with-next-js-aad6c6a5e383
*/

export function getGoogleAnalyticsID(): string {
  return getEnvWithDefault(ENV_KEY_GOOGLE_ANALYTICS, "");
}

export function logPageview (url: URL) {
  if (typeof window === 'undefined') { return; }
  window.gtag('config', getGoogleAnalyticsID(), {page_path: url});
}

export function logEvent (
  action: Gtag.EventNames | AnalyticsAction,
  params?: Gtag.EventParams | Gtag.CustomParams
) {
  if (typeof window === 'undefined') { return; }
  window.gtag('event', action, params);
}

export enum AnalyticsCategory {
  Filters = "Filters",
  Users = "Users",
}

export enum AnalyticsAction {
  NewFilter = "new_filter",
  EditFilter = "edit_filter",
}

export enum AnalyticsLabel {
}