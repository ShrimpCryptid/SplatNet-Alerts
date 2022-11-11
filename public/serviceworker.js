self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    image: data.image,
  });
});

// TODO: Add pushsubscriptionchange listener
// See https://blog.pushpad.xyz/2021/01/web-push-error-410-the-push-subscription-has-expired-or-the-user-has-unsubscribed/