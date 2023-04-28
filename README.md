# SplatNet Alerts 📣✨

Set notifications for the SplatNet 3 Shop!

## IT'S ALIVE: ✨[splatnet-alerts.netlify.app](https://splatnet-alerts.netlify.app/)✨ 

![image](https://user-images.githubusercontent.com/30200665/213373066-c735bcc3-ccda-4622-b9e2-43045f4c3788.png)


## What's this?
Splatoon 3 comes with a companion app, SplatNet 3, which has its own shop and a daily rotating inventory. These items have unique ability combinations that you can't normally buy, but checking the app daily is a bit of a pain.

This is an unofficial web app for the game Splatoon 3 that alerts you about SplatNet gear you're interested in! You can view updates on my [Twitter (@ShrimpCryptid)](https://twitter.com/shrimpcryptid) and via the roadmap below, which I'll update as I make progress.

It's made using NEXT.js, which is a framework for React and Node.js, and the database is built on PostgreSQL.

## Features
- Filter by any combination of gear item, type (hats, clothing, shoes), ability, and brand.
- Receive push notifications on your devices when those items come into the shop!
- Data is synced across devices, no passwords required.

## Roadmap
- [x] Database definitions for filters, user data
- [x] Database API for adding and removing filters and users
- [x] Filter option selection page
- [x] Retrieve user filters and display on the homepage
- [x] Device subscription to push notifications
- [x] Send notifications through the database
- [x] Collect current gear from [Splatoon3.ink](https://splatoon3.ink)
- [x] Detect changes to gear from local backup and send updates to relevant users
- [ ] Custom images + text for push notifications (50%)
- [x] Scrape data from the Splatoon 3 wiki for gear items
- [x] Gear item selection screen on filter page
- [x] Troubleshooting guide for push notifications
- [x] Login flow for notifications
- [ ] UI polish pass
  - [ ] Show favored/unfavored abilities for brands
  - [x] Replace some UI buttons with clickable icons
  - [x] Loading animations for database actions
  - [ ] Rarity selector for filter page
  - [x] Background image assets
  - [ ] Custom toast notification animations and styling
  - [x] Notification on/off slider, options for stopping all notifications
  - [x] User flow alerts (prompt for notifications, etc.)
- [x] Set up metrics collection and server logging
- [x] Configure server/database options, key security
- [x] Web hosting setup
- [x] **WEBSITE GOES LIVE** 🎉
- [ ] User testing (50%)
- [ ] Contributor tutorial + documentation (💖)
- [ ] Translation support

## Support this project
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/L4L06AHRY)

## License
This project is not associated with Nintendo, and is an unofficial, fan-made website. Licensed under MIT.
