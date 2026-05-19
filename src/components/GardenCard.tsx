import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { colors, radii, spacing } from "../theme/tokens";

type GardenCardProps = {
  children: ReactNode;
  tone?: "surface" | "warm" | "sky" | "alert";
};

export function GardenCard({ children, tone = "surface" }: GardenCardProps) {
  return <View style={[styles.card, styles[tone]]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    marginBottom: spacing.md
  },
  surface: {
    backgroundColor: colors.surface
  },
  warm: {
    backgroundColor: colors.surfaceWarm
  },
  sky: {
    backgroundColor: colors.sky
  },
  alert: {
    backgroundColor: "#fff0e9",
    borderColor: "#efc3b6"
  }
});

