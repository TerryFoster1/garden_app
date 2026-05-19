# Notification Rules

## Safety Pattern

AI identifies or recommends. The rules engine validates. The user confirms when a task could affect plant health, safety, or schedule trust.

Flow:

1. User scans, searches, logs an observation, or receives weather data.
2. AI/provider suggests a care action.
3. Deterministic rules validate the suggestion against weather, species, plant instance, season, and user preferences.
4. Low-risk tasks can be scheduled.
5. Riskier tasks require user confirmation.

## Placeholder Rules

- Skip watering after meaningful rain.
- Increase watering checks during heat or drought.
- Alert for frost protection.
- Alert for wind protection.
- Warn before heavy rain.
- Avoid fertilizing before heavy rain.
- Warn for humidity and mildew risk.
- Remind for pruning.
- Remind for fertilizing.
- Remind for harvest.
- Remind for deadheading.
- Remind for support or trellis installation.
- Remind for pest checks.
- Remind for hardening off transplants.

## Notification Tone

Good: "Cover tender peppers tonight if the forecast drops again."

Avoid: "Critical intervention required."

Notifications should be brief, contextual, and easy to act on from a phone.

## Mobile Notification Model

The most common entry point should be a phone notification that opens the user into a fast task flow:

1. Open notification.
2. See the task in Today.
3. Mark complete, skip, snooze, or scan the plant/problem.
4. Queue the action locally if offline.
5. Sync later when the device is online.

Notifications should be designed for outdoor use: short titles, clear action verbs, and no dense explanation.
