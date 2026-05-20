import { useMemo, useState } from "react";
import { DimensionValue, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GardenBed, GardenHomeModel, PlantInstance, PlantSpecies } from "../../domain";
import { getPlantKnowledge } from "../../data/plantKnowledge";
import { colors, radii, spacing, typography } from "../../theme/tokens";
import { GardenPlacement } from "./LocationManagementScreen";

type MyGardenScreenProps = {
  model: GardenHomeModel;
  onAddPlant: () => void;
  onOpenGardenSetup: (placement?: GardenPlacement) => void;
  onOpenPlant: (plantId: string) => void;
};

type GardenTab = "outdoor" | "containers" | "indoor";

const zoneTabs: Array<{ id: GardenTab; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: "outdoor", label: "Outdoor Beds", icon: "flower-outline" },
  { id: "containers", label: "Pots & Containers", icon: "file-tray-outline" },
  { id: "indoor", label: "Indoor Plants", icon: "home-outline" }
];

export function MyGardenScreen({ model, onAddPlant, onOpenGardenSetup, onOpenPlant }: MyGardenScreenProps) {
  const [activeZone, setActiveZone] = useState<GardenTab>("outdoor");
  const plantsByBed = useMemo(() => groupPlantsByBed(model.plantInstances), [model.plantInstances]);
  const outdoorBeds = model.beds.filter((bed) => bed.locationType !== "container");
  const containerPlants = model.plantInstances.filter((plant) => plant.locationType === "container");
  const indoorPlants = model.plantInstances.filter((plant) => plant.locationType === "indoor-pot");

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>My Garden</Text>
          <Text style={styles.subtitle}>Your living spaces</Text>
        </View>
        <View style={styles.actionStack}>
          <TouchableOpacity accessibilityRole="button" style={styles.addPlantButton} onPress={onAddPlant}>
            <Ionicons name="add" size={24} color={colors.white} />
            <Text style={styles.addPlantText}>Add Plant</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={styles.addBedButton} onPress={() => onOpenGardenSetup()}>
            <Ionicons name="add" size={24} color={colors.leafDeep} />
            <Text style={styles.addBedText}>Add Bed</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.segmentedTabs}>
        {zoneTabs.map((tab) => (
          <TouchableOpacity key={tab.id} accessibilityRole="button" style={[styles.segmentTab, activeZone === tab.id && styles.segmentTabActive]} onPress={() => setActiveZone(tab.id)}>
            <Ionicons name={tab.icon} size={22} color={activeZone === tab.id ? colors.white : colors.leafDeep} />
            <Text style={[styles.segmentTabText, activeZone === tab.id && styles.segmentTabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeZone === "outdoor" ? (
        <View style={styles.bedGrid}>
          {outdoorBeds.map((bed, index) => (
            <BedCard
              key={bed.id}
              bed={bed}
              plants={plantsByBed[bed.id] ?? []}
              species={model.species}
              index={index}
              onManage={() => onOpenGardenSetup(toPlacement(bed))}
              onOpenPlant={onOpenPlant}
            />
          ))}
        </View>
      ) : null}

      {activeZone === "containers" ? <PlantRail title="Pots & Containers" plants={containerPlants} species={model.species} onOpenPlant={onOpenPlant} /> : null}
      {activeZone === "indoor" ? <PlantRail title="Indoor Plants" plants={indoorPlants} species={model.species} onOpenPlant={onOpenPlant} /> : null}

      <View style={styles.tipCard}>
        <Ionicons name="leaf" size={30} color={colors.leafDeep} />
        <Text style={styles.tipText}>Tip: Basil grows great with tomatoes and helps repel pests naturally.</Text>
      </View>
    </View>
  );
}

function BedCard({ bed, plants, species, index, onManage, onOpenPlant }: { bed: GardenBed; plants: PlantInstance[]; species: PlantSpecies[]; index: number; onManage: () => void; onOpenPlant: (plantId: string) => void }) {
  const state = getBedState(index);

  return (
    <TouchableOpacity accessibilityRole="button" style={styles.bedCard} onPress={onManage}>
      <View style={styles.bedTop}>
        <View>
          <Text style={styles.bedName}>{bed.name}</Text>
          <View style={styles.bedStateRow}>
            <Text style={[styles.bedState, { color: state.color }]}>{state.label}</Text>
            <Ionicons name={state.icon} size={20} color={state.color} />
            <Text style={styles.sunText}>{state.sun}</Text>
          </View>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Manage ${bed.name}`} onPress={onManage}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.bedVisual}>
        <View style={styles.gridLineVertical} />
        <View style={styles.gridLineHorizontal} />
        {plants.slice(0, 6).map((plant, plantIndex) => {
          const point = plant.positionXPercent !== undefined && plant.positionYPercent !== undefined ? { left: `${plant.positionXPercent}%` as DimensionValue, top: `${plant.positionYPercent}%` as DimensionValue } : getPlantPoint(plantIndex);
          const knowledge = getPlantKnowledge(species.find((item) => item.id === plant.speciesId), plant.nickname);
          return (
            <TouchableOpacity key={plant.id} accessibilityRole="button" style={[styles.plantMarker, plant.healthStatus === "watch" && styles.plantMarkerWatch, { left: point.left, top: point.top }]} onPress={() => onOpenPlant(plant.id)}>
              <Text style={styles.plantMarkerText}>{knowledge.visual}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.bedFooter}>
        <Text style={styles.bedFooterText}>{plants.length} plants</Text>
        <Text style={styles.bedFooterText}>{bed.lengthFeet}ft x {bed.widthFeet}ft</Text>
      </View>
    </TouchableOpacity>
  );
}

function PlantRail({ title, plants, species, onOpenPlant }: { title: string; plants: PlantInstance[]; species: PlantSpecies[]; onOpenPlant: (plantId: string) => void }) {
  return (
    <View style={styles.railSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.plantRail}>
        {plants.map((plant) => {
          const knowledge = getPlantKnowledge(species.find((item) => item.id === plant.speciesId), plant.nickname);
          return (
            <TouchableOpacity key={plant.id} accessibilityRole="button" style={styles.plantTile} onPress={() => onOpenPlant(plant.id)}>
              <View style={styles.plantTileVisual}>
                <Text style={styles.plantTileGlyph}>{knowledge.visual}</Text>
              </View>
              <Text numberOfLines={2} style={styles.plantTileTitle}>{plant.nickname}</Text>
              <Text style={styles.plantTileMeta}>{plant.healthStatus}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
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

function getBedState(index: number) {
  const states = [
    { label: "Thriving", color: colors.leaf, icon: "sunny-outline" as const, sun: "7h sun" },
    { label: "Warm", color: "#d99616", icon: "thermometer-outline" as const, sun: "6h sun" },
    { label: "Part Shade", color: "#668fc6", icon: "partly-sunny-outline" as const, sun: "4h sun" },
    { label: "Sunny", color: "#e7a51a", icon: "sunny-outline" as const, sun: "8h sun" }
  ];
  return states[index % states.length];
}

function getPlantPoint(index: number): { left: DimensionValue; top: DimensionValue } {
  const points: Array<{ left: DimensionValue; top: DimensionValue }> = [
    { left: "18%", top: "20%" },
    { left: "58%", top: "20%" },
    { left: "20%", top: "58%" },
    { left: "60%", top: "58%" },
    { left: "38%", top: "38%" },
    { left: "76%", top: "42%" }
  ];
  return points[index % points.length];
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  actionStack: {
    width: 168,
    gap: spacing.sm
  },
  addPlantButton: {
    minHeight: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.leafDeep,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  addPlantText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: "900"
  },
  addBedButton: {
    minHeight: 54,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  addBedText: {
    color: colors.leafDeep,
    fontSize: typography.body,
    fontWeight: "900"
  },
  segmentedTabs: {
    minHeight: 64,
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
    minHeight: 52,
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
    fontSize: typography.caption,
    fontWeight: "900"
  },
  segmentTabTextActive: {
    color: colors.white
  },
  bedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  bedCard: {
    width: "47.8%",
    minHeight: 252,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    justifyContent: "space-between"
  },
  bedTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  bedName: {
    color: colors.leafDeep,
    fontSize: typography.body,
    fontWeight: "900"
  },
  bedStateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  bedState: {
    fontSize: typography.small,
    fontWeight: "900"
  },
  sunText: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "700"
  },
  bedVisual: {
    height: 126,
    borderRadius: 20,
    backgroundColor: "#7a5a3e",
    borderWidth: 5,
    borderColor: "#b8895d",
    overflow: "hidden",
    position: "relative",
    marginVertical: spacing.sm
  },
  gridLineVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 1,
    backgroundColor: "rgba(255,255,255,0.24)"
  },
  gridLineHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.24)"
  },
  plantMarker: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.leaf,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  plantMarkerWatch: {
    backgroundColor: colors.coral
  },
  plantMarkerText: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: "900"
  },
  bedFooter: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  bedFooterText: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "800"
  },
  railSection: {
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.leafDeep,
    fontSize: typography.section,
    fontWeight: "900"
  },
  plantRail: {
    gap: spacing.md,
    paddingRight: spacing.xl
  },
  plantTile: {
    width: 156,
    minHeight: 188,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: "space-between"
  },
  plantTileVisual: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.sage,
    alignItems: "center",
    justifyContent: "center"
  },
  plantTileGlyph: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: "900"
  },
  plantTileTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  plantTileMeta: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  tipCard: {
    minHeight: 78,
    borderRadius: 24,
    backgroundColor: "#eef6e9",
    borderWidth: 1,
    borderColor: "#b6c6a5",
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  tipText: {
    flex: 1,
    color: colors.leafDeep,
    fontSize: typography.body,
    lineHeight: 22,
    fontWeight: "800"
  }
});
