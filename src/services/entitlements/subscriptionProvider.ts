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

