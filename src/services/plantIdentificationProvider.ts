import { Platform } from "react-native";

import { PlantHealthScan, PlantIdentification, PlantSpecies } from "../domain";

export type PlantIdentificationMatch = {
  id: string;
  suggestedSpeciesId?: string;
  commonName: string;
  scientificName?: string;
  family?: string;
  genus?: string;
  confidence: number;
  confidenceLabel: "Likely match" | "Possible match";
  careSummary: string;
  lightNeeds: string;
  wateringNeeds: PlantSpecies["waterNeeds"];
  feedingNotes: string;
  warnings: string[];
  source: "plantnet" | "mock";
  imageUrl?: string;
};

export type PlantIdentificationDebug = {
  providerUsed: "PlantNet" | "local fallback";
  apiKeyDetected: boolean;
  imageUriType: "data-uri" | "blob-uri" | "file-uri" | "http-url" | "unknown";
  requestUrl?: string;
  responseStatus?: number;
  candidateCount: number;
  fallbackTriggered: boolean;
  fallbackReason?: string;
};

export type MockPlantIdentificationResult = PlantIdentification & {
  matches: PlantIdentificationMatch[];
  possiblePlantName: string;
  confidenceLabel: "Likely match" | "Possible match";
  careSummary: string;
  lightNeeds: string;
  wateringNeeds: PlantSpecies["waterNeeds"];
  feedingNotes: string;
  warnings: string[];
  debug: PlantIdentificationDebug;
};

export type PlantIdentificationProvider = {
  identifyPlant(photoUri: string): Promise<MockPlantIdentificationResult>;
  diagnosePlant(photoUri: string): Promise<PlantHealthScan>;
  identifyPestOrWeed(photoUri: string): Promise<PlantHealthScan>;
};

const PLANTNET_IDENTIFY_BASE_ENDPOINT = "https://my-api.plantnet.org/v2/identify";
const PLANTNET_DISEASE_ENDPOINT = "https://my-api.plantnet.org/v2/diseases/identify";
const MAX_PLANTNET_RESULTS = 5;
const MIN_CONFIDENT_SCORE = 0.35;

const plantIdProvider = process.env.EXPO_PUBLIC_PLANT_ID_PROVIDER?.toLowerCase();
const plantIdApiKey = process.env.EXPO_PUBLIC_PLANT_ID_API_KEY;
const plantNetProject = process.env.EXPO_PUBLIC_PLANTNET_PROJECT || "all";
const mockPlantIdEnabled = process.env.EXPO_PUBLIC_ENABLE_MOCK_PLANT_ID === "true";

export const plantIdentificationProvider: PlantIdentificationProvider = {
  async identifyPlant(photoUri) {
    if (plantIdProvider === "plantnet" && plantIdApiKey) {
      try {
        return await identifyWithPlantNet(photoUri, plantIdApiKey);
      } catch (error) {
        if (!mockPlantIdEnabled) {
          throw new Error(getErrorMessage(error) || "Plant identification is temporarily unavailable.");
        }
        return mockPlantIdentificationProvider.identifyPlant(photoUri, getFallbackReason(error, "PlantNet identification failed."));
      }
    }

    return mockPlantIdentificationProvider.identifyPlant(photoUri, getProviderFallbackReason());
  },
  async diagnosePlant(photoUri) {
    if (plantIdProvider === "plantnet" && plantIdApiKey) {
      try {
        return await diagnoseWithPlantNet(photoUri, plantIdApiKey);
      } catch {
        if (!mockPlantIdEnabled) {
          throw new Error("Plant diagnosis is temporarily unavailable.");
        }
      }
    }

    return mockPlantIdentificationProvider.diagnosePlant(photoUri);
  },
  async identifyPestOrWeed(photoUri) {
    return this.diagnosePlant(photoUri);
  }
};

export const stubPlantIdentificationProvider = plantIdentificationProvider;

