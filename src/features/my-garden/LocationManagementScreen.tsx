import { useEffect, useState } from "react";
import { Alert, DimensionValue, GestureResponderEvent, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { GardenBed, GardenHomeModel, GardenZone, PlantInstance, PlantSpecies, SunBand } from "../../domain";
import { getPlantKnowledge } from "../../data/plantKnowledge";
import { aiRecommendationProvider, AiBedOptimization } from "../../services/aiRecommendationProvider";
import { getBedPlanningSummary, getPlantPlanMetrics } from "../../services/gardenPlanningRules";
import { getLatestPlantPhoto } from "../../services/plantPhotos";
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
  onRepositionPlant: (plantId: string, xPercent: number, yPercent: number) => void;
  onUpdateBed: (bedId: string, updates: { name: string; lengthFeet: number; widthFeet: number; depthInches?: number }) => void;
  onUpdateSunExposure: (bedId: string, exposure: SunBand) => void;
  onDiagnose?: () => void;
};

const sunOptions: Array<{ value: SunBand; label: string }> = [
  { value: "full-sun", label: "Full sun" },
  { value: "part-sun", label: "Part sun" },
  { value: "part-shade", label: "Part shade" },
  { value: "shade", label: "Shade" }
];

export function LocationManagementScreen({
  model,
  placement,
  onBack,
  onAddPlant,
  onOpenPlant,
  onMovePlant,
  onRemovePlant,
  onRepositionPlant,
  onUpdateBed,
  onUpdateSunExposure,
  onDiagnose
}: LocationManagementScreenProps) {
  const [isEditingBed, setIsEditingBed] = useState(false);
  const [isMappingSun, setIsMappingSun] = useState(false);
  const [manualSunExposure, setManualSunExposure] = useState<SunBand>("part-sun");
  const [replantingPlantId, setReplantingPlantId] = useState<string | null>(null);
  const [movingToAnotherPlantId, setMovingToAnotherPlantId] = useState<string | null>(null);
  const [optimization, setOptimization] = useState<AiBedOptimization | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const plants = getPlantsForPlacement(model.plantInstances, placement);
  const bed = placement.bedId ? model.beds.find((item) => item.id === placement.bedId) : undefined;
  const [bedName, setBedName] = useState(bed?.name ?? placement.label);
  const [lengthFeet, setLengthFeet] = useState(String(bed?.lengthFeet ?? ""));
  const [widthFeet, setWidthFeet] = useState(String(bed?.widthFeet ?? ""));
  const [depthInches, setDepthInches] = useState(String(bed?.depthInches ?? ""));
  const sunProfile = bed ? model.sunProfiles.find((item) => item.bedId === bed.id) : undefined;
  const placements = getGardenPlacements(model).filter((item) => item.id !== placement.id);
  const planning = getBedPlanningSummary(bed, plants, model.species);
  const overcrowded = planning.warnings.length > 0;

  useEffect(() => {
    setIsEditingBed(false);
    setBedName(bed?.name ?? placement.label);
    setLengthFeet(String(bed?.lengthFeet ?? ""));
    setWidthFeet(String(bed?.widthFeet ?? ""));
    setDepthInches(String(bed?.depthInches ?? ""));
    setManualSunExposure(sunProfile?.midday ?? "part-sun");
    setIsMappingSun(false);
  }, [bed?.id, bed?.name, bed?.lengthFeet, bed?.widthFeet, bed?.depthInches, placement.label, sunProfile?.midday]);

  function confirmRemove(plant: PlantInstance) {
    Alert.alert("Remove this plant from your garden?", plant.nickname, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => onRemovePlant(plant.id) }
    ]);
  }

  function confirmHarvest(plant: PlantInstance) {
    Alert.alert("Harvest and remove this plant from the bed?", plant.nickname, [
      { text: "Cancel", style: "cancel" },
      { text: "Harvest", style: "destructive", onPress: () => onRemovePlant(plant.id) }
    ]);
  }

  function openPlantMenu(plant: PlantInstance) {
    Alert.alert(plant.nickname, "Choose an action for this plant.", [
      { text: "Harvest", onPress: () => confirmHarvest(plant) },
      { text: "Move", onPress: () => openMoveMenu(plant) },
      { text: "Rename", onPress: () => onOpenPlant(plant.id) },
      { text: "Details", onPress: () => onOpenPlant(plant.id) },
      { text: "Remove", style: "destructive", onPress: () => confirmRemove(plant) },
      { text: "Cancel", style: "cancel" }
    ]);
  }

  function openMoveMenu(plant: PlantInstance) {
    Alert.alert("Move plant", plant.nickname, [
      { text: "Move within this bed", onPress: () => setReplantingPlantId(plant.id) },
      { text: "Move to another bed", onPress: () => setMovingToAnotherPlantId(plant.id) },
      { text: "Cancel", style: "cancel" }
    ]);
  }

  function handleBedPress(event: GestureResponderEvent) {
    if (!replantingPlantId) {
      return;
    }

    const { locationX, locationY } = event.nativeEvent;
    const xPercent = Math.max(4, Math.min(88, (locationX / 320) * 100));
    const yPercent = Math.max(4, Math.min(84, (locationY / 230) * 100));

    Alert.alert("Replant here?", "Move this plant to the selected spot in the bed.", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: () => {
          onRepositionPlant(replantingPlantId, Math.round(xPercent), Math.round(yPercent));
          setReplantingPlantId(null);
        }
      }
    ]);
  }

  function saveBedEdits() {
    if (!bed || !bedName.trim()) {
      return;
    }

    onUpdateBed(bed.id, {
      name: bedName.trim(),
      lengthFeet: Number(lengthFeet) || bed.lengthFeet,
      widthFeet: Number(widthFeet) || bed.widthFeet,
      depthInches: depthInches.trim() ? Number(depthInches) || bed.depthInches : undefined
    });
    setIsEditingBed(false);
  }

  async function optimizeBed() {
    setIsOptimizing(true);
    try {
      const result = await aiRecommendationProvider.optimizeBed({ bed, plants, species: model.species, sunProfile });
      setOptimization(result);
    } catch {
      Alert.alert("AI Optimize Bed", "Pattypan could not reach the AI provider. Local spacing rules are still available below.");
    } finally {
      setIsOptimizing(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader onBack={onBack} eyebrow={placement.kind} title={placement.label} subtitle={bed ? `${bed.lengthFeet}ft x ${bed.widthFeet}ft - ${bed.soilType.replaceAll("-", " ")}` : placement.locationLabel} />

      <View style={styles.environmentPanel}>
        <Signal icon="sunny-outline" label="sun" value={sunProfile ? `${sunProfile.confidence === "low" ? "Est. " : ""}${sunProfile.estimatedDailySunHours}h` : "Not mapped"} />
        <Signal icon="water-outline" label="moisture" value={placement.kind === "indoor" ? "Check manually" : "Sensor off"} />
        <Signal icon="leaf-outline" label="plants" value={`${plants.length}`} />
      </View>
      {bed ? (
        <TouchableOpacity accessibilityRole="button" style={styles.mapSunButton} onPress={() => setIsMappingSun((current) => !current)}>
          <Ionicons name="sunny-outline" size={18} color={colors.leafDeep} />
          <Text style={styles.mapSunText}>{sunProfile ? "Refine Sun Exposure" : "Map Sun Exposure"}</Text>
        </TouchableOpacity>
      ) : null}

      {bed && isMappingSun ? (
        <View style={styles.sunMapper}>
          <Text style={styles.notesTitle}>Set sun exposure manually</Text>
          <Text style={styles.notesText}>Use what you observe today. Compass and shade-source mapping can refine this later.</Text>
          <View style={styles.sunChips}>
            {sunOptions.map((option) => (
              <TouchableOpacity key={option.value} accessibilityRole="button" style={[styles.sunChip, manualSunExposure === option.value && styles.sunChipActive]} onPress={() => setManualSunExposure(option.value)}>
                <Text style={[styles.sunChipText, manualSunExposure === option.value && styles.sunChipTextActive]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <PrimaryButton
            label="Save sun exposure"
            onPress={() => {
              onUpdateSunExposure(bed.id, manualSunExposure);
              setIsMappingSun(false);
            }}
            tone="sun"
            icon={<Ionicons name="sunny-outline" size={20} color={colors.leafDeep} />}
          />
        </View>
      ) : null}

      {bed ? (
        <View style={styles.bedEditor}>
          <View style={styles.bedEditorTop}>
            <Text style={styles.notesTitle}>{isEditingBed ? "Edit bed" : "Overhead layout"}</Text>
            <TouchableOpacity accessibilityRole="button" style={styles.smallPill} onPress={isEditingBed ? saveBedEdits : () => setIsEditingBed(true)}>
              <Text style={styles.smallPillText}>{isEditingBed ? "Save" : "Edit bed"}</Text>
            </TouchableOpacity>
          </View>

          {isEditingBed ? (
            <View style={styles.editGrid}>
              <TextInput value={bedName} onChangeText={setBedName} placeholder="Bed name" placeholderTextColor={colors.textMuted} style={styles.input} />
              <TextInput value={lengthFeet} onChangeText={setLengthFeet} keyboardType="numeric" placeholder="Length ft" placeholderTextColor={colors.textMuted} style={styles.input} />
              <TextInput value={widthFeet} onChangeText={setWidthFeet} keyboardType="numeric" placeholder="Width ft" placeholderTextColor={colors.textMuted} style={styles.input} />
              <TextInput value={depthInches} onChangeText={setDepthInches} keyboardType="numeric" placeholder="Depth in" placeholderTextColor={colors.textMuted} style={styles.input} />
            </View>
          ) : (
            <TouchableOpacity accessibilityRole="button" activeOpacity={0.92} style={[styles.overheadBed, replantingPlantId && styles.overheadBedActive, overcrowded && styles.overheadBedWarning]} onPress={handleBedPress}>
              {replantingPlantId ? <Text style={styles.dragModeBanner}>Move mode: tap a new spot, then confirm.</Text> : <Text style={styles.dragModeSubtle}>Long-press a plant marker for Harvest, Move, Rename, Details, or Remove.</Text>}
              {plants.slice(0, 9).map((plant, index) => {
                const species = model.species.find((item) => item.id === plant.speciesId);
                const knowledge = getPlantKnowledge(species, plant.nickname);
                const photo = getLatestPlantPhoto(model, plant);
                const spacing = getPlantPlanMetrics(species, plant.nickname).spacingInches;
                const point =
                  plant.positionXPercent !== undefined && plant.positionYPercent !== undefined
                    ? { left: `${plant.positionXPercent}%` as DimensionValue, top: `${plant.positionYPercent}%` as DimensionValue }
                    : getPoint(index);
                return (
                  <TouchableOpacity
                    key={plant.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${plant.nickname}. Long press for actions.`}
                    style={[styles.spacingCircle, overcrowded && styles.spacingCircleWarning, plant.id === replantingPlantId && styles.spacingCircleMoving, { left: point.left, top: point.top, width: spacing * 2.2, height: spacing * 2.2, borderRadius: spacing * 1.1 }]}
                    onPress={() => onOpenPlant(plant.id)}
                    onLongPress={() => openPlantMenu(plant)}
                    delayLongPress={350}
                  >
                    {photo ? <Image source={{ uri: photo.uri }} style={styles.spacingPhoto} /> : <Text style={styles.spacingGlyph}>{knowledge.visual}</Text>}
                  </TouchableOpacity>
                );
              })}
              {replantingPlantId ? <Text style={styles.replantHint}>Spacing circle stays visible while choosing a new spot.</Text> : null}
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {overcrowded ? (
        <View style={styles.warning}>
          <Ionicons name="warning-outline" size={20} color={colors.coral} />
          <Text style={styles.warningText}>{planning.warnings[0]}</Text>
        </View>
      ) : null}

      <PrimaryButton label="Add plant here" onPress={() => onAddPlant(placement)} tone="sun" icon={<Ionicons name="add" size={20} color={colors.leafDeep} />} />
      {onDiagnose ? <PrimaryButton label="Diagnose Issue" onPress={onDiagnose} tone="quiet" icon={<Ionicons name="camera-outline" size={20} color={colors.leafDeep} />} /> : null}
      {bed ? <PrimaryButton label={isOptimizing ? "Optimizing..." : "AI Optimize Bed"} onPress={optimizeBed} tone="quiet" icon={<Ionicons name="sparkles-outline" size={20} color={colors.leafDeep} />} /> : null}

      {optimization ? (
        <View style={styles.optimizationPanel}>
          <Text style={styles.notesTitle}>{optimization.provider === "openai" ? "Pattypan AI plan" : "Local rules plan"}</Text>
          <Text style={styles.notesText}>{optimization.summary}</Text>
          {[...optimization.warnings, ...optimization.recommendations].slice(0, 6).map((item) => (
            <Text key={item} style={styles.notesText}>- {item}</Text>
          ))}
          <Text style={styles.confidenceText}>Confidence: {optimization.confidence}. Review before moving plants.</Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Plants here</Text>
      {plants.length === 0 ? <Text style={styles.emptyText}>No plants here yet. Add one to make this space alive.</Text> : null}
      {plants.map((plant) => {
        const species = model.species.find((item) => item.id === plant.speciesId);
        const knowledge = getPlantKnowledge(species, plant.nickname);
        const photo = getLatestPlantPhoto(model, plant);

        return (
          <View key={plant.id} style={styles.plantRow}>
            <TouchableOpacity accessibilityRole="button" style={styles.plantMain} onPress={() => onOpenPlant(plant.id)}>
              <View style={[styles.plantOrb, plant.healthStatus === "watch" && styles.plantOrbWatch]}>
                {photo ? <Image source={{ uri: photo.uri }} style={styles.plantOrbImage} /> : <Text style={styles.plantGlyph}>{knowledge.visual}</Text>}
              </View>
              <View style={styles.plantCopy}>
                <Text style={styles.plantName}>{plant.nickname}</Text>
                <Text style={styles.plantMeta}>{knowledge.commonName} - {plant.stage ?? plant.source}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity accessibilityRole="button" style={styles.actionMenuButton} onPress={() => openPlantMenu(plant)}>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.leafDeep} />
              <Text style={styles.actionMenuText}>Plant actions</Text>
            </TouchableOpacity>

            {movingToAnotherPlantId === plant.id ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moveRail}>
                {placements.slice(0, 7).map((target) => (
                  <TouchableOpacity
                    key={target.id}
                    accessibilityRole="button"
                    style={styles.moveChip}
                    onPress={() => {
                      onMovePlant(plant.id, target);
                      setMovingToAnotherPlantId(null);
                    }}
                  >
                    <Text style={styles.moveChipText}>Move to {target.label.replace("Raised ", "")}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : null}

            <View style={styles.inlineActions}>
              <TouchableOpacity accessibilityRole="button" style={styles.miniAction} onPress={() => confirmHarvest(plant)}>
                <Text style={styles.miniActionText}>Harvest</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" style={styles.miniAction} onPress={() => openMoveMenu(plant)}>
                <Text style={styles.miniActionText}>Move</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" style={styles.removeMiniAction} onPress={() => confirmRemove(plant)}>
                <Text style={styles.removeMiniActionText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <View style={styles.notesPanel}>
        <Text style={styles.notesTitle}>Companion + spacing notes</Text>
        <Text style={styles.notesText}>{getCompanionSummary(plants, model.species)}</Text>
        {planning.suggestions.map((suggestion) => (
          <Text key={suggestion} style={styles.notesText}>- {suggestion}</Text>
        ))}
      </View>
    </View>
  );
}

function getPoint(index: number): { left: DimensionValue; top: DimensionValue } {
  const points: Array<{ left: DimensionValue; top: DimensionValue }> = [
    { left: "8%", top: "12%" },
    { left: "42%", top: "10%" },
    { left: "68%", top: "16%" },
    { left: "16%", top: "48%" },
    { left: "48%", top: "46%" },
    { left: "72%", top: "50%" },
    { left: "10%", top: "72%" },
    { left: "44%", top: "72%" },
    { left: "70%", top: "74%" }
  ];
  return points[index % points.length];
}

export function getGardenPlacements(model: GardenHomeModel): GardenPlacement[] {
  const homeGarden = model.gardens.find((garden) => garden.id === "garden-home") ?? model.gardens[0];
  const indoorGarden = model.gardens.find((garden) => garden.id === "garden-indoor") ?? model.gardens[0];
  if (!homeGarden && !indoorGarden) {
    return [];
  }

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
    ...(homeGarden
      ? [{
          id: "container-patio",
          label: "Patio container",
          gardenId: homeGarden.id,
          locationLabel: "Patio container",
          locationType: "container" as const,
          kind: "container" as const
        }]
      : []),
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

  return `${names} are sharing this space. Companion checks currently use local rules and will become richer as planner intelligence grows.`;
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
  mapSunButton: {
    minHeight: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  mapSunText: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  sunMapper: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm
  },
  sunChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  sunChip: {
    minHeight: 42,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  sunChipActive: {
    backgroundColor: colors.leafDeep,
    borderColor: colors.leafDeep
  },
  sunChipText: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  sunChipTextActive: {
    color: colors.white
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
  bedEditor: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md
  },
  bedEditorTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  smallPill: {
    minHeight: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  smallPillText: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  editGrid: {
    gap: spacing.sm
  },
  input: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  overheadBed: {
    height: 230,
    borderRadius: 24,
    backgroundColor: "#8a6248",
    borderWidth: 3,
    borderColor: colors.soil,
    overflow: "hidden"
  },
  overheadBedActive: {
    borderColor: colors.sun,
    borderWidth: 4
  },
  overheadBedWarning: {
    borderColor: colors.coral
  },
  dragModeBanner: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    top: spacing.md,
    zIndex: 2,
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900",
    textAlign: "center",
    backgroundColor: "rgba(244,200,95,0.92)",
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm
  },
  dragModeSubtle: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    top: spacing.md,
    zIndex: 2,
    color: colors.white,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
    backgroundColor: "rgba(36,79,55,0.58)",
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm
  },
  spacingCircle: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.74)",
    backgroundColor: "rgba(94, 143, 76, 0.64)",
    alignItems: "center",
    justifyContent: "center"
  },
  spacingCircleMoving: {
    backgroundColor: "rgba(244,200,95,0.72)",
    borderColor: colors.white
  },
  spacingCircleWarning: {
    borderColor: "rgba(217,109,91,0.96)"
  },
  replantHint: {
    position: "absolute",
    left: spacing.md,
    bottom: spacing.md,
    color: colors.white,
    fontSize: typography.small,
    fontWeight: "900",
    backgroundColor: "rgba(36,79,55,0.8)",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  spacingGlyph: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: "900"
  },
  spacingPhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 999
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
  plantOrbImage: {
    width: "100%",
    height: "100%",
    borderRadius: 29
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
  actionMenuButton: {
    minHeight: 42,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceWarm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  actionMenuText: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  inlineActions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  miniAction: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center",
    justifyContent: "center"
  },
  miniActionText: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  removeMiniAction: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.pill,
    backgroundColor: "#fff0e9",
    alignItems: "center",
    justifyContent: "center"
  },
  removeMiniActionText: {
    color: colors.coral,
    fontSize: typography.caption,
    fontWeight: "900"
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
  optimizationPanel: {
    borderRadius: 24,
    backgroundColor: "#eef6e9",
    borderWidth: 1,
    borderColor: colors.border,
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
  },
  confidenceText: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  }
});
