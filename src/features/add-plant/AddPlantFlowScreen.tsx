import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { GardenCard } from "../../components/GardenCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { GardenHomeModel, PlantStage } from "../../domain";
import { PlantIndexRecord } from "../../data/plantIndex";
import { MockPlantIdentificationResult, plantIdentificationProvider, PlantIdentificationMatch } from "../../services";
import { searchPlants } from "../../services/plantSearch";
import { colors, spacing, typography } from "../../theme/tokens";
import { GardenPlacement, getGardenPlacements } from "../my-garden/LocationManagementScreen";
import { AddPlantDraft, AddPlantPlacement } from "./types";

type AddPlantFlowScreenProps = {
  model: GardenHomeModel;
  selectedPhotoUri?: string | null;
  initialPlacement?: GardenPlacement | null;
  backSignal?: number;
  onPhotoSelected: (photoUri: string) => void;
  onPlantAdded: (draft: AddPlantDraft) => void;
  onBack: () => void;
  onExit?: () => void;
  onCreateGarden?: () => void;
};

const stages: Array<{ value: PlantStage; label: string; helper: string }> = [
  { value: "seed", label: "Seed", helper: "Track germination and transplant timing" },
  { value: "seedling", label: "Seedling", helper: "Gentle water, light, and hardening off" },
  { value: "young", label: "Young plant", helper: "Establish roots and placement" },
  { value: "mature", label: "Mature plant", helper: "Care, harvest, pruning, or diagnosis" }
];

