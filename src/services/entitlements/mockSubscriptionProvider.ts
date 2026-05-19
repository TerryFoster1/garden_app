import { SubscriptionLookupInput, SubscriptionProvider, SubscriptionStatus } from "./subscriptionProvider";

export type MockSubscriptionProviderOptions = {
  adminEmails?: string[];
  defaultState?: SubscriptionStatus["accountState"];
};

export function createMockSubscriptionProvider(options: MockSubscriptionProviderOptions = {}): SubscriptionProvider {
  const adminEmails = new Set((options.adminEmails ?? []).map((email) => email.trim().toLowerCase()).filter(Boolean));

  return {
    async getSubscriptionStatus(input: SubscriptionLookupInput): Promise<SubscriptionStatus> {
      const email = input.email?.trim().toLowerCase();

      if (email && adminEmails.has(email)) {
        return {
          accountState: "admin",
          provider: "mock"
        };
      }

      return {
        accountState: options.defaultState ?? "free",
        provider: "mock"
      };
    }
  };
}

export const mockSubscriptionProvider = createMockSubscriptionProvider();

