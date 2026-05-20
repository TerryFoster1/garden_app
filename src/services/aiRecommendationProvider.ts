import { AiCareRecommendation } from "./careRulesEngine";
import { GardenBed, PlantInstance, PlantSpecies, SunExposureProfile } from "../domain";
import { getBedPlanningSummary } from "./gardenPlanningRules";

export type AiRecommendationProvider = {
  suggestCareFromObservation(input: { note?: string; photoUri?: string; plantInstanceId?: string }): Promise<AiCareRecommendation[]>;
  askGardenAssistant(input: { question: string; topic?: string; context?: string }): Promise<AiAssistantResponse>;
  explainDiagnosis(input: { plantName?: string; symptoms?: string[]; plantIdentification?: string; context?: string }): Promise<AiAssistantResponse>;
  optimizeBed(input: { bed?: GardenBed; plants: PlantInstance[]; species: PlantSpecies[]; sunProfile?: SunExposureProfile; desiredPlants?: string[] }): Promise<AiBedOptimization>;
};

export type AiAssistantResponse = {
  answer: string;
  confidence: "low" | "medium" | "high";
  provider: "openai" | "local";
  actions: string[];
};

export type AiBedOptimization = {
  provider: "openai" | "local";
  summary: string;
  warnings: string[];
  recommendations: string[];
  confidence: "low" | "medium" | "high";
};

const aiProviderName = process.env.EXPO_PUBLIC_AI_PROVIDER?.toLowerCase();
const openAiApiKey = process.env.EXPO_PUBLIC_AI_API_KEY;
const mockAiEnabled = process.env.EXPO_PUBLIC_ENABLE_MOCK_AI !== "false";

export const aiRecommendationProvider: AiRecommendationProvider = {
  async suggestCareFromObservation() {
    return [];
  },
  async askGardenAssistant(input) {
    if (aiProviderName === "openai" && openAiApiKey) {
      try {
        return await callOpenAiAssistant(input);
      } catch {
        if (!mockAiEnabled) {
          throw new Error("AI assistant is temporarily unavailable.");
        }
      }
    }

    return localGardenAnswer(input.question, input.topic);
  },
  async explainDiagnosis(input) {
    const question = [
      `Explain this plant diagnosis in practical gardener language.`,
      input.plantName ? `Plant: ${input.plantName}.` : undefined,
      input.plantIdentification ? `Possible PlantNet identity: ${input.plantIdentification}.` : undefined,
      input.symptoms?.length ? `Symptoms: ${input.symptoms.join(", ")}.` : undefined,
      input.context
    ].filter(Boolean).join("\n");

    return this.askGardenAssistant({ question, topic: "diagnosis", context: input.context });
  },
  async optimizeBed(input) {
    if (aiProviderName === "openai" && openAiApiKey) {
      try {
        return await callOpenAiBedOptimizer(input);
      } catch {
        if (!mockAiEnabled) {
          throw new Error("AI bed optimization is temporarily unavailable.");
        }
      }
    }

    return localBedOptimization(input);
  }
};

export const stubAiRecommendationProvider = aiRecommendationProvider;

async function callOpenAiAssistant(input: { question: string; topic?: string; context?: string }): Promise<AiAssistantResponse> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "You are Pattypan, a careful mobile gardening assistant for Canada/US home gardens. Use confidence language, avoid certainty from limited evidence, and give practical next actions. Do not claim diagnosis is final."
        },
        {
          role: "user",
          content: `Topic: ${input.topic ?? "general gardening"}\nContext: ${input.context ?? "Personal garden app prototype."}\nQuestion: ${input.question}`
        }
      ],
      max_output_tokens: 420
    })
  });

  if (!response.ok) {
    throw new Error("OpenAI assistant request failed.");
  }

  const data = (await response.json()) as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  const answer = data.output_text ?? data.output?.flatMap((item) => item.content ?? []).map((content) => content.text).filter(Boolean).join("\n") ?? "";

  if (!answer.trim()) {
    throw new Error("OpenAI assistant returned an empty response.");
  }

  return {
    answer: answer.trim(),
    confidence: "medium",
    provider: "openai",
    actions: extractActions(answer)
  };
}

