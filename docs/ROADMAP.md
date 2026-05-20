# Roadmap

## Phase 1: Foundation

- Expo + TypeScript app scaffold.
- Mobile-first navigation.
- Pattypan landing, Home, My Garden, Library, Profile, Plant Detail, Add Plant, Garden Setup, and settings/profile placeholders.
- Domain model and mock Kitchener/Waterloo garden data.
- Provider interfaces for weather, plant ID, AI, notifications, personal stations.
- Care rules and sun/weather engine stubs.
- First Scan/Add Plant vertical slice: camera/library picker, mock identification, confidence language, confirmation/editing, bed/container selection, local plant creation, and starter tasks visible in Today/My Garden.
- Temporary Expo web preview export with entitlement/subscription service foundation and paywall disabled.
- Pattypan.ca responsive web shell: centered phone app on desktop, best-on-mobile messaging, QR placeholder, and app-store placeholders.
- Local plant photo history foundation with latest-photo-as-profile behavior.

## Phase 2: Real Device Loops

- Persist plant add/move/remove/rename, bed edits, watered logs, and harvest logs beyond the current app session.
- Add local-first queued updates for poor-signal field usage.
- Location permission and saved garden location.
- Compass/orientation capture.
- Local notification permission and test reminders.
- Persistent local storage.
- Replace mock identification with a real provider behind the existing adapter.
- Add tap-to-place coordinates and then drag/drop placement within beds.
- Add editable harvest observations and photo-update reminders.
- Expand photo update workflow into weekly prompts and plant growth timelines.
- Add basic auth readiness: email/password, Google login plan, admin email handling, subscription lookup boundary, and saved user garden records.

## Phase 3: Garden Model + Scheduling

- Create/edit gardens, zones, beds, containers, obstructions, and plant instances.
- First setup workflow: continue locally, location/address, automatic climate/weather context, Add Plant or Create Garden.
- Deterministic care schedule generation.
- Deterministic harvest schedule generation.
- Task completion, skip reasons, and observation history.
- Weather-aware watering and protection tasks.
- Offline cache for garden data, schedules, observations, and recent weather snapshots.
- AI Plan My Garden scaffold with rules validation and user confirmation before any changes are applied.

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
- AI-assisted photo comparison for growth stage, harvest timing, disease pressure, and recovery.
- Personalized knowledge base.

## Deployment + Monetization Readiness

- Host the responsive web version on Pattypan.ca while preserving mobile-first UX.
- Build production mobile apps with Expo/EAS for iOS App Store and Google Play Store.
- Keep paywall disabled during the personal-use phase.
- Preserve an affordable future subscription model without blocking current use.
- Support admin, lifetime, and comped bypass states before any payment enforcement.
- Use Stripe as the likely future provider, but do not implement payments until auth and persistence are ready.

## Mobile-First Product Direction

- Do not turn desktop into the primary product model.
- Do not create sidebar admin dashboards or dense tables.
- Prioritize notifications, task completion, scan flows, Today, and weather/garden alerts.
- Keep controls large, touch-friendly, portrait-first, and readable outdoors.
- Minimize typing in garden workflows.
- Prefer offline-first local interactions with queued sync when possible.
- Keep Pattypan.ca polished by centering the phone-shaped app and using desktop space for brand/mobile guidance rather than dashboard complexity.
