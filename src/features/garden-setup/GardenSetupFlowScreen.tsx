import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GardenCard } from "../../components/GardenCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { colors, typography } from "../../theme/tokens";

type GardenSetupFlowScreenProps = {
  onBack: () => void;
};

const setupSections = [
  "Garden type: indoor plants, outdoor garden, raised bed, containers, balcony, greenhouse",
  "Bed dimensions: shape, length, width, optional depth, soil type",
  "Orientation: compass capture or manual north marker",
  "Shade sources: fence, house, tree, shed, garage, other",
  "Sun model: morning, midday, afternoon, microclimate zones"
];

export function GardenSetupFlowScreen({ onBack }: GardenSetupFlowScreenProps) {
  return (
    <View>
      <ScreenHeader onBack={onBack} eyebrow="Garden setup" title="Map the growing space" subtitle="The setup flow is structured for GPS, compass, dimensions, and shade mapping." />
      {setupSections.map((section) => (
        <GardenCard key={section} tone="warm">
          <Text style={styles.cardTitle}>{section}</Text>
        </GardenCard>
      ))}
      <PrimaryButton label="Save setup placeholder" onPress={onBack} icon={<Ionicons name="checkmark" size={20} color={colors.white} />} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  }
});

