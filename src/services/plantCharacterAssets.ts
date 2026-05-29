import { ImageSourcePropType } from "react-native";

import { PlantInstance, PlantSpecies } from "../domain";

type CharacterKey =
  | "tomato"
  | "basil"
  | "snake-plant"
  | "pepper"
  | "fern"
  | "succulent"
  | "marigold"
  | "herb"
  | "seedling"
  | "unknown-plant";

const characterAssets: Record<CharacterKey, ImageSourcePropType> = {
  tomato: require("../../assets/plants/characters/tomato.png"),
  basil: require("../../assets/plants/characters/basil.png"),
  "snake-plant": require("../../assets/plants/characters/snake-plant.png"),
  pepper: require("../../assets/plants/characters/pepper.png"),
  fern: require("../../assets/plants/characters/fern.png"),
  succulent: require("../../assets/plants/characters/succulent.png"),
  marigold: require("../../assets/plants/characters/marigold.png"),
  herb: require("../../assets/plants/characters/herb.png"),
  seedling: require("../../assets/plants/characters/seedling.png"),
  "unknown-plant": require("../../assets/plants/characters/unknown-plant.png")
};

export function getPlantCharacterAsset(plant: PlantInstance, species?: PlantSpecies): ImageSourcePropType {
  return characterAssets[getPlantCharacterKey(plant, species)];
}

export function getPlantCharacterCaption(plant: PlantInstance) {
  if (plant.stage === "seed" || plant.stage === "seedling") {
    return "Add my first photo";
  }
  return "Camera shy";
}

function getPlantCharacterKey(plant: PlantInstance, species?: PlantSpecies): CharacterKey {
  const haystack = `${plant.nickname} ${species?.commonName ?? ""} ${species?.scientificName ?? ""} ${species?.family ?? ""} ${plant.stage ?? ""}`.toLowerCase();

  if (plant.stage === "seed" || plant.stage === "seedling" || haystack.includes("seedling")) {
    return "seedling";
  }
  if (haystack.includes("tomato") || haystack.includes("solanum lycopersicum")) {
    return "tomato";
  }
  if (haystack.includes("basil") || haystack.includes("ocimum")) {
    return "basil";
  }
  if (haystack.includes("snake") || haystack.includes("sansevieria") || haystack.includes("dracaena trifasciata")) {
    return "snake-plant";
  }
  if (haystack.includes("pepper") || haystack.includes("capsicum") || haystack.includes("jalape")) {
    return "pepper";
  }
  if (haystack.includes("fern")) {
    return "fern";
  }
  if (haystack.includes("succulent") || haystack.includes("echeveria") || haystack.includes("haworthia") || haystack.includes("cactus")) {
    return "succulent";
  }
  if (haystack.includes("marigold") || haystack.includes("tagetes")) {
    return "marigold";
  }
  if (haystack.includes("herb") || haystack.includes("parsley") || haystack.includes("cilantro") || haystack.includes("thyme") || haystack.includes("rosemary") || haystack.includes("chive") || haystack.includes("oregano") || haystack.includes("mint")) {
    return "herb";
  }

  return "unknown-plant";
}
