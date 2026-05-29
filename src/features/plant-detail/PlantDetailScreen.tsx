import { useEffect, useMemo, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { CareTask, GardenBed, GardenHomeModel, PlantInstance, PlantPhoto, PlantSpecies } from "../../domain";
import { getPlantKnowledge } from "../../data/plantKnowledge";
import { getDaysUntilHarvest, getPlantPlanMetrics } from "../../services/gardenPlanningRules";
import { getLatestPlantPhoto, getPlantPhotos } from "../../services/plantPhotos";
import { getPruningGuidance, getPruningTermsInText, hasRecentPruningActivity, pruningTermExplainers, PruningGuidance } from "../../services/pruningGuidance";
import { colors, radii, spacing, typography } from "../../theme/tokens";

type PlantDetailScreenProps = {
  plant: PlantInstance;
  model: GardenHomeModel;
  onBack: () => void;
  onMovePlant: () => void;
  onRemovePlant: () => void;
  onScanPlant: () => void;
  onRenamePlant: (plantId: string, displayName: string) => void;
  onMarkWatered: (plantId: string) => void;
  onHarvestPlant: (plantId: string) => void;
  onPruned: (plantId: string, note: string) => void;
  onAddPhoto: (plantId: string, uri: string, purpose?: PlantPhoto["purpose"], note?: string) => void;
};

type KnowledgeKey = "care" | "companions" | "pests" | "propagation" | "seed" | "harvest" | "guide";

export function PlantDetailScreen({ plant, model, onBack, onMovePlant, onRemovePlant, onScanPlant, onRenamePlant, onMarkWatered, onHarvestPlant, onPruned, onAddPhoto }: PlantDetailScreenProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [displayName, setDisplayName] = useState(plant.nickname);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<KnowledgeKey, boolean>>({
    care: false,
    companions: false,
    pests: false,
    propagation: false,
    seed: false,
    harvest: false,
    guide: false
  });

  const species = model.species.find((item) => item.id === plant.speciesId);
  const bed = plant.bedId ? model.beds.find((item) => item.id === plant.bedId) : undefined;
  const tasks = model.tasks.filter((task) => task.plantInstanceId === plant.id && task.status !== "done" && task.status !== "skipped");
  const knowledge = getPlantKnowledge(species, plant.nickname);
  const isReferencePlant = plant.id.startsWith("knowledge-");
  const metrics = getPlantPlanMetrics(species, plant.nickname);
  const daysUntilHarvest = getDaysUntilHarvest(plant, species);
  const photoHistory = getPlantPhotos(model, plant.id);
  const latestPhoto = getLatestPlantPhoto(model, plant);
  const pruningGuidance = hasRecentPruningActivity(model.tasks, plant.id) ? null : getPruningGuidance(plant, species, latestPhoto);
  const status = getPlantStatus(plant, tasks, daysUntilHarvest);
  const recentEvents = useMemo(() => buildRecentEvents(plant, photoHistory, tasks), [plant, photoHistory, tasks]);

  useEffect(() => {
    setDisplayName(plant.nickname);
    setIsRenaming(false);
  }, [plant.id, plant.nickname]);

  function toggleSection(key: KnowledgeKey) {
    setExpandedSections((current) => ({ ...current, [key]: !current[key] }));
  }

  function saveDisplayName() {
    if (!displayName.trim()) {
      return;
    }

    onRenamePlant(plant.id, displayName.trim());
    setIsRenaming(false);
  }

  async function addPhoto(source: "camera" | "library") {
    if (isReferencePlant) {
      return;
    }

    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.82 })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.82 });

    if (!result.canceled && result.assets[0]?.uri) {
      onAddPhoto(plant.id, result.assets[0].uri, "growth-log", "Photo update from plant detail.");
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader onBack={onBack} eyebrow={plant.locationType.replaceAll("-", " ")} title="" subtitle="" />

      <PlantHero
        plant={plant}
        species={species}
        bed={bed}
        model={model}
        latestPhoto={latestPhoto}
        status={status}
        commonName={knowledge.commonName}
        visual={knowledge.visual}
        daysUntilHarvest={daysUntilHarvest}
      />

      <QuickActions
        edible={metrics.edible}
        isReferencePlant={isReferencePlant}
        isRenaming={isRenaming}
        onWatered={() => onMarkWatered(plant.id)}
        onDiagnose={onScanPlant}
        onUpdatePhoto={() => addPhoto("camera")}
        onHarvest={() => onHarvestPlant(plant.id)}
        onPruned={() => onPruned(plant.id, pruningGuidance?.detail ?? "Pruning check completed. Take a quick photo after trimming if the shape changed.")}
        showPruning={Boolean(pruningGuidance)}
        onMove={onMovePlant}
        onRename={isRenaming ? saveDisplayName : () => setIsRenaming(true)}
        onRemove={onRemovePlant}
      />

      {isRenaming ? <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Display name" placeholderTextColor={colors.textMuted} style={styles.nameInput} /> : null}

      <CurrentPlantTasks
        tasks={tasks}
        pruningGuidance={pruningGuidance}
        expandedTaskId={expandedTaskId}
        onToggleWhy={(taskId) => setExpandedTaskId((current) => current === taskId ? null : taskId)}
      />

      {!isReferencePlant ? (
        <PhotoGrowthTimeline
          photos={photoHistory}
          onTakePhoto={() => addPhoto("camera")}
          onPickPhoto={() => addPhoto("library")}
          onDiagnose={onScanPlant}
        />
      ) : null}

      <TinyActivity events={recentEvents} />

      <View style={styles.knowledgeStack}>
        <ExpandableKnowledgeBlock
          title="Care"
          icon="water-outline"
          expanded={expandedSections.care}
          onToggle={() => toggleSection("care")}
          rows={[
            ["Light", knowledge.lightNeeds],
            ["Water", knowledge.watering],
            ["Feed", knowledge.feeding],
            ["Soil", knowledge.soil],
            ...(knowledge.spacing ? [["Spacing", knowledge.spacing] as [string, string]] : [])
          ]}
        />
        <ExpandableKnowledgeBlock
          title="Companion Plants"
          icon="people-outline"
          expanded={expandedSections.companions}
          onToggle={() => toggleSection("companions")}
          chips={[
            ...knowledge.companions.map((item) => `Good: ${item}`),
            ...knowledge.badCompanions.map((item) => `Avoid: ${item}`)
          ]}
          empty="No strong companion notes yet."
        />
        <ExpandableKnowledgeBlock
          title="Pest + Disease Watch"
          icon="bug-outline"
          expanded={expandedSections.pests}
          onToggle={() => toggleSection("pests")}
          chips={[...knowledge.pestsDiseases, ...knowledge.naturalControls.map((item) => `Action: ${item}`)]}
        />
        <ExpandableKnowledgeBlock
          title="Propagation"
          icon="git-branch-outline"
          expanded={expandedSections.propagation}
          onToggle={() => toggleSection("propagation")}
          text={knowledge.seedTransplantNotes ?? "Propagation guidance will come from species knowledge and future observations."}
        />
        <ExpandableKnowledgeBlock
          title="Seed + Transplant"
          icon="file-tray-full-outline"
          expanded={expandedSections.seed}
          onToggle={() => toggleSection("seed")}
          text={knowledge.seedTransplantNotes ?? "No seed or transplant notes are available yet."}
        />
        <ExpandableKnowledgeBlock
          title="Pruning + Harvest"
          icon="cut-outline"
          expanded={expandedSections.harvest}
          onToggle={() => toggleSection("harvest")}
          text={pruningGuidance ? `${pruningGuidance.detail} ${knowledge.pruningHarvestNotes ?? metrics.harvestWindow ?? ""}`.trim() : knowledge.pruningHarvestNotes ?? metrics.harvestWindow ?? "Harvest and pruning guidance will improve with plant knowledge and photo history."}
          highlightTerms
        />
        <ExpandableKnowledgeBlock
          title="Full Plant Guide"
          icon="book-outline"
          expanded={expandedSections.guide}
          onToggle={() => toggleSection("guide")}
          text={`Open Library for deeper guidance on ${knowledge.commonName}. Plant Detail stays focused on this specific plant's current state.`}
        />
      </View>
    </View>
  );
}

