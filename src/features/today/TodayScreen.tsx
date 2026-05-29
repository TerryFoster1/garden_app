import { useMemo, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CareTask, CareTaskType, GardenHomeModel, PlantInstance, PlantPhoto, PlantSpecies } from "../../domain";
import { getPruningGuidance, hasRecentPruningActivity } from "../../services/pruningGuidance";
import { colors, radii, spacing, typography } from "../../theme/tokens";

type TodayScreenProps = {
  model: GardenHomeModel;
  onOpenWeatherAlerts: () => void;
  onOpenPlant: (plantId: string) => void;
  onAddPlant: () => void;
  onCreateGarden: () => void;
  onLoadDemoGarden: () => void;
  onOpenGarden: () => void;
  onCompleteTask: (taskId: string) => void;
  onSnoozeTask: (taskId: string) => void;
  onLogPruningAttention: (plantId: string, note: string) => void;
};

type AttentionKind = "water" | "skip-water" | "photo" | "light" | "feed" | "harvest" | "diagnose" | "weather" | "prune";

type PlantQueueEntry = {
  plant: PlantInstance;
  species?: PlantSpecies;
  photo?: PlantPhoto;
  reasons: Array<{ kind: AttentionKind; label: string; detail: string; taskId?: string; priority: CareTask["priority"] }>;
};

const reasonIcons: Record<AttentionKind, keyof typeof Ionicons.glyphMap> = {
  water: "water-outline",
  "skip-water": "water",
  photo: "camera-outline",
  light: "sunny-outline",
  feed: "nutrition-outline",
  harvest: "basket-outline",
  diagnose: "warning-outline",
  weather: "partly-sunny-outline",
  prune: "cut-outline"
};

const priorityWeight: Record<CareTask["priority"], number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3
};

