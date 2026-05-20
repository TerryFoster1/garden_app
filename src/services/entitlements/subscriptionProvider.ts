export type AccountState = "free" | "trial" | "premium" | "admin" | "lifetime" | "comped";

export type PremiumFeature =
  | "unlimited-plants"
  | "unlimited-gardens"
  | "ai-plant-diagnosis"
  | "advanced-weather-alerts"
  | "personal-weather-station"
  | "sun-path-planner"
  | "companion-planting-planner"
  | "pest-disease-detection"
  | "harvest-forecasting";

export type SubscriptionLookupInput = {
  userId?: string;
  email?: string;
};

export type SubscriptionStatus = {
  accountState: AccountState;
  provider: "mock" | "stripe" | "none";
  subscriptionId?: string;
  currentPeriodEndsAt?: string;
};

export type UsageSnapshot = {
  gardenCount: number;
  bedOrContainerCount: number;
  plantCount: number;
  photoCount: number;
  aiDiagnosisUsesThisMonth: number;
};

export type PlanLimitKey =
  | "gardens"
  | "beds-or-containers"
  | "plants"
  | "photo-history"
  | "ai-diagnosis-uses";

export type PlanLimit = {
  key: PlanLimitKey;
  label: string;
  freeLimit: number | "limited";
  premiumLimit: "unlimited" | string;
};

export type SubscriptionProvider = {
  getSubscriptionStatus(input: SubscriptionLookupInput): Promise<SubscriptionStatus>;
};

export const premiumFeatures: PremiumFeature[] = [
  "unlimited-plants",
  "unlimited-gardens",
  "ai-plant-diagnosis",
  "advanced-weather-alerts",
  "personal-weather-station",
  "sun-path-planner",
  "companion-planting-planner",
  "pest-disease-detection",
  "harvest-forecasting"
];

export const premiumFeatureLabels: Record<PremiumFeature, string> = {
  "unlimited-plants": "Unlimited plants",
  "unlimited-gardens": "Unlimited gardens",
  "ai-plant-diagnosis": "Advanced AI plant diagnosis",
  "advanced-weather-alerts": "Advanced weather alerts",
  "personal-weather-station": "Personal weather station integration",
  "sun-path-planner": "Sun path planner",
  "companion-planting-planner": "Companion planting planner",
  "pest-disease-detection": "Pest and disease detection",
  "harvest-forecasting": "Harvest forecasting"
};

export const freeTierLimits: PlanLimit[] = [
  { key: "gardens", label: "Gardens", freeLimit: 1, premiumLimit: "unlimited" },
  { key: "beds-or-containers", label: "Beds or containers", freeLimit: 2, premiumLimit: "unlimited" },
  { key: "plants", label: "Plants", freeLimit: 10, premiumLimit: "unlimited" },
  { key: "photo-history", label: "Photo history", freeLimit: "limited", premiumLimit: "expanded" },
  { key: "ai-diagnosis-uses", label: "AI diagnosis uses", freeLimit: "limited", premiumLimit: "expanded monthly allowance" }
];

export const premiumPlan = {
  name: "Pattypan Premium",
  priceUsdMonthly: 3.99,
  checkoutEnabled: false
};
