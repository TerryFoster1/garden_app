# Spatial Garden UX

My Garden should make the user feel: I know where to go next.

The screen should not behave like a plant inventory or planner. It is an overview and navigation layer.

## Core Idea

Gardening is physical, environmental, visual, seasonal, and alive. The interface should therefore be spatial, environmental, and reactive.

## My Garden Structure

1. Header.
2. Indoor / Outdoor toggle.
3. Outdoor: simple bed cards.
4. Indoor: simple plant cards.

The overview should avoid maps, spacing circles, analytics, ecosystem panels, and management controls.

## Bed Clusters

Each bed card is a doorway, not the full ecosystem.

Bed overview cards should show:

- Bed name.
- Dimensions.
- Concise plant list.
- Small status.
- Tap affordance.

## Bed Detail Owns Spatial Complexity

Overhead layouts, spacing circles, companion notes, move/replant actions, harvest actions, and AI Optimize Bed belong in Bed Detail.

My Garden should not cram the planner into overview. It should help the user pick the bed, then the bed screen can show the real spatial tools.

Future versions can add true drag/drop, trellises, shade cloth, spacing rings, and companion overlays inside Bed Detail or Planner mode.

## Bed / Zone Management

Tapping a bed, planter, container, or indoor zone opens a management surface. This is where the user can:

- View plants in that exact space.
- Add a plant directly to that space.
- Move a plant to another bed/container/indoor zone.
- Remove the personal PlantInstance with confirmation.
- Open a useful plant detail page.

This management surface is still spatial and mobile-first. It should not become a spreadsheet or inventory table.

## Current Interaction Level

The current prototype supports an overhead bed visual, spacing circles, plant taps, bed edits, and add/move/remove flows. It does not yet support true drag/drop or saved within-bed coordinates. The next version should add tap-to-place coordinates before drag/drop.

Update: tap-to-place coordinates now exist on PlantInstance for the prototype. Long-press a plant in bed detail to choose Move within this bed, then tap a new spot and confirm Replant here. Drag/drop remains the next interaction upgrade.

## Garden Ownership

The user should recognize their beds and plants without reading paragraphs. Use names sparingly, but lean on visual grouping, plant glyphs/photos, status rings, and environmental tinting.

## Future Planner Bridge

My Garden is the current-state map. Planner is the future-state simulation.

The same spatial concepts should evolve into:

- Drag/drop placement.
- Sunlight simulation.
- Airflow visualization.
- Companion relationships.
- Overcrowding warnings.
- Trellis/shade impact.
- Seasonal growth stage transitions.
