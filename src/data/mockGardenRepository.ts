import {
  CareTask,
  Garden,
  GardenBed,
  GardenHomeModel,
  GardenZone,
  KnowledgeArticle,
  Obstruction,
  PlantInstance,
  PlantSpecies,
  SunExposureProfile,
  User,
  WeatherAlert,
  WeatherSnapshot
} from "../domain";

const user: User = {
  id: "user-kitchener",
  name: "Kathryn",
  locationLabel: "Kitchener/Waterloo, Ontario",
  latitude: 43.4516,
  longitude: -80.4925,
  hardinessZone: "Zone 6a"
};

const gardens: Garden[] = [
  {
    id: "garden-home",
    userId: user.id,
    name: "Home Garden",
    kind: "outdoor",
    locationLabel: "Kitchener/Waterloo backyard",
    notes: "Four raised beds plus one perennial bed, with mixed vegetables, herbs, flowers, and indoor plants."
  },
  {
    id: "garden-indoor",
    userId: user.id,
    name: "Indoor Plants",
    kind: "indoor",
    locationLabel: "Bright indoor shelves and windows",
    notes: "Houseplants and succulents tracked separately from outdoor weather tasks."
  }
];

const zones: GardenZone[] = [
  { id: "zone-raised-beds", gardenId: "garden-home", name: "Raised Bed Row", sunExposure: "full-sun", microclimateNotes: "Open exposure with afternoon heat." },
  { id: "zone-perennial", gardenId: "garden-home", name: "Perennial Bed", sunExposure: "part-sun", microclimateNotes: "Some shade from nearby structures later in the day." },
  { id: "zone-indoor", gardenId: "garden-indoor", name: "Indoor Bright Spots", sunExposure: "part-sun", microclimateNotes: "Window light varies by season." }
];

const beds: GardenBed[] = [
  { id: "bed-1", gardenId: "garden-home", zoneId: "zone-raised-beds", name: "Raised Bed 1", shape: "rectangle", lengthFeet: 5, widthFeet: 2, depthInches: 12, soilType: "raised-bed-mix", locationType: "raised-bed", orientationDegreesFromNorth: 12 },
  { id: "bed-2", gardenId: "garden-home", zoneId: "zone-raised-beds", name: "Raised Bed 2", shape: "rectangle", lengthFeet: 5, widthFeet: 2, depthInches: 12, soilType: "raised-bed-mix", locationType: "raised-bed", orientationDegreesFromNorth: 12 },
  { id: "bed-3", gardenId: "garden-home", zoneId: "zone-raised-beds", name: "Raised Bed 3", shape: "rectangle", lengthFeet: 5, widthFeet: 2, depthInches: 12, soilType: "raised-bed-mix", locationType: "raised-bed", orientationDegreesFromNorth: 12 },
  { id: "bed-4", gardenId: "garden-home", zoneId: "zone-raised-beds", name: "Raised Bed 4", shape: "rectangle", lengthFeet: 5, widthFeet: 2, depthInches: 12, soilType: "raised-bed-mix", locationType: "raised-bed", orientationDegreesFromNorth: 12 },
  { id: "bed-perennial", gardenId: "garden-home", zoneId: "zone-perennial", name: "Perennial Bed", shape: "rectangle", lengthFeet: 5, widthFeet: 4, soilType: "loam", locationType: "in-ground", orientationDegreesFromNorth: 85 }
];

const obstructions: Obstruction[] = [
  { id: "obs-fence", gardenId: "garden-home", label: "Back fence", type: "fence", approximateHeightFeet: 6, directionFromBed: "west", notes: "Potential late afternoon shade." },
  { id: "obs-house", gardenId: "garden-home", label: "House wall", type: "house", approximateHeightFeet: 18, directionFromBed: "east", notes: "Morning shade near the perennial bed." }
];

const sunProfiles: SunExposureProfile[] = beds.map((bed, index) => ({
  id: `sun-${bed.id}`,
  bedId: bed.id,
  morning: index === 4 ? "part-shade" : "full-sun",
  midday: "full-sun",
  afternoon: index === 4 ? "part-sun" : "full-sun",
  estimatedDailySunHours: index === 4 ? 5.5 : 7.5,
  confidence: "medium"
}));

