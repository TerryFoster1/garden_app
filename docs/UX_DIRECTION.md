# UX Direction

Garden App should answer: what matters right now in my garden?

It should not behave like a database browser. The app is a mobile field companion for decisions, scans, alerts, and quick garden care.

## Product Feel

- A living garden companion.
- A calm AI garden assistant.
- A practical field tool.
- A weather-aware plant coach.
- A visual planning experience.

Avoid anything that feels like a CRUD admin panel, SaaS dashboard, spreadsheet, or generic card stack.

## Core UX Priorities

1. Open notification.
2. Check Today.
3. Mark task complete.
4. Scan plant or problem.
5. Add plant.
6. View weather/garden alerts.
7. Check bed status visually.
8. Search plant knowledge only when needed.

## Hierarchy Rule

Every screen should have one dominant answer. If everything has equal visual weight, the screen has failed.

Use this order:

1. Current context.
2. Primary action.
3. Urgent tasks.
4. Visual status.
5. Supporting details.

## Progressive Disclosure

Show the reason only when it helps the user decide. Use short "Why" affordances, expandable explanations, and task-specific details instead of long always-visible paragraphs.

## Visual Language

The app can feel environmental without becoming decorative. Use weather state, light, moisture, plant health, urgency, and seasonal context as the visual system.

## Spatial Ownership

The garden is not a list of records. My Garden should be a living map where beds, pots, indoor zones, and plant clusters are recognized visually. The user should understand where plants are and what needs attention before reading details.

## My Garden Direction

Replace generic lists with bed clusters, mini maps, plant status rings, environmental overlays, and selected ecosystem panels. Details should appear after the user taps into a bed or plant.

## Live Management Loop

The primary ownership flow is:

My Garden -> Indoor or Outdoor -> bed, planter, container, or indoor zone -> manage plants inside -> plant detail.

This flow must stay touch-first and fast. Plants are not dead records: tapping one should open useful care information, current tasks, recent activity, and location context. Bed and zone surfaces should allow adding, moving, and removing PlantInstances without editing generic species knowledge.

## Planner Direction Now

Planner is interactive even before drag/drop exists. Tapping a bed opens management, plant dots show where living items are, and spacing/sun warnings can be mocked while the future rules engine is built. The next step is true placement coordinates and drag/drop movement inside a bed.
