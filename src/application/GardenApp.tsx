import { useEffect, useState } from "react";
import { Alert, BackHandler, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { mockGardenRepository } from "../data/mockGardenRepository";
import { GardenTabKey, navItems } from "../navigation/navItems";
import { AddPlantFlowScreen } from "../features/add-plant/AddPlantFlowScreen";
import { DiagnosisScreen } from "../features/diagnosis/DiagnosisScreen";
import { GardenSetupFlowScreen } from "../features/garden-setup/GardenSetupFlowScreen";
import { KnowledgeScreen } from "../features/knowledge/KnowledgeScreen";
import { LandingScreen } from "../features/landing/LandingScreen";
import { GardenPlacement, getGardenPlacements, LocationManagementScreen } from "../features/my-garden/LocationManagementScreen";
import { MyGardenScreen } from "../features/my-garden/MyGardenScreen";
import { OnboardingScreen } from "../features/onboarding/OnboardingScreen";
import { PlantDetailScreen } from "../features/plant-detail/PlantDetailScreen";
import { PremiumExplanationScreen } from "../features/profile/PremiumExplanationScreen";
import { ProfileScreen } from "../features/profile/ProfileScreen";
import { ScanScreen } from "../features/scan/ScanScreen";
import { SettingsScreen } from "../features/settings/SettingsScreen";
import { TaskCalendarScreen } from "../features/tasks/TaskCalendarScreen";
import { TodayScreen } from "../features/today/TodayScreen";
import { WeatherAlertsScreen } from "../features/weather/WeatherAlertsScreen";
import { AddPlantDraft } from "../features/add-plant/types";
import { CareTask, GardenHomeModel, NotificationPreference, PlantInstance, PlantPhoto, PlantSpecies, SunBand, WeatherAlert } from "../domain";
import { clearAllLocalAppData, loadPersistedGardenModel, persistGardenModel } from "../services/localPersistence";
import { loadLocalSession, LocalSession } from "../services/localAuth";
import { getBridgeEntitlements, parseEntitlementConfig } from "../services/entitlements/entitlementService";
import { getSupabaseBridgeStatus } from "../services/supabase";
import { geocodeLocation, weatherProvider } from "../services/weather/weatherProvider";
import { colors, radii, spacing, typography } from "../theme/tokens";

type OverlayScreen =
  | "landing"
  | "onboarding"
  | "plantDetail"
  | "addPlant"
  | "manageLocation"
  | "scan"
  | "gardenSetup"
  | "settings"
  | "calendar"
  | "weatherAlerts"
  | "diagnosis"
  | "premium"
  | null;

export function GardenApp() {
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<GardenTabKey>("home");
  const [overlay, setOverlay] = useState<OverlayScreen>("landing");
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [lastAddedPlantId, setLastAddedPlantId] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [selectedReferencePlant, setSelectedReferencePlant] = useState<PlantInstance | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<GardenPlacement | null>(null);
  const [diagnosisPlantId, setDiagnosisPlantId] = useState<string | null>(null);
  const [initialAddPlacement, setInitialAddPlacement] = useState<GardenPlacement | null>(null);
  const [addPlantBackSignal, setAddPlantBackSignal] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [localSession, setLocalSession] = useState<LocalSession | null>(null);
  const [model, setModel] = useState<GardenHomeModel>(() => mockGardenRepository.getEmptyModel());

  const selectedPlant =
    selectedReferencePlant ??
    model.plantInstances.find((plant) => plant.id === selectedPlantId) ??
    model.plantInstances.find((plant) => plant.id === lastAddedPlantId) ??
    model.plantInstances[0];
  const isDesktopWeb = Platform.OS === "web" && width >= 900;
  const entitlements = getBridgeEntitlements({
    email: localSession?.email,
    config: parseEntitlementConfig({
      paywallEnabled: process.env.EXPO_PUBLIC_ENABLE_PAYWALL,
      adminEmails: process.env.EXPO_PUBLIC_ADMIN_EMAILS
    })
  });
  const supabaseStatus = getSupabaseBridgeStatus();

  useEffect(() => {
    let isMounted = true;

    Promise.all([loadPersistedGardenModel(), loadLocalSession()])
      .then(([savedModel, savedSession]) => {
        if (isMounted && savedSession) {
          setLocalSession(savedSession);
          setOverlay(savedModel ? null : "onboarding");
        }
        if (isMounted && savedModel) {
          setModel(sanitizeLegacyProfile(savedModel));
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
    if (!isHydrated) {
      return;
    }

    let isMounted = true;

    if (!model.user.locationLabel.trim() || (model.user.latitude === 0 && model.user.longitude === 0)) {
      return;
    }

    Promise.all([
      weatherProvider.getCurrent(model.user.latitude, model.user.longitude),
      weatherProvider.getAlerts(model.user.latitude, model.user.longitude)
    ])
      .then(([weather, weatherAlerts]) => {
        if (!isMounted) {
          return;
        }

        setModel((current) => ({
          ...current,
          weather: {
            ...weather,
            locationLabel: current.user.locationLabel || weather.locationLabel
          },
          weatherAlerts: weatherAlerts.length > 0 ? weatherAlerts : current.weatherAlerts,
          tasks: mergeWeatherTasks(current.tasks, weatherAlerts)
        }));
      })
      .catch(() => {
        // Keep the last local weather snapshot if the provider is unavailable.
      });

    return () => {
      isMounted = false;
    };
  }, [isHydrated, model.user.latitude, model.user.longitude]);

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

  function mergeWeatherTasks(tasks: CareTask[], alerts: WeatherAlert[]) {
    const nonWeatherTasks = tasks.filter((task) => !task.id.startsWith("task-weather-alert-"));
    const weatherTasks = alerts.slice(0, 3).map((alert) => weatherAlertToTask(alert));
    return [...weatherTasks, ...nonWeatherTasks];
  }

  function weatherAlertToTask(alert: WeatherAlert): CareTask {
    const typeByAlert: Record<WeatherAlert["type"], CareTask["type"]> = {
      frost: "frost-protection",
      heat: "heat-stress",
      wind: "wind-protection",
      "heavy-rain": "heavy-rain-protection",
      humidity: "pest-check",
      storm: "heavy-rain-protection"
    };

    return {
      id: `task-weather-alert-${alert.id}`,
      type: typeByAlert[alert.type],
      title: alert.title,
      dueAt: alert.startsAt,
      priority: alert.severity === "urgent" ? "urgent" : alert.severity === "warning" ? "high" : "normal",
      status: "needs-confirmation",
      reason: alert.summary
    };
  }

  function handleOpenAddPlant(placement?: GardenPlacement | null) {
    setInitialAddPlacement(placement ?? null);
    setOverlay("addPlant");
  }

  function handleOpenScan() {
    setDiagnosisPlantId(null);
    setOverlay("diagnosis");
  }

  function handleOpenDiagnosis(plantId?: string) {
    setDiagnosisPlantId(plantId ?? null);
    setOverlay("diagnosis");
  }

  function handleBack() {
    if (overlay === "addPlant") {
      setAddPlantBackSignal((current) => current + 1);
      return;
    }

    if (overlay === "plantDetail" && selectedPlacement) {
      setOverlay("manageLocation");
      return;
    }

    setOverlay(null);
    setInitialAddPlacement(null);
    setSelectedReferencePlant(null);
  }

  function handleExitAddPlant() {
    setOverlay(null);
    setInitialAddPlacement(null);
    setSelectedPhotoUri(null);
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

  async function resolveLocation(locationLabel: string) {
    const geocoded = await geocodeLocation(locationLabel);
    return geocoded ?? null;
  }

  function buildNotificationPreferences(userId: string, enabled: boolean): NotificationPreference[] {
    return [
      { id: "pref-morning", userId, taskType: "watering", enabled, quietHoursStart: "21:00", quietHoursEnd: "07:00" },
      { id: "pref-watering", userId, taskType: "watering", enabled, quietHoursStart: "21:00", quietHoursEnd: "07:00" },
      { id: "pref-weather", userId, taskType: "frost-protection", enabled, quietHoursStart: "21:00", quietHoursEnd: "07:00" },
      { id: "pref-photo", userId, taskType: "pest-check", enabled, quietHoursStart: "21:00", quietHoursEnd: "07:00" },
      { id: "pref-harvest", userId, taskType: "harvest", enabled, quietHoursStart: "21:00", quietHoursEnd: "07:00" }
    ];
  }

  function handleAuthenticated(session: LocalSession, isNewAccount: boolean) {
    setLocalSession(session);
    setModel((current) => ({
      ...current,
      user: {
        ...current.user,
        id: session.accountId,
        name: session.displayName
      }
    }));
    setOverlay(isNewAccount ? "onboarding" : null);
  }

  function handleUpdateProfile(updates: { name: string; locationLabel: string; notificationPreferences: NotificationPreference[] }) {
    void resolveLocation(updates.locationLabel).then((location) => {
      if (!location) {
        return;
      }
      setModel((current) => ({
        ...current,
        user: {
          ...current.user,
          locationLabel: location.label,
          latitude: location.latitude,
          longitude: location.longitude
        },
        weather: {
          ...current.weather,
          locationLabel: location.label
        }
      }));
    });

    setModel((current) => ({
      ...current,
      user: {
        ...current.user,
        name: updates.name,
        locationLabel: updates.locationLabel
      },
      weather: {
        ...current.weather,
        locationLabel: updates.locationLabel
      },
      notificationPreferences: updates.notificationPreferences
    }));
  }

  function handleOnboardingProfile(profile: { name: string; locationLabel: string; latitude: number; longitude: number; notificationsEnabled: boolean }) {
    const userId = localSession?.accountId || model.user.id || "user-local";
    setModel((current) => ({
      ...current,
      user: {
        ...current.user,
        id: userId,
        name: profile.name || localSession?.displayName || "",
        locationLabel: profile.locationLabel,
        latitude: profile.latitude,
        longitude: profile.longitude
      },
      weather: {
        ...current.weather,
        locationLabel: profile.locationLabel
      },
      notificationPreferences: buildNotificationPreferences(userId, profile.notificationsEnabled)
    }));
  }

  function handleLoadDemoGarden() {
    const demo = mockGardenRepository.getHomeModel();
    setModel({
      ...demo,
      user: {
        ...demo.user,
        id: localSession?.accountId || demo.user.id,
        name: localSession?.displayName || demo.user.name
      }
    });
    setSelectedPhotoUri(null);
    setSelectedPlacement(null);
    setSelectedReferencePlant(null);
    setSelectedPlantId(null);
    setActiveTab("home");
    setOverlay(null);
  }

  function handleResetLocalAppData() {
    void clearAllLocalAppData().finally(() => {
      setLocalSession(null);
      setModel(mockGardenRepository.getEmptyModel());
      setSelectedPhotoUri(null);
      setLastAddedPlantId(null);
      setSelectedPlantId(null);
      setSelectedReferencePlant(null);
      setSelectedPlacement(null);
      setInitialAddPlacement(null);
      setActiveTab("home");
      setOverlay("landing");
    });
  }

  function handleCreateFirstBed(input: { name: string; lengthFeet: number; widthFeet: number; depthInches?: number; locationType?: PlantInstance["locationType"]; kind: "outdoor" | "container" | "indoor"; sunExposure?: string }) {
    const now = Date.now();
    const userId = model.user.id || "user-local";
    const outdoorGardenId = "garden-home";
    const zoneId = `zone-${now}`;
    const bedId = `bed-${now}`;

    setModel((current) => {
      const hasOutdoorGarden = current.gardens.some((garden) => garden.id === outdoorGardenId);
      return {
        ...current,
        gardens: hasOutdoorGarden
          ? current.gardens
          : [
              ...current.gardens,
              {
                id: outdoorGardenId,
                userId,
                name: "Home Garden",
                kind: "outdoor",
                locationLabel: current.user.locationLabel || "Outdoor garden",
                notes: "Created locally during first setup."
              }
            ],
        zones: [
          ...current.zones,
          {
            id: zoneId,
            gardenId: outdoorGardenId,
            name: "Outdoor growing space",
            sunExposure: input.sunExposure && input.sunExposure !== "not-mapped" ? input.sunExposure as "full-sun" | "part-sun" | "part-shade" | "shade" : "part-sun",
            microclimateNotes: input.sunExposure && input.sunExposure !== "not-mapped" ? "Manual sun exposure entered during setup." : "Sun exposure not mapped yet."
          }
        ],
        beds: [
          ...current.beds,
          {
            id: bedId,
            gardenId: outdoorGardenId,
            zoneId,
            name: input.name,
            shape: "rectangle",
            lengthFeet: input.lengthFeet,
            widthFeet: input.widthFeet,
            depthInches: input.depthInches,
            soilType: "unknown",
            locationType: input.locationType ?? (input.kind === "container" ? "container" : "raised-bed"),
            orientationDegreesFromNorth: 0
          }
        ],
        sunProfiles: input.sunExposure && input.sunExposure !== "not-mapped"
          ? [
              ...current.sunProfiles,
              {
                id: `sun-${bedId}`,
                bedId,
                morning: input.sunExposure as "full-sun" | "part-sun" | "part-shade" | "shade",
                midday: input.sunExposure as "full-sun" | "part-sun" | "part-shade" | "shade",
                afternoon: input.sunExposure as "full-sun" | "part-sun" | "part-shade" | "shade",
                estimatedDailySunHours: input.sunExposure === "full-sun" ? 8 : input.sunExposure === "part-sun" ? 5 : input.sunExposure === "part-shade" ? 3 : 1,
                confidence: "low"
              }
            ]
          : current.sunProfiles
      };
    });
    setOverlay(null);
    setActiveTab("garden");
  }

  function handlePlantAdded(draft: AddPlantDraft) {
    const now = Date.now();
    const normalizedName = draft.plantName.toLowerCase();
    const existingSpecies = model.species.find((species) => species.commonName.toLowerCase() === normalizedName);
    const speciesId = existingSpecies?.id ?? `species-user-${normalizedName.replace(/[^a-z0-9]+/g, "-")}-${now}`;
    const nickname = draft.variety ? `${draft.variety} ${draft.plantName}` : draft.plantName;
    const plantId = `plant-user-${now}`;
    const initialPhotoId = draft.photoUri ? `photo-${plantId}-${now}` : undefined;

    const newSpecies: PlantSpecies | null = existingSpecies
      ? null
      : {
          id: speciesId,
          commonName: draft.plantName,
          scientificName: draft.scientificName,
          family: "User confirmed",
          careSummary: draft.careSummary ?? draft.identification?.careSummary ?? "User-added plant. Build the care profile as observations are collected.",
          preferredSun: inferSunBands(draft.lightNeeds ?? draft.identification?.lightNeeds),
          waterNeeds: inferWaterNeeds(draft.waterNeeds ?? draft.identification?.wateringNeeds),
          feedingNeeds: inferFeedingNeeds(draft.feedingNeeds ?? draft.identification?.feedingNotes),
          frostSensitive: Boolean(draft.identification?.warnings.some((warning) => warning.toLowerCase().includes("cold") || warning.toLowerCase().includes("frost")))
            || (draft.category === "vegetable" && !(draft.plantName.toLowerCase().includes("garlic") || draft.plantName.toLowerCase().includes("kale"))),
          harvestWindow: draft.daysToHarvest,
          companionNotes: draft.companionNotes
        };

    const source: PlantInstance["source"] = draft.stage === "seed" ? "seed" : draft.stage === "seedling" || draft.stage === "young" || draft.stage === "transplant" ? "transplant" : "unknown";

    const newPlant: PlantInstance = {
      id: plantId,
      speciesId,
      gardenId: draft.placement.gardenId,
      bedId: draft.placement.bedId,
      currentProfilePhotoId: initialPhotoId,
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
    const initialPhoto: PlantPhoto | null = draft.photoUri
      ? {
          id: initialPhotoId as string,
          plantInstanceId: plantId,
          uri: draft.photoUri,
          takenAt: new Date(now).toISOString(),
          purpose: "identify",
          note: "First photo used while adding this plant.",
          growthStage: draft.stage
        }
      : null;

    setModel((current) => ({
      ...current,
      species: newSpecies ? [newSpecies, ...current.species] : current.species,
      plantInstances: [newPlant, ...current.plantInstances],
      plantPhotos: initialPhoto ? [initialPhoto, ...(current.plantPhotos ?? [])] : current.plantPhotos,
      growthSnapshots: initialPhoto
        ? [
            {
              id: `snapshot-${initialPhoto.id}`,
              plantInstanceId: plantId,
              photoId: initialPhoto.id,
              recordedAt: initialPhoto.takenAt,
              stage: draft.stage,
              note: "Initial plant photo captured during add flow.",
              source: "photo-update"
            },
            ...(current.growthSnapshots ?? [])
          ]
        : current.growthSnapshots,
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

  function handleRepositionPlant(plantId: string, xPercent: number, yPercent: number) {
    setModel((current) => ({
      ...current,
      plantInstances: current.plantInstances.map((plant) => (plant.id === plantId ? { ...plant, positionXPercent: xPercent, positionYPercent: yPercent } : plant))
    }));
  }

  function handleRenamePlant(plantId: string, displayName: string) {
    setModel((current) => ({
      ...current,
      plantInstances: current.plantInstances.map((plant) => (plant.id === plantId ? { ...plant, nickname: displayName } : plant))
    }));
  }

  function handleMarkWatered(plantId: string) {
    const plant = model.plantInstances.find((item) => item.id === plantId);
    if (!plant) {
      return;
    }

    const now = new Date().toISOString();
    setModel((current) => ({
      ...current,
      tasks: [
        {
          id: `task-${plantId}-watered-${Date.now()}`,
          plantInstanceId: plantId,
          gardenBedId: plant.bedId,
          type: "watering",
          title: `Watered ${plant.nickname}`,
          dueAt: now,
          priority: "low",
          status: "done",
          reason: "Logged from plant detail. Future schedule rules can use this as the last-watered signal."
        },
        ...current.tasks.map((task) => (task.plantInstanceId === plantId && task.type === "watering" ? { ...task, status: "done" as const } : task))
      ]
    }));
  }

  function handleHarvestPlant(plantId: string) {
    const plant = model.plantInstances.find((item) => item.id === plantId);
    if (!plant) {
      return;
    }

    const now = new Date().toISOString();
    setModel((current) => ({
      ...current,
      tasks: [
        {
          id: `task-${plantId}-harvest-${Date.now()}`,
          plantInstanceId: plantId,
          gardenBedId: plant.bedId,
          type: "harvest",
          title: `Harvest logged for ${plant.nickname}`,
          dueAt: now,
          priority: "low",
          status: "done",
          reason: "Manual harvest log. Future harvest schedule will adjust from photos and yield history."
        },
        ...current.tasks
      ]
    }));
  }

  function handleAddPlantPhoto(plantId: string, uri: string, purpose: PlantPhoto["purpose"] = "growth-log", note = "Photo update") {
    const plant = model.plantInstances.find((item) => item.id === plantId);
    if (!plant || plant.id.startsWith("knowledge-")) {
      return;
    }

    const now = new Date().toISOString();
    const photoId = `photo-${plantId}-${Date.now()}`;
    const photo: PlantPhoto = {
      id: photoId,
      plantInstanceId: plantId,
      uri,
      takenAt: now,
      purpose,
      note,
      growthStage: plant.stage
    };

    setModel((current) => ({
      ...current,
      plantPhotos: [photo, ...(current.plantPhotos ?? [])],
      growthSnapshots: [
        {
          id: `snapshot-${photoId}`,
          plantInstanceId: plantId,
          photoId,
          recordedAt: now,
          stage: plant.stage,
          note,
          source: purpose === "diagnose" ? "diagnosis" : "photo-update"
        },
        ...(current.growthSnapshots ?? [])
      ],
      plantInstances: current.plantInstances.map((item) => (item.id === plantId ? { ...item, currentProfilePhotoId: photoId } : item))
    }));
  }

  function handleSaveDiagnosis(input: { plantId?: string; photoUri: string; note: string; symptoms: string[] }) {
    if (input.plantId) {
      handleAddPlantPhoto(input.plantId, input.photoUri, "diagnose", input.note);
    }

    if (input.plantId) {
      setModel((current) => ({
        ...current,
        tasks: [
          {
            id: `task-diagnosis-follow-up-${Date.now()}`,
            plantInstanceId: input.plantId,
            type: "pest-check",
            title: "Follow up on diagnosis",
            dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            priority: "normal",
            status: "needs-confirmation",
            reason: input.symptoms.length ? `Diagnosis symptoms: ${input.symptoms.join(", ")}. Confirm before treatment.` : "Diagnosis photo saved. Confirm next action before treatment."
          },
          ...current.tasks
        ]
      }));
    }
  }

  function handleUpdateBed(bedId: string, updates: { name: string; lengthFeet: number; widthFeet: number; depthInches?: number }) {
    setModel((current) => ({
      ...current,
      beds: current.beds.map((bed) =>
        bed.id === bedId
          ? {
              ...bed,
              name: updates.name,
              lengthFeet: updates.lengthFeet,
              widthFeet: updates.widthFeet,
              depthInches: updates.depthInches
            }
          : bed
      ),
      plantInstances: current.plantInstances.map((plant) => (plant.bedId === bedId ? { ...plant, locationLabel: updates.name } : plant))
    }));
    setSelectedPlacement((current) => (current?.bedId === bedId ? { ...current, label: updates.name, locationLabel: updates.name } : current));
  }

  function handleUpdateSunExposure(bedId: string, exposure: SunBand) {
    setModel((current) => {
      const bed = current.beds.find((item) => item.id === bedId);
      const existingProfile = current.sunProfiles.find((profile) => profile.bedId === bedId);
      const nextProfile = {
        id: existingProfile?.id ?? `sun-${bedId}`,
        bedId,
        morning: exposure,
        midday: exposure,
        afternoon: exposure,
        estimatedDailySunHours: getEstimatedSunHours(exposure),
        confidence: "low" as const,
        shadeNotes: "Manual alpha sun exposure entry. Compass and shade mapping can refine this later."
      };

      return {
        ...current,
        zones: bed
          ? current.zones.map((zone) =>
              zone.id === bed.zoneId
                ? {
                    ...zone,
                    sunExposure: exposure,
                    microclimateNotes: "Manual sun exposure entered in Bed Detail."
                  }
                : zone
            )
          : current.zones,
        sunProfiles: [nextProfile, ...current.sunProfiles.filter((profile) => profile.bedId !== bedId)]
      };
    });
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
    if (overlay === "landing") {
      return <LandingScreen onAuthenticated={handleAuthenticated} onLearnMore={() => setOverlay("landing")} />;
    }

    if (overlay === "onboarding") {
      return (
        <OnboardingScreen
          initialDisplayName={localSession?.displayName ?? model.user.name}
          onResolveLocation={resolveLocation}
          onComplete={handleOnboardingProfile}
          onStartGarden={() => setOverlay("gardenSetup")}
          onAddPlant={() => handleOpenAddPlant(null)}
          onLoadDemoGarden={handleLoadDemoGarden}
        />
      );
    }

    if (overlay === "scan") {
      return <ScanScreen selectedPhotoUri={selectedPhotoUri} onPhotoSelected={handlePhotoSelected} onAddPlant={() => handleOpenAddPlant(null)} />;
    }

    if (overlay === "plantDetail") {
      return (
        <PlantDetailScreen
          plant={selectedPlant}
          model={model}
          onBack={handleBack}
          onMovePlant={openSelectedPlantLocation}
          onRemovePlant={() => confirmRemovePlant(selectedPlant)}
          onScanPlant={() => handleOpenDiagnosis(selectedPlant?.id)}
          onRenamePlant={handleRenamePlant}
          onMarkWatered={handleMarkWatered}
          onHarvestPlant={handleHarvestPlant}
          onAddPhoto={handleAddPlantPhoto}
        />
      );
    }

    if (overlay === "addPlant") {
      return <AddPlantFlowScreen model={model} selectedPhotoUri={selectedPhotoUri} initialPlacement={initialAddPlacement} backSignal={addPlantBackSignal} onPhotoSelected={handlePhotoSelected} onPlantAdded={handlePlantAdded} onBack={handleBack} onExit={handleExitAddPlant} onCreateGarden={() => setOverlay("gardenSetup")} />;
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
          onRepositionPlant={handleRepositionPlant}
          onUpdateBed={handleUpdateBed}
          onUpdateSunExposure={handleUpdateSunExposure}
          onDiagnose={() => handleOpenDiagnosis()}
        />
      );
    }

    if (overlay === "diagnosis") {
      return <DiagnosisScreen model={model} initialPlantId={diagnosisPlantId} onBack={handleBack} onSaveDiagnosis={handleSaveDiagnosis} />;
    }

    if (overlay === "gardenSetup") {
      return <GardenSetupFlowScreen onBack={() => setOverlay(null)} onCreateBed={handleCreateFirstBed} />;
    }

    if (overlay === "settings") {
      return <SettingsScreen onBack={() => setOverlay(null)} />;
    }

    if (overlay === "premium") {
      return (
        <PremiumExplanationScreen
          accountState={entitlements.accountState}
          bypassesPayment={entitlements.bypassesPayment}
          paywallEnabled={entitlements.paywallEnabled}
          onBack={() => setOverlay(null)}
        />
      );
    }

    if (overlay === "calendar") {
      return <TaskCalendarScreen tasks={model.tasks} onBack={() => setOverlay(null)} />;
    }

    if (overlay === "weatherAlerts") {
      return <WeatherAlertsScreen alerts={model.weatherAlerts} onBack={() => setOverlay(null)} />;
    }

    if (activeTab === "home") {
      return (
        <TodayScreen
          model={model}
          onOpenWeatherAlerts={() => setOverlay("weatherAlerts")}
          onOpenPlant={handleOpenPlant}
          onAddPlant={() => handleOpenAddPlant(null)}
          onCreateGarden={() => setOverlay("gardenSetup")}
          onLoadDemoGarden={handleLoadDemoGarden}
          onCompleteTask={handleCompleteTask}
          onSnoozeTask={handleSnoozeTask}
        />
      );
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

    if (activeTab === "library") {
      return <KnowledgeScreen species={model.species} onOpenPlant={handleOpenSpecies} onDiagnoseByPhoto={() => handleOpenDiagnosis()} />;
    }

    return (
      <ProfileScreen
        model={model}
        entitlements={entitlements}
        supabaseStatus={supabaseStatus}
        onOpenSettings={() => setOverlay("settings")}
        onOpenPremium={() => setOverlay("premium")}
        onUpdateProfile={handleUpdateProfile}
        onResetLocalData={handleResetLocalAppData}
      />
    );
  }

  const appContent =
    overlay === "landing" ? (
      <LandingScreen onAuthenticated={handleAuthenticated} onLearnMore={() => setOverlay("landing")} />
    ) : (
    <View style={styles.app}>
      <ScrollView contentContainerStyle={styles.screen}>{renderMainScreen()}</ScrollView>
      {overlay === null ? (
        <View style={styles.navBar}>
          {navItems.map((item) => {
            const isActive = item.key === activeTab;

            return (
              <TouchableOpacity
                key={item.key}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                style={[styles.navItem, isActive && styles.activeNavItem]}
                onPress={() => setActiveTab(item.key)}
              >
                <Ionicons name={item.icon} size={22} color={isActive ? colors.leafDeep : colors.textMuted} />
                <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );

  if (isDesktopWeb) {
    return (
      <View style={styles.desktopRoot}>
        <View style={styles.desktopPanel}>
          <View style={styles.desktopBrandMark}>
            <Ionicons name="leaf" size={42} color={colors.sage} />
          </View>
          <Text style={styles.desktopName}>Pattypan</Text>
          <Text style={styles.desktopTagline}>Your Heirloom Secret</Text>
          <Text style={styles.desktopCopy}>Pattypan.ca works in the browser, but the garden companion is best on your phone: camera capture, outdoor checks, notifications, and one-handed task flow.</Text>
          <View style={styles.qrCard}>
            <QrPlaceholder />
            <View style={styles.qrCopy}>
              <Text style={styles.qrTitle}>Open on mobile</Text>
              <Text style={styles.qrText}>QR and app store links are placeholders until native releases are ready.</Text>
            </View>
          </View>
          <View style={styles.storeRow}>
            <View style={styles.storePill}>
              <Ionicons name="logo-apple" size={18} color={colors.leafDeep} />
              <Text style={styles.storeText}>App Store soon</Text>
            </View>
            <View style={styles.storePill}>
              <Ionicons name="logo-google-playstore" size={18} color={colors.leafDeep} />
              <Text style={styles.storeText}>Google Play soon</Text>
            </View>
          </View>
          <Text style={styles.browserText}>Continue in browser</Text>
        </View>
        <View style={styles.phoneFrame}>{appContent}</View>
      </View>
    );
  }

  return appContent;
}

function QrPlaceholder() {
  const cells = Array.from({ length: 49 }, (_, index) => index);
  return (
    <View style={styles.qrGrid}>
      {cells.map((index) => (
        <View key={index} style={[styles.qrCell, (index % 2 === 0 || index % 7 === 0 || index === 10 || index === 38) && styles.qrCellDark]} />
      ))}
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

  if (draft.stage === "seed") {
    const germinationCheck = new Date(now + 7 * 24 * 60 * 60 * 1000);
    germinationCheck.setHours(9, 0, 0, 0);

    const transplantCheck = new Date(now + 28 * 24 * 60 * 60 * 1000);
    transplantCheck.setHours(9, 0, 0, 0);

    tasks.push(
      {
        id: `task-${plant.id}-germination`,
        plantInstanceId: plant.id,
        gardenBedId: plant.bedId,
        type: "hardening-off",
        title: `Check germination for ${plant.nickname}`,
        dueAt: germinationCheck.toISOString(),
        priority: "normal",
        status: "scheduled",
        reason: "Seed-start tracking begins here. Future seed workflow will use crop-specific germination windows, tray location, warmth, and moisture."
      },
      {
        id: `task-${plant.id}-transplant-window`,
        plantInstanceId: plant.id,
        gardenBedId: plant.bedId,
        type: "hardening-off",
        title: `Estimate transplant timing for ${plant.nickname}`,
        dueAt: transplantCheck.toISOString(),
        priority: "normal",
        status: "needs-confirmation",
        reason: "Seed-start tracking begins here. Future rules will combine seed date, crop type, frost risk, hardening off, and local weather."
      }
    );
  }

  if (species?.frostSensitive || draft.stage === "seedling" || draft.stage === "young" || draft.stage === "transplant") {
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

function inferSunBands(value?: string): PlantSpecies["preferredSun"] {
  const normalized = value?.toLowerCase() ?? "";
  if (normalized.includes("shade") && !normalized.includes("sun")) {
    return ["shade", "part-shade"];
  }
  if (normalized.includes("part")) {
    return ["part-sun", "part-shade"];
  }
  if (normalized.includes("indirect") || normalized.includes("low")) {
    return ["part-shade", "shade"];
  }
  return ["full-sun"];
}

function inferWaterNeeds(value?: string): PlantSpecies["waterNeeds"] {
  const normalized = value?.toLowerCase() ?? "";
  if (normalized.includes("high") || normalized.includes("consistent") || normalized.includes("moist")) {
    return "high";
  }
  if (normalized.includes("low") || normalized.includes("dry")) {
    return "low";
  }
  return "moderate";
}

function inferFeedingNeeds(value?: string): PlantSpecies["feedingNeeds"] {
  const normalized = value?.toLowerCase() ?? "";
  if (normalized.includes("heavy")) {
    return "heavy";
  }
  if (normalized.includes("light")) {
    return "light";
  }
  return "moderate";
}

function getEstimatedSunHours(exposure: SunBand) {
  if (exposure === "full-sun") {
    return 8;
  }
  if (exposure === "part-sun") {
    return 5;
  }
  if (exposure === "part-shade") {
    return 3;
  }
  return 1;
}

function sanitizeLegacyProfile(model: GardenHomeModel): GardenHomeModel {
  const staleMockNames = new Set(["kathryn", "kate"]);
  if (!staleMockNames.has(model.user.name.trim().toLowerCase())) {
    return model;
  }

  return {
    ...model,
    user: {
      ...model.user,
      name: ""
    }
  };
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background
  },
  desktopRoot: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: "#132719",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "stretch",
    padding: spacing.xl,
    gap: spacing.xxl
  },
  desktopPanel: {
    flex: 1,
    maxWidth: 520,
    justifyContent: "center",
    gap: spacing.lg
  },
  desktopBrandMark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,253,248,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  desktopName: {
    color: colors.surface,
    fontSize: 64,
    fontWeight: "900",
    lineHeight: 70
  },
  desktopTagline: {
    color: colors.sage,
    fontSize: typography.title,
    fontWeight: "900"
  },
  desktopCopy: {
    color: "rgba(255,253,248,0.76)",
    fontSize: typography.body,
    lineHeight: 24,
    fontWeight: "700",
    maxWidth: 440
  },
  qrCard: {
    maxWidth: 430,
    borderRadius: 28,
    backgroundColor: "rgba(255,253,248,0.92)",
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  qrGrid: {
    width: 92,
    height: 92,
    borderRadius: 14,
    backgroundColor: colors.surface,
    padding: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3
  },
  qrCell: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: "transparent"
  },
  qrCellDark: {
    backgroundColor: colors.leafDeep
  },
  qrCopy: {
    flex: 1
  },
  qrTitle: {
    color: colors.leafDeep,
    fontSize: typography.body,
    fontWeight: "900"
  },
  qrText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 19,
    fontWeight: "700",
    marginTop: spacing.xs
  },
  storeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  storePill: {
    minHeight: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md
  },
  storeText: {
    color: colors.leafDeep,
    fontSize: typography.small,
    fontWeight: "900"
  },
  browserText: {
    color: "rgba(255,253,248,0.68)",
    fontSize: typography.small,
    fontWeight: "800"
  },
  phoneFrame: {
    width: 430,
    maxHeight: 920,
    flex: 1,
    borderRadius: 42,
    overflow: "hidden",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "rgba(255,253,248,0.18)",
    shadowColor: "#000000",
    shadowOpacity: 0.32,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 18 }
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