const species: PlantSpecies[] = [
  { id: "species-pepper", commonName: "Pepper", family: "Solanaceae", careSummary: "Warm-season fruiting plant that likes steady moisture and heat.", preferredSun: ["full-sun"], waterNeeds: "moderate", feedingNeeds: "moderate", frostSensitive: true, harvestWindow: "Late summer" },
  { id: "species-cherry-tomato", commonName: "Cherry Tomato", family: "Solanaceae", careSummary: "Heavy-feeding vine that needs sun, support, and consistent watering.", preferredSun: ["full-sun"], waterNeeds: "high", feedingNeeds: "heavy", frostSensitive: true, harvestWindow: "Mid to late summer", companionNotes: "Pairs well with basil and marigolds." },
  { id: "species-basil", commonName: "Basil", family: "Lamiaceae", careSummary: "Tender annual herb; pinch often and avoid cold nights.", preferredSun: ["full-sun", "part-sun"], waterNeeds: "moderate", feedingNeeds: "light", frostSensitive: true },
  { id: "species-marigold", commonName: "Marigold", family: "Asteraceae", careSummary: "Hardy annual flower often used near vegetables for pollinator and pest-support roles.", preferredSun: ["full-sun"], waterNeeds: "moderate", feedingNeeds: "light", frostSensitive: true },
  { id: "species-cucumber", commonName: "Cucumber", family: "Cucurbitaceae", careSummary: "Fast-growing vine that prefers warmth, consistent water, and airflow.", preferredSun: ["full-sun"], waterNeeds: "high", feedingNeeds: "moderate", frostSensitive: true, harvestWindow: "Summer" },
  { id: "species-lettuce", commonName: "Lettuce", family: "Asteraceae", careSummary: "Cool-season leafy crop that appreciates protection from heat.", preferredSun: ["part-sun", "part-shade"], waterNeeds: "moderate", feedingNeeds: "light", frostSensitive: false, harvestWindow: "Spring and fall" },
  { id: "species-strawberry", commonName: "Strawberry", family: "Rosaceae", careSummary: "Perennial fruiting plant that likes sun, mulch, and even moisture.", preferredSun: ["full-sun"], waterNeeds: "moderate", feedingNeeds: "moderate", frostSensitive: false, harvestWindow: "Early summer" },
  { id: "species-succulent", commonName: "Echeveria-type Succulent", family: "Crassulaceae", careSummary: "Rosette succulent; bright light and dry-down between waterings.", preferredSun: ["part-sun"], waterNeeds: "low", feedingNeeds: "light", frostSensitive: true },
  { id: "species-snake-plant", commonName: "Snake Plant", family: "Asparagaceae", careSummary: "Low-maintenance indoor plant that tolerates lower light and infrequent watering.", preferredSun: ["part-shade", "shade"], waterNeeds: "low", feedingNeeds: "light", frostSensitive: true },
  { id: "species-hibiscus", commonName: "Hibiscus", family: "Malvaceae", careSummary: "Flowering plant that likes bright light and steady moisture.", preferredSun: ["full-sun", "part-sun"], waterNeeds: "high", feedingNeeds: "moderate", frostSensitive: true },
  { id: "species-brussels-sprouts", commonName: "Brussels Sprouts", family: "Brassicaceae", careSummary: "Long-season brassica that prefers cool weather, steady fertility, and pest checks.", preferredSun: ["full-sun"], waterNeeds: "moderate", feedingNeeds: "heavy", frostSensitive: false, harvestWindow: "Fall" },
  { id: "species-garlic", commonName: "Garlic", family: "Amaryllidaceae", careSummary: "Overwintered bulb crop that needs good drainage and steady spring growth.", preferredSun: ["full-sun"], waterNeeds: "moderate", feedingNeeds: "moderate", frostSensitive: false, harvestWindow: "Mid summer" },
  { id: "species-onion", commonName: "Onion", family: "Amaryllidaceae", careSummary: "Bulbing crop that likes sun, weed control, and consistent moisture.", preferredSun: ["full-sun"], waterNeeds: "moderate", feedingNeeds: "moderate", frostSensitive: false, harvestWindow: "Summer" },
  { id: "species-shallot", commonName: "Shallot", family: "Amaryllidaceae", careSummary: "Allium crop similar to onion, usually grown in clusters.", preferredSun: ["full-sun"], waterNeeds: "moderate", feedingNeeds: "moderate", frostSensitive: false, harvestWindow: "Summer" },
  { id: "species-asparagus", commonName: "Asparagus", family: "Asparagaceae", careSummary: "Perennial vegetable that needs a permanent bed and patient establishment.", preferredSun: ["full-sun"], waterNeeds: "moderate", feedingNeeds: "moderate", frostSensitive: false, harvestWindow: "Spring" },
  { id: "species-chives", commonName: "Chives", family: "Amaryllidaceae", careSummary: "Hardy perennial herb with edible leaves and pollinator-friendly flowers.", preferredSun: ["full-sun", "part-sun"], waterNeeds: "moderate", feedingNeeds: "light", frostSensitive: false },
  { id: "species-rosemary", commonName: "Rosemary", family: "Lamiaceae", careSummary: "Woody herb that prefers bright light, drainage, and restrained watering.", preferredSun: ["full-sun"], waterNeeds: "low", feedingNeeds: "light", frostSensitive: true },
  { id: "species-thyme", commonName: "Thyme", family: "Lamiaceae", careSummary: "Low-growing herb that likes sun, drainage, and dry-down.", preferredSun: ["full-sun"], waterNeeds: "low", feedingNeeds: "light", frostSensitive: false },
  { id: "species-parsley", commonName: "Parsley", family: "Apiaceae", careSummary: "Biennial herb that prefers even moisture and can tolerate part sun.", preferredSun: ["full-sun", "part-sun"], waterNeeds: "moderate", feedingNeeds: "light", frostSensitive: false },
  { id: "species-begonia", commonName: "Begonia", family: "Begoniaceae", careSummary: "Flowering plant that prefers bright indirect light or part shade and careful watering.", preferredSun: ["part-shade"], waterNeeds: "moderate", feedingNeeds: "light", frostSensitive: true },
  { id: "species-lily", commonName: "Lily", family: "Liliaceae", careSummary: "Perennial flowering bulb that likes sun on foliage and cool, well-drained soil.", preferredSun: ["full-sun", "part-sun"], waterNeeds: "moderate", feedingNeeds: "light", frostSensitive: false },
  { id: "species-parlor-palm", commonName: "Parlor Palm", family: "Arecaceae", careSummary: "Indoor palm that tolerates medium light and prefers even but not soggy moisture.", preferredSun: ["part-shade", "shade"], waterNeeds: "moderate", feedingNeeds: "light", frostSensitive: true },
  { id: "species-haworthia", commonName: "Haworthia Succulent", family: "Asphodelaceae", careSummary: "Compact succulent for bright indirect light and sparse watering.", preferredSun: ["part-sun", "part-shade"], waterNeeds: "low", feedingNeeds: "light", frostSensitive: true }
];

