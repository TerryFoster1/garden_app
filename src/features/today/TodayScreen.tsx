import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CareTask, GardenHomeModel } from "../../domain";
import { colors, radii, spacing, typography } from "../../theme/tokens";

type TodayScreenProps = {
  model: GardenHomeModel;
  onOpenWeatherAlerts: () => void;
  onOpenPlant: (plantId: string) => void;
  onAddPlant: () => void;
  onCompleteTask: (taskId: string) => void;
  onSnoozeTask: (taskId: string) => void;
};

const urgentWeights: Record<CareTask["priority"], number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3
};

const taskIcons: Record<CareTask["type"], keyof typeof Ionicons.glyphMap> = {
  watering: "water-outline",
  feeding: "nutrition-outline",
  pruning: "cut-outline",
  "pest-check": "bug-outline",
  "frost-protection": "snow-outline",
  "wind-protection": "flag-outline",
  "heavy-rain-protection": "rainy-outline",
  "heat-stress": "thermometer-outline",
  shade: "partly-sunny-outline",
  harvest: "basket-outline",
  deadheading: "flower-outline",
  support: "git-branch-outline",
  "hardening-off": "leaf-outline"
};

export function TodayScreen({ model, onOpenWeatherAlerts, onOpenPlant, onAddPlant, onCompleteTask, onSnoozeTask }: TodayScreenProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const actionableTasks = useMemo(
    () =>
      model.tasks
        .filter((task) => task.status !== "done" && task.status !== "skipped")
        .sort((a, b) => urgentWeights[a.priority] - urgentWeights[b.priority])
        .slice(0, 4),
    [model.tasks]
  );

  const conditionSummary = getConditionSummary(model);
  const urgentCount = actionableTasks.filter((task) => task.priority === "high" || task.priority === "urgent").length;
  const alertSummary = model.weatherAlerts[0]?.title ?? conditionSummary.alert;
  const displayName = model.user.name.trim();
  const homeTitle = displayName ? `${displayName}'s Garden` : "My Garden";

  return (
    <View style={styles.screen}>
      <View style={styles.intro}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.pageTitle}>{homeTitle}</Text>
      </View>

      <WeatherHero model={model} conditionSummary={conditionSummary} urgentCount={urgentCount} alertSummary={alertSummary} onPressAlerts={onOpenWeatherAlerts} />

      <View style={styles.checklistHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>Today's actions</Text>
          <Text style={styles.sectionTitle}>{actionableTasks.length > 0 ? `${actionableTasks.length} things need attention` : "Nothing urgent"}</Text>
        </View>
        {urgentCount > 0 ? (
          <View style={styles.urgentPill}>
            <Ionicons name="alert-circle" size={15} color={colors.coral} />
            <Text style={styles.urgentPillText}>{urgentCount} urgent</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.checklist}>
        {actionableTasks.length > 0 ? (
          actionableTasks.map((task) => {
            const isExpanded = expandedTaskId === task.id;
            return (
              <ActionChecklistItem
                key={task.id}
                task={task}
                isExpanded={isExpanded}
                onOpenPlant={onOpenPlant}
                onToggleWhy={() => setExpandedTaskId(isExpanded ? null : task.id)}
                onComplete={() => onCompleteTask(task.id)}
                onSnooze={() => onSnoozeTask(task.id)}
              />
            );
          })
        ) : (
          <View style={styles.emptyChecklist}>
            <View style={styles.emptyIcon}>
              <Ionicons name="leaf-outline" size={22} color={colors.leafDeep} />
            </View>
            <View style={styles.emptyCopy}>
              <Text style={styles.emptyTitle}>Your garden can breathe.</Text>
              <Text style={styles.emptyText}>No immediate care checks are due. Weather rules will surface anything important here.</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Add a plant" style={styles.addPlantCta} onPress={onAddPlant}>
        <View style={styles.ctaArtwork}>
          <View style={styles.cameraOrb}>
            <Ionicons name="camera" size={26} color={colors.white} />
          </View>
          <View style={styles.seedlingStem} />
          <View style={[styles.seedlingLeaf, styles.seedlingLeft]} />
          <View style={[styles.seedlingLeaf, styles.seedlingRight]} />
        </View>
        <View style={styles.ctaCopy}>
          <Text style={styles.ctaTitle}>Add Plant</Text>
          <Text style={styles.ctaText}>Scan or search, then place it in your garden.</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

function WeatherHero({
  model,
  conditionSummary,
  urgentCount,
  alertSummary,
  onPressAlerts
}: {
  model: GardenHomeModel;
  conditionSummary: ReturnType<typeof getConditionSummary>;
  urgentCount: number;
  alertSummary: string;
  onPressAlerts: () => void;
}) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open weather alerts" activeOpacity={0.88} style={styles.hero} onPress={onPressAlerts}>
      <View style={styles.heroGlow} />
      <WeatherStateGraphic mood={conditionSummary.mood} />

      <View style={styles.heroTopRow}>
        <View style={styles.locationBlock}>
          <Ionicons name="location" size={16} color="rgba(255,255,255,0.9)" />
          <Text style={styles.locationText}>{model.user.locationLabel}</Text>
        </View>
        <Text style={styles.heroTime}>{getDayPart()} check</Text>
      </View>

      <View style={styles.heroMain}>
        <Text style={styles.temperatureText}>{model.weather.temperatureC}C</Text>
        <View style={styles.conditionBlock}>
          <Text style={styles.conditionTitle}>{conditionSummary.title}</Text>
          <Text style={styles.conditionText}>{conditionSummary.detail}</Text>
        </View>
      </View>

      <View style={styles.weatherMetrics}>
        <WeatherMetric icon="water-outline" label="Rain" value={`${model.weather.rainfallMm24h}mm`} />
        <WeatherMetric icon="speedometer-outline" label="Wind" value={`${model.weather.windKph}km/h`} />
        <WeatherMetric icon="sunny-outline" label="UV" value={`${model.weather.uvIndex}`} />
      </View>

      <View style={styles.alertStrip}>
        <Ionicons name={urgentCount > 0 ? "warning-outline" : "leaf-outline"} size={19} color={colors.leafDeep} />
        <Text style={styles.alertText}>{urgentCount > 0 ? `${urgentCount} urgent check${urgentCount > 1 ? "s" : ""}: ${alertSummary}` : alertSummary}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.leafDeep} />
      </View>
    </TouchableOpacity>
  );
}

function WeatherStateGraphic({ mood }: { mood: WeatherMood }) {
  return (
    <View pointerEvents="none" style={styles.weatherGraphic}>
      <View style={[styles.sunOrb, mood === "cold" && styles.coolSunOrb]} />
      <View style={styles.cloudMain} />
      <View style={styles.cloudPuffOne} />
      <View style={styles.cloudPuffTwo} />
      {mood === "rain" ? (
        <View style={styles.rainLines}>
          <View style={styles.rainLine} />
          <View style={styles.rainLine} />
          <View style={styles.rainLine} />
        </View>
      ) : null}
    </View>
  );
}

function WeatherMetric({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={16} color="rgba(255,255,255,0.9)" />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function ActionChecklistItem({
  task,
  isExpanded,
  onOpenPlant,
  onToggleWhy,
  onComplete,
  onSnooze
}: {
  task: CareTask;
  isExpanded: boolean;
  onOpenPlant: (plantId: string) => void;
  onToggleWhy: () => void;
  onComplete: () => void;
  onSnooze: () => void;
}) {
  const isUrgent = task.priority === "high" || task.priority === "urgent";
  const icon = taskIcons[task.type];

  return (
    <View style={[styles.taskItem, isUrgent && styles.taskItemUrgent]}>
      <TouchableOpacity accessibilityRole="button" activeOpacity={0.75} style={styles.taskTopRow} onPress={task.plantInstanceId ? () => onOpenPlant(task.plantInstanceId as string) : onToggleWhy}>
        <View style={[styles.taskIcon, isUrgent && styles.taskIconUrgent]}>
          <Ionicons name={icon} size={21} color={isUrgent ? colors.coral : colors.leafDeep} />
        </View>
        <View style={styles.taskCopy}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskMeta}>{formatTaskContext(task)}</Text>
        </View>
        <View style={[styles.statusDot, isUrgent && styles.statusDotUrgent]} />
      </TouchableOpacity>

      {isExpanded ? <Text style={styles.taskReason}>{task.reason}</Text> : null}

      <View style={styles.taskActions}>
        <TouchableOpacity accessibilityRole="button" style={styles.doneButton} onPress={onComplete}>
          <Ionicons name="checkmark" size={18} color={colors.white} />
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} onPress={onSnooze}>
          <Text style={styles.secondaryText}>Later</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} onPress={onToggleWhy}>
          <Text style={styles.secondaryText}>{isExpanded ? "Hide" : "Why"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type WeatherMood = "sun" | "humid" | "rain" | "cold";

function getConditionSummary(model: GardenHomeModel): { title: string; detail: string; alert: string; mood: WeatherMood } {
  if (model.weatherAlerts.some((alert) => alert.type === "heavy-rain" || alert.type === "storm")) {
    return {
      title: "Heavy rain expected",
      detail: "Keep containers draining and pause feeding before the rain arrives.",
      alert: "Move tender pots and skip fertilizer.",
      mood: "rain"
    };
  }

  if (model.weather.frostRisk !== "none") {
    return {
      title: "Cold-night watch",
      detail: "Tender plants may need cover after sunset.",
      alert: "Check peppers and basil before evening.",
      mood: "cold"
    };
  }

  if (model.weather.humidityPercent >= 60) {
    return {
      title: "Warm and humid today",
      detail: "Strong growth weather, with mildew-prone plants worth a quick look.",
      alert: "Good growing conditions with a light disease check.",
      mood: "humid"
    };
  }

  return {
    title: "Good growing conditions",
    detail: "A calm day for quick checks and light care.",
    alert: "Nothing severe in the garden forecast.",
    mood: "sun"
  };
}

function formatTaskContext(task: CareTask) {
  if (task.priority === "urgent") {
    return "Needs attention now";
  }
  if (task.priority === "high") {
    return "Important today";
  }
  if (task.status === "needs-confirmation") {
    return "Confirm before scheduling";
  }
  return "Quick check";
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

function getDayPart() {
  const hour = new Date().getHours();
  if (hour < 11) {
    return "Morning";
  }
  if (hour < 17) {
    return "Afternoon";
  }
  return "Evening";
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg
  },
  intro: {
    paddingTop: spacing.xs,
    gap: 2
  },
  greeting: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: "800"
  },
  pageTitle: {
    color: colors.leafDeep,
    fontSize: 44,
    fontWeight: "900",
    lineHeight: 48
  },
  hero: {
    minHeight: 292,
    borderRadius: 34,
    padding: spacing.lg,
    overflow: "hidden",
    justifyContent: "space-between",
    backgroundColor: colors.leafDeep,
    shadowColor: colors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10
  },
  heroGlow: {
    position: "absolute",
    right: -92,
    top: -92,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(244,200,95,0.32)"
  },
  weatherGraphic: {
    position: "absolute",
    right: 22,
    top: 58,
    width: 145,
    height: 122
  },
  sunOrb: {
    position: "absolute",
    right: 18,
    top: 0,
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#f7c65a"
  },
  coolSunOrb: {
    backgroundColor: "#d7e7ef"
  },
  cloudMain: {
    position: "absolute",
    right: 10,
    top: 58,
    width: 112,
    height: 40,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.76)"
  },
  cloudPuffOne: {
    position: "absolute",
    right: 74,
    top: 42,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.82)"
  },
  cloudPuffTwo: {
    position: "absolute",
    right: 36,
    top: 34,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(255,255,255,0.8)"
  },
  rainLines: {
    position: "absolute",
    right: 35,
    top: 100,
    flexDirection: "row",
    gap: spacing.sm
  },
  rainLine: {
    width: 5,
    height: 24,
    borderRadius: 4,
    backgroundColor: "rgba(219,234,240,0.92)",
    transform: [{ rotate: "14deg" }]
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  locationBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  locationText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: typography.small,
    fontWeight: "900"
  },
  heroTime: {
    color: "rgba(255,255,255,0.72)",
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  heroMain: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    maxWidth: "70%"
  },
  temperatureText: {
    color: colors.white,
    fontSize: 66,
    fontWeight: "900",
    lineHeight: 70
  },
  conditionBlock: {
    gap: spacing.xs
  },
  conditionTitle: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: "900",
    lineHeight: 31
  },
  conditionText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: "700"
  },
  weatherMetrics: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  metric: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.13)",
    padding: spacing.sm,
    justifyContent: "center"
  },
  metricLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: typography.caption,
    fontWeight: "800",
    marginTop: 2
  },
  metricValue: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: "900"
  },
  alertStrip: {
    minHeight: 48,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: "rgba(255,253,248,0.9)",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  alertText: {
    flex: 1,
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  checklistHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md
  },
  sectionEyebrow: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900",
    lineHeight: 25
  },
  urgentPill: {
    minHeight: 32,
    borderRadius: radii.pill,
    backgroundColor: "#fff1ea",
    borderWidth: 1,
    borderColor: "#efc3b6",
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  urgentPillText: {
    color: colors.coral,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  checklist: {
    gap: spacing.sm
  },
  taskItem: {
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm
  },
  taskItemUrgent: {
    borderColor: "#efc3b6",
    backgroundColor: "#fff7f2"
  },
  taskTopRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eef6e9",
    alignItems: "center",
    justifyContent: "center"
  },
  taskIconUrgent: {
    backgroundColor: "#ffe7dc"
  },
  taskCopy: {
    flex: 1
  },
  taskTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    lineHeight: 21
  },
  taskMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
    marginTop: 4
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.sage
  },
  statusDotUrgent: {
    backgroundColor: colors.coral
  },
  taskReason: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20,
    paddingLeft: 58
  },
  taskActions: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingLeft: 58
  },
  doneButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.leafDeep,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  doneText: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: "900"
  },
  secondaryButton: {
    minWidth: 70,
    minHeight: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  secondaryText: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  emptyChecklist: {
    borderRadius: 24,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eef6e9",
    alignItems: "center",
    justifyContent: "center"
  },
  emptyCopy: {
    flex: 1
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 19,
    fontWeight: "700",
    marginTop: 2
  },
  addPlantCta: {
    minHeight: 112,
    borderRadius: 30,
    backgroundColor: colors.leafDeep,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  ctaArtwork: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  cameraOrb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.leaf,
    alignItems: "center",
    justifyContent: "center"
  },
  seedlingStem: {
    position: "absolute",
    bottom: 8,
    width: 4,
    height: 26,
    borderRadius: 2,
    backgroundColor: colors.sage
  },
  seedlingLeaf: {
    position: "absolute",
    bottom: 25,
    width: 22,
    height: 14,
    borderRadius: 16,
    backgroundColor: colors.sage
  },
  seedlingLeft: {
    left: 16,
    transform: [{ rotate: "-28deg" }]
  },
  seedlingRight: {
    right: 16,
    transform: [{ rotate: "28deg" }]
  },
  ctaCopy: {
    flex: 1
  },
  ctaTitle: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "900"
  },
  ctaText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: typography.small,
    lineHeight: 19,
    fontWeight: "800",
    marginTop: spacing.xs
  }
});
