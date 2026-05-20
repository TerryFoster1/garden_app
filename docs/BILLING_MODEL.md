# Billing Model

Pattypan should use a freemium adoption model. The app should let users experience real value before it asks for payment.

## Product

- Product name: Pattypan Premium
- Price: USD $3.99/month
- Billing provider: Stripe, after server-side auth exists
- Public beta rule: do not connect billing to local prototype auth

## Account States

- `free`: default public account.
- `trial`: time-limited premium access.
- `premium`: active paid subscription.
- `admin`: owner/admin full access without paying.
- `lifetime`: full access without recurring billing.
- `comped`: manually granted full access.

Admin, lifetime, and comped states must bypass payment checks. They should not require a Stripe subscription.

## Free Tier

Free users should be able to build trust and understand Pattypan before they hit a limit.

Suggested limits:
- 1 garden.
- Up to 2 beds or containers.
- Up to 10 plants.
- Basic weather.
- Basic reminders.
- Limited photo history.
- Limited AI/diagnosis uses per month.

Avoid paywalling:
- Account creation.
- First garden setup.
- First plant add.
- Basic plant details.
- Basic tasks.
- A small number of diagnoses.

## Premium Tier

Pattypan Premium at $3.99/month should include:
- Unlimited gardens.
- Unlimited beds and containers.
- Unlimited plants.
- Advanced AI diagnosis.
- AI Optimize Bed.
- Advanced weather alerts.
- Expanded photo and growth history.
- Harvest predictions.
- Seed-start workflows.
- Companion planting planner.
- Future personal weather station integration.

## Gating Philosophy

Use soft, contextual gating:
- Let users finish the task they started where possible.
- Explain why Premium helps.
- Avoid blocking during onboarding.
- Show limits before hard stops.
- Always let admin/owner accounts bypass payment.

## Local Alpha Bridge

The current app has an entitlement bridge, but the paywall remains disabled by default. The bridge exists so UI and feature-gate calls have a stable shape before real backend subscriptions are connected.

Current bridge behavior:
- `EXPO_PUBLIC_ENABLE_PAYWALL=false` leaves all features available.
- Admin emails in `EXPO_PUBLIC_ADMIN_EMAILS` bypass future payment checks.
- `admin`, `lifetime`, and `comped` states are supported by type and UI.
- Checkout is not enabled.

## What Must Wait

Do not enforce public billing until:
- Real server-side users exist.
- Stripe customer ids are linked to backend user ids.
- Webhooks update subscription state in the backend.
- Feature gates read backend entitlement state.
- Provider API keys are no longer exposed in the client bundle.