const plantInstances: PlantInstance[] = [
  { id: "plant-tomato-bed-2", speciesId: "species-cherry-tomato", gardenId: "garden-home", bedId: "bed-2", nickname: "Cherry tomatoes in Bed 2", locationLabel: "Raised Bed 2, back row", locationType: "raised-bed", plantedOn: "2026-05-18", source: "transplant", healthStatus: "thriving", notes: "Needs trellis check before rapid growth." },
  { id: "plant-peppers-bed-1", speciesId: "species-pepper", gardenId: "garden-home", bedId: "bed-1", nickname: "Peppers in Bed 1", locationLabel: "Raised Bed 1", locationType: "raised-bed", plantedOn: "2026-05-18", source: "transplant", healthStatus: "watch", notes: "Watch cold nights in Kitchener/Waterloo." },
  { id: "plant-cucumbers-bed-3", speciesId: "species-cucumber", gardenId: "garden-home", bedId: "bed-3", nickname: "Cucumbers on trellis", locationLabel: "Raised Bed 3", locationType: "raised-bed", source: "seed", healthStatus: "thriving", notes: "Keep airflow and consistent water." },
  { id: "plant-lettuce-bed-4", speciesId: "species-lettuce", gardenId: "garden-home", bedId: "bed-4", nickname: "Lettuce patch", locationLabel: "Raised Bed 4, shadier edge", locationType: "raised-bed", source: "seed", healthStatus: "thriving", notes: "Needs heat protection later." },
  { id: "plant-basil-bed-2", speciesId: "species-basil", gardenId: "garden-home", bedId: "bed-2", nickname: "Basil beside tomatoes", locationLabel: "Raised Bed 2", locationType: "raised-bed", source: "transplant", healthStatus: "thriving", notes: "Pinch once established." },
  { id: "plant-marigolds-bed-2", speciesId: "species-marigold", gardenId: "garden-home", bedId: "bed-2", nickname: "Marigolds with tomatoes", locationLabel: "Raised Bed 2 edges", locationType: "raised-bed", source: "transplant", healthStatus: "thriving", notes: "Pollinator and companion planting support." },
  { id: "plant-brussels-bed-4", speciesId: "species-brussels-sprouts", gardenId: "garden-home", bedId: "bed-4", nickname: "Brussels sprouts starts", locationLabel: "Raised Bed 4", locationType: "raised-bed", source: "transplant", healthStatus: "watch", notes: "Schedule pest checks for brassica pressure." },
  { id: "plant-garlic-bed-1", speciesId: "species-garlic", gardenId: "garden-home", bedId: "bed-1", nickname: "Garlic row", locationLabel: "Raised Bed 1 edge", locationType: "raised-bed", source: "seed", healthStatus: "thriving", notes: "Track yellowing and harvest timing." },
  { id: "plant-onions-bed-1", speciesId: "species-onion", gardenId: "garden-home", bedId: "bed-1", nickname: "Onions", locationLabel: "Raised Bed 1", locationType: "raised-bed", source: "transplant", healthStatus: "thriving", notes: "Keep weed pressure low." },
  { id: "plant-shallots-bed-1", speciesId: "species-shallot", gardenId: "garden-home", bedId: "bed-1", nickname: "Shallots", locationLabel: "Raised Bed 1", locationType: "raised-bed", source: "transplant", healthStatus: "thriving", notes: "Watch moisture and bulb development." },
  { id: "plant-asparagus-perennial", speciesId: "species-asparagus", gardenId: "garden-home", bedId: "bed-perennial", nickname: "Asparagus crowns", locationLabel: "Perennial Bed", locationType: "in-ground", source: "division", healthStatus: "thriving", notes: "Permanent planting; avoid disturbing roots." },
  { id: "plant-chives-perennial", speciesId: "species-chives", gardenId: "garden-home", bedId: "bed-perennial", nickname: "Chives clump", locationLabel: "Perennial Bed", locationType: "in-ground", source: "division", healthStatus: "thriving", notes: "Can harvest lightly once established." },
  { id: "plant-strawberries-perennial", speciesId: "species-strawberry", gardenId: "garden-home", bedId: "bed-perennial", nickname: "Strawberries in perennial bed", locationLabel: "Perennial Bed", locationType: "in-ground", source: "transplant", healthStatus: "thriving", notes: "Mulch after soil warms." },
  { id: "plant-lilies-perennial", speciesId: "species-lily", gardenId: "garden-home", bedId: "bed-perennial", nickname: "Lilies", locationLabel: "Perennial Bed", locationType: "in-ground", source: "division", healthStatus: "thriving", notes: "Track flowering and deadheading." },
  { id: "plant-begonias-container", speciesId: "species-begonia", gardenId: "garden-home", nickname: "Begonias", locationLabel: "Part-shade containers", locationType: "container", source: "transplant", healthStatus: "thriving", notes: "Avoid soggy soil and harsh afternoon sun." },
  { id: "plant-rosemary-container", speciesId: "species-rosemary", gardenId: "garden-home", nickname: "Rosemary", locationLabel: "Sunny herb container", locationType: "container", source: "transplant", healthStatus: "watch", notes: "Do not overwater." },
  { id: "plant-thyme-container", speciesId: "species-thyme", gardenId: "garden-home", nickname: "Thyme", locationLabel: "Sunny herb container", locationType: "container", source: "transplant", healthStatus: "thriving", notes: "Prefers dry-down." },
  { id: "plant-parsley-container", speciesId: "species-parsley", gardenId: "garden-home", nickname: "Parsley", locationLabel: "Herb container", locationType: "container", source: "transplant", healthStatus: "thriving", notes: "Keep evenly moist." },
  { id: "plant-snake-indoor", speciesId: "species-snake-plant", gardenId: "garden-indoor", nickname: "Snake plant", locationLabel: "Indoor shelf", locationType: "indoor-pot", source: "houseplant", healthStatus: "thriving", notes: "Water only when dry." },
  { id: "plant-parlor-palm-indoor", speciesId: "species-parlor-palm", gardenId: "garden-indoor", nickname: "Parlor palm", locationLabel: "Indoor medium-light corner", locationType: "indoor-pot", source: "houseplant", healthStatus: "thriving", notes: "Keep away from cold drafts." },
  { id: "plant-haworthia-indoor", speciesId: "species-haworthia", gardenId: "garden-indoor", nickname: "Haworthia succulent", locationLabel: "Bright indoor shelf", locationType: "indoor-pot", source: "houseplant", healthStatus: "thriving", notes: "Sparse watering; watch for overwatering." },
  { id: "plant-echeveria-indoor", speciesId: "species-succulent", gardenId: "garden-indoor", nickname: "Echeveria-type succulent", locationLabel: "Sunny window", locationType: "indoor-pot", source: "houseplant", healthStatus: "watch", notes: "Check for stretching toward light." },
  { id: "plant-hibiscus-container", speciesId: "species-hibiscus", gardenId: "garden-home", nickname: "Hibiscus container", locationLabel: "Patio container", locationType: "container", source: "transplant", healthStatus: "thriving", notes: "Protect from cold wind." }
];

