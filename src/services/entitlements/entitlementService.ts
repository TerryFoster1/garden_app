import { AccountState, PremiumFeature, SubscriptionProvider, SubscriptionStatus, UsageSnapshot, premiumFeatures } from "./subscriptionProvider";

export type EntitlementConfig = {
  paywallEnabled: boolean;
  adminEmails: string[];
};

export type FeatureEntitlement = {
  feature: PremiumFeature;
  available: boolean;
  reason: string;
};

export type EntitlementResult = {
  accountState: AccountState;
  paywallEnabled: boolean;
  bypassesPayment: boolean;
  features: FeatureEntitlement[];
};

export type UsageGateResult = {
  key: keyof UsageSnapshot;
  allowed: boolean;
  current: number;
  limit: number | "limited" | "unlimited";
  reason: string;
};

const bypassStates: AccountState[] = ["admin", "lifetime", "comped"];
const paidStates: AccountState[] = ["trial", "premium", "admin", "lifetime", "comped"];

export function parseEntitlementConfig(input: { paywallEnabled?: string; adminEmails?: string }): EntitlementConfig {
  return {
    paywallEnabled: input.paywallEnabled === "true",
    adminEmails: (input.adminEmails ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  };
}

export function userBypassesPayment(email: string | undefined, status: SubscriptionStatus, config: EntitlementConfig): boolean {
  const normalizedEmail = email?.trim().toLowerCase();

  return bypassStates.includes(status.accountState) || Boolean(normalizedEmail && config.adminEmails.includes(normalizedEmail));
}

export async function getEntitlements(
  provider: SubscriptionProvider,
  input: {
    userId?: string;
    email?: string;
    config: EntitlementConfig;
  }
): Promise<EntitlementResult> {
  const status = await provider.getSubscriptionStatus({ userId: input.userId, email: input.email });
  const bypassesPayment = userBypassesPayment(input.email, status, input.config);
  const hasPaidAccess = paidStates.includes(status.accountState) || bypassesPayment;
  const allFeaturesAvailable = !input.config.paywallEnabled || hasPaidAccess;

  return {
    accountState: bypassesPayment && status.accountState === "free" ? "admin" : status.accountState,
    paywallEnabled: input.config.paywallEnabled,
    bypassesPayment,
    features: premiumFeatures.map((feature) => ({
      feature,
      available: allFeaturesAvailable,
      reason: allFeaturesAvailable ? "Available in the current personal-use phase." : "Future premium feature."
    }))
  };
}

export function canUseFeature(entitlements: EntitlementResult, feature: PremiumFeature): boolean {
  return entitlements.features.find((item) => item.feature === feature)?.available ?? false;
}

export function getBridgeEntitlements(input: { email?: string; accountState?: AccountState; config?: Partial<EntitlementConfig> }): EntitlementResult {
  const config: EntitlementConfig = {
    paywallEnabled: input.config?.paywallEnabled ?? false,
    adminEmails: input.config?.adminEmails ?? []
  };
  const status: SubscriptionStatus = {
    accountState: input.accountState ?? "free",
    provider: "none"
  };
  const bypassesPayment = userBypassesPayment(input.email, status, config);
  const hasPaidAccess = paidStates.includes(status.accountState) || bypassesPayment;
  const allFeaturesAvailable = !config.paywallEnabled || hasPaidAccess;

  return {
    accountState: bypassesPayment && status.accountState === "free" ? "admin" : status.accountState,
    paywallEnabled: config.paywallEnabled,
    bypassesPayment,
    features: premiumFeatures.map((feature) => ({
      feature,
      available: allFeaturesAvailable,
      reason: allFeaturesAvailable ? "Available in the current alpha bridge." : "Premium feature once backend billing is live."
    }))
  };
}

export function getUsageGates(usage: UsageSnapshot, entitlements: EntitlementResult): UsageGateResult[] {
  const hasPremiumAccess = ["trial", "premium", "admin", "lifetime", "comped"].includes(entitlements.accountState) || entitlements.bypassesPayment;
  const premiumLimit = hasPremiumAccess ? "unlimited" : undefined;

  return [
    buildUsageGate("gardenCount", usage.gardenCount, premiumLimit ?? 1, "Free tier supports 1 garden."),
    buildUsageGate("bedOrContainerCount", usage.bedOrContainerCount, premiumLimit ?? 2, "Free tier supports up to 2 beds or containers."),
    buildUsageGate("plantCount", usage.plantCount, premiumLimit ?? 10, "Free tier supports up to 10 plants."),
    buildUsageGate("photoCount", usage.photoCount, premiumLimit ?? "limited", "Free tier keeps limited photo history."),
    buildUsageGate("aiDiagnosisUsesThisMonth", usage.aiDiagnosisUsesThisMonth, premiumLimit ?? "limited", "Free tier includes limited AI diagnosis use.")
  ];
}

function buildUsageGate(key: keyof UsageSnapshot, current: number, limit: number | "limited" | "unlimited", reason: string): UsageGateResult {
  return {
    key,
    current,
    limit,
    allowed: limit === "unlimited" || limit === "limited" || current <= limit,
    reason
  };
}
