# Data Model

## Core Distinction

Species data is generic. Plant instance data is personal.

Example:

- `PlantSpecies`: Cherry Tomato.
- `PlantInstance`: Cherry tomatoes in Raised Bed 2, planted May 18, watched for trellis shade and Kitchener/Waterloo cold nights.

## Initial Entities

- `User`: profile, location, hardiness zone.
- `Garden`: a garden collection such as outdoor garden or indoor plants.
- `GardenZone`: logical zone with microclimate notes.
- `GardenBed`: physical bed/container with dimensions, shape, soil, orientation.
- `Obstruction`: shade/wind influence such as fence, house, tree, shed, garage.
- `SunExposureProfile`: morning/midday/afternoon exposure estimate.
- `PlantSpecies`: generic plant knowledge.
- `PlantInstance`: user's specific plant in a location.
- `PlantPhoto`: photo with purpose such as identify, diagnose, growth log, pest, weed.
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

