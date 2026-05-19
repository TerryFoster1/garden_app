import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GardenCard } from "../../components/GardenCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { GardenHomeModel } from "../../domain";
import { estimateSunExposure } from "../../services";
import { colors, spacing, typography } from "../../theme/tokens";

type PlannerScreenProps = {
  model: GardenHomeModel;
  onOpenGardenSetup: () => void;
};

export function PlannerScreen({ model, onOpenGardenSetup }: PlannerScreenProps) {
  const firstBed = model.beds[0];
  const estimate = estimateSunExposure({
    latitude: model.user.latitude,
    longitude: model.user.longitude,
    dateTime: new Date().toISOString(),
    bed: firstBed,
    obstructions: model.obstructions
  });

  return (
    <View>
      <ScreenHeader
        eyebrow="Sun + weather engine"
        title="Garden Planner"
        subtitle="Plan beds around orientation, shade sources, plant height, weather exposure, and future microclimate zones."
      />

      <PrimaryButton label="Open garden setup" onPress={onOpenGardenSetup} icon={<Ionicons name="compass-outline" size={20} color={colors.white} />} />

      <Text style={styles.sectionTitle}>Bed Map Placeholder</Text>
      {model.beds.map((bed) => (
        <GardenCard key={bed.id} tone={bed.id === "bed-perennial" ? "sky" : "surface"}>
          <Text style={styles.cardTitle}>{bed.name}</Text>
          <Text style={styles.cardText}>{bed.lengthFeet}ft x {bed.widthFeet}ft, north marker {bed.orientationDegreesFromNorth} degrees</Text>
        </GardenCard>
      ))}

      <GardenCard tone="alert">
        <Text style={styles.cardTitle}>{estimate.placementWarnings[0].title}</Text>
        <Text style={styles.cardText}>{estimate.placementWarnings[0].detail}</Text>
        <Text style={styles.cardText}>Estimated sun: morning {estimate.exposure.morning}, midday {estimate.exposure.midday}, afternoon {estimate.exposure.afternoon}.</Text>
      </GardenCard>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: typography.section,
    fontWeight: "900",
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.lg
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  cardText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20
  }
});

