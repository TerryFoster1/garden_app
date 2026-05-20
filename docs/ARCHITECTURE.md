# Architecture

## Framework Choice

Garden App uses React Native + Expo + TypeScript.

Expo is the right starting point because this is a mobile-first product. The app depends on phone-native capabilities: camera, photo library, push notifications, GPS, compass/orientation, outdoor task completion, and quick one-handed interactions. The architecture keeps backend/provider concerns separate so the app can later connect to Node, Next.js, Express, Postgres/Neon, weather providers, AI providers, and notification services without turning the product into a desktop web app.

The primary production targets are iPhone and Android through Expo/EAS. Pattypan.ca also hosts the web version, but the web experience should be a polished companion to the mobile app rather than a desktop-first dashboard.

## Folder Structure

- `src/application`: application shell and screen orchestration.
- `src/components`: reusable UI primitives.
- `src/data`: mock repositories and seed data.
- `src/domain`: app-wide TypeScript domain model.
- `src/features`: screen-level product areas.
- `src/navigation`: primary mobile navigation definitions.
- `src/services`: provider interfaces, adapters, and engines.
- `src/theme`: brand and design tokens.

This mirrors the sibling app convention of keeping `domain`, `data`, `services`, `features`, and shared components separate.

## Service Boundaries

- Weather provider: OpenWeather-first current weather, short forecast, and garden action alerts with local fallback.
- Personal weather station provider: future Tempest, Ambient Weather, Netatmo, Ecowitt, or other station data.
- Plant identification provider: PlantNet-first plant ID, health diagnosis, and pest/weed identification boundary. The adapter reads `EXPO_PUBLIC_PLANT_ID_PROVIDER=plantnet` and `EXPO_PUBLIC_PLANT_ID_API_KEY` at runtime, sends captured or uploaded photos as multipart form data, returns multiple possible matches with confidence, and never auto-confirms a result.
- Plant search service: local autocomplete over common names, alternate names, scientific names, and categories. This keeps Add Plant fast now and replaceable by a real plant database/API later.
- AI recommendation provider: OpenAI-first Library answers, diagnosis explanations, and bed optimization with local rule fallback.
- Care rules engine: deterministic validation before tasks are scheduled.
- Notification service: future Expo push notifications and local reminders.
- SunWeatherEngine: sun path, orientation, obstructions, microclimate estimation, and placement warnings.
- Plant photo service: local photo history lookup, latest profile photo resolution, and future upload/sync boundaries.

## Backend Direction

The current build is local/mock only. Later backend work should expose repository interfaces for users, gardens, beds, plant instances, photos, scans, schedules, weather snapshots, notification preferences, and knowledge content. Postgres/Neon should be a natural fit because the domain is relational and needs auditability over time.

## Deployment + Monetization Readiness

The app is prepared for Pattypan.ca through Expo web static export. `npm run build:web` produces `dist/`, and `vercel.json` points Vercel to that output with an SPA fallback rewrite.

The web shell keeps the actual app phone-shaped on wide screens. Desktop adds an ambient brand panel, QR placeholder, future App Store / Google Play placeholders, and “best experienced on mobile” messaging. It should never become a sidebar admin dashboard or giant desktop CRUD surface.

Expo/EAS mobile builds remain the most important production path. Browser polish should support core workflows without replacing the phone-first interaction model.

There is no active paywall during the personal-use phase. The entitlement service exists only as a future boundary. It supports `free`, `trial`, `premium`, `admin`, `lifetime`, and `comped` account states. Admin, lifetime, and comped users bypass future payment checks, and admin emails can be configured through environment variables later.

Stripe is the likely future subscription provider, but no payment flow, checkout, webhook, or subscription enforcement exists yet. All features remain available while `EXPO_PUBLIC_ENABLE_PAYWALL=false`.

## Auth Readiness

Auth is not implemented yet. Future auth should support:

- Email/password login.
- Google login.
- Admin email matching for payment bypass.
- Subscription lookup through the entitlement service.
- Saved user garden data tied to a stable user id.
- Server-side protection for paid provider calls and sensitive secrets.

Until that exists, the app remains local-first and should not store private server secrets in client code. Expo public environment variables are acceptable only for providers intended for client-side use during the prototype. `.env.local` is ignored by git and must not be committed.

