import { useMemo, useState } from "react";
import { DimensionValue, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GardenBed, GardenHomeModel, PlantInstance, PlantSpecies } from "../../domain";
import { colors, radii, spacing, typography } from "../../theme/tokens";
import { GardenPlacement } from "./LocationManagementScreen";

type MyGardenScreenProps = {
  model: GardenHomeModel;
  onAddPlant: () => void;
  onOpenGardenSetup: (placement?: GardenPlacement) => void;
  onOpenPlant: (plantId: string) => void;
};

type BedEnvironment = {
  label: string;
  tone: "thriving" | "dry" | "watch" | "shade" | "humid";
  metric: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const bedEnvironments: BedEnvironment[] = [
  { label: "thriving", tone: "thriving", metric: "7h sun", icon: "sunny-outline" },
  { label: "warm", tone: "dry", metric: "dry edge", icon: "thermometer-outline" },
  { label: "trellis watch", tone: "watch", metric: "shade risk", icon: "git-branch-outline" },
  { label: "cool pocket", tone: "shade", metric: "part shade", icon: "cloud-outline" },
  { label: "humid", tone: "humid", metric: "mildew watch", icon: "water-outline" }
];

export function MyGardenScreen({ model, onAddPlant, onOpenGardenSetup, onOpenPlant }: MyGardenScreenProps) {
  const [selectedBedId, setSelectedBedId] = useState(model.beds[0]?.id ?? "");
  const [activeZone, setActiveZone] = useState<"outdoor" | "containers" | "indoor">("outdoor");

  const selectedBed = model.beds.find((bed) => bed.id === selectedBedId) ?? model.beds[0];
  const plantsByBed = useMemo(() => groupPlantsByBed(model.plantInstances), [model.plantInstances]);
  const containerPlants = model.plantInstances.filter((plant) => plant.locationType === "container");
  const indoorPlants = model.plantInstances.filter((plant) => plant.locationType === "indoor-pot");
  const outdoorBeds = model.beds.filter((bed) => bed.locationType !== "container");
  const plantsInSelectedBed = selectedBed ? plantsByBed[selectedBed.id] ?? [] : [];
  const watchCount = model.plantInstances.filter((plant) => plant.healthStatus === "watch" || plant.healthStatus === "stressed").length;

  return (
    <View style={styles.screen}>
      <View style={styles.gardenHero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.eyebrow}>My living map</Text>
            <Text style={styles.heroTitle}>Home Garden</Text>
          </View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Set up garden" style={styles.heroIconButton} onPress={() => onOpenGardenSetup()}>
            <Ionicons name="compass-outline" size={23} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroScene}>
          <View style={styles.sunOrb} />
          <View style={styles.gardenGround}>
            {outdoorBeds.slice(0, 4).map((bed, index) => (
              <View key={bed.id} style={[styles.heroBed, index % 2 === 1 && styles.heroBedOffset]}>
                {(plantsByBed[bed.id] ?? []).slice(0, 5).map((plant, plantIndex) => (
                  <View key={plant.id} style={[styles.heroSprout, plant.healthStatus === "watch" && styles.heroSproutWatch, { left: `${12 + plantIndex * 16}%` }]} />
                ))}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.heroSummary}>
          <Text style={styles.heroSummaryText}>{model.plantInstances.length} plants mapped</Text>
          <Text style={styles.heroSummaryText}>{watchCount} need a closer look</Text>
        </View>
      </View>

      <View style={styles.primaryActions}>
        <TouchableOpacity accessibilityRole="button" style={styles.addPlantAction} onPress={onAddPlant}>
          <Ionicons name="add" size={24} color={colors.leafDeep} />
          <Text style={styles.addPlantText}>Add plant</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={styles.setupAction} onPress={() => onOpenGardenSetup()}>
          <Ionicons name="map-outline" size={22} color={colors.leafDeep} />
          <Text style={styles.setupText}>Map beds</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.zoneTabs}>
        {[
          { id: "outdoor", label: "Beds" },
          { id: "containers", label: "Pots" },
          { id: "indoor", label: "Indoor" }
        ].map((zone) => (
          <TouchableOpacity key={zone.id} accessibilityRole="button" style={[styles.zoneTab, activeZone === zone.id && styles.zoneTabActive]} onPress={() => setActiveZone(zone.id as typeof activeZone)}>
            <Text style={[styles.zoneTabText, activeZone === zone.id && styles.zoneTabTextActive]}>{zone.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeZone === "outdoor" ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Raised Bed Row</Text>
            <Text style={styles.sectionMeta}>tap a bed</Text>
          </View>

          <View style={styles.bedGrid}>
            {outdoorBeds.map((bed, index) => (
              <BedMiniMap
                key={bed.id}
                bed={bed}
                plants={plantsByBed[bed.id] ?? []}
                species={model.species}
                environment={bedEnvironments[index % bedEnvironments.length]}
                isSelected={bed.id === selectedBed?.id}
                onPress={() => setSelectedBedId(bed.id)}
                onManage={() =>
                  onOpenGardenSetup({
                    id: bed.id,
                    label: bed.name,
                    gardenId: bed.gardenId,
                    bedId: bed.id,
                    locationLabel: bed.name,
                    locationType: bed.locationType,
                    kind: bed.locationType === "container" ? "container" : "outdoor"
                  })
                }
                onOpenPlant={onOpenPlant}
              />
            ))}
          </View>

          {selectedBed ? (
            <SelectedBedPanel
              bed={selectedBed}
              plants={plantsInSelectedBed}
              species={model.species}
              onOpenPlant={onOpenPlant}
              onManage={() =>
                onOpenGardenSetup({
                  id: selectedBed.id,
                  label: selectedBed.name,
                  gardenId: selectedBed.gardenId,
                  bedId: selectedBed.id,
                  locationLabel: selectedBed.name,
                  locationType: selectedBed.locationType,
                  kind: selectedBed.locationType === "container" ? "container" : "outdoor"
                })
              }
            />
          ) : null}
        </>
      ) : null}

      {activeZone === "containers" ? (
        <PlantCarousel title="Container microclimate" plants={containerPlants} species={model.species} onOpenPlant={onOpenPlant} />
      ) : null}

      {activeZone === "indoor" ? (
        <PlantCarousel title="Indoor plant shelf" plants={indoorPlants} species={model.species} onOpenPlant={onOpenPlant} />
      ) : null}
    </View>
  );
}

function BedMiniMap({
  bed,
  plants,
  species,
  environment,
  isSelected,
  onPress,
  onManage,
  onOpenPlant
}: {
  bed: GardenBed;
  plants: PlantInstance[];
  species: PlantSpecies[];
  environment: BedEnvironment;
  isSelected: boolean;
  onPress: () => void;
  onManage: () => void;
  onOpenPlant: (plantId: string) => void;
}) {
  return (
    <TouchableOpacity accessibilityRole="button" style={[styles.bedMiniMap, styles[environment.tone], isSelected && styles.bedMiniMapSelected]} onPress={onPress}>
      <View style={styles.bedMiniHeader}>
        <Text style={styles.bedMiniName}>{bed.name.replace("Raised ", "")}</Text>
        <View style={styles.environmentPill}>
          <Ionicons name={environment.icon} size={13} color={colors.leafDeep} />
          <Text style={styles.environmentText}>{environment.label}</Text>
        </View>
      </View>

      <View style={styles.bedCanvas}>
        <View style={styles.bedSoilLine} />
        {plants.slice(0, 8).map((plant, index) => {
          const plantSpecies = species.find((item) => item.id === plant.speciesId);
          const point = getPlantPoint(index);
          return (
            <TouchableOpacity
              key={plant.id}
              accessibilityRole="button"
              accessibilityLabel={plant.nickname}
              style={[styles.plantDot, plant.healthStatus === "watch" && styles.plantDotWatch, { left: point.left, top: point.top }]}
              onPress={() => onOpenPlant(plant.id)}
            >
              <Text style={styles.plantDotText}>{getPlantGlyph(plantSpecies?.commonName ?? plant.nickname)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.bedMiniFooter}>
        <Text style={styles.bedMetric}>{environment.metric}</Text>
        <TouchableOpacity accessibilityRole="button" onPress={onManage}>
          <Text style={styles.bedMetric}>Manage</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function SelectedBedPanel({
  bed,
  plants,
  species,
  onOpenPlant,
  onManage
}: {
  bed: GardenBed;
  plants: PlantInstance[];
  species: PlantSpecies[];
  onOpenPlant: (plantId: string) => void;
  onManage: () => void;
}) {
  const watchPlants = plants.filter((plant) => plant.healthStatus === "watch" || plant.healthStatus === "stressed");

  return (
    <View style={styles.focusPanel}>
      <View style={styles.focusTop}>
        <View>
          <Text style={styles.focusEyebrow}>Selected ecosystem</Text>
          <Text style={styles.focusTitle}>{bed.name}</Text>
        </View>
        <View style={styles.focusBadge}>
          <Text style={styles.focusBadgeText}>{watchPlants.length > 0 ? "watch" : "steady"}</Text>
        </View>
      </View>

      <View style={styles.focusSignals}>
        <Signal icon="sunny-outline" label="sun" value={`${bed.orientationDegreesFromNorth} deg`} />
        <Signal icon="water-outline" label="moisture" value="check edge" />
        <Signal icon="leaf-outline" label="plants" value={`${plants.length}`} />
      </View>

      <TouchableOpacity accessibilityRole="button" style={styles.manageButton} onPress={onManage}>
        <Ionicons name="construct-outline" size={18} color={colors.leafDeep} />
        <Text style={styles.manageButtonText}>Manage plants in this bed</Text>
      </TouchableOpacity>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.plantClusterRow}>
        {plants.map((plant) => {
          const plantSpecies = species.find((item) => item.id === plant.speciesId);
          return (
            <TouchableOpacity key={plant.id} accessibilityRole="button" style={styles.plantCluster} onPress={() => onOpenPlant(plant.id)}>
              <View style={[styles.statusRing, plant.healthStatus === "watch" && styles.statusRingWatch]}>
                <Text style={styles.statusGlyph}>{getPlantGlyph(plantSpecies?.commonName ?? plant.nickname)}</Text>
              </View>
              <Text numberOfLines={1} style={styles.clusterTitle}>{plantSpecies?.commonName ?? plant.nickname}</Text>
              <Text style={styles.clusterMeta}>{plant.healthStatus}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Signal({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.signal}>
      <Ionicons name={icon} size={18} color={colors.leafDeep} />
      <Text style={styles.signalLabel}>{label}</Text>
      <Text style={styles.signalValue}>{value}</Text>
    </View>
  );
}

function PlantCarousel({ title, plants, species, onOpenPlant }: { title: string; plants: PlantInstance[]; species: PlantSpecies[]; onOpenPlant: (plantId: string) => void }) {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionMeta}>{plants.length} plants</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.containerRail}>
        {plants.map((plant, index) => {
          const plantSpecies = species.find((item) => item.id === plant.speciesId);
          return (
            <TouchableOpacity key={plant.id} accessibilityRole="button" style={[styles.containerTile, index % 2 === 1 && styles.containerTileAlt]} onPress={() => onOpenPlant(plant.id)}>
              <View style={styles.containerGlow}>
                <Text style={styles.containerGlyph}>{getPlantGlyph(plantSpecies?.commonName ?? plant.nickname)}</Text>
              </View>
              <Text numberOfLines={2} style={styles.containerName}>{plant.nickname}</Text>
              <Text style={styles.containerStatus}>{plant.healthStatus}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
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

function getPlantPoint(index: number): { left: DimensionValue; top: DimensionValue } {
  const points: Array<{ left: DimensionValue; top: DimensionValue }> = [
    { left: "14%", top: "22%" },
    { left: "38%", top: "18%" },
    { left: "64%", top: "24%" },
    { left: "22%", top: "54%" },
    { left: "50%", top: "50%" },
    { left: "76%", top: "56%" },
    { left: "36%", top: "74%" },
    { left: "66%", top: "76%" }
  ];

  return points[index % points.length];
}

function getPlantGlyph(name: string) {
  const normalizedName = name.toLowerCase();
  if (normalizedName.includes("tomato")) return "T";
  if (normalizedName.includes("pepper")) return "P";
  if (normalizedName.includes("basil")) return "B";
  if (normalizedName.includes("cucumber")) return "C";
  if (normalizedName.includes("lettuce")) return "L";
  if (normalizedName.includes("strawberry")) return "S";
  if (normalizedName.includes("garlic")) return "G";
  if (normalizedName.includes("onion")) return "O";
  return normalizedName.charAt(0).toUpperCase();
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg
  },
  gardenHero: {
    borderRadius: 36,
    minHeight: 284,
    padding: spacing.lg,
    backgroundColor: colors.leafDeep,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  eyebrow: {
    color: colors.sun,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  heroTitle: {
    color: colors.white,
    fontSize: typography.hero,
    fontWeight: "900",
    lineHeight: 40
  },
  heroIconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  heroScene: {
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: spacing.lg
  },
  sunOrb: {
    position: "absolute",
    right: 6,
    top: 12,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.sun,
    opacity: 0.86
  },
  gardenGround: {
    gap: spacing.sm,
    transform: [{ rotate: "-3deg" }]
  },
  heroBed: {
    height: 30,
    borderRadius: 18,
    backgroundColor: "#7f654b",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    position: "relative"
  },
  heroBedOffset: {
    marginLeft: spacing.xl
  },
  heroSprout: {
    position: "absolute",
    bottom: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.sage
  },
  heroSproutWatch: {
    backgroundColor: colors.coral
  },
  heroSummary: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  heroSummaryText: {
    flex: 1,
    color: colors.leafDeep,
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.caption,
    fontWeight: "900",
    textAlign: "center"
  },
  primaryActions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  addPlantAction: {
    flex: 1.2,
    minHeight: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.sun,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  addPlantText: {
    color: colors.leafDeep,
    fontSize: typography.body,
    fontWeight: "900"
  },
  setupAction: {
    flex: 1,
    minHeight: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceWarm,
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
  zoneTabs: {
    flexDirection: "row",
    backgroundColor: colors.surfaceWarm,
    borderRadius: radii.pill,
    padding: spacing.xs
  },
  zoneTab: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  zoneTabActive: {
    backgroundColor: colors.surface
  },
  zoneTabText: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "900"
  },
  zoneTabTextActive: {
    color: colors.leafDeep
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  bedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  bedMiniMap: {
    width: "48%",
    minHeight: 190,
    borderRadius: 28,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    justifyContent: "space-between"
  },
  bedMiniMapSelected: {
    borderColor: colors.leafDeep,
    borderWidth: 2
  },
  thriving: {
    backgroundColor: "#f2f7e9"
  },
  dry: {
    backgroundColor: "#fff1d4"
  },
  watch: {
    backgroundColor: "#fff0e9"
  },
  shade: {
    backgroundColor: "#e8f0e8"
  },
  humid: {
    backgroundColor: colors.sky
  },
  bedMiniHeader: {
    gap: spacing.sm
  },
  bedMiniName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  environmentPill: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.62)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  environmentText: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  bedCanvas: {
    height: 82,
    borderRadius: 22,
    backgroundColor: "rgba(111,88,71,0.22)",
    position: "relative",
    overflow: "hidden",
    marginVertical: spacing.md
  },
  bedSoilLine: {
    position: "absolute",
    left: 12,
    right: 12,
    top: "50%",
    height: 2,
    backgroundColor: "rgba(111,88,71,0.25)"
  },
  plantDot: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.leaf,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface
  },
  plantDotWatch: {
    backgroundColor: colors.coral
  },
  plantDotText: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  bedMiniFooter: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  bedMetric: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  focusPanel: {
    borderRadius: 30,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  focusTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  focusEyebrow: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  focusTitle: {
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  focusBadge: {
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  focusBadgeText: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  focusSignals: {
    flexDirection: "row",
    gap: spacing.sm
  },
  signal: {
    flex: 1,
    minHeight: 76,
    borderRadius: 20,
    backgroundColor: colors.surfaceWarm,
    padding: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    gap: 2
  },
  signalLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800"
  },
  signalValue: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  manageButton: {
    minHeight: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.sun,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  manageButtonText: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  plantClusterRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg
  },
  plantCluster: {
    width: 94,
    alignItems: "center",
    gap: spacing.xs
  },
  statusRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 4,
    borderColor: colors.leaf,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center",
    justifyContent: "center"
  },
  statusRingWatch: {
    borderColor: colors.coral
  },
  statusGlyph: {
    color: colors.leafDeep,
    fontSize: typography.section,
    fontWeight: "900"
  },
  clusterTitle: {
    color: colors.text,
    fontSize: typography.caption,
    fontWeight: "900",
    textAlign: "center"
  },
  clusterMeta: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  containerRail: {
    gap: spacing.md,
    paddingRight: spacing.lg,
    paddingTop: spacing.sm
  },
  containerTile: {
    width: 154,
    minHeight: 198,
    borderRadius: 30,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "space-between"
  },
  containerTileAlt: {
    backgroundColor: colors.surfaceWarm
  },
  containerGlow: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.sage,
    alignItems: "center",
    justifyContent: "center"
  },
  containerGlyph: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "900"
  },
  containerName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    lineHeight: 20
  },
  containerStatus: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  }
});
