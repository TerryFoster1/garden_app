import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GardenHomeModel, NotificationPreference } from "../../domain";
import type { EntitlementResult } from "../../services/entitlements/entitlementService";
import type { SupabaseBridgeStatus } from "../../services/supabase";
import { colors, radii, spacing, typography } from "../../theme/tokens";

type ProfileScreenProps = {
  model: GardenHomeModel;
  onOpenSettings: () => void;
  onOpenPremium: () => void;
  onUpdateProfile: (updates: { name: string; locationLabel: string; notificationPreferences: NotificationPreference[] }) => void;
  onResetLocalData: () => void;
  onSignOut: () => void;
  entitlements: EntitlementResult;
  supabaseStatus: SupabaseBridgeStatus;
};

const defaultPreferences: NotificationPreference[] = [
  { id: "pref-morning", userId: "user-local", taskType: "watering", enabled: true, quietHoursStart: "21:00", quietHoursEnd: "07:00" },
  { id: "pref-watering", userId: "user-local", taskType: "watering", enabled: true, quietHoursStart: "21:00", quietHoursEnd: "07:00" },
  { id: "pref-weather", userId: "user-local", taskType: "frost-protection", enabled: true, quietHoursStart: "21:00", quietHoursEnd: "07:00" },
  { id: "pref-photo", userId: "user-local", taskType: "pest-check", enabled: true, quietHoursStart: "21:00", quietHoursEnd: "07:00" },
  { id: "pref-harvest", userId: "user-local", taskType: "harvest", enabled: true, quietHoursStart: "21:00", quietHoursEnd: "07:00" }
];

const preferenceLabels: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string; helper: string }> = {
  "pref-morning": { icon: "sunny-outline", label: "Morning plant queue", helper: "A gentle nudge when plants need attention" },
  "pref-watering": { icon: "water-outline", label: "Watering nudges", helper: "Indoor and outdoor water checks" },
  "pref-weather": { icon: "warning-outline", label: "Weather warnings", helper: "Frost, wind, rain, and heat prompts" },
  "pref-photo": { icon: "camera-outline", label: "Photo diary reminders", helper: "Progress photos for plant memory" },
  "pref-harvest": { icon: "basket-outline", label: "Harvest checks", helper: "Gentle prompts when edible plants may be ready" }
};

