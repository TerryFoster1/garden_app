import { useState } from "react";
import { ImageBackground, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

import { GeocodedLocation } from "../../services/weather/weatherProvider";
import { colors, spacing, typography } from "../../theme/tokens";

const setupBackground = require("../../../assets/landing/pattypan-vegetable-garden-hero.jpg");

type OnboardingScreenProps = {
  initialDisplayName?: string;
  onResolveLocation: (label: string) => Promise<GeocodedLocation | null>;
  onComplete: (profile: { name: string; locationLabel: string; latitude: number; longitude: number; notificationsEnabled: boolean }) => void;
  onStartGarden: () => void;
  onAddPlant: () => void;
  onLoadDemoGarden: () => void;
};

type SetupStep = "location" | "notifications" | "start";
type FirstMove = "garden" | "addPlant" | "demo";

const stepOrder: SetupStep[] = ["location", "notifications", "start"];
const stepLabels: Record<SetupStep, string> = {
  location: "Location",
  notifications: "Notifications",
  start: "Start Garden"
};

export function OnboardingScreen({ initialDisplayName = "", onResolveLocation, onComplete, onStartGarden, onAddPlant, onLoadDemoGarden }: OnboardingScreenProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 900;
  const [step, setStep] = useState<SetupStep>("location");
  const [firstMove, setFirstMove] = useState<FirstMove>("garden");
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

  const stepIndex = stepOrder.indexOf(step);
  const progressText = `Step ${stepIndex + 1} of 3: ${stepLabels[step]}`;

  function locationLabel() {
    return [street.trim(), city.trim(), region.trim(), postalCode.trim(), country.trim()].filter(Boolean).join(", ");
  }

  async function ensureLocation() {
    const label = locationLabel();
    if (!resolvedLocation && (!city.trim() || !region.trim() || !country.trim())) {
      setError("Enter at least a city, province/state, and country for weather alerts.");
      return null;
    }

    const location = resolvedLocation ?? await onResolveLocation(label);
    if (!location) {
      setError("We couldn't find that location. Please enter a full address or city/postal code.");
      return null;
    }

    setResolvedLocation(location);
    setLocationStatus(`Location set: ${location.label}`);
    return location;
  }

  async function continueFromLocation() {
    setError("");
    setIsChecking(true);
    try {
      const location = await ensureLocation();
      if (location) {
        setStep("notifications");
      }
    } finally {
      setIsChecking(false);
    }
  }

  async function saveProfileAndContinue(next: FirstMove) {
    setError("");
    setIsChecking(true);
    try {
      const location = await ensureLocation();
      if (!location) {
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

  function renderStep() {
    if (step === "location") {
      return (
        <>
          <View style={styles.prompt}>
            <View style={styles.promptIcon}>
              <Ionicons name="navigate-outline" size={21} color="#fffdf3" />
            </View>
            <View style={styles.promptCopy}>
              <Text style={styles.promptTitle}>Use weather where your garden grows</Text>
              <Text style={styles.promptText}>Your local weather helps Pattypan create better garden reminders.</Text>
            </View>
          </View>

          <TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} onPress={useCurrentLocation}>
            <Ionicons name="locate-outline" size={18} color={colors.leafDeep} />
            <Text style={styles.secondaryText}>Use my current location</Text>
          </TouchableOpacity>
          {locationStatus ? <Text style={styles.statusText}>{locationStatus}</Text> : null}

          <View style={styles.form}>
            <Field label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Your name" />
            <Field label="Street address" value={street} onChangeText={updateManualLocation(setStreet)} placeholder="Optional" />
            <Field label="City" value={city} onChangeText={updateManualLocation(setCity)} placeholder="Kitchener" />
            <Field label="Province / State" value={region} onChangeText={updateManualLocation(setRegion)} placeholder="Ontario" />
            <Field label="Postal / ZIP" value={postalCode} onChangeText={updateManualLocation(setPostalCode)} placeholder="Optional but helpful" />
            <Field label="Country" value={country} onChangeText={updateManualLocation(setCountry)} placeholder="Canada" />
          </View>

          <PrimarySetupButton label={isChecking ? "Checking location..." : "Continue"} onPress={continueFromLocation} />
        </>
      );
    }

    if (step === "notifications") {
      return (
        <>
          <View style={styles.prompt}>
            <View style={styles.promptIcon}>
              <Ionicons name="notifications-outline" size={21} color="#fffdf3" />
            </View>
            <View style={styles.promptCopy}>
              <Text style={styles.promptTitle}>Gentle reminders, only when useful</Text>
              <Text style={styles.promptText}>Allow watering, frost, heat, wind, harvest, and weekly photo prompts.</Text>
            </View>
          </View>

          <TouchableOpacity accessibilityRole="switch" accessibilityState={{ checked: notificationsEnabled }} style={styles.notificationChoice} onPress={requestNotifications}>
            <View>
              <Text style={styles.choiceTitle}>{notificationsEnabled ? "Reminders are on" : "Reminders are off"}</Text>
              <Text style={styles.choiceText}>You can change notification categories later in Profile.</Text>
            </View>
            <View style={[styles.toggle, notificationsEnabled && styles.toggleEnabled]}>
              <View style={[styles.toggleKnob, notificationsEnabled && styles.toggleKnobEnabled]} />
            </View>
          </TouchableOpacity>
          {notificationStatus ? <Text style={styles.statusText}>{notificationStatus}</Text> : null}

          <PrimarySetupButton label="Continue" onPress={() => setStep("start")} />
          <TouchableOpacity accessibilityRole="button" style={styles.textButton} onPress={() => setStep("location")}>
            <Text style={styles.textButtonLabel}>Back to location</Text>
          </TouchableOpacity>
        </>
      );
    }

    return (
      <>
        <View style={styles.prompt}>
          <View style={styles.promptIcon}>
            <Ionicons name="leaf-outline" size={21} color="#fffdf3" />
          </View>
          <View style={styles.promptCopy}>
            <Text style={styles.promptTitle}>How would you like to begin?</Text>
            <Text style={styles.promptText}>Start with a garden bed, add a plant, or load demo data for a quick tour.</Text>
          </View>
        </View>

        <View style={styles.choiceList}>
          <StartChoice active={firstMove === "garden"} icon="grid-outline" title="Create Garden" text="Add a bed, container, or growing space." onPress={() => setFirstMove("garden")} />
          <StartChoice active={firstMove === "addPlant"} icon="leaf-outline" title="Add Plant" text="Search, scan, or add your first plant." onPress={() => setFirstMove("addPlant")} />
          <StartChoice active={firstMove === "demo"} icon="flask-outline" title="Load Demo Garden" text="Marked sample content for exploring." onPress={() => setFirstMove("demo")} />
        </View>

        <PrimarySetupButton label={isChecking ? "Saving setup..." : "Continue"} onPress={() => saveProfileAndContinue(firstMove)} />
        <TouchableOpacity accessibilityRole="button" style={styles.textButton} onPress={() => setStep("notifications")}>
          <Text style={styles.textButtonLabel}>Back to notifications</Text>
        </TouchableOpacity>
      </>
    );
  }

  return (
    <ImageBackground source={setupBackground} resizeMode="cover" style={styles.screen} imageStyle={styles.backgroundImage}>
      <LinearGradient colors={["rgba(48,75,13,0.48)", "rgba(21,43,10,0.7)"]} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={["rgba(4,16,8,0.42)", "rgba(4,16,8,0.04)", "rgba(4,16,8,0.72)"]} locations={[0, 0.36, 1]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={[styles.scrollContent, isDesktop && styles.desktopScrollContent]} keyboardShouldPersistTaps="handled">
        <View style={[styles.panel, isDesktop && styles.desktopPanel]}>
          <View style={styles.progressRow}>
            {stepOrder.map((item, index) => (
              <View key={item} style={[styles.progressDot, index <= stepIndex && styles.progressDotActive]} />
            ))}
          </View>
          <Text style={styles.stepText}>{progressText}</Text>
          <Text style={styles.headline}>Let's personalize Pattypan</Text>
          <Text style={styles.supportingCopy}>Your local weather helps Pattypan create better garden reminders.</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {renderStep()}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

function Field({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="rgba(33,53,42,0.46)" style={styles.input} />
    </View>
  );
}

function PrimarySetupButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryText}>{label}</Text>
    </TouchableOpacity>
  );
}

function StartChoice({ active, icon, title, text, onPress }: { active: boolean; icon: keyof typeof Ionicons.glyphMap; title: string; text: string; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" style={[styles.startChoice, active && styles.startChoiceActive]} onPress={onPress}>
      <View style={[styles.startIcon, active && styles.startIconActive]}>
        <Ionicons name={icon} size={18} color={active ? "#fffdf3" : colors.leafDeep} />
      </View>
      <View style={styles.startCopy}>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceText}>{text}</Text>
      </View>
      {active ? <Ionicons name="checkmark-circle" size={20} color={colors.leafDeep} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: "100%"
  },
  backgroundImage: {
    transform: [{ scale: 1.04 }]
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 36
  },
  desktopScrollContent: {
    alignItems: "center",
    paddingVertical: 72
  },
  panel: {
    width: "100%",
    borderRadius: 28,
    backgroundColor: "rgba(255,253,248,0.9)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.42)",
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 }
  },
  desktopPanel: {
    maxWidth: 520,
    paddingHorizontal: 34,
    paddingVertical: 34
  },
  progressRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: spacing.md
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 99,
    backgroundColor: "rgba(36,79,55,0.16)"
  },
  progressDotActive: {
    backgroundColor: colors.leafDeep
  },
  stepText: {
    color: colors.leaf,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    marginBottom: spacing.xs
  },
  headline: {
    color: colors.leafDeep,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.4
  },
  supportingCopy: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    marginTop: spacing.sm,
    marginBottom: spacing.lg
  },
  prompt: {
    borderRadius: 24,
    backgroundColor: "rgba(36,79,55,0.08)",
    borderWidth: 1,
    borderColor: "rgba(36,79,55,0.12)",
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    marginBottom: spacing.md
  },
  promptIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.leafDeep,
    alignItems: "center",
    justifyContent: "center"
  },
  promptCopy: {
    flex: 1
  },
  promptTitle: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900"
  },
  promptText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    marginTop: 3
  },
  form: {
    gap: 13,
    marginTop: spacing.md,
    marginBottom: spacing.lg
  },
  field: {
    gap: 7
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800"
  },
  input: {
    minHeight: 55,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(36,79,55,0.14)",
    backgroundColor: "rgba(255,255,255,0.82)",
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  secondaryButton: {
    minHeight: 50,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(36,79,55,0.16)",
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  secondaryText: {
    color: colors.leafDeep,
    fontSize: 15,
    fontWeight: "900"
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: colors.leafDeep,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 }
  },
  primaryText: {
    color: "#fffdf3",
    fontSize: 17,
    fontWeight: "900"
  },
  notificationChoice: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(36,79,55,0.14)",
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 999,
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
  choiceList: {
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  startChoice: {
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "rgba(36,79,55,0.13)",
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  startChoiceActive: {
    backgroundColor: "rgba(245,234,217,0.94)",
    borderColor: "rgba(36,79,55,0.28)"
  },
  startIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(36,79,55,0.1)",
    alignItems: "center",
    justifyContent: "center"
  },
  startIconActive: {
    backgroundColor: colors.leafDeep
  },
  startCopy: {
    flex: 1
  },
  choiceTitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900"
  },
  choiceText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 2
  },
  textButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm
  },
  textButtonLabel: {
    color: colors.leafDeep,
    fontSize: 14,
    fontWeight: "900"
  },
  errorText: {
    color: colors.coral,
    fontSize: typography.small,
    fontWeight: "900",
    lineHeight: 19,
    marginBottom: spacing.md
  },
  statusText: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    lineHeight: 17,
    fontWeight: "800",
    marginTop: spacing.sm
  }
});
