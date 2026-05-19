import { PlantHealthScan, PlantIdentification, PlantSpecies } from "../domain";

export type MockPlantIdentificationResult = PlantIdentification & {
  possiblePlantName: string;
  confidenceLabel: "Likely match" | "Possible match";
  careSummary: string;
  lightNeeds: string;
  wateringNeeds: PlantSpecies["waterNeeds"];
  feedingNotes: string;
  warnings: string[];
};

export type PlantIdentificationProvider = {
  identifyPlant(photoUri: string): Promise<MockPlantIdentificationResult>;
  diagnosePlant(photoUri: string): Promise<PlantHealthScan>;
  identifyPestOrWeed(photoUri: string): Promise<PlantHealthScan>;
};

export const stubPlantIdentificationProvider: PlantIdentificationProvider = {
  async identifyPlant(photoUri) {
    const likelyTomato = photoUri.length % 2 === 0;

    return {
      id: `mock-identification-${Date.now()}`,
      photoId: `photo-${Date.now()}`,
      suggestedSpeciesId: likelyTomato ? "species-cherry-tomato" : "species-basil",
      confidence: likelyTomato ? 0.78 : 0.64,
      confidenceLabel: likelyTomato ? "Likely match" : "Possible match",
      provider: "mock-plant-id",
      userConfirmed: false,
      possiblePlantName: likelyTomato ? "Cherry Tomato" : "Basil",
      careSummary: likelyTomato
        ? "A warm-season fruiting plant that usually needs full sun, steady moisture, and support as it grows."
        : "A tender herb that likes bright light, even moisture, and regular pinching once established.",
      lightNeeds: likelyTomato ? "Full sun preferred. Watch nearby shorter plants for trellis shade." : "Full sun to part sun. Protect from cold nights.",
      wateringNeeds: likelyTomato ? "high" : "moderate",
      feedingNotes: likelyTomato ? "Heavy feeder; schedule a feeding reminder after establishment." : "Light feeder; avoid overfertilizing.",
      warnings: [
        "Mock result only. Confirm before adding.",
        likelyTomato ? "Support may be needed soon." : "Cold nights can stress tender basil."
      ]
    };
  },
  async diagnosePlant() {
    throw new Error("Plant health diagnosis is stubbed for the foundation build.");
  },
  async identifyPestOrWeed() {
    throw new Error("Pest and weed identification is stubbed for the foundation build.");
  }
};
