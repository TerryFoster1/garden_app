import { DimensionValue, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GardenHomeModel } from "../../domain";
import { estimateSunExposure } from "../../services";
import { getBedPlanningSummary, getPlantPlanMetrics } from "../../services/gardenPlanningRules";
import { getPlantKnowledge } from "../../data/plantKnowledge";
import { colors, radii, spacing, typography } from "../../theme/tokens";
import { GardenPlacement } from "../my-garden/LocationManagementScreen";

type PlannerScreenProps = {
  model: GardenHomeModel;
  onOpenGardenSetup: () => void;
  onOpenPlacement: (placement: GardenPlacement) => void;
  onAddPlantToPlacement: (placement: GardenPlacement) => void;
};

export function PlannerScreen({ model, onOpenGardenSetup, onOpenPlacement, onAddPlantToPlacement }: PlannerScreenProps) {
  const firstBed = model.beds[0];
  const estimate = estimateSunExposure({
    latitude: model.user.latitude,
    longitude: model.user.longitude,
    dateTime: new Date().toISOString(),
    bed: firstBed,
    obstructions: model.obstructions
  });

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Interactive planner</Text>
        <Text style={styles.title}>Map the next move</Text>
        <Text style={styles.subtitle}>{estimate.placementWarnings[0].detail}</Text>
      </View>

      <TouchableOpacity accessibilityRole="button" style={styles.setupButton} onPress={onOpenGardenSetup}>
        <Ionicons name="compass-outline" size={20} color={colors.leafDeep} />
        <Text style={styles.setupText}>Edit garden setup</Text>
      </TouchableOpacity>

      <View style={styles.mapGrid}>
        {model.beds.map((bed, index) => {
          const plants = model.plantInstances.filter((plant) => plant.bedId === bed.id);
          const planning = getBedPlanningSummary(bed, plants, model.species);
          const crowded = planning.warnings.length > 0;
          const placement: GardenPlacement = {
            id: bed.id,
            label: bed.name,
            gardenId: bed.gardenId,
            bedId: bed.id,
            locationLabel: bed.name,
            locationType: bed.locationType,
            kind: bed.locationType === "container" ? "container" : "outdoor"
          };

          return (
            <TouchableOpacity key={bed.id} accessibilityRole="button" style={[styles.bedPlan, crowded && styles.bedPlanWarning]} onPress={() => onOpenPlacement(placement)}>
              <View style={styles.bedPlanTop}>
                <Text style={styles.bedName}>{bed.name}</Text>
                <Text style={styles.bedDims}>{bed.lengthFeet}x{bed.widthFeet}ft</Text>
              </View>

              <View style={styles.bedCanvas}>
                {plants.slice(0, 8).map((plant, plantIndex) => {
                  const point = getPoint(plantIndex);
                  const species = model.species.find((item) => item.id === plant.speciesId);
                  const spacing = getPlantPlanMetrics(species, plant.nickname).spacingInches;
                  const knowledge = getPlantKnowledge(species, plant.nickname);
                  return (
                    <View key={plant.id} style={[styles.plantSpacing, { left: point.left, top: point.top, width: spacing * 1.7, height: spacing * 1.7, borderRadius: spacing * 0.85 }]}>
                      <Text style={styles.plantGlyph}>{knowledge.visual}</Text>
                    </View>
                  );
                })}
                <View style={[styles.sunWash, index % 2 === 0 && styles.sunWashWarm]} />
              </View>

              <Text style={styles.recommendationText}>{planning.warnings[0] ?? planning.suggestions[0]}</Text>

              <View style={styles.bedPlanFooter}>
                <Text style={styles.bedSignal}>{crowded ? "Spacing watch" : `${plants.length}/${planning.capacity} guide`}</Text>
                <TouchableOpacity accessibilityRole="button" style={styles.addChip} onPress={() => onAddPlantToPlacement(placement)}>
                  <Text style={styles.addChipText}>Add</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function getPoint(index: number): { left: DimensionValue; top: DimensionValue } {
  const points: Array<{ left: DimensionValue; top: DimensionValue }> = [
    { left: "18%", top: "24%" },
    { left: "44%", top: "18%" },
    { left: "70%", top: "28%" },
    { left: "26%", top: "58%" },
    { left: "56%", top: "54%" },
    { left: "78%", top: "64%" },
    { left: "38%", top: "76%" },
    { left: "64%", top: "78%" }
  ];
  return points[index % points.length];
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg
  },
  hero: {
    borderRadius: 34,
    padding: spacing.lg,
    backgroundColor: colors.leafDeep,
    minHeight: 156,
    justifyContent: "center",
    gap: spacing.sm
  },
  eyebrow: {
    color: colors.sun,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.surfaceWarm,
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: "800"
  },
  setupButton: {
    minHeight: 54,
    borderRadius: radii.pill,
    backgroundColor: colors.sun,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  setupText: {
    color: colors.leafDeep,
    fontSize: typography.body,
    fontWeight: "900"
  },
  mapGrid: {
    gap: spacing.md
  },
  bedPlan: {
    borderRadius: 28,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md
  },
  bedPlanWarning: {
    backgroundColor: "#fff0e9",
    borderColor: "#efc3b6"
  },
  bedPlanTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  bedName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  bedDims: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  bedCanvas: {
    height: 116,
    borderRadius: 24,
    backgroundColor: colors.soilSoft,
    position: "relative",
    overflow: "hidden"
  },
  plantSpacing: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(94, 143, 76, 0.65)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.78)",
    zIndex: 2
  },
  plantGlyph: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  recommendationText: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800",
    lineHeight: 20
  },
  sunWash: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(155,191,152,0.35)"
  },
  sunWashWarm: {
    backgroundColor: "rgba(244,200,95,0.42)"
  },
  bedPlanFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  bedSignal: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "900"
  },
  addChip: {
    minHeight: 42,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center",
    justifyContent: "center"
  },
  addChipText: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  }
});
