import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "../theme/tokens";

type StatPillProps = {
  label: string;
  value: string;
};

export function StatPill({ label, value }: StatPillProps) {
  return (
    <View style={styles.pill}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    minHeight: 72,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: "center"
  },
  value: {
    color: colors.leafDeep,
    fontSize: typography.section,
    fontWeight: "900"
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700"
  }
});

