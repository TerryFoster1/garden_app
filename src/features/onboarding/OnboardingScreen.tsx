import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

import { GardenCard } from "../../components/GardenCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { GeocodedLocation } from "../../services/weather/weatherProvider";
import { colors, radii, spacing, typography } from "../../theme/tokens";

type OnboardingScreenProps = {
  initialDisplayName?: string;
  onResolveLocation: (label: string) => Promise<GeocodedLocation | null>;
  onComplete: (profile: { name: string; locationLabel: string; latitude: number; longitude: number; notificationsEnabled: boolean }) => void;
  onStartGarden: () => void;
  onAddPlant: () => void;
  onLoadDemoGarden: () => void;
};

export function OnboardingScreen({ initialDisplayName = "", onResolveLocation, onComplete, onStartGarden, onAddPlant, onLoadDemoGarden }: OnboardingScreenProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Canada");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [resolvedLocation, setResolvedLocation] = useState<GeocodedLocation | null>(null);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [notificationStatus, setNotificationStatus] = useState("");

  async function saveProfileAndContinue(next: "addPlant" | "garden" | "demo") {
    setError("");
    const label = [street.trim(), city.trim(), region.trim(), postalCode.trim(), country.trim()].filter(Boolean).join(", ");
    if (!resolvedLocation && (!city.trim() || !region.trim() || !country.trim())) {
      setError("Enter at least a city, province/state, and country for weather alerts.");
      return;
    }

    setIsChecking(true);
    try {
      const location = resolvedLocation ?? await onResolveLocation(label);
      if (!location) {
        setError("We couldn't find that location. Please enter a full address or city/postal code.");
        return;
      }

      onComplete({
        name: displayName.trim(),
        locationLabel: location.label,
        latitude: location.latitude,
        longitude: location.longitude,
        notificationsEnabled
      });

      if (next === "addPlant") {
        onAddPlant();
        return;
      }
      if (next === "garden") {
        onStartGarden();
        return;
      }
      onLoadDemoGarden();
    } finally {
      setIsChecking(false);
    }
  }

  async function useCurrentLocation() {
    setError("");
    setLocationStatus("Requesting location...");
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      setLocationStatus("Location permission was not granted. Enter an address instead.");
      return;
    }

    try {
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const reverse = await Location.reverseGeocodeAsync(current.coords);
      const place = reverse[0];
      const label = [place?.city, place?.region, place?.postalCode, place?.country].filter(Boolean).join(", ") || "Current location";
      setCity(place?.city ?? "");
      setRegion(place?.region ?? "");
      setPostalCode(place?.postalCode ?? "");
      setCountry(place?.country ?? country);
      setResolvedLocation({ label, latitude: current.coords.latitude, longitude: current.coords.longitude });
      setLocationStatus(`Location set: ${label}`);
    } catch {
      setLocationStatus("We could not read your current location. Enter an address instead.");
    }
  }

  async function requestNotifications() {
    setNotificationStatus("Requesting reminders...");
    const permission = await Notifications.requestPermissionsAsync();
    const granted = permission.granted || permission.status === "granted";
    setNotificationsEnabled(granted);
    setNotificationStatus(granted ? "Reminders allowed for this device." : "Reminders not allowed. You can still use Pattypan without notifications.");
  }

  function updateManualLocation(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setResolvedLocation(null);
      setLocationStatus("");
    };
  }

  return (
    <View>
      <ScreenHeader eyebrow="First setup" title="Make Pattypan yours." subtitle="Account created locally. Now add the location Pattypan should use for weather and garden alerts." />

      <GardenCard tone="warm">
        <Ionicons name="location-outline" size={28} color={colors.leafDeep} />
        <Text style={styles.cardTitle}>Weather starts with a real location</Text>
        <Text style={styles.cardText}>Pattypan will geocode this before saving. If it cannot be found, the app will ask for a more complete address.</Text>
        <TouchableOpacity accessibilityRole="button" style={styles.permissionButton} onPress={useCurrentLocation}>
          <Ionicons name="navigate-outline" size={18} color={colors.leafDeep} />
          <Text style={styles.permissionText}>Use my current location</Text>
        </TouchableOpacity>
        {locationStatus ? <Text style={styles.statusText}>{locationStatus}</Text> : null}
      </GardenCard>

      <View style={styles.form}>
        <Field label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" />
        <Field label="Street address" value={street} onChangeText={updateManualLocation(setStreet)} placeholder="Optional" />
        <Field label="City" value={city} onChangeText={updateManualLocation(setCity)} placeholder="Kitchener" />
        <Field label="Province / State" value={region} onChangeText={updateManualLocation(setRegion)} placeholder="Ontario" />
        <Field label="Postal / ZIP code" value={postalCode} onChangeText={updateManualLocation(setPostalCode)} placeholder="Optional but helpful" />
        <Field label="Country" value={country} onChangeText={updateManualLocation(setCountry)} placeholder="Canada" />
      </View>

      <TouchableOpacity accessibilityRole="switch" accessibilityState={{ checked: notificationsEnabled }} style={styles.notificationCard} onPress={requestNotifications}>
        <Ionicons name="notifications-outline" size={24} color={colors.leafDeep} />
        <View style={styles.notificationCopy}>
          <Text style={styles.cardTitle}>Allow reminders and garden warnings</Text>
          <Text style={styles.cardText}>Daily brief, watering, frost/heat/wind, harvest, and weekly photo update categories are scaffolded locally.</Text>
          {notificationStatus ? <Text style={styles.statusText}>{notificationStatus}</Text> : null}
        </View>
        <View style={[styles.toggle, notificationsEnabled && styles.toggleEnabled]}>
          <View style={[styles.toggleKnob, notificationsEnabled && styles.toggleKnobEnabled]} />
        </View>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <GardenCard>
        <Text style={styles.stepNumber}>First move</Text>
        <Text style={styles.cardTitle}>Choose how to begin</Text>
        <Text style={styles.cardText}>Add a real plant, create a bed/container, or load marked demo data only when you want sample content.</Text>
      </GardenCard>

      <View style={styles.actions}>
        <PrimaryButton label={isChecking ? "Checking location..." : "Add Plant"} onPress={() => saveProfileAndContinue("addPlant")} icon={<Ionicons name="leaf-outline" size={20} color={colors.white} />} />
        <PrimaryButton label="Create Garden" onPress={() => saveProfileAndContinue("garden")} tone="sun" icon={<Ionicons name="grid-outline" size={20} color={colors.leafDeep} />} />
        <PrimaryButton label="Load Demo Garden" onPress={() => saveProfileAndContinue("demo")} tone="quiet" icon={<Ionicons name="flask-outline" size={20} color={colors.leafDeep} />} />
      </View>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  cardText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20
  },
  stepNumber: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  actions: {
    gap: spacing.sm
  },
  form: {
    gap: spacing.sm,
    marginBottom: spacing.md
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
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  notificationCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  notificationCopy: {
    flex: 1
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
  errorText: {
    color: colors.coral,
    fontSize: typography.small,
    fontWeight: "900",
    marginBottom: spacing.sm
  },
  permissionButton: {
    minHeight: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  permissionText: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  statusText: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    lineHeight: 17,
    fontWeight: "800",
    marginTop: spacing.xs
  }
});