## PlantNet Provider Boundary

`src/services/plantIdentificationProvider.ts` now chooses PlantNet when the provider is configured and a key exists. The adapter posts the selected photo to PlantNet, asks for a short ranked result set, and maps provider scores into Pattypan matches:

- Common name and scientific name when available.
- Confidence percentage.
- Likely/Possible confidence language.
- Related image thumbnail when PlantNet provides one.
- Confirmation warnings so the user remains in control.

If PlantNet is unavailable, returns no matches, or the key is missing, Pattypan falls back to local mock suggestions when `EXPO_PUBLIC_ENABLE_MOCK_PLANT_ID=true`. The fallback preserves field usability and keeps the Add Plant and Library camera workflows from becoming dead ends.

## OpenWeather Boundary

`src/services/weather/weatherProvider.ts` chooses OpenWeather when configured. It reads current temperature, humidity, wind, rain, and forecast points, then converts them into garden actions:

- Frost risk tonight.
- Skip watering after meaningful rain.
- Heat stress likely.
- Secure trellis for wind.
- Mildew risk from humidity.

If OpenWeather fails, Home keeps the last local weather snapshot or mock fallback. Weather errors should never break task completion or plant management.

## OpenAI Boundary

`src/services/aiRecommendationProvider.ts` chooses OpenAI when configured. The provider is used by Ask Pattypan, topic-aware Library answers, diagnosis explanations, and AI Optimize Bed. Responses must use confidence language and practical actions. The app should not let AI directly overwrite layouts, schedule risky care, or present photo diagnosis as certain.

## Mobile UX Contract

Do not optimize the app for desktop layouts, sidebar admin dashboards, keyboard-heavy workflows, dense data tables, or tiny controls.

The most-used interactions should remain:

1. Open notification.
2. Mark task complete.
3. Scan plant or problem.
4. Add plant.
5. Check Today dashboard.
6. View weather and garden alerts.

Screens should be portrait-first, touch-first, readable outdoors, and usable one-handed. Navigation should remain bottom navigation with prominent scan access.

## Experience Architecture

The technical architecture can stay modular, but the screen architecture should avoid data-dump surfaces. Feature screens should expose:

- A current-context summary.
- A primary action.
- Important tasks or alerts.
- Visual status.
- Progressive details.

Today is the status center. Scan is the identity-defining action. My Garden should become visual and spatial. Planner should become tactile and strategic. Knowledge should remain contextual and secondary.

## Workflow Architecture

The app is organized around operating workflows, not generic screens:

- First setup: account/local mode, location permission or address, automatic weather/climate context, then Add Plant or Create Garden.
- Add Plant first: choose Indoor or Outdoor once, identify/search/manual add, collect missing context, save PlantInstance, generate schedules.
- Create Garden first: define indoor/outdoor area, bed/container/room, dimensions, soil/sun/orientation, then add plants or plan.
- Bed detail: edit bed dimensions, add/move/remove plants, see overhead layout, spacing warnings, companion notes, tasks, and harvest actions.
- Plant detail: show latest personal photo, photo timeline, species knowledge plus personal instance state, rename display name, mark watered, harvest, move, remove, scan, or diagnose.
- Command center: weather, urgent tasks, and immediate actions only.

`PlantSpecies` remains generic. `PlantInstance` is the user's living object. The display name is currently `PlantInstance.nickname`; renaming changes only the display name and does not mutate species knowledge.

## Current Local Persistence

The prototype persists the `GardenHomeModel` with AsyncStorage. This is deliberately replaceable. A future repository layer should migrate this to versioned local storage plus backend sync without changing feature-screen intent.

Plant photos currently persist as URI records inside the same local model. Future production architecture should separate binary photo storage from metadata, queue uploads offline, and sync photo history, diagnosis photos, and growth snapshots to the user's account.

## Offline + Field Usage

Users may be outside, in greenhouses, or in poor signal areas. Future persistence should be local-first:

- Cache garden data, plants, schedules, observations, and recent weather snapshots.
- Allow task completion while offline.
- Queue mutations such as task completion, notes, photos, and added plants.
- Sync queued updates when connectivity returns.
- Degrade AI/weather/provider features gracefully when offline.
