import { StyleSheet, Text, View } from "react-native";

import { GardenCard } from "../../components/GardenCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ScreenHeader } from "../../components/ScreenHeader";
import { WeatherAlert } from "../../domain";
import { colors, typography } from "../../theme/tokens";

type WeatherAlertsScreenProps = {
  alerts: WeatherAlert[];
  onBack: () => void;
};

export function WeatherAlertsScreen({ alerts, onBack }: WeatherAlertsScreenProps) {
  return (
    <View>
      <ScreenHeader onBack={onBack} eyebrow="Weather" title="Protection alerts" subtitle="Weather alerts will become phone notifications for frost, wind, storms, heat, humidity, UV, and heavy rain." />
      {alerts.map((alert) => (
        <GardenCard key={alert.id} tone="alert">
          <Text style={styles.cardTitle}>{alert.title}</Text>
          <Text style={styles.cardText}>{alert.summary}</Text>
          <Text style={styles.meta}>{alert.severity}</Text>
        </GardenCard>
      ))}
      <PrimaryButton label="Back to today" onPress={onBack} />
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
    color: colors.coral,
    fontSize: typography.caption,
    fontWeight: "900",
    textTransform: "uppercase"
  }
});

