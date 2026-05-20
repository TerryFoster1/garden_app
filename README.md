# Garden App

Garden App is a mobile-first foundation for a personalized garden operating system: plant tracking, garden planning, photo-first identification, weather-aware care, and rule-validated AI recommendations.

## Framework

This scaffold uses React Native with Expo and TypeScript because the product is mobile-only. The real production targets are iPhone and Android. Expo web can exist temporarily for preview/testing convenience, but the app should not be designed, optimized, or architected as a desktop web product.

## Run Locally

Install dependencies:

```bash
npm install
```

Run Expo for mobile/simulator development:

```bash
npm run start
```

Run Expo web locally for temporary preview/testing only:

```bash
npm run web
```

Type-check:

```bash
npm run check
```

Build the temporary web preview export:

```bash
npm run build:web
```

The web build outputs to `dist/`. This is not the production platform strategy.

## Temporary Vercel Preview

Vercel may be used for browser preview/testing while the app is early. Do not treat Vercel as the long-term production target.

Recommended preview settings:

- Framework preset: Other
- Install command: `npm install`
- Build command: `npm run build:web`
- Output directory: `dist`
- Root directory: project root

`vercel.json` sets the build command, output directory, and SPA fallback rewrite for preview convenience only.

## Production Target

Production should move through Expo/EAS mobile builds:

- iOS App Store.
- Google Play Store.
- Portrait-first phone layouts.
- Push notifications.
- Camera-first scan flows.
- GPS/location and compass/orientation workflows.
- Offline-first task completion and queued updates where possible.

## Product Phases

V1 is a personal-use Expo mobile prototype tested through Expo Go and development builds. It should prove the phone-first garden loop: notification, Today, task completion, scan, add plant, weather/garden alert, and knowledge search.

V2 is the native iOS and Android release through Expo/EAS, App Store, and Google Play. That phase should add production auth, persistent database, real push notifications, weather API, plant ID API, AI diagnostics, offline sync, and future subscriptions.

## Environment Variables

Copy `.env.example` when creating local, EAS, or temporary preview environment values. Do not commit real secrets.

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

## GitHub Setup

Git is initialized locally on `main`. No GitHub remote is configured yet.

Recommended repo name: `garden-app`.

To create and push with GitHub CLI:

```bash
gh repo create garden-app --private --source=. --remote=origin --push
```

Or create an empty GitHub repo named `garden-app`, then run:

```bash
git remote add origin https://github.com/<your-username>/garden-app.git
git push -u origin main
```

## Current Scope

- Mobile navigation skeleton for Today, Scan, My Garden, Planner, and Knowledge.
- Onboarding, garden setup, settings, weather alerts, task calendar, and sun/shade setup are still early flows.
- Mock Kitchener/Waterloo garden data.
- First Scan/Add Plant loop: take photo or pick from library, receive a mock identification, confirm or edit it, choose a bed/container/indoor zone, and create a local plant instance with starter tasks.
- Live My Garden management loop: switch between outdoor beds, containers, and indoor plants; tap a bed/zone; add plants to that exact location; move plants between locations; remove only the personal plant instance; open real plant detail pages.
- Bed detail editing: edit bed name/dimensions, see overhead plant placement, spacing circles, companion notes, and mocked planning warnings.
- Plant operations: rename display name, mark watered, log harvest, move, remove, scan, and open useful plant detail.
- Command center Today view: weather/status hero, urgent actions, quick actions, care/harvest schedule toggle, My Garden shortcut, and visual garden pulse.
- Interactive Planner foundation: tap outdoor beds, add plants to a bed, view plant markers, dimensions, sun/shade indicators, spacing circles, and rule-style recommendations.
- Local-first persistence using AsyncStorage so plant add/move/remove changes survive app reloads on the device.
- Entitlement/subscription service foundation with paywall disabled.
- Temporary Expo web export for preview/testing only.

## Mocked vs Real

Mocked:

- Plant identification confidence and diagnosis.
- AI recommendations.
- Weather and personal weather station providers.
- Notifications.
- Auth, accounts, saved user data, and subscription lookups.
- Weather/sun/moisture status, companion checks, and spacing warnings.
- Harvest estimates are knowledge/rule based, not photo adjusted yet.
- Plant knowledge is a useful mock dataset, not a live provider.
- Selected photos are held in app state for now.

Real foundation:

- Expo app structure.
- TypeScript domain model.
- Service interfaces and deterministic care-rule pattern.
- Mobile-first screen architecture.
- Expo Image Picker camera/library permission flow.
- Plant creation, movement, removal, and Today task generation through local app state.
- Plant display-name rename without changing PlantSpecies.
- Bed name/dimension editing in local state.
- Watered and harvest logs as completed care tasks.
- AsyncStorage persistence for the mock garden model.
- Plant detail pages powered by mock plant knowledge rather than placeholder copy.
- Temporary static Expo web build for preview/testing.
- Entitlement model for future free, trial, premium, admin, lifetime, and comped access.

## Test The Live Garden Loop

On a phone with Expo Go:

1. Run `npm run start`.
2. Scan the QR code with Expo Go.
3. Open `My Garden`.
4. Switch between `Beds`, `Pots`, and `Indoor`.
5. Tap a bed or plant marker, then tap `Manage plants in this bed`.
6. Use `Add plant here`, choose a plant, stage, and save.
7. Tap the plant for its detail page.
8. Use `Move` to return to its location manager, then move it to another bed/container/indoor zone.
9. Use `Remove` and confirm that only that PlantInstance leaves the garden.

Android back behavior: from a managed bed/zone, tap a plant, then use the Android back gesture/button. It should return to the bed/zone manager; another back returns to My Garden.

## Before Public Launch

- Add auth with email/password and Google login.
- Add offline-first local persistence and queued updates for field usage.
- Replace mock AsyncStorage repository with a versioned local database/cache once the data shape stabilizes.
- Persist user gardens, plants, photos, schedules, and observations.
- Connect real weather and plant identification providers.
- Add secure server-side API boundaries for paid AI/provider calls.
- Implement subscription lookup, likely Stripe, without exposing secrets in the client.
- Add admin email configuration and account management.
- Add privacy, data export/delete, and photo retention controls.
- Add EAS build configuration for iOS and Android.

## EAS Mobile Builds

`eas.json` is included as a starting point for future development, preview, and production mobile builds. Use this later after installing/logging into EAS CLI and confirming app identifiers:

```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```
