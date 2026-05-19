import { AccountState, PremiumFeature, SubscriptionProvider, SubscriptionStatus, premiumFeatures } from "./subscriptionProvider";

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

