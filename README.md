# Pattypan

Pattypan is a mobile-first garden operating system with the tagline: Your Heirloom Secret.

It helps build and operate a living digital twin of a real garden: beds, plants, containers, photos, care tasks, harvest timing, diagnosis, weather context, and rule-validated AI recommendations.

## Framework

This scaffold uses React Native with Expo and TypeScript because the product is mobile-first. The primary production targets remain iPhone and Android. Pattypan.ca will also host the web version, but the app should stay touch-first, camera-aware, and phone-shaped rather than becoming a desktop SaaS dashboard.

## Run Locally

Install dependencies:

```bash
npm install
```

Run Expo for mobile/simulator development:

```bash
npm run start
```

Run Expo web locally for Pattypan.ca/browser preview:

```bash
npm run web
```

Type-check:

```bash
npm run check
```

Build the Pattypan.ca web export:

```bash
npm run build:web
```

The web build outputs to `dist/`.

## Pattypan.ca Web Strategy

Pattypan.ca hosts the browser version while still nudging people toward mobile for camera capture, garden use outdoors, notifications, and one-handed workflows.

On desktop web, the app is centered in a phone-like container with an ambient Pattypan brand panel, “best on mobile” guidance, a QR placeholder, App Store / Google Play placeholders, and a gentle continue-in-browser path. Desktop users are not blocked; they can still browse Library, view gardens, manage plants, upload photos, and use planning flows.

Recommended web deploy settings:

- Framework preset: Other
- Install command: `npm install`
- Build command: `npm run build:web`
- Output directory: `dist`
- Root directory: project root

`vercel.json` sets the build command, output directory, and SPA fallback rewrite.

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

- `EXPO_PUBLIC_APP_NAME=Pattypan`
- `EXPO_PUBLIC_APP_DOMAIN=https://pattypan.ca`
- `EXPO_PUBLIC_APP_URL`
- `EXPO_PUBLIC_PLANT_ID_PROVIDER=plantnet`
- `EXPO_PUBLIC_PLANT_ID_API_KEY`
- `EXPO_PUBLIC_AI_PROVIDER`
- `EXPO_PUBLIC_AI_API_KEY`
- `EXPO_PUBLIC_WEATHER_PROVIDER`
- `EXPO_PUBLIC_WEATHER_API_KEY`
- `EXPO_PUBLIC_ENABLE_MOCK_PLANT_ID=true`
- `EXPO_PUBLIC_ENABLE_MOCK_WEATHER=true`
- `EXPO_PUBLIC_ENABLE_MOCK_AI=true`
- `EXPO_PUBLIC_ENABLE_PAYWALL=false`
- `EXPO_PUBLIC_ADMIN_EMAILS=`
- `EXPO_PUBLIC_SUBSCRIPTION_PROVIDER=stripe`

Plant identification uses PlantNet when `EXPO_PUBLIC_PLANT_ID_PROVIDER=plantnet` and `EXPO_PUBLIC_PLANT_ID_API_KEY` is available. Keep the real key in `.env.local`; it is ignored by git. The app never logs the key and falls back to local mock suggestions when the provider is unavailable and `EXPO_PUBLIC_ENABLE_MOCK_PLANT_ID=true`.

Weather uses OpenWeather when `EXPO_PUBLIC_WEATHER_PROVIDER=openweather` and `EXPO_PUBLIC_WEATHER_API_KEY` are available. Home converts forecast signals into garden alerts such as frost risk, skip watering after rain, heat stress, wind support, and mildew risk.

AI uses OpenAI when `EXPO_PUBLIC_AI_PROVIDER=openai` and `EXPO_PUBLIC_AI_API_KEY` are available. Ask Pattypan, topic-aware Library answers, and AI Optimize Bed use OpenAI first and local rule-based fallbacks if unavailable.

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

- Clean mobile navigation: Home, My Garden, Library, Profile.
- First-open Pattypan landing/auth entry screen. Sign up and Sign in both enter local prototype mode until real auth exists.
- Onboarding, garden setup, settings, weather alerts, task calendar, and sun/shade setup are still early flows.
- Mock Kitchener/Waterloo garden data.
- First Scan/Add Plant loop: take photo or pick from library, send the image to PlantNet when configured, review multiple possible matches with confidence percentages, confirm or edit the selected match, choose a bed/container/indoor zone, and create a local plant instance with starter tasks.
- Add Plant autocomplete: type a plant name, common alias, or scientific name to search the local seed index without browsing a giant visible plant list.
- Live My Garden management loop: switch between outdoor beds, containers, and indoor plants; tap a bed/zone; add plants to that exact location; move plants between locations; remove only the personal plant instance; open real plant detail pages.
- Bed detail editing: edit bed name/dimensions, see overhead plant placement, spacing circles, companion notes, and mocked planning warnings.
- Plant operations: rename display name, mark watered, log harvest, move, remove, scan, and open useful plant detail.
- Home command center: atmospheric weather/status hero, urgent action checklist, and one Add Plant CTA.
- OpenWeather-backed Home intelligence: current conditions refresh from the provider when configured, then Pattypan derives garden action alerts.
- Library intelligence: Ask Pattypan, topic-aware Library questions, and useful topic screens for pests, diseases, plant care, propagation, and growing from seed.
- AI Optimize Bed: OpenAI-backed bed review with local rule fallback for overcrowding, spacing, airflow, and companion suggestions.
- Planner functions are re-homed into My Garden, Bed Detail, Add/Edit Bed, and AI Optimize Bed. Planner is no longer a bottom-nav tab.
- Scan is re-homed into Add Plant and Library diagnose/search workflows. Scan is no longer a bottom-nav tab.
- Local-first persistence using AsyncStorage so plant add/move/remove changes survive app reloads on the device.
- Entitlement/subscription service foundation with paywall disabled.
- Responsive Expo web export for Pattypan.ca, with a centered mobile app frame and desktop mobile-recommendation panel.
- Plant photo history foundation: add-flow photos and plant-detail uploads are stored in local state/AsyncStorage.
- Latest PlantInstance photo becomes the plant profile image in Plant Detail and garden thumbnails.

## Mocked vs Real

Mocked or fallback:

- Plant identification falls back to local mock suggestions if PlantNet is unavailable or no key is configured.
- Disease/pest diagnosis has a PlantNet-ready service boundary, but the primary UI still routes through the camera/add flow and local fallback while diagnosis screens mature.
- AI recommendations fall back to local rules if OpenAI is unavailable.
- Weather falls back to the local Kitchener/Waterloo snapshot if OpenWeather is unavailable.
- Personal weather station providers.
- Notifications.
- Auth, accounts, saved user data, and subscription lookups.
- Sun/moisture status, companion checks, and spacing warnings remain partly local/rule-based.
- Harvest estimates are knowledge/rule based, not photo adjusted yet.
- Plant knowledge is a useful mock dataset, not a live provider.
- Plant photo storage is local/mock only; photos use local device URIs or seeded remote mock images.

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
- Local plant search index covering common vegetables, herbs, berries, flowers, pollinator plants, houseplants, succulents, trees/shrubs, and container plants.
- Plant photo timeline and latest-photo profile behavior in local persisted state.
- Responsive static Expo web build for Pattypan.ca.
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
8. Long-press a plant in bed detail to open Harvest, Move, Rename, Details, and Remove.
9. Use `Harvest` to confirm “Harvest and remove this plant from the bed?”.
10. Use `Move within this bed`, tap a new spot, then confirm “Replant here?”.
11. Use `Remove` and confirm that only that PlantInstance leaves the garden.

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
