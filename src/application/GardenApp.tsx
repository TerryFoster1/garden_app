import { useEffect, useState } from "react";
import { Alert, BackHandler, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { mockGardenRepository } from "../data/mockGardenRepository";
import { GardenTabKey, navItems } from "../navigation/navItems";
import { AddPlantFlowScreen } from "../features/add-plant/AddPlantFlowScreen";
import { GardenSetupFlowScreen } from "../features/garden-setup/GardenSetupFlowScreen";
import { KnowledgeScreen } from "../features/knowledge/KnowledgeScreen";
import { GardenPlacement, getGardenPlacements, LocationManagementScreen } from "../features/my-garden/LocationManagementScreen";
import { MyGardenScreen } from "../features/my-garden/MyGardenScreen";
import { OnboardingScreen } from "../features/onboarding/OnboardingScreen";
import { PlannerScreen } from "../features/planner/PlannerScreen";
import { PlantDetailScreen } from "../features/plant-detail/PlantDetailScreen";
import { ScanScreen } from "../features/scan/ScanScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { TaskCalendarScreen } from "../features/tasks/TaskCalendarScreen";
import { TodayScreen } from "../features/today/TodayScreen";
import { WeatherAlertsScreen } from "../features/weather/WeatherAlertsScreen";
import { AddPlantDraft } from "../features/add-plant/types";
import { CareTask, GardenHomeModel, PlantInstance, PlantSpecies } from "../domain";
import { loadPersistedGardenModel, persistGardenModel } from "../services/localPersistence";
import { colors, spacing, typography } from "../theme/tokens";

type OverlayScreen =
  | "onboarding"
  | "plantDetail"
  | "addPlant"
  | "manageLocation"
  | "gardenSetup"
  | "settings"
  | "calendar"
  | "weatherAlerts"
  | null;

export function GardenApp() {
  const [activeTab, setActiveTab] = useState<GardenTabKey>("today");
  const [overlay, setOverlay] = useState<OverlayScreen>("onboarding");
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [lastAddedPlantId, setLastAddedPlantId] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [selectedReferencePlant, setSelectedReferencePlant] = useState<PlantInstance | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<GardenPlacement | null>(null);
  const [initialAddPlacement, setInitialAddPlacement] = useState<GardenPlacement | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [model, setModel] = useState<GardenHomeModel>(() => mockGardenRepository.getHomeModel());

  const selectedPlant =
    selectedReferencePlant ??
    model.plantInstances.find((plant) => plant.id === selectedPlantId) ??
    model.plantInstances.find((plant) => plant.id === lastAddedPlantId) ??
    model.plantInstances[0];

  useEffect(() => {
    let isMounted = true;

    loadPersistedGardenModel()
      .then((savedModel) => {
        if (isMounted && savedModel) {
          setModel(savedModel);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    persistGardenModel(model).catch(() => {
      // Local persistence should never block field use.
    });
  }, [isHydrated, model]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!overlay) {
        return false;
      }

      handleBack();
      return true;
    });

    return () => subscription.remove();
  }, [overlay, selectedPlacement]);

  function handlePhotoSelected(photoUri: string) {
    setSelectedPhotoUri(photoUri);
  }

  function handleOpenAddPlant(placement?: GardenPlacement | null) {
    setInitialAddPlacement(placement ?? null);
    setOverlay("addPlant");
  }

  function handleOpenScan() {
    setOverlay(null);
    setActiveTab("scan");
  }

  function handleBack() {
    if (overlay === "plantDetail" && selectedPlacement) {
      setOverlay("manageLocation");
      return;
    }

    setOverlay(null);
    setInitialAddPlacement(null);
    setSelectedReferencePlant(null);
  }

  function handleOpenPlant(plantId: string) {
    setSelectedReferencePlant(null);
    setSelectedPlantId(plantId);
    setOverlay("plantDetail");
  }

  function handleOpenSpecies(speciesId: string) {
    const existingPlant = model.plantInstances.find((plant) => plant.speciesId === speciesId);
    if (existingPlant) {
      handleOpenPlant(existingPlant.id);
      return;
    }

    const species = model.species.find((item) => item.id === speciesId);
    if (!species) {
      return;
    }

    const knowledgePlant: PlantInstance = {
      id: `knowledge-${species.id}`,
      speciesId: species.id,
      gardenId: model.gardens[0]?.id ?? "garden-home",
      nickname: species.commonName,
      locationLabel: "Knowledge reference",
      locationType: "container",
      source: "unknown",
      healthStatus: "thriving",
      notes: "Reference plant profile. Add it to a bed, container, or indoor zone to make it part of your garden."
    };

    setSelectedReferencePlant(knowledgePlant);
    setSelectedPlantId(null);
    setOverlay("plantDetail");
  }

  function handleOpenPlacement(placement: GardenPlacement) {
    setSelectedPlacement(placement);
    setOverlay("manageLocation");
  }

  function handleCompleteTask(taskId: string) {
    setModel((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, status: "done" } : task))
    }));
  }

  function handleSnoozeTask(taskId: string) {
    const laterToday = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
    setModel((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === taskId ? { ...task, dueAt: laterToday, priority: task.priority === "urgent" ? "high" : task.priority } : task))
    }));
  }

  function handlePlantAdded(draft: AddPlantDraft) {
    const now = Date.now();
    const normalizedName = draft.plantName.toLowerCase();
    const existingSpecies = model.species.find((species) => species.commonName.toLowerCase() === normalizedName);
    const speciesId = existingSpecies?.id ?? `species-user-${normalizedName.replace(/[^a-z0-9]+/g, "-")}-${now}`;
    const nickname = draft.variety ? `${draft.variety} ${draft.plantName}` : draft.plantName;
    const plantId = `plant-user-${now}`;

    const newSpecies: PlantSpecies | null = existingSpecies
      ? null
      : {
          id: speciesId,
          commonName: draft.plantName,
          family: "User confirmed",
          careSummary: draft.identification?.careSummary ?? "User-added plant. Build the care profile as observations are collected.",
          preferredSun: draft.identification?.lightNeeds.toLowerCase().includes("part") ? ["part-sun"] : ["full-sun"],
          waterNeeds: draft.identification?.wateringNeeds ?? "moderate",
          feedingNeeds: draft.identification?.feedingNotes.toLowerCase().includes("heavy") ? "heavy" : "moderate",
          frostSensitive: Boolean(draft.identification?.warnings.some((warning) => warning.toLowerCase().includes("cold") || warning.toLowerCase().includes("frost")))
        };

    const source: PlantInstance["source"] = draft.stage === "seed" ? "seed" : draft.stage === "seedling" || draft.stage === "transplant" ? "transplant" : "unknown";

    const newPlant: PlantInstance = {
      id: plantId,
      speciesId,
      gardenId: draft.placement.gardenId,
      bedId: draft.placement.bedId,
      nickname,
      locationLabel: draft.placement.locationLabel,
      locationType: draft.placement.locationType,
      stage: draft.stage,
      plantedOn: draft.plantedOn,
      source,
      healthStatus: "watch",
      notes: draft.notes || "Newly added from the scan/add flow. Confirm care rhythm after a few observations."
    };

    const newTasks = createInitialCareTasks(newPlant, newSpecies ?? existingSpecies, draft);

    setModel((current) => ({
      ...current,
      species: newSpecies ? [newSpecies, ...current.species] : current.species,
      plantInstances: [newPlant, ...current.plantInstances],
      tasks: [...newTasks, ...current.tasks]
    }));

    setLastAddedPlantId(plantId);
    setSelectedPlantId(plantId);
    setSelectedReferencePlant(null);
    setSelectedPhotoUri(null);
    setActiveTab("garden");

    if (initialAddPlacement) {
      setSelectedPlacement(initialAddPlacement);
      setOverlay("manageLocation");
    } else {
      setOverlay(null);
    }
    setInitialAddPlacement(null);
  }

  function handleMovePlant(plantId: string, placement: GardenPlacement) {
    setModel((current) => ({
      ...current,
      plantInstances: current.plantInstances.map((plant) =>
        plant.id === plantId
          ? {
              ...plant,
              gardenId: placement.gardenId,
              bedId: placement.bedId,
              locationLabel: placement.locationLabel,
              locationType: placement.locationType
            }
          : plant
      ),
      tasks: current.tasks.map((task) => (task.plantInstanceId === plantId ? { ...task, gardenBedId: placement.bedId } : task))
    }));
    setSelectedPlacement(placement);
  }

  function handleRemovePlant(plantId: string) {
    setModel((current) => ({
      ...current,
      plantInstances: current.plantInstances.filter((plant) => plant.id !== plantId),
      tasks: current.tasks.filter((task) => task.plantInstanceId !== plantId)
    }));

    if (selectedPlantId === plantId) {
      setSelectedPlantId(null);
      setOverlay(selectedPlacement ? "manageLocation" : null);
    }
  }

  function confirmRemovePlant(plant: PlantInstance) {
    Alert.alert("Remove this plant from your garden?", plant.nickname, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => handleRemovePlant(plant.id) }
    ]);
  }

  function openSelectedPlantLocation() {
    if (!selectedPlant) {
      return;
    }

    const placement =
      getGardenPlacements(model).find((item) => item.bedId && item.bedId === selectedPlant.bedId) ??
      getGardenPlacements(model).find((item) => item.gardenId === selectedPlant.gardenId && item.locationType === selectedPlant.locationType) ??
      null;

    if (placement) {
      handleOpenPlacement(placement);
    }
  }

  function renderMainScreen() {
    if (overlay === "onboarding") {
      return <OnboardingScreen onComplete={() => setOverlay(null)} onStartGarden={() => setOverlay("gardenSetup")} />;
    }

    if (overlay === "plantDetail") {
      return (
        <PlantDetailScreen
          plant={selectedPlant}
          model={model}
          onBack={handleBack}
          onMovePlant={openSelectedPlantLocation}
          onRemovePlant={() => confirmRemovePlant(selectedPlant)}
          onScanPlant={handleOpenScan}
        />
      );
    }

    if (overlay === "addPlant") {
      return <AddPlantFlowScreen model={model} selectedPhotoUri={selectedPhotoUri} initialPlacement={initialAddPlacement} onPhotoSelected={handlePhotoSelected} onPlantAdded={handlePlantAdded} onBack={handleBack} />;
    }

    if (overlay === "manageLocation" && selectedPlacement) {
      return (
        <LocationManagementScreen
          model={model}
          placement={selectedPlacement}
          onBack={handleBack}
          onAddPlant={(placement) => handleOpenAddPlant(placement)}
          onOpenPlant={handleOpenPlant}
          onMovePlant={handleMovePlant}
          onRemovePlant={handleRemovePlant}
        />
      );
    }

    if (overlay === "gardenSetup") {
      return <GardenSetupFlowScreen onBack={() => setOverlay(null)} />;
    }

    if (overlay === "settings") {
      return <SettingsScreen onBack={() => setOverlay(null)} />;
    }

    if (overlay === "calendar") {
      return <TaskCalendarScreen tasks={model.tasks} onBack={() => setOverlay(null)} />;
    }

    if (overlay === "weatherAlerts") {
      return <WeatherAlertsScreen alerts={model.weatherAlerts} onBack={() => setOverlay(null)} />;
    }

    if (activeTab === "today") {
      return (
        <TodayScreen
          model={model}
          onOpenCalendar={() => setOverlay("calendar")}
          onOpenSettings={() => setOverlay("settings")}
          onOpenWeatherAlerts={() => setOverlay("weatherAlerts")}
          onOpenPlant={handleOpenPlant}
          onOpenScan={handleOpenScan}
          onCompleteTask={handleCompleteTask}
          onSnoozeTask={handleSnoozeTask}
        />
      );
    }

    if (activeTab === "scan") {
      return <ScanScreen selectedPhotoUri={selectedPhotoUri} onPhotoSelected={handlePhotoSelected} onAddPlant={() => handleOpenAddPlant(null)} />;
    }

    if (activeTab === "garden") {
      return (
        <MyGardenScreen
          model={model}
          onAddPlant={() => handleOpenAddPlant(null)}
          onOpenGardenSetup={(placement) => (placement ? handleOpenPlacement(placement) : setOverlay("gardenSetup"))}
          onOpenPlant={handleOpenPlant}
        />
      );
    }

    if (activeTab === "planner") {
      return <PlannerScreen model={model} onOpenGardenSetup={() => setOverlay("gardenSetup")} onOpenPlacement={handleOpenPlacement} onAddPlantToPlacement={(placement) => handleOpenAddPlant(placement)} />;
    }

    return <KnowledgeScreen species={model.species} onOpenPlant={handleOpenSpecies} />;
  }

  return (
    <View style={styles.app}>
      <ScrollView contentContainerStyle={styles.screen}>{renderMainScreen()}</ScrollView>
      {overlay === null ? (
        <View style={styles.navBar}>
          {navItems.map((item) => {
            const isActive = item.key === activeTab;
            const isScan = item.key === "scan";

            return (
              <TouchableOpacity
                key={item.key}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                style={[styles.navItem, isActive && styles.activeNavItem, isScan && styles.scanNavItem]}
                onPress={() => setActiveTab(item.key)}
              >
                <Ionicons name={item.icon} size={isScan ? 30 : 22} color={isActive || isScan ? colors.leafDeep : colors.textMuted} />
                <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function createInitialCareTasks(plant: PlantInstance, species: PlantSpecies | undefined, draft: AddPlantDraft): CareTask[] {
  const now = Date.now();
  const tomorrowMorning = new Date(now + 24 * 60 * 60 * 1000);
  tomorrowMorning.setHours(9, 0, 0, 0);

  const tasks: CareTask[] = [
    {
      id: `task-${plant.id}-water`,
      plantInstanceId: plant.id,
      gardenBedId: plant.bedId,
      type: "watering",
      title: `Check moisture for ${plant.nickname}`,
      dueAt: tomorrowMorning.toISOString(),
      priority: species?.waterNeeds === "high" ? "high" : "normal",
      status: "scheduled",
      reason: "Initial care task created after adding a new plant. Weather rules can refine this later."
    },
    {
      id: `task-${plant.id}-placement`,
      plantInstanceId: plant.id,
      gardenBedId: plant.bedId,
      type: "shade",
      title: `Confirm light placement for ${plant.nickname}`,
      dueAt: tomorrowMorning.toISOString(),
      priority: "normal",
      status: "needs-confirmation",
      reason: draft.identification?.lightNeeds ?? "Confirm that this plant's location matches its sun needs."
    }
  ];

  const mayNeedSupport = species?.commonName.toLowerCase().includes("tomato") || species?.commonName.toLowerCase().includes("cucumber") || draft.identification?.warnings.some((warning) => warning.toLowerCase().includes("support"));
  if (mayNeedSupport) {
    tasks.push({
      id: `task-${plant.id}-support`,
      plantInstanceId: plant.id,
      gardenBedId: plant.bedId,
      type: "support",
      title: `Plan support for ${plant.nickname}`,
      dueAt: tomorrowMorning.toISOString(),
      priority: "normal",
      status: "scheduled",
      reason: "Tall or vining plants can shade smaller neighbors if support placement is late."
    });
  }

  if (species?.frostSensitive || draft.stage === "seedling" || draft.stage === "transplant") {
    tasks.push({
      id: `task-${plant.id}-weather`,
      plantInstanceId: plant.id,
      gardenBedId: plant.bedId,
      type: "frost-protection",
      title: `Watch weather for ${plant.nickname}`,
      dueAt: tomorrowMorning.toISOString(),
      priority: "high",
      status: "needs-confirmation",
      reason: "Tender or newly placed plants should get frost, wind, and heat checks before alerts become automatic."
    });
  }

  return tasks;
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background
  },
  screen: {
    padding: spacing.lg,
    paddingBottom: 120
  },
  navBar: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.md,
    minHeight: 84,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minHeight: 62,
    borderRadius: 24
  },
  scanNavItem: {
    transform: [{ translateY: -14 }],
    backgroundColor: colors.sun,
    borderRadius: 32,
    minHeight: 76,
    maxWidth: 82,
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  activeNavItem: {
    backgroundColor: colors.surfaceWarm
  },
  navLabel: {
    fontSize: typography.caption,
    color: colors.textMuted,
    fontWeight: "700"
  },
  activeNavLabel: {
    color: colors.leafDeep
  }
});
