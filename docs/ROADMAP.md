# Roadmap

## Phase 1: Foundation

- Expo + TypeScript app scaffold.
- Mobile-first navigation.
- Today, Scan, My Garden, Planner, Knowledge, Plant Detail, Add Plant, Garden Setup, Settings placeholders.
- Domain model and mock Kitchener/Waterloo garden data.
- Provider interfaces for weather, plant ID, AI, notifications, personal stations.
- Care rules and sun/weather engine stubs.
- First Scan/Add Plant vertical slice: camera/library picker, mock identification, confidence language, confirmation/editing, bed/container selection, local plant creation, and starter tasks visible in Today/My Garden.
- Temporary Expo web preview export with entitlement/subscription service foundation and paywall disabled.

## Phase 2: Real Device Loops

- Persist selected photos and plant instances beyond the current app session.
- Add local-first task completion and queued updates for poor-signal field usage.
- Location permission and saved garden location.
- Compass/orientation capture.
- Local notification permission and test reminders.
- Persistent local storage.
- Replace mock identification with a real provider behind the existing adapter.
- Add basic auth readiness: email/password, Google login plan, admin email handling, subscription lookup boundary, and saved user garden records.

## Phase 3: Garden Model + Scheduling

- Create/edit gardens, zones, beds, containers, obstructions, and plant instances.
- Deterministic care schedule generation.
- Task completion, skip reasons, and observation history.
- Weather-aware watering and protection tasks.
- Offline cache for garden data, schedules, observations, and recent weather snapshots.

## Phase 4: Provider Integrations

- Public weather provider.
- Plant identification provider.
- AI recommendation provider with rules validation.
- Personal weather station adapters.
- Push notifications.
- Stripe subscription provider behind the entitlement service, with admin, lifetime, and comped bypass states preserved.

## Phase 5: Deep Intelligence

- Photo-based disease, pest, mold, nutrient, weed, and stress diagnosis.
- Sun/shade placement optimizer.
- Companion planting and bed rotation logic.
- Growth logs and seasonal insights.
- Personalized knowledge base.

## Deployment + Monetization Readiness

- Use Expo web/Vercel only for temporary preview/testing.
- Build production mobile apps with Expo/EAS for iOS App Store and Google Play Store.
- Keep paywall disabled during the personal-use phase.
- Preserve an affordable future subscription model without blocking current use.
- Support admin, lifetime, and comped bypass states before any payment enforcement.
- Use Stripe as the likely future provider, but do not implement payments until auth and persistence are ready.

## Mobile-Only Product Direction

- Do not optimize for desktop layouts.
- Do not create sidebar admin dashboards or dense tables.
- Prioritize notifications, task completion, scan flows, Today, and weather/garden alerts.
- Keep controls large, touch-friendly, portrait-first, and readable outdoors.
- Minimize typing in garden workflows.
- Prefer offline-first local interactions with queued sync when possible.
