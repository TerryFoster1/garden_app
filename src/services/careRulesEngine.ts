import { CareTask, PlantInstance, PlantSpecies, WeatherAlert, WeatherSnapshot } from "../domain";

export type AiCareRecommendation = {
  title: string;
  taskType: CareTask["type"];
  plantInstanceId?: string;
  reason: string;
  confidence: number;
};

export type RuleValidationResult = {
  allowed: boolean;
  requiresUserConfirmation: boolean;
  reasons: string[];
  safeTask?: CareTask;
};

export function validateCareRecommendation(
  recommendation: AiCareRecommendation,
  context: {
    plant?: PlantInstance;
    species?: PlantSpecies;
    weather: WeatherSnapshot;
    alerts: WeatherAlert[];
  }
): RuleValidationResult {
  const reasons: string[] = [];

  if (recommendation.taskType === "watering" && context.weather.rainfallMm24h >= 5) {
    return {
      allowed: false,
      requiresUserConfirmation: false,
      reasons: ["Skip watering after meaningful rain."]
    };
  }

  if (recommendation.taskType === "watering" && context.weather.temperatureC >= 28) {
    reasons.push("Increase watering checks during heat or drought.");
  }

  if (recommendation.taskType === "frost-protection" && context.weather.frostRisk !== "none") {
    reasons.push("Tender plants need frost protection confirmation before scheduling.");
  }

  if (recommendation.taskType === "wind-protection" && context.weather.windKph >= 30) {
    reasons.push("Wind protection is appropriate for tender transplants and containers.");
  }

  if (recommendation.taskType === "heavy-rain-protection" && context.alerts.some((alert) => alert.type === "heavy-rain")) {
    reasons.push("Heavy rain alert can justify moving containers or pausing fertilizing.");
  }

  if (recommendation.taskType === "pest-check") {
    reasons.push("Pest checks are safe observational tasks.");
  }

  return {
    allowed: true,
    requiresUserConfirmation: recommendation.confidence < 0.85 || recommendation.taskType.includes("protection"),
    reasons: reasons.length > 0 ? reasons : ["Recommendation passed deterministic care rules."],
    safeTask: {
      id: `task-ai-${Date.now()}`,
      plantInstanceId: recommendation.plantInstanceId,
      type: recommendation.taskType,
      title: recommendation.title,
      dueAt: new Date().toISOString(),
      priority: recommendation.taskType.includes("protection") ? "high" : "normal",
      status: recommendation.confidence < 0.85 ? "needs-confirmation" : "scheduled",
      reason: recommendation.reason
    }
  };
}

