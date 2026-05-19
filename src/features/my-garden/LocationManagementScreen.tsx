import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { GardenBed, GardenHomeModel, GardenZone, PlantInstance, PlantSpecies } from "../../domain";
import { getPlantKnowledge } from "../../data/plantKnowledge";
import { colors, radii, spacing, typography } from "../../theme/tokens";

export type GardenPlacement = {
  id: string;
  label: string;
  gardenId: string;
  bedId?: string;
  zoneId?: string;
  locationLabel: string;
  locationType: PlantInstance["locationType"];
  kind: "outdoor" | "indoor" | "container";
};

type LocationManagementScreenProps = {
  model: GardenHomeModel;
  placement: GardenPlacement;
  onBack: () => void;
  onAddPlant: (placement: GardenPlacement) => void;
  onOpenPlant: (plantId: string) => void;
  onMovePlant: (plantId: string, placement: GardenPlacement) => void;
  onRemovePlant: (plantId: string) => void;
};

export function LocationManagementScreen({
  model,
  placement,
  onBack,
  onAddPlant,
  onOpenPlant,
  onMovePlant,
  onRemovePlant
}: LocationManagementScreenProps) {
  const plants = getPlantsForPlacement(model.plantInstances, placement);
  const bed = placement.bedId ? model.beds.find((item) => item.id === placement.bedId) : undefined;
  const sunProfile = bed ? model.sunProfiles.find((item) => item.bedId === bed.id) : undefined;
  const placements = getGardenPlacements(model).filter((item) => item.id !== placement.id);
  const overcrowded = bed ? plants.length > Math.max(4, Math.floor((bed.lengthFeet * bed.widthFeet) / 2)) : plants.length > 8;

  function confirmRemove(plant: PlantInstance) {
    Alert.alert("Remove this plant from your garden?", plant.nickname, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => onRemovePlant(plant.id) }
    ]);
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader onBack={onBack} eyebrow={placement.kind} title={placement.label} subtitle={bed ? `${bed.lengthFeet}ft x ${bed.widthFeet}ft - ${bed.soilType.replaceAll("-", " ")}` : placement.locationLabel} />

      <View style={styles.environmentPanel}>
        <Signal icon="sunny-outline" label="sun" value={sunProfile ? `${sunProfile.estimatedDailySunHours}h` : "window"} />
        <Signal icon="water-outline" label="moisture" value={placement.kind === "indoor" ? "manual" : "check"} />
        <Signal icon="leaf-outline" label="plants" value={`${plants.length}`} />
      </View>

      {overcrowded ? (
        <View style={styles.warning}>
          <Ionicons name="warning-outline" size={20} color={colors.coral} />
          <Text style={styles.warningText}>Spacing watch: this area may be crowded. Future planner will calculate exact spacing.</Text>
        </View>
      ) : null}

      <PrimaryButton label="Add plant here" onPress={() => onAddPlant(placement)} tone="sun" icon={<Ionicons name="add" size={20} color={colors.leafDeep} />} />

      <Text style={styles.sectionTitle}>Plants here</Text>
      {plants.length === 0 ? <Text style={styles.emptyText}>No plants here yet. Add one to make this space alive.</Text> : null}
      {plants.map((plant) => {
        const species = model.species.find((item) => item.id === plant.speciesId);
        const knowledge = getPlantKnowledge(species, plant.nickname);

        return (
          <View key={plant.id} style={styles.plantRow}>
            <TouchableOpacity accessibilityRole="button" style={styles.plantMain} onPress={() => onOpenPlant(plant.id)}>
              <View style={[styles.plantOrb, plant.healthStatus === "watch" && styles.plantOrbWatch]}>
                <Text style={styles.plantGlyph}>{knowledge.visual}</Text>
              </View>
              <View style={styles.plantCopy}>
                <Text style={styles.plantName}>{plant.nickname}</Text>
                <Text style={styles.plantMeta}>{knowledge.commonName} - {plant.stage ?? plant.source}</Text>
              </View>
            </TouchableOpacity>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moveRail}>
              {placements.slice(0, 7).map((target) => (
                <TouchableOpacity key={target.id} accessibilityRole="button" style={styles.moveChip} onPress={() => onMovePlant(plant.id, target)}>
                  <Text style={styles.moveChipText}>Move to {target.label.replace("Raised ", "")}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity accessibilityRole="button" style={styles.removeChip} onPress={() => confirmRemove(plant)}>
                <Text style={styles.removeChipText}>Remove</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        );
      })}

      <View style={styles.notesPanel}>
        <Text style={styles.notesTitle}>Companion + spacing notes</Text>
        <Text style={styles.notesText}>{getCompanionSummary(plants, model.species)}</Text>
      </View>
    </View>
  );
}

