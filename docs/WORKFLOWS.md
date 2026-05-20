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

1. Continue locally or create an account later.
2. Allow location or enter address.
3. App pulls weather/climate context automatically.
4. Choose Add a Plant or Create a Garden.

Do not ask users to manually enter climate data unless automatic lookup fails.

## Add A Plant First

1. Ask Indoor or Outdoor once.
2. Offer Take Photo, Search by Name, or Manual Entry.
3. Use a real plant ID provider when configured; otherwise use mock fallback.
4. Show possible matches with confidence and let the user confirm, edit, or reject.
5. Ask only for missing context: stage, area/bed/container, optional display name.
6. Save a PlantInstance.
7. Generate care tasks, harvest estimate if edible, and future photo reminder.

## Create A Garden First

1. New or existing garden.
2. Indoor or Outdoor.
3. Add bed, planter, container, room, or zone.
4. Above-ground or in-ground.
5. Dimensions.
6. Optional sun, compass/orientation, shade, and soil.
7. Show overhead visual.
8. Add plants, add another bed, use AI Plan My Garden, or save.

## Add Plants To A Bed

From bed detail, Add Plant should preserve the selected bed context. The plant appears in the overhead layout with spacing circles. Tap-to-place is acceptable for the next version; drag/drop can follow after coordinates are added to PlantInstance.

Long-press plant actions:

- Harvest: confirm “Harvest and remove this plant from the bed?” and remove the PlantInstance.
- Move: choose Move within this bed or Move to another bed.
- Move within this bed: tap a new position and confirm “Replant here?”.
- Move to another bed: choose a destination bed/zone.
- Rename and Details open plant detail.
- Remove deletes only the PlantInstance.

## Plant Detail

Plant detail must combine generic species knowledge with personal instance state. It supports rename display name, mark watered, log harvest, move, remove, scan/photo update, and future diagnosis.

## Command Center

Home is the command center: weather, urgent tasks, quick actions, care/harvest schedule, My Garden shortcut, and diagnose/Library paths.
