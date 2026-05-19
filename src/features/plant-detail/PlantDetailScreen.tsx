import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GardenCard } from "../../components/GardenCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { PlantInstance } from "../../domain";
import { colors, typography } from "../../theme/tokens";

type PlantDetailScreenProps = {
  plant: PlantInstance;
  onBack: () => void;
};

export function PlantDetailScreen({ plant, onBack }: PlantDetailScreenProps) {
  return (
    <View>
      <ScreenHeader onBack={onBack} eyebrow="Plant detail" title={plant.nickname} subtitle="Care page placeholder for species knowledge plus personalized bed, weather, photos, and observations." />
      <GardenCard tone="warm">
        <Text style={styles.cardTitle}>{plant.locationLabel}</Text>
        <Text style={styles.cardText}>{plant.notes}</Text>
        <Text style={styles.meta}>{plant.healthStatus}</Text>
      </GardenCard>
      <GardenCard>
        <Text style={styles.cardTitle}>Growth and health timeline</Text>
        <Text style={styles.cardText}>Future photo logs, health scans, watering events, harvest notes, and user observations will live here.</Text>
      </GardenCard>
      <PrimaryButton label="Scan this plant" onPress={onBack} tone="sun" icon={<Ionicons name="camera" size={20} color={colors.leafDeep} />} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  cardText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20
  },
  meta: {
    color: colors.leaf,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  }
});