export function ProfileScreen({ model, onOpenSettings, onOpenPremium, onUpdateProfile, onResetLocalData, onSignOut, entitlements, supabaseStatus }: ProfileScreenProps) {
  const initialPreferences = useMemo(() => mergePreferences(model.notificationPreferences, model.user.id), [model.notificationPreferences, model.user.id]);
  const [displayName, setDisplayName] = useState(model.user.name);
  const [locationLabel, setLocationLabel] = useState(model.user.locationLabel);
  const [preferences, setPreferences] = useState<NotificationPreference[]>(initialPreferences);
  const [showDeveloperSettings, setShowDeveloperSettings] = useState(false);
  const hasChanges = displayName !== model.user.name || locationLabel !== model.user.locationLabel || JSON.stringify(preferences) !== JSON.stringify(initialPreferences);
  const visibleName = displayName.trim() || "My Garden";

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
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your name, location, reminders, and account controls.</Text>
      </View>

      <View style={styles.identityCard}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={34} color={colors.leafDeep} />
        </View>
        <View style={styles.identityCopy}>
          <Text style={styles.profileName}>{visibleName}</Text>
          <Text style={styles.profileMeta}>{model.user.locationLabel || "Location not set"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Edit Profile</Text>
        <Field label="Display name" value={displayName} placeholder="My Garden" onChangeText={setDisplayName} />
        <Field label="Location" value={locationLabel} placeholder="City, province/state, or full address" onChangeText={setLocationLabel} />
        <TouchableOpacity accessibilityRole="button" disabled={!hasChanges} style={[styles.primaryButton, !hasChanges && styles.buttonDisabled]} onPress={saveProfile}>
          <Ionicons name="checkmark" size={18} color={colors.white} />
          <Text style={styles.primaryButtonText}>{hasChanges ? "Save changes" : "Saved"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {preferences.map((preference) => {
          const row = preferenceLabels[preference.id] ?? { icon: "notifications-outline" as const, label: preference.taskType, helper: "Reminder" };
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
        <Text style={styles.sectionTitle}>Subscription</Text>
        <Text style={styles.infoText}>Pattypan is in alpha testing. Premium billing is planned for public beta, but nothing is charged here.</Text>
        <TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} onPress={onOpenPremium}>
          <Text style={styles.secondaryButtonText}>View future Premium</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity accessibilityRole="button" style={styles.signOutButton} onPress={onSignOut}>
          <Ionicons name="log-out-outline" size={19} color={colors.white} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          style={styles.resetButton}
          onPress={() => Alert.alert("Reset local app data?", "This clears the local account, profile, gardens, plants, tasks, photos, and diagnosis records on this device.", [
            { text: "Cancel", style: "cancel" },
            { text: "Reset", style: "destructive", onPress: onResetLocalData }
          ])}
        >
          <Ionicons name="trash-outline" size={18} color={colors.coral} />
          <Text style={styles.resetText}>Reset local app data</Text>
        </TouchableOpacity>
      </View>

      {showDeveloperSettings ? (
        <View style={styles.developerSection}>
          <View style={styles.developerHeader}>
            <Text style={styles.sectionTitle}>Developer Settings</Text>
            <TouchableOpacity accessibilityRole="button" onPress={onOpenSettings}>
              <Text style={styles.devLink}>Open</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statusGrid}>
            <Status label="Weather" value={process.env.EXPO_PUBLIC_WEATHER_PROVIDER || "not set"} />
            <Status label="Plant ID" value={process.env.EXPO_PUBLIC_PLANT_ID_PROVIDER || "not set"} />
            <Status label="AI" value={process.env.EXPO_PUBLIC_AI_PROVIDER || "not set"} />
            <Status label="Supabase" value={supabaseStatus.label} />
            <Status label="Entitlement" value={entitlements.accountState} />
            <Status label="Paywall" value={entitlements.paywallEnabled ? "on" : "off"} />
          </View>
          <Text style={styles.devNote}>{supabaseStatus.detail}</Text>
        </View>
      ) : null}

      <TouchableOpacity accessibilityRole="button" onLongPress={() => setShowDeveloperSettings((current) => !current)} style={styles.versionTap}>
        <Text style={styles.versionText}>Pattypan 0.1</Text>
      </TouchableOpacity>
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
  screen: { gap: spacing.lg },
  header: { gap: spacing.xs },
  title: { color: colors.leafDeep, fontSize: 44, fontWeight: "900", lineHeight: 50 },
  subtitle: { color: colors.textMuted, fontSize: typography.body, lineHeight: 23, fontWeight: "700" },
  identityCard: { borderRadius: 30, backgroundColor: colors.leafDeep, padding: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: { width: 74, height: 74, borderRadius: 37, backgroundColor: "rgba(255,253,243,0.92)", alignItems: "center", justifyContent: "center" },
  identityCopy: { flex: 1 },
  profileName: { color: colors.white, fontSize: typography.section, fontWeight: "900" },
  profileMeta: { color: "rgba(255,255,255,0.72)", fontSize: typography.small, fontWeight: "800", marginTop: 2 },
  section: { borderRadius: 28, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
  sectionTitle: { color: colors.text, fontSize: typography.section, fontWeight: "900" },
  field: { gap: spacing.xs },
  fieldLabel: { color: colors.leaf, fontSize: typography.caption, fontWeight: "900", textTransform: "uppercase" },
  input: { minHeight: 54, borderRadius: 18, backgroundColor: colors.surfaceWarm, paddingHorizontal: spacing.md, color: colors.text, fontSize: typography.body, fontWeight: "800" },
  primaryButton: { minHeight: 50, borderRadius: radii.pill, backgroundColor: colors.leafDeep, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs },
  buttonDisabled: { backgroundColor: colors.sage },
  primaryButtonText: { color: colors.white, fontSize: typography.small, fontWeight: "900" },
  infoRow: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: spacing.md },
  infoCopy: { flex: 1 },
  infoTitle: { color: colors.text, fontSize: typography.body, fontWeight: "900" },
  infoText: { color: colors.textMuted, fontSize: typography.small, lineHeight: 19, fontWeight: "700" },
  toggle: { width: 52, height: 32, borderRadius: radii.pill, backgroundColor: colors.soilSoft, padding: 4, alignItems: "flex-start" },
  toggleEnabled: { backgroundColor: colors.leafDeep, alignItems: "flex-end" },
  toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white },
  toggleKnobEnabled: { backgroundColor: colors.white },
  secondaryButton: { minHeight: 48, borderRadius: radii.pill, backgroundColor: colors.surfaceWarm, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md },
  secondaryButtonText: { color: colors.leafDeep, fontSize: typography.small, fontWeight: "900" },
  signOutButton: { minHeight: 50, borderRadius: radii.pill, backgroundColor: colors.leafDeep, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs },
  signOutText: { color: colors.white, fontSize: typography.small, fontWeight: "900" },
  resetButton: { minHeight: 50, borderRadius: radii.pill, backgroundColor: "#fff0e9", borderWidth: 1, borderColor: "#efc3b6", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs },
  resetText: { color: colors.coral, fontSize: typography.small, fontWeight: "900" },
  developerSection: { borderRadius: 28, backgroundColor: "#eef6e9", borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
  developerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  devLink: { color: colors.leafDeep, fontSize: typography.small, fontWeight: "900" },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statusTile: { width: "48%", minHeight: 76, borderRadius: 20, backgroundColor: colors.surface, justifyContent: "center", padding: spacing.md },
  statusValue: { color: colors.leafDeep, fontSize: typography.small, fontWeight: "900", textTransform: "uppercase" },
  statusLabel: { color: colors.textMuted, fontSize: typography.caption, fontWeight: "800" },
  devNote: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 18, fontWeight: "800" },
  versionTap: { alignItems: "center", paddingVertical: spacing.sm },
  versionText: { color: colors.textMuted, fontSize: typography.caption, fontWeight: "800" }
});