export const mockPlantIdentificationProvider: PlantIdentificationProvider & { identifyPlant(photoUri: string, fallbackReason?: string): Promise<MockPlantIdentificationResult> } = {
  async identifyPlant(photoUri: string, fallbackReason: string = "Local demo identification is enabled.") {
    const likelyTomato = photoUri.length % 2 === 0;
    const topMatch: PlantIdentificationMatch = {
      id: likelyTomato ? "mock-match-cherry-tomato" : "mock-match-basil",
      suggestedSpeciesId: likelyTomato ? "species-cherry-tomato" : "species-basil",
      commonName: likelyTomato ? "Cherry Tomato" : "Basil",
      scientificName: likelyTomato ? "Solanum lycopersicum var. cerasiforme" : "Ocimum basilicum",
      family: likelyTomato ? "Solanaceae" : "Lamiaceae",
      confidence: likelyTomato ? 0.78 : 0.64,
      confidenceLabel: likelyTomato ? "Likely match" : "Possible match",
      source: "mock",
      careSummary: likelyTomato
        ? "A warm-season fruiting plant that usually needs full sun, steady moisture, and support as it grows."
        : "A tender herb that likes bright light, even moisture, and regular pinching once established.",
      lightNeeds: likelyTomato ? "Full sun preferred. Watch nearby shorter plants for trellis shade." : "Full sun to part sun. Protect from cold nights.",
      wateringNeeds: likelyTomato ? "high" : "moderate",
      feedingNotes: likelyTomato ? "Heavy feeder; schedule a feeding reminder after establishment." : "Light feeder; avoid overfertilizing.",
      warnings: [
        "Using local demo identification. This is not a PlantNet/API result.",
        likelyTomato ? "Support may be needed soon." : "Cold nights can stress tender basil."
      ]
    };
    const alternateMatch: PlantIdentificationMatch = {
      id: likelyTomato ? "mock-match-red-pepper" : "mock-match-thyme",
      suggestedSpeciesId: likelyTomato ? "species-red-pepper" : "species-thyme",
      commonName: likelyTomato ? "Red Pepper" : "Thyme",
      scientificName: likelyTomato ? "Capsicum annuum" : "Thymus vulgaris",
      family: likelyTomato ? "Solanaceae" : "Lamiaceae",
      confidence: likelyTomato ? 0.42 : 0.38,
      confidenceLabel: "Possible match",
      source: "mock",
      careSummary: likelyTomato ? "A warm-season pepper that likes full sun and even moisture." : "A woody herb that prefers bright light and lean, well-drained soil.",
      lightNeeds: likelyTomato ? "Full sun." : "Full sun to bright light.",
      wateringNeeds: likelyTomato ? "moderate" : "low",
      feedingNotes: likelyTomato ? "Moderate feeder once established." : "Light feeder; avoid soggy soil.",
      warnings: ["Lower-confidence fallback suggestion. Confirm before adding."]
    };

    return {
      id: `mock-identification-${Date.now()}`,
      photoId: `photo-${Date.now()}`,
      suggestedSpeciesId: topMatch.suggestedSpeciesId,
      confidence: topMatch.confidence,
      confidenceLabel: topMatch.confidenceLabel,
      provider: "mock-plant-id",
      userConfirmed: false,
      matches: [topMatch, alternateMatch],
      possiblePlantName: topMatch.commonName,
      careSummary: topMatch.careSummary,
      lightNeeds: topMatch.lightNeeds,
      wateringNeeds: topMatch.wateringNeeds,
      feedingNotes: topMatch.feedingNotes,
      warnings: topMatch.warnings,
      debug: {
        providerUsed: "local fallback",
        apiKeyDetected: Boolean(plantIdApiKey),
        imageUriType: getImageUriType(photoUri),
        candidateCount: 2,
        fallbackTriggered: true,
        fallbackReason
      }
    };
  },
  async diagnosePlant(photoUri) {
    return {
      id: `mock-diagnosis-${Date.now()}`,
      photoId: `photo-${photoUri.length}-${Date.now()}`,
      suspectedIssues: ["Possible moisture stress", "Check leaf undersides for pests"],
      recommendationSummary: "Mock fallback diagnosis. Confirm symptoms before acting: inspect soil moisture, leaf undersides, and recent weather stress.",
      requiresRuleValidation: true
    };
  },
  async identifyPestOrWeed(photoUri) {
    return this.diagnosePlant(photoUri);
  }
};

