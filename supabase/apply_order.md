# Supabase Apply Order

Use this order when applying the Pattypan public-beta database draft.

## 1. Confirm App Mode

Before applying SQL, confirm local alpha stays default:

```text
EXPO_PUBLIC_ENABLE_SUPABASE=false
```

Do not enable Supabase in the app yet.

## 2. Run `schema.sql`

In Supabase:

1. Open the project.
2. Go to SQL Editor.
3. Paste `supabase/schema.sql`.
4. Run it.

Expected result:
- Tables are created.
- Indexes are created.
- The current-profile-photo foreign key is guarded so repeated runs do not fail on that constraint.

## 3. Run `rls.sql`

After `schema.sql` succeeds:

1. Paste `supabase/rls.sql`.
2. Run it.

Expected result:
- RLS is enabled.
- Owner-only policies are created for garden data.
- Existing policy names are dropped first so repeated runs can update policies.
- Subscription writes remain server-side only.
- Entitlement overrides remain server-side/admin only.

## 4. Create Private Storage Bucket

In Supabase:

1. Go to Storage.
2. Create bucket `plant-photos`.
3. Set Public bucket to off/private.

Recommended paths:

```text
{user_id}/{plant_instance_id}/{photo_id}.jpg
```

## 5. Add Storage Policies

Use the commented storage policy shape at the bottom of `rls.sql` after the bucket exists.

Policies should allow:
- Authenticated users to read their own path.
- Authenticated users to upload to their own path.
- Authenticated users to delete their own path.
- Service role to read for secure provider proxy and diagnosis flows.

The app should use signed URLs for future photo display instead of public bucket access.

## 6. Test Policies

Before enabling Supabase in Pattypan:

1. Create test user A.
2. Create test user B.
3. Insert a profile/garden/bed/plant as user A.
4. Confirm user A can read/update it.
5. Confirm user B cannot read/update user A data.
6. Confirm user A can read plant species cache.
7. Confirm client cannot write `subscriptions`.
8. Confirm client cannot write `entitlement_overrides`.
9. Upload a test image to `plant-photos/{user_a_id}/...`.
10. Confirm user B cannot read it.

## 7. Only Then Enable Bridge Testing

After schema, RLS, storage, and policy tests pass:

```text
EXPO_PUBLIC_ENABLE_SUPABASE=true
```

This should be done only for bridge testing. Local alpha persistence should remain available until the repository adapter is implemented and verified.

