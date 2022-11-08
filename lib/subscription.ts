import { IllegalArgumentError } from "./utils";
import { PushSubscription } from 'web-push';

/** Data class for Push Subscriptions. */
export default class Subscription implements PushSubscription {
  endpoint: string;
  expirationTime: number;
  keys: {
    auth: string;
    p256dh: string;
  }

  constructor(endpoint: string, expirationTime: number, keys: {auth: string, p256dh: string}) {
    this.endpoint = endpoint;
    this.expirationTime = expirationTime;
    this.keys = keys;
  }

  public static deserialize(jsonObject: any): Subscription {
    if (!jsonObject.endpoint || !jsonObject.keys
      || !jsonObject.keys.auth || !jsonObject.keys.p256dh) {
        throw new IllegalArgumentError("Missing one or more required fields.");
      }
    return new Subscription(
      jsonObject.endpoint,
      jsonObject.expirationTime || 0,
      jsonObject.keys
    );
  }
}