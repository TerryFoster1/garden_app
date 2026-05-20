import { StyleSheet, Text, View } from "react-native";

import { GardenCard } from "../../components/GardenCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { colors, typography } from "../../theme/tokens";

type SettingsScreenProps = {
  onBack: () => void;
};

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  return (
    <View>
      <ScreenHeader onBack={onBack} eyebrow="Profile" title="Settings" subtitle="Profile, location, notification preferences, weather providers, and future AI/provider settings." />
      {["Location: editable in Profile", "Notifications: task and weather categories", "Weather providers: public forecast and personal station", "Privacy: photos, observations, garden map"].map((item) => (
        <GardenCard key={item}>
          <Text style={styles.cardTitle}>{item}</Text>
        </GardenCard>
      ))}
      <PrimaryButton label="Done" onPress={onBack} />
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
