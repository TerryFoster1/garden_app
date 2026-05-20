import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GardenHomeModel } from "../../domain";
import { colors, radii, spacing, typography } from "../../theme/tokens";

type ProfileScreenProps = {
  model: GardenHomeModel;
  onOpenSettings: () => void;
};

const notificationRows = [
  { icon: "sunny-outline", label: "Morning garden brief", value: "Mock enabled" },
  { icon: "water-outline", label: "Watering and feeding", value: "Mock enabled" },
  { icon: "warning-outline", label: "Weather protection", value: "Mock watch" },
  { icon: "camera-outline", label: "Weekly photo update", value: "Mock reminder" }
] as const;

export function ProfileScreen({ model, onOpenSettings }: ProfileScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Account, location, alerts, and app status.</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" style={styles.iconButton} onPress={onOpenSettings}>
          <Ionicons name="settings-outline" size={24} color={colors.leafDeep} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={34} color={colors.leafDeep} />
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.profileName}>{model.user.name}</Text>
          <Text style={styles.profileMeta}>Local prototype access</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location + Weather</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={22} color={colors.leafDeep} />
          <View style={styles.infoCopy}>
            <Text style={styles.infoTitle}>{model.user.locationLabel}</Text>
            <Text style={styles.infoText}>Mock weather context. Real API/provider status will appear here.</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {notificationRows.map((row) => (
          <View key={row.label} style={styles.infoRow}>
            <Ionicons name={row.icon} size={22} color={colors.leafDeep} />
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>{row.label}</Text>
              <Text style={styles.infoText}>{row.value}</Text>
            </View>
            <View style={styles.toggleMock}>
              <View style={styles.toggleKnob} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dev Mode</Text>
        <View style={styles.statusGrid}>
          <Status label="Weather API" value="mock" />
          <Status label="Plant ID" value="mock" />
          <Status label="Paywall" value="off" />
          <Status label="Storage" value="local" />
        </View>
      </View>
    </View>
  );
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statusTile}>
      <Text style={styles.statusValue}>{value}</Text>
      <Text style={styles.statusLabel}>{label}</Text>
    </View>
  );
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
  title: {
    color: colors.leafDeep,
    fontSize: 44,
    fontWeight: "900",
    lineHeight: 50
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 23
  },
  iconButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  profileCard: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center",
    justifyContent: "center"
  },
  profileCopy: {
    flex: 1
  },
  profileName: {
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  profileMeta: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "800"
  },
  section: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.section,
    fontWeight: "900"
  },
  infoRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  infoCopy: {
    flex: 1
  },
  infoTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  infoText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 19,
    fontWeight: "700"
  },
  toggleMock: {
    width: 50,
    height: 30,
    borderRadius: radii.pill,
    backgroundColor: colors.leafDeep,
    padding: 4,
    alignItems: "flex-end"
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  statusTile: {
    width: "48%",
    minHeight: 78,
    borderRadius: 22,
    backgroundColor: colors.surfaceWarm,
    justifyContent: "center",
    padding: spacing.md
  },
  statusValue: {
    color: colors.leafDeep,
    fontSize: typography.body,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  statusLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800"
  }
});
