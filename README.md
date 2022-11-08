# Splatnet Shop Alerts
Set notifications for the SplatNet 3 Shop gear!

This project is still under development. Expect to see more details soon!


## Project Setup
1. Clone project
```
git clone https://github.com/ShrimpCryptid/splatnet-shop-alerts.git
```

1. Install dependencies 
```
npm install
```
- PostgresQL


1. Use web-push to generate VAPID keys
(Example keys are provided but aren't used in production. Use at your own risk!)
```
npx web-push generate-vapid-keys --json
```