function PlantHero({
  plant,
  species,
  bed,
  model,
  latestPhoto,
  status,
  commonName,
  visual,
  daysUntilHarvest
}: {
  plant: PlantInstance;
  species?: PlantSpecies;
  bed?: GardenBed;
  model: GardenHomeModel;
  latestPhoto?: PlantPhoto;
  status: ReturnType<typeof getPlantStatus>;
  commonName: string;
  visual: string;
  daysUntilHarvest?: number;
}) {
  return (
    <View style={styles.hero}>
      {latestPhoto ? (
        <Image source={{ uri: latestPhoto.uri }} resizeMode="cover" style={styles.heroImage} />
      ) : (
        <View style={styles.heroFallback}>
          <View style={styles.heroFallbackOrb}>
            <Ionicons name="leaf" size={58} color={colors.leafDeep} />
          </View>
          <Text style={styles.heroFallbackText}>Add a photo to make this plant recognizable.</Text>
          <Text style={styles.heroGlyph}>{visual}</Text>
        </View>
      )}
      <View style={styles.heroOverlay} />
      <View style={styles.heroTop}>
        <View style={[styles.statusChip, { backgroundColor: status.background }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusChipText, { color: status.color }]}>{status.label}</Text>
        </View>
        <View style={styles.stageChip}>
          <Text style={styles.stageChipText}>{formatLabel(plant.stage ?? plant.source)}</Text>
        </View>
      </View>
      <View style={styles.heroBottom}>
        <Text style={styles.plantName}>{plant.nickname}</Text>
        <Text style={styles.speciesName}>{commonName}{species?.scientificName ? ` | ${species.scientificName}` : ""}</Text>
        <Text style={styles.locationText}>{locationLine(plant, bed, model)}</Text>
        {daysUntilHarvest !== undefined ? <Text style={styles.harvestCountdown}>{daysUntilHarvest} days until likely harvest</Text> : null}
      </View>
    </View>
  );
}

