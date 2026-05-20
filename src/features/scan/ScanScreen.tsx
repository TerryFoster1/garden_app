import { Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { GardenCard } from "../../components/GardenCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { colors, spacing, typography } from "../../theme/tokens";

type ScanScreenProps = {
  selectedPhotoUri?: string | null;
  onPhotoSelected: (photoUri: string) => void;
  onAddPlant: () => void;
};

const scanActions = [
  "Identify new plant",
  "Diagnose sick plant",
  "Identify pest",
  "Identify weed",
  "Track growth photo",
  "Search by photo"
];

export function ScanScreen({ selectedPhotoUri, onPhotoSelected, onAddPlant }: ScanScreenProps) {
  async function pickImage(source: "camera" | "library") {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });

    if (!result.canceled && result.assets[0]?.uri) {
      onPhotoSelected(result.assets[0].uri);
      onAddPlant();
    }
  }

  return (
    <View>
      <ScreenHeader
        eyebrow="Camera first"
        title="Scan what you see"
        subtitle="The camera is the fastest path for PlantNet identification, diagnosis photos, growth logs, and safe care suggestions you confirm."
      />

      <View style={styles.cameraCircle}>
        {selectedPhotoUri ? (
          <Image source={{ uri: selectedPhotoUri }} style={styles.previewImage} />
        ) : (
          <>
            <Ionicons name="camera" size={72} color={colors.leafDeep} />
            <Text style={styles.cameraText}>Ready to scan</Text>
          </>
        )}
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Take photo" onPress={() => pickImage("camera")} tone="sun" icon={<Ionicons name="camera" size={22} color={colors.leafDeep} />} style={styles.actionButton} />
        <PrimaryButton label="Pick photo" onPress={() => pickImage("library")} icon={<Ionicons name="images-outline" size={20} color={colors.white} />} style={styles.actionButton} />
      </View>
      <PrimaryButton label="Add manually" onPress={onAddPlant} tone="quiet" icon={<Ionicons name="create-outline" size={20} color={colors.leafDeep} />} />

      <View style={styles.grid}>
        {scanActions.map((action) => (
          <GardenCard key={action} tone="surface">
            <Text style={styles.actionText}>{action}</Text>
          </GardenCard>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraCircle: {
    minHeight: 260,
    borderRadius: 36,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border
  },
  cameraText: {
    marginTop: spacing.md,
    color: colors.soil,
    fontSize: typography.body,
    fontWeight: "800"
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 36
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  actionButton: {
    flex: 1
  },
  grid: {
    marginTop: spacing.lg
  },
  actionText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  }
});
