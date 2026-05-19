export type GardenKind = "indoor" | "outdoor" | "raised-bed" | "containers" | "balcony" | "greenhouse";
export type BedShape = "rectangle" | "square" | "circle" | "l-shape" | "custom";
export type SoilType = "potting-mix" | "raised-bed-mix" | "loam" | "clay" | "sandy" | "compost-rich" | "unknown";
export type SunBand = "full-sun" | "part-sun" | "part-shade" | "shade";
export type PlantLocationType = "in-ground" | "raised-bed" | "container" | "indoor-pot" | "greenhouse";
export type PlantStage = "seed" | "seedling" | "transplant" | "established" | "flowering" | "fruiting";
export type CareTaskType =
  | "watering"
  | "feeding"
  | "pruning"
  | "pest-check"
  | "frost-protection"
  | "wind-protection"
  | "heavy-rain-protection"
  | "heat-stress"
  | "shade"
  | "harvest"
  | "deadheading"
  | "support"
  | "hardening-off";

export type User = {
  id: string;
  name: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  hardinessZone: string;
};

export type Garden = {
  id: string;
  userId: string;
  name: string;
  kind: GardenKind;
  locationLabel: string;
  notes: string;
};

export type GardenZone = {
  id: string;
  gardenId: string;
  name: string;
  sunExposure: SunBand;
  microclimateNotes: string;
};

export type GardenBed = {
  id: string;
  gardenId: string;
  zoneId: string;
  name: string;
  shape: BedShape;
  lengthFeet: number;
  widthFeet: number;
  depthInches?: number;
  soilType: SoilType;
  locationType: PlantLocationType;
  orientationDegreesFromNorth: number;
};

export type Obstruction = {
  id: string;
  gardenId: string;
  label: string;
  type: "fence" | "house" | "tree" | "shed" | "garage" | "other";
  approximateHeightFeet: number;
  directionFromBed: "north" | "east" | "south" | "west" | "northeast" | "southeast" | "southwest" | "northwest";
  notes: string;
};

export type SunExposureProfile = {
  id: string;
  bedId: string;
  morning: SunBand;
  midday: SunBand;
  afternoon: SunBand;
  estimatedDailySunHours: number;
  confidence: "low" | "medium" | "high";
};

export type PlantSpecies = {
  id: string;
  commonName: string;
  scientificName?: string;
  family: string;
  careSummary: string;
  preferredSun: SunBand[];
  waterNeeds: "low" | "moderate" | "high";
  feedingNeeds: "light" | "moderate" | "heavy";
  frostSensitive: boolean;
  harvestWindow?: string;
  companionNotes?: string;
};

export type PlantInstance = {
  id: string;
  speciesId: string;
  gardenId: string;
  bedId?: string;
  nickname: string;
  locationLabel: string;
  locationType: PlantLocationType;
  stage?: PlantStage;
  plantedOn?: string;
  source: "seed" | "transplant" | "division" | "houseplant" | "unknown";
  healthStatus: "thriving" | "watch" | "stressed" | "dormant";
  notes: string;
};

export type PlantPhoto = {
  id: string;
  plantInstanceId?: string;
  uri: string;
  takenAt: string;
  purpose: "identify" | "diagnose" | "growth-log" | "pest" | "weed";
};

export type PlantIdentification = {
  id: string;
  photoId: string;
  suggestedSpeciesId?: string;
  confidence: number;
  provider: string;
  userConfirmed: boolean;
};

export type PlantHealthScan = {
  id: string;
  plantInstanceId?: string;
  photoId: string;
  suspectedIssues: string[];
  recommendationSummary: string;
  requiresRuleValidation: boolean;
};

export type CareTask = {
  id: string;
  plantInstanceId?: string;
  gardenBedId?: string;
  type: CareTaskType;
  title: string;
  dueAt: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "scheduled" | "done" | "skipped" | "needs-confirmation";
  reason: string;
};

export type CareSchedule = {
  id: string;
  plantInstanceId: string;
  ruleSetVersion: string;
  tasks: CareTask[];
};

export type WeatherSnapshot = {
  id: string;
  locationLabel: string;
  capturedAt: string;
  temperatureC: number;
  humidityPercent: number;
  windKph: number;
  rainfallMm24h: number;
  uvIndex: number;
  frostRisk: "none" | "low" | "moderate" | "high";
};

export type WeatherAlert = {
  id: string;
  type: "frost" | "heat" | "wind" | "heavy-rain" | "humidity" | "storm";
  title: string;
  severity: "watch" | "warning" | "urgent";
  startsAt: string;
  summary: string;
};

export type NotificationPreference = {
  id: string;
  userId: string;
  taskType: CareTaskType;
  enabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
};

export type KnowledgeArticle = {
  id: string;
  title: string;
  category: "plant-care" | "pests" | "disease" | "soil" | "weather" | "planning";
  summary: string;
  relatedSpeciesIds: string[];
};

export type CompanionPlantRule = {
  id: string;
  speciesId: string;
  companionSpeciesId: string;
  effect: "beneficial" | "avoid" | "neutral";
  rationale: string;
};

export type PestDiseaseGuide = {
  id: string;
  name: string;
  type: "pest" | "disease" | "mold" | "nutrient" | "weed";
  symptoms: string[];
  safeActions: string[];
};

export type UserObservation = {
  id: string;
  plantInstanceId?: string;
  gardenBedId?: string;
  observedAt: string;
  note: string;
  tags: string[];
};

export type GrowthLog = {
  id: string;
  plantInstanceId: string;
  recordedAt: string;
  heightInches?: number;
  spreadInches?: number;
  note: string;
  photoIds: string[];
};

export type GardenHomeModel = {
  user: User;
  gardens: Garden[];
  zones: GardenZone[];
  beds: GardenBed[];
  obstructions: Obstruction[];
  sunProfiles: SunExposureProfile[];
  species: PlantSpecies[];
  plantInstances: PlantInstance[];
  tasks: CareTask[];
  weather: WeatherSnapshot;
  weatherAlerts: WeatherAlert[];
  articles: KnowledgeArticle[];
};
