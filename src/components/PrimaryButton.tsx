import { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

import { colors, radii, spacing, typography } from "../theme/tokens";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  tone?: "primary" | "sun" | "quiet";
  disabled?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ label, onPress, icon, tone = "primary", disabled = false, style }: PrimaryButtonProps) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} style={[styles.button, styles[tone], disabled && styles.disabled, style]} onPress={onPress}>
      {icon}
      <Text style={[styles.label, tone !== "primary" && styles.darkLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  primary: {
    backgroundColor: colors.leafDeep
  },
  sun: {
    backgroundColor: colors.sun
  },
  quiet: {
    backgroundColor: colors.surfaceWarm
  },
  disabled: {
    opacity: 0.52
  },
  label: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: "800"
  },
  darkLabel: {
    color: colors.leafDeep
  }
});