function QuickActions({
  edible,
  isReferencePlant,
  isRenaming,
  onWatered,
  onDiagnose,
  onUpdatePhoto,
  onHarvest,
  onPruned,
  showPruning,
  onMove,
  onRename,
  onRemove
}: {
  edible: boolean;
  isReferencePlant: boolean;
  isRenaming: boolean;
  onWatered: () => void;
  onDiagnose: () => void;
  onUpdatePhoto: () => void;
  onHarvest: () => void;
  onPruned: () => void;
  showPruning: boolean;
  onMove: () => void;
  onRename: () => void;
  onRemove: () => void;
}) {
  const actions = [
    { label: "Watered", icon: "water-outline" as const, onPress: onWatered, hidden: isReferencePlant },
    { label: "Diagnose", icon: "medkit-outline" as const, onPress: onDiagnose, hidden: false },
    { label: "Photo", icon: "camera-outline" as const, onPress: onUpdatePhoto, hidden: isReferencePlant },
    { label: "Pruned", icon: "cut-outline" as const, onPress: onPruned, hidden: isReferencePlant || !showPruning },
    { label: "Harvest", icon: "basket-outline" as const, onPress: onHarvest, hidden: isReferencePlant || !edible },
    { label: "Move", icon: "swap-horizontal-outline" as const, onPress: onMove, hidden: isReferencePlant },
    { label: isRenaming ? "Save" : "Rename", icon: "create-outline" as const, onPress: onRename, hidden: isReferencePlant },
    { label: "Remove", icon: "trash-outline" as const, onPress: onRemove, hidden: isReferencePlant, danger: true }
  ].filter((action) => !action.hidden);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionRail}>
      {actions.map((action) => (
        <TouchableOpacity key={action.label} accessibilityRole="button" style={[styles.quickAction, action.danger && styles.dangerAction]} onPress={action.onPress}>
          <Ionicons name={action.icon} size={20} color={action.danger ? colors.coral : colors.leafDeep} />
          <Text style={[styles.quickActionText, action.danger && styles.dangerActionText]}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function CurrentPlantTasks({ tasks, pruningGuidance, expandedTaskId, onToggleWhy }: { tasks: CareTask[]; pruningGuidance: PruningGuidance | null; expandedTaskId: string | null; onToggleWhy: (taskId: string) => void }) {
  const visibleTasks = tasks.slice(0, 3);
  return (
    <View style={styles.statusPanel}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Right now</Text>
        <Text style={styles.sectionMeta}>{tasks.length + (pruningGuidance ? 1 : 0)} open</Text>
      </View>
      {pruningGuidance ? (
        <View style={styles.pruningCoach}>
          <View style={styles.pruningIcon}>
            <Ionicons name="cut-outline" size={18} color={colors.leafDeep} />
          </View>
          <View style={styles.pruningCopy}>
            <Text style={styles.pruningTitle}>{pruningGuidance.title}</Text>
            <PruningTermText text={pruningGuidance.detail} style={styles.pruningText} />
          </View>
        </View>
      ) : null}
      {visibleTasks.length > 0 ? visibleTasks.map((task) => (
        <TaskLine key={task.id} task={task} expanded={expandedTaskId === task.id} onToggleWhy={() => onToggleWhy(task.id)} />
      )) : !pruningGuidance ? (
        <View style={styles.emptyTask}>
          <Ionicons name="checkmark-circle-outline" size={22} color={colors.leafDeep} />
          <Text style={styles.emptyText}>No immediate tasks for this plant.</Text>
        </View>
      ) : null}
    </View>
  );
}

function PhotoGrowthTimeline({ photos, onTakePhoto, onPickPhoto, onDiagnose }: { photos: PlantPhoto[]; onTakePhoto: () => void; onPickPhoto: () => void; onDiagnose: () => void }) {
  return (
    <View style={styles.photoPanel}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Growth timeline</Text>
          <Text style={styles.sectionMeta}>{photos.length > 0 ? `${photos.length} photo${photos.length === 1 ? "" : "s"}` : "No photos yet"}</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" style={styles.smallPill} onPress={onDiagnose}>
          <Ionicons name="medkit-outline" size={16} color={colors.leafDeep} />
          <Text style={styles.smallPillText}>Diagnose</Text>
        </TouchableOpacity>
      </View>
      {photos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRail}>
          {photos.map((photo, index) => (
            <View key={photo.id} style={styles.photoTile}>
              <Image source={{ uri: photo.uri }} style={styles.photoTileImage} />
              <View style={styles.photoBadge}>
                <Text style={styles.photoBadgeText}>{index === 0 ? "Latest" : photo.purpose}</Text>
              </View>
              <Text numberOfLines={1} style={styles.photoTileDate}>{formatPhotoDate(photo.takenAt)}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.emptyText}>Add weekly photos to make this plant feel alive over time.</Text>
      )}
      <View style={styles.photoActions}>
        <PrimaryButton label="Take update" onPress={onTakePhoto} tone="sun" icon={<Ionicons name="camera" size={19} color={colors.leafDeep} />} style={styles.photoActionButton} />
        <PrimaryButton label="Pick photo" onPress={onPickPhoto} tone="quiet" icon={<Ionicons name="images-outline" size={19} color={colors.leafDeep} />} style={styles.photoActionButton} />
      </View>
    </View>
  );
}

function TinyActivity({ events }: { events: string[] }) {
  return (
    <View style={styles.activityPanel}>
      <Text style={styles.sectionTitle}>Recent activity</Text>
      {events.map((event) => (
        <View key={event} style={styles.activityRow}>
          <View style={styles.activityDot} />
          <Text style={styles.activityText}>{event}</Text>
        </View>
      ))}
    </View>
  );
}

function ExpandableKnowledgeBlock({
  title,
  icon,
  expanded,
  onToggle,
  rows = [],
  chips = [],
  text,
  empty,
  highlightTerms = false
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  expanded: boolean;
  onToggle: () => void;
  rows?: Array<[string, string]>;
  chips?: string[];
  text?: string;
  empty?: string;
  highlightTerms?: boolean;
}) {
  return (
    <View style={styles.expandable}>
      <TouchableOpacity accessibilityRole="button" style={styles.expandableHeader} onPress={onToggle}>
        <View style={styles.expandableIcon}>
          <Ionicons name={icon} size={20} color={colors.leafDeep} />
        </View>
        <Text style={styles.expandableTitle}>{title}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={colors.textMuted} />
      </TouchableOpacity>
      {expanded ? (
        <View style={styles.expandableBody}>
          {rows.map(([label, value]) => (
            <View key={label} style={styles.careRow}>
              <Text style={styles.careLabel}>{label}</Text>
              <Text style={styles.careValue}>{value}</Text>
            </View>
          ))}
          {chips.length > 0 ? (
            <View style={styles.chipWrap}>
              {chips.map((chip) => <View key={chip} style={styles.chip}><Text style={styles.chipText}>{chip}</Text></View>)}
            </View>
          ) : null}
          {text ? (highlightTerms ? <PruningTermText text={text} style={styles.infoText} /> : <Text style={styles.infoText}>{text}</Text>) : null}
          {!rows.length && !chips.length && !text ? <Text style={styles.infoText}>{empty ?? "No details yet."}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

function TaskLine({ task, expanded, onToggleWhy }: { task: CareTask; expanded: boolean; onToggleWhy: () => void }) {
  const urgent = task.priority === "high" || task.priority === "urgent";
  return (
    <View style={[styles.taskLine, expanded && styles.taskLineExpanded]}>
      <View style={styles.taskLineTop}>
        <View style={[styles.taskDot, urgent && styles.hotDot]} />
        <View style={styles.taskCopy}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          {expanded || getPruningTermsInText(task.reason).length > 0 ? (
            <PruningTermText text={task.reason} style={styles.taskReason} numberOfLines={expanded ? 3 : 1} />
          ) : (
            <Text numberOfLines={1} style={styles.taskReason}>{task.reason}</Text>
          )}
        </View>
        <View style={styles.taskSide}>
          <Text style={[styles.taskPriority, urgent && styles.taskPriorityHot]}>{task.priority}</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.whyButton} onPress={onToggleWhy}>
            <Text style={styles.whyButtonText}>{expanded ? "Hide" : "Why"}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {expanded ? (
        <View style={styles.taskActionHint}>
          <Ionicons name="sparkles-outline" size={15} color={colors.leafDeep} />
          <Text style={styles.taskActionHintText}>Use the quick actions above when this is handled.</Text>
        </View>
      ) : null}
    </View>
  );
}

function PruningTermText({ text, style, numberOfLines }: { text: string; style: object; numberOfLines?: number }) {
  const terms = getPruningTermsInText(text);
  if (terms.length === 0) {
    return <Text numberOfLines={numberOfLines} style={style}>{text}</Text>;
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern).filter(Boolean);
  return (
    <Text numberOfLines={numberOfLines} style={style}>
      {parts.map((part, index) => {
        const term = terms.find((item) => item.toLowerCase() === part.toLowerCase());
        if (!term) {
          return <Text key={`${part}-${index}`}>{part}</Text>;
        }

        return (
          <Text key={`${part}-${index}`} style={styles.termHighlight} onPress={() => showTermExplainer(term)}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
}

function showTermExplainer(term: keyof typeof pruningTermExplainers) {
  const explainer = pruningTermExplainers[term];
  Alert.alert(explainer.title, `${explainer.summary}\n\nWhere to look: ${explainer.where}\n\nSafe move: ${explainer.safeAction}`);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getPlantStatus(plant: PlantInstance, tasks: CareTask[], daysUntilHarvest?: number) {
  if (tasks.some((task) => task.priority === "urgent" || task.priority === "high")) {
    return { label: "Needs attention", color: colors.coral, background: "#fff1ea" };
  }
  if (plant.healthStatus === "watch" || plant.healthStatus === "stressed") {
    return { label: "Watch", color: colors.coral, background: "#fff1ea" };
  }
  if (plant.stage === "flowering") {
    return { label: "Flowering", color: "#d99616", background: "#fff5d8" };
  }
  if (plant.stage === "fruiting" || (daysUntilHarvest !== undefined && daysUntilHarvest <= 14)) {
    return { label: "Harvest soon", color: "#d99616", background: "#fff5d8" };
  }
  return { label: "Thriving", color: colors.leafDeep, background: "#eef6e9" };
}

function buildRecentEvents(plant: PlantInstance, photos: PlantPhoto[], tasks: CareTask[]) {
  const events = [
    photos[0] ? `Photo updated ${formatRelativeDate(photos[0].takenAt)}` : undefined,
    tasks[0] ? `${tasks[0].title}` : undefined,
    plant.plantedOn ? `Added ${formatPhotoDate(plant.plantedOn)}` : "Added to your garden",
    plant.notes ? plant.notes : undefined
  ].filter(Boolean) as string[];

  return events.slice(0, 4);
}

function locationLine(plant: PlantInstance, bed: GardenBed | undefined, model: GardenHomeModel) {
  const garden = model.gardens.find((item) => item.id === plant.gardenId);
  return `${garden?.name ?? "Garden"} | ${bed?.name ?? plant.locationLabel}`;
}

function formatLabel(value: string) {
  return value.replace(/-/g, " ");
}

function formatPhotoDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

function formatRelativeDate(value: string) {
  const date = new Date(value).getTime();
  if (Number.isNaN(date)) {
    return "recently";
  }
  const days = Math.max(0, Math.round((Date.now() - date) / (24 * 60 * 60 * 1000)));
  if (days === 0) {
    return "today";
  }
  if (days === 1) {
    return "yesterday";
  }
  return `${days} days ago`;
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg
  },
  hero: {
    height: 390,
    borderRadius: 36,
    overflow: "hidden",
    backgroundColor: colors.leafDeep
  },
  heroImage: {
    width: "100%",
    height: "100%"
  },
  heroFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dfead6",
    gap: spacing.md
  },
  heroFallbackOrb: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "rgba(255,253,248,0.82)",
    alignItems: "center",
    justifyContent: "center"
  },
  heroFallbackText: {
    maxWidth: 220,
    color: colors.leafDeep,
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: "900",
    textAlign: "center"
  },
  heroGlyph: {
    color: "rgba(36,79,55,0.18)",
    fontSize: 46,
    fontWeight: "900"
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 31, 19, 0.34)"
  },
  heroTop: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  statusChip: {
    minHeight: 38,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5
  },
  statusChipText: {
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  stageChip: {
    minHeight: 38,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.md,
    justifyContent: "center"
  },
  stageChipText: {
    color: colors.white,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  heroBottom: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    gap: spacing.xs
  },
  plantName: {
    color: colors.white,
    fontSize: 38,
    lineHeight: 41,
    fontWeight: "900"
  },
  speciesName: {
    color: "rgba(255,255,255,0.84)",
    fontSize: typography.small,
    lineHeight: 19,
    fontWeight: "800"
  },
  locationText: {
    color: "rgba(255,255,255,0.76)",
    fontSize: typography.caption,
    fontWeight: "800"
  },
  harvestCountdown: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: "rgba(244,200,95,0.92)",
    color: colors.leafDeep,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.caption,
    fontWeight: "900",
    overflow: "hidden"
  },
  quickActionRail: {
    gap: spacing.sm,
    paddingRight: spacing.lg
  },
  quickAction: {
    minWidth: 92,
    minHeight: 72,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm
  },
  dangerAction: {
    backgroundColor: "#fff1ea",
    borderColor: "#efc3b6"
  },
  quickActionText: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  dangerActionText: {
    color: colors.coral
  },
  nameInput: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  statusPanel: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  taskLine: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: colors.surfaceWarm,
    padding: spacing.sm,
    gap: spacing.sm
  },
  taskLineExpanded: {
    backgroundColor: "#f8f1e5"
  },
  taskLineTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  taskDot: {
    width: 10,
    height: 34,
    borderRadius: 6,
    backgroundColor: colors.sage
  },
  hotDot: {
    backgroundColor: colors.coral
  },
  taskCopy: {
    flex: 1
  },
  taskTitle: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "900"
  },
  taskReason: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
    marginTop: 3
  },
  taskPriority: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  taskPriorityHot: {
    color: colors.coral
  },
  taskSide: {
    alignItems: "flex-end",
    gap: spacing.xs
  },
  whyButton: {
    minHeight: 30,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    justifyContent: "center"
  },
  whyButtonText: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  taskActionHint: {
    marginLeft: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255,253,248,0.74)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  taskActionHintText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800"
  },
  emptyTask: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  pruningCoach: {
    minHeight: 78,
    borderRadius: 20,
    backgroundColor: "#eef6e9",
    borderWidth: 1,
    borderColor: "#d7e7d1",
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.sm
  },
  pruningIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  pruningCopy: {
    flex: 1,
    gap: spacing.xs
  },
  pruningTitle: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  pruningText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18,
    fontWeight: "800"
  },
  termHighlight: {
    color: colors.leafDeep,
    fontWeight: "900",
    textDecorationLine: "underline"
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: "800"
  },
  photoPanel: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  smallPill: {
    minHeight: 38,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceWarm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md
  },
  smallPillText: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  photoRail: {
    gap: spacing.sm,
    paddingRight: spacing.lg
  },
  photoTile: {
    width: 142,
    gap: spacing.xs
  },
  photoTileImage: {
    width: 142,
    height: 112,
    borderRadius: 22,
    backgroundColor: colors.surfaceWarm
  },
  photoBadge: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,253,248,0.88)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3
  },
  photoBadgeText: {
    color: colors.leafDeep,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  photoTileDate: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  photoActions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  photoActionButton: {
    flex: 1
  },
  activityPanel: {
    borderRadius: 24,
    backgroundColor: colors.surfaceWarm,
    padding: spacing.lg,
    gap: spacing.sm
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.leaf
  },
  activityText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800",
    lineHeight: 20
  },
  knowledgeStack: {
    gap: spacing.sm
  },
  expandable: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  expandableHeader: {
    minHeight: 64,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  expandableIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eef6e9",
    alignItems: "center",
    justifyContent: "center"
  },
  expandableTitle: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  expandableBody: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm
  },
  careRow: {
    gap: 3
  },
  careLabel: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  careValue: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800",
    lineHeight: 20
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  chip: {
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  chipText: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  infoText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 21,
    fontWeight: "800"
  }
});