export function AddPlantFlowScreen({ model, selectedPhotoUri, initialPlacement, backSignal = 0, onPhotoSelected, onPlantAdded, onBack, onExit, onCreateGarden }: AddPlantFlowScreenProps) {
  const [step, setStep] = useState<"photo" | "confirm" | "place">("photo");
  const [identification, setIdentification] = useState<MockPlantIdentificationResult | undefined>();
  const [selectedIdentificationMatch, setSelectedIdentificationMatch] = useState<PlantIdentificationMatch | undefined>();
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identificationError, setIdentificationError] = useState("");
  const [plantName, setPlantName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndexPlant, setSelectedIndexPlant] = useState<PlantIndexRecord | undefined>();
  const [variety, setVariety] = useState("");
  const [stage, setStage] = useState<PlantStage>("young");
  const [plantedOn, setPlantedOn] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const placements = useMemo<AddPlantPlacement[]>(() => getGardenPlacements(model), [model]);
  const suggestions = useMemo(() => searchPlants(searchQuery), [searchQuery]);

  const [placementId, setPlacementId] = useState(initialPlacement?.id ?? placements[0]?.id ?? "");
  const selectedPlacement = placements.find((placement) => placement.id === placementId) ?? placements[0];

  useEffect(() => {
    if (backSignal === 0) {
      return;
    }
    stepBack();
  }, [backSignal]);

  useEffect(() => {
    if (!selectedPhotoUri || identification || isIdentifying) {
      return;
    }

    setIsIdentifying(true);
    setIdentificationError("");
    plantIdentificationProvider
      .identifyPlant(selectedPhotoUri)
      .then((result) => {
        setIdentification(result);
        setSelectedIdentificationMatch(undefined);
        setPlantName("");
        setNotes(result.warnings.join(" "));
        setStep("confirm");
      })
      .catch((error) => {
        setIdentification(undefined);
        setIdentificationError(error instanceof Error ? error.message : "Plant identification is unavailable.");
        setNotes("Plant identification unavailable. Use manual search.");
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
      setSelectedIdentificationMatch(undefined);
      setIdentificationError("");
      onPhotoSelected(result.assets[0].uri);
    }
  }

  function acceptIdentification() {
    if (identification && selectedIdentificationMatch) {
      setPlantName(selectedIdentificationMatch.commonName);
      setSelectedIndexPlant(undefined);
      setNotes(selectedIdentificationMatch.warnings.join(" "));
      setStep("place");
      return;
    }

    if (!identification && plantName.trim()) {
      setStep("place");
    }
  }

  function searchManually() {
    setIdentification(undefined);
    setSelectedIdentificationMatch(undefined);
    setPlantName("");
    setSearchQuery("");
    setSelectedIndexPlant(undefined);
    setNotes("Added manually after skipping photo identification.");
    setStep("confirm");
  }

  function chooseKnownPlant(plant: PlantIndexRecord) {
    setIdentification(undefined);
    setSelectedIdentificationMatch(undefined);
    setSelectedIndexPlant(plant);
    setPlantName(plant.commonName);
    setSearchQuery(plant.commonName);
    setNotes(buildPlantIndexNotes(plant));
    setStep("confirm");
  }

  function addCustomPlant() {
    const customName = searchQuery.trim() || plantName.trim();
    if (!customName) {
      return;
    }

    setIdentification(undefined);
    setSelectedIndexPlant(undefined);
    setPlantName(customName);
    setNotes("Custom plant. Species knowledge can be enriched later.");
    setStep("confirm");
  }

  function savePlant() {
    if (!plantName.trim() || !selectedPlacement) {
      return;
    }

    const confirmedIdentification =
      selectedIdentificationMatch && identification
        ? {
            ...identification,
            suggestedSpeciesId: selectedIdentificationMatch.suggestedSpeciesId,
            confidence: selectedIdentificationMatch.confidence,
            confidenceLabel: selectedIdentificationMatch.confidenceLabel,
            possiblePlantName: selectedIdentificationMatch.commonName,
            careSummary: selectedIdentificationMatch.careSummary,
            lightNeeds: selectedIdentificationMatch.lightNeeds,
            wateringNeeds: selectedIdentificationMatch.wateringNeeds,
            feedingNotes: selectedIdentificationMatch.feedingNotes,
            warnings: selectedIdentificationMatch.warnings
          }
        : identification;

    onPlantAdded({
      photoUri: selectedPhotoUri ?? undefined,
      identification: confirmedIdentification,
      scientificName: selectedIndexPlant?.scientificName ?? selectedIdentificationMatch?.scientificName,
      category: selectedIndexPlant?.category,
      careSummary: selectedIndexPlant ? `${selectedIndexPlant.commonName}: ${selectedIndexPlant.lightNeeds}; ${selectedIndexPlant.waterNeeds}.` : selectedIdentificationMatch?.careSummary,
      lightNeeds: selectedIndexPlant?.lightNeeds ?? selectedIdentificationMatch?.lightNeeds,
      waterNeeds: selectedIndexPlant?.waterNeeds ?? selectedIdentificationMatch?.wateringNeeds,
      feedingNeeds: selectedIndexPlant?.category === "vegetable" || selectedIndexPlant?.category === "fruit" || selectedIndexPlant?.category === "berry" ? "moderate" : "light",
      spacing: selectedIndexPlant?.spacing,
      daysToHarvest: selectedIndexPlant?.daysToHarvest,
      companionNotes: selectedIndexPlant?.companions?.join(", "),
      plantName: plantName.trim(),
      variety: variety.trim(),
      placement: selectedPlacement,
      stage,
      plantedOn,
      notes: notes.trim()
    });
  }

  function stepBack() {
    if (step === "place") {
      setStep("confirm");
      return;
    }
    if (step === "confirm") {
      setStep("photo");
      return;
    }
    if (onExit) {
      onExit();
      return;
    }
    onBack();
  }

  return (
    <View>
      <ScreenHeader onBack={stepBack} eyebrow="Add plant" title="Confirm before adding" subtitle="Pattypan can identify from a photo, but you choose the final match before anything is added to your garden." />

      {selectedPhotoUri ? (
        <Image source={{ uri: selectedPhotoUri }} style={styles.photoPreview} />
      ) : (
        <GardenCard tone="warm">
          <Text style={styles.cardTitle}>Start with a photo or add manually</Text>
          <Text style={styles.cardText}>Take a plant photo or choose one from your library. Pattypan will show possible matches and ask you to confirm before adding.</Text>
        </GardenCard>
      )}

      {step === "photo" ? (
        <View style={styles.buttonStack}>
          <View style={styles.actions}>
            <PrimaryButton label="Take photo" onPress={() => pickImage("camera")} tone="sun" icon={<Ionicons name="camera" size={20} color={colors.leafDeep} />} style={styles.actionButton} />
            <PrimaryButton label="Pick photo" onPress={() => pickImage("library")} icon={<Ionicons name="images-outline" size={20} color={colors.white} />} style={styles.actionButton} />
          </View>
          <PlantAutocomplete query={searchQuery} suggestions={suggestions} onChangeQuery={setSearchQuery} onChoose={chooseKnownPlant} onAddCustom={addCustomPlant} />
          <PrimaryButton label="Add manually instead" onPress={searchManually} tone="quiet" />
          {isIdentifying ? <Text style={styles.statusText}>Looking for a possible match...</Text> : null}
          {identificationError ? <Text style={styles.warningText}>{identificationError} Search manually or try another photo.</Text> : null}
        </View>
      ) : null}

      {step === "confirm" ? (
        <View>
          {identification ? (
            <GardenCard tone="sky">
              <Text style={styles.matchLabel}>{identification.debug.providerUsed === "PlantNet" ? "PlantNet suggestions" : "Using local demo identification"}</Text>
              <Text style={styles.cardTitle}>Choose the closest match</Text>
              <Text style={styles.cardText}>These are possible matches, not confirmed identities. Select one, edit the name if needed, then place the plant.</Text>
              {identification.confidence < 0.35 ? <Text style={styles.warningText}>We're not confident. Try another photo or search manually.</Text> : null}
              {identification.debug.fallbackTriggered ? <Text style={styles.warningText}>Local demo fallback: {identification.debug.fallbackReason}</Text> : null}
              <View style={styles.matchList}>
                {identification.matches.map((match) => (
                  <TouchableOpacity
                    key={match.id}
                    accessibilityRole="button"
                    style={[styles.matchOption, selectedIdentificationMatch?.id === match.id && styles.selectedMatchOption]}
                    onPress={() => {
                      setSelectedIdentificationMatch(match);
                      setPlantName(match.commonName);
                      setSearchQuery(match.commonName);
                      setSelectedIndexPlant(undefined);
                      setNotes(match.warnings.join(" "));
                    }}
                  >
                    {match.imageUrl ? <Image source={{ uri: match.imageUrl }} style={styles.matchImage} /> : <View style={styles.matchGlyph}><Text style={styles.matchGlyphText}>{match.commonName.slice(0, 1)}</Text></View>}
                    <View style={styles.matchCopy}>
                      <Text style={styles.matchName}>{match.commonName}</Text>
                      {match.scientificName ? <Text style={styles.matchMeta}>{match.scientificName}</Text> : null}
                      <Text style={styles.matchMeta}>{match.confidenceLabel} - {Math.round(match.confidence * 100)}% confidence</Text>
                    </View>
                    <Ionicons name={selectedIdentificationMatch?.id === match.id ? "checkmark-circle" : "ellipse-outline"} size={23} color={selectedIdentificationMatch?.id === match.id ? colors.leafDeep : colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
              {isDevelopmentMode() ? <ProviderDebugPanel debug={identification.debug} /> : null}
            </GardenCard>
          ) : (
            <GardenCard tone="warm">
              <Text style={styles.matchLabel}>{identificationError ? "Identification unavailable" : "Manual search"}</Text>
              <Text style={styles.cardText}>{identificationError ? `${identificationError} Search manually or try another photo.` : "Type the plant name you want to add. Suggestions come from the local searchable plant index."}</Text>
            </GardenCard>
          )}

          <TextInput
            value={plantName}
            onChangeText={(value) => {
              setPlantName(value);
              setSearchQuery(value);
              setSelectedIndexPlant(undefined);
            }}
            placeholder="Plant name"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <TextInput value={variety} onChangeText={setVariety} placeholder="Variety or nickname, optional" placeholderTextColor={colors.textMuted} style={styles.input} />

          <PlantAutocomplete query={searchQuery} suggestions={suggestions} onChangeQuery={setSearchQuery} onChoose={chooseKnownPlant} onAddCustom={addCustomPlant} compact />

          {selectedIndexPlant ? (
            <GardenCard tone="surface">
              <Text style={styles.matchLabel}>Selected from local plant index</Text>
              <Text style={styles.cardTitle}>{selectedIndexPlant.commonName}</Text>
              {selectedIndexPlant.scientificName ? <Text style={styles.cardText}>{selectedIndexPlant.scientificName}</Text> : null}
              <Text style={styles.cardText}>{selectedIndexPlant.category} - {selectedIndexPlant.habit} - {selectedIndexPlant.lightNeeds}</Text>
            </GardenCard>
          ) : null}

          <View style={styles.actions}>
            <PrimaryButton label={identification && !selectedIdentificationMatch ? "Choose a match first" : "Confirm match"} onPress={acceptIdentification} style={styles.actionButton} />
            <PrimaryButton label="None of these" onPress={searchManually} tone="quiet" style={styles.actionButton} />
          </View>
        </View>
      ) : null}

      {step === "place" ? (
        <View>
          <Text style={styles.sectionTitle}>Indoor or outdoor location</Text>
          {placements.length === 0 ? (
            <GardenCard tone="warm">
              <Text style={styles.cardTitle}>Create a growing space first</Text>
              <Text style={styles.cardText}>Pattypan needs a bed, container, or indoor zone so this plant has a real location.</Text>
              {onCreateGarden ? <PrimaryButton label="Create Garden" onPress={onCreateGarden} tone="sun" icon={<Ionicons name="grid-outline" size={20} color={colors.leafDeep} />} /> : null}
            </GardenCard>
          ) : null}
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
              <TouchableOpacity key={item.value} accessibilityRole="button" style={[styles.stageChip, item.value === stage && styles.activeChip]} onPress={() => setStage(item.value)}>
                <Text style={[styles.chipText, item.value === stage && styles.activeChipText]}>{item.label}</Text>
                <Text style={[styles.stageHelper, item.value === stage && styles.activeStageHelper]}>{item.helper}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {stage === "seed" ? (
            <GardenCard tone="sky">
              <Text style={styles.matchLabel}>Grow from seed</Text>
              <Text style={styles.cardTitle}>Seed-start tracking scaffold</Text>
              <Text style={styles.cardText}>Pattypan will create a germination check and a transplant timing reminder. Future versions will add seed trays, indoor light, hardening off, and sowing calendars.</Text>
            </GardenCard>
          ) : null}

          <TextInput value={plantedOn} onChangeText={setPlantedOn} placeholder="Planted date YYYY-MM-DD" placeholderTextColor={colors.textMuted} style={styles.input} />
          <TextInput value={notes} onChangeText={setNotes} placeholder="Notes" placeholderTextColor={colors.textMuted} style={[styles.input, styles.notesInput]} multiline />

          <PrimaryButton label="Add to my garden" onPress={savePlant} icon={<Ionicons name="leaf-outline" size={20} color={colors.white} />} />
        </View>
      ) : null}
    </View>
  );
}

function PlantAutocomplete({
  query,
  suggestions,
  compact = false,
  onChangeQuery,
  onChoose,
  onAddCustom
}: {
  query: string;
  suggestions: PlantIndexRecord[];
  compact?: boolean;
  onChangeQuery: (value: string) => void;
  onChoose: (plant: PlantIndexRecord) => void;
  onAddCustom: () => void;
}) {
  const hasQuery = query.trim().length >= 2;

  return (
    <View style={styles.searchBox}>
      {!compact ? <Text style={styles.searchLabel}>Search plant database</Text> : null}
      <View style={styles.searchInputRow}>
        <Ionicons name="search-outline" size={21} color={colors.textMuted} />
        <TextInput value={query} onChangeText={onChangeQuery} placeholder="Start typing basil, tomato, palm..." placeholderTextColor={colors.textMuted} style={styles.searchInput} autoCapitalize="words" />
      </View>
      {hasQuery ? (
        <View style={styles.suggestions}>
          {suggestions.map((plant) => (
            <TouchableOpacity key={plant.id} accessibilityRole="button" style={styles.suggestionRow} onPress={() => onChoose(plant)}>
              <View style={styles.suggestionIcon}>
                <Text style={styles.suggestionIconText}>{plant.commonName.slice(0, 1)}</Text>
              </View>
              <View style={styles.suggestionCopy}>
                <Text style={styles.suggestionName}>{plant.commonName}</Text>
                <Text numberOfLines={1} style={styles.suggestionMeta}>
                  {plant.scientificName ? `${plant.scientificName} - ` : ""}{plant.category} - {plant.habit}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
          {suggestions.length === 0 ? (
            <TouchableOpacity accessibilityRole="button" style={styles.addCustomRow} onPress={onAddCustom}>
              <Ionicons name="add-circle-outline" size={21} color={colors.leafDeep} />
              <Text style={styles.addCustomText}>Add "{query.trim()}" manually</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity accessibilityRole="button" style={styles.addCustomRow} onPress={onAddCustom}>
              <Ionicons name="create-outline" size={19} color={colors.leafDeep} />
              <Text style={styles.addCustomText}>None of these? Add manually</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
    </View>
  );
}

function buildPlantIndexNotes(plant: PlantIndexRecord) {
  const parts = [
    plant.scientificName ? `Scientific name: ${plant.scientificName}.` : undefined,
    `Light: ${plant.lightNeeds}.`,
    `Water: ${plant.waterNeeds}.`,
    plant.spacing ? `Spacing: ${plant.spacing}.` : undefined,
    plant.daysToHarvest ? `Harvest: ${plant.daysToHarvest}.` : undefined
  ].filter(Boolean);

  return parts.join(" ");
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
  searchBox: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  searchLabel: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  searchInputRow: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: colors.surfaceWarm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  suggestions: {
    gap: spacing.xs
  },
  suggestionRow: {
    minHeight: 62,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  suggestionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#eef6e9",
    alignItems: "center",
    justifyContent: "center"
  },
  suggestionIconText: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  suggestionCopy: {
    flex: 1
  },
  suggestionName: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "900"
  },
  suggestionMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
    marginTop: 2
  },
  addCustomRow: {
    minHeight: 48,
    borderRadius: 18,
    backgroundColor: "#eef6e9",
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  addCustomText: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
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
  debugPanel: {
    borderRadius: 16,
    backgroundColor: "rgba(36,79,55,0.08)",
    borderWidth: 1,
    borderColor: "rgba(36,79,55,0.16)",
    padding: spacing.md,
    gap: 3,
    marginTop: spacing.sm
  },
  debugTitle: {
    color: colors.leafDeep,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  debugText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 16,
    fontWeight: "800"
  },
  matchList: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  matchOption: {
    minHeight: 82,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  selectedMatchOption: {
    borderColor: colors.leafDeep,
    backgroundColor: "#eef6e9"
  },
  matchImage: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.surfaceWarm
  },
  matchGlyph: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.sage,
    alignItems: "center",
    justifyContent: "center"
  },
  matchGlyphText: {
    color: colors.white,
    fontSize: typography.section,
    fontWeight: "900"
  },
  matchCopy: {
    flex: 1
  },
  matchName: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "900"
  },
  matchMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
    marginTop: 2
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
  stageChip: {
    width: "48%",
    minHeight: 92,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    justifyContent: "center",
    gap: spacing.xs
  },
  activeChip: {
    backgroundColor: colors.leafDeep,
    borderColor: colors.leafDeep
  },
  stageHelper: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 16,
    fontWeight: "700"
  },
  activeStageHelper: {
    color: "rgba(255,255,255,0.78)"
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