const tasks: CareTask[] = [
  { id: "task-water-raised-beds", gardenBedId: "bed-2", type: "watering", title: "Check raised bed moisture", dueAt: "2026-05-19T18:00:00-04:00", priority: "normal", status: "scheduled", reason: "No meaningful rain logged in the last 24 hours." },
  { id: "task-pepper-frost", plantInstanceId: "plant-peppers-bed-1", type: "frost-protection", title: "Watch peppers for cold-night stress", dueAt: "2026-05-19T20:00:00-04:00", priority: "high", status: "needs-confirmation", reason: "Tender transplant; rules engine requires confirmation before scheduling cover tasks." },
  { id: "task-tomato-support", plantInstanceId: "plant-tomato-bed-2", type: "support", title: "Install or inspect tomato support", dueAt: "2026-05-20T10:00:00-04:00", priority: "normal", status: "scheduled", reason: "Cherry tomatoes can shade basil and lettuce once growth accelerates." },
  { id: "task-basil-prune", plantInstanceId: "plant-basil-bed-2", type: "pruning", title: "Pinch basil tips after establishment", dueAt: "2026-05-24T10:00:00-04:00", priority: "low", status: "scheduled", reason: "Encourages branching and delays flowering." }
];

const weather: WeatherSnapshot = {
  id: "weather-today",
  locationLabel: "Kitchener/Waterloo, Ontario",
  capturedAt: "2026-05-19T09:00:00-04:00",
  temperatureC: 18,
  humidityPercent: 64,
  windKph: 17,
  rainfallMm24h: 1.2,
  uvIndex: 6,
  frostRisk: "low"
};

