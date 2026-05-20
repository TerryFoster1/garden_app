import { useMemo, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GardenBed, GardenHomeModel, PlantInstance, PlantSpecies } from "../../domain";
import { getPlantKnowledge } from "../../data/plantKnowledge";
import { getLatestPlantPhoto } from "../../services/plantPhotos";
import { colors, radii, spacing, typography } from "../../theme/tokens";
import { GardenPlacement } from "./LocationManagementScreen";

type MyGardenScreenProps = {
  model: GardenHomeModel;
  onAddPlant: () => void;
  onOpenGardenSetup: (placement?: GardenPlacement) => void;
  onOpenPlant: (plantId: string) => void;
};

type GardenView = "outdoor" | "indoor";

const tabs: Array<{ id: GardenView; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: "outdoor", label: "Outdoor", icon: "sunny-outline" },
  { id: "indoor", label: "Indoor", icon: "home-outline" }
];

export function MyGardenScreen({ model, onAddPlant, onOpenGardenSetup, onOpenPlant }: MyGardenScreenProps) {
  const [activeView, setActiveView] = useState<GardenView>("outdoor");
  const plantsByBed = useMemo(() => groupPlantsByBed(model.plantInstances), [model.plantInstances]);
  const outdoorBeds = model.beds.filter((bed) => bed.locationType !== "container");
  const indoorPlants = model.plantInstances.filter((plant) => plant.locationType === "indoor-pot");

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>My Garden</Text>
          <Text style={styles.subtitle}>Your living spaces</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" style={styles.addButton} onPress={activeView === "outdoor" ? () => onOpenGardenSetup() : onAddPlant}>
          <Ionicons name="add" size={22} color={colors.white} />
          <Text style={styles.addButtonText}>{activeView === "outdoor" ? "Add Bed" : "Add Plant"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.segmentedTabs}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab.id} accessibilityRole="button" style={[styles.segmentTab, activeView === tab.id && styles.segmentTabActive]} onPress={() => setActiveView(tab.id)}>
            <Ionicons name={tab.icon} size={21} color={activeView === tab.id ? colors.white : colors.leafDeep} />
            <Text style={[styles.segmentTabText, activeView === tab.id && styles.segmentTabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeView === "outdoor" ? (
        <View style={styles.list}>
          {outdoorBeds.map((bed, index) => (
            <BedOverviewCard key={bed.id} bed={bed} plants={plantsByBed[bed.id] ?? []} species={model.species} index={index} onPress={() => onOpenGardenSetup(toPlacement(bed))} />
          ))}
          {outdoorBeds.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="grid-outline" size={28} color={colors.leafDeep} />
              <Text style={styles.emptyTitle}>No outdoor beds yet</Text>
              <Text style={styles.emptyText}>Create a bed or container to start mapping your real garden.</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.list}>
          {indoorPlants.map((plant) => (
            <IndoorPlantCard key={plant.id} plant={plant} model={model} onPress={() => onOpenPlant(plant.id)} />
          ))}
          {indoorPlants.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={28} color={colors.leafDeep} />
              <Text style={styles.emptyTitle}>No indoor plants yet</Text>
              <Text style={styles.emptyText}>Add a plant when you are ready to track a shelf, window, or room.</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

function BedOverviewCard({ bed, plants, species, index, onPress }: { bed: GardenBed; plants: PlantInstance[]; species: PlantSpecies[]; index: number; onPress: () => void }) {
  const status = getBedStatus(index, plants);
  const plantNames = plants
    .slice(0, 4)
    .map((plant) => getPlantKnowledge(species.find((item) => item.id === plant.speciesId), plant.nickname).commonName)
    .filter(Boolean);
  const visibleList = plantNames.length > 0 ? plantNames.join(", ") : "No plants yet";
  const overflowCount = Math.max(0, plants.length - 4);

  return (
    <TouchableOpacity accessibilityRole="button" style={styles.bedCard} onPress={onPress}>
      <View style={styles.bedTopRow}>
        <View style={styles.bedIcon}>
          <Ionicons name="flower-outline" size={23} color={colors.leafDeep} />
        </View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{bed.name}</Text>
          <Text style={styles.cardMeta}>{bed.lengthFeet}ft x {bed.widthFeet}ft</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: status.background }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <Text numberOfLines={2} style={styles.plantList}>{visibleList}{overflowCount > 0 ? ` + ${overflowCount} more` : ""}</Text>

      <View style={styles.bedBottomRow}>
        <View style={styles.tinyPreview}>
          {plants.slice(0, 5).map((plant, plantIndex) => (
            <View key={plant.id} style={[styles.tinyPlantDot, plant.healthStatus === "watch" && styles.tinyPlantDotWatch, { marginLeft: plantIndex === 0 ? 0 : -5 }]} />
          ))}
        </View>
        <Text style={styles.openText}>Open bed</Text>
        <Ionicons name="chevron-forward" size={19} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

function IndoorPlantCard({ plant, model, onPress }: { plant: PlantInstance; model: GardenHomeModel; onPress: () => void }) {
  const species = model.species.find((item) => item.id === plant.speciesId);
  const knowledge = getPlantKnowledge(species, plant.nickname);
  const photo = getLatestPlantPhoto(model, plant);
  const statusColor = plant.healthStatus === "watch" || plant.healthStatus === "stressed" ? colors.coral : colors.leaf;

  return (
    <TouchableOpacity accessibilityRole="button" style={styles.plantCard} onPress={onPress}>
      {photo ? (
        <Image source={{ uri: photo.uri }} style={styles.plantPhoto} />
      ) : (
        <View style={styles.plantFallback}>
          <Text style={styles.plantFallbackText}>{knowledge.visual}</Text>
        </View>
      )}
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{plant.nickname}</Text>
        <Text style={styles.cardMeta}>{knowledge.commonName}</Text>
        <Text numberOfLines={1} style={styles.locationText}>{plant.locationLabel}</Text>
      </View>
      <View style={styles.plantStatus}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>{plant.healthStatus}</Text>
      </View>
    </TouchableOpacity>
  );
}

function toPlacement(bed: GardenBed): GardenPlacement {
  return {
    id: bed.id,
    label: bed.name,
    gardenId: bed.gardenId,
    bedId: bed.id,
    locationLabel: bed.name,
    locationType: bed.locationType,
    kind: bed.locationType === "container" ? "container" : "outdoor"
  };
}

function groupPlantsByBed(plants: PlantInstance[]) {
  return plants.reduce<Record<string, PlantInstance[]>>((groups, plant) => {
    if (!plant.bedId) {
      return groups;
    }
    return {
      ...groups,
      [plant.bedId]: [...(groups[plant.bedId] ?? []), plant]
    };
  }, {});
}

function getBedStatus(index: number, plants: PlantInstance[]) {
  if (plants.some((plant) => plant.healthStatus === "stressed" || plant.healthStatus === "watch")) {
    return { label: "Watch", color: colors.coral, background: "#fff1ea" };
  }

  const states = [
    { label: "Steady", color: colors.leaf, background: "#eef6e9" },
    { label: "Warm", color: "#d99616", background: "#fff5d8" },
    { label: "Part shade", color: "#668fc6", background: "#edf4ff" }
  ];

  return states[index % states.length];
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  headerCopy: {
    flex: 1
  },
  title: {
    color: colors.leafDeep,
    fontSize: 44,
    fontWeight: "900",
    lineHeight: 50
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: "700"
  },
  addButton: {
    minHeight: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.leafDeep,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  addButtonText: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: "900"
  },
  segmentedTabs: {
    minHeight: 62,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xs,
    gap: spacing.xs
  },
  segmentTab: {
    flex: 1,
    minHeight: 50,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  segmentTabActive: {
    backgroundColor: colors.leafDeep
  },
  segmentTabText: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: "900"
  },
  segmentTabTextActive: {
    color: colors.white
  },
  list: {
    gap: spacing.md
  },
  bedCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md
  },
  bedTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  bedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eef6e9",
    alignItems: "center",
    justifyContent: "center"
  },
  cardCopy: {
    flex: 1
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    lineHeight: 21
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "800",
    marginTop: 2
  },
  statusPill: {
    minHeight: 32,
    borderRadius: radii.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5
  },
  statusText: {
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  plantList: {
    color: colors.text,
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: "800"
  },
  bedBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  tinyPreview: {
    flex: 1,
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center"
  },
  tinyPlantDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.leaf,
    borderWidth: 2,
    borderColor: colors.surface
  },
  tinyPlantDotWatch: {
    backgroundColor: colors.coral
  },
  openText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  plantCard: {
    minHeight: 106,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  plantPhoto: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.surfaceWarm
  },
  plantFallback: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.sage,
    alignItems: "center",
    justifyContent: "center"
  },
  plantFallbackText: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: "900"
  },
  locationText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
    marginTop: spacing.xs
  },
  plantStatus: {
    alignItems: "center",
    gap: spacing.xs
  },
  emptyState: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20,
    textAlign: "center",
    fontWeight: "700"
  }
});
