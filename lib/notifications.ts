import { VAPID_PUBLIC_KEY } from "../constants";

export function isPushNotificationSupported() {
  return "serviceWorker" in navigator && "PushManager" in window;
}

export function registerServiceWorker() {
  return navigator.serviceWorker.register("/serviceworker.js");
}

export async function requestNotificationPermission() {
  return await Notification.requestPermission();
}

// Copied from the web-push documentation
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Copied from https://felixgerschau.com/web-push-notifications-tutorial/#what-are-web-push-notifications
export async function createNotificationSubscription() {
  // wait for service worker installation to be ready
  const serviceWorker = await navigator.serviceWorker.ready;
  // subscribe and return the subscription
  return await serviceWorker.pushManager.subscribe({
    userVisibleOnly: true,  // required
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
}