import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GardenCard } from "../../components/GardenCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { GardenHomeModel } from "../../domain";
import { colors, spacing, typography } from "../../theme/tokens";

type MyGardenScreenProps = {
  model: GardenHomeModel;
  onAddPlant: () => void;
  onOpenGardenSetup: () => void;
  onOpenPlant: () => void;
};

export function MyGardenScreen({ model, onAddPlant, onOpenGardenSetup, onOpenPlant }: MyGardenScreenProps) {
  return (
    <View>
      <ScreenHeader
        eyebrow="Personal garden"
        title="My Garden"
        subtitle="Species are general knowledge. Plant instances are your living plants in real beds, pots, and microclimates."
      />

      <View style={styles.actions}>
        <PrimaryButton label="Add plant" onPress={onAddPlant} icon={<Ionicons name="add" size={20} color={colors.white} />} style={styles.actionButton} />
        <PrimaryButton label="Setup garden" onPress={onOpenGardenSetup} tone="quiet" style={styles.actionButton} />
      </View>

      <Text style={styles.sectionTitle}>Beds and Containers</Text>
      {model.beds.map((bed) => (
        <GardenCard key={bed.id} tone="warm">
          <Text style={styles.cardTitle}>{bed.name}</Text>
          <Text style={styles.cardText}>{bed.lengthFeet}ft x {bed.widthFeet}ft, {bed.soilType.replaceAll("-", " ")}, {bed.locationType.replaceAll("-", " ")}</Text>
        </GardenCard>
      ))}

      <Text style={styles.sectionTitle}>Plants</Text>
      {model.plantInstances.map((plant) => {
        const species = model.species.find((item) => item.id === plant.speciesId);
        return (
          <TouchableOpacity key={plant.id} accessibilityRole="button" onPress={onOpenPlant}>
            <GardenCard>
              <Text style={styles.cardTitle}>{plant.nickname}</Text>
              <Text style={styles.cardText}>{species?.commonName} in {plant.locationLabel}</Text>
              <Text style={styles.health}>{plant.healthStatus}</Text>
            </GardenCard>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  actionButton: {
    flex: 1
  },
  sectionTitle: {
    fontSize: typography.section,
    fontWeight: "900",
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md
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
  },
  health: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  }
});

