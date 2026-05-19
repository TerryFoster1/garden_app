import { useMemo, useState } from "react";
import { DimensionValue, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CareTask, GardenBed, GardenHomeModel } from "../../domain";
import { colors, radii, spacing, typography } from "../../theme/tokens";

type TodayScreenProps = {
  model: GardenHomeModel;
  onOpenCalendar: () => void;
  onOpenSettings: () => void;
  onOpenWeatherAlerts: () => void;
  onOpenPlant: () => void;
  onOpenScan: () => void;
  onCompleteTask: (taskId: string) => void;
  onSnoozeTask: (taskId: string) => void;
};

const urgentWeights: Record<CareTask["priority"], number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3
};

export function TodayScreen({
  model,
  onOpenCalendar,
  onOpenSettings,
  onOpenWeatherAlerts,
  onOpenPlant,
  onOpenScan,
  onCompleteTask,
  onSnoozeTask
}: TodayScreenProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const actionableTasks = useMemo(
    () =>
      model.tasks
        .filter((task) => task.status !== "done" && task.status !== "skipped")
        .sort((a, b) => urgentWeights[a.priority] - urgentWeights[b.priority])
        .slice(0, 4),
    [model.tasks]
  );

  const completedToday = model.tasks.filter((task) => task.status === "done").length;
  const highPriorityCount = actionableTasks.filter((task) => task.priority === "high" || task.priority === "urgent").length;
  const conditionSummary = getConditionSummary(model);
  const visibleBeds = model.beds.slice(0, 5);
  const recentPlants = model.plantInstances.slice(0, 4);

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.locationText}>{model.user.locationLabel}</Text>
            <Text style={styles.timeText}>{getDayPart()} garden check</Text>
          </View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open profile settings" style={styles.roundButton} onPress={onOpenSettings}>
            <Ionicons name="person-outline" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.weatherRow}>
          <Text style={styles.temperatureText}>{model.weather.temperatureC}C</Text>
          <View style={styles.conditionBlock}>
            <Text style={styles.conditionTitle}>{conditionSummary.title}</Text>
            <Text style={styles.conditionText}>{conditionSummary.detail}</Text>
          </View>
        </View>

        <TouchableOpacity accessibilityRole="button" style={styles.alertStrip} onPress={onOpenWeatherAlerts}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.leafDeep} />
          <Text style={styles.alertText}>
            {highPriorityCount > 0 ? `${highPriorityCount} urgent garden check${highPriorityCount > 1 ? "s" : ""}` : "Good growing conditions"}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.leafDeep} />
        </TouchableOpacity>
      </View>

      <View style={styles.primaryActions}>
        <TouchableOpacity accessibilityRole="button" style={styles.scanAction} onPress={onOpenScan}>
          <View style={styles.actionIconLarge}>
            <Ionicons name="camera" size={32} color={colors.leafDeep} />
          </View>
          <Text style={styles.scanTitle}>Scan Plant</Text>
          <Text style={styles.scanSubtext}>Identify, diagnose, track growth</Text>
        </TouchableOpacity>

        <TouchableOpacity accessibilityRole="button" style={styles.taskAction} onPress={onOpenCalendar}>
          <Text style={styles.taskNumber}>{actionableTasks.length}</Text>
          <Text style={styles.taskActionTitle}>Tasks Now</Text>
          <Text style={styles.taskActionText}>{completedToday > 0 ? `${completedToday} completed` : "Ready outside"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Needs Attention</Text>
        <TouchableOpacity accessibilityRole="button" onPress={onOpenCalendar}>
          <Text style={styles.sectionLink}>All tasks</Text>
        </TouchableOpacity>
      </View>

      {actionableTasks.map((task) => {
        const isExpanded = expandedTaskId === task.id;
        return (
          <View key={task.id} style={[styles.taskCard, task.priority === "high" || task.priority === "urgent" ? styles.taskCardUrgent : null]}>
            <TouchableOpacity accessibilityRole="button" style={styles.taskMain} onPress={task.plantInstanceId ? onOpenPlant : () => setExpandedTaskId(isExpanded ? null : task.id)}>
              <View style={styles.taskStatusRail}>
                <View style={[styles.priorityDot, task.priority === "high" || task.priority === "urgent" ? styles.priorityDotHot : null]} />
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskType}>{task.type.replaceAll("-", " ")}</Text>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskHint}>{task.status === "needs-confirmation" ? "Confirm before scheduling" : "Quick action available"}</Text>
              </View>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Show task reason" style={styles.whyButton} onPress={() => setExpandedTaskId(isExpanded ? null : task.id)}>
                <Text style={styles.whyText}>Why</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {isExpanded ? <Text style={styles.taskReason}>{task.reason}</Text> : null}

            <View style={styles.taskActions}>
              <TouchableOpacity accessibilityRole="button" style={styles.completeButton} onPress={() => onCompleteTask(task.id)}>
                <Ionicons name="checkmark" size={18} color={colors.white} />
                <Text style={styles.completeText}>Done</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" style={styles.snoozeButton} onPress={() => onSnoozeTask(task.id)}>
                <Ionicons name="time-outline" size={18} color={colors.leafDeep} />
                <Text style={styles.snoozeText}>Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Garden Pulse</Text>
        <Text style={styles.sectionMeta}>Visual check</Text>
      </View>

      <View style={styles.bedMap}>
        {visibleBeds.map((bed, index) => (
          <BedPulse key={bed.id} bed={bed} index={index} />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recently Alive</Text>
        <Text style={styles.sectionMeta}>Latest changes</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeline}>
        {recentPlants.map((plant) => (
          <View key={plant.id} style={styles.activityItem}>
            <View style={styles.activityLeaf}>
              <Ionicons name="leaf-outline" size={18} color={colors.leafDeep} />
            </View>
            <Text style={styles.activityTitle}>{plant.nickname}</Text>
            <Text style={styles.activityText}>{plant.healthStatus} in {plant.locationLabel}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function BedPulse({ bed, index }: { bed: GardenBed; index: number }) {
  const states: Array<{ label: string; color: string; fill: DimensionValue }> = [
    { label: "steady", color: colors.leaf, fill: "78%" },
    { label: "warm", color: colors.sun, fill: "66%" },
    { label: "watch", color: colors.coral, fill: "48%" },
    { label: "moist", color: colors.sky, fill: "72%" },
    { label: "shade", color: colors.sage, fill: "54%" }
  ];
  const state = states[index % states.length];

  return (
    <View style={styles.bedTile}>
      <View style={styles.bedHeader}>
        <Text style={styles.bedName}>{bed.name.replace("Raised ", "")}</Text>
        <Text style={[styles.bedState, { color: state.color }]}>{state.label}</Text>
      </View>
      <View style={styles.bedTrack}>
        <View style={[styles.bedFill, { width: state.fill, backgroundColor: state.color }]} />
      </View>
      <Text style={styles.bedMeta}>{bed.lengthFeet}ft x {bed.widthFeet}ft</Text>
    </View>
  );
}

function getConditionSummary(model: GardenHomeModel) {
  if (model.weatherAlerts.some((alert) => alert.type === "heavy-rain" || alert.type === "storm")) {
    return { title: "Heavy rain watch", detail: "Protect containers and skip fertilizing." };
  }

  if (model.weather.humidityPercent >= 60) {
    return { title: "Warm and humid today", detail: "Good growth, but watch mildew-prone plants." };
  }

  if (model.weather.frostRisk !== "none") {
    return { title: "Cold-night watch", detail: "Tender transplants may need cover." };
  }

  return { title: "Good growing conditions", detail: "A calm day for quick checks and light care." };
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
  hero: {
    borderRadius: 34,
    padding: spacing.lg,
    backgroundColor: colors.leafDeep,
    minHeight: 244,
    justifyContent: "space-between",
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  locationText: {
    color: colors.surfaceWarm,
    fontSize: typography.small,
    fontWeight: "800"
  },
  timeText: {
    color: colors.white,
    fontSize: typography.title,
    fontWeight: "900",
    lineHeight: 34
  },
  roundButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.md,
    marginTop: spacing.xl
  },
  temperatureText: {
    color: colors.sun,
    fontSize: 58,
    fontWeight: "900",
    lineHeight: 62
  },
  conditionBlock: {
    flex: 1,
    paddingBottom: spacing.xs
  },
  conditionTitle: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "900",
    lineHeight: 24
  },
  conditionText: {
    color: colors.surfaceWarm,
    fontSize: typography.small,
    lineHeight: 19,
    marginTop: spacing.xs
  },
  alertStrip: {
    minHeight: 46,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceWarm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  alertText: {
    flex: 1,
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  primaryActions: {
    flexDirection: "row",
    gap: spacing.md
  },
  scanAction: {
    flex: 1.35,
    minHeight: 132,
    borderRadius: 28,
    backgroundColor: colors.sun,
    padding: spacing.lg,
    justifyContent: "space-between"
  },
  actionIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.45)"
  },
  scanTitle: {
    color: colors.leafDeep,
    fontSize: typography.section,
    fontWeight: "900"
  },
  scanSubtext: {
    color: colors.soil,
    fontSize: typography.small,
    fontWeight: "800",
    lineHeight: 18
  },
  taskAction: {
    flex: 1,
    minHeight: 132,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    justifyContent: "center"
  },
  taskNumber: {
    color: colors.leafDeep,
    fontSize: 44,
    fontWeight: "900",
    lineHeight: 48
  },
  taskActionTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  taskActionText: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "800",
    marginTop: spacing.xs
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  sectionLink: {
    color: colors.leaf,
    fontSize: typography.small,
    fontWeight: "900"
  },
  sectionMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  taskCard: {
    borderRadius: 26,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm
  },
  taskCardUrgent: {
    borderColor: "#efc3b6",
    backgroundColor: "#fff4ee"
  },
  taskMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  taskStatusRail: {
    width: 24,
    alignItems: "center"
  },
  priorityDot: {
    width: 14,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.sage
  },
  priorityDotHot: {
    backgroundColor: colors.coral
  },
  taskContent: {
    flex: 1
  },
  taskType: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  taskTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    lineHeight: 21,
    marginTop: 2
  },
  taskHint: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
    marginTop: 4
  },
  whyButton: {
    minWidth: 52,
    minHeight: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceWarm
  },
  whyText: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900"
  },
  taskReason: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20,
    paddingLeft: 38
  },
  taskActions: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingLeft: 38
  },
  completeButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.leafDeep,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  completeText: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: "900"
  },
  snoozeButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  snoozeText: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  bedMap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  bedTile: {
    width: "48%",
    minHeight: 118,
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "space-between"
  },
  bedHeader: {
    gap: spacing.xs
  },
  bedName: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "900"
  },
  bedState: {
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  bedTrack: {
    height: 12,
    borderRadius: 8,
    backgroundColor: colors.surfaceWarm,
    overflow: "hidden"
  },
  bedFill: {
    height: "100%",
    borderRadius: 8
  },
  bedMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800"
  },
  timeline: {
    gap: spacing.sm,
    paddingRight: spacing.lg
  },
  activityItem: {
    width: 176,
    minHeight: 132,
    borderRadius: 24,
    padding: spacing.md,
    backgroundColor: colors.surfaceWarm,
    justifyContent: "space-between"
  },
  activityLeaf: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  activityTitle: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "900"
  },
  activityText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
    lineHeight: 16
  }
});
