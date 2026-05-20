# Pattypan Product Bible

App name: Pattypan.

Tagline: Your Heirloom Secret.

## Product Promise

Pattypan is a personalized garden operating system. It helps people understand what is growing, where it is growing, what it needs today, and what weather or seasonal pressure might change the plan.

It is not only a watering reminder app. The long-term product combines plant identification, garden mapping, weather-aware care, sun/shade planning, photo-based diagnosis, and deterministic care rules that keep AI suggestions from directly controlling a user's schedule.

This is a mobile-first product for iPhone and Android. Pattypan.ca also hosts the web version, but desktop should feel like a polished companion experience, not the primary product model.

The app's core question is: what matters right now in my garden?

Home should answer that question narrowly. It should show weather/conditions, urgent warnings, today's action checklist, and one Add Plant CTA. It should not duplicate My Garden, Planner, Library, Profile, harvest management, detailed schedules, or bed management.

The My Garden experience should make ownership clear without becoming the full management layer. It is the overview and navigation surface: choose Outdoor or Indoor, then choose a bed or plant. Bed Detail owns spatial management. Plant Detail owns intelligence, care, and photo memory.

The photo system is core to the emotional product. A plant should become recognizable as the user's plant over time: latest photo as profile image, older photos as growth history, diagnosis photos as part of memory, and weekly updates as the garden's living timeline.

Plant Detail should not behave like a wiki page. It is the status page for one living PlantInstance: latest photo, current condition, urgent tasks, quick actions, and photo memory first. Species-level education belongs behind collapsed sections or in Library.

## Core User Jobs

- Identify a plant, pest, disease, mold, weed, or stress signal from a photo.
- Add plants manually, by scan, or by autocomplete search.
- Track personal plant instances in real garden locations.
- Plan beds, containers, balconies, indoor shelves, and greenhouse spaces.
- Understand sun path, shade sources, microclimates, and plant placement tradeoffs.
- Receive calm, useful notifications for watering, feeding, pruning, frost, wind, rain, heat, humidity, harvest, pest checks, hardening off, support, and shade.
- Learn enough to make better garden decisions without feeling buried in expert jargon.
- Complete quick actions outdoors with large tap targets and minimal typing.
- Keep working gracefully when signal is weak or unavailable.

## Product Principles

- Camera first: scanning should be one tap away.
- Photo memory first: every PlantInstance should be able to accumulate its own visual growth history.
- Today first: the daily task list should be useful before the user opens deeper screens.
- Action first: prioritize what the user should do, not the full database of garden facts.
- Restraint first on Home: if a section does not affect the immediate outdoor decision, move it elsewhere.
- Visual first: garden beds, plant status, weather, and alerts should be understood at a glance.
- Spatial first: plants belong somewhere, and the interface should show that relationship.
- Progressive disclosure first: overview before management, management before intelligence.
- Personalized over generic: model "Cherry tomatoes in Bed 2," not only "Tomato."
- Search before browsing: Add Plant should feel like autocomplete over a useful plant index, not a giant encyclopedia list.
- Weather-aware by default: care should react to rain, frost, wind, humidity, heat, and UV.
- AI recommends, rules validate, user confirms when risk is meaningful.
- Calm is a feature: notifications should feel practical and respectful.
- Outdoor readability matters: screens must be glanceable in sunlight.
- Field usage matters: task completion and observations should work locally first where possible.

## Primary Navigation

1. Home
2. My Garden
3. Library
4. Profile

Scan lives inside Add Plant and Library diagnose/search workflows. PlantNet provides real photo identification when configured, but Pattypan must always show possible matches and require user confirmation. Planner lives inside My Garden, Bed Detail, Add/Edit Bed, and AI Optimize Bed workflows.

Provider-backed intelligence is now part of the product feel:

- PlantNet identifies possible plant matches from photos.
- OpenWeather turns weather into garden actions.
- OpenAI powers Ask Pattypan, topic help, diagnosis explanations, and AI Optimize Bed.

All provider-backed intelligence must fail gracefully into local rules or useful fallback copy.

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

On desktop Pattypan.ca, keep the app centered and phone-like. Add subtle messaging that the experience is best on mobile for photos, notifications, and outdoor workflows, while still allowing browser use.

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

Plant detail information is seeded locally but should feel practical: water, light, feeding, soil, spacing, companions, bad companions, pests/diseases, natural controls, seed/transplant notes, pruning/harvest notes, toxicity warnings, current tasks, and recent activity. Photo identification is provider-backed through PlantNet when configured, with local fallback for development/offline failure.

That information should be progressively disclosed. Plant Detail should surface the plant's status and actions first, then let the user expand deeper care or reference sections only when needed.

## Operating System Correction

Garden App is not a plant tracker. It is a living digital twin of the user's real garden environment. The product should help users build, plan, manage, diagnose, harvest, and operate that environment.

The core objects are environment-first: location, indoor area, outdoor area, garden, bed, planter, container, species, plant instance, display name, photo, task, harvest schedule, weather context, diagnosis, and knowledge.

The app should avoid duplicate indoor/outdoor questions. Once a workflow has selected indoor or outdoor, later steps should preserve that context unless the user intentionally changes it.

Normal startup should feel like a real first-use product, not a demo. Fake Kitchener/Waterloo beds and plants must not appear unless the user chooses Load Demo Garden.

## Seed Workflow Direction

Adding a plant asks for lifecycle stage: Seed, Seedling, Young plant, or Mature plant. Seed starts should eventually branch into a Grow From Seed workflow with sow date, germination estimate, seed tray location, light setup, hardening off, transplant timing, and local weather/frost validation.

## Landing / Auth Entry

The first-open entry is a premium Pattypan landing screen with botanical garden styling, app name, tagline, Sign up, Sign in, and Learn more. Until auth exists, Sign up and Sign in enter local prototype mode.

## Pattypan.ca

Pattypan.ca hosts the responsive web version. Desktop users should see an intentional brand companion layout with QR/download placeholders and a Continue in Browser path. The browser should support core workflows, but the product should naturally encourage iOS/Android use for field work.
