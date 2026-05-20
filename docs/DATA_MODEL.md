# Data Model

## Core Distinction

Species data is generic. Plant instance data is personal.

Example:

- `PlantSpecies`: Cherry Tomato.
- `PlantInstance`: Cherry tomatoes in Raised Bed 2, planted May 18, watched for trellis shade and Kitchener/Waterloo cold nights.

## Initial Entities

- `PlantIndexRecord`: local searchable seed record for autocomplete. It is not the user's plant; it is lookup/reference data that can later be replaced or enriched by an external plant database.
- `User`: profile, location, hardiness zone.
- `Garden`: a garden collection such as outdoor garden or indoor plants.
- `GardenZone`: logical zone with microclimate notes.
- `GardenBed`: physical bed/container with dimensions, shape, soil, orientation.
- `Obstruction`: shade/wind influence such as fence, house, tree, shed, garage.
- `SunExposureProfile`: morning/midday/afternoon exposure estimate.
- `PlantSpecies`: generic plant knowledge.
- `PlantInstance`: user's specific plant in a location.
- `PlantPhoto`: photo linked to a PlantInstance with purpose such as identify, diagnose, growth log, pest, weed.
- `PlantGrowthSnapshot`: timeline entry created from a photo update, diagnosis, or manual observation.
- `PlantIdentification`: provider/user-confirmed plant ID result.
- `PlantHealthScan`: suspected health issues and recommended next actions.
- `CareTask`: one actionable reminder or protection task.
- `CareSchedule`: generated task plan for a plant instance.
- `WeatherSnapshot`: current or historical weather state.
- `WeatherAlert`: frost, heat, wind, heavy rain, humidity, or storm.
- `NotificationPreference`: user-level notification settings by task type.
- `KnowledgeArticle`: searchable learning content.
- `CompanionPlantRule`: beneficial/avoid/neutral relationship between species.
- `PestDiseaseGuide`: symptoms and safe actions.
- `UserObservation`: notes tied to plants or beds.
- `GrowthLog`: measurements and photos over time.

## Database Direction

Use stable IDs and relational foreign keys. Keep provider payloads as supplemental metadata instead of letting external provider shape become the app's core schema.

## Mobile Local-First Direction

The mobile app should eventually keep a local cache of:

- Gardens, zones, beds, containers, and obstructions.
- Plant species and user plant instances.
- Care tasks and completion status.
- Recent weather snapshots and alerts.
- Plant photos and growth logs.
- Latest profile photo id for each PlantInstance when available.
- User observations.

Queued local mutations should support field use in poor signal:

- Complete task.
- Add plant.
- Move a PlantInstance between beds, containers, and indoor zones.
- Remove a PlantInstance from the user's garden without deleting PlantSpecies knowledge.
- Add photo.
- Add observation.
- Update care task.

The server database can become the durable source of truth later, but the phone should remain useful outdoors when network access is unreliable.

## Current Prototype Persistence

The prototype persists the full mock `GardenHomeModel` in AsyncStorage. This is intentionally simple and replaceable. It gives the app a local-first feel while avoiding premature auth, Postgres, or sync infrastructure.

When a plant is added, moved, or removed:

- `PlantSpecies` remains generic knowledge.
- `PlantInstance` changes location or leaves the user's garden.
- `PlantInstance.nickname` currently acts as PlantDisplayName and can be renamed without changing species.
- Tasks tied to a removed PlantInstance are removed.
- Today, My Garden, Planner, and Plant Detail read from the same local model.

## Missing Fields For Next Version

The next data-model pass should add:

- Location/address entity separate from User.
- IndoorArea and OutdoorArea aliases or typed Garden/GardenZone kinds.
- PlantDisplayName as an explicit field if nickname becomes overloaded.
- Plant placement coordinates inside beds.
- HarvestSchedule and harvest log entries.
- Diagnosis records tied to photos and observations.
- Photo storage provider metadata, upload queue status, privacy controls, and thumbnail variants.
- Explicit PlantPhotoTimeline views for comparing early/current growth.

## Plant Photo System

PlantInstance now supports `currentProfilePhotoId`. The latest uploaded or captured photo becomes the plant's profile image unless a future user action pins a specific photo.

`PlantPhoto` stores URI, timestamp, purpose, optional note, optional diagnosis id, and optional growth stage. It can represent:

- First identification photo.
- Diagnosis photo.
- Weekly growth update.
- Pest or weed observation.

`PlantGrowthSnapshot` records the plant's timeline state around a photo update. In the prototype this is local/mock metadata. Later, it should support AI growth-stage estimation, harvest timing adjustment, health comparison, and seasonal memory.

## Local Plant Index

Add Plant uses a local seed index for autocomplete only. It includes common names, alternate names, scientific names, category, indoor/outdoor habit, light/water/soil basics, spacing, harvest timing, companion hints, common issues, and toxicity warnings where relevant.

The full index should not appear as a browse list in the UI. Users type first, suggestions appear, and unknown plants can be added manually as custom species.

## Subscription Readiness

The data model should later support account states: `free`, `trial`, `premium`, `admin`, `lifetime`, and `comped`. Admin, lifetime, and comped accounts bypass future payment checks. Paywall enforcement is disabled during the personal-use prototype phase.
