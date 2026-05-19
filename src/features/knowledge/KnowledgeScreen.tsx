import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { GardenCard } from "../../components/GardenCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { PlantSpecies } from "../../domain";
import { colors, spacing, typography } from "../../theme/tokens";

type KnowledgeScreenProps = {
  species: PlantSpecies[];
  onOpenPlant: () => void;
};

export function KnowledgeScreen({ species, onOpenPlant }: KnowledgeScreenProps) {
  return (
    <View>
      <ScreenHeader
        eyebrow="Plant knowledge"
        title="Search plants"
        subtitle="Search by name now. Photo search and care-page enrichment are stubbed for provider integration."
      />

      <TextInput placeholder="Search tomato, basil, mildew, aphids..." placeholderTextColor={colors.textMuted} style={styles.search} />

      {species.map((item) => (
        <TouchableOpacity key={item.id} accessibilityRole="button" onPress={onOpenPlant}>
          <GardenCard>
            <Text style={styles.cardTitle}>{item.commonName}</Text>
            <Text style={styles.cardText}>{item.careSummary}</Text>
            <Text style={styles.meta}>{item.preferredSun.join(", ")} - {item.waterNeeds} water</Text>
          </GardenCard>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: typography.body,
    marginBottom: spacing.lg
  },
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

