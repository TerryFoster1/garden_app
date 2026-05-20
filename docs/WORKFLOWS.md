# Workflows

Pattypan is a mobile garden operating system. It should be organized around live workflows, not generic app sections.

## Bottom Navigation

Final bottom nav:

1. Home
2. My Garden
3. Library
4. Profile

Scan is invoked from Add Plant and Library diagnose/search. Planner is invoked from My Garden, Bed Detail, Add/Edit Bed, and AI Optimize Bed.

## First Setup

1. Land on Pattypan.
2. Sign up or sign in with local prototype email/password forms.
3. Enter or confirm display name.
4. Enter a full enough location for weather; OpenWeather geocoding must resolve coordinates before it is saved.
5. Choose notification categories for morning brief, watering, weather warnings, weekly photo updates, and harvest reminders.
6. Choose Add Plant, Create Garden, or Load Demo Garden.

Do not ask users to manually enter climate data unless automatic lookup fails.

Local auth is device-only and prototype-grade. Production must replace it with server-side auth before public beta.

## Add A Plant First

1. Ask Indoor or Outdoor once.
2. Offer Take Photo, Search by Name, or Manual Entry.
3. Use autocomplete search backed by the local plant index when typing.
4. Use PlantNet when configured; otherwise use local fallback guidance.
5. Show multiple possible matches with confidence percentages and require the user to choose one before continuing.
6. Ask only for missing context: stage, area/bed/container, optional display name.
7. Save a PlantInstance.
8. Generate care tasks, harvest estimate if edible, and future photo reminder.

If no growing space exists yet, Add Plant prompts the user to create a bed/container instead of silently placing the plant in fake demo data.

The full plant database should never be shown as a giant list. Users type first, see suggestions, select one, or choose Add manually for custom/unknown plants.

Photo identification should never auto-confirm a plant identity. PlantNet can suggest, but the user confirms, edits, rejects, or switches to manual search before a PlantInstance is created.

Lifecycle stage choices are Seed, Seedling, Young plant, and Mature plant. Seed creates basic germination and transplant timing tasks. Future Grow From Seed should add seed trays, sowing dates, indoor light, germination windows, hardening off, and weather-aware transplant recommendations.

## Create A Garden First

1. New or existing garden.
2. Indoor or Outdoor.
3. Add bed, planter, container, room, or zone.
4. Above-ground or in-ground.
5. Dimensions with explicit Length, Width, and Depth/height units.
6. Optional manual sun exposure. Compass/orientation and shade mapping are moved behind Map Sun Exposure so they do not look clickable before they work.
7. Show overhead visual.
8. Add plants, add another bed, use AI Plan My Garden, or save.

## Add Plants To A Bed

From bed detail, Add Plant should preserve the selected bed context. The plant appears in the overhead layout with spacing circles. Move mode is explicit: long-press plant, choose Move, then tap a new location and confirm. True drag/drop can follow after gesture handling is hardened.

Long-press plant actions:

- Harvest: confirm “Harvest and remove this plant from the bed?” and remove the PlantInstance.
- Move: choose Move within this bed or Move to another bed.
- Move within this bed: tap a new position and confirm “Replant here?”.
- Move to another bed: choose a destination bed/zone.
- Rename and Details open plant detail.
- Remove deletes only the PlantInstance.

## Plant Detail

Plant detail must combine generic species knowledge with personal instance state. It supports rename display name, mark watered, log harvest, move, remove, scan/photo update, and future diagnosis.

Latest uploaded photo becomes the plant hero/profile image. Older photos appear in the photo timeline. Weekly photo updates should eventually help estimate growth stage, adjust harvest timing, and detect stress changes.

## Photo Update

1. Open a PlantInstance.
2. Take a new photo or pick from library.
3. Store the photo against that exact PlantInstance.
4. Make the newest photo the profile image.
5. Add a growth snapshot to the timeline.

Diagnosis photos should eventually attach to a diagnosis record and remain visible in plant history. The provider boundary can call PlantNet disease diagnosis when configured, then fall back to local guidance if the API is unavailable.

## Diagnosis Flow

1. Take or upload a photo.
2. Link a known plant if available, or leave unlinked.
3. Choose symptoms such as yellow leaves, spots, wilting, pest damage, or mildew/mold.
4. PlantNet identifies the plant/issue where possible.
5. OpenAI explains likely causes, confidence, urgency, next actions, and prevention tips.
6. Save the diagnosis to the PlantInstance photo history when linked.
7. Create a follow-up task for the next day so treatment is confirmed rather than automatic.

## My Garden Overview

My Garden is only overview and navigation.

1. Choose Outdoor or Indoor.
2. Outdoor shows bed cards only.
3. Indoor shows plant cards only.
4. Tap a bed for Bed Detail or tap a plant for Plant Detail.

Do not place planner controls, spacing visualization, move/remove actions, or ecosystem analytics in this overview.

## Bed Detail Management

Bed Detail is the management layer. It can contain overhead layout, spacing visualization, move plants, harvest plants, add plants, AI Optimize Bed, companion notes, diagnosis entry, sunlight/shade details, and future drag/drop.

AI Optimize Bed now uses OpenAI when configured. It reviews bed dimensions, current plants, sun profile, spacing, airflow, and companion context. If OpenAI is unavailable, local planning rules still return overcrowding warnings and placement suggestions.

Bed Detail must not pretend to know unmapped conditions. If sun exposure is missing, show Sun: Not mapped yet and offer Map Sun Exposure. If moisture data is missing, show Check manually or Sensor off.

## Command Center

Home is the command center for weather and immediate actions only. Detailed schedules, harvest, diagnosis, garden management, and planning live in My Garden or Library.

Home uses OpenWeather when configured. Pattypan converts weather into garden actions: frost cover, skip watering after rain, heat stress checks, wind support, and mildew risk from humidity.

## Library Intelligence

Library supports search, topic browsing, photo diagnosis entry, and Ask Pattypan. Topics are Pests & Bugs, Diseases, Plant Care, Propagation, and Growing From Seed. Topic screens should answer useful questions without becoming giant static article lists.

## Pattypan.ca Web

Desktop visitors see the same app in a centered mobile container with an ambient brand panel, best-on-mobile messaging, QR placeholder, and future App Store / Google Play placeholders. They can continue in browser without being blocked.
