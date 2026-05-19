import AsyncStorage from "@react-native-async-storage/async-storage";

import { GardenHomeModel } from "../domain";

const GARDEN_MODEL_KEY = "garden-app:garden-model:v1";

export async function loadPersistedGardenModel(): Promise<GardenHomeModel | null> {
  const raw = await AsyncStorage.getItem(GARDEN_MODEL_KEY);
  return raw ? (JSON.parse(raw) as GardenHomeModel) : null;
}

export async function persistGardenModel(model: GardenHomeModel): Promise<void> {
  await AsyncStorage.setItem(GARDEN_MODEL_KEY, JSON.stringify(model));
}

export async function clearPersistedGardenModel(): Promise<void> {
  await AsyncStorage.removeItem(GARDEN_MODEL_KEY);
}

