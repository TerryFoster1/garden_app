import { GardenBed, PlantInstance, PlantSpecies } from "../domain";
import { getPlantKnowledge } from "../data/plantKnowledge";

type PlantPlanMetrics = {
  spacingInches: number;
  daysToHarvest?: number;
  harvestWindow?: string;
  edible: boolean;
};

const metricsByName: Record<string, PlantPlanMetrics> = {
  basil: { spacingInches: 10, daysToHarvest: 35, harvestWindow: "Harvest leaves once branching starts.", edible: true },
  tomato: { spacingInches: 24, daysToHarvest: 75, harvestWindow: "First ripe fruit usually 65-85 days after transplant.", edible: true },
  "cherry tomato": { spacingInches: 24, daysToHarvest: 65, harvestWindow: "Expect picking windows once fruit colors and softens.", edible: true },
  "red pepper": { spacingInches: 18, daysToHarvest: 75, harvestWindow: "Green fruit comes earlier; red fruit needs extra ripening time.", edible: true },
  "yellow pepper": { spacingInches: 18, daysToHarvest: 75, harvestWindow: "Harvest once glossy yellow and full-sized.", edible: true },
  jalapeno: { spacingInches: 16, daysToHarvest: 70, harvestWindow: "Pick green or let fruit redden for more heat.", edible: true },
  cucumber: { spacingInches: 18, daysToHarvest: 55, harvestWindow: "Harvest often while fruit is tender.", edible: true },
  lettuce: { spacingInches: 8, daysToHarvest: 35, harvestWindow: "Cut outer leaves as soon as plants size up.", edible: true },
  cilantro: { spacingInches: 5, daysToHarvest: 30, harvestWindow: "Harvest leaves before plants bolt.", edible: true },
  "green onion": { spacingInches: 3, daysToHarvest: 55, harvestWindow: "Pull young stems any time after pencil thickness.", edible: true },
  "brussels sprouts": { spacingInches: 24, daysToHarvest: 95, harvestWindow: "Harvest firm sprouts from the lower stalk upward.", edible: true },
  garlic: { spacingInches: 6, daysToHarvest: 250, harvestWindow: "Harvest when lower leaves brown and tops begin drying.", edible: true },
  onion: { spacingInches: 5, daysToHarvest: 100, harvestWindow: "Harvest when tops fall and necks dry.", edible: true },
  shallot: { spacingInches: 6, daysToHarvest: 100, harvestWindow: "Harvest when tops yellow and collapse.", edible: true },
  asparagus: { spacingInches: 18, daysToHarvest: 730, harvestWindow: "Harvest lightly after establishment; let ferns recharge crowns.", edible: true },
  chives: { spacingInches: 10, daysToHarvest: 60, harvestWindow: "Snip leaves once clumps are established.", edible: true },
  strawberry: { spacingInches: 15, daysToHarvest: 45, harvestWindow: "Pick fully red berries often.", edible: true },
  rosemary: { spacingInches: 24, harvestWindow: "Harvest sprigs lightly during active growth.", edible: true },
  thyme: { spacingInches: 10, harvestWindow: "Clip tender stems as needed.", edible: true },
  parsley: { spacingInches: 8, daysToHarvest: 70, harvestWindow: "Cut outer stems from the base.", edible: true },
  hibiscus: { spacingInches: 24, edible: false },
  begonia: { spacingInches: 12, edible: false },
  lily: { spacingInches: 12, edible: false },
  "snake plant": { spacingInches: 8, edible: false },
  "parlor palm": { spacingInches: 18, edible: false },
  haworthia: { spacingInches: 5, edible: false },
  echeveria: { spacingInches: 6, edible: false },
  palm: { spacingInches: 18, edible: false }
};

export function getPlantPlanMetrics(species?: PlantSpecies, plantName?: string): PlantPlanMetrics {
  const knowledge = getPlantKnowledge(species, plantName);
  const name = knowledge.commonName.toLowerCase();
  const direct = metricsByName[name];
  if (direct) {
    return direct;
  }

  const partialKey = Object.keys(metricsByName).find((key) => name.includes(key) || key.includes(name));
  return partialKey ? metricsByName[partialKey] : { spacingInches: 12, edible: false };
}

export function getDaysUntilHarvest(plant: PlantInstance, species?: PlantSpecies) {
  const metrics = getPlantPlanMetrics(species, plant.nickname);
  if (!metrics.daysToHarvest || !plant.plantedOn) {
    return undefined;
  }

  const plantedAt = new Date(plant.plantedOn).getTime();
  if (Number.isNaN(plantedAt)) {
    return undefined;
  }

  const harvestAt = plantedAt + metrics.daysToHarvest * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((harvestAt - Date.now()) / (24 * 60 * 60 * 1000)));
}

export function getBedPlanningSummary(bed: GardenBed | undefined, plants: PlantInstance[], species: PlantSpecies[]) {
  if (!bed) {
    return {
      capacity: plants.length,
      used: plants.length,
      warnings: plants.length > 8 ? ["This indoor/container group may be getting hard to inspect quickly."] : [],
      suggestions: ["Keep groups small enough for quick watering and photo updates."]
    };
  }

  const areaSquareInches = bed.lengthFeet * 12 * bed.widthFeet * 12;
  const usedSquareInches = plants.reduce((total, plant) => {
    const plantSpecies = species.find((item) => item.id === plant.speciesId);
    const spacing = getPlantPlanMetrics(plantSpecies, plant.nickname).spacingInches;
    return total + spacing * spacing;
  }, 0);

  const usedRatio = areaSquareInches > 0 ? usedSquareInches / areaSquareInches : 0;
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (usedRatio > 0.85) {
    warnings.push("This bed is likely overcrowded. Airflow and harvest access may suffer.");
  } else if (usedRatio > 0.65) {
    warnings.push("Spacing is getting tight. Add compact companions instead of another large plant.");
  }

  if (plants.some((plant) => plant.nickname.toLowerCase().includes("tomato")) && plants.some((plant) => plant.nickname.toLowerCase().includes("basil"))) {
    suggestions.push("Basil is a useful tomato companion here.");
  }

  if (plants.some((plant) => plant.nickname.toLowerCase().includes("cucumber"))) {
    suggestions.push("Cucumbers need trellis support and open airflow.");
  }

  if (plants.some((plant) => plant.nickname.toLowerCase().includes("lettuce"))) {
    suggestions.push("Lettuce can benefit from partial shade under taller crops in heat.");
  }

  return {
    capacity: Math.max(1, Math.floor(areaSquareInches / (18 * 18))),
    used: plants.length,
    warnings,
    suggestions: suggestions.length ? suggestions : ["This layout looks workable in the local spacing rules."]
  };
}