type PlantNetIdentifyResponse = {
  bestMatch?: string;
  results?: Array<{
    score?: number;
    species?: {
      scientificNameWithoutAuthor?: string;
      scientificNameAuthorship?: string;
      scientificName?: string;
      genus?: { scientificNameWithoutAuthor?: string; scientificName?: string };
      family?: { scientificNameWithoutAuthor?: string; scientificName?: string };
      commonNames?: string[];
    };
    images?: Array<{ url?: { m?: string; s?: string; o?: string } }>;
  }>;
};

type PlantNetDiseaseResponse = {
  results?: Array<{
    score?: number;
    name?: string;
    disease?: { name?: string; commonNames?: string[] };
  }>;
};

async function identifyWithPlantNet(photoUri: string, apiKey: string): Promise<MockPlantIdentificationResult> {
  const formData = new FormData();
  await appendImagePart(formData, "images", photoUri);
  formData.append("organs", "auto");
  const project = encodeURIComponent(plantNetProject);
  const redactedRequestUrl = `${PLANTNET_IDENTIFY_BASE_ENDPOINT}/${project}?api-key=[redacted]&include-related-images=true&nb-results=${MAX_PLANTNET_RESULTS}&lang=en`;
  const requestUrl = `${PLANTNET_IDENTIFY_BASE_ENDPOINT}/${project}?api-key=${encodeURIComponent(apiKey)}&include-related-images=true&nb-results=${MAX_PLANTNET_RESULTS}&lang=en`;

  const response = await fetch(requestUrl, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(`PlantNet identification request failed with status ${response.status}.`);
  }

  const data = (await response.json()) as PlantNetIdentifyResponse;
  const matches = (data.results ?? []).map(toPlantNetMatch).filter((match): match is PlantIdentificationMatch => Boolean(match));

  if (matches.length === 0) {
    throw new Error("PlantNet returned no identification matches.");
  }

  const topMatch = matches[0];

  return {
    id: `plantnet-identification-${Date.now()}`,
    photoId: `photo-${Date.now()}`,
    suggestedSpeciesId: undefined,
    confidence: topMatch.confidence,
    confidenceLabel: topMatch.confidenceLabel,
    provider: "plantnet",
    userConfirmed: false,
    matches,
    possiblePlantName: topMatch.commonName,
    careSummary: topMatch.careSummary,
    lightNeeds: topMatch.lightNeeds,
    wateringNeeds: topMatch.wateringNeeds,
    feedingNotes: topMatch.feedingNotes,
    warnings: [
      ...topMatch.warnings,
      ...(topMatch.confidence < MIN_CONFIDENT_SCORE ? ["We're not confident. Try another photo or search manually."] : [])
    ],
    debug: {
      providerUsed: "PlantNet",
      apiKeyDetected: true,
      imageUriType: getImageUriType(photoUri),
      requestUrl: redactedRequestUrl,
      responseStatus: response.status,
      candidateCount: matches.length,
      fallbackTriggered: false
    }
  };
}

