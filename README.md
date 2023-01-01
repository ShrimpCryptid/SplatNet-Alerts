# SplatNet Shop Alerts 📣
Set notifications for the SplatNet 3 Shop!

![image](https://user-images.githubusercontent.com/30200665/201589511-bc220ada-caa7-4ad8-9154-0967867b4e6c.png)

## What's this?
This is an unofficial web app for the game Splatoon 3 that alerts you about relevant SplatNet gear. It's currently work-in-progress, but you can view updates on my [Twitter (@ShrimpCryptid)](https://twitter.com/shrimpcryptid) and via the roadmap below, which I'll update as I make progress.

It's made using NEXT.js, which is a framework for React and Node.js, and the database is built on PostgresSQL.

I'm currently targeting December 2022 for launch. 🤞

## Features
- Filter by gear type (hats, clothing, shoes), ability, rarity, and brand
- Also, set alerts for specific gear items (+abilities)
- Receive notifications on your devices when relevant items come into the shop
- Sync your filters across devices
- Minimizes user data collection (no logins!)

## Roadmap
- [x] Database definitions for filters, user data
- [x] Database API for adding and removing filters and users
- [x] Filter option selection page
- [x] Retrieve user filters and display on the homepage
- [x] Device subscription to push notifications
- [x] Send notifications through the database
- [x] Collect current gear from [Splatoon3.ink](https://splatoon3.ink)
- [x] Detect changes to gear from local backup and send updates to relevant users
- [ ] Custom images + text for push notifications (20%)
- [x] Scrape data from the Splatoon 3 wiki for gear items
- [x] Gear item selection screen on filter page
- [ ] Troubleshooting guide for push notifications
- [x] Login flow for notifications
- [ ] UI polish pass
  - [ ] Show favored/unfavored abilities for brands
  - [x] Replace some UI buttons with clickable icons
  - [x] Loading animations for database actions
  - [ ] Rarity selector for filter page
  - [ ] Background image assets
  - [ ] Custom toast notification animations and styling
  - [x] Notification on/off slider, options for stopping all notifications
  - [x] User flow alerts (prompt for notifications, etc.)
- [ ] Set up metrics collection and server logging
- [x] Configure server/database options, key security
- [x] Web hosting setup
- [ ] **WEBSITE GOES LIVE** 🎉
- [ ] User testing (25%)
- [ ] Contributor tutorial + documentation (💖)
- [ ] Translation support

## License
This project is not associated with Nintendo, and is an unofficial, fan-made website. Licensed under MIT.

![loading2](https://user-images.githubusercontent.com/30200665/201589377-e51c9cda-f713-402d-8a3c-5759536da264.gif)

