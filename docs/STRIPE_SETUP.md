# Stripe Setup Plan

Stripe is planned for Pattypan Premium, but it should not be launched until real backend auth and subscription persistence exist.

## Planned Product

- Product: Pattypan Premium
- Price: USD $3.99/month
- Mode: recurring subscription
- Trial: optional, after beta limits are validated

## Required Server Environment Variables

These must live on the backend only:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_PATTYPAN_PREMIUM_MONTHLY`

Client-side mobile/web may eventually use a publishable key for Stripe-hosted checkout redirect flows, but it must never receive the secret key or webhook secret.

## Backend Records

Store Stripe state in backend tables:

- `profiles.stripe_customer_id`
- `subscriptions.user_id`
- `subscriptions.stripe_customer_id`
- `subscriptions.stripe_subscription_id`
- `subscriptions.stripe_price_id`
- `subscriptions.status`
- `subscriptions.current_period_start`
- `subscriptions.current_period_end`
- `subscriptions.cancel_at_period_end`
- `subscriptions.last_event_id`
- `entitlement_overrides.user_id`
- `entitlement_overrides.state`
- `entitlement_overrides.reason`

## Checkout Flow

1. User has a real backend auth session.
2. App asks backend to create a subscription Checkout Session.
3. Backend creates or reuses Stripe Customer for the backend user.
4. Backend creates Checkout Session for `Pattypan Premium`.
5. App opens Stripe-hosted checkout.
6. Stripe redirects back to Pattypan.
7. Webhook confirms subscription state before premium access is granted.

Do not trust only the checkout redirect. Webhooks are the source of truth.

## Webhooks

Required Stripe events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Webhook requirements:
- Verify the `stripe-signature` header with raw request body.
- Store processed event ids to prevent duplicate handling.
- Update backend subscription state idempotently.
- Never trust client-provided customer or subscription ids.

## Customer Portal

Premium users should manage billing through Stripe Customer Portal.

Portal actions:
- Update payment method.
- Cancel subscription.
- Resume subscription where supported.
- View invoice history.

Cancellation behavior:
- If cancelled at period end, keep Premium until `current_period_end`.
- After period end, downgrade to `free` unless the user has `admin`, `lifetime`, or `comped` override.

## Admin, Lifetime, Comped

These are backend entitlement overrides, not Stripe subscriptions.

Rules:
- `admin`, `lifetime`, and `comped` bypass payment checks.
- They should not be overwritten by failed Stripe payments.
- Owner/admin accounts must retain full access without paying.

## Vercel Marketplace Notes

When the backend is ready, Stripe can be connected through Vercel Marketplace or directly through Stripe dashboard/API keys. If using Vercel Marketplace, server-side env vars can be provisioned by the integration. The app still needs explicit webhook routes/functions and database persistence.

## Current Status

Current app status:
- Premium explanation screen exists.
- Entitlement bridge exists.
- Checkout is disabled.
- Stripe SDK is not installed.
- No Stripe secrets are stored in the repo.

