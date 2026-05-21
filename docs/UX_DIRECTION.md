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

The garden is not a list of records, but the overview should still stay calm. My Garden should help the user recognize Outdoor vs Indoor, then choose a bed or plant. Spatial detail appears after that choice.

## My Garden Direction

My Garden is now an overview and navigation layer, not the management layer.

The top-level hierarchy is intentionally simple:

1. Choose Outdoor or Indoor.
2. Outdoor shows bed cards only.
3. Indoor shows plant cards only.
4. Tap into a bed or plant for detailed work.

Planning visuals, spacing rings, movement, companion logic, and optimization belong in Bed Detail. Diagnosis, photo history, care intelligence, harvest timing, and notes belong in Plant Detail.

## Live Management Loop

The primary ownership flow is progressive disclosure:

My Garden -> Indoor or Outdoor -> bed, planter, container, or indoor zone -> manage plants inside -> plant detail.

This flow must stay touch-first and fast. Plants are not dead records: tapping one should open useful care information, current tasks, recent activity, and location context. Bed and zone surfaces should allow adding, moving, and removing PlantInstances without editing generic species knowledge.

## Planner Direction Now

Planner is interactive even before drag/drop exists. Tapping a bed opens management, plant dots show where living items are, and spacing/sun warnings can be mocked while the future rules engine is built. The next step is true placement coordinates and drag/drop movement inside a bed.

## Home Direction

Home is not a dashboard and not the whole app. It is an operational overview for the next few minutes: atmospheric weather context, urgent warnings, today's actionable checklist, and one strong Add Plant CTA.

Schedules, garden management, harvesting, diagnosis, detailed bed state, and planning belong in My Garden or Library. Home should stay calm by showing only what affects the user's immediate outdoor decision.

## Landing Art Direction

Pattypan's entry experience should no longer feel like an abstract app prototype. The landing page is the emotional first impression: image-first, botanical, cinematic, seasonal, and premium.

Use real garden photography and soft overlays instead of blob shapes or developer-generated decoration. The composition should feel like a quiet garden journal cover: sunlight through leaves, tomatoes, herbs, greenhouse depth, soil, squash, and seasonal growth.

The authentication structure can stay simple, but the first landing state should be immersive. Sign up, sign in, and learn more should float over the image with restrained, tactile controls. Desktop should show the same intentional atmospheric composition, not a fake mobile mockup.

## Navigation Cleanup

Bottom nav is Home, My Garden, Library, Profile. Scan and Planner are not primary destinations. They are workflow actions inside Add Plant, Library, Bed Detail, Add/Edit Bed, and AI Optimize Bed.

## Display Name Rule

Users can rename a PlantInstance without changing PlantSpecies. "Tomato Holland" can still be a Cherry Tomato under the hood.

## Plant Detail Direction

Plant Detail is a living status page, not a plant encyclopedia. Its first job is to answer: how is this specific plant doing right now?

The hierarchy is:

1. Latest plant photo, display name, species, stage, health state, and harvest countdown when relevant.
2. Immediate actions: Watered, Diagnose, Update Photo, Harvest, Move, Rename, and Remove.
3. Current actionable tasks with short reasons behind a Why interaction.
4. Photo growth timeline and tiny recent activity events.
5. Collapsed knowledge sections for care, companions, pest/disease watch, propagation, seed/transplant, pruning/harvest, and full guide links.

Deep education should move outward to Library. Plant Detail can link to it, but it should not permanently expose every care fact, companion note, pest, propagation note, and activity record at once.
