import webpush from 'web-push';
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } from '../config';


export function configureWebPush() {
  webpush.setVapidDetails(
    'mailto:shrimpcryptid@gmail.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}