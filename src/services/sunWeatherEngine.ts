import { GardenBed, Obstruction, SunExposureProfile } from "../domain";

export type SunWeatherEngineInput = {
  latitude: number;
  longitude: number;
  dateTime: string;
  bed: GardenBed;
  obstructions: Obstruction[];
};

export type PlacementWarning = {
  title: string;
  detail: string;
  severity: "info" | "watch" | "warning";
};

export type SunWeatherEngineResult = {
  exposure: SunExposureProfile;
  microclimateZones: string[];
  placementWarnings: PlacementWarning[];
};

export function estimateSunExposure(input: SunWeatherEngineInput): SunWeatherEngineResult {
  const hasWesternFence = input.obstructions.some((obstruction) => obstruction.directionFromBed.includes("west"));
  const afternoon = hasWesternFence ? "part-sun" : "full-sun";

  return {
    exposure: {
      id: `sun-estimate-${input.bed.id}`,
      bedId: input.bed.id,
      morning: "full-sun",
      midday: "full-sun",
      afternoon,
      estimatedDailySunHours: hasWesternFence ? 6 : 7.5,
      confidence: "low"
    },
    microclimateZones: ["front edge dries first", "west edge may cool earlier", "trellis row casts seasonal shade"],
    placementWarnings: [
      {
        title: "Trellis shade check",
        detail: "Place tall tomatoes and cucumbers so they do not shade lettuce or basil during afternoon sun.",
        severity: "watch"
      }
    ]
  };
}