export function TodayScreen({ model, onOpenWeatherAlerts, onOpenPlant, onAddPlant, onCreateGarden, onLoadDemoGarden, onOpenGarden, onCompleteTask, onSnoozeTask, onLogPruningAttention }: TodayScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dismissedPlantIds, setDismissedPlantIds] = useState<string[]>([]);

  const queue = useMemo(() => buildPlantQueue(model).filter((entry) => !dismissedPlantIds.includes(entry.plant.id)), [dismissedPlantIds, model]);
  const activeEntry = queue[Math.min(activeIndex, Math.max(queue.length - 1, 0))];
  const displayName = model.user.name.trim();
  const greeting = `${getGreeting()}${displayName ? `, ${displayName}` : ""}.`;

  function goNext() {
    setActiveIndex((current) => Math.min(current + 1, Math.max(queue.length - 1, 0)));
  }

  function goPrevious() {
    setActiveIndex((current) => Math.max(current - 1, 0));
  }

  function completePlantAttention(entry: PlantQueueEntry) {
    const pruningReasons = entry.reasons.filter((reason) => reason.kind === "prune");
    entry.reasons.forEach((reason) => {
      if (reason.taskId) {
        onCompleteTask(reason.taskId);
      }
    });
    if (pruningReasons.length > 0) {
      onLogPruningAttention(entry.plant.id, pruningReasons.map((reason) => reason.detail).join(" "));
    }
    setDismissedPlantIds((current) => [...new Set([...current, entry.plant.id])]);
    setActiveIndex((current) => Math.min(current, Math.max(queue.length - 2, 0)));
  }

  function snoozePlantAttention(entry: PlantQueueEntry) {
    entry.reasons.forEach((reason) => {
      if (reason.taskId) {
        onSnoozeTask(reason.taskId);
      }
    });
    setDismissedPlantIds((current) => [...new Set([...current, entry.plant.id])]);
    setActiveIndex((current) => Math.min(current, Math.max(queue.length - 2, 0)));
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.title}>{queue.length > 0 ? `${queue.length} plant${queue.length === 1 ? "" : "s"} would like attention today.` : "Your garden is quiet today."}</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Add plant" style={styles.addButton} onPress={onAddPlant}>
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity accessibilityRole="button" activeOpacity={0.86} style={styles.weatherStrip} onPress={onOpenWeatherAlerts}>
        <Ionicons name={getWeatherIcon(model)} size={22} color={colors.leafDeep} />
        <Text style={styles.weatherText}>{getWeatherNudge(model)}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.leafDeep} />
      </TouchableOpacity>

      {activeEntry ? (
        <View style={styles.queueArea}>
          <PlantAttentionCard entry={activeEntry} index={Math.min(activeIndex, queue.length - 1)} total={queue.length} onOpenDetails={() => onOpenPlant(activeEntry.plant.id)} onDone={() => completePlantAttention(activeEntry)} onLater={() => snoozePlantAttention(activeEntry)} />
          <View style={styles.gestureBar}>
            <TouchableOpacity accessibilityRole="button" disabled={activeIndex === 0} style={[styles.navButton, activeIndex === 0 && styles.navButtonDisabled]} onPress={goPrevious}>
              <Ionicons name="chevron-back" size={18} color={activeIndex === 0 ? colors.textMuted : colors.leafDeep} />
              <Text style={[styles.navButtonText, activeIndex === 0 && styles.navButtonTextDisabled]}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={styles.detailsButton} onPress={() => onOpenPlant(activeEntry.plant.id)}>
              <Ionicons name="arrow-up" size={18} color={colors.white} />
              <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" disabled={activeIndex >= queue.length - 1} style={[styles.navButton, activeIndex >= queue.length - 1 && styles.navButtonDisabled]} onPress={goNext}>
              <Text style={[styles.navButtonText, activeIndex >= queue.length - 1 && styles.navButtonTextDisabled]}>Next</Text>
              <Ionicons name="chevron-forward" size={18} color={activeIndex >= queue.length - 1 ? colors.textMuted : colors.leafDeep} />
            </TouchableOpacity>
          </View>
          <Text style={styles.gestureHint}>Later: swipe between plants, swipe up for details, swipe down when done.</Text>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyPhoto}>
            <Ionicons name="leaf" size={76} color={colors.sage} />
            <View style={styles.emptyGlow} />
          </View>
          <Text style={styles.emptyTitle}>{model.plantInstances.length > 0 ? "Everything looks good today." : "Start your plant diary."}</Text>
          <Text style={styles.emptyText}>
            {model.plantInstances.length > 0
              ? "No plants need a look right now. Pattypan will bring one forward when weather, care rhythm, or photo updates matter."
              : "Add your first plant, take a starting photo, and Pattypan will begin building a daily attention rhythm."}
          </Text>
          <TouchableOpacity accessibilityRole="button" style={styles.primaryCta} onPress={onAddPlant}>
            <Ionicons name="camera-outline" size={20} color={colors.white} />
            <Text style={styles.primaryCtaText}>Add Plant</Text>
          </TouchableOpacity>
          <View style={styles.emptyActions}>
            <TouchableOpacity accessibilityRole="button" style={styles.secondaryCta} onPress={model.plantInstances.length > 0 ? onOpenGarden : onCreateGarden}>
              <Text style={styles.secondaryCtaText}>{model.plantInstances.length > 0 ? "Open My Garden" : "Create Garden"}</Text>
            </TouchableOpacity>
            {model.plantInstances.length === 0 ? (
              <TouchableOpacity accessibilityRole="button" style={styles.secondaryCta} onPress={onLoadDemoGarden}>
                <Text style={styles.secondaryCtaText}>Load Demo Garden</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
}

function PlantAttentionCard({ entry, index, total, onOpenDetails, onDone, onLater }: { entry: PlantQueueEntry; index: number; total: number; onOpenDetails: () => void; onDone: () => void; onLater: () => void }) {
  const primaryReason = entry.reasons[0];
  const photoUri = entry.photo?.uri;

  return (
    <View style={styles.card}>
      <View style={styles.photoFrame}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.plantPhoto} />
        ) : (
          <View style={styles.photoFallback}>
            <Ionicons name="leaf" size={92} color={colors.sage} />
            <Text style={styles.photoFallbackText}>Take a starting photo</Text>
          </View>
        )}
        <View style={styles.photoShade} />
        <View style={styles.counterPill}>
          <Text style={styles.counterText}>{index + 1} / {total}</Text>
        </View>
        <View style={styles.needRail}>
          {entry.reasons.slice(0, 5).map((reason) => (
            <View key={`${reason.kind}-${reason.taskId ?? reason.label}`} style={styles.needIcon}>
              <Ionicons name={reasonIcons[reason.kind]} size={19} color={colors.white} />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.cardCopy}>
        <Text style={styles.plantName}>{entry.plant.nickname}</Text>
        <Text style={styles.speciesName}>{entry.species?.commonName ?? "Plant"} - {entry.plant.locationLabel}</Text>
        <Text style={styles.statusText}>{primaryReason?.label ?? "Quick check"}</Text>
        <Text style={styles.guidanceText}>{primaryReason?.detail ?? "Take a quick look and add a diary photo if anything changed."}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity accessibilityRole="button" style={styles.softAction} onPress={onLater}>
          <Text style={styles.softActionText}>Later</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={styles.photoAction} onPress={onOpenDetails}>
          <Ionicons name="camera-outline" size={18} color={colors.white} />
          <Text style={styles.photoActionText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={styles.doneAction} onPress={onDone}>
          <Ionicons name="checkmark" size={18} color={colors.white} />
          <Text style={styles.doneActionText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function buildPlantQueue(model: GardenHomeModel): PlantQueueEntry[] {
  const now = Date.now();
  const openTasks = model.tasks.filter((task) => task.status !== "done" && task.status !== "skipped");

  return model.plantInstances
    .map((plant) => {
      const species = model.species.find((item) => item.id === plant.speciesId);
      const plantPhotos = (model.plantPhotos ?? []).filter((photo) => photo.plantInstanceId === plant.id).sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
      const latestPhoto = plant.currentProfilePhotoId ? plantPhotos.find((photo) => photo.id === plant.currentProfilePhotoId) ?? plantPhotos[0] : plantPhotos[0];
      const plantTasks = openTasks.filter((task) => task.plantInstanceId === plant.id);
      const reasons = plantTasks.map((task) => taskToAttentionReason(task));
      const latestPhotoTime = latestPhoto ? new Date(latestPhoto.takenAt).getTime() : 0;
      const photoAgeDays = latestPhotoTime ? (now - latestPhotoTime) / (24 * 60 * 60 * 1000) : Infinity;

      if (photoAgeDays >= getPhotoIntervalDays(plant)) {
        reasons.push({
          kind: "photo",
          label: "Photo diary update",
          detail: "Take a quick progress photo so Pattypan can remember how this plant is changing.",
          priority: "normal"
        });
      }

      if (isOutdoorPlant(plant) && model.weather.rainfallMm24h >= 5) {
        reasons.push({
          kind: "skip-water",
          label: "Skip outdoor watering",
          detail: "Rain has covered the outdoor watering check. A quick visual look is enough.",
          priority: "normal"
        });
      }

      if (isOutdoorPlant(plant) && model.weatherAlerts.length > 0) {
        const alert = model.weatherAlerts[0];
        reasons.push({
          kind: "weather",
          label: alert.title,
          detail: alert.summary,
          priority: alert.severity === "urgent" ? "urgent" : alert.severity === "warning" ? "high" : "normal"
        });
      }

      const pruningGuidance = hasRecentPruningActivity(model.tasks, plant.id) ? null : getPruningGuidance(plant, species, latestPhoto);
      if (pruningGuidance) {
        reasons.push({
          kind: "prune",
          label: pruningGuidance.title,
          detail: pruningGuidance.detail,
          priority: pruningGuidance.priority
        });
      }

      return {
        plant,
        species,
        photo: latestPhoto,
        reasons: dedupeReasons(reasons).sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority])
      };
    })
    .filter((entry) => entry.reasons.length > 0)
    .sort((a, b) => priorityWeight[a.reasons[0].priority] - priorityWeight[b.reasons[0].priority]);
}

function taskToAttentionReason(task: CareTask): PlantQueueEntry["reasons"][number] {
  return {
    kind: taskTypeToAttentionKind(task.type),
    label: task.title,
    detail: task.reason,
    taskId: task.id,
    priority: task.priority
  };
}

function taskTypeToAttentionKind(type: CareTaskType): AttentionKind {
  if (type === "watering") {
    return "water";
  }
  if (type === "feeding") {
    return "feed";
  }
  if (type === "harvest") {
    return "harvest";
  }
  if (type === "pruning" || type === "deadheading") {
    return "prune";
  }
  if (type === "shade" || type === "heat-stress") {
    return "light";
  }
  if (type === "pest-check") {
    return "diagnose";
  }
  if (type === "frost-protection" || type === "wind-protection" || type === "heavy-rain-protection") {
    return "weather";
  }
  return "photo";
}

function getPhotoIntervalDays(plant: PlantInstance) {
  if (plant.healthStatus === "watch" || plant.healthStatus === "stressed") {
    return 1;
  }
  if (plant.stage === "seed" || plant.stage === "seedling" || plant.stage === "young") {
    return 3;
  }
  return 7;
}

function dedupeReasons(reasons: PlantQueueEntry["reasons"]) {
  const seen = new Set<string>();
  return reasons.filter((reason) => {
    const key = reason.taskId ?? `${reason.kind}:${reason.label}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function isOutdoorPlant(plant: PlantInstance) {
  return plant.locationType === "in-ground" || plant.locationType === "raised-bed" || plant.locationType === "container" || plant.locationType === "greenhouse";
}

function getWeatherIcon(model: GardenHomeModel): keyof typeof Ionicons.glyphMap {
  if (model.weatherAlerts.some((alert) => alert.type === "frost")) {
    return "snow-outline";
  }
  if (model.weatherAlerts.some((alert) => alert.type === "wind")) {
    return "flag-outline";
  }
  if (model.weather.rainfallMm24h >= 5) {
    return "rainy-outline";
  }
  if (model.weather.temperatureC >= 28) {
    return "thermometer-outline";
  }
  return "partly-sunny-outline";
}

function getWeatherNudge(model: GardenHomeModel) {
  if (!model.user.locationLabel.trim()) {
    return "Set your location for weather-aware plant check-ins.";
  }
  if (model.weatherAlerts[0]) {
    return model.weatherAlerts[0].summary;
  }
  if (model.weather.rainfallMm24h >= 5) {
    return "Rain today means outdoor plants may only need a quick look.";
  }
  if (model.weather.temperatureC >= 28) {
    return "Warm weather today. Watch thirsty containers and young plants.";
  }
  return `${model.weather.temperatureC}C in ${model.weather.locationLabel || model.user.locationLabel}. A calm day for quick plant check-ins.`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

const styles = StyleSheet.create({
  screen: { gap: spacing.lg },
  header: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  headerCopy: { flex: 1, gap: spacing.xs },
  greeting: { color: colors.textMuted, fontSize: typography.body, fontWeight: "800" },
  title: { color: colors.leafDeep, fontSize: 34, fontWeight: "900", lineHeight: 38 },
  addButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.leafDeep, alignItems: "center", justifyContent: "center" },
  weatherStrip: { minHeight: 54, borderRadius: radii.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  weatherText: { flex: 1, color: colors.text, fontSize: typography.small, lineHeight: 19, fontWeight: "800" },
  queueArea: { gap: spacing.md },
  card: { borderRadius: 34, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden", shadowColor: colors.shadow, shadowOpacity: 0.16, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 9 },
  photoFrame: { height: 410, backgroundColor: colors.leafDeep, overflow: "hidden" },
  plantPhoto: { width: "100%", height: "100%" },
  photoFallback: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#143b25", gap: spacing.md },
  photoFallbackText: { color: "rgba(255,253,243,0.86)", fontSize: typography.body, fontWeight: "900" },
  photoShade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 160, backgroundColor: "rgba(5,18,10,0.38)" },
  counterPill: { position: "absolute", top: spacing.md, left: spacing.md, minHeight: 32, borderRadius: radii.pill, backgroundColor: "rgba(255,253,243,0.88)", paddingHorizontal: spacing.md, justifyContent: "center" },
  counterText: { color: colors.leafDeep, fontSize: typography.caption, fontWeight: "900" },
  needRail: { position: "absolute", right: spacing.md, top: spacing.md, gap: spacing.sm },
  needIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(18,53,31,0.78)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.26)" },
  cardCopy: { padding: spacing.lg, gap: spacing.xs },
  plantName: { color: colors.leafDeep, fontSize: 32, fontWeight: "900", lineHeight: 36 },
  speciesName: { color: colors.textMuted, fontSize: typography.small, fontWeight: "800" },
  statusText: { color: colors.text, fontSize: typography.section, fontWeight: "900", marginTop: spacing.sm },
  guidanceText: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20, fontWeight: "700" },
  cardActions: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  softAction: { minHeight: 48, borderRadius: radii.pill, backgroundColor: colors.surfaceWarm, paddingHorizontal: spacing.md, alignItems: "center", justifyContent: "center" },
  softActionText: { color: colors.leafDeep, fontSize: typography.small, fontWeight: "900" },
  photoAction: { flex: 1.2, minHeight: 48, borderRadius: radii.pill, backgroundColor: colors.leafDeep, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs },
  photoActionText: { color: colors.white, fontSize: typography.small, fontWeight: "900" },
  doneAction: { flex: 1, minHeight: 48, borderRadius: radii.pill, backgroundColor: colors.leaf, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs },
  doneActionText: { color: colors.white, fontSize: typography.small, fontWeight: "900" },
  gestureBar: { flexDirection: "row", gap: spacing.sm },
  navButton: { flex: 1, minHeight: 46, borderRadius: radii.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs },
  navButtonDisabled: { opacity: 0.45 },
  navButtonText: { color: colors.leafDeep, fontSize: typography.caption, fontWeight: "900" },
  navButtonTextDisabled: { color: colors.textMuted },
  detailsButton: { flex: 1, minHeight: 46, borderRadius: radii.pill, backgroundColor: colors.leafDeep, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs },
  detailsButtonText: { color: colors.white, fontSize: typography.caption, fontWeight: "900" },
  gestureHint: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 17, textAlign: "center", fontWeight: "700" },
  emptyState: { borderRadius: 34, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: "center", gap: spacing.md },
  emptyPhoto: { width: "100%", height: 260, borderRadius: 28, backgroundColor: colors.leafDeep, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  emptyGlow: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(244,200,95,0.18)", right: -80, top: -70 },
  emptyTitle: { color: colors.leafDeep, fontSize: typography.title, fontWeight: "900", textAlign: "center" },
  emptyText: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20, fontWeight: "800", textAlign: "center" },
  primaryCta: { alignSelf: "stretch", minHeight: 52, borderRadius: radii.pill, backgroundColor: colors.leafDeep, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  primaryCtaText: { color: colors.white, fontSize: typography.body, fontWeight: "900" },
  emptyActions: { alignSelf: "stretch", flexDirection: "row", gap: spacing.sm },
  secondaryCta: { flex: 1, minHeight: 48, borderRadius: radii.pill, backgroundColor: colors.surfaceWarm, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.sm },
  secondaryCtaText: { color: colors.leafDeep, fontSize: typography.small, fontWeight: "900", textAlign: "center" }
});
