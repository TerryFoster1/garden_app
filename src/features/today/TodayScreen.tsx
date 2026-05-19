import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GardenCard } from "../../components/GardenCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { StatPill } from "../../components/StatPill";
import { GardenHomeModel } from "../../domain";
import { colors, spacing, typography } from "../../theme/tokens";

type TodayScreenProps = {
  model: GardenHomeModel;
  onOpenCalendar: () => void;
  onOpenSettings: () => void;
  onOpenWeatherAlerts: () => void;
  onOpenPlant: () => void;
};

export function TodayScreen({ model, onOpenCalendar, onOpenSettings, onOpenWeatherAlerts, onOpenPlant }: TodayScreenProps) {
  const dueToday = model.tasks.slice(0, 3);

  return (
    <View>
      <ScreenHeader
        eyebrow={model.user.locationLabel}
        title="Today in your garden"
        subtitle="Weather-aware tasks, tender plant checks, and fast access to the camera when something looks different."
        action={
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open profile settings" style={styles.iconButton} onPress={onOpenSettings}>
            <Ionicons name="person-outline" size={20} color={colors.leafDeep} />
          </TouchableOpacity>
        }
      />

      <View style={styles.stats}>
        <StatPill label="Tasks due" value={`${model.tasks.length}`} />
        <StatPill label="Outdoor beds" value="5" />
        <StatPill label="Frost risk" value={model.weather.frostRisk} />
      </View>

      <GardenCard tone="sky">
        <View style={styles.row}>
          <View>
            <Text style={styles.cardTitle}>{model.weather.temperatureC}C and {model.weather.humidityPercent}% humidity</Text>
            <Text style={styles.cardText}>{model.weather.rainfallMm24h} mm rain in 24h. UV {model.weather.uvIndex}. Wind {model.weather.windKph} kph.</Text>
          </View>
          <TouchableOpacity accessibilityRole="button" onPress={onOpenWeatherAlerts}>
            <Ionicons name="alert-circle-outline" size={30} color={colors.leafDeep} />
          </TouchableOpacity>
        </View>
      </GardenCard>

      <Text style={styles.sectionTitle}>Next Tasks</Text>
      {dueToday.map((task) => (
        <TouchableOpacity key={task.id} accessibilityRole="button" onPress={task.plantInstanceId ? onOpenPlant : onOpenCalendar}>
          <GardenCard tone={task.priority === "high" ? "alert" : "surface"}>
            <Text style={styles.taskType}>{task.type.replaceAll("-", " ")}</Text>
            <Text style={styles.cardTitle}>{task.title}</Text>
            <Text style={styles.cardText}>{task.reason}</Text>
          </GardenCard>
        </TouchableOpacity>
      ))}

      <PrimaryButton label="Open task calendar" onPress={onOpenCalendar} icon={<Ionicons name="calendar-outline" size={20} color={colors.white} />} />
    </View>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceWarm
  },
  sectionTitle: {
    fontSize: typography.section,
    fontWeight: "900",
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm
  },
  taskType: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  cardText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20
  }
});

