import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { GardenCard } from "../../components/GardenCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { GardenHomeModel, PlantStage } from "../../domain";
import { getKnowledgeOptions } from "../../data/plantKnowledge";
import { MockPlantIdentificationResult, stubPlantIdentificationProvider } from "../../services";
import { colors, spacing, typography } from "../../theme/tokens";
import { GardenPlacement, getGardenPlacements } from "../my-garden/LocationManagementScreen";
import { AddPlantDraft, AddPlantPlacement } from "./types";

type AddPlantFlowScreenProps = {
  model: GardenHomeModel;
  selectedPhotoUri?: string | null;
  initialPlacement?: GardenPlacement | null;
  onPhotoSelected: (photoUri: string) => void;
  onPlantAdded: (draft: AddPlantDraft) => void;
  onBack: () => void;
};

const stages: PlantStage[] = ["seed", "seedling", "transplant", "established", "flowering", "fruiting"];

export function AddPlantFlowScreen({ model, selectedPhotoUri, initialPlacement, onPhotoSelected, onPlantAdded, onBack }: AddPlantFlowScreenProps) {
  const [step, setStep] = useState<"photo" | "confirm" | "place">("photo");
  const [identification, setIdentification] = useState<MockPlantIdentificationResult | undefined>();
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [plantName, setPlantName] = useState("");
  const [variety, setVariety] = useState("");
  const [stage, setStage] = useState<PlantStage>("transplant");
  const [plantedOn, setPlantedOn] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const placements = useMemo<AddPlantPlacement[]>(() => getGardenPlacements(model), [model]);
  const knowledgeOptions = useMemo(() => getKnowledgeOptions(), []);

  const [placementId, setPlacementId] = useState(initialPlacement?.id ?? placements[0]?.id ?? "");
  const selectedPlacement = placements.find((placement) => placement.id === placementId) ?? placements[0];

  useEffect(() => {
    if (!selectedPhotoUri || identification || isIdentifying) {
      return;
    }

    setIsIdentifying(true);
    stubPlantIdentificationProvider
      .identifyPlant(selectedPhotoUri)
      .then((result) => {
        setIdentification(result);
        setPlantName(result.possiblePlantName);
        setNotes(result.warnings.join(" "));
        setStep("confirm");
      })
      .finally(() => setIsIdentifying(false));
  }, [identification, isIdentifying, selectedPhotoUri]);

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
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });

    if (!result.canceled && result.assets[0]?.uri) {
      setIdentification(undefined);
      onPhotoSelected(result.assets[0].uri);
    }
  }

  function acceptIdentification() {
    if (identification) {
      setPlantName(identification.possiblePlantName);
    }
    setStep("place");
  }

  function searchManually() {
    setIdentification(undefined);
    setPlantName("");
    setNotes("Added manually after skipping mock photo identification.");
    setStep("confirm");
  }

  function chooseKnownPlant(name: string) {
    setIdentification(undefined);
    setPlantName(name);
    setNotes(`Added from Garden App knowledge: ${name}.`);
    setStep("place");
  }

  function savePlant() {
    if (!plantName.trim() || !selectedPlacement) {
      return;
    }

    onPlantAdded({
      photoUri: selectedPhotoUri ?? undefined,
      identification,
      plantName: plantName.trim(),
      variety: variety.trim(),
      placement: selectedPlacement,
      stage,
      plantedOn,
      notes: notes.trim()
    });
  }

  return (
    <View>
      <ScreenHeader onBack={onBack} eyebrow="Add plant" title="Confirm before adding" subtitle="Mock identification can suggest a starting point, but you stay in control of the plant name and placement." />

      {selectedPhotoUri ? (
        <Image source={{ uri: selectedPhotoUri }} style={styles.photoPreview} />
      ) : (
        <GardenCard tone="warm">
          <Text style={styles.cardTitle}>Start with a photo or add manually</Text>
          <Text style={styles.cardText}>Take a plant photo or choose one from your library. Identification is mocked for now.</Text>
        </GardenCard>
      )}

      {step === "photo" ? (
        <View style={styles.buttonStack}>
          <View style={styles.actions}>
            <PrimaryButton label="Take photo" onPress={() => pickImage("camera")} tone="sun" icon={<Ionicons name="camera" size={20} color={colors.leafDeep} />} style={styles.actionButton} />
            <PrimaryButton label="Pick photo" onPress={() => pickImage("library")} icon={<Ionicons name="images-outline" size={20} color={colors.white} />} style={styles.actionButton} />
          </View>
          <PrimaryButton label="Search manually instead" onPress={searchManually} tone="quiet" />
          {isIdentifying ? <Text style={styles.statusText}>Looking for a possible match...</Text> : null}
        </View>
      ) : null}

      {step === "confirm" ? (
        <View>
          {identification ? (
            <GardenCard tone="sky">
              <Text style={styles.matchLabel}>{identification.confidenceLabel}</Text>
              <Text style={styles.cardTitle}>{identification.possiblePlantName}</Text>
              <Text style={styles.cardText}>{Math.round(identification.confidence * 100)}% mock confidence. Confirm before adding.</Text>
              <Text style={styles.cardText}>{identification.careSummary}</Text>
              <Text style={styles.cardText}>Light: {identification.lightNeeds}</Text>
              <Text style={styles.cardText}>Water: {identification.wateringNeeds}. Feeding: {identification.feedingNotes}</Text>
              {identification.warnings.map((warning) => (
                <Text key={warning} style={styles.warningText}>{warning}</Text>
              ))}
            </GardenCard>
          ) : (
            <GardenCard tone="warm">
              <Text style={styles.matchLabel}>Manual search</Text>
              <Text style={styles.cardText}>Search is mocked in this slice. Type the plant name you want to add.</Text>
            </GardenCard>
          )}

          <TextInput value={plantName} onChangeText={setPlantName} placeholder="Plant name" placeholderTextColor={colors.textMuted} style={styles.input} />
          <TextInput value={variety} onChangeText={setVariety} placeholder="Variety or nickname, optional" placeholderTextColor={colors.textMuted} style={styles.input} />

          <Text style={styles.sectionTitle}>Or choose from garden knowledge</Text>
          <View style={styles.chips}>
            {knowledgeOptions.slice(0, 16).map((option) => (
              <TouchableOpacity key={option.commonName} accessibilityRole="button" style={styles.chip} onPress={() => chooseKnownPlant(option.commonName)}>
                <Text style={styles.chipText}>{option.commonName}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <PrimaryButton label="Accept" onPress={acceptIdentification} style={styles.actionButton} />
            <PrimaryButton label="Search manually" onPress={searchManually} tone="quiet" style={styles.actionButton} />
          </View>
        </View>
      ) : null}

      {step === "place" ? (
        <View>
          <Text style={styles.sectionTitle}>Indoor or outdoor location</Text>
          {placements.map((placement) => (
            <TouchableOpacity key={placement.id} accessibilityRole="button" onPress={() => setPlacementId(placement.id)}>
              <GardenCard tone={placement.id === placementId ? "warm" : "surface"}>
                <Text style={styles.cardTitle}>{placement.label}</Text>
                <Text style={styles.cardText}>{model.gardens.find((garden) => garden.id === placement.gardenId)?.name} - {placement.kind} - {placement.locationType.replaceAll("-", " ")}</Text>
              </GardenCard>
            </TouchableOpacity>
          ))}

          <Text style={styles.sectionTitle}>Plant stage</Text>
          <View style={styles.chips}>
            {stages.map((item) => (
              <TouchableOpacity key={item} accessibilityRole="button" style={[styles.chip, item === stage && styles.activeChip]} onPress={() => setStage(item)}>
                <Text style={[styles.chipText, item === stage && styles.activeChipText]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput value={plantedOn} onChangeText={setPlantedOn} placeholder="Planted date YYYY-MM-DD" placeholderTextColor={colors.textMuted} style={styles.input} />
          <TextInput value={notes} onChangeText={setNotes} placeholder="Notes" placeholderTextColor={colors.textMuted} style={[styles.input, styles.notesInput]} multiline />

          <PrimaryButton label="Add to my garden" onPress={savePlant} icon={<Ionicons name="leaf-outline" size={20} color={colors.white} />} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  photoPreview: {
    width: "100%",
    height: 250,
    borderRadius: 28,
    marginBottom: spacing.lg,
    backgroundColor: colors.surfaceWarm
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  actionButton: {
    flex: 1
  },
  buttonStack: {
    gap: spacing.sm
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
  },
  matchLabel: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  warningText: {
    color: colors.coral,
    fontSize: typography.small,
    fontWeight: "800",
    lineHeight: 20
  },
  statusText: {
    color: colors.textMuted,
    fontSize: typography.small,
    textAlign: "center"
  },
  input: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: typography.body,
    marginBottom: spacing.md
  },
  notesInput: {
    minHeight: 92,
    paddingTop: spacing.md,
    textAlignVertical: "top"
  },
  sectionTitle: {
    fontSize: typography.section,
    fontWeight: "900",
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  activeChip: {
    backgroundColor: colors.leafDeep,
    borderColor: colors.leafDeep
  },
  chipText: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "800"
  },
  activeChipText: {
    color: colors.white
  }
});
