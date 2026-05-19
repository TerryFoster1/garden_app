# Garden App

Garden App is a mobile-first foundation for a personalized garden operating system: plant tracking, garden planning, photo-first identification, weather-aware care, and rule-validated AI recommendations.

## Framework

This scaffold uses React Native with Expo and TypeScript because the core product depends on phone-native capabilities: camera, photo library, push notifications, GPS, compass/orientation, and mobile task flows. The browser deployment uses Expo web exported as a static site for Vercel.

## Run Locally

Install dependencies:

```bash
npm install
```

Run Expo for mobile/simulator development:

```bash
npm run start
```

Run Expo web locally:

```bash
npm run web
```

Type-check:

```bash
npm run check
```

Build the web export:

```bash
npm run build:web
```

The web build outputs to `dist/`.

## Deploy To Vercel

Recommended Vercel settings:

- Framework preset: Other
- Install command: `npm install`
- Build command: `npm run build:web`
- Output directory: `dist`
- Root directory: project root

`vercel.json` already sets the build command, output directory, and SPA fallback rewrite.

## Environment Variables

Copy `.env.example` when creating local or Vercel environment values. Do not commit real secrets.

Required placeholders:

- `EXPO_PUBLIC_APP_URL`
- `EXPO_PUBLIC_WEATHER_API_PROVIDER`
- `EXPO_PUBLIC_WEATHER_API_KEY`
- `EXPO_PUBLIC_PLANT_ID_PROVIDER`
- `EXPO_PUBLIC_PLANT_ID_API_KEY`
- `EXPO_PUBLIC_AI_PROVIDER`
- `EXPO_PUBLIC_AI_API_KEY`
- `EXPO_PUBLIC_ENABLE_PAYWALL=false`
- `EXPO_PUBLIC_ADMIN_EMAILS=`
- `EXPO_PUBLIC_SUBSCRIPTION_PROVIDER=stripe`

## Current Scope

- Mobile navigation skeleton for Today, Scan, My Garden, Planner, and Knowledge.
- Placeholder flows for onboarding, plant detail, garden setup, settings, weather alerts, task calendar, and sun/shade setup.
- Mock Kitchener/Waterloo garden data.
- First Scan/Add Plant loop: take photo or pick from library, receive a mock identification, confirm or edit it, choose a bed/container/indoor zone, and create a local plant instance with starter tasks.
- Entitlement/subscription service foundation with paywall disabled.
- Vercel-ready Expo web static export.

## Mocked vs Real

Mocked:

- Plant identification confidence and diagnosis.
- AI recommendations.
- Weather and personal weather station providers.
- Notifications.
- Auth, accounts, saved user data, and subscription lookups.
- Added plants and selected photos are in-memory only until persistence is added.

Real foundation:

- Expo app structure.
- TypeScript domain model.
- Service interfaces and deterministic care-rule pattern.
- Mobile-first screen architecture.
- Expo Image Picker camera/library permission flow.
- In-memory plant creation that updates Today and My Garden without restarting.
- Static Expo web build for Vercel.
- Entitlement model for future free, trial, premium, admin, lifetime, and comped access.

## Before Public Launch

- Add auth with email/password and Google login.
- Persist user gardens, plants, photos, schedules, and observations.
- Connect real weather and plant identification providers.
- Add secure server-side API boundaries for paid AI/provider calls.
- Implement subscription lookup, likely Stripe, without exposing secrets in the client.
- Add admin email configuration and account management.
- Add privacy, data export/delete, and photo retention controls.

