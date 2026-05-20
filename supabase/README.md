# Pattypan Supabase Setup

This folder contains the first public-beta database draft for Pattypan.

Important:
- Local alpha remains the default app mode.
- `EXPO_PUBLIC_ENABLE_SUPABASE=false` should stay off until auth and sync are tested.
- These SQL files do not migrate local app data.
- Do not paste `.env.local` values into SQL or commit secrets.

## Files

- `schema.sql`: creates public-beta tables and indexes.
- `rls.sql`: enables Row Level Security and creates owner-only policies.
- `apply_order.md`: exact application order and smoke-test notes.

## Apply Summary

1. Run `schema.sql` in the Supabase SQL editor.
2. Run `rls.sql` in the Supabase SQL editor.
3. Create a private Storage bucket named `plant-photos`.
4. Add storage object policies for user-owned paths.
5. Test policies with at least two users before enabling app sync.

## Storage Bucket

Create bucket:
- Name: `plant-photos`
- Public: off/private

Recommended object path:

```text
{user_id}/{plant_instance_id}/{photo_id}.jpg
```

Public beta should use signed URLs for temporary photo display. The bucket should not be made public.

