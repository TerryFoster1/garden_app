import { PlantStage } from "../../domain";
import { MockPlantIdentificationResult } from "../../services";

export type AddPlantPlacement = {
  id: string;
  gardenId: string;
  bedId?: string;
  zoneId?: string;
  label: string;
  locationLabel: string;
  locationType: "in-ground" | "raised-bed" | "container" | "indoor-pot" | "greenhouse";
  kind?: "outdoor" | "indoor" | "container";
};

export type AddPlantDraft = {
  photoUri?: string;
  identification?: MockPlantIdentificationResult;
  scientificName?: string;
  category?: string;
  careSummary?: string;
  lightNeeds?: string;
  waterNeeds?: string;
  feedingNeeds?: string;
  spacing?: string;
  daysToHarvest?: string;
  companionNotes?: string;
  plantName: string;
  variety: string;
  placement: AddPlantPlacement;
  stage: PlantStage;
  plantedOn: string;
  notes: string;
};