const weatherAlerts: WeatherAlert[] = [
  { id: "alert-wind", type: "wind", title: "Breezy afternoon", severity: "watch", startsAt: "2026-05-19T14:00:00-04:00", summary: "Check tender transplants and tall containers." },
  { id: "alert-uv", type: "heat", title: "High UV for new starts", severity: "watch", startsAt: "2026-05-19T12:00:00-04:00", summary: "Harden off young plants gradually before full-day exposure." }
];

const articles: KnowledgeArticle[] = [
  { id: "article-hardening-off", title: "Hardening off transplants", category: "plant-care", summary: "Move seedlings outdoors gradually so wind, sun, and temperature shifts do not shock them.", relatedSpeciesIds: ["species-pepper", "species-cherry-tomato", "species-basil"] },
  { id: "article-mildew-risk", title: "Humidity and mildew risk", category: "disease", summary: "Warm, humid, low-airflow conditions can increase mildew pressure on dense plantings.", relatedSpeciesIds: ["species-cucumber", "species-strawberry"] },
  { id: "article-raised-bed-watering", title: "Raised bed watering rhythm", category: "weather", summary: "Raised beds drain quickly; rainfall, heat, wind, and mulch should adjust the schedule.", relatedSpeciesIds: [] }
];

export const mockGardenRepository = {
  getHomeModel(): GardenHomeModel {
    return {
      user,
      gardens,
      zones,
      beds,
      obstructions,
      sunProfiles,
      species,
      plantInstances,
      tasks,
      weather,
      weatherAlerts,
      articles
    };
  }
};
