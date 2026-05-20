# Mobile Experience

Garden App is mobile-only. It is designed for iPhone and Android, not desktop web.

## Field Conditions

Users may be standing outside, wearing gloves, holding tools, dealing with glare, or moving quickly between beds.

Design for:

- Portrait orientation.
- One-handed use.
- Large tap targets.
- Outdoor readability.
- Minimal typing.
- Bottom navigation.
- Camera-first flows.
- Offline-first task interaction.

Avoid:

- Dense tables.
- Sidebar navigation.
- Tiny controls.
- Long forms.
- Desktop dashboard composition.
- Equal-priority card stacks.

## Navigation Philosophy

Primary bottom navigation:

1. Today.
2. Scan.
3. My Garden.
4. Planner.
5. Knowledge.

Today is the operational hub. Scan is the identity-defining action. My Garden is the visual overview. Planner is the strategy tool. Knowledge supports context from tasks, scans, alerts, and plant pages.

## Interaction Size

Primary actions should be thumb-friendly and obvious. Camera actions, task completion, and alert acknowledgement should be usable without precision tapping.

## Spatial Mobile Surfaces

Mobile garden surfaces should use compact visual maps instead of long lists. A bed preview, plant cluster, or status ring should carry more weight than repeated metadata. Tapping a visual surface should reveal details progressively.

## Indoor / Outdoor Model

My Garden is organized around Outdoor and Indoor ownership.

Outdoor includes raised beds, perennial beds, planters, and containers. Indoor includes rooms, shelves, windows, and indoor plant groups. The user should never wonder where a plant lives: every PlantInstance carries a garden/location label and can be moved to another bed, container, or indoor zone.

## Back Behavior

Android hardware and gesture back should follow the user's spatial path:

bed or zone manager -> plant detail -> back to bed or zone manager -> back to My Garden.

At tab roots, default platform behavior can take over. Inside overlay flows, the app should intercept back so the user does not accidentally lose context while standing outdoors.

## Add Flow Context

When Add Plant starts from a bed/container/zone, the selected location should stay attached to the flow. The user should not have to answer indoor/outdoor again unless they intentionally move the plant to another location.

Android back should step backward through Add Plant before leaving the flow.
