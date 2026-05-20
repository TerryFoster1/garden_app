import { PlantIndexRecord, plantIndex } from "../data/plantIndex";

export function searchPlants(query: string, limit = 8): PlantIndexRecord[] {
  const normalizedQuery = normalize(query);
  if (normalizedQuery.length < 2) {
    return [];
  }

  return plantIndex
    .map((plant) => ({ plant, score: scorePlant(plant, normalizedQuery) }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.plant.commonName.localeCompare(b.plant.commonName))
    .slice(0, limit)
    .map((result) => result.plant);
}

function scorePlant(plant: PlantIndexRecord, query: string) {
  const names = [plant.commonName, plant.scientificName, plant.category, ...plant.alternateNames].filter(Boolean).map((value) => normalize(value as string));
  let bestScore = 0;

  for (const name of names) {
    if (name === query) {
      bestScore = Math.max(bestScore, 120);
    } else if (name.startsWith(query)) {
      bestScore = Math.max(bestScore, 95);
    } else if (name.includes(query)) {
      bestScore = Math.max(bestScore, 75);
    } else if (isSubsequence(query, name)) {
      bestScore = Math.max(bestScore, 42);
    }
  }

  const joinedIssues = normalize([plant.lightNeeds, plant.soilNotes, plant.commonIssues?.join(" ")].filter(Boolean).join(" "));
  if (joinedIssues.includes(query)) {
    bestScore = Math.max(bestScore, 18);
  }

  return bestScore;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isSubsequence(query: string, target: string) {
  let queryIndex = 0;
  for (const char of target) {
    if (char === query[queryIndex]) {
      queryIndex += 1;
      if (queryIndex === query.length) {
        return true;
      }
    }
  }
  return false;
}
