import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { PrimaryButton } from "../../components/PrimaryButton";
import { premiumFeatureLabels, premiumFeatures, premiumPlan, type AccountState } from "../../services/entitlements/subscriptionProvider";
import { colors, radii, spacing, typography } from "../../theme/tokens";

type PremiumExplanationScreenProps = {
  accountState: AccountState;
  bypassesPayment: boolean;
  paywallEnabled: boolean;
  onBack: () => void;
};

export function PremiumExplanationScreen({ accountState, bypassesPayment, paywallEnabled, onBack }: PremiumExplanationScreenProps) {
  const statusCopy = bypassesPayment
    ? "Owner/admin, lifetime, and comped accounts keep full access without paying."
    : paywallEnabled
      ? "Billing gates are enabled, but checkout still requires backend auth before it can safely launch."
      : "Paywall is disabled during alpha. This screen documents the future premium model only.";

  return (
    <View style={styles.screen}>
      <PrimaryButton label="Back to Profile" onPress={onBack} tone="quiet" icon={<Ionicons name="chevron-back" size={20} color={colors.leafDeep} />} />

      <View style={styles.hero}>
        <View style={styles.badge}>
          <Ionicons name="sparkles-outline" size={28} color={colors.leafDeep} />
        </View>
        <Text style={styles.eyebrow}>Subscription preview</Text>
        <Text style={styles.title}>{premiumPlan.name}</Text>
        <Text style={styles.price}>${premiumPlan.priceUsdMonthly.toFixed(2)} / month</Text>
        <Text style={styles.copy}>{statusCopy}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current account</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>State</Text>
          <Text style={styles.statusValue}>{accountState}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Checkout</Text>
          <Text style={styles.statusValue}>{premiumPlan.checkoutEnabled ? "enabled" : "not launched"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium will include</Text>
        {premiumFeatures.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.leafDeep} />
            <Text style={styles.featureText}>{premiumFeatureLabels[feature]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.notice}>
        <Ionicons name="shield-checkmark-outline" size={22} color={colors.leafDeep} />
        <Text style={styles.noticeText}>Stripe checkout, customer portal, and webhooks must be added only after real server-side users and secure API proxy routes exist.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg
  },
  hero: {
    borderRadius: 32,
    backgroundColor: colors.leafDeep,
    padding: spacing.xl,
    gap: spacing.sm
  },
  badge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  eyebrow: {
    color: colors.sage,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 38
  },
  price: {
    color: colors.sun,
    fontSize: typography.title,
    fontWeight: "900"
  },
  copy: {
    color: "rgba(255,255,255,0.78)",
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: "800"
  },
  section: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  statusRow: {
    minHeight: 44,
    borderRadius: 16,
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  statusLabel: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "800"
  },
  statusValue: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  featureRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  featureText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800"
  },
  notice: {
    borderRadius: 24,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md
  },
  noticeText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: "800"
  }
});
