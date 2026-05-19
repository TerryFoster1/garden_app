# Garden App Product Bible

## Product Promise

Garden App is a personalized garden operating system. It helps people understand what is growing, where it is growing, what it needs today, and what weather or seasonal pressure might change the plan.

It is not only a watering reminder app. The long-term product combines plant identification, garden mapping, weather-aware care, sun/shade planning, photo-based diagnosis, and deterministic care rules that keep AI suggestions from directly controlling a user's schedule.

This is a mobile-only product for iPhone and Android. Web support is allowed only as temporary testing/preview convenience.

The app's core question is: what matters right now in my garden?

The My Garden experience should make the product identity tangible: a living, visual map of the user's own beds, containers, indoor plants, and microclimates.

## Core User Jobs

- Identify a plant, pest, disease, mold, weed, or stress signal from a photo.
- Add plants manually or by scan.
- Track personal plant instances in real garden locations.
- Plan beds, containers, balconies, indoor shelves, and greenhouse spaces.
- Understand sun path, shade sources, microclimates, and plant placement tradeoffs.
- Receive calm, useful notifications for watering, feeding, pruning, frost, wind, rain, heat, humidity, harvest, pest checks, hardening off, support, and shade.
- Learn enough to make better garden decisions without feeling buried in expert jargon.
- Complete quick actions outdoors with large tap targets and minimal typing.
- Keep working gracefully when signal is weak or unavailable.

## Product Principles

- Camera first: scanning should be one tap away.
- Today first: the daily task list should be useful before the user opens deeper screens.
- Action first: prioritize what the user should do, not the full database of garden facts.
- Visual first: garden beds, plant status, weather, and alerts should be understood at a glance.
- Spatial first: plants belong somewhere, and the interface should show that relationship.
- Personalized over generic: model "Cherry tomatoes in Bed 2," not only "Tomato."
- Weather-aware by default: care should react to rain, frost, wind, humidity, heat, and UV.
- AI recommends, rules validate, user confirms when risk is meaningful.
- Calm is a feature: notifications should feel practical and respectful.
- Outdoor readability matters: screens must be glanceable in sunlight.
- Field usage matters: task completion and observations should work locally first where possible.

## Primary Navigation

1. Today / Tasks
2. Scan
3. My Garden
4. Planner
5. Knowledge

## Most-Used Actions

1. Open notification.
2. Mark task complete.
3. Scan plant or problem.
4. Add plant.
5. Check Today dashboard.
6. View weather and garden alerts.

## UX Constraints

Prioritize portrait orientation, bottom navigation, touch targets, large buttons/cards, quick scan flows, and one-handed use. Avoid desktop admin aesthetics, dense tables, tiny controls, excessive menus, and keyboard-heavy workflows.

Avoid endless equal-priority cards. Use aggressive hierarchy, progressive disclosure, and large interactive surfaces.

## Initial User Context

The foundation mock data is centered on Kitchener/Waterloo, Ontario. It includes four 2ft x 5ft raised beds and one 5ft x 4ft perennial bed, with outdoor vegetables, herbs, flowers, perennial crops, houseplants, and succulents.

## Current Live Prototype Loop

The current prototype now supports the first real garden-management loop:

- Scan or manually add a plant.
- Confirm or edit the possible match.
- Choose Indoor or Outdoor, then the exact bed/container/zone.
- Save a PlantInstance to that location.
- See it immediately in My Garden and Planner.
- Tap it for useful plant detail.
- Move it to another location or remove it from the personal garden.

Plant detail information is mocked but should feel practical: water, light, feeding, soil, spacing, companions, bad companions, pests/diseases, natural controls, seed/transplant notes, pruning/harvest notes, toxicity warnings, current tasks, and recent activity.