async function callOpenAiBedOptimizer(input: { bed?: GardenBed; plants: PlantInstance[]; species: PlantSpecies[]; sunProfile?: SunExposureProfile; desiredPlants?: string[] }): Promise<AiBedOptimization> {
  const plantNames = input.plants.map((plant) => input.species.find((species) => species.id === plant.speciesId)?.commonName ?? plant.nickname);
  const prompt = [
    "Optimize this garden bed. Return practical suggestions only.",
    input.bed ? `Bed: ${input.bed.name}, ${input.bed.lengthFeet}ft x ${input.bed.widthFeet}ft, soil ${input.bed.soilType}.` : "No bed dimensions available.",
    input.sunProfile ? `Sun: ${input.sunProfile.estimatedDailySunHours}h, morning ${input.sunProfile.morning}, midday ${input.sunProfile.midday}, afternoon ${input.sunProfile.afternoon}.` : "Sun profile unknown.",
    `Current plants: ${plantNames.join(", ") || "none"}.`,
    input.desiredPlants?.length ? `Desired plants: ${input.desiredPlants.join(", ")}.` : "No desired plants entered yet.",
    "Include overcrowding, spacing, airflow, companion, add/remove/swap recommendations. Use confidence language."
  ].join("\n");

  const response = await callOpenAiAssistant({ question: prompt, topic: "AI Optimize Bed" });
  return {
    provider: response.provider,
    summary: response.answer,
    warnings: response.actions.filter((action) => /crowd|spacing|airflow|warning|remove|avoid/i.test(action)).slice(0, 3),
    recommendations: response.actions.length ? response.actions : [response.answer],
    confidence: response.confidence
  };
}

function localGardenAnswer(question: string, topic?: string): AiAssistantResponse {
  const normalized = `${topic ?? ""} ${question}`.toLowerCase();
  const actions: string[] = [];
  let answer = "I can give a local rule-based answer while the AI provider is unavailable. Confidence is medium-low because this is not a live expert diagnosis.";

  if (normalized.includes("yellow") || normalized.includes("leaf")) {
    actions.push("Check soil moisture before adding fertilizer.", "Inspect lower leaves for pests or fungal spotting.", "Compare newest growth with older leaves.");
    answer = "Yellow leaves can come from overwatering, underwatering, nitrogen deficiency, transplant stress, or disease. Start with moisture and pattern: lower older leaves suggest nutrient or age; spots or halos suggest disease.";
  } else if (normalized.includes("mildew") || normalized.includes("disease")) {
    actions.push("Improve airflow.", "Water soil, not leaves.", "Remove badly affected leaves if the plant can spare them.");
    answer = "Powdery mildew risk rises with humidity, crowding, and poor airflow. It is usually manageable early, but confirm the white powdery pattern before treating.";
  } else if (normalized.includes("seed")) {
    actions.push("Keep seed mix evenly moist.", "Add a germination check reminder.", "Harden off gradually before transplanting outdoors.");
    answer = "For seed starts, the safest workflow is steady moisture, bright light after sprouting, gentle airflow, and staged hardening off before outdoor transplant.";
  } else {
    actions.push("Check recent weather.", "Inspect the affected plant closely.", "Use a photo diagnosis if symptoms are visible.");
  }

  return { answer, confidence: "low", provider: "local", actions };
}

function localBedOptimization(input: { bed?: GardenBed; plants: PlantInstance[]; species: PlantSpecies[]; sunProfile?: SunExposureProfile }): AiBedOptimization {
  const summary = getBedPlanningSummary(input.bed, input.plants, input.species);
  const plantNames = input.plants.map((plant) => input.species.find((species) => species.id === plant.speciesId)?.commonName ?? plant.nickname);

  return {
    provider: "local",
    summary: input.bed
      ? `Local rules reviewed ${input.bed.name}. This is a safe fallback plan until OpenAI is available.`
      : "Local rules reviewed this plant group.",
    warnings: summary.warnings,
    recommendations: [
      ...summary.suggestions,
      plantNames.filter((name) => /tomato/i.test(name)).length > 2 ? "Consider only 2 tomato plants in a small raised bed unless they are strongly pruned and supported." : undefined,
      plantNames.some((name) => /cucumber/i.test(name)) ? "Keep cucumbers on a trellis edge so they do not shade short greens." : undefined,
      plantNames.some((name) => /lettuce/i.test(name)) ? "Let lettuce sit where taller crops can give afternoon relief in heat." : undefined
    ].filter((item): item is string => Boolean(item)),
    confidence: "medium"
  };
}

function extractActions(answer: string) {
  const lines = answer.split(/\n+/).map((line) => line.replace(/^[-*\d.)\s]+/, "").trim()).filter(Boolean);
  return lines.filter((line) => /check|water|remove|cover|move|avoid|add|thin|prune|inspect|wait|harvest|support|shade|improve|consider/i.test(line)).slice(0, 5);
}
