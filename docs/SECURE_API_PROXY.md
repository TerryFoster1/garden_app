# Secure API Proxy

Pattypan alpha currently uses Expo public environment variables for provider calls. That is acceptable only for private alpha testing. Public beta must move paid provider keys server-side.

## Providers To Proxy

- OpenAI: Ask Pattypan, diagnosis explanations, AI Optimize Bed, seed guidance, companion suggestions.
- PlantNet: plant identification from uploaded photos.
- OpenWeather: current weather, forecast, frost, heat, wind, rain, humidity, and alert generation.

## Why Proxy

Expo public variables are bundled into the client app. Public users can inspect mobile/web bundles and extract provider keys. Paid APIs must be called through authenticated server routes or edge functions.

## Recommended First Implementation

Use Supabase Edge Functions for public beta:

- `identify-plant`
- `diagnose-plant`
- `ask-pattypan`
- `optimize-bed`
- `weather-current`
- `weather-forecast`

Each function should:
- Require a valid Supabase auth token.
- Load provider keys from server secrets.
- Check entitlements and monthly usage limits.
- Validate input size and type.
- Redact sensitive data from logs.
- Store usage events.
- Return confidence language, not certainty.

## Photo Handling

Do not pass large permanent local URIs around as the source of truth in public beta.

Recommended flow:
1. User uploads photo to private Supabase Storage.
2. App receives a storage path.
3. Edge function creates a short-lived signed URL or reads the file server-side.
4. Provider request uses the server-side file stream or signed URL.
5. Diagnosis/identification result is stored with the photo record.

## Usage Metering

Track provider usage in `api_usage_events`:

- `user_id`
- `provider`
- `feature`
- `request_started_at`
- `request_finished_at`
- `success`
- `estimated_cost_units`
- `error_code`

Use these records for:
- Free tier monthly diagnosis limits.
- Abuse detection.
- Cost visibility.
- Debugging provider failures.

## Error Handling

Provider routes should return stable client errors:

- `provider_unavailable`
- `rate_limited`
- `invalid_photo`
- `usage_limit_reached`
- `unauthorized`
- `missing_entitlement`

The app should keep existing fallback behavior:
- Show local guidance when AI is unavailable.
- Let users search manually when PlantNet fails.
- Show weather unavailable instead of pretending mock data is real.

## Client Migration

Current client provider adapters should become thin API clients:

- `plantIdentificationProvider` calls `/functions/v1/identify-plant`.
- `aiRecommendationProvider` calls `/functions/v1/ask-pattypan` or feature-specific endpoints.
- `weatherProvider` calls `/functions/v1/weather-current` and `/functions/v1/weather-forecast`.

Keep the local mock providers for development and offline fallback, but do not ship public paid-provider keys in the app.