async function diagnoseWithPlantNet(photoUri: string, apiKey: string): Promise<PlantHealthScan> {
  const formData = new FormData();
  await appendImagePart(formData, "image", photoUri);

  const response = await fetch(`${PLANTNET_DISEASE_ENDPOINT}?api-key=${encodeURIComponent(apiKey)}&include-related-images=true`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("PlantNet diagnosis request failed.");
  }

  const data = (await response.json()) as PlantNetDiseaseResponse;
  const issues = (data.results ?? [])
    .slice(0, 3)
    .map((result) => result.disease?.commonNames?.[0] ?? result.disease?.name ?? result.name)
    .filter((issue): issue is string => Boolean(issue));

  return {
    id: `plantnet-diagnosis-${Date.now()}`,
    photoId: `photo-diagnosis-${Date.now()}`,
    suspectedIssues: issues.length > 0 ? issues : ["No clear disease match"],
    recommendationSummary: "PlantNet diagnosis result. Confirm symptoms and let Pattypan rules validate any care action before scheduling.",
    requiresRuleValidation: true
  };
}

function toPlantNetMatch(result: NonNullable<PlantNetIdentifyResponse["results"]>[number], index: number): PlantIdentificationMatch | null {
  const species = result.species;
  if (!species) {
    return null;
  }

  const scientificName = species.scientificNameWithoutAuthor ?? species.scientificName;
  const commonName = species.commonNames?.[0] ?? scientificName ?? "Unknown plant";
  const confidence = clampConfidence(result.score ?? 0);

  return {
    id: `plantnet-match-${index}-${slugify(scientificName ?? commonName)}`,
    commonName,
    scientificName,
    family: species.family?.scientificNameWithoutAuthor ?? species.family?.scientificName,
    genus: species.genus?.scientificNameWithoutAuthor ?? species.genus?.scientificName,
    confidence,
    confidenceLabel: confidence >= 0.7 ? "Likely match" : "Possible match",
    source: "plantnet",
    imageUrl: result.images?.[0]?.url?.m ?? result.images?.[0]?.url?.s,
    careSummary: "PlantNet visual match. Confirm the plant before adding; Pattypan will use local care knowledge when available and can enrich this profile later.",
    lightNeeds: "Confirm light needs after selecting this match.",
    wateringNeeds: "moderate",
    feedingNotes: "Confirm feeding needs from the plant profile after adding.",
    warnings: ["PlantNet result. Confirm before adding.", "Photo identification can be wrong when leaves, flowers, or fruit are unclear."]
  };
}

async function appendImagePart(formData: FormData, fieldName: string, uri: string) {
  const fileName = inferFileName(uri);
  const mimeType = inferMimeType(fileName);

  if (Platform.OS === "web") {
    const imageResponse = await fetch(uri);
    const blob = await imageResponse.blob();
    formData.append(fieldName, blob, fileName);
    return;
  }

  formData.append(fieldName, { uri, name: fileName, type: mimeType } as unknown as Blob);
}

function inferFileName(uri: string) {
  const withoutQuery = uri.split("?")[0] ?? uri;
  const candidate = withoutQuery.split("/").pop();
  if (candidate && candidate.includes(".")) {
    return candidate;
  }

  return `pattypan-plant-${Date.now()}.jpg`;
}

function inferMimeType(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".png")) {
    return "image/png";
  }

  return "image/jpeg";
}

function clampConfidence(value: number) {
  return Math.max(0, Math.min(1, value));
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getImageUriType(uri: string): PlantIdentificationDebug["imageUriType"] {
  if (uri.startsWith("data:")) {
    return "data-uri";
  }
  if (uri.startsWith("blob:")) {
    return "blob-uri";
  }
  if (uri.startsWith("file:")) {
    return "file-uri";
  }
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return "http-url";
  }
  return "unknown";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "";
}

function getFallbackReason(error: unknown, defaultReason: string) {
  return getErrorMessage(error) || defaultReason;
}

function getProviderFallbackReason() {
  if (plantIdProvider !== "plantnet") {
    return `Plant ID provider is ${plantIdProvider || "not set"}.`;
  }
  if (!plantIdApiKey) {
    return "PlantNet API key was not detected.";
  }
  return "Local demo identification is enabled.";
}
