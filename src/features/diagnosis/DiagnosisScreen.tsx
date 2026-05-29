import { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { GardenCard } from "../../components/GardenCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { GardenHomeModel, PlantHealthScan } from "../../domain";
import { aiRecommendationProvider, AiAssistantResponse } from "../../services/aiRecommendationProvider";
import { MockPlantIdentificationResult, plantIdentificationProvider, PlantIdentificationMatch } from "../../services/plantIdentificationProvider";
import { colors, radii, spacing, typography } from "../../theme/tokens";

type DiagnosisScreenProps = {
  model: GardenHomeModel;
  initialPlantId?: string | null;
  onBack: () => void;
  onSaveDiagnosis: (input: { plantId?: string; photoUri: string; note: string; symptoms: string[] }) => void;
};

const symptoms = ["yellow leaves", "spots", "wilting", "pest damage", "mildew/mold", "other"];

export function DiagnosisScreen({ model, initialPlantId, onBack, onSaveDiagnosis }: DiagnosisScreenProps) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [plantId, setPlantId] = useState(initialPlantId ?? "");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [scan, setScan] = useState<PlantHealthScan | null>(null);
  const [answer, setAnswer] = useState<AiAssistantResponse | null>(null);
  const [matches, setMatches] = useState<PlantIdentificationMatch[]>([]);
  const [identificationDebug, setIdentificationDebug] = useState<MockPlantIdentificationResult["debug"] | null>(null);
  const [identificationError, setIdentificationError] = useState("");
  const linkedPlant = model.plantInstances.find((plant) => plant.id === plantId);

  async function pickImage(source: "camera" | "library") {
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
      setPhotoUri(result.assets[0].uri);
      setScan(null);
      setAnswer(null);
      setMatches([]);
      setIdentificationDebug(null);
      setIdentificationError("");
    }
  }

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms((current) => current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom]);
  }

  async function runDiagnosis() {
    if (!photoUri) {
      return;
    }

    const symptomList = [...selectedSymptoms, customSymptom.trim()].filter(Boolean);
    setIsRunning(true);
    try {
      const [healthScan, identification] = await Promise.all([
        plantIdentificationProvider.diagnosePlant(photoUri),
        plantIdentificationProvider.identifyPlant(photoUri).catch(() => null)
      ]);
      setMatches(identification?.matches ?? []);
      setIdentificationDebug(identification?.debug ?? null);
      setIdentificationError("");
      const topMatch = identification?.matches[0]?.commonName;
      const explanation = await aiRecommendationProvider.explainDiagnosis({
        plantName: linkedPlant?.nickname,
        plantIdentification: topMatch,
        symptoms: [...symptomList, ...healthScan.suspectedIssues],
        context: `Location: ${model.user.locationLabel || "unknown"}. Weather: ${model.weather.temperatureC}C, humidity ${model.weather.humidityPercent}%, wind ${model.weather.windKph}km/h.`
      });
      setScan(healthScan);
      setAnswer(explanation);
    } catch {
      setScan({
        id: `diagnosis-fallback-${Date.now()}`,
        plantInstanceId: plantId || undefined,
        photoId: `photo-diagnosis-${Date.now()}`,
        suspectedIssues: symptomList.length ? symptomList : ["Unable to classify from photo"],
        recommendationSummary: "Diagnosis provider unavailable. Use local checks: moisture, leaf pattern, pests under leaves, and recent weather stress.",
        requiresRuleValidation: true
      });
      setAnswer({
        provider: "local",
        confidence: "low",
        answer: "AI is unavailable, so this is local guidance. Check moisture first, inspect leaf undersides, isolate severe pest issues, and avoid fertilizing until you understand the stress pattern.",
        actions: ["Check soil moisture.", "Inspect both sides of leaves.", "Remove badly diseased leaves only if safe.", "Create a follow-up task if the issue is spreading."]
      });
      setMatches([]);
      setIdentificationDebug(null);
      setIdentificationError("Plant identity lookup was unavailable; diagnosis used local symptom guidance.");
    } finally {
      setIsRunning(false);
    }
  }

  function saveDiagnosis() {
    if (!photoUri) {
      return;
    }

    onSaveDiagnosis({
      plantId: plantId || undefined,
      photoUri,
      note: answer?.answer ?? scan?.recommendationSummary ?? "Diagnosis photo saved.",
      symptoms: [...selectedSymptoms, customSymptom.trim()].filter(Boolean)
    });
    onBack();
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader onBack={onBack} eyebrow="Diagnosis" title="What looks wrong?" subtitle="Use a photo, symptoms, and Pattypan's provider-backed guidance. Confirm before acting." />

      {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : (
        <GardenCard tone="warm">
          <Text style={styles.cardTitle}>Add a diagnosis photo</Text>
          <Text style={styles.cardText}>A clear photo of leaves, stems, pests, or soil helps Pattypan explain likely causes.</Text>
        </GardenCard>
      )}

      <View style={styles.actions}>
        <PrimaryButton label="Take photo" onPress={() => pickImage("camera")} tone="sun" icon={<Ionicons name="camera" size={20} color={colors.leafDeep} />} style={styles.actionButton} />
        <PrimaryButton label="Pick photo" onPress={() => pickImage("library")} icon={<Ionicons name="images-outline" size={20} color={colors.white} />} style={styles.actionButton} />
      </View>

      <Text style={styles.sectionTitle}>Link to plant, optional</Text>
      <View style={styles.plantRail}>
        {model.plantInstances.slice(0, 8).map((plant) => (
          <TouchableOpacity key={plant.id} accessibilityRole="button" style={[styles.plantChip, plant.id === plantId && styles.plantChipActive]} onPress={() => setPlantId(plant.id)}>
            <Text style={[styles.plantChipText, plant.id === plantId && styles.plantChipTextActive]}>{plant.nickname}</Text>
          </TouchableOpacity>
        ))}
        {model.plantInstances.length === 0 ? <Text style={styles.cardText}>No plants yet. Diagnosis can still run without a linked plant.</Text> : null}
      </View>

      <Text style={styles.sectionTitle}>Symptoms</Text>
      <View style={styles.symptomGrid}>
        {symptoms.map((symptom) => (
          <TouchableOpacity key={symptom} accessibilityRole="button" style={[styles.symptomChip, selectedSymptoms.includes(symptom) && styles.symptomChipActive]} onPress={() => toggleSymptom(symptom)}>
            <Text style={[styles.symptomText, selectedSymptoms.includes(symptom) && styles.symptomTextActive]}>{symptom}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput value={customSymptom} onChangeText={setCustomSymptom} placeholder="Add symptom notes..." placeholderTextColor={colors.textMuted} style={styles.input} />

      <PrimaryButton label={isRunning ? "Checking..." : "Run Diagnosis"} onPress={runDiagnosis} icon={<Ionicons name="sparkles-outline" size={20} color={colors.white} />} />

      {matches.length > 0 ? (
        <View style={styles.matchPanel}>
          <Text style={styles.matchLabel}>{identificationDebug?.providerUsed === "PlantNet" ? "Possible PlantNet identity" : "Possible local demo identity"}</Text>
          {identificationDebug?.fallbackTriggered ? <Text style={styles.warningText}>Using local demo identification: {identificationDebug.fallbackReason}</Text> : null}
          {matches[0]?.confidence && matches[0].confidence < 0.35 ? <Text style={styles.warningText}>We're not confident. Try another photo or search manually.</Text> : null}
          {matches.slice(0, 3).map((match) => (
            <View key={match.id} style={styles.matchRow}>
              <View style={styles.matchCopy}>
                <Text style={styles.matchName}>{match.commonName}</Text>
                {match.scientificName ? <Text style={styles.matchScientific}>{match.scientificName}</Text> : null}
              </View>
              <Text style={styles.matchScore}>{Math.round(match.confidence * 100)}%</Text>
            </View>
          ))}
        </View>
      ) : null}
      {identificationError ? <Text style={styles.warningText}>{identificationError}</Text> : null}

      {answer ? (
        <View style={styles.resultCard}>
          <Text style={styles.matchLabel}>{answer.provider === "openai" ? "Pattypan AI" : "Local guidance"} - {answer.confidence} confidence</Text>
          <Text style={styles.resultText}>{answer.answer}</Text>
          {answer.actions.map((action) => <Text key={action} style={styles.cardText}>- {action}</Text>)}
          {photoUri ? <PrimaryButton label="Save to plant history" onPress={saveDiagnosis} tone="quiet" /> : null}
        </View>
      ) : null}
    </View>
  );
}

function ProviderDebugPanel({ debug }: { debug: MockPlantIdentificationResult["debug"] }) {
  return (
    <View style={styles.debugPanel}>
      <Text style={styles.debugTitle}>Development identification status</Text>
      <Text style={styles.debugText}>Provider used: {debug.providerUsed}</Text>
      <Text style={styles.debugText}>API key detected: {debug.apiKeyDetected ? "yes" : "no"}</Text>
      <Text style={styles.debugText}>Image URI type: {debug.imageUriType}</Text>
      <Text style={styles.debugText}>Response status: {debug.responseStatus ?? "n/a"}</Text>
      <Text style={styles.debugText}>Candidates returned: {debug.candidateCount}</Text>
      <Text style={styles.debugText}>Fallback triggered: {debug.fallbackTriggered ? "yes" : "no"}</Text>
      {debug.fallbackReason ? <Text style={styles.debugText}>Fallback reason: {debug.fallbackReason}</Text> : null}
    </View>
  );
}

function isDevelopmentMode() {
  return process.env.NODE_ENV !== "production";
}

const styles = StyleSheet.create({
  screen: { gap: spacing.lg },
  photo: { width: "100%", height: 260, borderRadius: 28, backgroundColor: colors.surfaceWarm },
  actions: { flexDirection: "row", gap: spacing.sm },
  actionButton: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: typography.body, fontWeight: "900" },
  cardText: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20, fontWeight: "700" },
  sectionTitle: { color: colors.text, fontSize: typography.section, fontWeight: "900" },
  plantRail: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  plantChip: { minHeight: 40, borderRadius: radii.pill, backgroundColor: colors.surfaceWarm, paddingHorizontal: spacing.md, justifyContent: "center" },
  plantChipActive: { backgroundColor: colors.leafDeep },
  plantChipText: { color: colors.leafDeep, fontSize: typography.caption, fontWeight: "900" },
  plantChipTextActive: { color: colors.white },
  symptomGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  symptomChip: { minHeight: 42, borderRadius: radii.pill, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, justifyContent: "center" },
  symptomChipActive: { backgroundColor: colors.leafDeep, borderColor: colors.leafDeep },
  symptomText: { color: colors.textMuted, fontSize: typography.small, fontWeight: "900" },
  symptomTextActive: { color: colors.white },
  input: { minHeight: 54, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.md, color: colors.text, fontSize: typography.body, fontWeight: "800" },
  resultCard: { borderRadius: 26, backgroundColor: "#eef6e9", borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm },
  matchPanel: { borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  matchLabel: { color: colors.leaf, fontSize: typography.caption, fontWeight: "900", textTransform: "uppercase" },
  matchRow: { minHeight: 38, borderRadius: 14, backgroundColor: colors.surfaceWarm, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  matchCopy: { flex: 1, paddingVertical: spacing.sm },
  matchName: { color: colors.text, fontSize: typography.small, fontWeight: "900" },
  matchScientific: { color: colors.textMuted, fontSize: typography.caption, fontWeight: "700", marginTop: 2 },
  matchScore: { color: colors.leafDeep, fontSize: typography.caption, fontWeight: "900" },
  resultText: { color: colors.text, fontSize: typography.small, lineHeight: 21, fontWeight: "800" },
  warningText: { color: colors.coral, fontSize: typography.small, lineHeight: 20, fontWeight: "900" },
  debugPanel: { borderRadius: 16, backgroundColor: "rgba(36,79,55,0.08)", borderWidth: 1, borderColor: "rgba(36,79,55,0.16)", padding: spacing.md, gap: 3, marginTop: spacing.sm },
  debugTitle: { color: colors.leafDeep, fontSize: typography.caption, fontWeight: "900", textTransform: "uppercase" },
  debugText: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 16, fontWeight: "800" }
});
