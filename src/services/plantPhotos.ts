import { GardenHomeModel, PlantInstance, PlantPhoto } from "../domain";

export function getPlantPhotos(model: GardenHomeModel, plantId: string): PlantPhoto[] {
  return (model.plantPhotos ?? [])
    .filter((photo) => photo.plantInstanceId === plantId)
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
}

export function getLatestPlantPhoto(model: GardenHomeModel, plant: PlantInstance): PlantPhoto | undefined {
  const photos = getPlantPhotos(model, plant.id);

  if (plant.currentProfilePhotoId) {
    return photos.find((photo) => photo.id === plant.currentProfilePhotoId) ?? photos[0];
  }

  return photos[0];
}
