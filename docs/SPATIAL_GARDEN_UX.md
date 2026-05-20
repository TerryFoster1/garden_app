# Spatial Garden UX

My Garden should make the user feel: I am looking at my garden.

The screen should not behave like a plant inventory. It should behave like a living spatial surface that helps the user recognize beds, containers, indoor zones, and plant relationships quickly.

## Core Idea

Gardening is physical, environmental, visual, seasonal, and alive. The interface should therefore be spatial, environmental, and reactive.

## My Garden Structure

1. Garden identity hero.
2. Primary actions for adding plants and mapping beds.
3. Zone switching: outdoor beds, pots/containers, indoor.
4. Mini bed maps.
5. Selected ecosystem panel.
6. Plant clusters and status rings.
7. Bed/zone management for add, move, remove, and plant detail.

## Bed Clusters

Each bed should feel like a small ecosystem, not a record.

Bed surfaces should show:

- Plant arrangement.
- Environmental state.
- Health/watch overlays.
- Sun, moisture, shade, heat, or humidity cues.
- Tap affordance.

## Mini Maps

Mini maps are intentionally low fidelity at first. They should establish visual recognition:

- This is Bed 1.
- These are the plant clusters.
- This bed is warm/dry/watch/steady.
- This is where attention belongs.

Future versions can add true placement, drag/drop, trellises, shade cloth, spacing rings, and companion overlays.

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
