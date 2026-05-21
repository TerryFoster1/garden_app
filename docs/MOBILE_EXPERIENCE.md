# Mobile Experience

Pattypan is mobile-first with a polished web companion at Pattypan.ca. It is designed first for iPhone and Android, and the phone remains the primary interaction model.

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

## Pattypan.ca Desktop Companion

Desktop web should not stretch the phone UI into a dashboard. On wide screens, center the app in a portrait mobile container and use ambient side space for brand, QR/download placeholders, and gentle best-on-mobile guidance.

Desktop users can continue in browser, but the app should make mobile feel naturally better for:

- Taking plant photos.
- Diagnosing issues outdoors.
- Receiving notifications.
- Completing quick garden tasks one-handed.
- Updating growth photos in the garden.

The exception is the unauthenticated landing page. Landing should be immersive and full-bleed on both mobile and desktop, using botanical photography as the primary experience rather than putting the landing screen inside a phone mockup.

## Navigation Philosophy

Primary bottom navigation:

1. Home.
2. My Garden.
3. Library.
4. Profile.

Home is the operational hub. My Garden is the spatial management experience. Library supports search, diagnosis, and learning. Profile contains account, location, notifications, provider status, and future subscription settings.

Scan is still important, but it belongs in Add Plant and Library diagnose flows instead of bottom nav. Planner belongs in My Garden and Bed Detail instead of bottom nav.

## Home Restraint

Home should be usable as a fast morning/outdoor glance on a Samsung S23-class phone. It should not contain duplicate garden management, schedule management, harvest management, or Library actions.

The mobile Home structure is:

1. Atmospheric weather and conditions hero.
2. Today's action checklist with Done, Later, and Why.
3. One strong Add Plant CTA.

This leaves the thumb path clear and keeps the fixed bottom nav from competing with redundant action grids.

## Landing Mobile Feel

The landing page should be strongest on a phone in portrait orientation. Pattypan, Your Heirloom Secret, and the auth controls should sit within the safe area, remain readable over photography, and avoid crowded edges on Samsung S23-class screens.

The first impression should be calm and emotional: warm garden light, real plants, soil, greenhouse atmosphere, and a restrained set of actions. Avoid decorative blobs, abstract geometry, and oversized synthetic buttons.

## Interaction Size

Primary actions should be thumb-friendly and obvious. Camera actions, task completion, and alert acknowledgement should be usable without precision tapping.

## Spatial Mobile Surfaces

Mobile garden surfaces should reveal complexity progressively. My Garden is simple navigation. Bed Detail is spatial management. Plant Detail is care intelligence and memory.

The overview should not show every interaction at once. If the user needs spacing, moving, harvesting, companion warnings, or AI optimization, they should tap a bed first.

## Plant Detail Mobile Check-In

Plant Detail should work as a one-handed garden check-in. The user should immediately see the latest photo, the current condition, and the next action before any reference content appears.

The mobile order is photo hero, compact action rail, current tasks, photo timeline, tiny activity, then collapsed reference sections. This keeps the screen useful outdoors and prevents Plant Detail from becoming a scrolling wiki page.

## Indoor / Outdoor Model

My Garden is organized around Outdoor and Indoor ownership.

Outdoor includes raised beds, perennial beds, planters, and containers. Indoor includes rooms, shelves, windows, and indoor plant groups. The user should never wonder where a plant lives: every PlantInstance carries a garden/location label and can be moved to another bed, container, or indoor zone.

Indoor overview uses plant cards only. Indoor plants are photo/name/status objects, not bed maps. Outdoor overview uses bed cards only. The bed detail screen owns overhead layout and plant placement.

## Back Behavior

Android hardware and gesture back should follow the user's spatial path:

bed or zone manager -> plant detail -> back to bed or zone manager -> back to My Garden.

At tab roots, default platform behavior can take over. Inside overlay flows, the app should intercept back so the user does not accidentally lose context while standing outdoors.

## Add Flow Context

When Add Plant starts from a bed/container/zone, the selected location should stay attached to the flow. The user should not have to answer indoor/outdoor again unless they intentionally move the plant to another location.

Android back should step backward through Add Plant before leaving the flow.

Bed Detail supports long-press plant actions. Move within bed currently uses tap-to-place as the interim mobile interaction; future drag/drop should build on saved plant coordinates.
