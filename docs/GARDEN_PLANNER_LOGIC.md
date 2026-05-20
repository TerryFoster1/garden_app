# Garden Planner Logic

The planner should become a rules-validated spatial system.

## Current Prototype

- Beds are tappable.
- Bed detail shows an overhead visual.
- Plant markers include spacing circles based on mock species rules.
- Basic overcrowding warnings are calculated from bed area and plant spacing.
- Companion suggestions are mocked/rule-like.
- AI Optimize Bed is a scaffold and cannot overwrite the garden.

## Rule Inputs

- Bed dimensions.
- Above-ground/in-ground/container type.
- Plant species spacing.
- Growth stage.
- Trellis/support needs.
- Sun exposure and shade.
- Companion and bad-companion relationships.
- Weather and microclimate context.

## Future Placement Model

Add placement coordinates to PlantInstance:

- `positionXPercent`
- `positionYPercent`
- `spacingRadiusInches`
- `trellisSide`
- `shadeRole`

This enables tap-to-place first, then drag/drop later.

## Recommendation Examples

- This bed is too small for four tomato plants.
- Recommend two tomato plants and basil instead.
- Lettuce may prefer partial shade under taller crops.
- Cucumbers need trellis support.
- This placement may reduce airflow.
- Basil is a good companion for tomatoes.