export function getGardenPlacements(model: GardenHomeModel): GardenPlacement[] {
  const homeGarden = model.gardens.find((garden) => garden.id === "garden-home") ?? model.gardens[0];
  const indoorGarden = model.gardens.find((garden) => garden.id === "garden-indoor") ?? model.gardens[0];

  const bedPlacements = model.beds.map((bed) => ({
    id: bed.id,
    label: bed.name,
    gardenId: bed.gardenId,
    bedId: bed.id,
    locationLabel: bed.name,
    locationType: bed.locationType,
    kind: bed.locationType === "container" ? "container" : "outdoor"
  })) satisfies GardenPlacement[];

  const indoorPlacements = model.zones
    .filter((zone) => zone.gardenId === indoorGarden.id)
    .map((zone) => ({
      id: zone.id,
      label: zone.name,
      gardenId: zone.gardenId,
      zoneId: zone.id,
      locationLabel: zone.name,
      locationType: "indoor-pot" as const,
      kind: "indoor" as const
    }));

  return [
    ...bedPlacements,
    {
      id: "container-patio",
      label: "Patio container",
      gardenId: homeGarden.id,
      locationLabel: "Patio container",
      locationType: "container",
      kind: "container"
    },
    ...indoorPlacements
  ];
}

export function getPlantsForPlacement(plants: PlantInstance[], placement: GardenPlacement) {
  if (placement.bedId) {
    return plants.filter((plant) => plant.bedId === placement.bedId);
  }
  if (placement.zoneId) {
    return plants.filter((plant) => plant.gardenId === placement.gardenId && plant.locationType === "indoor-pot");
  }
  return plants.filter((plant) => plant.gardenId === placement.gardenId && plant.locationLabel === placement.locationLabel);
}

function Signal({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.signal}>
      <Ionicons name={icon} size={20} color={colors.leafDeep} />
      <Text style={styles.signalLabel}>{label}</Text>
      <Text style={styles.signalValue}>{value}</Text>
    </View>
  );
}

function getCompanionSummary(plants: PlantInstance[], species: PlantSpecies[]) {
  if (plants.length === 0) {
    return "Add plants here to see companion and spacing notes.";
  }

  const names = plants
    .map((plant) => species.find((item) => item.id === plant.speciesId)?.commonName ?? plant.nickname)
    .slice(0, 4)
    .join(", ");

  return `${names} are sharing this space. Companion checks are mocked for now; planner warnings will become rule-driven.`;
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg
  },
  environmentPanel: {
    flexDirection: "row",
    gap: spacing.sm
  },
  signal: {
    flex: 1,
    minHeight: 92,
    borderRadius: 24,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center",
    justifyContent: "center",
    gap: 2
  },
  signalLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  signalValue: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "900"
  },
  warning: {
    borderRadius: 22,
    backgroundColor: "#fff0e9",
    borderWidth: 1,
    borderColor: "#efc3b6",
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.sm
  },
  warningText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800",
    lineHeight: 20
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "800"
  },
  plantRow: {
    borderRadius: 26,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md
  },
  plantMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  plantOrb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.leaf,
    alignItems: "center",
    justifyContent: "center"
  },
  plantOrbWatch: {
    backgroundColor: colors.coral
  },
  plantGlyph: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "900"
  },
  plantCopy: {
    flex: 1
  },
  plantName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  plantMeta: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "800"
  },
  moveRail: {
    gap: spacing.sm,
    paddingRight: spacing.lg
  },
  moveChip: {
    minHeight: 42,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  moveChipText: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  removeChip: {
    minHeight: 42,
    borderRadius: radii.pill,
    backgroundColor: "#fff0e9",
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  removeChipText: {
    color: colors.coral,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  notesPanel: {
    borderRadius: 24,
    backgroundColor: colors.surfaceWarm,
    padding: spacing.lg,
    gap: spacing.sm
  },
  notesTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  notesText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: "800"
  }
});
