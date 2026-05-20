import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GardenHomeModel, NotificationPreference } from "../../domain";
import { colors, radii, spacing, typography } from "../../theme/tokens";

type ProfileScreenProps = {
  model: GardenHomeModel;
  onOpenSettings: () => void;
  onUpdateProfile: (updates: { name: string; locationLabel: string; notificationPreferences: NotificationPreference[] }) => void;
};

const defaultPreferences: NotificationPreference[] = [
  { id: "pref-morning", userId: "user-kitchener", taskType: "watering", enabled: true, quietHoursStart: "21:00", quietHoursEnd: "07:00" },
  { id: "pref-feeding", userId: "user-kitchener", taskType: "feeding", enabled: true, quietHoursStart: "21:00", quietHoursEnd: "07:00" },
  { id: "pref-weather", userId: "user-kitchener", taskType: "frost-protection", enabled: true, quietHoursStart: "21:00", quietHoursEnd: "07:00" },
  { id: "pref-photo", userId: "user-kitchener", taskType: "pest-check", enabled: false, quietHoursStart: "21:00", quietHoursEnd: "07:00" }
];

const preferenceLabels: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string; helper: string }> = {
  "pref-morning": { icon: "sunny-outline", label: "Morning garden brief", helper: "Daily weather and urgent tasks" },
  "pref-feeding": { icon: "nutrition-outline", label: "Watering and feeding", helper: "Care nudges from local rules" },
  "pref-weather": { icon: "warning-outline", label: "Weather protection", helper: "Frost, wind, heat, and rain watches" },
  "pref-photo": { icon: "camera-outline", label: "Weekly photo update", helper: "Growth photos and future diagnosis" }
};

export function ProfileScreen({ model, onOpenSettings, onUpdateProfile }: ProfileScreenProps) {
  const initialPreferences = useMemo(() => mergePreferences(model.notificationPreferences, model.user.id), [model.notificationPreferences, model.user.id]);
  const [displayName, setDisplayName] = useState(model.user.name);
  const [locationLabel, setLocationLabel] = useState(model.user.locationLabel);
  const [preferences, setPreferences] = useState<NotificationPreference[]>(initialPreferences);

  const hasChanges = displayName !== model.user.name || locationLabel !== model.user.locationLabel || JSON.stringify(preferences) !== JSON.stringify(initialPreferences);
  const visibleName = displayName.trim() || "Local gardener";

  function togglePreference(preferenceId: string) {
    setPreferences((current) => current.map((preference) => (preference.id === preferenceId ? { ...preference, enabled: !preference.enabled } : preference)));
  }

  function saveProfile() {
    onUpdateProfile({
      name: displayName.trim(),
      locationLabel: locationLabel.trim() || model.user.locationLabel,
      notificationPreferences: preferences
    });
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Your garden identity, location, alerts, and prototype status.</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open settings" style={styles.iconButton} onPress={onOpenSettings}>
          <Ionicons name="settings-outline" size={23} color={colors.leafDeep} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={32} color={colors.leafDeep} />
          <Text style={styles.avatarText}>Photo later</Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.profileName}>{visibleName}</Text>
          <Text style={styles.profileMeta}>Personal mobile prototype</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Editable Profile</Text>
        <Field label="Display name" value={displayName} placeholder="Optional" onChangeText={setDisplayName} />
        <Field label="Location" value={locationLabel} placeholder="Kitchener/Waterloo, Ontario" onChangeText={setLocationLabel} />
        <TouchableOpacity accessibilityRole="button" disabled={!hasChanges} style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]} onPress={saveProfile}>
          <Ionicons name="checkmark" size={18} color={colors.white} />
          <Text style={styles.saveText}>{hasChanges ? "Save changes" : "Saved locally"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {preferences.map((preference) => {
          const row = preferenceLabels[preference.id] ?? { icon: "notifications-outline" as const, label: preference.taskType, helper: "Mock notification rule" };
          return (
            <TouchableOpacity key={preference.id} accessibilityRole="switch" accessibilityState={{ checked: preference.enabled }} style={styles.infoRow} onPress={() => togglePreference(preference.id)}>
              <Ionicons name={row.icon} size={22} color={colors.leafDeep} />
              <View style={styles.infoCopy}>
                <Text style={styles.infoTitle}>{row.label}</Text>
                <Text style={styles.infoText}>{row.helper}</Text>
              </View>
              <View style={[styles.toggle, preference.enabled && styles.toggleEnabled]}>
                <View style={[styles.toggleKnob, preference.enabled && styles.toggleKnobEnabled]} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Provider Status</Text>
        <View style={styles.statusGrid}>
          <Status label="Weather provider" value="mock" />
          <Status label="Plant ID provider" value="mock" />
          <Status label="Notifications" value="local" />
          <Status label="Paywall" value="off" />
        </View>
      </View>
    </View>
  );
}

function Field({ label, value, placeholder, onChangeText }: { label: string; value: string; placeholder: string; onChangeText: (value: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={styles.input} value={value} placeholder={placeholder} placeholderTextColor={colors.textMuted} onChangeText={onChangeText} />
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

function mergePreferences(preferences: NotificationPreference[] | undefined, userId: string) {
  const existing = preferences ?? [];
  return defaultPreferences.map((preference) => {
    const saved = existing.find((item) => item.id === preference.id);
    return { ...preference, userId, ...saved };
  });
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
    lineHeight: 23
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  profileCard: {
    borderRadius: 30,
    backgroundColor: colors.leafDeep,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    color: colors.leafDeep,
    fontSize: 9,
    fontWeight: "900",
    marginTop: 2
  },
  profileCopy: {
    flex: 1
  },
  profileName: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "900"
  },
  profileMeta: {
    color: "rgba(255,255,255,0.72)",
    fontSize: typography.small,
    fontWeight: "800",
    marginTop: 2
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
  field: {
    gap: spacing.xs
  },
  fieldLabel: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: colors.surfaceWarm,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  saveButton: {
    minHeight: 50,
    borderRadius: radii.pill,
    backgroundColor: colors.leafDeep,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  saveButtonDisabled: {
    backgroundColor: colors.sage
  },
  saveText: {
    color: colors.white,
    fontSize: typography.small,
    fontWeight: "900"
  },
  infoRow: {
    minHeight: 66,
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
  toggle: {
    width: 52,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.soilSoft,
    padding: 4,
    alignItems: "flex-start"
  },
  toggleEnabled: {
    backgroundColor: colors.leafDeep,
    alignItems: "flex-end"
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white
  },
  toggleKnobEnabled: {
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
