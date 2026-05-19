import { AiCareRecommendation } from "./careRulesEngine";

export type AiRecommendationProvider = {
  suggestCareFromObservation(input: { note?: string; photoUri?: string; plantInstanceId?: string }): Promise<AiCareRecommendation[]>;
};

export const stubAiRecommendationProvider: AiRecommendationProvider = {
  async suggestCareFromObservation() {
    return [];
  }
};

