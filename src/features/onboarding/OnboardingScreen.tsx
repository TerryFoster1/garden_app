import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GardenCard } from "../../components/GardenCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { colors, spacing, typography } from "../../theme/tokens";

type OnboardingScreenProps = {
  onComplete: () => void;
  onStartGarden: () => void;
};

const steps = [
  "Location for weather, frost, climate, and sun path",
  "First garden type: indoor, outdoor, raised bed, containers, balcony, greenhouse",
  "Dimensions, shape, soil, and bed/container type",
  "Compass orientation or manual north marker",
  "Shade sources: fence, house, tree, shed, garage, other",
  "First plant by scan, search, seed, or transplant",
  "Generate the first care schedule and Today dashboard"
];

export function OnboardingScreen({ onComplete, onStartGarden }: OnboardingScreenProps) {
  return (
    <View>
      <ScreenHeader eyebrow="Welcome" title="Your garden, mapped and managed." subtitle="A calm operating system for daily care, weather decisions, photos, and plant knowledge." />

      <GardenCard tone="warm">
        <Ionicons name="location-outline" size={28} color={colors.leafDeep} />
        <Text style={styles.cardTitle}>Personalized to your place</Text>
        <Text style={styles.cardText}>The app will request location, camera, notifications, and compass permissions when the real device integrations are connected.</Text>
      </GardenCard>

      {steps.map((step, index) => (
        <GardenCard key={step}>
          <Text style={styles.stepNumber}>Step {index + 1}</Text>
          <Text style={styles.cardTitle}>{step}</Text>
        </GardenCard>
      ))}

      <View style={styles.actions}>
        <PrimaryButton label="Setup first garden" onPress={onStartGarden} />
        <PrimaryButton label="Use mock garden" onPress={onComplete} tone="quiet" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  cardText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20
  },
  stepNumber: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  actions: {
    gap: spacing.sm
  }
});

