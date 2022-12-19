const KEY_TAG_TO_DATA = "tagToData";
const ACTION_SETTINGS = "settings";
const ACTION_SHOP = "shop";

self.addEventListener('push', async (event) => {
  const data = event.data.json();
  let actions = [];

  if (data.loginURL !== undefined) {
    actions.push({
      action: ACTION_SETTINGS,
      title: "Edit Filters"
    });
  }
  if (data.shopURL !== undefined) {
    actions.push({
      action: ACTION_SHOP,
      title: "Order Gear"
    })
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Notification/data

  self.registration.showNotification(
    data.title,
    {
      body: data.body,
      image: data.image,
      actions: actions,
      tag: data.tag,
      data: data  // Stores a whole copy of all data passed to the notification
    });
});

/**
 * Searches for and focuses a client with the given url, optionally opening a
 * new window if no such client exists.
 * 
 * @param {string} searchURL The string URL to match with.
 * @param {string} openURL The string URL to open if no match is found.
 * @param {boolean} matchExactly If true, client URL must match exactly with the
 * given url. Otherwise, matches if the client URL begins with the baseURL.
 * (true by default)
 * @param {boolean} forceNewWindow If true, will always create a new window instead of
 * search for and focusing existing clients. (false by default)
 * 
 * @returns A Promise that resolves to a client with the matching URL.
 */
function openAndFocusClient(searchURL, openURL, matchExactly=true, forceNewWindow=false) {
  console.log("Searching for client windows that match URL '" + searchURL + "'.");
  return clients.matchAll({type: 'window'})
    .then((clients) => {
      if (matchExactly) {
        return clients.filter(client => client.url === searchURL);
      } else {
        return clients.filter(client => client.url.search(searchURL) === 0);
      }
    })
    .then((matchingClients) => {
      if (matchingClients[0] && !forceNewWindow) {
        console.log("Found matching client with URL '" + matchingClients[0].url + "'.")
        return matchingClients[0].focus();
      } else {
        console.log("No matching clients found; making new window with URL '" + openURL + "'.");
        return clients.openWindow(openURL);
      }
    });
}

self.addEventListener('notificationclick', (event) => {
  console.log("User clicked on notification (action: '" + event.action + "')");
  let data = event.notification.data;
  // See https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/notificationclick_event
  if (event.action === ACTION_SHOP || (event.action === "" && data.shopURL !== undefined)) {
    // Open SplatNet shop if this notification was clicked or if the order
    // button was selected.
    const openShop = async () => {
      let itemOrderURL = data.shopURL + data.gearID;
      // Don't match exactly, in case the shop URL is already open.
      let client = await openAndFocusClient(data.shopURL, itemOrderURL, false, false);
      if (client.url !== itemOrderURL) {
        // Redirect if client is an existing window.
        return client.navigate(itemOrderURL);
      }
      return;
    }
    event.waitUntil(openShop());

  } else {
    // Open the website if the settings button was clicked, logging in
    // if that information was provided.
    // Note: This will only match the main landing page exactly, so it doesn't
    // interfere if a user is making a filter or editing the about page.
    const openSite = async () => {
      let client = await openAndFocusClient(data.siteURL, data.loginURL, true, false);
      if (data.loginURL && client.url !== data.loginURL) {
        // If we focused an existing client, redirect it to the login URL.
        // TODO: Use messages instead of manual redirects?
        console.log("Found login URL, using: '" + data.loginURL + "'.");
        return client.navigate(data.loginURL);
      }
      return;
    };
    event.waitUntil(openSite());
  }
});

// TODO: Add pushsubscriptionchange listener
// See https://blog.pushpad.xyz/2021/01/web-push-error-410-the-push-subscription-has-expired-or-the-user-has-unsubscribed/
