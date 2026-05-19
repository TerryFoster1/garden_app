# Architecture

## Framework Choice

Garden App uses React Native + Expo + TypeScript.

Expo is the right starting point because the product depends on mobile-native capabilities: camera, photo library, push notifications, GPS, compass/orientation, and quick daily task interaction. The architecture keeps backend/provider concerns separate so the app can later connect to Node, Next.js, Express, Postgres/Neon, weather providers, AI providers, and notification services.

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

- Weather provider: current weather, hourly forecast, daily forecast, and alerts.
- Personal weather station provider: future Tempest, Ambient Weather, Netatmo, Ecowitt, or other station data.
- Plant identification provider: plant ID, health diagnosis, pest/weed identification.
- AI recommendation provider: suggestions from notes/photos.
- Care rules engine: deterministic validation before tasks are scheduled.
- Notification service: future Expo push notifications and local reminders.
- SunWeatherEngine: sun path, orientation, obstructions, microclimate estimation, and placement warnings.

## Backend Direction

The current build is local/mock only. Later backend work should expose repository interfaces for users, gardens, beds, plant instances, photos, scans, schedules, weather snapshots, notification preferences, and knowledge content. Postgres/Neon should be a natural fit because the domain is relational and needs auditability over time.

## Deployment + Monetization Readiness

The app is prepared for Vercel browser deployment through Expo web static export. `npm run build:web` produces `dist/`, and `vercel.json` points Vercel to that output with an SPA fallback rewrite.

Expo/EAS mobile builds should come later, after the browser version proves the core flows and the device integrations are ready for app-store packaging.

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

Until that exists, the app remains local/mock and should not store real secrets in client code.
