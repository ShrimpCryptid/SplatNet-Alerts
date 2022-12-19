import { IllegalArgumentError } from "./shared_utils";
import { PushSubscription } from "web-push";

/** Data class for Push Subscriptions. */
export class Subscription implements PushSubscription {
	endpoint: string;
	expirationTime: number;
	keys: {
		auth: string;
		p256dh: string;
	};

	constructor(
		endpoint: string,
		expirationTime: number,
		keys: { auth: string; p256dh: string }
	) {
		this.endpoint = endpoint;
		this.expirationTime = expirationTime;
		this.keys = keys;
	}

	public static deserialize(jsonObject: any): Subscription {
		if (
			!jsonObject.endpoint ||
			!jsonObject.keys ||
			!jsonObject.keys.auth ||
			!jsonObject.keys.p256dh
		) {
			throw new IllegalArgumentError("Missing one or more required fields.");
		}
		return new Subscription(
			jsonObject.endpoint,
			jsonObject.expirationTime || 0,
			jsonObject.keys
		);
	}
}

export function isPushNotificationSupported() {
	return "serviceWorker" in navigator && "PushManager" in window;
}

export function registerServiceWorker() {
	return navigator.serviceWorker.register("/serviceworker.js", {scope: "/"});
}

export async function requestNotificationPermission() {
	return await Notification.requestPermission();
}

// Copied from the web-push documentation
const urlBase64ToUint8Array = (base64String: string) => {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, "+")
		.replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
};

// Copied from https://felixgerschau.com/web-push-notifications-tutorial/#what-are-web-push-notifications
export async function createNotificationSubscription(vapidPublicKey: string) {
	// wait for service worker installation to be ready
	const serviceWorker = await navigator.serviceWorker.ready;
	// subscribe and return the subscription
	return await serviceWorker.pushManager.subscribe({
		userVisibleOnly: true, // required
		applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
	});
}
