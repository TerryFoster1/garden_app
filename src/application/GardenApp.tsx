import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { mockGardenRepository } from "../data/mockGardenRepository";
import { GardenTabKey, navItems } from "../navigation/navItems";
import { AddPlantFlowScreen } from "../features/add-plant/AddPlantFlowScreen";
import { GardenSetupFlowScreen } from "../features/garden-setup/GardenSetupFlowScreen";
import { KnowledgeScreen } from "../features/knowledge/KnowledgeScreen";
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
import { colors, spacing, typography } from "../theme/tokens";

type OverlayScreen =
  | "onboarding"
  | "plantDetail"
  | "addPlant"
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
  const [model, setModel] = useState<GardenHomeModel>(() => mockGardenRepository.getHomeModel());

  const featuredPlant = model.plantInstances.find((plant) => plant.id === lastAddedPlantId) ?? model.plantInstances[0];

  function handlePhotoSelected(photoUri: string) {
    setSelectedPhotoUri(photoUri);
  }

  function handleOpenAddPlant() {
    setOverlay("addPlant");
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
    setSelectedPhotoUri(null);
    setOverlay(null);
    setActiveTab("today");
  }

  function renderMainScreen() {
    if (overlay === "onboarding") {
      return <OnboardingScreen onComplete={() => setOverlay(null)} onStartGarden={() => setOverlay("gardenSetup")} />;
    }

    if (overlay === "plantDetail") {
      return <PlantDetailScreen plant={featuredPlant} onBack={() => setOverlay(null)} />;
    }

    if (overlay === "addPlant") {
      return <AddPlantFlowScreen model={model} selectedPhotoUri={selectedPhotoUri} onPhotoSelected={handlePhotoSelected} onPlantAdded={handlePlantAdded} onBack={() => setOverlay(null)} />;
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
          onOpenPlant={() => setOverlay("plantDetail")}
        />
      );
    }

    if (activeTab === "scan") {
      return <ScanScreen selectedPhotoUri={selectedPhotoUri} onPhotoSelected={handlePhotoSelected} onAddPlant={handleOpenAddPlant} />;
    }

    if (activeTab === "garden") {
      return (
        <MyGardenScreen
          model={model}
          onAddPlant={handleOpenAddPlant}
          onOpenGardenSetup={() => setOverlay("gardenSetup")}
          onOpenPlant={() => setOverlay("plantDetail")}
        />
      );
    }

    if (activeTab === "planner") {
      return <PlannerScreen model={model} onOpenGardenSetup={() => setOverlay("gardenSetup")} />;
    }

    return <KnowledgeScreen species={model.species} onOpenPlant={() => setOverlay("plantDetail")} />;
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
                style={[styles.navItem, isScan && styles.scanNavItem, isActive && styles.activeNavItem]}
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
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    minHeight: 78,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
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
    minHeight: 58
  },
  scanNavItem: {
    transform: [{ translateY: -10 }],
    backgroundColor: colors.sun,
    borderRadius: 26,
    minHeight: 68,
    maxWidth: 76
  },
  activeNavItem: {
    opacity: 1
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
